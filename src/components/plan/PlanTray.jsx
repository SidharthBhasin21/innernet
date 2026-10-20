import { useState } from 'react'
import { ArrowUp, FileText, ListChecks, X } from 'lucide-react'
import AgentActivity from '../agent/AgentActivity'
import { useCanvas } from '../../store/canvasStore'
import { collectPicks, titleFor } from '../../lib/trip/planModel'

const DRAFT_PROMPT = 'Draft my whole itinerary'

// The chat input below the canvas. It belongs to the trip that's open: that
// trip's picks collect here as chips, and asking the agent to draft turns them
// into a full itinerary. A collapsed (closed) trip has no say here, so with every
// trip closed the bar isn't shown at all.
export default function PlanTray({ compact }) {
  const { plans, activePlanId } = useCanvas()
  const open = plans.filter((p) => !p.collapsed)
  const plan = open.find((p) => p.id === activePlanId) ?? open.at(-1)
  if (!plan) return null
  // Keyed by trip, so moving to another trip starts with an empty field.
  return <TrayBody key={plan.id} plan={plan} compact={compact} />
}

function TrayBody({ plan, compact }) {
  const { docPlanId, toggleOption, draftItinerary, openDocument } = useCanvas()
  const [text, setText] = useState('')
  const [hint, setHint] = useState(null)

  const picks = collectPicks(plan)
  const drafting = plan.status === 'drafting'
  const redraft = Boolean(plan.itinerary)

  const submit = (request) => {
    if (drafting) return
    if (!picks.length) return setHint('Pick a few things on the branches first, then I’ll draft your itinerary.')
    setHint(null)
    setText('')
    draftItinerary(plan.id, request)
  }

  return (
    // While the document is open on desktop, the bar stays clear of its panel (w-xl).
    <div
      style={docPlanId && !compact ? { right: '36rem' } : undefined}
      className={`pointer-events-none absolute left-0 z-20 flex justify-center px-4 ${docPlanId && !compact ? '' : 'right-0'} ${compact ? 'bottom-36' : 'bottom-24'}`}
    >
      <div className="pointer-events-auto w-full max-w-170 surface rounded-xl p-3 shadow-large">
        <div className="flex items-center gap-1.5 px-1 pb-2 text-caption font-semibold text-gray-500">
          <ListChecks className="size-4 shrink-0 text-indigo" aria-hidden="true" />
          <span className="min-w-0 truncate">
            Your picks for {titleFor(plan.prompt)}
            {picks.length > 0 && ` · ${picks.length}`}
          </span>
          {redraft && docPlanId !== plan.id && (
            <button type="button" onClick={() => openDocument(plan.id)} className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-indigo hover:bg-indigo-soft focus-ring">
              <FileText className="size-3.5" aria-hidden="true" />
              View document
            </button>
          )}
        </div>

        {picks.length ? (
          // Two rows of picks at most; the rest scroll, so the bar stays short.
          <ul aria-label="Your picks" className="mb-2.5 flex max-h-[3.65rem] flex-wrap gap-1.5 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
            {picks.map((pick) => (
              <li key={`${pick.nodeId}:${pick.optionId}`} className="inline-flex items-center gap-1 rounded-full bg-indigo-soft py-1 pr-1 pl-3 text-body-s font-medium text-indigo animate-pop-in">
                {pick.chip}
                <button
                  type="button"
                  onClick={() => toggleOption(plan.id, pick.nodeId, pick.optionId)}
                  aria-label={`Remove ${pick.chip}`}
                  className="rounded-full p-0.5 hover:bg-white/70 focus-ring"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-2.5 px-1 text-body-s text-gray-400">Whatever you choose on the branches appears here.</p>
        )}

        {drafting && (
          <div className="mb-2.5 px-1">
            <AgentActivity activity={plan.activity} />
          </div>
        )}
        {plan.status === 'error' && (
          <p role="alert" className="mb-2 px-1 text-body-s text-error">
            Your agent couldn’t draft that. Try again.
          </p>
        )}
        {hint && (
          <p role="status" className="mb-2 px-1 text-body-s text-gray-500">
            {hint}
          </p>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit(text.trim() || DRAFT_PROMPT)
          }}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white py-1.5 pr-1.5 pl-3 transition-[border-color,box-shadow] focus-within:border-indigo focus-within:shadow-focus"
        >
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={drafting}
            aria-label="Ask your agent about your trip"
            placeholder={drafting ? 'Your agent is drafting…' : redraft ? 'Ask your agent to draft it again…' : 'Ask your agent to draft your itinerary…'}
            // 16px on phones stops iOS Safari from zooming the page on focus.
            className="min-w-0 flex-1 bg-transparent text-body-m text-gray-900 placeholder:text-gray-400 focus:outline-none max-md:text-body-l"
          />
          {!text && !drafting && (
            <button type="button" onClick={() => submit(DRAFT_PROMPT)} className="btn btn-secondary shrink-0 px-3 py-1.5 text-body-s">
              {redraft ? 'Draft again' : DRAFT_PROMPT}
            </button>
          )}
          <button
            type="submit"
            disabled={drafting || !text.trim()}
            aria-label="Send"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo text-white transition-colors hover:bg-indigo-hover focus-ring disabled:bg-gray-200 disabled:text-gray-400"
          >
            <ArrowUp className="size-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
