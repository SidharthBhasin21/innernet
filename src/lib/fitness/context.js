// What the user has chosen so far on a fitness tree, read as plain facts. The
// agent's reasoning and the plan it drafts both start from this.

import { byId } from '../flows/shared'
import { diets, focusAreas, goals, kits, lengths, meals, sessionOptions, wheres } from '../../data/fitnessPlan'

const WORD_WEEKS = { two: 2, three: 3, four: 4, five: 5, six: 6, eight: 8, twelve: 12 }

export function parseWeeks(prompt) {
  const digits = prompt.match(/(\d+)[\s-]*weeks?\b/i)
  if (digits) return Number(digits[1])
  const word = prompt.match(/\b(two|three|four|five|six|eight|twelve)[\s-]*weeks?\b/i)
  return word ? WORD_WEEKS[word[1].toLowerCase()] : 4
}

/** Focus areas for a goal (the goal defaults to building muscle until one is chosen). */
export const focusFor = (goalId) => focusAreas[goalId] ?? focusAreas.muscle

/** Choices made so far (only on nodes the agent has finished), with sensible defaults. */
export function readContext(plan) {
  const ready = plan.nodes.filter((n) => n.status !== 'thinking')
  const selected = (kind) => ready.filter((n) => n.spec.kind === kind)
  const first = (kind) => selected(kind)[0]?.selected[0] ?? null
  const goal = byId(goals, first('goal')) ?? null
  const where = byId(wheres, first('where')) ?? null
  const diet = byId(diets, first('diet')) ?? null
  return {
    weeks: parseWeeks(plan.prompt),
    goal,
    perWeek: Number(first('sessions')) || 4,
    perWeekChosen: Boolean(first('sessions')),
    length: Number(first('length')) || 45,
    lengthChosen: Boolean(first('length')),
    where,
    diet,
    focus: (selected('focus')[0]?.selected ?? []).map((id) => byId(focusFor(goal?.id), id)).filter(Boolean),
    kit: (selected('kit')[0]?.selected ?? []).map((id) => byId(kits[where?.id] ?? [], id)).filter(Boolean),
    meals: (selected('meals')[0]?.selected ?? []).map((id) => byId(meals[diet?.id] ?? [], id)).filter(Boolean),
    // Things picked from questions the user typed on nodes ("what about sleep?").
    extras: ready
      .filter((n) => n.spec.kind === 'custom')
      .flatMap((n) => n.selected.map((id) => n.spec.answer.options.find((o) => o.id === id)).filter(Boolean).map((o) => ({ ...o, prompt: n.spec.prompt }))),
  }
}

export { lengths, sessionOptions }
