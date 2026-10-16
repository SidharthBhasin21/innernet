import { useState } from 'react'
import Canvas from '../canvas/Canvas'
import Feed from '../feed/Feed'
import ChatsScreen from '../chat/ChatsScreen'
import ProfileScreen from '../profile/ProfileScreen'
import MobileHeader from './MobileHeader'
import MobileTabBar from './MobileTabBar'
import useCanvasNavigation from '../../hooks/useCanvasNavigation'

// Phone layout: header, one screen at a time, bottom tab bar. The canvas stays
// mounted under the other screens so opening a chat can fly straight to it.
export default function MobileShell() {
  const [view, setView] = useState('canvas')
  const [showMinimap, setShowMinimap] = useState(false)
  const { openComposerAtCenter } = useCanvasNavigation()

  const showCanvas = () => setView('canvas')
  const newChat = () => {
    showCanvas()
    openComposerAtCenter()
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-gradient-canvas">
      <MobileHeader
        view={view}
        showMinimap={showMinimap}
        onToggleMinimap={() => setShowMinimap((s) => !s)}
        onNewChat={newChat}
        onSearchSelect={showCanvas}
      />

      <main className="relative min-h-0 flex-1">
        <div inert={view !== 'canvas'} className="absolute inset-0">
          <Canvas compact showMinimap={showMinimap} />
        </div>
        {view !== 'canvas' && (
          <div className="absolute inset-0 z-20 bg-white animate-pop-in">
            {view === 'feed' && <Feed variant="page" />}
            {view === 'chats' && <ChatsScreen onOpenChat={showCanvas} />}
            {view === 'profile' && <ProfileScreen />}
          </div>
        )}
      </main>

      <MobileTabBar view={view} onNavigate={setView} onNewChat={newChat} />
    </div>
  )
}
