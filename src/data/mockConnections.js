import { users } from './mockUsers'

// Latest conversation preview per direct connection.
const activity = {
  priya: { preview: "That's amazing!", time: '2m', online: true },
  arjun: { preview: 'Sent a photo', time: '15m', online: true },
  meera: { preview: "Let's collab on this", time: '1h', online: true },
  karan: { preview: "Sure, I'll check it", time: '3h', online: true },
  rohan: { preview: 'This looks great', time: '5h', online: false },
}

export const connections = users.map((user) => ({ user, ...activity[user.id] }))
