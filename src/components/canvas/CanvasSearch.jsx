import { useState } from 'react'
import { Search } from 'lucide-react'
import AgentMascot from '../agent/AgentMascot'
import { useCanvas } from '../../store/canvasStore'
import useCanvasNavigation from '../../hooks/useCanvasNavigation'
import { getTone } from '../../lib/chatTones'

// Finds chats on the canvas and flies the viewport to the chosen one.
export default function CanvasSearch({ autoFocus = false, onSelect, placeholder = 'Search across your canvas, chats, people…' }) {
  const { chats } = useCanvas()
  const { focusChat: flyToChat } = useCanvasNavigation()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const q = query.trim().toLowerCase()
  const results = q
    ? chats.filter((chat) => chat.title.toLowerCase().includes(q) || chat.messages.some((m) => m.content.toLowerCase().includes(q))).slice(0, 6)
    : []

  const focusChat = (id) => {
    onSelect?.()
    flyToChat(id)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="relative w-full max-w-120">
      <label className="input h-11 rounded-full bg-white/90 px-4 shadow-subtle backdrop-blur">
        <Search className="size-4 shrink-0 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && results[0]) focusChat(results[0].id)
            if (event.key === 'Escape') setOpen(false)
          }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-label="Search canvas"
          className="min-w-0 flex-1 bg-transparent text-body-m placeholder:text-gray-400 focus:outline-none max-md:text-body-l"
        />
      </label>
      {open && q && (
        <ul className="absolute top-full right-0 left-0 mt-2 surface p-1.5 shadow-medium animate-pop-in">
          {results.length === 0 ? (
            <li className="px-3 py-2.5 text-body-m text-gray-500">No chats match “{query.trim()}”</li>
          ) : (
            results.map((chat) => (
              <li key={chat.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => focusChat(chat.id)}
                  className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left hover:bg-gray-100 focus-ring"
                >
                  <span className={`inline-flex size-8 items-center justify-center rounded-full ${getTone(chat.tone).soft}`}>
                    <AgentMascot tone={chat.tone} className="size-5" />
                  </span>
                  <span className="truncate text-body-m font-medium text-gray-900">{chat.title}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
