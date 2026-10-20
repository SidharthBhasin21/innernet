// Small helpers every flow (trip, fitness…) shares.

// Changes when any choice changes, so a drafted document can tell it's out of date.
export const selectionSignature = (plan) => JSON.stringify(plan.nodes.map((n) => [n.id, n.selected]))

// How many things the user has picked on nodes the agent has finished.
export const countPicks = (plan) => plan.nodes.filter((n) => n.status !== 'thinking').reduce((sum, n) => sum + n.selected.length, 0)

// Small helpers the flows share when they write what the agent says.
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
export const plural = (n, word) => `${n} ${n === 1 ? word : /[^aeiou]y$/.test(word) ? `${word.slice(0, -1)}ies` : `${word}s`}`
export const sentenceList = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : (items[0] ?? ''))
export const byId = (list, id) => list.find((item) => item.id === id)
export const advice = {
  warn: (text) => ({ tone: 'warn', text }),
  tip: (text) => ({ tone: 'tip', text }),
  ok: (text) => ({ tone: 'ok', text }),
}
