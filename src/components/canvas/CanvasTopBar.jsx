import { useReactFlow, useViewport } from '@xyflow/react'
import { Map as MapIcon, Maximize, Minus, PanelRightOpen, Plus } from 'lucide-react'
import CanvasSearch from './CanvasSearch'

const iconButton =
  'inline-flex size-11 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-ring'

// Floating controls over the canvas. The wrapper ignores pointer events so
// clicks in the gaps still reach the canvas.
export default function CanvasTopBar({ showMinimap, onToggleMinimap, onOpenFeed }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const { zoom } = useViewport()

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start gap-3 px-5 pt-4">
      <div className="flex flex-1 justify-center">
        <div className="pointer-events-auto w-full max-w-120">
          <CanvasSearch />
        </div>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleMinimap}
          aria-pressed={showMinimap}
          aria-label="Toggle minimap"
          title="Minimap"
          className={`${iconButton} surface rounded-md! ${showMinimap ? 'bg-indigo-soft! text-indigo!' : ''}`}
        >
          <MapIcon className="size-5" />
        </button>

        <div className="surface flex h-11 items-center rounded-md! px-1">
          <button type="button" onClick={() => zoomOut({ duration: 200 })} aria-label="Zoom out" className="rounded-sm p-1.5 text-gray-700 hover:bg-gray-100 focus-ring">
            <Minus className="size-4" />
          </button>
          <span className="w-14 text-center text-body-m text-gray-700 tabular-nums" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <button type="button" onClick={() => zoomIn({ duration: 200 })} aria-label="Zoom in" className="rounded-sm p-1.5 text-gray-700 hover:bg-gray-100 focus-ring">
            <Plus className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => fitView({ duration: 400, padding: 0.2, maxZoom: 1 })}
          aria-label="Fit all chats in view"
          title="Fit to screen"
          className={`${iconButton} surface rounded-md!`}
        >
          <Maximize className="size-5" />
        </button>

        {onOpenFeed && (
          <button type="button" onClick={onOpenFeed} aria-label="Open feed" title="Open feed" className={`${iconButton} surface rounded-md!`}>
            <PanelRightOpen className="size-5" />
          </button>
        )}
      </div>
    </div>
  )
}
