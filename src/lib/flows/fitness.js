// The fitness-plan flow: what its tree asks, how the agent thinks about it, and
// the plan it drafts. The generic tree code (lib/trip/planModel.js) works with
// any flow that has this shape. Its nodes carry `spec.flow: 'fitness'`.

import { diets, goals, kits, lengths, meals, sessionOptions, wheres } from '../../data/fitnessPlan'
import { glossary } from '../../data/fitnessGlossary'
import { byId } from './shared'
import { lookupPhrase } from './lookup'
import { focusFor, parseWeeks } from '../fitness/context'
import { answerPrompt } from '../fitness/custom'
import { thinkAboutFitness } from '../fitness/thinking'
import { describeNode } from '../fitness/reasoning'
import { buildPlan, draftPlan } from '../fitness/plan'

const chip = (prefix) => (o) => ({ ...o, chip: prefix ? `${prefix}: ${o.label}` : o.label })

function specContent(spec) {
  switch (spec.kind) {
    case 'goal':
      return { icon: 'goal', title: 'Goal', question: 'What’s your main goal?', multi: false, options: goals.map(chip()) }
    case 'sessions':
      return { icon: 'sessions', title: 'Days a week', question: 'How many days a week can you train?', multi: false, options: sessionOptions.map((o) => ({ ...o, chip: `${o.label} a week` })) }
    case 'where':
      return { icon: 'where', title: 'Where', question: 'Where will you train?', multi: false, options: wheres.map(chip()) }
    case 'diet':
      return { icon: 'diet', title: 'Food', question: 'How do you want to eat?', multi: false, options: diets.map(chip()) }
    case 'focus': {
      const goal = byId(goals, spec.goal)
      return { icon: 'focus', title: 'Focus', question: 'What should your sessions focus on?', context: `Because you want to ${goal.label.toLowerCase()}`, multi: true, options: focusFor(spec.goal).map(chip()) }
    }
    case 'length':
      return { icon: 'length', title: 'Session length', question: 'How long is each session?', context: 'Because of how often you train', multi: false, options: lengths.map(chip()) }
    case 'kit': {
      const where = byId(wheres, spec.where)
      return { icon: 'kit', title: 'Equipment', question: `What do you have ${where.label.toLowerCase()}?`, context: `Because you train ${where.label.toLowerCase()}`, multi: true, options: kits[spec.where].map(chip()) }
    }
    case 'meals': {
      const diet = byId(diets, spec.diet)
      return {
        icon: 'meals',
        title: diet.label,
        question: 'Which meals do you want to build around?',
        context: `Because you chose ${diet.label.toLowerCase()}`,
        multi: true,
        options: meals[spec.diet].map((m) => ({ ...m, label: m.label, detail: `${m.meal} · ${m.detail}`, chip: m.label })),
      }
    }
    default:
      return { icon: 'dumbbell', title: '', question: null, options: [] }
  }
}

// What the agent says it's doing while a node is still a placeholder.
function thinkMessage(spec) {
  switch (spec.kind) {
    case 'goal':
      return 'Checking what your friends were after…'
    case 'sessions':
      return 'Looking at how often they trained…'
    case 'where':
      return 'Checking where they worked out…'
    case 'diet':
      return 'Asking how they ate…'
    case 'focus':
      return 'Looking at what they focused on…'
    case 'length':
      return 'Checking how long their sessions were…'
    case 'kit':
      return 'Finding out what kit they used…'
    case 'meals':
      return 'Finding the meals they stuck to…'
    default:
      return 'Thinking…'
  }
}

/** Nodes that choosing an option on `spec` should grow, with the key that names each. */
function childSpecs(spec, optionId) {
  switch (spec.kind) {
    case 'goal':
      return [{ key: `focus-${optionId}`, order: 0, spec: { kind: 'focus', goal: optionId } }]
    case 'sessions':
      return [{ key: 'length', order: 0, spec: { kind: 'length' } }]
    case 'where':
      return [{ key: `kit-${optionId}`, order: 0, spec: { kind: 'kit', where: optionId } }]
    case 'diet':
      return [{ key: `meals-${optionId}`, order: 0, spec: { kind: 'meals', diet: optionId } }]
    default:
      return []
  }
}

export default {
  id: 'fitness',
  icon: 'dumbbell',
  detect: (prompt) => /\b(fitness|workout|work-?out|exercise|gym|training)\b/i.test(prompt) && /\b(plan|routine|program|programme|schedule|weeks?)\b/i.test(prompt),
  title: (prompt) => `${parseWeeks(prompt)}-week fitness plan`,
  // The first questions the node asks.
  branches: () => [{ kind: 'goal' }, { kind: 'sessions' }, { kind: 'where' }, { kind: 'diet' }],
  longLabels: new Set(['focus', 'kit', 'meals', 'goal', 'diet', 'where']),
  specContent,
  thinkMessage,
  childSpecs,
  describeNode,
  think: thinkAboutFitness,
  draft: draftPlan,
  build: buildPlan,
  answerPrompt,
  lookup: (phrase, where, query) => lookupPhrase(phrase, glossary, where, query),
  copy: {
    draft: 'Draft my whole plan',
    draftAgain: 'Draft again',
    placeholder: 'Ask your agent to draft your fitness plan…',
    placeholderAgain: 'Ask your agent to draft it again…',
    noPicks: 'Pick a few things on the branches first, then I’ll draft your plan.',
    ready: 'Plan ready',
    documentLabel: 'Plan',
    previewLabel: 'Fitness plan document',
    drafting: 'Drafting your plan…',
    footer: 'Drafted by your personal agent from your picks and what your friends shared. Check with a doctor before starting if you have any health concerns.',
  },
  // The document in miniature, for a collapsed plan.
  preview: (doc) => ({
    title: doc.title,
    summary: doc.summary,
    unit: 'weeks',
    lines: doc.weeks.map((week) => `Week ${week.n} · ${week.theme} · ${week.sessions.map((s) => s.title).slice(0, 2).join(', ')}`),
  }),
}
