// What the agent says about each node of the fitness tree: why it's asking (from
// what your friends actually did), what it would suggest, and how it reacts to
// what you've chosen. All of it is worked out from the tree's current choices,
// so a node's advice changes as you answer other questions. Frontend-only mock;
// a real agent could return the same shape.

import { diets, friendPlans, goals, kits, lengths, meals, sessionOptions, wheres } from '../../data/fitnessPlan'
import { getUser } from '../../data/mockUsers'
import { advice as say, byId, plural, sentenceList } from '../flows/shared'
import { focusFor, readContext } from './context'

const { warn, tip, ok } = say
const first = (userId) => getUser(userId).name.split(' ')[0]
const count = (list, fn) => list.filter(fn).length
const median = (list) => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)]
const nearest = (options, target) => [...options].sort((a, b) => Math.abs(Number(a.id) - target) - Math.abs(Number(b.id) - target))[0]
// Which way to eat suits which goal.
const DIET_FOR_GOAL = { muscle: 'protein', fat: 'balanced', endurance: 'balanced', flex: 'veg' }

function goal(ctx, node) {
  const tally = goals.map((g) => ({ g, n: count(friendPlans, (p) => p.goal === g.id) })).sort((a, b) => b.n - a.n)
  const chosen = byId(goals, node.selected[0])
  const advice = []
  if (chosen?.id === 'muscle') advice.push(ctx.weeks < 6 ? tip(`${ctx.weeks} weeks builds strength fast, but visible size takes longer. ${first('arjun')} did 6 weeks for it.`) : ok(`${ctx.weeks} weeks is enough to see real change in strength and size.`))
  if (chosen?.id === 'fat') advice.push(ok(`${ctx.weeks} weeks is a good start. ${first('priya')} says walking on rest days did as much as extra sessions.`))
  if (chosen?.id === 'endurance') advice.push(tip(`Stamina builds slowly. ${first('meera')} kept her first two weeks easy and says that’s why she didn’t get hurt.`))
  if (chosen?.id === 'flex') advice.push(ok('Mobility pays off fast. Most people feel looser within two weeks.'))
  return {
    why: `Your friends’ goals: ${sentenceList(tally.filter((t) => t.n).map((t) => `${t.g.label.toLowerCase()} (${t.n} of ${friendPlans.length})`))}.`,
    suggested: tally.filter((t) => t.n >= 2).slice(0, 1).map((t) => t.g.id),
    advice,
  }
}

function sessions(ctx, node) {
  const nums = friendPlans.map((p) => p.perWeek)
  const typical = median(nums)
  const chosen = Number(node.selected[0])
  const advice = []
  if (chosen === 5) advice.push(ctx.weeks <= 4 ? warn(`${first('meera')} trained 5 days and burnt out by week 3. For ${ctx.weeks} weeks I’d keep a rest day more than that.`) : tip('Five days works only with solid sleep and one easy day.'))
  if (chosen === 4) advice.push(ok(`${count(friendPlans, (p) => p.perWeek === 4)} of your friends trained 4 days. It leaves room to recover.`))
  if (chosen === 3) advice.push(ctx.goal?.id === 'muscle' ? tip('With 3 days, I’d make every session full-body so each muscle gets hit often enough.') : ok('Three days leaves a rest day between sessions, which is plenty to start.'))
  return {
    why: `Your friends trained ${Math.min(...nums)}–${Math.max(...nums)} days a week, and ${typical} was typical. ${first('rohan')}: “${friendPlans.find((p) => p.userId === 'rohan').note}”`,
    suggested: [String(typical === 4 ? 4 : nearest(sessionOptions, typical).id)],
    advice,
  }
}

function where(ctx, node) {
  const tally = wheres.map((w) => ({ w, n: count(friendPlans, (p) => p.where === w.id) })).sort((a, b) => b.n - a.n)
  const chosen = byId(wheres, node.selected[0])
  const advice = []
  if (chosen?.id === 'home') advice.push(ctx.goal?.id === 'muscle' ? tip('For muscle at home you’ll want a pair of adjustable dumbbells. I’ll ask what you have.') : ok('Home works well. I’ll ask what kit you have.'))
  if (chosen?.id === 'gym') advice.push(ok('A gym gives the most choice. I’ll ask what you’ll actually use.'))
  if (chosen?.id === 'outdoor') advice.push(tip('Outdoors depends on weather. I’ll keep a bodyweight option for rainy days.'))
  return {
    why: `Where your friends trained: ${sentenceList(tally.filter((t) => t.n).map((t) => `${t.w.label.toLowerCase()} (${t.n} of ${friendPlans.length})`))}.`,
    suggested: [tally[0].w.id],
    advice,
  }
}

function diet(ctx, node) {
  const tally = diets.map((d) => ({ d, n: count(friendPlans, (p) => p.diet === d.id) })).sort((a, b) => b.n - a.n)
  const chosen = byId(diets, node.selected[0])
  const advice = []
  if (chosen) {
    if (ctx.goal?.id === 'muscle' && chosen.id !== 'protein') advice.push(tip(`For building muscle, ${first('karan')} says protein at every meal made the biggest difference.`))
    else if (ctx.goal?.id === 'fat' && chosen.id === 'protein') advice.push(tip('High protein keeps you full while cutting. Keep the portions of rice and roti sensible.'))
    else advice.push(ok(`That suits ${ctx.goal ? `your ${ctx.goal.label.toLowerCase()} goal` : 'most goals'}. I’ll ask which meals to build around.`))
  }
  return {
    why: `How your friends ate: ${sentenceList(tally.filter((t) => t.n).map((t) => `${t.d.label.toLowerCase()} (${t.n} of ${friendPlans.length})`))}.`,
    suggested: [DIET_FOR_GOAL[ctx.goal?.id] ?? tally[0].d.id],
    advice,
  }
}

function focus(ctx, node) {
  const options = focusFor(node.spec.goal)
  const sessionsPerWeek = ctx.perWeek
  const advice = []
  const picked = node.selected.length
  if (picked) {
    if (picked > sessionsPerWeek) advice.push(warn(`That’s ${plural(picked, 'focus area')} for ${plural(sessionsPerWeek, 'session')} a week. I’ll pair some in the same session.`))
    else if (picked < sessionsPerWeek) advice.push(tip(`${plural(sessionsPerWeek, 'session')} a week with ${plural(picked, 'focus area')} means repeats, which is fine. Add one more if you want variety.`))
    else advice.push(ok(`One focus per session, ${plural(sessionsPerWeek, 'session')} a week.`))
  }
  const recommended = options.filter((o) => o.by)
  return {
    why: `You’ll train ${plural(sessionsPerWeek, 'day')} a week, so I’d pick about ${Math.min(sessionsPerWeek, options.length)} focus areas. ${recommended.length ? `${plural(recommended.length, 'friend')} recommended ${recommended.length === 1 ? 'one' : 'a few'}.` : ''}`.trim(),
    suggested: [...recommended, ...options.filter((o) => !o.by)].slice(0, Math.min(sessionsPerWeek, options.length)).map((o) => o.id),
    advice,
  }
}

function length(ctx, node) {
  const mins = friendPlans.map((p) => p.minutes)
  const chosen = Number(node.selected[0])
  const advice = []
  if (chosen) {
    const hours = (chosen * ctx.perWeek) / 60
    if (hours >= 4) advice.push(warn(`${chosen} minutes × ${ctx.perWeek} days is ${hours.toFixed(1)} hours a week. That’s a lot to keep up for ${ctx.weeks} weeks.`))
    else if (chosen === 30 && ctx.goal?.id === 'muscle') advice.push(tip('30 minutes is tight for muscle. I’ll keep sessions to three exercises.'))
    else advice.push(ok(`${chosen} minutes × ${ctx.perWeek} days is about ${hours.toFixed(1)} hours a week.`))
  }
  return {
    why: `Your friends trained ${Math.min(...mins)}–${Math.max(...mins)} minutes per session; ${median(mins)} was typical. ${first('meera')} kept hers to 30 and never skipped.`,
    suggested: [String(nearest(lengths, median(mins)).id)],
    advice,
  }
}

function kit(ctx, node) {
  const options = kits[node.spec.where]
  const recommended = options.filter((o) => o.by)
  const advice = []
  const ids = node.selected
  if (node.spec.where === 'home' && ctx.goal?.id === 'muscle' && ids.length && !ids.includes('dumbbells') && !ids.includes('bands')) advice.push(warn('For building muscle at home you’ll need dumbbells or bands. Bodyweight alone gets hard to progress.'))
  else if (ids.length) advice.push(ok('I’ll build sessions around exactly this, and list it in your plan.'))
  return {
    why: `What your friends used ${byId(wheres, node.spec.where).label.toLowerCase()}. ${recommended.length ? `${sentenceList(recommended.map((o) => first(o.by)))} had a favourite.` : 'Nobody has a favourite yet.'}`,
    suggested: recommended.map((o) => o.id),
    advice,
  }
}

function mealPicks(ctx, node) {
  const options = meals[node.spec.diet]
  const recommended = options.filter((o) => o.by)
  const slots = new Set(node.selected.map((id) => byId(options, id)?.meal))
  const advice = []
  if (node.selected.length) {
    const missing = ['Breakfast', 'Lunch', 'Dinner'].filter((m) => !slots.has(m))
    advice.push(missing.length ? tip(`Nothing yet for ${sentenceList(missing.map((m) => m.toLowerCase()))}. I’ll fill that from simple ${byId(diets, node.spec.diet).label.toLowerCase()} meals.`) : ok('That covers breakfast, lunch and dinner.'))
  }
  return {
    why: `Meals your friends ate while training. ${recommended.length ? `${sentenceList(recommended.map((o) => first(o.by)))} had a favourite.` : ''}`.trim(),
    suggested: recommended.map((o) => o.id),
    advice,
  }
}

// A question the user typed: the agent's answer, plus how the picks fit the plan.
function custom(ctx, node) {
  const { answer } = node.spec
  const picked = node.selected.map((id) => byId(answer.options, id)).filter(Boolean)
  const advice = []
  if (picked.some((o) => o.note)) advice.push(ok('I’ll put this in your plan’s notes.'))
  const habits = picked.filter((o) => !o.note)
  if (habits.length) advice.push(ok(`I’ll add ${sentenceList(habits.map((o) => o.label.toLowerCase()))} to your plan’s extras.`))
  return { why: answer.reply, suggested: answer.suggested, advice }
}

/**
 * What the agent says on one node: `why` (its reasoning, from your friends'
 * plans), `suggested` (option ids it would pick), and `advice` (reactions to
 * what's chosen, each `{ tone: 'warn' | 'tip' | 'ok', text }`).
 */
export function describeNode(plan, node) {
  const ctx = readContext(plan)
  switch (node.spec.kind) {
    case 'goal':
      return goal(ctx, node)
    case 'sessions':
      return sessions(ctx, node)
    case 'where':
      return where(ctx, node)
    case 'diet':
      return diet(ctx, node)
    case 'focus':
      return focus(ctx, node)
    case 'length':
      return length(ctx, node)
    case 'kit':
      return kit(ctx, node)
    case 'meals':
      return mealPicks(ctx, node)
    case 'custom':
      return custom(ctx, node)
    default:
      return { why: null, suggested: [], advice: [] }
  }
}
