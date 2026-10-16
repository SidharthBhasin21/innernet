import { useReactFlow, useStoreApi } from '@xyflow/react'
import AgentMascot from '../agent/AgentMascot'
import SectionHeader from '../ui/SectionHeader'
import { useCanvas } from '../../store/canvasStore'
import { getTone } from '../../lib/chatTones'
import { formatRelative } from '../../lib/time'

const previewOf = (chat) => {
  if (chat.status === 'working') return chat.activity?.message ?? 'Thinking…'
  const last = chat.messages.at(-1)
  if (!last) return 'New chat'
  return last.content || `📎 ${last.attachments.map((a) => a.name).join(', ')}`
}

export default function AgentChatList({ collapsed = false }) {
  const { chats, openComposer } = useCanvas()
  const { fitView, getViewport } = useReactFlow()
  const flowStore = useStoreApi()
  const recent = [...chats].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  // Secondary entry point: open the composer in the middle of the visible canvas.
  const newChat = () => {
    const { width, height } = flowStore.getState()
    const { x, y, zoom } = getViewport()
    openComposer({ x: (width / 2 - x) / zoom - 160, y: (height / 2 - y) / zoom - 80 })
  }

  return (
    <section aria-label="Agent chats" className="flex flex-col gap-2">
      <SectionHeader title="Agent Chats" addLabel="New agent chat" onAdd={newChat} collapsed={collapsed} />
      {recent.length === 0 && !collapsed && <p className="px-3 text-body-s text-gray-400">Chats you start on the canvas appear here.</p>}
      <ul>
        {recent.map((chat) => (
          <li key={chat.id}>
            <button
              type="button"
              onClick={() => fitView({ nodes: [{ id: chat.id }], duration: 500, maxZoom: 1, padding: 0.6 })}
              aria-label={collapsed ? chat.title : undefined}
              title={collapsed ? chat.title : undefined}
              className={`flex w-full items-center gap-3 rounded-md py-2 text-left transition-colors hover:bg-gray-100 focus-ring ${collapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full ${getTone(chat.tone).soft}`}>
                <AgentMascot tone={chat.tone} />
              </span>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-m font-medium text-gray-900">{chat.title}</span>
                    <span className="block truncate text-body-s text-gray-500">{previewOf(chat)}</span>
                  </span>
                  <span className="self-start pt-0.5 text-body-s text-gray-400">{formatRelative(chat.updatedAt)}</span>
                </>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
