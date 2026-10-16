import { currentUser } from '../data/mockUsers'

// Chat cards start compact; height stays content-driven until the user resizes.
export const CHAT_SIZE = {
  initialWidth: 320,
  minWidth: 280,
  minHeight: 200,
  maxWidth: 720,
  maxHeight: 760,
}

const toneCycle = ['indigo', 'purple', 'blue', 'amber', 'green', 'pink']

export const createId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export const createMessage = (role, content) => ({
  id: createId('msg'),
  role,
  content,
  timestamp: new Date().toISOString(),
})

// First few words of the opening prompt, e.g. "Plan a 7 day trip to Japan" → "Plan a 7 day trip".
export function deriveTitle(prompt) {
  const words = prompt.replace(/[?!.]+$/, '').trim().split(/\s+/)
  const title = words.slice(0, 5).join(' ')
  const text = words.length > 5 ? `${title}…` : title
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function createChat({ prompt, position, index }) {
  const now = new Date().toISOString()
  return {
    id: createId('chat'),
    // Every chat belongs to the user's single personal agent.
    agentId: `agent-${currentUser.id}`,
    title: deriveTitle(prompt),
    tone: toneCycle[index % toneCycle.length],
    messages: [],
    position,
    size: { width: CHAT_SIZE.initialWidth },
    status: 'idle',
    activity: null,
    createdAt: now,
    updatedAt: now,
  }
}
