// Frontend-only mock of the agent explaining a phrase the user selected. It
// matches the phrase against a flow's glossary; when it has nothing it says so
// plainly instead of making something up. The UI only depends on the result's
// shape, so a real agent can replace this later.

import { getUser } from '../../data/mockUsers'

const normalise = (text) => text.toLowerCase().replace(/[“”"‘’']/g, '').replace(/\s+/g, ' ').trim()
const short = (text, max = 40) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)

/**
 * @param {string} phrase the selected text
 * @param {Array} glossary entries `{ terms, title, meaning, tip?, by?, quote? }`
 * @param {{ question?: string|null }} where the node the text was selected on
 * @param {string} query what the user asked about it; empty means "explain this"
 * @returns {{ phrase: string, title: string, meaning: string, tip: string|null, by: string|null, quote: string|null, known: boolean }}
 */
export function lookupPhrase(phrase, glossary, where = {}, query = '') {
  const needle = normalise(phrase)
  const hit = glossary.find((entry) => entry.terms.some((term) => needle.includes(term) || (needle.length >= 3 && term.includes(needle))))
  const asked = query.trim()
  // Asking what people think: answer with what a friend said, if anyone did.
  if (/\b(friend|friends|network|people|recommend|recommended|think|say|said)\b/i.test(asked)) {
    const friend = hit?.by ? getUser(hit.by) : null
    return {
      phrase,
      title: hit?.title ?? short(phrase),
      meaning: friend && hit.quote ? `${friend.name.split(' ')[0]} shared this about it: “${hit.quote}”` : `Nobody in your network has shared anything about “${short(phrase, 60)}”, so I can’t say what your friends think.`,
      tip: null,
      by: friend ? hit.by : null,
      quote: null,
      known: Boolean(friend),
      query: asked,
    }
  }
  if (hit) return { phrase, title: hit.title, meaning: hit.meaning, tip: hit.tip ?? null, by: hit.by ?? null, quote: hit.quote ?? null, known: true, query: asked || null }
  return {
    phrase,
    title: short(phrase),
    meaning: asked
      ? `I can’t answer “${short(asked, 60)}” about “${short(phrase, 40)}” from what your network shared. Keep this and use Add a branch to ask it another way.`
      : `I don’t have a ready explanation for “${short(phrase, 60)}”, and nobody in your network has shared anything about it${where.question ? ` (you were reading “${short(where.question, 50)}”)` : ''}. Keep this and use Add a branch to ask me something more specific.`,
    tip: null,
    by: null,
    quote: null,
    known: false,
    query: asked || null,
  }
}
