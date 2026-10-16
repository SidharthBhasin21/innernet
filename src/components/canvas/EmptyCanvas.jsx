import { MousePointer2, Plus } from 'lucide-react'
import { chatSuggestions } from '../../data/mockChats'

const noteTones = {
  pink: { bg: 'bg-[#fdecef]', dot: 'bg-error' },
  blue: { bg: 'bg-[#eaf1fd]', dot: 'bg-blue' },
  gray: { bg: 'bg-gray-100', dot: 'bg-gray-500' },
  green: { bg: 'bg-[#e9f8ef]', dot: 'bg-success' },
}

// Short rays around the illustration, as [rotation, distance] pairs.
const rays = [
  [-125, 92],
  [-150, 104],
  [-35, 100],
  [25, 104],
  [45, 92],
  [140, 96],
]

function Illustration() {
  return (
    <div aria-hidden="true" className="relative mx-auto size-56">
      {rays.map(([deg, dist]) => (
        <span
          key={deg}
          style={{ transform: `rotate(${deg}deg) translateX(${dist}px)` }}
          className="absolute top-1/2 left-1/2 -mt-px h-0.5 w-5 origin-left rounded-full bg-indigo/60"
        />
      ))}
      <span className="absolute inset-12 rounded-full bg-indigo/8" />
      <span className="absolute inset-[4.25rem] flex items-center justify-center rounded-full bg-indigo/12 shadow-glow">
        <span className="flex size-9 items-center justify-center rounded-full bg-indigo text-white shadow-medium">
          <Plus className="size-5" strokeWidth={2.5} />
        </span>
      </span>
      <MousePointer2 className="absolute top-[54%] left-[56%] size-12 fill-white stroke-gray-900 drop-shadow" strokeWidth={1.5} />
    </div>
  )
}

// First-run state. The overlay ignores clicks so the canvas underneath stays
// clickable everywhere; only the starter notes are interactive.
export default function EmptyCanvas({ onSuggestion }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {chatSuggestions.map(({ id, prompt, emoji, tone, placement }) => (
        <button
          key={id}
          type="button"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            onSuggestion(prompt, { x: rect.left, y: rect.top })
          }}
          className={`pointer-events-auto absolute w-52 rounded-lg p-5 text-left shadow-medium transition-[transform,box-shadow] duration-200 ease-soft hover:-translate-y-1 hover:shadow-large focus-ring animate-pop-in ${noteTones[tone].bg} ${placement}`}
        >
          <span aria-hidden="true" className={`mb-2 block size-2.5 rounded-full ${noteTones[tone].dot}`} />
          <span className="text-body-l text-gray-900">
            {prompt} <span aria-hidden="true">{emoji}</span>
          </span>
        </button>
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-16 text-center">
        <Illustration />
        <h2 className="mt-2 text-heading-3 text-gray-900">Click anywhere to start a new chat</h2>
        <p className="mt-2 max-w-sm text-body-l text-gray-500">
          Ask anything, brainstorm ideas, plan, research — and place it anywhere on your canvas.
        </p>
      </div>
    </div>
  )
}
