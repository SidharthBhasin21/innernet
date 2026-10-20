// What the agent says about each node of the trip tree: why it's asking (from
// what your friends actually did), what it would suggest, and how it reacts to
// what you've chosen. All of it is worked out from the tree's current choices,
// so a node's advice changes as you answer other questions. Frontend-only mock;
// a real agent could return the same shape.

import { attractions, budgets, cities, costs, dayOptions, foods, friendTrips, paces, spots, stays } from '../../data/japanPlan'
import { getUser } from '../../data/mockUsers'
import { allocateDays, chooseCities, cityDays, readContext, SIGHTS_PER_DAY } from './context'

const rupees = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`
const first = (userId) => getUser(userId).name.split(' ')[0]
// "1 city", "3 cities", "2 days".
const plural = (n, word) => `${n} ${n === 1 ? word : /[^aeiou]y$/.test(word) ? `${word.slice(0, -1)}ies` : `${word}s`}`
const byId = (list, id) => list.find((item) => item.id === id)
const count = (list, fn) => list.filter(fn).length
const sentenceList = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : (items[0] ?? ''))

const warn = (text) => ({ tone: 'warn', text })
const tip = (text) => ({ tone: 'tip', text })
const ok = (text) => ({ tone: 'ok', text })

// The least a trip costs for these many days, so a budget can be checked against it.
function floorCost(ctx, tier, route) {
  const nightly = stays.lean[0].nightly
  return costs.flights + (route.length > 1 ? costs.rail : 0) + costs.dailyFoodAndTravel[tier] * ctx.days + nightly * (ctx.days - 1)
}

function budget(ctx, node) {
  const spends = friendTrips.map((t) => t.spend).sort((a, b) => a - b)
  const median = spends[Math.floor(spends.length / 2)]
  const closest = [...budgets].sort((a, b) => Math.abs(a.amount - median) - Math.abs(b.amount - median))[0]
  const advice = []
  const chosen = byId(budgets, node.selected[0])
  if (chosen) {
    const { route } = chooseCities(ctx)
    const floor = floorCost(ctx, chosen.id, route)
    if (chosen.amount < floor * 1.05) advice.push(warn(`For ${ctx.days} days, flights, trains and food alone come to about ${rupees(floor)}, so ${chosen.label} leaves almost nothing for stays.`))
    else if (chosen.amount >= floor * 1.6) advice.push(ok(`That leaves about ${rupees(chosen.amount - floor)} for stays and treats, enough for a good hotel and a splurge dinner.`))
    else advice.push(ok(`About ${rupees(chosen.amount - floor)} would be left for stays and extras after flights, trains and food.`))
  }
  return {
    why: `${friendTrips.length} people in your network have done this trip and spent ${rupees(spends[0])}–${rupees(spends.at(-1))} each. The middle was about ${rupees(median)}.`,
    suggested: [closest.id],
    advice,
  }
}

function days(ctx, node) {
  const sorted = [...friendTrips].sort((a, b) => a.days - b.days)
  const shortest = sorted[0]
  const longest = sorted.at(-1)
  const median = sorted[Math.floor(sorted.length / 2)].days
  const closest = [...dayOptions].sort((a, b) => Math.abs(Number(a.id) - median) - Math.abs(Number(b.id) - median))[0]
  const advice = []
  const chosen = Number(node.selected[0])
  if (chosen) {
    const n = ctx.cities.length
    if (n && chosen < n * 2) advice.push(warn(`${plural(n, 'city')} in ${chosen} days is tight: about ${(chosen / n).toFixed(1)} days each. ${first(shortest.userId)} did ${shortest.days} days and said “${shortest.note}”`))
    else if (chosen <= 5) advice.push(tip('Five days works best with just Tokyo and Kyoto. Adding more cities would mean rushing.'))
    else if (chosen >= 14) advice.push(tip('Two weeks gives you room for Hakone and Osaka too, and a slower pace everywhere.'))
    else advice.push(ok(`${chosen} days is close to what ${count(friendTrips, (t) => Math.abs(t.days - chosen) <= 1)} of your friends did.`))
  }
  return {
    why: `Your friends stayed ${shortest.days}–${longest.days} days, and ${median} was typical. ${first(shortest.userId)}, who did ${shortest.days}, said “${shortest.note}” ${first(longest.userId)}, who did ${longest.days}: “${longest.note}”`,
    suggested: [closest.id],
    advice,
  }
}

function places(ctx, node) {
  const tally = Object.keys(cities)
    .map((id) => ({ id, n: count(friendTrips, (t) => t.route.includes(id)) }))
    .sort((a, b) => b.n - a.n)
  const limit = ctx.days >= 10 ? 4 : ctx.days >= 7 ? 3 : 2
  const suggested = tally.slice(0, limit).filter((c) => c.n >= 2).map((c) => c.id)
  const advice = []
  if (node.selected.length) {
    const { route, dropped } = chooseCities({ ...ctx, cities: node.selected })
    const split = allocateDays(route, ctx.days)
    if (dropped.length) advice.push(warn(`${ctx.days} days isn't enough for ${sentenceList(dropped.map((id) => cities[id].name))}. I'd have to leave ${dropped.length === 1 ? 'it' : 'them'} out.`))
    const kyotoDays = split.kyoto
    if (kyotoDays !== undefined && kyotoDays < 3) advice.push(kyotoDays < 2 ? warn(`Kyoto would only get ${plural(kyotoDays, 'day')}. ${first('karan')} says it needs three.`) : tip(`Kyoto would get ${plural(kyotoDays, 'day')}. ${first('meera')} says two isn't enough.`))
    advice.push(ok(`I’d split your ${ctx.days} days like this: ${route.map((id) => `${cities[id].name} ${split[id]}`).join(', ')}.`))
  }
  return {
    why: `Where your friends went: ${sentenceList(tally.filter((c) => c.n > 0).map((c) => `${cities[c.id].name} (${c.n} of ${friendTrips.length})`))}.`,
    suggested,
    advice,
  }
}

function food(ctx, node) {
  const tally = foods.map((f) => ({ id: f.id, n: count(friendTrips, (t) => t.ate.includes(f.id)) })).sort((a, b) => b.n - a.n)
  const top = tally.filter((f) => f.n >= 3)
  const advice = []
  if (node.selected.includes('kaiseki') && ctx.budget?.id === 'lean') advice.push(warn('A kaiseki dinner is ₹10,000 or more each, a big bite out of a ₹1,00,000 trip. Maybe just one.'))
  if (node.selected.length) advice.push(ok(`I’ll ask where your friends ate ${sentenceList(node.selected.map((id) => byId(foods, id).label.toLowerCase()))}, and fit those into your days.`))
  return {
    why: `What your friends ate most: ${sentenceList(tally.filter((f) => f.n > 0).slice(0, 4).map((f) => `${byId(foods, f.id).label.toLowerCase()} (${f.n} of ${friendTrips.length})`))}.`,
    suggested: top.map((f) => f.id),
    advice,
  }
}

const SUGGESTED_STAY = { lean: 'hostel', comfort: 'boutique', treat: 'ryokan' }

function stay(ctx, node) {
  const tier = node.spec.tier
  const budgetOption = byId(budgets, tier)
  const options = stays[tier]
  const voices = options.filter((o) => o.by).map((o) => `${first(o.by)} liked the ${o.label.toLowerCase()}`)
  const advice = []
  const chosen = byId(options, node.selected[0])
  if (chosen) {
    const total = chosen.nightly * (ctx.days - 1)
    const share = Math.round((total / budgetOption.amount) * 100)
    advice.push(
      share > 40
        ? warn(`${chosen.label} for ${plural(ctx.days - 1, 'night')} is about ${rupees(total)}, ${share}% of your ${budgetOption.label}. That squeezes everything else.`)
        : ok(`${chosen.label} for ${plural(ctx.days - 1, 'night')} is about ${rupees(total)}, ${share}% of your ${budgetOption.label}.`),
    )
  }
  return {
    why: `At ${budgetOption.label}, you’re choosing between ${sentenceList(options.map((o) => o.label.toLowerCase()))}. ${voices.length ? `${sentenceList(voices)}.` : ''}`.trim(),
    suggested: [SUGGESTED_STAY[tier]],
    advice,
  }
}

function pace(ctx, node) {
  const { route } = chooseCities(ctx)
  const each = (ctx.days / route.length).toFixed(1)
  const chosen = byId(paces, node.selected[0])
  const advice = []
  if (chosen) {
    const perDay = SIGHTS_PER_DAY[chosen.id]
    advice.push(ok(`${chosen.label} means about ${plural(perDay, 'sight')} a day, so around ${perDay * ctx.days} places over ${ctx.days} days.`))
    if (chosen.id === 'packed' && ctx.days >= 10) advice.push(tip('That’s a lot of early starts over ten days. Relaxed would leave room to enjoy it.'))
  }
  return {
    why: `${ctx.days} days over ${plural(route.length, 'city')} is about ${each} days each. ${first('meera')} went relaxed and loved it; ${first('karan')} packed it in and felt rushed.`,
    suggested: [ctx.days >= 10 ? 'relaxed' : 'balanced'],
    advice,
  }
}

function sights(ctx, node) {
  const city = node.spec.city
  const here = cityDays(ctx)[city] ?? 1
  const capacity = Math.max(1, here * SIGHTS_PER_DAY[ctx.pace.id])
  const options = attractions[city]
  const recommended = options.filter((o) => o.by)
  const ordered = [...recommended, ...options.filter((o) => !o.by)]
  const advice = []
  const picked = node.selected.length
  if (picked) {
    if (picked > capacity) advice.push(warn(`That’s ${plural(picked, 'place')}, but ${plural(here, 'day')} at a ${ctx.pace.label.toLowerCase()} pace fits about ${capacity}. I’ll fit the best ones and tell you what didn’t make it.`))
    else if (picked < capacity) advice.push(tip(`There’s room for about ${capacity - picked} more. I’ll fill any gaps with local favourites if you don’t pick.`))
    else advice.push(ok(`That fills your ${cities[city].name} days.`))
  }
  return {
    why: `You’ll have about ${plural(here, 'day')} in ${cities[city].name} at a ${ctx.pace.label.toLowerCase()} pace, which fits around ${plural(capacity, 'place')}. ${recommended.length ? `${plural(recommended.length, 'friend')} recommended ${recommended.length === 1 ? 'this' : 'these'}.` : ''}`.trim(),
    suggested: ordered.slice(0, capacity).map((o) => o.id),
    advice,
  }
}

function eatingSpots(ctx, node) {
  const options = spots[node.spec.food]
  const onRoute = (o) => !ctx.cities.length || ctx.cities.includes(o.city)
  const recommended = options.filter((o) => o.by && onRoute(o))
  const advice = []
  const off = node.selected.map((id) => byId(options, id)).filter((o) => o && !onRoute(o))
  off.forEach((o) => advice.push(warn(`${o.label} is in ${cities[o.city].name}, which isn’t on your route.`)))
  const picked = node.selected.length - off.length
  if (picked > 0) advice.push(ok(`I’ll work ${picked === 1 ? 'that spot' : 'those spots'} into the right meal of the day.`))
  return {
    why: `Where your friends ate ${byId(foods, node.spec.food).label.toLowerCase()}. ${recommended.length ? `${sentenceList(recommended.map((o) => first(o.by)))} had a favourite${recommended.length === 1 ? '' : ' each'}.` : 'Nobody in your network has a favourite yet.'}`,
    suggested: recommended.map((o) => o.id),
    advice,
  }
}

// A question the user typed: the agent's answer, plus how the picks fit the trip.
function custom(ctx, node) {
  const { answer } = node.spec
  const { route } = chooseCities(ctx)
  const picked = node.selected.map((id) => byId(answer.options, id)).filter(Boolean)
  const advice = []
  if (picked.some((o) => o.note)) advice.push(ok('I’ll put this in your itinerary notes.'))
  picked
    .filter((o) => !o.note && o.city && !route.includes(o.city))
    .forEach((o) => advice.push(warn(`${o.label} is in ${cities[o.city].name}, which isn’t on your route.`)))
  const fits = picked.filter((o) => !o.note && (!o.city || route.includes(o.city)))
  if (fits.length) advice.push(ok(`I’ll fit ${sentenceList(fits.map((o) => o.label))} into your days.`))
  return { why: answer.reply, suggested: answer.suggested, advice }
}

/**
 * What the agent says on one node: `why` (its reasoning, from your friends'
 * trips), `suggested` (option ids it would pick), and `advice` (reactions to
 * what's chosen, each `{ tone: 'warn' | 'tip' | 'ok', text }`).
 */
export function describeNode(plan, node) {
  const ctx = readContext(plan)
  switch (node.spec.kind) {
    case 'budget':
      return budget(ctx, node)
    case 'days':
      return days(ctx, node)
    case 'places':
      return places(ctx, node)
    case 'food':
      return food(ctx, node)
    case 'stay':
      return stay(ctx, node)
    case 'pace':
      return pace(ctx, node)
    case 'attractions':
      return sights(ctx, node)
    case 'spots':
      return eatingSpots(ctx, node)
    case 'custom':
      return custom(ctx, node)
    default:
      return { why: null, suggested: [], advice: [] }
  }
}
