import { Dumbbell, Plane } from 'lucide-react'
import AgentMascot from '../agent/AgentMascot'
import SectionHeader from '../ui/SectionHeader'
import { useCanvas } from '../../store/canvasStore'
import useCanvasNavigation from '../../hooks/useCanvasNavigation'
import { getTone } from '../../lib/chatTones'
import { flowOfPlan, planTitle } from '../../lib/flows'
import { collectPicks } from '../../lib/trip/planModel'
import { formatRelative } from '../../lib/time'

const previewOf = (chat) => {
  if (chat.status === 'working') return chat.activity?.message ?? 'Thinking…'
  const last = chat.messages.at(-1)
  if (!last) return 'New chat'
  return last.content || `📎 ${last.attachments.map((a) => a.name).join(', ')}`
}

const planPreview = (plan) => {
  if (plan.status === 'drafting') return plan.activity?.message ?? 'Drafting your itinerary…'
  if (plan.itinerary) return flowOfPlan(plan).copy.ready
  const picks = collectPicks(plan).length
  return picks ? `${picks} ${picks === 1 ? 'pick' : 'picks'} so far` : 'Nothing picked yet'
}

// Chats and trips share one list, most recently touched first. Both become
// the same row shape: an id, a title, a preview line and the icon to draw.
function toRows(chats, plans) {
  return [
    ...chats.map((chat) => ({
      kind: 'chat',
      id: chat.id,
      title: chat.title,
      preview: previewOf(chat),
      updatedAt: chat.updatedAt,
      working: chat.status === 'working',
      tone: chat.tone,
    })),
    ...plans.map((plan) => ({
      kind: 'trip',
      id: plan.id,
      title: planTitle(plan),
      icon: flowOfPlan(plan).icon,
      preview: planPreview(plan),
      updatedAt: plan.updatedAt,
      working: plan.status === 'drafting',
    })),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

// `onOpenChat` lets the mobile shell switch back to the canvas before it flies to the chat or trip.
export default function AgentChatList({ collapsed = false, variant = 'sidebar', limit, onSeeAll, onOpenChat }) {
  const { chats, plans } = useCanvas()
  const { focusChat, focusPlan, openComposerAtCenter } = useCanvasNavigation()
  const page = variant === 'page'
  const recent = toRows(chats, plans)
  const shown = limit ? recent.slice(0, limit) : recent

  const openRow = (row) => {
    onOpenChat?.()
    if (row.kind === 'trip') focusPlan(row.id)
    else focusChat(row.id)
  }

  const newChat = () => {
    onOpenChat?.()
    openComposerAtCenter()
  }

  return (
    <section aria-label="Chats and trips" className="flex flex-col gap-2">
      <SectionHeader
        title="Chats & Trips"
        addLabel="New agent chat"
        onAdd={newChat}
        onSeeAll={shown.length < recent.length ? onSeeAll : undefined}
        collapsed={collapsed}
        variant={variant}
      />
      {recent.length === 0 && !collapsed && <p className="px-3 text-body-s text-gray-400">Chats and trips you start on the canvas appear here.</p>}
      <ul>
        {shown.map((row) => (
          <li key={`${row.kind}:${row.id}`}>
            <button
              type="button"
              onClick={() => openRow(row)}
              aria-label={collapsed ? row.title : undefined}
              title={collapsed ? row.title : undefined}
              className={`flex w-full items-center gap-3 rounded-md text-left transition-colors hover:bg-gray-100 focus-ring ${page ? 'py-2.5' : 'py-2'} ${collapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <span className={`inline-flex shrink-0 items-center justify-center rounded-full ${page ? 'size-12' : 'size-10'} ${row.kind === 'trip' ? 'bg-indigo-soft text-indigo' : getTone(row.tone).soft}`}>
                {row.kind === 'trip' ? row.icon === 'dumbbell' ? <Dumbbell className="size-5" aria-hidden="true" /> : <Plane className="size-5" aria-hidden="true" /> : <AgentMascot tone={row.tone} />}
              </span>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate font-medium text-gray-900 ${page ? 'text-body-l' : 'text-body-m'}`}>{row.title}</span>
                    <span className={`block truncate text-gray-500 ${page ? 'text-body-m' : 'text-body-s'}`}>{row.preview}</span>
                  </span>
                  <span className="flex flex-col items-end gap-1.5 self-start pt-0.5">
                    <span className="text-body-s text-gray-400">{formatRelative(row.updatedAt)}</span>
                    {row.working && <span aria-hidden="true" className="size-2 rounded-full bg-indigo animate-pulse-soft" />}
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
