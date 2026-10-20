import { useEffect, useRef } from 'react'
import { useReactFlow } from '@xyflow/react'
import { visibleNodes } from '../lib/trip/planModel'

// Room to leave around nodes so they sit clear of the floating bars: the top
// bar above and the picks bar below.
export const FRAME = { top: '96px', bottom: '300px', left: '48px', right: '48px' }

// Keeps the part of a trip you just changed in view: a new trip flies into view
// as a whole, a choice that grows new nodes eases over to them (and the node
// they grew from), and collapsing or expanding a trip frames its new shape.
// Positions are measured a moment later, so this waits.
export default function usePlanFocus(plans) {
  const { fitView } = useReactFlow()
  const known = useRef(null)
  // Trips still being built for the first time: once the agent has finished
  // thinking about every node, frame the whole finished tree once.
  const building = useRef(new Set())

  useEffect(() => {
    // Only what's on screen counts: branches appear as the agent finishes thinking.
    const snapshot = new Map(
      plans.map((plan) => [plan.id, { ids: new Set(visibleNodes(plan).map((n) => n.id)), collapsed: plan.collapsed, thinking: plan.nodes.some((n) => n.status === 'thinking') }]),
    )
    // First run (page load): remember what's there, don't move the view.
    if (!known.current) {
      known.current = snapshot
      return
    }
    let target = null
    plans.forEach((plan) => {
      const before = known.current.get(plan.id)
      const shown = visibleNodes(plan)
      if (!before) {
        building.current.add(plan.id)
        target = shown.map((n) => ({ id: n.id }))
      } else if (building.current.has(plan.id) && before.thinking && !snapshot.get(plan.id).thinking) {
        building.current.delete(plan.id)
        target = shown.map((n) => ({ id: n.id }))
      } else if (before.collapsed !== plan.collapsed) {
        target = plan.collapsed ? [{ id: `${plan.id}/summary` }] : shown.map((n) => ({ id: n.id }))
      } else if (!plan.collapsed) {
        const added = shown.filter((n) => !before.ids.has(n.id))
        if (added.length) target = [...new Set([...added.map((n) => n.parentId), ...added.map((n) => n.id)])].map((id) => ({ id }))
      }
    })
    known.current = snapshot
    if (!target) return
    // Not cancelled by later updates (say, an activity message), or the move would be lost.
    setTimeout(() => fitView({ nodes: target, duration: 600, padding: FRAME, minZoom: 0.3, maxZoom: 1 }), 150)
  }, [plans, fitView])
}
