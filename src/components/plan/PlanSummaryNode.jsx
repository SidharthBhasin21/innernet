import { Handle, Position } from '@xyflow/react'
import { ChevronsUpDown, FileText } from 'lucide-react'
import AgentMascot from '../agent/AgentMascot'
import ChatMenu from '../chat/ChatMenu'
import { useCanvas } from '../../store/canvasStore'
import { collectPicks, selectionSignature, titleFor } from '../../lib/trip/planModel'

const MAX_DAYS_SHOWN = 4
const stripe = { opacity: 0, pointerEvents: 'none' }

// The itinerary document, in miniature, sitting on the collapsed node. Opening it
// shows the full document.
function DocumentPreview({ plan }) {
  const { openDocument } = useCanvas()
  const { itinerary } = plan
  const stale = itinerary.signature !== selectionSignature(plan)
  const more = itinerary.days.length - MAX_DAYS_SHOWN

  return (
    <button
      type="button"
      onClick={() => openDocument(plan.id)}
      aria-label={`Open the itinerary document: ${itinerary.title}`}
      className="nodrag group block w-full rounded-lg border border-gray-200 bg-white p-3.5 text-left shadow-subtle transition-shadow hover:shadow-medium focus-ring"
    >
      <span className="flex items-center gap-1.5 text-caption font-semibold text-indigo">
        <FileText className="size-3.5" aria-hidden="true" />
        Itinerary document
        {stale && <span className="ml-auto rounded-full bg-(--tone-amber-soft) px-1.5 py-0.5 font-medium text-gray-700">Out of date</span>}
      </span>
      <span className="mt-1.5 block text-body-l font-semibold text-gray-900">{itinerary.title}</span>
      <span className="block text-caption text-gray-500">{itinerary.summary}</span>
      <ul className="mt-2.5 flex flex-col gap-1 border-t border-gray-100 pt-2.5">
        {itinerary.days.slice(0, MAX_DAYS_SHOWN).map((day) => (
          <li key={day.n} className="truncate text-caption text-gray-600">
            <span className="font-medium text-gray-900">Day {day.n}</span> · {day.cityName} · {day.items.map((i) => i.text).slice(0, 2).join(', ')}
          </li>
        ))}
        {more > 0 && <li className="text-caption text-gray-400">+ {more} more {more === 1 ? 'day' : 'days'}</li>}
      </ul>
      <span className="mt-3 inline-flex text-body-s font-medium text-indigo group-hover:underline">Open document</span>
    </button>
  )
}

// A whole trip tree folded into one node. It keeps the trip's name, what's been
// chosen so far and, once drafted, the itinerary document, so the canvas stays
// tidy with many trips on it.
export default function PlanSummaryNode({ id }) {
  const { plans, setPlanCollapsed, deletePlan, focusPlan } = useCanvas()
  const plan = plans.find((p) => id === `${p.id}/summary`)
  if (!plan) return null
  const picks = collectPicks(plan)

  return (
    <article aria-label={`${titleFor(plan.prompt)} (collapsed)`} onPointerDown={() => focusPlan(plan.id)} className="w-85 animate-pop-in rounded-xl border border-indigo-border bg-white p-4 shadow-medium">
      <Handle type="target" position={Position.Top} style={stripe} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} style={stripe} isConnectable={false} />

      <div className="plan-drag-handle flex cursor-grab items-center gap-3 active:cursor-grabbing">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-indigo-soft">
          <AgentMascot tone="indigo" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-body-l font-semibold text-gray-900">{titleFor(plan.prompt)}</h3>
          <p className="text-body-s text-gray-500">{picks.length === 0 ? 'Nothing picked yet' : `${picks.length} picks`}</p>
        </div>
        <button
          type="button"
          onClick={() => setPlanCollapsed(plan.id, false)}
          aria-label="Expand this trip"
          title="Expand this trip"
          className="nodrag rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-ring"
        >
          <ChevronsUpDown className="size-4" />
        </button>
        <ChatMenu onDelete={() => deletePlan(plan.id)} deleteLabel="Delete trip" />
      </div>

      <div className="mt-3">
        {plan.itinerary ? (
          <DocumentPreview plan={plan} />
        ) : (
          <div className="rounded-lg bg-gray-100 p-3">
            <p className="text-body-s text-gray-600">No itinerary yet. Expand the tree to keep choosing, then ask your agent to draft it.</p>
            {picks.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1">
                {picks.slice(0, 6).map((pick) => (
                  <li key={`${pick.nodeId}:${pick.optionId}`} className="rounded-full bg-white px-2 py-0.5 text-caption text-gray-700">
                    {pick.chip}
                  </li>
                ))}
                {picks.length > 6 && <li className="px-1 py-0.5 text-caption text-gray-400">+{picks.length - 6}</li>}
              </ul>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
