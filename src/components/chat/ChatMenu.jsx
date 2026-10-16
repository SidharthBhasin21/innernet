import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, Trash2 } from 'lucide-react'

export default function ChatMenu({ onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="nodrag relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat options"
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-ring"
      >
        <MoreHorizontal className="size-5" />
      </button>
      {open && (
        <div role="menu" className="absolute top-full right-0 z-10 mt-1 w-40 surface p-1 shadow-medium animate-pop-in">
          <button
            type="button"
            role="menuitem"
            onClick={onDelete}
            className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-body-m text-error hover:bg-gray-100 focus-ring"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete chat
          </button>
        </div>
      )}
    </div>
  )
}
