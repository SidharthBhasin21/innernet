import ToolButton from './ToolButton'
import { canvasTools } from '../../lib/canvasTools'

export default function CanvasToolbar({ tool, onToolChange }) {
  return (
    <div
      role="toolbar"
      aria-label="Canvas tools"
      className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-gray-200 bg-white/90 p-2 shadow-medium backdrop-blur"
    >
      {canvasTools.map((t) => (
        <ToolButton key={t.id} tool={t} active={tool === t.id} onSelect={onToolChange} className="size-12 rounded-lg" />
      ))}
    </div>
  )
}
