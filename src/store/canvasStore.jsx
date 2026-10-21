import { createContext, useContext, useEffect, useReducer, useRef } from 'react'
import { askAgent } from '../lib/agentEngine'
import { createChat, createId, createMessage } from '../lib/chats'
import { forStorage } from '../lib/attachments'
import { detectFlow, flowOfPlan } from '../lib/flows'
import { applySuggestions, buildCustomNode, buildLookupNode, createPlan, removeNodeTree, specContent, toggleOption, visibleNodes } from '../lib/trip/planModel'

const STORAGE_KEY = 'innernet:canvas:v1'

const CanvasContext = createContext(null)

// Research can't survive a reload in the prototype, so in-flight chats come back idle.
// A plan being drafted comes back idle too, and nodes the agent was still
// thinking about are simply ready.
const restorePlan = (plan) => ({
  ...plan,
  activity: null,
  ...(plan.status === 'drafting' && { status: 'idle' }),
  nodes: plan.nodes.map((n) => (n.status === 'thinking' ? { ...n, status: 'ready' } : n)),
})

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!saved) return { chats: [], edges: [], plans: [] }
    return {
      chats: saved.chats.map((chat) => (chat.status === 'working' ? { ...chat, status: 'idle', activity: null } : chat)),
      edges: saved.edges ?? [],
      plans: (saved.plans ?? []).map(restorePlan),
    }
  } catch {
    return { chats: [], edges: [], plans: [] }
  }
}

// Large files only have a session preview, so drop their URL before saving.
const toStorage = (chat) => ({
  ...chat,
  messages: chat.messages.map((m) => (m.attachments?.length ? { ...m, attachments: m.attachments.map(forStorage) } : m)),
})

const mapChat = (state, id, fn) => ({
  ...state,
  chats: state.chats.map((chat) => (chat.id === id ? fn(chat) : chat)),
})

function reducer(state, action) {
  switch (action.type) {
    case 'chat/create':
      return { ...state, chats: [...state.chats, action.chat], composer: null }
    case 'chat/update':
      return mapChat(state, action.id, (chat) => ({ ...chat, ...action.patch }))
    case 'chat/message':
      return mapChat(state, action.id, (chat) => ({
        ...chat,
        ...action.patch,
        messages: [...chat.messages, action.message],
        updatedAt: action.message.timestamp,
      }))
    case 'chat/layout':
      // Position/size updates from dragging and resizing on the canvas.
      return {
        ...state,
        chats: state.chats.map((chat) => (action.layout[chat.id] ? { ...chat, ...action.layout[chat.id] } : chat)),
      }
    case 'chat/delete': {
      const ids = new Set(action.ids)
      return {
        ...state,
        chats: state.chats.filter((chat) => !ids.has(chat.id)),
        edges: state.edges.filter((edge) => !ids.has(edge.source) && !ids.has(edge.target)),
      }
    }
    case 'plan/create':
      return { ...state, plans: [...state.plans, action.plan], activePlanId: action.plan.id, composer: null }
    case 'plan/update':
      return { ...state, plans: state.plans.map((plan) => (plan.id === action.id ? { ...plan, ...action.patch } : plan)) }
    case 'plan/toggle':
      return {
        ...state,
        activePlanId: action.planId,
        plans: state.plans.map((plan) => (plan.id === action.planId ? toggleOption(plan, action.nodeId, action.optionId) : plan)),
      }
    case 'plan/delete':
      return { ...state, plans: state.plans.filter((plan) => plan.id !== action.id), docPlanId: state.docPlanId === action.id ? null : state.docPlanId }
    // Moves from dragging, as offsets from where the layout puts things: a node's
    // own offset, or (no nodeId) the whole trip's. Batched, since a drag emits many.
    case 'plan/move': {
      let plans = state.plans
      action.moves.forEach(({ planId, nodeId, offset }) => {
        plans = plans.map((plan) => {
          if (plan.id !== planId) return plan
          if (!nodeId) return { ...plan, offset }
          return { ...plan, nodes: plan.nodes.map((n) => (n.id === nodeId ? { ...n, offset } : n)) }
        })
      })
      return { ...state, plans }
    }
    // The agent has finished thinking about a node: it shows its question now.
    case 'node/ready':
      return {
        ...state,
        plans: state.plans.map((plan) =>
          action.id.startsWith(`${plan.id}/`)
            ? { ...plan, nodes: plan.nodes.map((n) => (n.id === action.id ? { ...n, status: 'ready', ...(action.note && { note: action.note }) } : n)) }
            : plan,
        ),
      }
    // Take the agent's suggestions on a node (just the first, if it's pick-one).
    case 'plan/pickMany':
      return {
        ...state,
        activePlanId: action.planId,
        plans: state.plans.map((plan) => {
          if (plan.id !== action.planId) return plan
          const node = plan.nodes.find((n) => n.id === action.nodeId)
          const ids = specContent(node.spec).multi ? action.optionIds : action.optionIds.slice(0, 1)
          return ids.reduce((next, optionId) => (next.nodes.find((n) => n.id === node.id).selected.includes(optionId) ? next : toggleOption(next, node.id, optionId)), plan)
        }),
      }
    // A question the user typed on a node, as a new node under it.
    case 'plan/addNode':
      return {
        ...state,
        activePlanId: action.planId,
        plans: state.plans.map((plan) => (plan.id === action.planId ? { ...plan, nodes: [...plan.nodes, action.node], updatedAt: new Date().toISOString() } : plan)),
      }
    // Replace a whole plan (draft-first fills in the tree before drafting).
    case 'plan/replace':
      return { ...state, plans: state.plans.map((plan) => (plan.id === action.plan.id ? action.plan : plan)) }
    // Swap one part of the drafted document for another (or put the original back
    // when `alt` is null). The document is rebuilt from the plan with its swaps.
    case 'plan/swap':
      return {
        ...state,
        plans: state.plans.map((plan) => {
          if (plan.id !== action.planId) return plan
          const swaps = { ...(plan.swaps ?? {}) }
          if (action.alt) swaps[action.key] = action.alt
          else delete swaps[action.key]
          const next = { ...plan, swaps }
          return { ...next, itinerary: next.itinerary ? flowOfPlan(next).build(next) : null, updatedAt: new Date().toISOString() }
        }),
      }
    // A looked-up phrase the user decided to keep stops being temporary.
    case 'plan/keepNode':
      return {
        ...state,
        plans: state.plans.map((plan) =>
          plan.id === action.planId ? { ...plan, nodes: plan.nodes.map((n) => (n.id === action.nodeId ? { ...n, spec: { ...n.spec, temp: false } } : n)) } : plan,
        ),
      }
    case 'plan/removeNode':
      return { ...state, plans: state.plans.map((plan) => (plan.id === action.planId ? removeNodeTree(plan, action.nodeId) : plan)) }
    case 'plan/collapse':
      return {
        ...state,
        activePlanId: action.id,
        plans: state.plans.map((plan) => (plan.id === action.id ? { ...plan, collapsed: action.collapsed } : plan)),
      }
    // The itinerary document is open in a reading panel (one at a time).
    case 'doc/open':
      return { ...state, docPlanId: action.id, activePlanId: action.id }
    case 'doc/close':
      return state.docPlanId ? { ...state, docPlanId: null } : state
    case 'plan/focus':
      return state.activePlanId === action.id ? state : { ...state, activePlanId: action.id }
    case 'edges/set':
      return { ...state, edges: action.edges }
    case 'composer/open':
      return { ...state, composer: { position: action.position, prompt: action.prompt ?? '' } }
    case 'composer/close':
      return { ...state, composer: null }
    default:
      return state
  }
}

export function CanvasProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({ ...load(), composer: null, activePlanId: null, docPlanId: null }))
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Debounced so dragging doesn't write to storage on every frame.
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats: state.chats.map(toStorage), edges: state.edges, plans: state.plans }))
      } catch {
        // Persistence is best-effort in the prototype.
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [state.chats, state.edges, state.plans])

  const sendMessage = async (chatId, text, attachments = []) => {
    const prompt = text.trim()
    if (!prompt && !attachments.length) return
    const history = stateRef.current.chats.find((chat) => chat.id === chatId)?.messages ?? []

    dispatch({
      type: 'chat/message',
      id: chatId,
      message: createMessage('user', prompt, attachments),
      patch: { status: 'working', activity: { status: 'thinking', message: 'Thinking…' } },
    })

    try {
      const reply = await askAgent({
        chatId,
        prompt,
        attachments,
        history,
        onActivity: (activity) => dispatch({ type: 'chat/update', id: chatId, patch: { activity } }),
      })
      dispatch({
        type: 'chat/message',
        id: chatId,
        message: createMessage('agent', reply.content),
        patch: { status: 'idle', activity: null },
      })
    } catch {
      dispatch({ type: 'chat/update', id: chatId, patch: { status: 'error', activity: null } })
    }
  }

  // Each node the agent is thinking about resolves after its thinking time. (The
  // trip node itself is resolved by `think`, below, which narrates what it's doing.)
  const waiting = useRef(new Set())
  useEffect(() => {
    state.plans.forEach((plan) =>
      visibleNodes(plan).forEach((node) => {
        if (node.status !== 'thinking' || node.parentId === null || waiting.current.has(node.id)) return
        waiting.current.add(node.id)
        setTimeout(() => dispatch({ type: 'node/ready', id: node.id }), node.thinkMs ?? 900)
      }),
    )
  }, [state.plans])

  // The trip node thinks first, out loud, then says what it found.
  const think = async (planId, prompt, flow) => {
    const root = `${planId}/root`
    const update = (patch) => dispatch({ type: 'plan/update', id: planId, patch })
    update({ activity: { status: 'thinking', message: 'Thinking…' } })
    try {
      const { note } = await flow.think({ prompt, onActivity: (activity) => update({ activity }) })
      dispatch({ type: 'node/ready', id: root, note })
    } catch {
      dispatch({ type: 'node/ready', id: root })
    }
    update({ activity: null })
  }

  // The agent drafts the whole itinerary from what's chosen on the plan.
  const draft = async (planId, request, latest) => {
    const plan = latest ?? stateRef.current.plans.find((p) => p.id === planId)
    if (!plan || plan.status === 'drafting') return
    const update = (patch) => dispatch({ type: 'plan/update', id: planId, patch })
    update({ status: 'drafting', activity: { status: 'thinking', message: 'Thinking…' } })
    try {
      const itinerary = await flowOfPlan(plan).draft({ plan, request, onActivity: (activity) => update({ activity }) })
      update({ status: 'idle', activity: null, itinerary, updatedAt: new Date().toISOString() })
      // The finished itinerary opens as a document.
      dispatch({ type: 'doc/open', id: planId })
      return true
    } catch {
      update({ status: 'error', activity: null })
      return false
    }
  }

  const actions = {
    startChat: ({ prompt, attachments = [], position }) => {
      // A prompt one of the flows recognises (a trip to Japan, a fitness plan…)
      // becomes a branching plan, not a chat.
      const flowId = attachments.length ? null : detectFlow(prompt)
      if (flowId) {
        const plan = createPlan({ prompt: prompt.trim(), position, flow: flowId })
        dispatch({ type: 'plan/create', plan })
        think(plan.id, plan.prompt, flowOfPlan(plan))
        return plan.id
      }
      const chat = createChat({ prompt, attachments, position, index: stateRef.current.chats.length })
      dispatch({ type: 'chat/create', chat })
      sendMessage(chat.id, prompt, attachments)
      return chat.id
    },
    sendMessage,
    // Add a node to any ready node from a question the user typed.
    addQuestion: (planId, parentId, prompt) => {
      const plan = stateRef.current.plans.find((p) => p.id === planId)
      const text = prompt.trim()
      if (!plan || !text || !plan.nodes.some((n) => n.id === parentId && n.status !== 'thinking')) return
      dispatch({ type: 'plan/addNode', planId, node: buildCustomNode(plan, parentId, text, createId('ask')) })
    },
    // Ask the agent about text the user selected: a temporary node under `parentId`.
    askAboutText: (planId, parentId, phrase, query = '') => {
      const plan = stateRef.current.plans.find((p) => p.id === planId)
      if (!plan || !phrase.trim() || !plan.nodes.some((n) => n.id === parentId && n.status !== 'thinking')) return
      // The node needs the tree on screen to appear in.
      if (plan.collapsed) dispatch({ type: 'plan/collapse', id: planId, collapsed: false })
      dispatch({ type: 'plan/addNode', planId, node: buildLookupNode(plan, parentId, phrase, createId('look'), query) })
    },
    keepNode: (planId, nodeId) => dispatch({ type: 'plan/keepNode', planId, nodeId }),
    removeNode: (planId, nodeId) => dispatch({ type: 'plan/removeNode', planId, nodeId }),
    pickSuggested: (planId, nodeId, optionIds) => dispatch({ type: 'plan/pickMany', planId, nodeId, optionIds }),
    toggleOption: (planId, nodeId, optionId) => dispatch({ type: 'plan/toggle', planId, nodeId, optionId }),
    draftItinerary: draft,
    // Draft-first: the agent answers every question itself, drafts the whole
    // document, and tucks the tree away. Anything can then be swapped in the
    // document, or the tree opened to change a choice.
    draftFirst: async (planId) => {
      const plan = stateRef.current.plans.find((p) => p.id === planId)
      if (!plan || plan.status === 'drafting' || plan.nodes.some((n) => !n.parentId && n.status === 'thinking')) return
      const next = applySuggestions(plan)
      dispatch({ type: 'plan/replace', plan: next })
      const done = await draft(planId, flowOfPlan(plan).copy.draft, next)
      if (done) dispatch({ type: 'plan/collapse', id: planId, collapsed: true })
    },
    swapItem: (planId, key, alt) => dispatch({ type: 'plan/swap', planId, key, alt }),
    focusPlan: (id) => dispatch({ type: 'plan/focus', id }),
    deletePlan: (id) => dispatch({ type: 'plan/delete', id }),
    movePlanNodes: (moves) => dispatch({ type: 'plan/move', moves }),
    setPlanCollapsed: (id, collapsed) => dispatch({ type: 'plan/collapse', id, collapsed }),
    openDocument: (id) => dispatch({ type: 'doc/open', id }),
    closeDocument: () => dispatch({ type: 'doc/close' }),
    renameChat: (id, title) => dispatch({ type: 'chat/update', id, patch: { title } }),
    deleteChats: (ids) => dispatch({ type: 'chat/delete', ids }),
    updateLayout: (layout) => dispatch({ type: 'chat/layout', layout }),
    setEdges: (edges) => dispatch({ type: 'edges/set', edges }),
    openComposer: (position, prompt) => dispatch({ type: 'composer/open', position, prompt }),
    closeComposer: () => dispatch({ type: 'composer/close' }),
  }

  return <CanvasContext.Provider value={{ ...state, ...actions }}>{children}</CanvasContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCanvas() {
  const context = useContext(CanvasContext)
  if (!context) throw new Error('useCanvas must be used inside <CanvasProvider>')
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = (id) => useCanvas().chats.find((chat) => chat.id === id)
