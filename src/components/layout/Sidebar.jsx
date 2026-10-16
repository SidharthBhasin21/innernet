import { LayoutGrid, PanelLeftClose, PanelLeftOpen, SquarePen } from 'lucide-react'
import Logo from '../ui/Logo'
import Avatar from '../ui/Avatar'
import ConnectionList from '../connections/ConnectionList'
import AgentChatList from '../chat/AgentChatList'
import SettingsMenu from './SettingsMenu'
import { currentUser } from '../../data/mockUsers'

const nav = [
  { id: 'canvas', label: 'Canvas', icon: LayoutGrid },
  { id: 'feed', label: 'Feed', icon: SquarePen },
]

export default function Sidebar({ view, onNavigate, collapsed, onToggleCollapsed }) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-200 ease-soft ${collapsed ? 'w-18' : 'w-67'}`}
    >
      <div className={`flex items-center pt-5 pb-4 ${collapsed ? 'flex-col gap-3 px-0' : 'justify-between px-5'}`}>
        <Logo compact={collapsed} />
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 focus-ring"
        >
          <ToggleIcon className="size-5" />
        </button>
      </div>

      <nav aria-label="Primary" className="flex flex-col gap-1 px-3">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            aria-current={view === id ? 'page' : undefined}
            aria-label={collapsed ? label : undefined}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 rounded-md py-2.5 text-body-m font-medium transition-colors focus-ring ${
              collapsed ? 'justify-center px-0' : 'px-3'
            } ${view === id ? 'bg-indigo-soft text-indigo' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Icon className="size-5" aria-hidden="true" />
            {!collapsed && label}
          </button>
        ))}
      </nav>

      <div className={`mt-5 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        <ConnectionList collapsed={collapsed} />
        <AgentChatList collapsed={collapsed} />
      </div>

      <div className={`relative flex items-center gap-3 border-t border-gray-200 py-4 ${collapsed ? 'justify-center px-0' : 'px-5'}`}>
        <span title={collapsed ? `${currentUser.name} (@${currentUser.username})` : undefined}>
          <Avatar user={currentUser} size="lg" />
        </span>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-m font-semibold text-gray-900">{currentUser.name}</p>
              <p className="truncate text-body-s text-gray-500">@{currentUser.username}</p>
            </div>
            <SettingsMenu />
          </>
        )}
      </div>
    </aside>
  )
}
