import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Paperclip } from 'lucide-react'
import AttachmentList from './AttachmentList'
import { ACCEPTED_FILES, toAttachment, validateFiles } from '../../lib/attachments'

// Auto-growing prompt field with file attachments. Enter sends, Shift+Enter
// adds a line. Files can be picked, dropped onto the field, or pasted.
export default function ChatInput({ onSubmit, onCancel, disabled, autoFocus, initialValue = '', placeholder, label }) {
  const [value, setValue] = useState(initialValue)
  const [attachments, setAttachments] = useState([])
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fieldRef = useRef(null)
  const fileRef = useRef(null)

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

  const canSend = (value.trim().length > 0 || attachments.length > 0) && !disabled

  const addFiles = async (fileList) => {
    const { accepted, error: reason } = validateFiles([...fileList], attachments.length)
    setError(reason)
    if (!accepted.length) return
    const added = await Promise.all(accepted.map(toAttachment))
    setAttachments((current) => [...current, ...added])
  }

  const removeAttachment = (id) => {
    setAttachments((current) => current.filter((a) => a.id !== id))
    setError(null)
  }

  const submit = () => {
    if (!canSend) return
    onSubmit(value, attachments)
    setValue('')
    setAttachments([])
    setError(null)
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    } else if (event.key === 'Escape') {
      onCancel?.()
    }
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    if (!disabled && event.dataTransfer.files.length) addFiles(event.dataTransfer.files)
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes('Files')) return
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(event) => !event.currentTarget.contains(event.relatedTarget) && setDragging(false)}
      onDrop={onDrop}
      className={`nodrag nowheel flex cursor-auto flex-col gap-2 rounded-lg border bg-white p-1.5 transition-[border-color,box-shadow] focus-within:border-indigo focus-within:shadow-focus ${
        dragging ? 'border-indigo shadow-focus' : 'border-gray-200'
      }`}
    >
      {attachments.length > 0 && (
        <div className="max-h-40 overflow-y-auto px-1 pt-1">
          <AttachmentList attachments={attachments} onRemove={removeAttachment} compact />
        </div>
      )}

      <div className="flex items-end gap-1">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          aria-label="Attach files"
          title="Attach images, PDFs and documents"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-ring disabled:opacity-40"
        >
          <Paperclip className="size-4" />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={ACCEPTED_FILES}
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ''
          }}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          onPaste={(event) => event.clipboardData.files.length > 0 && addFiles(event.clipboardData.files)}
          ref={fieldRef}
          rows={1}
          aria-label={label}
          placeholder={dragging ? 'Drop files to attach' : placeholder}
          className="max-h-32 min-h-7 flex-1 resize-none bg-transparent px-1 py-1 text-body-m text-gray-900 field-sizing-content placeholder:text-gray-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo text-white transition-colors hover:bg-indigo-hover focus-ring disabled:bg-gray-200 disabled:text-gray-400"
        >
          <ArrowUp className="size-4" />
        </button>
      </div>

      {error && (
        <p role="alert" className="px-1.5 pb-0.5 text-caption text-error">
          {error}
        </p>
      )}
    </form>
  )
}
