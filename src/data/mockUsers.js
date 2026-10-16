// Mock social graph. `degree` is relative to the current user (Sidharth).
export const currentUser = {
  id: 'sidharth',
  name: 'Sidharth',
  username: 'sidharth',
  hue: 'indigo',
}

export const users = [
  { id: 'priya', name: 'Priya Sharma', username: 'priya', hue: 'pink', degree: 1 },
  { id: 'arjun', name: 'Arjun Mehta', username: 'arjun', hue: 'blue', degree: 1 },
  { id: 'meera', name: 'Meera Kapoor', username: 'meera', hue: 'purple', degree: 1 },
  { id: 'karan', name: 'Karan Singh', username: 'karan', hue: 'green', degree: 1 },
  { id: 'rohan', name: 'Rohan Verma', username: 'rohan', hue: 'amber', degree: 2 },
]

export const getUser = (id) => (id === currentUser.id ? currentUser : users.find((u) => u.id === id))
