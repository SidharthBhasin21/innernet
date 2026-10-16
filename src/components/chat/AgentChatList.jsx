import AgentMascot from '../agent/AgentMascot'
import SectionHeader from '../ui/SectionHeader'
import { useCanvas } from '../../store/canvasStore'
import useCanvasNavigation from '../../hooks/useCanvasNavigation'
import { getTone } from '../../lib/chatTones'
import { formatRelative } from '../../lib/time'

const previewOf = (chat) => {
  if (chat.status === 'working') return chat.activity?.message ?? 'Thinking…'
  const last = chat.messages.at(-1)
  if (!last) return 'New chat'
  return last.content || `📎 ${last.attachments.map((a) => a.name).join(', ')}`
}

// `onOpenChat` lets the mobile shell switch back to the canvas before it flies to the chat.
export default function AgentChatList({ collapsed = false, variant = 'sidebar', limit, onSeeAll, onOpenChat }) {
  const { chats } = useCanvas()
  const { focusChat, openComposerAtCenter } = useCanvasNavigation()
  const page = variant === 'page'
  const recent = [...chats].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const shown = limit ? recent.slice(0, limit) : recent

  const openChat = (id) => {
    onOpenChat?.()
    focusChat(id)
  }

  const newChat = () => {
    onOpenChat?.()
    openComposerAtCenter()
  }

  return (
    <section aria-label="Agent chats" className="flex flex-col gap-2">
      <SectionHeader
        title="Agent Chats"
        addLabel="New agent chat"
        onAdd={newChat}
        onSeeAll={shown.length < recent.length ? onSeeAll : undefined}
        collapsed={collapsed}
        variant={variant}
      />
      {recent.length === 0 && !collapsed && <p className="px-3 text-body-s text-gray-400">Chats you start on the canvas appear here.</p>}
      <ul>
        {shown.map((chat) => (
          <li key={chat.id}>
            <button
              type="button"
              onClick={() => openChat(chat.id)}
              aria-label={collapsed ? chat.title : undefined}
              title={collapsed ? chat.title : undefined}
              className={`flex w-full items-center gap-3 rounded-md text-left transition-colors hover:bg-gray-100 focus-ring ${page ? 'py-2.5' : 'py-2'} ${collapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <span className={`inline-flex shrink-0 items-center justify-center rounded-full ${page ? 'size-12' : 'size-10'} ${getTone(chat.tone).soft}`}>
                <AgentMascot tone={chat.tone} />
              </span>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate font-medium text-gray-900 ${page ? 'text-body-l' : 'text-body-m'}`}>{chat.title}</span>
                    <span className={`block truncate text-gray-500 ${page ? 'text-body-m' : 'text-body-s'}`}>{previewOf(chat)}</span>
                  </span>
                  <span className="flex flex-col items-end gap-1.5 self-start pt-0.5">
                    <span className="text-body-s text-gray-400">{formatRelative(chat.updatedAt)}</span>
                    {chat.status === 'working' && <span aria-hidden="true" className="size-2 rounded-full bg-indigo animate-pulse-soft" />}
                  </span>
                </>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
