import { Frame, Hand, ImageIcon, MousePointer2 } from 'lucide-react'

const tools = [
  { id: 'select', label: 'Select — click the canvas to start a chat', icon: MousePointer2 },
  { id: 'hand', label: 'Hand — pan the canvas', icon: Hand },
  { id: 'frame', label: 'Frame (coming soon)', icon: Frame, disabled: true },
  { id: 'image', label: 'Image (coming soon)', icon: ImageIcon, disabled: true },
]

export default function CanvasToolbar({ tool, onToolChange }) {
  return (
    <div
      role="toolbar"
      aria-label="Canvas tools"
      className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-gray-200 bg-white/90 p-2 shadow-medium backdrop-blur max-md:bottom-10 max-md:gap-2 max-md:rounded-full max-md:p-1.5"
    >
      {tools.map(({ id, label, icon: Icon, disabled }) => (
        <button
          key={id}
          type="button"
          onClick={() => onToolChange(id)}
          disabled={disabled}
          aria-pressed={tool === id}
          aria-label={label}
          title={label}
          className={`inline-flex size-12 items-center justify-center rounded-lg transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-40 max-md:size-11 max-md:rounded-full ${
            tool === id ? 'bg-indigo-soft text-indigo' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
