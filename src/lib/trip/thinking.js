// Frontend-only mock of the agent thinking about a new trip before it asks
// anything: it looks through what the user's network shared, then says what it
// found. The UI only depends on the contract (activity callbacks + a resolved
// note), so a real agent can replace it later.

import { friendTrips } from '../../data/japanPlan'
import { getUser } from '../../data/mockUsers'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const rupees = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`

/**
 * @param {{ prompt: string, onActivity: (activity) => void }} request
 * @returns {Promise<{ note: string }>}
 */
export async function thinkAboutTrip({ onActivity }) {
  const friends = friendTrips.filter((t) => getUser(t.userId).degree === 1)
  const fof = friendTrips.length - friends.length
  const days = friendTrips.map((t) => t.days)
  const spend = friendTrips.map((t) => t.spend)
  const range = (list) => `${Math.min(...list)}–${Math.max(...list)}`

  const steps = [
    { status: 'thinking', message: 'Reading what you want to do…', ms: 600 },
    { status: 'searching_connections', message: 'Checking your connections…', ms: 700 },
    { status: 'searching_connections', message: `${friends.length} of your friends have been to Japan`, ms: 700 },
    { status: 'searching_friends_of_friends', message: `Friends of friends add ${fof} more ${fof === 1 ? 'trip' : 'trips'}`, ms: 650 },
    { status: 'aggregating', message: 'Reading how they planned it…', ms: 700 },
    { status: 'comparing', message: 'Working out what to ask you…', ms: 600 },
  ]
  for (const { status, message, ms } of steps) {
    onActivity({ status, message })
    await wait(ms)
  }
  onActivity({ status: 'complete', message: 'Done' })

  return {
    note: `${friendTrips.length} people you know have done this, for ${range(days)} days and ${rupees(Math.min(...spend))}–${rupees(Math.max(...spend))} each. I’ll ask a few things to shape yours, and suggest what worked for them.`,
  }
}
