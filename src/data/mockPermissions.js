// What the current user's personal agent may share when a connection's agent
// asks. Conceptual in the prototype: the mock agent engine doesn't read it yet,
// and the real system will enforce it server-side through a permission gateway.
export const sharingCategories = [
  { id: 'restaurants', label: 'Restaurant experiences', description: "Places you've eaten and how you rated them", shared: true },
  { id: 'travel', label: 'Travel experiences', description: "Trips and places you've visited", shared: true },
  { id: 'products', label: 'Product reviews', description: "Things you've bought and what you thought", shared: true },
  { id: 'conversations', label: 'Personal conversations', description: 'Your chats and messages', shared: false },
  { id: 'location', label: 'Location', description: 'Where you are or have recently been', shared: false },
  { id: 'financial', label: 'Financial information', description: 'Budgets, spending and prices you paid', shared: false },
  { id: 'health', label: 'Health information', description: 'Fitness, medical and wellbeing details', shared: false },
]
