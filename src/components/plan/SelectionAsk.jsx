import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Sparkles } from 'lucide-react'
import { useCanvas } from '../../store/canvasStore'

const MIN = 2
const MAX = 80
const QUICK = ['Explain this', 'What do friends say?']

// What's selected inside a node or the document, and where it is on screen.
function readSelection() {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || !selection.rangeCount) return null
  const text = selection.toString().replace(/\s+/g, ' ').trim()
  if (text.length < MIN || text.length > MAX) return null
  const hostOf = (node) => (node?.nodeType === 3 ? node.parentElement : node)?.closest?.('[data-lookup-node]')
  const host = hostOf(selection.anchorNode)
  // Both ends in the same node: a selection that spans nodes isn't one phrase.
  if (!host || host !== hostOf(selection.focusNode)) return null
  const rect = selection.getRangeAt(0).getBoundingClientRect()
  if (!rect.width && !rect.height) return null
  return { text, planId: host.dataset.lookupPlan, nodeId: host.dataset.lookupNode, x: rect.left + rect.width / 2, y: rect.top }
}

// Select any text in a node or the itinerary and an "Ask your agent" button
// appears beside it. It opens a small box to ask anything about the text
// (or just "Explain this"); the answer is a temporary node under what you were
// reading, which you keep or discard.
export default function SelectionAsk() {
  const { askAboutText } = useCanvas()
  const [target, setTarget] = useState(null)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const boxRef = useRef(null)
  const inputRef = useRef(null)
  const openRef = useRef(false)

  useEffect(() => {
    openRef.current = open
    if (open) inputRef.current?.focus({ preventScroll: true })
  }, [open])

  useEffect(() => {
    const inside = (event) => boxRef.current?.contains(event.target)
    const close = () => {
      setTarget(null)
      setOpen(false)
      setText('')
    }
    // Read after the pointer or key is released, when the selection is final.
    const update = (event) => {
      if (inside(event) || openRef.current) return
      requestAnimationFrame(() => setTarget(readSelection()))
    }
    // Clicking away (or losing the selection) closes it, unless you're typing in the box.
    const onChange = () => !openRef.current && !window.getSelection()?.toString().trim() && setTarget(null)
    const onDown = (event) => openRef.current && !inside(event) && close()
    const onKey = (event) => event.key === 'Escape' && openRef.current && close()
    const onScroll = (event) => !inside(event) && !openRef.current && setTarget(null)
    document.addEventListener('pointerup', update)
    document.addEventListener('keyup', update)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    document.addEventListener('selectionchange', onChange)
    document.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerup', update)
      document.removeEventListener('keyup', update)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('selectionchange', onChange)
      document.removeEventListener('scroll', onScroll, true)
    }
  }, [])

  if (!target) return null
  const submit = (query) => {
    askAboutText(target.planId, target.nodeId, target.text, query)
    window.getSelection()?.removeAllRanges()
    setTarget(null)
    setOpen(false)
    setText('')
  }
  const x = Math.min(Math.max(target.x, open ? 160 : 90), window.innerWidth - (open ? 160 : 90))
  const above = target.y > (open ? 150 : 56)
  const style = { left: x, top: above ? target.y - 8 : target.y + 28, transform: above ? 'translate(-50%, -100%)' : 'translateX(-50%)' }

  return (
    <div ref={boxRef} style={style} className="fixed z-50 animate-pop-in">
      {open ? (
        <div role="dialog" aria-label={`Ask your agent about ${target.text}`} className="w-80 surface rounded-xl p-3 shadow-large">
          <p className="truncate px-1 pb-2 text-caption text-gray-500">
            About <span className="font-medium text-gray-800">“{target.text}”</span>
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (text.trim()) submit(text)
            }}
            className="flex items-center gap-1 rounded-full border border-gray-200 bg-white py-1 pr-1 pl-3 transition-[border-color,box-shadow] focus-within:border-indigo focus-within:shadow-focus"
          >
            <input
              ref={inputRef}
              value={text}
              maxLength={140}
              onChange={(event) => setText(event.target.value)}
              aria-label="Ask your agent anything about this"
              placeholder="Ask anything about this…"
              // 16px on phones stops iOS Safari from zooming the page on focus.
              className="min-w-0 flex-1 bg-transparent text-body-s text-gray-900 placeholder:text-gray-400 focus:outline-none max-md:text-body-l"
            />
            <button type="submit" disabled={!text.trim()} aria-label="Ask" className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo text-white transition-colors hover:bg-indigo-hover focus-ring disabled:bg-gray-200 disabled:text-gray-400">
              <ArrowUp className="size-3.5" />
            </button>
          </form>
          <ul className="mt-2 flex flex-wrap gap-1">
            {QUICK.map((quick) => (
              <li key={quick}>
                <button type="button" onClick={() => submit(quick === QUICK[0] ? '' : quick)} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-caption text-gray-600 transition-colors hover:bg-indigo-soft hover:text-indigo focus-ring">
                  {quick}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <button
          type="button"
          // Keep the selection while the button is pressed.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-body-s font-medium whitespace-nowrap text-white shadow-large focus-ring"
        >
          <Sparkles className="size-3.5" aria-hidden="true" />
          Ask your agent
        </button>
      )}
    </div>
  )
}
