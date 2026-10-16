import { useState } from 'react'
import Sidebar from './Sidebar'
import Canvas from '../canvas/Canvas'
import Feed from '../feed/Feed'
import useResizablePanel from '../../hooks/useResizablePanel'

// Desktop layout: sidebar, canvas, resizable feed panel.
export default function DesktopShell() {
  const [view, setView] = useState('canvas')
  const [feedOpen, setFeedOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showMinimap, setShowMinimap] = useState(false)

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
      <main aria-label="Canvas" className="relative min-w-0 flex-1">
        <Canvas
          showMinimap={showMinimap}
          onToggleMinimap={() => setShowMinimap((s) => !s)}
          onOpenFeed={feedOpen ? undefined : () => setFeedOpen(true)}
        />
      </main>
      {feedOpen && <Feed panel={feedPanel} onCollapse={() => setFeedOpen(false)} />}
    </div>
  )
}
