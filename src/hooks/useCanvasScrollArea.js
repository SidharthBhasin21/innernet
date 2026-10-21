import { useEffect } from 'react'

const canScroll = (el) => el.scrollHeight > el.clientHeight + 1

// Makes a scrollable area inside a canvas card share gestures with the canvas:
// - Trackpad two-finger scroll / mouse wheel scrolls the card's content, if it
//   has any to scroll; otherwise it pans the canvas as usual.
// - Trackpad pinch (a wheel event with ctrlKey) always zooms the canvas.
// - Touch: one finger scrolls the content; a second finger turns it into a
//   canvas pinch or two-finger pan.
// The canvas listens natively on an ancestor, so events are stopped natively
// here, before they bubble up to it (React's synthetic events fire too late).
export default function useCanvasScrollArea(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onWheel = (event) => {
      if (!event.ctrlKey && canScroll(el)) event.stopPropagation()
    }
    const onTouchStart = (event) => {
      if (event.touches.length < 2 && canScroll(el)) event.stopPropagation()
    }
    el.addEventListener('wheel', onWheel, { passive: true })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
    }
  }, [ref])
}
