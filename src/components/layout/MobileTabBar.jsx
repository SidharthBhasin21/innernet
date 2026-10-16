import { LayoutGrid, MessageCircle, Plus, SquarePen, User } from 'lucide-react'

const tabs = [
  { id: 'canvas', label: 'Canvas', icon: LayoutGrid },
  { id: 'feed', label: 'Feed', icon: SquarePen },
  { id: 'chats', label: 'Chats', icon: MessageCircle },
  { id: 'profile', label: 'Profile', icon: User },
]

function TabButton({ id, label, icon: Icon, active, onNavigate }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(id)}
      aria-current={active ? 'page' : undefined}
      className={`flex h-full flex-col items-center justify-center gap-1 text-caption font-medium transition-colors focus-ring ${
        active ? 'text-indigo' : 'text-gray-500 hover:text-gray-900'
      }`}
    >
      <Icon className="size-6" strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
      {label}
    </button>
  )
}

// Phone bottom navigation with a raised "new chat" button in the middle.
export default function MobileTabBar({ view, onNavigate, onNewChat }) {
  const renderTab = (tab) => <TabButton key={tab.id} {...tab} active={view === tab.id} onNavigate={onNavigate} />

  return (
    <nav aria-label="Primary" className="relative z-30 shrink-0 border-t border-gray-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="grid h-16 grid-cols-5">
        {tabs.slice(0, 2).map(renderTab)}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onNewChat}
            aria-label="New agent chat"
            className="-mt-6 inline-flex size-14 items-center justify-center rounded-full bg-linear-to-br from-blue to-indigo text-white shadow-large ring-4 ring-white transition-transform focus-ring active:scale-95"
          >
            <Plus className="size-7" strokeWidth={2.25} />
          </button>
        </div>
        {tabs.slice(2).map(renderTab)}
      </div>
    </nav>
  )
}
