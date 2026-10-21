// Frontend-only mock of the agent thinking about a new fitness plan before it
// asks anything: it looks through what the user's network shared, then says what
// it found. The UI only depends on the contract (activity callbacks + a resolved
// note), so a real agent can replace it later.

import { friendPlans } from '../../data/fitnessPlan'
import { getUser } from '../../data/mockUsers'
import { wait } from '../flows/shared'

/**
 * @param {{ prompt: string, onActivity: (activity) => void }} request
 * @returns {Promise<{ note: string }>}
 */
export async function thinkAboutFitness({ onActivity }) {
  const friends = friendPlans.filter((p) => getUser(p.userId).degree === 1)
  const fof = friendPlans.length - friends.length
  const perWeek = friendPlans.map((p) => p.perWeek)

  const steps = [
    { status: 'thinking', message: 'Reading what you want to do…', ms: 600 },
    { status: 'searching_connections', message: 'Checking your connections…', ms: 700 },
    { status: 'searching_connections', message: `${friends.length} of your friends have followed a plan like this`, ms: 700 },
    { status: 'searching_friends_of_friends', message: `Friends of friends add ${fof} more`, ms: 650 },
    { status: 'aggregating', message: 'Reading how they trained and ate…', ms: 700 },
    { status: 'comparing', message: 'Working out what to ask you…', ms: 600 },
  ]
  for (const { status, message, ms } of steps) {
    onActivity({ status, message })
    await wait(ms)
  }
  onActivity({ status: 'complete', message: 'Done' })

  return {
    note: `${friendPlans.length} people you know have done a plan like this, training ${Math.min(...perWeek)}–${Math.max(...perWeek)} days a week. I’ll ask a few things to shape yours, and suggest what worked for them.`,
  }
}
