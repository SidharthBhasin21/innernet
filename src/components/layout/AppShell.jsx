import { useState } from 'react'
import Sidebar from './Sidebar'
import { PanelRightOpen } from 'lucide-react'
import Feed from '../feed/Feed'
import useResizablePanel from '../../hooks/useResizablePanel'

export default function AppShell() {
  const [view, setView] = useState('canvas')
  const [feedOpen, setFeedOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const feedPanel = useResizablePanel({ key: 'innernet:feed-width', initial: 304, min: 304, max: 520 })

  const navigate = (id) => {
    setView(id)
    if (id === 'feed') setFeedOpen((open) => (view === 'feed' ? !open : true))
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gradient-canvas">
      <Sidebar
        view={view}
        onNavigate={navigate}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
      />
      {/* Middle canvas: intentionally left empty for now. */}
      <main aria-label="Canvas" className="relative min-w-0 flex-1">
        {!feedOpen && (
          <button
            type="button"
            onClick={() => setFeedOpen(true)}
            aria-label="Open feed"
            className="absolute top-4 right-4 rounded-full border border-gray-200 bg-white p-2 text-gray-500 shadow-subtle transition-colors hover:text-gray-900 focus-ring"
          >
            <PanelRightOpen className="size-5" />
          </button>
        )}
      </main>
      {feedOpen && <Feed panel={feedPanel} onCollapse={() => setFeedOpen(false)} />}
    </div>
  )
}
