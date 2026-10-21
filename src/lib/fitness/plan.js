// Builds the fitness plan document from the user's picks, and narrates doing it.
// Frontend-only mock; a real agent could return the same shape.

import { diets, exercises, friendPlans, goals, kits, meals, weekThemes, wheres } from '../../data/fitnessPlan'
import { byId, countPicks, plural, selectionSignature, sentenceList, wait } from '../flows/shared'
import { focusFor, readContext } from './context'

const WEEKDAYS = { 3: ['Mon', 'Wed', 'Fri'], 4: ['Mon', 'Tue', 'Thu', 'Fri'], 5: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }
const PER_SESSION = { 30: 3, 45: 4, 60: 5 }
const MEAL_ORDER = ['Breakfast', 'Lunch', 'Snack', 'Dinner']

const themeOf = (week, weeks) => (week === 1 ? weekThemes.first : week === weeks && weeks >= 3 ? weekThemes.last : week === weeks - 1 && weeks >= 4 ? weekThemes.push : weekThemes.build)

// Spread the chosen focus areas over the week's sessions: one each, repeating or pairing as needed.
function sessionFocus(areas, perWeek) {
  return Array.from({ length: perWeek }, (_, s) => {
    const mine = areas.filter((_, j) => j % perWeek === s)
    return mine.length ? mine : [areas[s % areas.length]]
  })
}

// How an exercise reads in a given week: sets follow the week, cardio grows, the rest carry their own.
const detailOf = (ex, theme, week) => (ex.sets ? theme.sets : ex.minutes ? `${ex.minutes + (week - 1) * 2} min` : ex.detail)

function buildWeek(week, ctx, goal, where, areas, swaps) {
  const theme = themeOf(week, ctx.weeks)
  const count = PER_SESSION[ctx.length] ?? 4
  const days = WEEKDAYS[ctx.perWeek] ?? WEEKDAYS[4]
  const sessions = sessionFocus(areas, ctx.perWeek).map((focus, s) => {
    const pools = focus.map((area) => exercises[area.id][where.id])
    const picked = []
    for (let i = 0; picked.length < count - 1 && i < 8; i += 1) {
      const pool = pools[i % pools.length]
      const item = pool[Math.floor(i / pools.length) % pool.length]
      if (!picked.includes(item)) picked.push(item)
    }
    // What the user swapped in (by the exercise it replaced) takes its place; the
    // others in the same focus areas are what it could be swapped for.
    const shown = picked.map((ex) => swaps[ex.text]?.ex ?? ex)
    const taken = new Set([...picked, ...shown].map((ex) => ex.text))
    const others = [...pools.flat(), ...areas.flatMap((area) => exercises[area.id][where.id])].filter((ex, i, all) => !taken.has(ex.text) && all.findIndex((o) => o.text === ex.text) === i)
    const option = (ex, original = false) => ({ label: ex.text, detail: detailOf(ex, theme, week), by: ex.by, quote: ex.quote, ex, ...(original && { original: true }) })
    const items = [
      { text: 'Warm-up', detail: '5 min easy movement and joint circles' },
      ...picked.map((ex, i) => ({
        key: ex.text,
        text: shown[i].text,
        detail: detailOf(shown[i], theme, week),
        by: shown[i].by,
        quote: shown[i].quote,
        ...(shown[i] !== ex && { swapped: true }),
        alternatives: [...(shown[i] !== ex ? [option(ex, true)] : []), ...others.slice(0, 4).map((o) => option(o))],
      })),
    ]
    return { day: days[s], title: focus.map((f) => f.label).join(' + '), minutes: ctx.length, items }
  })
  return { n: week, theme: theme.theme, note: theme.note, sessions }
}

function buildNutrition(ctx, diet, swaps) {
  const pool = meals[diet.id]
  const chosen = ctx.meals.length ? ctx.meals : pool.filter((m) => m.by).concat(pool.filter((m) => !m.by)).slice(0, 4)
  const slots = new Set(chosen.map((m) => m.meal))
  // Cover breakfast, lunch and dinner even if the user skipped one.
  const filled = [...chosen, ...['Breakfast', 'Lunch', 'Dinner'].filter((m) => !slots.has(m)).map((m) => pool.find((p) => p.meal === m)).filter(Boolean)]
  return {
    headline: `${diet.label}: ${diet.detail.toLowerCase()}`,
    meals: filled
      .sort((a, b) => MEAL_ORDER.indexOf(a.meal) - MEAL_ORDER.indexOf(b.meal))
      .map((m) => {
        const key = `meal:${m.label}`
        const swap = swaps[key]
        const shown = swap ?? m
        // Other meals for the same time of day that aren't already in the plan.
        const taken = new Set(filled.map((f) => f.label).concat(Object.values(swaps).map((s) => s.label)))
        const option = (o, original = false) => ({ label: o.label, detail: o.detail, by: o.by, quote: o.quote, ...(original && { original: true }) })
        const others = pool.filter((o) => o.meal === m.meal && !taken.has(o.label)).sort((a, b) => Number(Boolean(b.by)) - Number(Boolean(a.by)))
        return {
          key,
          slot: m.meal,
          text: shown.label,
          detail: shown.detail,
          by: shown.by,
          quote: shown.quote,
          chosen: !swap && ctx.meals.includes(m),
          ...(swap && { swapped: true }),
          alternatives: [...(swap ? [option(m, true)] : []), ...others.slice(0, 4).map((o) => option(o))],
        }
      }),
  }
}

export function buildPlan(plan) {
  const ctx = readContext(plan)
  const goal = ctx.goal ?? byId(goals, 'muscle')
  const where = ctx.where ?? byId(wheres, 'gym')
  const diet = ctx.diet ?? byId(diets, 'balanced')
  const options = focusFor(goal.id)
  const areas = ctx.focus.length ? ctx.focus : options.slice(0, Math.min(ctx.perWeek, options.length))
  const swaps = plan.swaps ?? {}
  const notes = []

  if (!ctx.goal) notes.push('You didn’t pick a goal, so I planned for building strength.')
  if (!ctx.where) notes.push('You didn’t say where you’ll train, so I planned for a gym.')
  if (ctx.focus.length > ctx.perWeek) notes.push(`You picked ${plural(ctx.focus.length, 'focus area')} for ${plural(ctx.perWeek, 'session')} a week, so some sessions cover two.`)
  if (ctx.focus.length && ctx.focus.length < ctx.perWeek) notes.push(`With ${plural(ctx.focus.length, 'focus area')} over ${plural(ctx.perWeek, 'session')}, a few sessions repeat.`)
  if (where.id === 'home' && goal.id === 'muscle' && !ctx.kit.some((k) => ['dumbbells', 'bands'].includes(k.id))) notes.push('Building muscle at home needs dumbbells or bands to keep progressing. Add a pair when you can.')
  if (ctx.perWeek * ctx.length >= 240) notes.push(`${ctx.perWeek} × ${ctx.length} minutes is over four hours a week. Skip a session if you’re tired rather than cutting sleep.`)
  ctx.extras.filter((e) => e.note).forEach((e) => notes.push(e.prompt))

  const gear = (ctx.kit.length ? ctx.kit : (kits[where.id] ?? []).filter((k) => k.by).slice(0, 2)).map((k) => ({ label: k.label, detail: k.detail, by: k.by }))
  const extras = ctx.extras.filter((e) => !e.note).map((e) => ({ label: e.label, detail: e.detail, by: e.by, quote: e.quote }))
  const weeks = Array.from({ length: ctx.weeks }, (_, i) => buildWeek(i + 1, ctx, goal, where, areas, swaps))
  const nutrition = buildNutrition(ctx, diet, swaps)

  const people = new Set([...weeks.flatMap((w) => w.sessions.flatMap((s) => s.items.map((i) => i.by))), ...nutrition.meals.map((m) => m.by), ...gear.map((g) => g.by), ...extras.map((e) => e.by)].filter(Boolean))
  return {
    title: `${ctx.weeks}-week ${goal.plan}`,
    summary: `${plural(ctx.perWeek, 'session')} a week · ${ctx.length} min · ${where.label.toLowerCase()} · ${goal.label.toLowerCase()}`,
    notes,
    weeks,
    nutrition,
    gear,
    extras,
    friends: [...people],
    signature: selectionSignature(plan),
    createdAt: new Date().toISOString(),
  }
}

/**
 * Draft the whole fitness plan from the user's picks.
 * @param {{ plan: object, request: string, onActivity: (activity) => void }} request
 * @returns {Promise<object>}
 */
export async function draftPlan({ plan, onActivity }) {
  const ctx = readContext(plan)
  const goal = ctx.goal ?? byId(goals, 'muscle')
  const where = ctx.where ?? byId(wheres, 'gym')
  const areas = ctx.focus.length ? ctx.focus : focusFor(goal.id).slice(0, ctx.perWeek)
  const similar = friendPlans.filter((p) => p.goal === goal.id || p.where === where.id).length

  const steps = [
    { status: 'thinking', message: `Reading your ${countPicks(plan)} picks…`, ms: 800 },
    { status: 'searching_connections', message: `Checking what ${similar} of your friends did for ${goal.label.toLowerCase()}…`, ms: 1100 },
    { status: 'aggregating', message: `Spreading ${sentenceList(areas.map((a) => a.label.toLowerCase()))} over ${plural(ctx.perWeek, 'session')} a week…`, ms: 1000 },
    { status: 'comparing', message: `Building ${ctx.weeks} weeks that get harder, then ease off…`, ms: 1000 },
    { status: 'comparing', message: ctx.meals.length ? `Fitting in your ${plural(ctx.meals.length, 'meal')}…` : 'Choosing simple meals to match…', ms: 900 },
    { status: 'responding', message: 'Writing it up…', ms: 700 },
  ]
  for (const { status, message, ms } of steps) {
    onActivity({ status, message })
    await wait(ms)
  }
  onActivity({ status: 'complete', message: 'Done' })
  return buildPlan(plan)
}
