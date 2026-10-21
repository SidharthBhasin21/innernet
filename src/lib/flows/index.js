// The flows the app can run. Each is one complete use case (a Japan trip, a
// fitness plan…) with its own questions, reasoning and document. A prompt starts
// the first flow that recognises it; nodes and plans remember which flow they
// belong to (trip is the default, so older saves keep working).

import trip from './trip'
import fitness from './fitness'

export const flows = { trip, fitness }

export const detectFlow = (prompt) => Object.values(flows).find((flow) => flow.detect(prompt))?.id ?? null
export const flowOfSpec = (spec) => flows[spec.flow ?? 'trip']
export const flowOfPlan = (plan) => flows[plan.flow ?? 'trip']
export const planTitle = (plan) => flowOfPlan(plan).title(plan.prompt)
