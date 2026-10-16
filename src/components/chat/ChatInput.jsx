import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'

// Auto-growing prompt field. Enter sends, Shift+Enter adds a line.
export default function ChatInput({ onSubmit, onCancel, disabled, autoFocus, initialValue = '', placeholder, label }) {
  const [value, setValue] = useState(initialValue)
  const fieldRef = useRef(null)

  // Canvas nodes stay hidden until React Flow measures them, so plain
  // `autoFocus` would fire too early. Retry for a few frames instead.
  useEffect(() => {
    if (!autoFocus) return
    let frame
    let tries = 0
    const focus = () => {
      const field = fieldRef.current
      field?.focus({ preventScroll: true })
      if (field && document.activeElement !== field && tries++ < 20) frame = requestAnimationFrame(focus)
    }
    focus()
    return () => cancelAnimationFrame(frame)
  }, [autoFocus])
  const canSend = value.trim().length > 0 && !disabled

  const submit = () => {
    if (!canSend) return
    onSubmit(value)
    setValue('')
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    } else if (event.key === 'Escape') {
      onCancel?.()
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="nodrag nowheel flex cursor-auto items-end gap-2 rounded-lg border border-gray-200 bg-white py-1.5 pr-1.5 pl-3 transition-[border-color,box-shadow] focus-within:border-indigo focus-within:shadow-focus"
    >
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        ref={fieldRef}
        rows={1}
        aria-label={label}
        placeholder={placeholder}
        className="max-h-32 min-h-7 flex-1 resize-none bg-transparent py-1 text-body-m text-gray-900 [field-sizing:content] placeholder:text-gray-400 focus:outline-none"
      />
      <button type="submit" disabled={!canSend} aria-label="Send" className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo text-white transition-colors hover:bg-indigo-hover focus-ring disabled:bg-gray-200 disabled:text-gray-400">
        <ArrowUp className="size-4" />
      </button>
    </form>
  )
}
