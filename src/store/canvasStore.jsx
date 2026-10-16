import { createContext, useContext, useEffect, useReducer, useRef } from 'react'
import { askAgent } from '../lib/agentEngine'
import { createChat, createMessage } from '../lib/chats'
import { forStorage } from '../lib/attachments'

const STORAGE_KEY = 'innernet:canvas:v1'

const CanvasContext = createContext(null)

// Research can't survive a reload in the prototype, so in-flight chats come back idle.
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!saved) return { chats: [], edges: [] }
    return {
      chats: saved.chats.map((chat) => (chat.status === 'working' ? { ...chat, status: 'idle', activity: null } : chat)),
      edges: saved.edges ?? [],
    }
  } catch {
    return { chats: [], edges: [] }
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
  const [state, dispatch] = useReducer(reducer, null, () => ({ ...load(), composer: null }))
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Debounced so dragging doesn't write to storage on every frame.
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats: state.chats.map(toStorage), edges: state.edges }))
      } catch {
        // Persistence is best-effort in the prototype.
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [state.chats, state.edges])

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

  const actions = {
    startChat: ({ prompt, attachments = [], position }) => {
      const chat = createChat({ prompt, attachments, position, index: stateRef.current.chats.length })
      dispatch({ type: 'chat/create', chat })
      sendMessage(chat.id, prompt, attachments)
      return chat.id
    },
    sendMessage,
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
