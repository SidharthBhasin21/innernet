// Frontend-only mock of the agent answering a question the user typed on a node
// ("what about sleep?"). It works out the topic from keywords and answers from
// what the user's network shared. The UI only depends on the result's shape, so
// a real agent can replace this later.

import { topics } from '../../data/fitnessTopics'
import { getUser } from '../../data/mockUsers'
import { sentenceList } from '../flows/shared'
import { readContext } from './context'

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const short = (text, max = 48) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)

// The topic whose keywords the question mentions most.
function matchTopic(prompt) {
  const lower = prompt.toLowerCase()
  const scored = topics
    .map((topic) => ({ topic, score: topic.keywords.filter((k) => new RegExp(`\\b${k}`).test(lower)).length }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored[0]?.topic ?? null
}

/**
 * What the agent answers to a custom question.
 * @returns {{ topic: string|null, city: null, title: string, reply: string, options: Array, suggested: string[] }}
 */
export function answerPrompt(prompt, plan) {
  const ctx = readContext(plan)
  const topic = matchTopic(prompt)

  // Nothing in the network on this: say so, and offer to keep it as a note.
  if (!topic) {
    return {
      topic: null,
      city: null,
      title: short(prompt, 40),
      reply: `Nobody in your network has shared anything about “${short(prompt, 60)}” yet, so I can’t suggest what your friends did. I can add it to your plan as a note.`,
      options: [{ id: 'note', label: `Add “${short(prompt, 28)}” as a note`, chip: `Note: ${short(prompt, 24)}`, detail: 'It will appear in your plan’s notes.', note: true }],
      suggested: [],
    }
  }

  const options = topic.options.map((o) => ({ id: slug(o.label), label: o.label, chip: o.label, detail: o.detail, by: o.by, quote: o.quote }))
  const recommended = options.filter((o) => o.by)
  const goal = ctx.goal ? `, with your goal to ${ctx.goal.label.toLowerCase()} in mind` : ''
  return {
    topic: topic.id,
    city: null,
    title: topic.title,
    reply: `Here’s what your network shared about ${topic.title.toLowerCase()}${goal}.${recommended.length ? ` ${sentenceList(recommended.map((o) => getUser(o.by).name.split(' ')[0]))} ${recommended.length === 1 ? 'has' : 'have'} a favourite.` : ''}`,
    options,
    suggested: (recommended.length ? recommended : options).slice(0, 2).map((o) => o.id),
  }
}
