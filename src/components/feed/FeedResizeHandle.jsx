// Drag (or use arrow keys) on the feed's left edge to change its width.
export default function FeedResizeHandle({ width, min, max, onResize }) {
  const onPointerDown = (e) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = width
    const move = (ev) => onResize(startWidth + (startX - ev.clientX))
    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') onResize(width + 16)
    if (e.key === 'ArrowRight') onResize(width - 16)
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize feed"
      aria-valuenow={width}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className="group absolute inset-y-0 left-0 z-10 w-2 -translate-x-1/2 cursor-col-resize focus-visible:outline-none"
    >
      <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-transparent transition-colors group-hover:bg-indigo/40 group-focus-visible:bg-indigo group-active:bg-indigo" />
    </div>
  )
}
