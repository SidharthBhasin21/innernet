// What the user has chosen so far on a trip tree, read as plain facts. The
// agent's reasoning (what to suggest, what to warn about) and the itinerary
// both start from this.

import { budgets, cities, CITY_ORDER, paces, stays } from '../../data/japanPlan'

const byId = (list, id) => list.find((item) => item.id === id)

// How many sights a day holds at each pace (the itinerary's slots: a relaxed
// day has one sight and dinner, balanced two, packed three).
export const SIGHTS_PER_DAY = { relaxed: 1, balanced: 2, packed: 3 }

/** Choices made so far (only on nodes the agent has finished), with sensible defaults. */
export function readContext(plan) {
  const ready = plan.nodes.filter((n) => n.status !== 'thinking')
  const selected = (kind) => ready.filter((n) => n.spec.kind === kind)
  const first = (kind) => selected(kind)[0]?.selected[0] ?? null
  return {
    days: Number(first('days')) || 7,
    daysChosen: Boolean(first('days')),
    budget: byId(budgets, first('budget')) ?? null,
    stay: (() => {
      const node = selected('stay')[0]
      return node && node.selected[0] ? byId(stays[node.spec.tier], node.selected[0]) : null
    })(),
    pace: byId(paces, first('pace')) ?? byId(paces, 'balanced'),
    paceChosen: Boolean(first('pace')),
    cities: ready.find((n) => n.spec.kind === 'places')?.selected ?? [],
    sights: Object.fromEntries(selected('attractions').map((n) => [n.spec.city, n.selected])),
    foodTypes: ready.find((n) => n.spec.kind === 'food')?.selected ?? [],
    // Things picked from questions the user typed on nodes ("what about shopping?").
    extras: ready
      .filter((n) => n.spec.kind === 'custom')
      .flatMap((n) => n.selected.map((id) => n.spec.answer.options.find((o) => o.id === id)).filter(Boolean).map((o) => ({ ...o, prompt: n.spec.prompt }))),
    spotIds: selected('spots').flatMap((n) => n.selected.map((id) => ({ id, food: n.spec.food }))),
  }
}

/** Which cities fit in the days, in route order. Cities dropped for lack of days are reported. */
export function chooseCities(ctx) {
  const chosen = ctx.cities.length ? ctx.cities : ['tokyo', 'kyoto']
  const kept = chosen.slice(0, ctx.days)
  return { route: CITY_ORDER.filter((id) => kept.includes(id)), dropped: chosen.slice(ctx.days), assumed: !ctx.cities.length }
}

/** Every city gets a day; the rest go round the cities that can take more (Hakone and Nara are one-day stops). */
export function allocateDays(route, total) {
  const days = Object.fromEntries(route.map((id) => [id, 1]))
  const roomy = route.filter((id) => !cities[id].maxDays)
  const growable = roomy.length ? roomy : route
  for (let left = total - route.length, i = 0; left > 0; left -= 1, i += 1) days[growable[i % growable.length]] += 1
  return days
}

/** About how many days each chosen city gets. */
export const cityDays = (ctx) => allocateDays(chooseCities(ctx).route, ctx.days)
