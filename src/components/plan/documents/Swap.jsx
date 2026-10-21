import { useState } from 'react'
import { ArrowLeftRight, RotateCcw } from 'lucide-react'
import Avatar from '../../ui/Avatar'
import { getUser } from '../../../data/mockUsers'

// "Swapped" tag for a part of the document the user changed.
export function SwappedTag({ item }) {
  if (!item.swapped) return null
  return <span className="ml-2 rounded-full bg-(--tone-purple-soft) px-2 py-0.5 align-middle text-caption font-medium text-purple">Swapped</span>
}

// "Swap" on one part of a drafted document: lists what else your agent could
// put there (friends' favourites first), and choosing one replaces it. A swapped
// part can always go back to what the agent first drafted.
export default function SwapControl({ item, onSwap }) {
  const [open, setOpen] = useState(false)
  if (!item.key || !item.alternatives?.length) return null

  const choose = (alt) => {
    onSwap(item.key, alt.original ? null : alt)
    setOpen(false)
  }

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Swap ${item.text}`}
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium text-gray-500 transition-colors hover:bg-indigo-soft hover:text-indigo focus-ring"
      >
        <ArrowLeftRight className="size-3" aria-hidden="true" />
        Swap
      </button>
      {open && (
        <ul aria-label={`Instead of ${item.text}`} className="mt-1.5 flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-1.5 shadow-small animate-pop-in">
          {item.alternatives.map((alt) => {
            const friend = alt.by ? getUser(alt.by) : null
            return (
              <li key={alt.label}>
                <button type="button" onClick={() => choose(alt)} className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-gray-100 focus-ring">
                  {alt.original ? <RotateCcw className="mt-0.5 size-3.5 shrink-0 text-gray-400" aria-hidden="true" /> : friend ? <Avatar user={friend} size="xs" /> : <span className="mt-1 ml-0.5 size-3 shrink-0 rounded-full border border-gray-300" aria-hidden="true" />}
                  <span className="min-w-0">
                    <span className="block text-body-s font-medium text-gray-900">
                      {alt.original ? `Back to ${alt.label}` : alt.label}
                    </span>
                    {alt.detail && <span className="block text-caption text-gray-500">{alt.detail}{friend && alt.quote ? ` · ${friend.name.split(' ')[0]}: “${alt.quote}”` : ''}</span>}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
