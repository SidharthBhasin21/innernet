import { useState } from 'react'
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, MiniMap, ReactFlow, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import ChatNode from '../chat/ChatNode'
import ComposerNode, { COMPOSER_ID } from './ComposerNode'
import CanvasTopBar from './CanvasTopBar'
import CanvasToolbar from './CanvasToolbar'
import EmptyCanvas from './EmptyCanvas'
import { useCanvas } from '../../store/canvasStore'
import { getTone } from '../../lib/chatTones'

const nodeTypes = { chat: ChatNode, composer: ComposerNode }
const VIEWPORT_KEY = 'innernet:viewport'
// Offset so the composer's corner sits just above-left of the click point.
const COMPOSER_OFFSET = 24

const readViewport = () => {
  try {
    return JSON.parse(localStorage.getItem(VIEWPORT_KEY)) ?? { x: 0, y: 0, zoom: 1 }
  } catch {
    return { x: 0, y: 0, zoom: 1 }
  }
}

const saveViewport = (_, viewport) => {
  try {
    localStorage.setItem(VIEWPORT_KEY, JSON.stringify(viewport))
  } catch {
    // Persistence is best-effort in the prototype.
  }
}

export default function Canvas({ onOpenFeed }) {
  const { chats, edges, composer, updateLayout, deleteChats, setEdges, openComposer, closeComposer, startChat } = useCanvas()
  const { screenToFlowPosition } = useReactFlow()
  const [tool, setTool] = useState('select')
  const [showMinimap, setShowMinimap] = useState(false)
  // React Flow view state (measured size, selection) that isn't part of the chat itself.
  const [nodeView, setNodeView] = useState({})
  const [defaultViewport] = useState(readViewport)

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
  if (composer) {
    nodes.push({
      id: COMPOSER_ID,
      type: 'composer',
      position: composer.position,
      draggable: false,
      selectable: false,
      deletable: false,
      zIndex: 1000,
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
    next.forEach((node) => {
      view[node.id] = { measured: node.measured, selected: node.selected }
      const prev = prevById.get(node.id)
      if (node.type !== 'chat' || !prev) return
      const patch = {}
      if (node.position !== prev.position) patch.position = node.position
      if (node.width !== prev.width || node.height !== prev.height) patch.size = { width: node.width, height: node.height }
      if (Object.keys(patch).length) layout[node.id] = patch
    })
    setNodeView(view)
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

  const startFromSuggestion = (prompt, screenPoint) => {
    startChat({ prompt, position: screenToFlowPosition(screenPoint) })
  }

  const isHand = tool === 'hand'

  return (
    <div className={`relative h-full w-full ${isHand ? 'canvas-hand' : 'canvas-select'}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={(changes) => setEdges(applyEdgeChanges(changes, edges))}
        onConnect={(connection) => setEdges(addEdge({ ...connection, type: 'default' }, edges))}
        onPaneClick={onPaneClick}
        onMoveEnd={saveViewport}
        defaultViewport={defaultViewport}
        minZoom={0.25}
        maxZoom={2}
        zoomOnDoubleClick={false}
        nodesDraggable={!isHand}
        nodesConnectable={!isHand}
        elementsSelectable={!isHand}
        deleteKeyCode={['Backspace', 'Delete']}
        aria-label="Infinite canvas. Click anywhere to start a new chat."
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1.2} color="#dfe3ec" />
        {showMinimap && (
          <MiniMap
            pannable
            zoomable
            position="bottom-right"
            nodeColor={(node) => (node.type === 'chat' ? getTone(chats.find((c) => c.id === node.id)?.tone).accent : '#cbd5e1')}
            nodeBorderRadius={12}
            maskColor="rgba(241, 245, 249, 0.6)"
            className="mb-24! overflow-hidden rounded-lg border border-gray-200 shadow-medium"
          />
        )}
      </ReactFlow>

      {chats.length === 0 && !composer && <EmptyCanvas onSuggestion={startFromSuggestion} />}

      <CanvasTopBar showMinimap={showMinimap} onToggleMinimap={() => setShowMinimap((s) => !s)} onOpenFeed={onOpenFeed} />
      <CanvasToolbar tool={tool} onToolChange={setTool} />
    </div>
  )
}
