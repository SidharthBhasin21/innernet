// The Japan trip flow: what its tree asks, how the agent thinks about it, and the
// itinerary it drafts. The generic tree code (lib/trip/planModel.js) works with
// any flow that has this shape.

import { attractions, budgets, cities, CITY_ORDER, dayOptions, foods, paces, spots, stays } from '../../data/japanPlan'
import { answerPrompt } from '../trip/custom'
import { draftItinerary } from '../trip/itinerary'
import { describeNode } from '../trip/reasoning'
import { thinkAboutTrip } from '../trip/thinking'

const NUMBER_WORDS = { three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fourteen: 14 }

function parseDays(prompt) {
  const digits = prompt.match(/(\d+)[\s-]*(days?|nights?)\b/i)
  if (digits) return digits[1]
  const word = prompt.match(/\b(three|four|five|six|seven|eight|nine|ten|fourteen)[\s-]*(days?|nights?)\b/i)
  if (word) return String(NUMBER_WORDS[word[1].toLowerCase()])
  return /\b(a|one) week\b/i.test(prompt) ? '7' : null
}

const pickOf = (options, id) => options.find((o) => o.id === id)
const cityOptions = () => CITY_ORDER.map((id) => ({ id, label: cities[id].name, detail: cities[id].detail, by: cities[id].by, quote: cities[id].quote }))

function specContent(spec) {
  switch (spec.kind) {
    case 'budget':
      return { icon: 'budget', title: 'Budget', question: 'What’s your budget per person?', multi: false, options: budgets.map((b) => ({ ...b, chip: `Budget ${b.label}` })) }
    case 'days':
      return { icon: 'days', title: 'Days', question: 'How many days?', multi: false, options: dayOptions.map((d) => ({ ...d, chip: d.label })) }
    case 'places':
      return { icon: 'places', title: 'Places', question: 'Which cities do you want to visit?', multi: true, options: cityOptions().map((c) => ({ ...c, chip: c.label })) }
    case 'food':
      return { icon: 'food', title: 'Food', question: 'What do you want to eat?', multi: true, options: foods.map((f) => ({ ...f, chip: f.label })) }
    case 'stay': {
      const budget = pickOf(budgets, spec.tier)
      return {
        icon: 'stay',
        title: 'Where to stay',
        question: 'Where do you want to stay?',
        context: `With a budget of ${budget.label}`,
        multi: false,
        options: stays[spec.tier].map((s) => ({ ...s, detail: `${s.detail} · ₹${s.nightly.toLocaleString('en-IN')} a night each`, chip: `Stay: ${s.label}` })),
      }
    }
    case 'pace':
      return { icon: 'pace', title: 'Pace', question: 'How packed should the days be?', context: 'Because of how long you’re going', multi: false, options: paces.map((p) => ({ ...p, chip: `Pace: ${p.label}` })) }
    case 'attractions':
      return {
        icon: 'sights',
        title: cities[spec.city].name,
        question: `What do you want to see in ${cities[spec.city].name}?`,
        context: `Because you chose ${cities[spec.city].name}`,
        multi: true,
        options: attractions[spec.city].map((a) => ({ ...a, chip: a.label })),
      }
    case 'spots': {
      const food = pickOf(foods, spec.food)
      return {
        icon: 'food',
        title: food.label,
        question: `Where do you want to eat ${food.label.toLowerCase()}?`,
        context: `Because you picked ${food.label.toLowerCase()}`,
        multi: true,
        options: spots[spec.food].map((s) => ({ ...s, chip: s.label })),
      }
    }
    default:
      return { icon: 'plane', title: '', question: null, options: [] }
  }
}

// What the agent says it's doing while a node is still a placeholder.
function thinkMessage(spec) {
  switch (spec.kind) {
    case 'budget':
      return 'Checking what your friends spent…'
    case 'days':
      return 'Looking at how long they stayed…'
    case 'places':
      return 'Checking where they went…'
    case 'food':
      return 'Asking what they ate…'
    case 'stay':
      return 'Looking at places to stay in your budget…'
    case 'pace':
      return 'Working out how packed your days can be…'
    case 'attractions':
      return `Looking at what friends did in ${cities[spec.city].name}…`
    case 'spots':
      return 'Finding where they ate it…'
    default:
      return 'Thinking…'
  }
}

/** Nodes that choosing an option on `spec` should grow, with the key that names each. */
function childSpecs(spec, optionId) {
  const order = (list) => Math.max(0, list.indexOf(optionId))
  switch (spec.kind) {
    case 'budget':
      return [{ key: 'stay', order: 0, spec: { kind: 'stay', tier: optionId } }]
    case 'days':
      return [{ key: 'pace', order: 0, spec: { kind: 'pace' } }]
    case 'places':
      return [{ key: `attractions-${optionId}`, order: order(CITY_ORDER), spec: { kind: 'attractions', city: optionId } }]
    case 'food':
      return [{ key: `spots-${optionId}`, order: order(foods.map((f) => f.id)), spec: { kind: 'spots', food: optionId } }]
    default:
      return []
  }
}

const MORE_DAYS = 'days'

export default {
  id: 'trip',
  icon: 'plane',
  // A prompt starts a trip plan when it's about travelling somewhere we know.
  detect: (prompt) => /\b(japan|tokyo|kyoto|osaka)\b/i.test(prompt) && /\b(trip|travel|plan|planner|itinerary|holiday|vacation|visit|week|days?)\b/i.test(prompt),
  title(prompt) {
    const days = parseDays(prompt)
    return days ? `${days}-day trip to Japan` : 'Trip to Japan'
  },
  // The first questions the trip node asks; a number of days in the prompt is already answered.
  branches(prompt) {
    const days = parseDays(prompt)
    return [{ kind: 'budget' }, { kind: 'days', selected: days ? [days] : [] }, { kind: 'places' }, { kind: 'food' }]
  },
  // Kinds whose options have long labels (one per row), for guessing node heights.
  longLabels: new Set(['attractions', 'spots', 'stay', 'budget', 'pace']),
  specContent,
  thinkMessage,
  childSpecs,
  describeNode,
  think: thinkAboutTrip,
  draft: draftItinerary,
  answerPrompt,
  copy: {
    draft: 'Draft my whole itinerary',
    draftAgain: 'Draft again',
    placeholder: 'Ask your agent to draft your itinerary…',
    placeholderAgain: 'Ask your agent to draft it again…',
    noPicks: 'Pick a few things on the branches first, then I’ll draft your itinerary.',
    ready: 'Itinerary ready',
    documentLabel: 'Itinerary',
    previewLabel: 'Itinerary document',
    drafting: 'Drafting your itinerary…',
    footer: 'Drafted by your personal agent from your picks and what your friends shared. Prices are rough estimates.',
  },
  // The document in miniature, for a collapsed trip.
  preview: (doc) => ({
    title: doc.title,
    summary: doc.summary,
    unit: MORE_DAYS,
    lines: doc.days.map((day) => `Day ${day.n} · ${day.cityName} · ${day.items.map((i) => i.text).slice(0, 2).join(', ')}`),
  }),
}
