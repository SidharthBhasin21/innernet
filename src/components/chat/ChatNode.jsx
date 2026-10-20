import { Handle, NodeResizer, Position } from '@xyflow/react'
import AgentMascot from '../agent/AgentMascot'
import AgentStatus from '../agent/AgentStatus'
import ChatMenu from './ChatMenu'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import { useCanvas, useChat } from '../../store/canvasStore'
import { CHAT_SIZE } from '../../lib/chats'
import { getTone } from '../../lib/chatTones'

// A canvas chat card. Only the header drags the card; the body stays interactive.
export default function ChatNode({ id, selected }) {
  const chat = useChat(id)
  const { sendMessage, deleteChats } = useCanvas()
  if (!chat) return null

  const tone = getTone(chat.tone)
  // Until the user resizes, the card fits its content up to a fixed cap.
  // (React Flow's `height` prop is the measured size, so read our own state.)
  const autoHeight = chat.size.height == null

  return (
    <article
      aria-label={chat.title}
      style={autoHeight ? { maxHeight: `min(${CHAT_SIZE.maxAutoHeight}px, var(--card-max-height))` } : undefined}
      className={`group flex h-full flex-col rounded-xl border bg-white shadow-medium transition-shadow animate-pop-in ${tone.border} ${
        selected ? 'shadow-large ring-2 ring-indigo/25' : 'hover:shadow-large'
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={CHAT_SIZE.minWidth}
        minHeight={CHAT_SIZE.minHeight}
        maxWidth={CHAT_SIZE.maxWidth}
        maxHeight={CHAT_SIZE.maxHeight}
        lineClassName="chat-resize-line"
        handleClassName="chat-resize-handle"
      />
      <Handle type="target" position={Position.Left} className="chat-handle" aria-label="Connect from another chat" />
      <Handle type="source" position={Position.Right} className="chat-handle" aria-label="Connect to another chat" />

      <header className="chat-drag-handle flex shrink-0 cursor-grab items-center gap-3 px-4 pt-4 pb-3 active:cursor-grabbing">
        <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full ${tone.soft}`}>
          <AgentMascot tone={chat.tone} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-body-l font-semibold text-gray-900">{chat.title}</h3>
          <AgentStatus status={chat.status} />
        </div>
        <ChatMenu onDelete={() => deleteChats([chat.id])} />
      </header>

      <ChatMessages chat={chat} />

      <div className="shrink-0 px-3 pb-3">
        <ChatInput
          label={`Message your agent in ${chat.title}`}
          placeholder={chat.status === 'working' ? 'Your agent is working…' : 'Ask a follow-up…'}
          disabled={chat.status === 'working'}
          onSubmit={(text, attachments) => sendMessage(chat.id, text, attachments)}
        />
      </div>
    </article>
  )
}
