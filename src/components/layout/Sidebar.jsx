import { LayoutGrid, PanelLeft, Settings, SquarePen } from 'lucide-react'
import Logo from '../ui/Logo'
import Avatar from '../ui/Avatar'
import ConnectionList from '../connections/ConnectionList'
import AgentChatList from '../chat/AgentChatList'
import { currentUser } from '../../data/mockUsers'

const nav = [
  { id: 'canvas', label: 'Canvas', icon: LayoutGrid },
  { id: 'feed', label: 'Feed', icon: SquarePen },
]

export default function Sidebar({ view, onNavigate }) {
  return (
    <aside className="flex h-full w-67 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <Logo />
        <button type="button" aria-label="Collapse sidebar" className="rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 focus-ring">
          <PanelLeft className="size-5" />
        </button>
      </div>

      <nav aria-label="Primary" className="flex flex-col gap-1 px-3">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            aria-current={view === id ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-body-m font-medium transition-colors focus-ring ${
              view === id ? 'bg-indigo-soft text-indigo' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="size-5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-5 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4">
        <ConnectionList />
        <AgentChatList />
      </div>

      <div className="flex items-center gap-3 border-t border-gray-200 px-5 py-4">
        <Avatar user={currentUser} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-m font-semibold text-gray-900">{currentUser.name}</p>
          <p className="truncate text-body-s text-gray-500">@{currentUser.username}</p>
        </div>
        <button type="button" aria-label="Settings" className="rounded-full p-2 text-gray-500 hover:bg-gray-100 focus-ring">
          <Settings className="size-5" />
        </button>
      </div>
    </aside>
  )
}
