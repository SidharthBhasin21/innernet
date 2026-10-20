// The trip tree. A plan starts as one node (the trip itself) with four branches
// (budget, days, places, food). Choosing an option on a node can grow new
// nodes from it, with context about that choice. Everything is plain data, so
// the tree can be saved and later come from a real agent.
//
// plan.nodes: [{ id, parentId, order, spec, selected: [optionId], status, thinkMs }]
//   spec: what the node asks, e.g. { kind: 'attractions', city: 'kyoto' }
//   status: 'thinking' while the agent works it out (shown as a placeholder), then
//   'ready'. A node appears once the node above it is ready.

import { attractions, budgets, cities, CITY_ORDER, dayOptions, foods, paces, spots, stays } from '../../data/japanPlan'
import { createId } from '../chats'
import { answerPrompt } from './custom'

const NUMBER_WORDS = { three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fourteen: 14 }

// A prompt starts a trip plan when it's about travelling somewhere we know.
export const detectTrip = (prompt) =>
  /\b(japan|tokyo|kyoto|osaka)\b/i.test(prompt) && /\b(trip|travel|plan|planner|itinerary|holiday|vacation|visit|week|days?)\b/i.test(prompt)

function parseDays(prompt) {
  const digits = prompt.match(/(\d+)[\s-]*(days?|nights?)\b/i)
  if (digits) return digits[1]
  const word = prompt.match(/\b(three|four|five|six|seven|eight|nine|ten|fourteen)[\s-]*(days?|nights?)\b/i)
  if (word) return String(NUMBER_WORDS[word[1].toLowerCase()])
  return /\b(a|one) week\b/i.test(prompt) ? '7' : null
}

// --- What each node asks ---------------------------------------------------------

const pickOf = (options, id) => options.find((o) => o.id === id)
const cityOptions = () => CITY_ORDER.map((id) => ({ id, label: cities[id].name, detail: cities[id].detail, by: cities[id].by, quote: cities[id].quote }))

/** The question, context and options a node shows, from its spec. */
export function specContent(spec) {
  switch (spec.kind) {
    case 'root':
      return { icon: 'plane', title: spec.title, question: null, options: [] }
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
    case 'custom':
      // A question the user typed: the agent's answer is stored on the node.
      return { icon: 'ask', title: spec.answer.title, question: spec.answer.title, context: `You asked: “${spec.prompt}”`, multi: true, options: spec.answer.options }
    default:
      return { icon: 'plane', title: '', question: null, options: [] }
  }
}

// What the agent says it's doing while a node is still a placeholder.
export function thinkMessage(spec) {
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
    case 'custom':
      return `Thinking about “${spec.prompt.length > 40 ? `${spec.prompt.slice(0, 39)}…` : spec.prompt}”…`
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

// --- Building and changing the tree ----------------------------------------------

const nodeId = (planId, key) => `${planId}/${key}`
const sameSpec = (a, b) => JSON.stringify(a) === JSON.stringify(b)

export function titleFor(prompt) {
  const days = parseDays(prompt)
  return days ? `${days}-day trip to Japan` : 'Trip to Japan'
}

export function createPlan({ prompt, position }) {
  const id = createId('plan')
  const now = new Date().toISOString()
  // The trip node thinks first; its branches then appear one after another.
  const root = { id: nodeId(id, 'root'), parentId: null, order: 0, spec: { kind: 'root', title: titleFor(prompt), prompt }, selected: [], status: 'thinking' }
  const branch = (key, order, selected = []) => ({ id: nodeId(id, key), parentId: root.id, order, spec: { kind: key }, selected, status: 'thinking', thinkMs: 900 + order * 450 })
  const days = parseDays(prompt)
  let plan = {
    id,
    prompt,
    position,
    nodes: [root, branch('budget', 0), branch('days', 1, days ? [days] : []), branch('places', 2), branch('food', 3)],
    itinerary: null,
    collapsed: false,
    status: 'idle',
    activity: null,
    createdAt: now,
    updatedAt: now,
  }
  // A number of days in the prompt is already a choice, so its follow-up grows.
  if (days) plan = { ...plan, nodes: syncChildren(plan.nodes, nodeId(id, 'days')) }
  return plan
}

const descendantsOf = (nodes, id) => {
  const kids = nodes.filter((n) => n.parentId === id)
  return [...kids.map((k) => k.id), ...kids.flatMap((k) => descendantsOf(nodes, k.id))]
}

// Make the children under `parentId` match what its selections ask for: grow
// missing ones, drop ones nothing asks for any more, rebuild ones whose
// context changed (e.g. a new budget changes the stay options).
function syncChildren(nodes, parentId) {
  const parent = nodes.find((n) => n.id === parentId)
  const planId = parentId.split('/')[0]
  const wanted = new Map()
  parent.selected.forEach((optionId) => {
    childSpecs(parent.spec, optionId).forEach((child) => wanted.set(child.key, child))
  })

  let next = nodes
  nodes
    .filter((n) => n.parentId === parentId)
    .forEach((child) => {
      // Questions the user added by hand stay, whatever is chosen on this node.
      if (child.spec.kind === 'custom') return
      const key = child.id.slice(parentId.length + 1)
      const want = wanted.get(key)
      if (want && sameSpec(want.spec, child.spec)) return
      const gone = new Set([child.id, ...descendantsOf(nodes, child.id)])
      next = next.filter((n) => !gone.has(n.id))
    })
  let fresh = 0
  wanted.forEach((want, key) => {
    const id = nodeId(planId, `${parentId.slice(planId.length + 1)}/${key}`)
    if (next.some((n) => n.id === id)) return
    // New nodes think for a moment before they show their question, one after another.
    next = [
      ...next,
      {
        id,
        parentId,
        order: want.order,
        spec: want.spec,
        selected: [],
        status: 'thinking',
        thinkMs: 1200 + fresh * 450,
        // A new node starts where its parent was moved to (if it was), so it lands near it.
        ...(parent.offset && { offset: parent.offset }),
      },
    ]
    fresh += 1
  })
  return next
}

/**
 * A question the user typed on a node becomes a new node under it: the agent
 * works out an answer (stored on the node) and the node thinks for a moment
 * before showing it. `askId` makes the node's id unique.
 */
export function buildCustomNode(plan, parentId, prompt, askId) {
  const parent = plan.nodes.find((n) => n.id === parentId)
  const text = prompt.trim().slice(0, 140)
  const earlier = plan.nodes.filter((n) => n.parentId === parentId && n.spec.kind === 'custom').length
  return {
    id: `${parentId}/${askId}`,
    parentId,
    // After the questions the agent asked itself.
    order: 1000 + earlier,
    spec: { kind: 'custom', prompt: text, answer: answerPrompt(text, plan, parent) },
    selected: [],
    status: 'thinking',
    thinkMs: 1400,
    ...(parent.offset && { offset: parent.offset }),
  }
}

/** Remove a node the user added, and everything that grew from it. */
export function removeNodeTree(plan, id) {
  const gone = new Set([id, ...descendantsOf(plan.nodes, id)])
  return { ...plan, nodes: plan.nodes.filter((n) => !gone.has(n.id)), updatedAt: new Date().toISOString() }
}

/** Choose (or un-choose) one option on one node, growing or pruning branches. */
export function toggleOption(plan, nodeIdToToggle, optionId) {
  const node = plan.nodes.find((n) => n.id === nodeIdToToggle)
  if (!node) return plan
  const { multi } = specContent(node.spec)
  const has = node.selected.includes(optionId)
  const selected = multi ? (has ? node.selected.filter((id) => id !== optionId) : [...node.selected, optionId]) : has ? [] : [optionId]
  const nodes = plan.nodes.map((n) => (n.id === node.id ? { ...n, selected } : n))
  return { ...plan, nodes: syncChildren(nodes, node.id), updatedAt: new Date().toISOString() }
}

// --- Reading the tree -------------------------------------------------------------

export const childrenOf = (plan, id) => plan.nodes.filter((n) => n.parentId === id).sort((a, b) => a.order - b.order)

/** Every node in tree order (parent before children). */
export function inTreeOrder(plan) {
  const walk = (id) => childrenOf(plan, id).flatMap((child) => [child, ...walk(child.id)])
  const root = plan.nodes.find((n) => !n.parentId)
  return [root, ...walk(root.id)]
}

/** The nodes on screen: a node shows once the node above it is ready. */
export function visibleNodes(plan) {
  const byId = new Map(plan.nodes.map((n) => [n.id, n]))
  const shows = (node) => !node.parentId || (byId.get(node.parentId).status !== 'thinking' && shows(byId.get(node.parentId)))
  return plan.nodes.filter(shows)
}

/** Everything the user has chosen, in tree order: the chips below the canvas. */
export function collectPicks(plan) {
  return inTreeOrder(plan)
    .filter((node) => node.status !== 'thinking')
    .flatMap((node) => {
      const { options } = specContent(node.spec)
      return node.selected.map((optionId) => {
        const option = pickOf(options, optionId)
        return { nodeId: node.id, optionId, kind: node.spec.kind, chip: option.chip ?? option.label }
      })
    })
}

// Changes when any choice changes, so an itinerary can tell it's out of date.
export const selectionSignature = (plan) => JSON.stringify(plan.nodes.map((n) => [n.id, n.selected]))

// --- Laying the tree out ----------------------------------------------------------

export const NODE_WIDTH = 300
export const ROOT_WIDTH = 280
// A collapsed tree is one node: a trip card, with its document previewed on it.
export const COLLAPSED_WIDTH = 340
export const collapsedHeight = (plan) => (plan.itinerary ? 380 : 190)
const GAP_X = 40
const GAP_Y = 72

// Before a node is measured: a header, the option chips (short labels wrap
// three to a row, long ones go one per row), and the reserved info area.
const LONG_LABELS = new Set(['attractions', 'spots', 'stay', 'budget', 'pace', 'custom'])
const estimateHeight = (node) => {
  if (node.spec.kind === 'root') return node.status === 'thinking' ? 130 : 170
  if (node.status === 'thinking') return 190
  const n = specContent(node.spec).options.length
  return 250 + (LONG_LABELS.has(node.spec.kind) ? n * 40 : Math.ceil(n / 3) * 40)
}
const widthOf = (node) => (node.spec.kind === 'root' ? ROOT_WIDTH : NODE_WIDTH)

/**
 * Where every node goes, top to bottom: the trip node on top, each choice's
 * follow-ups in the row below it, every parent centred over its children.
 * `heights` holds real measured heights (rows are as tall as their tallest node).
 * Offsets are from the trip node's top-left corner; `left`/`right` give how far
 * the tree reaches either side of it, `bottom` how far down.
 */
export function layoutPlan(fullPlan, heights = {}) {
  // Only what's on screen takes room.
  const plan = { ...fullPlan, nodes: visibleNodes(fullPlan) }
  const root = plan.nodes.find((n) => !n.parentId)
  const depths = {}
  const xs = {}
  let cursor = 0

  // Leaves take the next free column; a parent sits centred over its children.
  const place = (node, depth) => {
    depths[node.id] = depth
    const kids = childrenOf(plan, node.id)
    if (!kids.length) {
      xs[node.id] = cursor
      cursor += widthOf(node) + GAP_X
      return
    }
    kids.forEach((kid) => place(kid, depth + 1))
    const start = xs[kids[0].id]
    const end = xs[kids.at(-1).id] + widthOf(kids.at(-1))
    xs[node.id] = (start + end) / 2 - widthOf(node) / 2
  }
  place(root, 0)

  const rowHeight = []
  plan.nodes.forEach((n) => {
    rowHeight[depths[n.id]] = Math.max(rowHeight[depths[n.id]] ?? 0, heights[n.id] ?? estimateHeight(n))
  })
  const rowY = []
  let y = 0
  rowHeight.forEach((h, depth) => {
    rowY[depth] = y
    y += h + GAP_Y
  })

  const offsets = Object.fromEntries(plan.nodes.map((n) => [n.id, { x: xs[n.id] - xs[root.id], y: rowY[depths[n.id]] }]))
  const lefts = plan.nodes.map((n) => offsets[n.id].x)
  const rights = plan.nodes.map((n) => offsets[n.id].x + widthOf(n))
  return { offsets, left: Math.min(...lefts), right: Math.max(...rights), bottom: y - GAP_Y }
}

/** The nodes' children as React Flow edges. */
export const edgesOf = (plan) => visibleNodes(plan).filter((n) => n.parentId).map((n) => ({ id: `edge-${n.id}`, source: n.parentId, target: n.id }))
