import { useState } from 'react'
import { Map as MapIcon, Plus, Search } from 'lucide-react'
import Logo from '../ui/Logo'
import CanvasSearch from '../canvas/CanvasSearch'

const iconButton =
  'inline-flex size-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 focus-ring'

// Phone header: logo plus two actions. On the canvas the second action toggles
// the minimap; elsewhere it starts a new chat. Search expands in place.
export default function MobileHeader({ view, showMinimap, onToggleMinimap, onNewChat, onSearchSelect }) {
  const [searching, setSearching] = useState(false)

  return (
    <header className="relative z-30 shrink-0 bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="flex h-16 items-center gap-2 px-4">
        {searching ? (
          <>
            <div className="min-w-0 flex-1">
              <CanvasSearch
                autoFocus
                placeholder="Search your chats…"
                onSelect={() => {
                  setSearching(false)
                  onSearchSelect()
                }}
              />
            </div>
            <button type="button" onClick={() => setSearching(false)} className="rounded-sm px-1 text-body-m font-medium text-indigo focus-ring">
              Cancel
            </button>
          </>
        ) : (
          <>
            <div className="flex-1">
              <Logo />
            </div>
            <button type="button" onClick={() => setSearching(true)} aria-label="Search your canvas" className={iconButton}>
              <Search className="size-5" />
            </button>
            {view === 'canvas' ? (
              <button
                type="button"
                onClick={onToggleMinimap}
                aria-pressed={showMinimap}
                aria-label="Toggle minimap"
                className={`${iconButton} ${showMinimap ? 'bg-indigo-soft! text-indigo!' : ''}`}
              >
                <MapIcon className="size-5" />
              </button>
            ) : (
              <button type="button" onClick={onNewChat} aria-label="New agent chat" className={iconButton}>
                <Plus className="size-5" />
              </button>
            )}
          </>
        )}
      </div>
    </header>
  )
}
