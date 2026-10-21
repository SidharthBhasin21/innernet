import { useEffect, useRef } from 'react'
import { useReactFlow } from '@xyflow/react'

const distance = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
const midpoint = (a, b) => ({ x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 })

// React Flow ignores gestures that start on a card (cards are `nopan` so
// dragging one doesn't move the canvas). On a phone a card can fill most of the
// screen, so two-finger gestures starting on a card are handled here: pinch
// zooms around the point between the fingers, and moving both fingers pans.
// Gestures on empty canvas are still React Flow's own.
export default function useCardPinch(containerRef, { minZoom, maxZoom, onEnd }) {
  const { getViewport, setViewport } = useReactFlow()
  // Latest callback without re-attaching listeners (which would drop a pinch in progress).
  const onEndRef = useRef(onEnd)
  useEffect(() => {
    onEndRef.current = onEnd
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let start = null

    const onTouchStart = (event) => {
      if (event.touches.length !== 2 || !event.target.closest('.react-flow__node')) return
      const [a, b] = event.touches
      const bounds = container.getBoundingClientRect()
      start = { distance: distance(a, b) || 1, mid: midpoint(a, b), viewport: getViewport(), bounds }
    }

    const onTouchMove = (event) => {
      if (!start || event.touches.length !== 2) return
      // Keep the browser from zooming the page or scrolling the card meanwhile.
      event.preventDefault()
      const [a, b] = event.touches
      const mid = midpoint(a, b)
      const { viewport, bounds } = start
      const zoom = Math.min(maxZoom, Math.max(minZoom, viewport.zoom * (distance(a, b) / start.distance)))
      // The canvas point that was under the fingers stays under them.
      const flowX = (start.mid.x - bounds.left - viewport.x) / viewport.zoom
      const flowY = (start.mid.y - bounds.top - viewport.y) / viewport.zoom
      setViewport({ x: mid.x - bounds.left - flowX * zoom, y: mid.y - bounds.top - flowY * zoom, zoom })
    }

    const onTouchEnd = (event) => {
      if (!start || event.touches.length === 2) return
      start = null
      onEndRef.current?.(getViewport())
    }

    // Capture phase: a card's drag handler (its header) stops touch events
    // from bubbling, and the canvas needs to see both fingers first.
    container.addEventListener('touchstart', onTouchStart, { capture: true, passive: true })
    container.addEventListener('touchmove', onTouchMove, { capture: true, passive: false })
    container.addEventListener('touchend', onTouchEnd, { capture: true })
    container.addEventListener('touchcancel', onTouchEnd, { capture: true })
    return () => {
      container.removeEventListener('touchstart', onTouchStart, { capture: true })
      container.removeEventListener('touchmove', onTouchMove, { capture: true })
      container.removeEventListener('touchend', onTouchEnd, { capture: true })
      container.removeEventListener('touchcancel', onTouchEnd, { capture: true })
    }
  }, [containerRef, getViewport, setViewport, minZoom, maxZoom])
}
