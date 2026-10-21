// The tree of a plan. A plan starts as one node (the trip, the fitness plan…) with
// a few branches. Choosing an option on a node can grow new nodes from it, with
// context about that choice. Everything is plain data, so the tree can be saved
// and later come from a real agent. What each node asks, and how the agent
// reasons about it, belongs to the plan's flow (lib/flows).
//
// plan.nodes: [{ id, parentId, order, spec, selected: [optionId], status, thinkMs }]
//   spec: what the node asks, e.g. { kind: 'attractions', city: 'kyoto' }; specs of
//   flows other than trip also carry `flow`.
//   status: 'thinking' while the agent works it out (shown as a placeholder), then
//   'ready'. A node appears once the node above it is ready.

import { createId } from '../chats'
import { flowOfPlan, flows, flowOfSpec } from '../flows'
import { selectionSignature } from '../flows/shared'

// --- What each node asks (the flow answers; these are the shared cases) ----------

const pickOf = (options, id) => options.find((o) => o.id === id)
// Trip is the default flow, so its specs stay unmarked and older saves still match.
const stamp = (flowId) => (flowId && flowId !== 'trip' ? { flow: flowId } : {})

/** The question, context and options a node shows, from its spec. */
export function specContent(spec) {
  const flow = flowOfSpec(spec)
  if (spec.kind === 'root') return { icon: flow.icon, title: spec.title, question: null, options: [] }
  // A question the user typed: the agent's answer is stored on the node.
  // A phrase the user selected and asked about: a temporary note until they keep it.
  if (spec.kind === 'lookup') return { icon: 'lookup', title: spec.answer.title, question: spec.answer.title, context: spec.answer.query ? `You asked about “${spec.phrase}”: “${spec.answer.query}”` : `You selected: “${spec.phrase}”`, multi: false, options: [] }
  if (spec.kind === 'custom') return { icon: 'ask', title: spec.answer.title, question: spec.answer.title, context: spec.phrase ? `You asked about “${spec.phrase}”: “${spec.prompt}”` : `You asked: “${spec.prompt}”`, multi: true, options: spec.answer.options }
  return flow.specContent(spec)
}

/** What the agent says it's doing while a node is still a placeholder. */
export function thinkMessage(spec) {
  if (spec.kind === 'lookup') return `Looking up “${spec.phrase.length > 40 ? `${spec.phrase.slice(0, 39)}…` : spec.phrase}”…`
  if (spec.kind === 'custom') return `Thinking about “${spec.prompt.length > 40 ? `${spec.prompt.slice(0, 39)}…` : spec.prompt}”…`
  return flowOfSpec(spec).thinkMessage(spec)
}

/** Nodes that choosing an option on `spec` should grow, with the key that names each. */
function childSpecs(spec, optionId) {
  return flowOfSpec(spec)
    .childSpecs(spec, optionId)
    .map((child) => ({ ...child, spec: { ...child.spec, ...stamp(spec.flow) } }))
}

// --- Building and changing the tree ----------------------------------------------

const nodeId = (planId, key) => `${planId}/${key}`
const sameSpec = (a, b) => JSON.stringify(a) === JSON.stringify(b)

export function createPlan({ prompt, position, flow: flowId = 'trip' }) {
  const flow = flows[flowId]
  const id = createId('plan')
  const now = new Date().toISOString()
  // The top node thinks first; its branches then appear one after another.
  const root = { id: nodeId(id, 'root'), parentId: null, order: 0, spec: { kind: 'root', title: flow.title(prompt), prompt, ...stamp(flowId) }, selected: [], status: 'thinking' }
  const branches = flow.branches(prompt).map((branch, order) => ({
    id: nodeId(id, branch.kind),
    parentId: root.id,
    order,
    spec: { kind: branch.kind, ...stamp(flowId) },
    selected: branch.selected ?? [],
    status: 'thinking',
    thinkMs: 900 + order * 450,
  }))
  let plan = {
    id,
    flow: flowId,
    prompt,
    position,
    nodes: [root, ...branches],
    // The finished document (an itinerary, a workout plan…), once drafted.
    itinerary: null,
    collapsed: false,
    status: 'idle',
    activity: null,
    createdAt: now,
    updatedAt: now,
  }
  // Anything already answered in the prompt (say, the number of days) grows its follow-up.
  branches.filter((branch) => branch.selected.length).forEach((branch) => {
    plan = { ...plan, nodes: syncChildren(plan.nodes, branch.id) }
  })
  return plan
}

const descendantsOf = (nodes, id) => {
  const kids = nodes.filter((n) => n.parentId === id)
  return [...kids.map((k) => k.id), ...kids.flatMap((k) => descendantsOf(nodes, k.id))]
}

// Make the children under `parentId` match what its selections ask for: grow
// missing ones, drop ones nothing asks for any more, rebuild ones whose
// context changed (e.g. a new budget changes the stay options).
function syncChildren(nodes, parentId) {
  const parent = nodes.find((n) => n.id === parentId)
  const planId = parentId.split('/')[0]
  const wanted = new Map()
  parent.selected.forEach((optionId) => {
    childSpecs(parent.spec, optionId).forEach((child) => wanted.set(child.key, child))
  })

  let next = nodes
  nodes
    .filter((n) => n.parentId === parentId)
    .forEach((child) => {
      // Questions the user added by hand stay, whatever is chosen on this node.
      if (child.spec.kind === 'custom' || child.spec.kind === 'lookup') return
      const key = child.id.slice(parentId.length + 1)
      const want = wanted.get(key)
      if (want && sameSpec(want.spec, child.spec)) return
      const gone = new Set([child.id, ...descendantsOf(nodes, child.id)])
      next = next.filter((n) => !gone.has(n.id))
    })
  let fresh = 0
  wanted.forEach((want, key) => {
    const id = nodeId(planId, `${parentId.slice(planId.length + 1)}/${key}`)
    if (next.some((n) => n.id === id)) return
    // New nodes think for a moment before they show their question, one after another.
    next = [
      ...next,
      {
        id,
        parentId,
        order: want.order,
        spec: want.spec,
        selected: [],
        status: 'thinking',
        thinkMs: 1200 + fresh * 450,
        // A new node starts where its parent was moved to (if it was), so it lands near it.
        ...(parent.offset && { offset: parent.offset }),
      },
    ]
    fresh += 1
  })
  return next
}

/**
 * A question the user typed on a node becomes a new node under it: the agent
 * works out an answer (stored on the node) and the node thinks for a moment
 * before showing it. `askId` makes the node's id unique.
 */
export function buildCustomNode(plan, parentId, prompt, askId) {
  const parent = plan.nodes.find((n) => n.id === parentId)
  const text = prompt.trim().slice(0, 140)
  const earlier = plan.nodes.filter((n) => n.parentId === parentId && n.spec.kind === 'custom').length
  return {
    id: `${parentId}/${askId}`,
    parentId,
    // After the questions the agent asked itself.
    order: 1000 + earlier,
    spec: { kind: 'custom', prompt: text, answer: flowOfPlan(plan).answerPrompt(text, plan, parent), ...stamp(plan.flow) },
    selected: [],
    status: 'thinking',
    thinkMs: 1400,
    ...(parent.offset && { offset: parent.offset }),
  }
}

/**
 * A phrase the user selected becomes a temporary node under the node it was
 * selected on: the agent explains it, and the user keeps or discards it.
 */
export function buildLookupNode(plan, parentId, phrase, lookupId, query = '') {
  const parent = plan.nodes.find((n) => n.id === parentId)
  const text = phrase.replace(/\s+/g, ' ').trim().slice(0, 80)
  const earlier = plan.nodes.filter((n) => n.parentId === parentId && n.spec.kind === 'lookup').length
  const where = { question: parent.spec.kind === 'root' ? null : specContent(parent.spec).question }
  const ask = query.trim().slice(0, 140)
  // A question the network can answer with options becomes a temporary question node.
  const answer = ask ? flowOfPlan(plan).answerPrompt(`${ask} ${text}`, plan, parent) : null
  if (answer?.topic) {
    return {
      id: `${parentId}/${lookupId}`,
      parentId,
      order: 2000 + earlier,
      spec: { kind: 'custom', prompt: ask, phrase: text, temp: true, answer, ...stamp(plan.flow) },
      selected: [],
      status: 'thinking',
      thinkMs: 1400,
      ...(parent.offset && { offset: parent.offset }),
    }
  }
  return {
    id: `${parentId}/${lookupId}`,
    parentId,
    // After the agent's own questions and the user's typed ones.
    order: 2000 + earlier,
    spec: { kind: 'lookup', phrase: text, temp: true, answer: flowOfPlan(plan).lookup(text, where, ask), ...stamp(plan.flow) },
    selected: [],
    status: 'thinking',
    thinkMs: 900,
    ...(parent.offset && { offset: parent.offset }),
  }
}

/**
 * Draft-first: take the agent's suggestion on every question nobody has answered
 * yet, all the way down the tree (a choice grows follow-ups, which get answered
 * too), so there's a complete set of picks to draft from. Nodes the user already
 * answered, and nodes they typed, are left alone.
 */
export function applySuggestions(fullPlan) {
  const ready = (plan) => ({ ...plan, nodes: plan.nodes.map((n) => ({ ...n, status: 'ready' })) })
  let plan = ready(fullPlan)
  for (let round = 0; round < 6; round += 1) {
    let changed = false
    plan.nodes
      .map((n) => n.id)
      .forEach((id) => {
        const node = plan.nodes.find((n) => n.id === id)
        if (!node || !node.parentId || node.selected.length || node.spec.kind === 'custom' || node.spec.kind === 'lookup') return
        const { suggested } = flowOfPlan(plan).describeNode(plan, node)
        const picks = specContent(node.spec).multi ? suggested : suggested.slice(0, 1)
        picks.forEach((optionId) => {
          plan = toggleOption(plan, id, optionId)
          changed = true
        })
      })
    // Follow-ups grown by those picks are answered next round.
    plan = ready(plan)
    if (!changed) break
  }
  return plan
}

/** Remove a node the user added, and everything that grew from it. */
export function removeNodeTree(plan, id) {
  const gone = new Set([id, ...descendantsOf(plan.nodes, id)])
  return { ...plan, nodes: plan.nodes.filter((n) => !gone.has(n.id)), updatedAt: new Date().toISOString() }
}

/** Choose (or un-choose) one option on one node, growing or pruning branches. */
export function toggleOption(plan, nodeIdToToggle, optionId) {
  const node = plan.nodes.find((n) => n.id === nodeIdToToggle)
  if (!node) return plan
  const { multi } = specContent(node.spec)
  const has = node.selected.includes(optionId)
  const selected = multi ? (has ? node.selected.filter((id) => id !== optionId) : [...node.selected, optionId]) : has ? [] : [optionId]
  const nodes = plan.nodes.map((n) => (n.id === node.id ? { ...n, selected } : n))
  return { ...plan, nodes: syncChildren(nodes, node.id), updatedAt: new Date().toISOString() }
}

// --- Reading the tree -------------------------------------------------------------

export const childrenOf = (plan, id) => plan.nodes.filter((n) => n.parentId === id).sort((a, b) => a.order - b.order)

/** Every node in tree order (parent before children). */
export function inTreeOrder(plan) {
  const walk = (id) => childrenOf(plan, id).flatMap((child) => [child, ...walk(child.id)])
  const root = plan.nodes.find((n) => !n.parentId)
  return [root, ...walk(root.id)]
}

/** The nodes on screen: a node shows once the node above it is ready. */
export function visibleNodes(plan) {
  const byId = new Map(plan.nodes.map((n) => [n.id, n]))
  const shows = (node) => !node.parentId || (byId.get(node.parentId).status !== 'thinking' && shows(byId.get(node.parentId)))
  return plan.nodes.filter(shows)
}

/** Everything the user has chosen, in tree order: the chips below the canvas. */
export function collectPicks(plan) {
  return inTreeOrder(plan)
    .filter((node) => node.status !== 'thinking')
    .flatMap((node) => {
      const { options } = specContent(node.spec)
      return node.selected.map((optionId) => {
        const option = pickOf(options, optionId)
        return { nodeId: node.id, optionId, kind: node.spec.kind, chip: option.chip ?? option.label }
      })
    })
}

export { selectionSignature }

// --- Laying the tree out ----------------------------------------------------------

export const NODE_WIDTH = 300
export const ROOT_WIDTH = 280
// A collapsed tree is one node: a plan card, with its document previewed on it.
export const COLLAPSED_WIDTH = 340
export const collapsedHeight = (plan) => (plan.itinerary ? 380 : 190)
const GAP_X = 40
const GAP_Y = 72

// Before a node is measured: a header, the option chips (short labels wrap
// three to a row, long ones go one per row), and the reserved info area.
const estimateHeight = (node) => {
  if (node.spec.kind === 'root') return node.status === 'thinking' ? 130 : 170
  if (node.status === 'thinking') return 190
  if (node.spec.kind === 'lookup') return 250
  const n = specContent(node.spec).options.length
  const long = node.spec.kind === 'custom' || flowOfSpec(node.spec).longLabels.has(node.spec.kind)
  return 250 + (long ? n * 40 : Math.ceil(n / 3) * 40)
}
const widthOf = (node) => (node.spec.kind === 'root' ? ROOT_WIDTH : NODE_WIDTH)

/**
 * Where every node goes, top to bottom: the trip node on top, each choice's
 * follow-ups in the row below it, every parent centred over its children.
 * `heights` holds real measured heights (rows are as tall as their tallest node).
 * Offsets are from the trip node's top-left corner; `left`/`right` give how far
 * the tree reaches either side of it, `bottom` how far down.
 */
export function layoutPlan(fullPlan, heights = {}) {
  // Only what's on screen takes room.
  const plan = { ...fullPlan, nodes: visibleNodes(fullPlan) }
  const root = plan.nodes.find((n) => !n.parentId)
  const depths = {}
  const xs = {}
  let cursor = 0

  // Leaves take the next free column; a parent sits centred over its children.
  const place = (node, depth) => {
    depths[node.id] = depth
    const kids = childrenOf(plan, node.id)
    if (!kids.length) {
      xs[node.id] = cursor
      cursor += widthOf(node) + GAP_X
      return
    }
    kids.forEach((kid) => place(kid, depth + 1))
    const start = xs[kids[0].id]
    const end = xs[kids.at(-1).id] + widthOf(kids.at(-1))
    xs[node.id] = (start + end) / 2 - widthOf(node) / 2
  }
  place(root, 0)

  const rowHeight = []
  plan.nodes.forEach((n) => {
    rowHeight[depths[n.id]] = Math.max(rowHeight[depths[n.id]] ?? 0, heights[n.id] ?? estimateHeight(n))
  })
  const rowY = []
  let y = 0
  rowHeight.forEach((h, depth) => {
    rowY[depth] = y
    y += h + GAP_Y
  })

  const offsets = Object.fromEntries(plan.nodes.map((n) => [n.id, { x: xs[n.id] - xs[root.id], y: rowY[depths[n.id]] }]))
  const lefts = plan.nodes.map((n) => offsets[n.id].x)
  const rights = plan.nodes.map((n) => offsets[n.id].x + widthOf(n))
  return { offsets, left: Math.min(...lefts), right: Math.max(...rights), bottom: y - GAP_Y }
}

/** The nodes' children as React Flow edges. */
export const edgesOf = (plan) => visibleNodes(plan).filter((n) => n.parentId).map((n) => ({ id: `edge-${n.id}`, source: n.parentId, target: n.id }))
