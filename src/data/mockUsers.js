const photo = (id) => `https://images.unsplash.com/photo-${id}?w=160&h=160&fit=crop&crop=faces`

// Mock social graph. Avatars are Unsplash portraits. `degree` is relative to the current user (Sidharth).
export const currentUser = {
  id: 'sidharth',
  name: 'Sidharth',
  username: 'sidharth',
  hue: 'indigo',
  avatar: photo('1507003211169-0a1dd7228f2d'),
}

export const users = [
  { id: 'priya', name: 'Priya Sharma', username: 'priya', hue: 'pink', degree: 1, avatar: photo('1494790108377-be9c29b29330') },
  { id: 'arjun', name: 'Arjun Mehta', username: 'arjun', hue: 'blue', degree: 1, avatar: photo('1500648767791-00dcc994a43e') },
  { id: 'meera', name: 'Meera Kapoor', username: 'meera', hue: 'purple', degree: 1, avatar: photo('1438761681033-6461ffad8d80') },
  { id: 'karan', name: 'Karan Singh', username: 'karan', hue: 'green', degree: 1, avatar: photo('1472099645785-5658abf4ff4e') },
  { id: 'rohan', name: 'Rohan Verma', username: 'rohan', hue: 'amber', degree: 2, avatar: photo('1506794778202-cad84cf45f1d') },
]

export const getUser = (id) => (id === currentUser.id ? currentUser : users.find((u) => u.id === id))
