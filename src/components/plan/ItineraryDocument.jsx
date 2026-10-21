import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useCanvas } from '../../store/canvasStore'
import { flowOfPlan, planTitle } from '../../lib/flows'
import { selectionSignature } from '../../lib/trip/planModel'
import useCanvasScrollArea from '../../hooks/useCanvasScrollArea'
import { documentBodies } from './documents'

// A plan's finished document (an itinerary, a workout plan…): a reading panel
// beside the canvas, not a node on it. It opens when your agent finishes
// drafting, and from a collapsed tree. The title, summary, out-of-date warning
// and notes are shared; the body is the flow's own.
export default function ItineraryDocument() {
  const { plans, docPlanId, closeDocument, swapItem } = useCanvas()
  const bodyRef = useRef(null)
  useCanvasScrollArea(bodyRef)
  const plan = plans.find((p) => p.id === docPlanId)
  const itinerary = plan?.itinerary
  const open = Boolean(itinerary)

  useEffect(() => {
    if (!open) return
    const onKey = (event) => event.key === 'Escape' && closeDocument()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, closeDocument])

  if (!open) return null
  const flow = flowOfPlan(plan)
  const Body = documentBodies[plan.flow ?? 'trip']
  const stale = itinerary.signature !== selectionSignature(plan)

  return (
    <aside aria-label={`${flow.copy.documentLabel} document`} data-lookup-plan={plan.id} data-lookup-node={plan.nodes.find((n) => !n.parentId).id} className="absolute inset-y-0 right-0 z-30 flex w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-large animate-pop-in">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-6 py-3.5">
        <p className="truncate text-body-s text-gray-500">
          {planTitle(plan)} · {flow.copy.documentLabel}
        </p>
        <button type="button" onClick={closeDocument} aria-label="Close document" className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-ring">
          <X className="size-5" />
        </button>
      </header>

      <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 pt-8 pb-16 select-text">
        <article className="mx-auto flex max-w-xl flex-col gap-5">
          <div>
            <h1 className="text-heading-1 text-gray-900">{itinerary.title}</h1>
            <p className="mt-2 text-body-l text-gray-600">{itinerary.summary}</p>
          </div>

          {stale && (
            <p role="status" className="flex items-start gap-2 rounded-md bg-(--tone-amber-soft) px-3 py-2.5 text-body-s text-gray-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
              You’ve changed your picks since this was drafted. Ask your agent to draft it again.
            </p>
          )}
          {itinerary.notes.map((note) => (
            <p key={note} className="rounded-md bg-gray-100 px-3 py-2.5 text-body-s text-gray-700">
              {note}
            </p>
          ))}

          <Body itinerary={itinerary} onSwap={(key, alt) => swapItem(plan.id, key, alt)} />

          <p className="border-t border-gray-200 pt-5 text-caption text-gray-400">{flow.copy.footer}</p>
        </article>
      </div>
    </aside>
  )
}
