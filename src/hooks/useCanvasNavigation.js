import { useReactFlow, useStoreApi } from '@xyflow/react'
import { useCanvas } from '../store/canvasStore'
import { isMobileViewport } from './useMediaQuery'
import { FRAME } from './usePlanFocus'
import { visibleNodes } from '../lib/trip/planModel'

// Approximate composer footprint, used to centre it and keep it off other cards.
const COMPOSER_SIZE = { width: 320, height: 150 }
const GAP = 24

const overlaps = (spot, rect) =>
  spot.x < rect.x + rect.width && spot.x + COMPOSER_SIZE.width > rect.x && spot.y < rect.y + rect.height && spot.y + COMPOSER_SIZE.height > rect.y

// Viewport moves shared by the sidebar, search and the mobile shell.
export default function useCanvasNavigation() {
  const { openComposer, plans } = useCanvas()
  const { fitView, getViewport, setViewport, getNodes } = useReactFlow()
  const flowStore = useStoreApi()

  // Phones need tight padding, or the card zooms out to a thumbnail.
  const focusChat = (id) => {
    fitView({ nodes: [{ id }], duration: 500, maxZoom: 1, padding: isMobileViewport() ? 0.08 : 0.6 })
  }

  // Fly to a trip: its collapsed node, or the whole tree, clear of the floating bars.
  const focusPlan = (id) => {
    const plan = plans.find((p) => p.id === id)
    if (!plan) return
    const nodes = plan.collapsed ? [{ id: `${plan.id}/summary` }] : visibleNodes(plan).map((n) => ({ id: n.id }))
    fitView({ nodes, duration: 500, minZoom: 0.3, maxZoom: 1, padding: isMobileViewport() ? 0.08 : FRAME })
  }

  // Moves a spot down past any chat card it would land on.
  const findFreeSpot = (start) => {
    const rects = getNodes()
      .filter((node) => node.type === 'chat')
      .map((node) => ({ ...node.position, width: node.measured?.width ?? 320, height: node.measured?.height ?? 200 }))
    let spot = start
    for (let i = 0; i < rects.length; i++) {
      const hit = rects.find((rect) => overlaps(spot, rect))
      if (!hit) break
      spot = { x: spot.x, y: hit.y + hit.height + GAP }
    }
    return spot
  }

  // Secondary entry point: open the composer in the visible part of the canvas,
  // in free space. On phones it sits high so the keyboard doesn't cover it.
  const openComposerAtCenter = () => {
    const { width, height } = flowStore.getState()
    const { x, y, zoom } = getViewport()
    const top = isMobileViewport() ? height * 0.12 : height / 2 - 80
    const start = { x: (width / 2 - x) / zoom - COMPOSER_SIZE.width / 2, y: (top - y) / zoom }
    const spot = findFreeSpot(start)
    // Bring a spot that was pushed below other cards back into view.
    if (spot.y !== start.y) setViewport({ x, y: top - spot.y * zoom, zoom }, { duration: 300 })
    openComposer(spot)
  }

  return { focusChat, focusPlan, openComposerAtCenter }
}
