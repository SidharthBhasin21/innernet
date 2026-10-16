// Frontend-only mock of the personal agent. The UI only depends on the
// `askAgent` contract (activity callbacks + a resolved reply), so this module
// can later be swapped for a real agent orchestrator.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const networkSteps = [
  { status: 'thinking', message: 'Understanding your question…', ms: 700 },
  { status: 'searching_connections', message: 'Checking your connections…', ms: 1100 },
  { status: 'searching_friends_of_friends', message: 'Checking friends of friends…', ms: 900 },
  { status: 'aggregating', message: 'Looking through experiences…', ms: 800 },
  { status: 'comparing', message: 'Comparing recommendations…', ms: 700 },
  { status: 'responding', message: 'Building your answer…', ms: 600 },
]

const privateSteps = [
  { status: 'thinking', message: 'Thinking…', ms: 800 },
  { status: 'responding', message: 'Building your answer…', ms: 700 },
]

// Topics the mock network has shared experiences about.
const intents = [
  {
    id: 'travel',
    match: /\b(trip|travel|japan|tokyo|kyoto|visit|itinerary|flight|hotel|vacation)\b/i,
    social: true,
    reply:
      'I asked people in your network who have travelled recently. A few of your connections spent time in Japan this year and suggest splitting the week between Tokyo and Kyoto, with a day trip to Nara.\n\nWant me to turn this into a day-by-day plan?',
  },
  {
    id: 'food',
    match: /\b(restaurant|food|eat|dinner|lunch|cafe|coffee|brunch|bar)\b/i,
    social: true,
    reply:
      'Your connections have shared several dining experiences. Most people loved the food and ambience at their top picks, though a couple mentioned slow service on weekends.\n\nShould I narrow it down by area or budget?',
  },
  {
    id: 'fitness',
    match: /\b(fitness|workout|gym|run|running|exercise|training|yoga)\b/i,
    social: true,
    reply:
      'A few friends follow structured 4-week plans. The common pattern: three strength days, two short runs, and one active recovery day.\n\nWant me to adapt that to your schedule?',
  },
  {
    id: 'product',
    match: /\b(buy|product|headphones|laptop|phone|camera|recommend|best)\b/i,
    social: true,
    reply:
      'I checked what people you trust have used and reviewed. Opinions are mostly positive, with some disagreement on battery life and price.\n\nShall I compare the top options side by side?',
  },
]

const fallbackReply = (prompt) =>
  `Here's a first pass on "${prompt.trim()}".\n\nI kept this one between us — tell me more about what you're after and I can ask people in your network if their experiences would help.`

const noKnowledgeReply =
  "I checked your connections and friends of friends, but nobody has shared experiences about this yet. I can answer from general knowledge instead, or you can ask again later."

export function detectIntent(prompt) {
  return intents.find((intent) => intent.match.test(prompt)) ?? null
}

/**
 * Ask the personal agent something in the context of one chat.
 * @param {{ prompt: string, history: Array, onActivity: (activity) => void }} request
 * @returns {Promise<{ content: string }>}
 */
export async function askAgent({ prompt, onActivity }) {
  const intent = detectIntent(prompt)
  const isQuestion = /\?\s*$|^(where|what|which|who|any)\b/i.test(prompt.trim())
  const steps = intent?.social || isQuestion ? networkSteps : privateSteps

  for (const { status, message, ms } of steps) {
    onActivity({ status, message })
    await wait(ms)
  }

  onActivity({ status: 'complete', message: 'Done' })

  if (intent) return { content: intent.reply }
  if (isQuestion) return { content: noKnowledgeReply }
  return { content: fallbackReply(prompt) }
}
