// Frontend-only mock of the agent drafting a full itinerary from everything the
// user picked on the trip tree. The UI only depends on the contract
// (`draftItinerary`: activity callbacks + a resolved itinerary), so a real
// agent can replace it later.

import { attractions, cities, costs, foods, friendTrips, localDinners, spots, trainBetween } from '../../data/japanPlan'
import { allocateDays, chooseCities, readContext } from './context'
import { countPicks, selectionSignature } from '../flows/shared'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const rupees = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
const byId = (list, id) => list.find((item) => item.id === id)

const SLOTS = {
  relaxed: ['Afternoon', 'Evening'],
  balanced: ['Morning', 'Afternoon', 'Evening'],
  packed: ['Morning', 'Afternoon', 'Late afternoon', 'Evening'],
}

// --- Filling the days --------------------------------------------------------------------

const person = (id) => id ?? null

function makePools(picks, city, route) {
  const all = attractions[city]
  const chosenIds = picks.sights[city] ?? []
  const chosen = chosenIds.map((id) => byId(all, id)).filter(Boolean)
  const rest = all.filter((a) => !chosenIds.includes(a.id))
  // Things the user asked for by typing: placed first, in the city they're in (or the first city).
  const extras = picks.extras
    .filter((e) => !e.note && (e.city ? e.city === city : city === route[0]))
    .map((e) => ({ id: e.id, label: e.label, detail: e.quote ?? e.detail.replace(/^[^·]+· /, ''), by: e.by, when: e.when, chosen: true }))
  const sights = [...extras, ...chosen.map((a) => ({ ...a, chosen: true })), ...rest]

  // Meals: the user's spots here first, then defaults for foods they picked.
  // Each spot goes to the meal it suits; dinners also fall back to local classics.
  const explicit = picks.spotIds.map(({ id, food }) => byId(spots[food], id)).filter((s) => s?.city === city)
  const defaults = picks.foodTypes.flatMap((food) => spots[food].filter((s) => s.city === city && !explicit.includes(s)))
  const meals = [...explicit.map((s) => ({ ...s, chosen: true })), ...defaults]
  const mealOf = (s) => s.meal ?? 'dinner'
  return {
    sights,
    breakfasts: meals.filter((s) => mealOf(s) === 'breakfast'),
    lunches: meals.filter((s) => mealOf(s) === 'lunch'),
    dinners: [...meals.filter((s) => mealOf(s) === 'dinner'), ...localDinners[city].map((label) => ({ id: `local-${label}`, label, detail: '' }))],
  }
}

const toItem = (slot, source, kind) => ({
  slot,
  kind,
  text: source.label,
  detail: source.quote ?? source.detail ?? '',
  by: person(source.by),
  chosen: Boolean(source.chosen),
})

function buildDays(picks, route, perCity) {
  const slots = SLOTS[picks.pace.id]
  const days = []
  route.forEach((city, cityIndex) => {
    const pools = makePools(picks, city, route)
    for (let i = 0; i < perCity[city]; i += 1) {
      const n = days.length + 1
      const items = slots.map((slot) => {
        if (slot === 'Evening') {
          const dinner = pools.dinners.shift() ?? { label: `Dinner near your hotel in ${cities[city].name}` }
          return toItem(slot, dinner, 'food')
        }
        // A breakfast spot takes a city's second morning (the first is for arriving);
        // a lunch spot takes an afternoon.
        const breakfastDay = perCity[city] > 1 ? 1 : 0
        if (slot === 'Morning' && n !== 1 && i === breakfastDay && pools.breakfasts.length) return toItem(slot, pools.breakfasts.shift(), 'food')
        if (slot === 'Afternoon' && pools.lunches.length) return toItem(slot, pools.lunches.shift(), 'food')
        // Sights best at dusk go in the day's last sight slot; the rest earlier.
        const dusk = slot === slots.filter((s) => s !== 'Evening').at(-1)
        const at = pools.sights.findIndex((s) => (s.when === 'dusk') === dusk)
        const sight = pools.sights.splice(at >= 0 ? at : 0, 1)[0]
        return sight ? toItem(slot, sight, 'sight') : toItem(slot, { label: `Free time to wander ${cities[city].name}`, detail: 'Follow your feet, or rest.' }, 'free')
      })
      const first = i === 0
      const prev = route[cityIndex - 1]
      days.push({
        n,
        city,
        cityName: cities[city].name,
        title: n === 1 ? `Arrive in ${cities[city].name}` : first && prev ? `${cities[prev].name} to ${cities[city].name}` : `${cities[city].name}, day ${i + 1}`,
        travel: first && prev ? (trainBetween[`${prev}-${city}`] ?? `Train from ${cities[prev].name}`) : n === 1 ? 'Fly in and take the airport train to your hotel' : null,
        items,
      })
    }
  })
  const last = days.at(-1)
  if (last) last.departure = `Head to the airport from ${last.cityName} for your flight home`
  return days
}

// --- Costs ---------------------------------------------------------------------------------

function buildBudget(picks, route) {
  const tier = picks.budget?.id ?? 'comfort'
  const nightly = picks.stay?.nightly ?? { lean: 3500, comfort: 6000, treat: 10000 }[tier]
  // One night fewer than days: the last day is a flight home.
  const nights = picks.days - 1
  const lines = [
    { label: 'Flights', detail: 'Delhi return', amount: costs.flights },
    { label: 'Stays', detail: `${plural(nights, 'night')} · ${picks.stay?.label ?? 'typical price'}`, amount: nightly * nights },
    ...(route.length > 1 ? [{ label: 'Trains', detail: 'Between cities', amount: costs.rail }] : []),
    { label: 'Food & local travel', detail: `${rupees(costs.dailyFoodAndTravel[tier])} a day`, amount: costs.dailyFoodAndTravel[tier] * picks.days },
  ]
  const total = lines.reduce((sum, line) => sum + line.amount, 0)
  return { lines, total, target: picks.budget?.amount ?? null, left: picks.budget ? picks.budget.amount - total : null, assumed: !picks.budget }
}

// --- Putting it together ---------------------------------------------------------------------

/** The plain facts of the itinerary, from the plan's current choices. */
export function buildItinerary(plan) {
  const picks = readContext(plan)
  const { route, dropped, assumed } = chooseCities(picks)
  const perCity = allocateDays(route, picks.days)
  const days = buildDays(picks, route, perCity)

  const notes = []
  if (assumed) notes.push('You didn’t pick cities, so I used Tokyo and Kyoto, where most of your friends went.')
  if (!picks.daysChosen) notes.push('You didn’t pick how long, so I planned 7 days.')
  if (dropped.length) notes.push(`There weren’t enough days for ${dropped.map((id) => cities[id].name).join(' and ')}, so I left ${dropped.length === 1 ? 'it' : 'them'} out.`)
  const placed = new Set(days.flatMap((d) => d.items.map((i) => i.text)))
  picks.spotIds
    .map(({ id, food }) => byId(spots[food], id))
    .filter((s) => s && route.includes(s.city) && !placed.has(s.label))
    .forEach((s) => notes.push(`There wasn’t room for ${s.label} at this pace.`))
  // Sights the user picked that didn't fit, or that are in a city that isn't on the route.
  const joined = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0])
  Object.entries(picks.sights).forEach(([city, ids]) => {
    const missing = ids.map((id) => byId(attractions[city], id)?.label).filter((label) => label && !placed.has(label))
    if (!missing.length) return
    notes.push(
      route.includes(city)
        ? `There wasn’t room for ${joined(missing)} in ${cities[city].name}, so I left ${missing.length === 1 ? 'it' : 'them'} out.`
        : `You picked ${joined(missing)}, but ${cities[city].name} isn’t on your route.`,
    )
  })
  picks.extras.forEach((e) => {
    if (e.note) return notes.push(`You asked: “${e.prompt}”. Nobody in your network could help, so it’s a note.`)
    const home = e.city ?? route[0]
    if (!route.includes(home)) notes.push(`You asked for ${e.label}, but ${cities[home].name} isn’t on your route.`)
    else if (!placed.has(e.label)) notes.push(`There wasn’t room for ${e.label} in ${cities[home].name}, so I left it out.`)
  })
  const skippedSpots = picks.spotIds.map(({ id, food }) => byId(spots[food], id)).filter((s) => s && !route.includes(s.city))
  if (skippedSpots.length) notes.push(`You picked ${skippedSpots.map((s) => s.label).join(' and ')}, but ${skippedSpots.length === 1 ? 'it’s' : 'they’re'} in a city that isn’t on your route.`)
  picks.foodTypes
    .filter((food) => !spots[food].some((s) => route.includes(s.city)))
    .forEach((food) => notes.push(`None of your friends’ ${byId(foods, food).label.toLowerCase()} spots are in the cities on your route.`))

  const budget = buildBudget(picks, route)
  const people = new Set(days.flatMap((d) => d.items.map((i) => i.by).filter(Boolean)))
  return {
    title: `${plural(picks.days, 'day')} in Japan`,
    summary: `${route.map((id) => `${cities[id].name} (${plural(perCity[id], 'day')})`).join(' → ')} · ${picks.pace.label.toLowerCase()} pace${picks.stay ? ` · ${picks.stay.label.toLowerCase()}s` : ''}`,
    notes,
    days,
    budget,
    friends: [...people],
    signature: selectionSignature(plan),
    createdAt: new Date().toISOString(),
  }
}

/**
 * Draft the whole itinerary from the user's picks.
 * @param {{ plan: object, request: string, onActivity: (activity) => void }} request
 * @returns {Promise<object>}
 */
export async function draftItinerary({ plan, onActivity }) {
  // Say what's really being done with this user's picks, step by step.
  const ctx = readContext(plan)
  const { route } = chooseCities(ctx)
  const split = allocateDays(route, ctx.days)
  const sightCount = Object.values(ctx.sights).flat().length + ctx.extras.filter((e) => !e.note).length
  const foodNames = ctx.foodTypes.map((id) => foods.find((f) => f.id === id)?.label.toLowerCase())
  const friends = friendTrips.filter((t) => t.route.some((city) => route.includes(city))).length
  const list = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0])

  const steps = [
    { status: 'thinking', message: `Reading your ${countPicks(plan)} picks…`, ms: 800 },
    { status: 'searching_connections', message: `Checking what ${friends} of your friends did in ${list(route.map((id) => cities[id].name))}…`, ms: 1100 },
    { status: 'aggregating', message: `Splitting ${ctx.days} days: ${route.map((id) => `${cities[id].name} ${split[id]}`).join(', ')}…`, ms: 1000 },
    {
      status: 'comparing',
      message: `Fitting in ${sightCount ? plural(sightCount, 'place') : 'the best places'}${foodNames.length ? ` and your ${list(foodNames)}` : ''}…`,
      ms: 1000,
    },
    { status: 'comparing', message: ctx.budget ? `Checking costs against your ${ctx.budget.label} budget…` : 'Estimating costs from typical prices…', ms: 900 },
    { status: 'responding', message: 'Writing it up…', ms: 700 },
  ]
  for (const { status, message, ms } of steps) {
    onActivity({ status, message })
    await wait(ms)
  }
  onActivity({ status: 'complete', message: 'Done' })
  return buildItinerary(plan)
}
