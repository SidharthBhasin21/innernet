import { useRef, useState } from 'react'
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  useConnection,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import ChatNode from '../chat/ChatNode'
import ItineraryDocument from '../plan/ItineraryDocument'
import PlanNode from '../plan/PlanNode'
import PlanSummaryNode from '../plan/PlanSummaryNode'
import PlanTray from '../plan/PlanTray'
import SelectionAsk from '../plan/SelectionAsk'
import ComposerNode, { COMPOSER_ID } from './ComposerNode'
import CanvasTopBar from './CanvasTopBar'
import CanvasToolbar from './CanvasToolbar'
import MobileCanvasToolbar from './MobileCanvasToolbar'
import EmptyCanvas from './EmptyCanvas'
import { useCanvas } from '../../store/canvasStore'
import { getTone } from '../../lib/chatTones'
import useMediaQuery from '../../hooks/useMediaQuery'
import useCardPinch from '../../hooks/useCardPinch'
import usePlanFocus from '../../hooks/usePlanFocus'
import { COLLAPSED_WIDTH, edgesOf, layoutPlan, visibleNodes } from '../../lib/trip/planModel'

const nodeTypes = { chat: ChatNode, composer: ComposerNode, plan: PlanNode, planSummary: PlanSummaryNode }
// Space between one trip and the next.
const PLAN_GAP = 140
const ZERO = { x: 0, y: 0 }
const VIEWPORT_KEY = 'innernet:viewport'
// Offset so the composer's corner sits just above-left of the click point.
const COMPOSER_OFFSET = 24
const ZOOM = { min: 0.25, max: 2 }

const readViewport = () => {
  try {
    return JSON.parse(localStorage.getItem(VIEWPORT_KEY)) ?? { x: 0, y: 0, zoom: 1 }
  } catch {
    return { x: 0, y: 0, zoom: 1 }
  }
}

// The chat card under the point where a connection drag ended, if any.
const chatIdAt = (event) => {
  const { clientX, clientY } = event.changedTouches?.[0] ?? event
  const node = document.elementsFromPoint(clientX, clientY).find((el) => el.closest('.react-flow__node-chat'))
  return node?.closest('.react-flow__node-chat').dataset.id
}

const saveViewport = (_, viewport) => {
  try {
    localStorage.setItem(VIEWPORT_KEY, JSON.stringify(viewport))
  } catch {
    // Persistence is best-effort in the prototype.
  }
}

// `compact` (phones) drops the floating top bar; the mobile header takes over its controls.
export default function Canvas({ compact = false, showMinimap, onToggleMinimap, onOpenFeed }) {
  const { chats, plans, edges, composer, updateLayout, deleteChats, setEdges, openComposer, closeComposer, startChat, movePlanNodes, docPlanId } = useCanvas()
  const { screenToFlowPosition } = useReactFlow()
  const [tool, setTool] = useState('select')
  // React Flow view state (measured size, selection) that isn't part of the chat itself.
  const [nodeView, setNodeView] = useState({})
  const [defaultViewport] = useState(readViewport)
  const connecting = useConnection((connection) => connection.inProgress)
  // Fingers are less precise than a cursor, so touch drops snap from further away.
  const coarsePointer = useMediaQuery('(pointer: coarse)')
  const containerRef = useRef(null)
  useCardPinch(containerRef, { minZoom: ZOOM.min, maxZoom: ZOOM.max, onEnd: (viewport) => saveViewport(null, viewport) })
  usePlanFocus(plans, Boolean(docPlanId))

  const nodes = chats.map((chat) => ({
    id: chat.id,
    type: 'chat',
    position: chat.position,
    width: chat.size.width,
    height: chat.size.height,
    dragHandle: '.chat-drag-handle',
    selected: nodeView[chat.id]?.selected ?? false,
    measured: nodeView[chat.id]?.measured,
    data: {},
  }))
  // Trip plans sit in a row, left to right, starting where the first was begun.
  // Each is a tree (top to bottom) or, collapsed, a single node, so folding a
  // trip away gives its room back and trips never overlap. Positions come from
  // the trees, so these nodes aren't dragged; they use real measured heights.
  const heights = Object.fromEntries(Object.entries(nodeView).flatMap(([id, view]) => (view.measured?.height ? [[id, view.measured.height]] : [])))
  // Trip nodes drag by their header; they can't be selected, deleted or connected by hand.
  const fixed = {
    draggable: tool !== 'hand',
    dragHandle: '.plan-drag-handle',
    selectable: false,
    deletable: false,
    connectable: false,
    focusable: false,
    style: { pointerEvents: 'all' },
    data: {},
  }
  // For each trip node: where the layout would put it, so a drag can be turned
  // back into an offset. The trip's top node (or its collapsed node) moves the whole trip.
  const placed = {}
  const planEdges = []
  let planX = plans[0]?.position.x ?? 0
  const planY = plans[0]?.position.y ?? 0
  plans.forEach((plan) => {
    const tripOffset = plan.offset ?? ZERO
    if (plan.collapsed) {
      const id = `${plan.id}/summary`
      placed[id] = { planId: plan.id, base: { x: planX, y: planY }, wholeTrip: true }
      nodes.push({ ...fixed, id, type: 'planSummary', position: { x: planX + tripOffset.x, y: planY + tripOffset.y }, measured: nodeView[id]?.measured })
      planX += COLLAPSED_WIDTH + PLAN_GAP
      return
    }
    const layout = layoutPlan(plan, heights)
    // Shift the tree so its left edge starts at planX (it reaches left of its top node).
    const originX = planX - layout.left
    visibleNodes(plan).forEach((node) => {
      const base = { x: originX + layout.offsets[node.id].x + tripOffset.x, y: planY + layout.offsets[node.id].y + tripOffset.y }
      const own = node.offset ?? ZERO
      placed[node.id] = { planId: plan.id, base: node.parentId ? base : { x: base.x - tripOffset.x, y: base.y - tripOffset.y }, wholeTrip: !node.parentId }
      nodes.push({
        ...fixed,
        id: node.id,
        type: 'plan',
        position: node.parentId ? { x: base.x + own.x, y: base.y + own.y } : base,
        measured: nodeView[node.id]?.measured,
      })
    })
    planX += layout.right - layout.left + PLAN_GAP
    edgesOf(plan).forEach((edge) => planEdges.push({ ...edge, selectable: false, deletable: false, focusable: false }))
  })
  if (composer) {
    nodes.push({
      id: COMPOSER_ID,
      type: 'composer',
      position: composer.position,
      draggable: false,
      selectable: false,
      deletable: false,
      zIndex: 1000,
      // React Flow disables pointer events on non-selectable, non-draggable nodes.
      style: { pointerEvents: 'all' },
      measured: nodeView[COMPOSER_ID]?.measured,
      data: {},
    })
  }

  const onNodesChange = (changes) => {
    const removed = changes.filter((change) => change.type === 'remove').map((change) => change.id)
    if (removed.length) deleteChats(removed)

    const prevById = new Map(nodes.map((node) => [node.id, node]))
    const next = applyNodeChanges(changes, nodes)
    const layout = {}
    const view = {}
    const moves = []
    next.forEach((node) => {
      view[node.id] = { measured: node.measured, selected: node.selected }
      const prev = prevById.get(node.id)
      // A dragged trip node: keep how far it is from where the layout puts it.
      if (placed[node.id] && prev && node.position !== prev.position) {
        const { planId, base, wholeTrip } = placed[node.id]
        moves.push({ planId, nodeId: wholeTrip ? null : node.id, offset: { x: node.position.x - base.x, y: node.position.y - base.y } })
      }
      if (node.type !== 'chat' || !prev) return
      const patch = {}
      if (node.position !== prev.position) patch.position = node.position
      if (node.width !== prev.width || node.height !== prev.height) patch.size = { width: node.width, height: node.height }
      if (Object.keys(patch).length) layout[node.id] = patch
    })
    setNodeView(view)
    if (moves.length) movePlanNodes(moves)
    if (Object.keys(layout).length) updateLayout(layout)
  }

  const hasSelection = nodes.some((node) => node.selected)

  // Click empty canvas → composer at that spot. A click that only clears a
  // selection or dismisses the open composer doesn't create a new one.
  const onPaneClick = (event) => {
    if (tool !== 'select') return
    if (composer) return closeComposer()
    if (hasSelection) return
    const point = screenToFlowPosition({ x: event.clientX, y: event.clientY })
    openComposer({ x: point.x - COMPOSER_OFFSET, y: point.y - COMPOSER_OFFSET })
  }

  const connectChats = (connection) => setEdges(addEdge({ ...connection, type: 'default' }, edges))

  // Dropping a connection anywhere on another card links the two chats, not
  // only on its small handle — touch has no hover to reveal where that is.
  const onConnectEnd = (event, { isValid, fromNode, fromHandle }) => {
    if (isValid || !fromNode) return
    const otherId = chatIdAt(event)
    if (!otherId || otherId === fromNode.id) return
    const [source, target] = fromHandle.type === 'source' ? [fromNode.id, otherId] : [otherId, fromNode.id]
    connectChats({ source, sourceHandle: null, target, targetHandle: null })
  }

  const startFromSuggestion = (prompt, screenPoint) => {
    startChat({ prompt, position: screenToFlowPosition(screenPoint) })
  }

  const isHand = tool === 'hand'

  return (
    <div ref={containerRef} className={`relative h-full w-full ${isHand ? 'canvas-hand' : 'canvas-select'} ${connecting ? 'canvas-connecting' : ''}`}>
      <ReactFlow
        nodes={nodes}
        edges={[...edges, ...planEdges]}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={(changes) => setEdges(applyEdgeChanges(changes, edges))}
        onConnect={connectChats}
        onConnectEnd={onConnectEnd}
        connectionRadius={coarsePointer ? 40 : 20}
        onPaneClick={onPaneClick}
        onMoveEnd={saveViewport}
        defaultViewport={defaultViewport}
        minZoom={ZOOM.min}
        maxZoom={ZOOM.max}
        // Trackpad: two-finger drag pans, pinch zooms. Touch: pinch zooms and
        // two-finger drag pans; on cards that's handled by useCardPinch.
        panOnScroll
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick={false}
        nodesDraggable={!isHand}
        nodesConnectable={!isHand}
        elementsSelectable={!isHand}
        deleteKeyCode={['Backspace', 'Delete']}
        aria-label="Infinite canvas. Click anywhere to start a new chat."
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1.2} color="var(--canvas-dot)" />
        {showMinimap && (
          <MiniMap
            pannable
            zoomable
            position="bottom-right"
            nodeColor={(node) =>
              node.type === 'chat'
                ? getTone(chats.find((c) => c.id === node.id)?.tone).accent
                : node.type === 'plan' || node.type === 'planSummary'
                  ? 'var(--color-indigo)'
                  : 'var(--color-gray-300)'
            }
            nodeBorderRadius={12}
            maskColor="var(--canvas-minimap-mask)"
            className="mb-24! overflow-hidden rounded-lg border border-gray-200 shadow-medium"
          />
        )}
      </ReactFlow>

      {chats.length === 0 && plans.length === 0 && !composer && <EmptyCanvas onSuggestion={startFromSuggestion} />}
      <PlanTray compact={compact} />
      <SelectionAsk />
      <ItineraryDocument />

      {!compact && <CanvasTopBar showMinimap={showMinimap} onToggleMinimap={onToggleMinimap} onOpenFeed={onOpenFeed} />}
      {compact ? (
        <MobileCanvasToolbar tool={tool} onToolChange={setTool} />
      ) : (
        <CanvasToolbar tool={tool} onToolChange={setTool} />
      )}
    </div>
  )
}
