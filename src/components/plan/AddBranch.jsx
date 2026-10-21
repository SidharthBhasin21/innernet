import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Plus } from 'lucide-react'

const STARTERS = ['What about shopping?', 'Any good nightlife?', 'Rainy-day plans?']

// "Add a branch": type any question and a new node grows from this one. A few
// starters show what kinds of things the agent can answer.
export default function AddBranch({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  // preventScroll: focusing must not scroll the app shell to reveal the field.
  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true })
  }, [open])

  const submit = (value) => {
    const prompt = value.trim()
    if (!prompt) return
    onAdd(prompt)
    setText('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="nodrag mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-gray-300 px-3 py-1 text-body-s font-medium text-gray-500 transition-colors hover:border-indigo hover:text-indigo focus-ring">
        <Plus className="size-3.5" aria-hidden="true" />
        Add a branch
      </button>
    )
  }
  return (
    <div className="nodrag nopan mt-3 cursor-auto">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          submit(text)
        }}
        className="flex items-center gap-1 rounded-full border border-gray-200 bg-white py-1 pr-1 pl-3 transition-[border-color,box-shadow] focus-within:border-indigo focus-within:shadow-focus"
      >
        <input
          ref={inputRef}
          value={text}
          maxLength={140}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
          aria-label="Ask your agent to add a branch from here"
          placeholder="Ask anything from here…"
          // 16px on phones stops iOS Safari from zooming the page on focus.
          className="min-w-0 flex-1 bg-transparent text-body-s text-gray-900 placeholder:text-gray-400 focus:outline-none max-md:text-body-l"
        />
        <button type="submit" disabled={!text.trim()} aria-label="Add branch" className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo text-white transition-colors hover:bg-indigo-hover focus-ring disabled:bg-gray-200 disabled:text-gray-400">
          <ArrowUp className="size-3.5" />
        </button>
      </form>
      <ul className="mt-1.5 flex flex-wrap gap-1">
        {STARTERS.map((starter) => (
          <li key={starter}>
            <button type="button" onClick={() => submit(starter)} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-caption text-gray-600 transition-colors hover:bg-indigo-soft hover:text-indigo focus-ring">
              {starter}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
