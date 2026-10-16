import { useEffect, useRef, useState } from 'react'
import { Settings } from 'lucide-react'
import ThemePicker from '../ui/ThemePicker'

// Settings popover. Opens upward and spans the nearest positioned ancestor
// (the sidebar's account row), so it never runs off the edge of the screen.
export default function SettingsMenu() {
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
    <div ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`rounded-full p-2 text-gray-500 hover:bg-gray-100 focus-ring ${open ? 'bg-gray-100 text-gray-900' : ''}`}
      >
        <Settings className="size-5" />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Settings"
          className="absolute inset-x-3 bottom-full z-20 mb-2 surface p-2 shadow-large animate-pop-in"
        >
          <p className="px-2.5 pt-1 pb-2 text-caption font-semibold tracking-wide text-gray-400 uppercase">Theme</p>
          <ThemePicker />
        </div>
      )}
    </div>
  )
}
