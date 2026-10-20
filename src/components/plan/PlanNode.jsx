import { useEffect, useRef, useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { AlertTriangle, ArrowUp, BedDouble, CalendarDays, Check, ChevronsDownUp, Crosshair, Dumbbell, Footprints, House, Landmark, MapPin, MessageSquarePlus, Plane, Plus, Salad, Sparkles, Target, Timer, UtensilsCrossed, Wallet, Wrench, X } from 'lucide-react'
import AgentActivity from '../agent/AgentActivity'
import AgentMascot from '../agent/AgentMascot'
import ChatMenu from '../chat/ChatMenu'
import Avatar from '../ui/Avatar'
import { useCanvas } from '../../store/canvasStore'
import { specContent, thinkMessage } from '../../lib/trip/planModel'
import { flowOfPlan } from '../../lib/flows'
import { getUser } from '../../data/mockUsers'

const icons = {
  ask: MessageSquarePlus,
  plane: Plane,
  budget: Wallet,
  days: CalendarDays,
  places: MapPin,
  food: UtensilsCrossed,
  stay: BedDouble,
  pace: Footprints,
  sights: Landmark,
  dumbbell: Dumbbell,
  goal: Target,
  sessions: CalendarDays,
  where: House,
  diet: Salad,
  focus: Crosshair,
  length: Timer,
  kit: Wrench,
  meals: UtensilsCrossed,
}

// Handles only anchor the lines between nodes; the user never connects by hand.
const anchor = { opacity: 0, pointerEvents: 'none' }

// An option as a chip: compact, so a whole branch fits on screen. A sparkle marks
// what the agent would suggest. Its detail and what a friend said appear in the
// node's info area when it's hovered or chosen.
function Option({ option, selected, multi, suggested, onToggle, onFocus }) {
  const friend = option.by ? getUser(option.by) : null
  return (
    <li>
      <button
        type="button"
        role={multi ? 'checkbox' : 'radio'}
        aria-checked={selected}
        onClick={onToggle}
        onMouseEnter={onFocus}
        onFocus={onFocus}
        title={suggested ? 'Your agent suggests this' : undefined}
        className={`inline-flex items-center gap-1.5 rounded-full border py-1.5 pr-3 pl-2 text-left text-body-s font-medium transition-colors focus-ring ${
          selected
            ? 'border-indigo bg-indigo-soft text-indigo'
            : suggested
              ? 'border-purple/40 bg-white text-gray-800 hover:bg-gray-100'
              : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-100'
        }`}
      >
        {selected ? (
          <span aria-hidden="true" className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo text-white">
            <Check className="size-3" strokeWidth={3} />
          </span>
        ) : friend ? (
          <Avatar user={friend} size="xs" />
        ) : (
          <span aria-hidden="true" className="ml-1 size-3 shrink-0 rounded-full border border-gray-300" />
        )}
        {option.label}
        {suggested && !selected && <Sparkles className="size-3 shrink-0 text-purple" aria-label="Suggested" />}
      </button>
    </li>
  )
}

// What the option under the pointer (or last chosen) is, and who said what. The
// area always keeps its height, so nodes don't jump as the pointer moves.
function Info({ option }) {
  const friend = option?.by ? getUser(option.by) : null
  return (
    <div aria-live="polite" className="nodrag mt-3 min-h-14 cursor-auto rounded-md bg-gray-100 px-3 py-2">
      {option ? (
        <>
          <p className="text-body-s text-gray-700">{option.detail}</p>
          {friend && option.quote && (
            <p className="mt-1 flex items-start gap-1.5 text-caption text-gray-600">
              <Avatar user={friend} size="xs" />
              <span>
                <span className="font-medium text-gray-800">{friend.name.split(' ')[0]}:</span> “{option.quote}”
              </span>
            </p>
          )}
        </>
      ) : (
        <p className="text-caption text-gray-400">Point at an option to see what it is and what your friends said.</p>
      )}
    </div>
  )
}

const adviceStyle = {
  warn: { icon: AlertTriangle, box: 'bg-(--tone-amber-soft)', iconClass: 'text-warning' },
  tip: { icon: Sparkles, box: 'bg-(--tone-purple-soft)', iconClass: 'text-purple' },
  ok: { icon: Check, box: 'bg-(--tone-green-soft)', iconClass: 'text-success' },
}

// The agent reacting to what's chosen, so it reads as thinking and not just recording.
function Advice({ items }) {
  if (!items.length) return null
  return (
    <ul className="nodrag mt-2.5 flex cursor-auto flex-col gap-1.5">
      {items.map((item) => {
        const { icon: Icon, box, iconClass } = adviceStyle[item.tone]
        return (
          <li key={item.text} className={`flex items-start gap-2 rounded-md px-2.5 py-2 text-caption text-gray-700 animate-pop-in ${box}`}>
            <Icon className={`mt-0.5 size-3.5 shrink-0 ${iconClass}`} aria-hidden="true" />
            {item.text}
          </li>
        )
      })}
    </ul>
  )
}

const STARTERS = ['What about shopping?', 'Any good nightlife?', 'Rainy-day plans?']

// "Add a branch": type any question and a new node grows from this one. A few
// starters show what kinds of things the agent can answer.
function AddBranch({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  // preventScroll: focusing must not scroll the app shell to reveal the field.
  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true })
  }, [open])

  const submit = (value) => {
    const prompt = value.trim()
    if (!prompt) return
    onAdd(prompt)
    setText('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="nodrag mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-gray-300 px-3 py-1 text-body-s font-medium text-gray-500 transition-colors hover:border-indigo hover:text-indigo focus-ring">
        <Plus className="size-3.5" aria-hidden="true" />
        Add a branch
      </button>
    )
  }
  return (
    <div className="nodrag nopan mt-3 cursor-auto">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          submit(text)
        }}
        className="flex items-center gap-1 rounded-full border border-gray-200 bg-white py-1 pr-1 pl-3 transition-[border-color,box-shadow] focus-within:border-indigo focus-within:shadow-focus"
      >
        <input
          ref={inputRef}
          value={text}
          maxLength={140}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
          aria-label="Ask your agent to add a branch from here"
          placeholder="Ask anything from here…"
          // 16px on phones stops iOS Safari from zooming the page on focus.
          className="min-w-0 flex-1 bg-transparent text-body-s text-gray-900 placeholder:text-gray-400 focus:outline-none max-md:text-body-l"
        />
        <button type="submit" disabled={!text.trim()} aria-label="Add branch" className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo text-white transition-colors hover:bg-indigo-hover focus-ring disabled:bg-gray-200 disabled:text-gray-400">
          <ArrowUp className="size-3.5" />
        </button>
      </form>
      <ul className="mt-1.5 flex flex-wrap gap-1">
        {STARTERS.map((starter) => (
          <li key={starter}>
            <button type="button" onClick={() => submit(starter)} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-caption text-gray-600 transition-colors hover:bg-indigo-soft hover:text-indigo focus-ring">
              {starter}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// The node while the agent is still working it out: the question isn't there yet.
function Thinking({ icon: Icon, message }) {
  return (
    <div className="p-4">
      <div className="plan-drag-handle flex cursor-grab items-center gap-2.5 active:cursor-grabbing">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400" aria-hidden="true">
          <Icon className="size-4" />
        </span>
        <AgentActivity activity={{ message }} />
      </div>
      <div aria-hidden="true" className="mt-4 flex flex-wrap gap-1.5 animate-pulse-soft">
        {[20, 14, 24, 16].map((w, i) => (
          <span key={i} style={{ width: `${w * 4}px` }} className="h-8 rounded-full bg-gray-100" />
        ))}
      </div>
    </div>
  )
}

// One node of the trip tree: the trip itself, or a question the agent has
// worked out. It thinks first (a placeholder), then shows why it's asking, what
// it would suggest, and reacts to what you choose, which can grow new nodes.
export default function PlanNode({ id }) {
  const { plans, toggleOption, pickSuggested, deletePlan, focusPlan, setPlanCollapsed, addQuestion, removeNode } = useCanvas()
  const [focusId, setFocusId] = useState(null)
  const plan = plans.find((p) => id.startsWith(`${p.id}/`))
  const node = plan?.nodes.find((n) => n.id === id)
  if (!node) return null

  const content = specContent(node.spec)
  const Icon = icons[content.icon] ?? Sparkles
  const isRoot = node.spec.kind === 'root'
  // A question the user typed (rather than one the agent asked).
  const isCustom = node.spec.kind === 'custom'
  const thinking = node.status === 'thinking'
  const picked = node.selected.length
  const { why, suggested, advice } = thinking || isRoot ? { why: null, suggested: [], advice: [] } : flowOfPlan(plan).describeNode(plan, node)
  const unpicked = suggested.filter((optionId) => !node.selected.includes(optionId))
  // Info shows the option under the pointer, else the one chosen last.
  const shown = content.options.find((o) => o.id === (focusId ?? node.selected.at(-1)))

  return (
    <article
      aria-label={isRoot ? content.title : isCustom ? `${content.title} (your question)${thinking ? ' (thinking)' : ''}` : thinking ? `${content.title} (thinking)` : `${content.title}: ${content.question}`}
      aria-busy={thinking}
      onPointerDown={() => focusPlan(plan.id)}
      className={`animate-pop-in rounded-xl border bg-white shadow-medium ${isRoot ? 'w-70 border-indigo-border' : isCustom ? 'w-75 border-purple/40' : 'w-75 border-gray-200'}`}
    >
      <Handle type="target" position={Position.Top} style={anchor} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} style={anchor} isConnectable={false} />

      {isRoot ? (
        <div className="p-4">
          <div className="plan-drag-handle flex cursor-grab items-center gap-3 active:cursor-grabbing">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-indigo-soft">
              <AgentMascot tone="indigo" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-body-l font-semibold text-gray-900">{content.title}</h3>
              <p className="text-caption text-gray-500">{thinking ? 'Your agent is looking into it' : 'Your agent has looked into it'}</p>
            </div>
            {!thinking && (
              <button
                type="button"
                onClick={() => setPlanCollapsed(plan.id, true)}
                aria-label="Collapse this trip"
                title="Collapse this trip"
                className="nodrag rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-ring"
              >
                <ChevronsDownUp className="size-4" />
              </button>
            )}
            <ChatMenu onDelete={() => deletePlan(plan.id)} deleteLabel="Delete trip" />
          </div>
          <div className="nodrag mt-3 cursor-auto">
            {thinking ? (
              <AgentActivity activity={plan.activity} />
            ) : (
              node.note && (
                <p className="flex items-start gap-2 rounded-md bg-(--tone-purple-soft) px-2.5 py-2 text-body-s text-gray-700 animate-pop-in">
                  <Sparkles className="mt-0.5 size-3.5 shrink-0 text-purple" aria-hidden="true" />
                  {node.note}
                </p>
              )
            )}
            {!thinking && <AddBranch onAdd={(prompt) => addQuestion(plan.id, node.id, prompt)} />}
          </div>
        </div>
      ) : thinking ? (
        <Thinking icon={Icon} message={thinkMessage(node.spec)} />
      ) : (
        <div className="p-4 animate-pop-in">
          <div className="plan-drag-handle flex cursor-grab items-center gap-2.5 active:cursor-grabbing">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-soft text-indigo" aria-hidden="true">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-body-m font-semibold text-gray-900">{content.question}</h3>
              {content.context && <p className="text-caption text-gray-500">{content.context}</p>}
            </div>
            {isCustom && (
              <button
                type="button"
                onClick={() => removeNode(plan.id, node.id)}
                aria-label="Remove this branch"
                title="Remove this branch"
                className="nodrag -mr-1 self-start rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-ring"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          {why && (
            <p className="nodrag mt-2.5 flex cursor-auto items-start gap-1.5 text-body-s text-gray-600">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-purple" aria-hidden="true" />
              {why}
            </p>
          )}
          {/* Below the header, drags don't move the node: they're for choosing. */}
          <p className="nodrag mt-2.5 cursor-auto text-caption text-gray-400">
            {content.multi ? 'Choose any' : 'Choose one'}
            {picked > 0 && ` · ${picked} picked`}
          </p>
          <ul role={content.multi ? 'group' : 'radiogroup'} aria-label={content.question} onMouseLeave={() => setFocusId(null)} className="nodrag mt-2 flex cursor-auto flex-wrap gap-1.5">
            {content.options.map((option) => (
              <Option
                key={option.id}
                option={option}
                multi={content.multi}
                selected={node.selected.includes(option.id)}
                suggested={suggested.includes(option.id)}
                onFocus={() => setFocusId(option.id)}
                onToggle={() => toggleOption(plan.id, node.id, option.id)}
              />
            ))}
          </ul>
          {unpicked.length > 0 && (
            <button
              type="button"
              onClick={() => pickSuggested(plan.id, node.id, suggested)}
              className="nodrag mt-2.5 inline-flex cursor-pointer items-center gap-1.5 text-body-s font-medium text-purple hover:underline focus-ring"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              {content.multi ? 'Pick what I’d suggest' : 'Use my suggestion'}
            </button>
          )}
          <Info option={shown} />
          <Advice items={advice} />
          <AddBranch onAdd={(prompt) => addQuestion(plan.id, node.id, prompt)} />
        </div>
      )}
    </article>
  )
}
