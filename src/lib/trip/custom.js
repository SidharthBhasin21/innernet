// Frontend-only mock of the agent answering a question the user typed on a node
// ("what about shopping in Tokyo?"). It works out the topic from keywords, the
// city from the question or the node it was asked from, and answers from what
// the user's network shared. The UI only depends on the result's shape, so a
// real agent can replace this later.

import { cities, CITY_ORDER } from '../../data/japanPlan'
import { topics } from '../../data/japanTopics'
import { readContext } from './context'

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const joined = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0])
const short = (text, max = 48) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)
const cityIn = (text) => CITY_ORDER.find((id) => new RegExp(`\\b${cities[id].name}\\b`, 'i').test(text)) ?? null

// The topic whose keywords the question mentions most.
function matchTopic(prompt) {
  const lower = prompt.toLowerCase()
  const scored = topics
    .map((topic) => ({ topic, score: topic.keywords.filter((k) => new RegExp(`\\b${k}`).test(lower)).length }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored[0]?.topic ?? null
}

// The city a question is about: one it names, else the one its node is about.
const parentCity = (parent) => (parent?.spec.kind === 'attractions' ? parent.spec.city : parent?.spec.kind === 'custom' ? parent.spec.answer.city : null)

/**
 * What the agent answers to a custom question.
 * @returns {{ topic: string|null, city: string|null, title: string, reply: string, options: Array, suggested: string[] }}
 */
export function answerPrompt(prompt, plan, parent) {
  const ctx = readContext(plan)
  const topic = matchTopic(prompt)
  const city = cityIn(prompt) ?? parentCity(parent) ?? null

  // Nothing in the network on this: say so, and offer to keep it as a note.
  if (!topic) {
    return {
      topic: null,
      city,
      title: short(prompt, 40),
      reply: `Nobody in your network has shared anything about “${short(prompt, 60)}” yet, so I can’t suggest places from what your friends did. I can add it to your itinerary as a note.`,
      options: [{ id: 'note', label: `Add “${short(prompt, 28)}” as a note`, chip: `Note: ${short(prompt, 24)}`, detail: 'It will appear in your itinerary notes.', note: true, city }],
      suggested: [],
    }
  }

  const wanted = city ? [city] : ctx.cities.length ? ctx.cities : ['tokyo', 'kyoto']
  const here = topic.options.filter((o) => wanted.includes(o.city))
  const options = (here.length ? here : topic.options).map((o) => ({
    id: `${slug(o.label)}-${o.city}`,
    label: o.label,
    chip: o.label,
    detail: `${cities[o.city].name} · ${o.detail}`,
    city: o.city,
    by: o.by,
    quote: o.quote,
    // Evening things go in the day's last sight slot, not the morning.
    ...((topic.id === 'nightlife' || /sunset|dusk|evening|night|after dark/i.test(o.label)) && { when: 'dusk' }),
  }))
  const names = joined(wanted.map((id) => cities[id].name))
  const where = city ? ` in ${cities[city].name}` : ` for ${names}`
  const recommended = options.filter((o) => o.by)
  return {
    topic: topic.id,
    city,
    title: city ? `${topic.title} in ${cities[city].name}` : topic.title,
    reply: here.length
      ? `Here’s what your network shared about ${topic.title.toLowerCase()}${where}.${recommended.length ? ` ${recommended.length === 1 ? 'One friend has' : `${recommended.length} friends have`} a favourite.` : ''}`
      : `Nobody has shared ${topic.title.toLowerCase()}${where}, but here’s what your friends shared in other cities.`,
    options,
    suggested: (recommended.length ? recommended : options).slice(0, 3).map((o) => o.id),
  }
}
