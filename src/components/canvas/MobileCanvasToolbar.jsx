import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import ToolButton from './ToolButton'
import { canvasTools as tools } from '../../lib/canvasTools'

const STATE_KEY = 'innernet:mobile-toolbar'
// Movement past this many pixels turns a tap on the bubble into a drag.
const DRAG_THRESHOLD = 6
// Swiping the bubble up this far pulls the toolbar open.
const PULL_DISTANCE = 48
// How long after a gesture ends to wait for the click that may follow it.
const CLICK_GRACE_MS = 300
// The bubble is as tall as the toolbar so the two morph into each other.
const SHELL_HEIGHT = 58
const EDGE_GUTTER = 16
// iOS-style deceleration: quick start, long soft settle.
const MORPH = '440ms cubic-bezier(0.32, 0.72, 0, 1)'

const readState = () => {
  try {
    return { collapsed: false, side: 'right', ...JSON.parse(localStorage.getItem(STATE_KEY)) }
  } catch {
    return { collapsed: false, side: 'right' }
  }
}

const saveState = (state) => {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    // Persistence is best-effort in the prototype.
  }
}

// Phone toolbar: the full tool pill, or a bubble docked to the bottom-left or
// bottom-right corner. One shell morphs between the two; drag the bubble to
// switch sides, tap or pull it up to open.
export default function MobileCanvasToolbar({ tool, onToolChange }) {
  const [state, setState] = useState(readState)
  const [drag, setDrag] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [animated, setAnimated] = useState(false)
  const shellRef = useRef(null)
  const rowRef = useRef(null)
  const bubbleRef = useRef(null)
  const start = useRef(null)
  const gestureEnd = useRef(null)
  const moveFocus = useRef(false)
  const { collapsed, side } = state

  const update = (patch) =>
    setState((prev) => {
      const next = { ...prev, ...patch }
      saveState(next)
      return next
    })

  const setCollapsed = (value) => {
    // Keep keyboard focus with the toolbar as its controls swap.
    moveFocus.current = shellRef.current?.contains(document.activeElement) ?? false
    update({ collapsed: value })
  }

  // The shell's geometry depends on the canvas width and the tools' natural width.
  useLayoutEffect(() => {
    const shell = shellRef.current
    const measure = () =>
      setMetrics({ parentWidth: shell.parentElement.clientWidth, pillWidth: rowRef.current.offsetWidth + 2 })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(shell.parentElement)
    observer.observe(rowRef.current)
    return () => observer.disconnect()
  }, [])

  // Only animate once the first position has painted, so a restored state doesn't fly in.
  useEffect(() => {
    if (!metrics || animated) return
    const frame = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(frame)
  }, [metrics, animated])

  useEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    const target = collapsed ? bubbleRef.current : rowRef.current.querySelector('[aria-pressed="true"]')
    target?.focus({ preventScroll: true })
  }, [collapsed])

  const activeTool = tools.find((t) => t.id === tool) ?? tools[0]
  const ActiveIcon = activeTool.icon

  const geometry = (() => {
    if (!metrics) return { left: 0, width: SHELL_HEIGHT }
    const { parentWidth, pillWidth } = metrics
    if (!collapsed) return { left: (parentWidth - pillWidth) / 2, width: pillWidth }
    return { left: side === 'left' ? EDGE_GUTTER : parentWidth - EDGE_GUTTER - SHELL_HEIGHT, width: SHELL_HEIGHT }
  })()

  // Collapsing: tools fade first, then the icon appears as the shell lands.
  // Opening: the icon fades first, then the tools appear as the shell widens.
  const fade = (visible, delay) => `opacity 220ms ease ${visible ? delay : 0}ms, scale 320ms cubic-bezier(0.32, 0.72, 0, 1) ${visible ? delay : 0}ms`

  const shellTransition = animated
    ? [`left ${MORPH}`, `width ${MORPH}`, drag ? null : `translate ${MORPH}`, 'scale 200ms ease'].filter(Boolean).join(', ')
    : 'none'

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    start.current = { x: event.clientX, y: event.clientY, moved: false }
  }

  const onPointerMove = (event) => {
    if (!start.current) return
    const dx = event.clientX - start.current.x
    const dy = event.clientY - start.current.y
    if (!start.current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    start.current.moved = true
    // Stay on the bottom edge: free horizontally, only a short upward pull.
    setDrag({ dx, dy: Math.max(-PULL_DISTANCE * 1.5, Math.min(0, dy)) })
  }

  // Opening waits for the tap's click so it can't fall through to the canvas
  // underneath, which would open a chat composer.
  const settle = (outcome) => {
    gestureEnd.current = outcome
    setTimeout(() => {
      if (gestureEnd.current !== outcome) return
      gestureEnd.current = null
      if (outcome === 'pull') setCollapsed(false)
    }, CLICK_GRACE_MS)
  }

  const onPointerUp = (event) => {
    const gesture = start.current
    start.current = null
    setDrag(null)
    // A plain tap opens through onClick.
    if (!gesture?.moved) return
    if (event.clientY - gesture.y < -PULL_DISTANCE) return settle('pull')
    const bounds = shellRef.current.parentElement.getBoundingClientRect()
    update({ side: event.clientX - bounds.left < bounds.width / 2 ? 'left' : 'right' })
    settle('drag')
  }

  const onPointerCancel = () => {
    start.current = null
    setDrag(null)
  }

  const onClick = () => {
    const outcome = gestureEnd.current
    gestureEnd.current = null
    // The click a sideways drag can leave behind shouldn't open the toolbar.
    if (outcome === 'drag') return
    setCollapsed(false)
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') update({ side: 'left' })
    if (event.key === 'ArrowRight') update({ side: 'right' })
  }

  return (
    <div
      ref={shellRef}
      style={{
        left: geometry.left,
        width: geometry.width,
        height: SHELL_HEIGHT,
        translate: drag ? `${drag.dx}px ${drag.dy}px` : '0 0',
        scale: drag ? '1.05' : '1',
        transition: shellTransition,
        visibility: metrics ? 'visible' : 'hidden',
      }}
      className="absolute bottom-10 z-10 overflow-hidden rounded-full border border-gray-200 bg-white/90 shadow-medium backdrop-blur will-change-[left,width] [&_:focus-visible]:outline-offset-[-3px]"
    >
      <div
        ref={rowRef}
        role="toolbar"
        aria-label="Canvas tools"
        inert={collapsed}
        style={{ opacity: collapsed ? 0 : 1, scale: collapsed ? '0.9' : '1', transition: animated ? fade(!collapsed, 140) : 'none' }}
        className="absolute inset-y-0 left-1/2 flex w-max -translate-x-1/2 items-center gap-2 p-1.5"
      >
        {tools.map((t) => (
          <ToolButton key={t.id} tool={t} active={tool === t.id} onSelect={onToolChange} className="size-11 rounded-full" />
        ))}
        <span className="h-6 w-px bg-gray-200" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse canvas tools"
          title="Collapse"
          className="inline-flex size-11 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 focus-ring"
        >
          <ChevronDown className="size-5" aria-hidden="true" />
        </button>
      </div>

      <button
        ref={bubbleRef}
        type="button"
        inert={!collapsed}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={onClick}
        onKeyDown={onKeyDown}
        aria-label={`Open canvas tools (current: ${activeTool.label.split(' — ')[0]}). Use arrow keys to move to the left or right.`}
        title="Canvas tools"
        style={{
          opacity: collapsed ? 1 : 0,
          scale: collapsed ? '1' : '0.6',
          transition: animated ? fade(collapsed, 200) : 'none',
          pointerEvents: collapsed ? 'auto' : 'none',
        }}
        className={`absolute inset-0 flex touch-none items-center justify-center rounded-full text-indigo select-none focus-ring ${
          drag ? 'cursor-grabbing' : ''
        }`}
      >
        <ActiveIcon className="size-5" aria-hidden="true" />
      </button>
    </div>
  )
}
