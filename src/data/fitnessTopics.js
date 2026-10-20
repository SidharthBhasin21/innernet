// Things people ask about beyond the main questions (sleep, running, sore knees…),
// with what the user's network shared. The agent matches a custom question to a
// topic by its keywords, then answers from these.

export const topics = [
  {
    id: 'sleep',
    title: 'Sleep & recovery',
    keywords: ['sleep', 'recovery', 'recover', 'rest', 'tired', 'fatigue', 'sore', 'soreness'],
    options: [
      { label: 'Fixed bedtime, 7.5 hours', detail: 'Same time every night, phone away', by: 'karan', quote: 'Sleep did more than any supplement.' },
      { label: 'One full rest day a week', detail: 'No training, a gentle walk at most', by: 'meera', quote: 'Rest days are when the progress happens.' },
      { label: 'Ten-minute evening stretch', detail: 'Hips and hamstrings before bed' },
    ],
  },
  {
    id: 'running',
    title: 'Running',
    keywords: ['run', 'running', 'jog', 'jogging', '5k', '10k', 'marathon'],
    options: [
      { label: 'Couch-to-5K on rest days', detail: 'Run-walk intervals, three a week', by: 'meera', quote: 'Keep it conversational for the first two weeks.' },
      { label: 'One long easy run on Saturday', detail: 'Add five minutes each week' },
      { label: 'Strides after an easy run', detail: 'Six short fast pickups, nothing hard' },
    ],
  },
  {
    id: 'injury',
    title: 'Knees, back & injuries',
    keywords: ['knee', 'knees', 'back pain', 'injury', 'injured', 'pain', 'shoulder', 'joint', 'hurt'],
    options: [
      { label: 'Box squats instead of deep squats', detail: 'Easier on the knees, same muscles', by: 'arjun', quote: 'Box squats saved my knees.' },
      { label: 'Glute bridges before every session', detail: 'Wakes up the hips and takes load off your lower back' },
      { label: 'Swap running for cycling', detail: 'Low impact, still builds stamina', by: 'priya' },
    ],
  },
  {
    id: 'supplements',
    title: 'Supplements',
    keywords: ['supplement', 'supplements', 'protein powder', 'whey', 'creatine', 'vitamin', 'powder'],
    options: [
      { label: 'Whey after training, only if needed', detail: 'Food first, powder to fill the gap', by: 'karan', quote: 'Food first. I only add a scoop when I miss a meal.' },
      { label: 'Creatine, 3 g a day', detail: 'Well studied, safe and cheap', by: 'arjun' },
      { label: 'A vitamin D check', detail: 'Worth a blood test before buying anything' },
    ],
  },
  {
    id: 'steps',
    title: 'Daily steps & walking',
    keywords: ['step', 'steps', 'walk', 'walking', 'move', 'desk', 'sitting', 'office'],
    options: [
      { label: '10,000 steps on rest days', detail: 'A walk after lunch and dinner', by: 'priya', quote: 'Walk 10k steps on rest days. It adds up.' },
      { label: 'Stand up every hour', detail: 'Two minutes of walking between meetings' },
      { label: 'Take calls on foot', detail: 'Easiest 2,000 steps a day', by: 'rohan' },
    ],
  },
  {
    id: 'yoga',
    title: 'Yoga & stretching',
    keywords: ['yoga', 'stretch', 'stretching', 'flexibility', 'flexible', 'pilates', 'posture'],
    options: [
      { label: 'Ten-minute morning flow', detail: 'Spine, hips and shoulders', by: 'meera', quote: 'Ten minutes every morning changed my back.' },
      { label: 'Weekend yoga class', detail: 'A guided hour, no thinking needed' },
      { label: 'Desk stretches at 4pm', detail: 'Chest openers and neck rolls', by: 'karan' },
    ],
  },
  {
    id: 'motivation',
    title: 'Staying motivated',
    keywords: ['motivation', 'motivated', 'consistent', 'consistency', 'habit', 'habits', 'buddy', 'accountability', 'lazy', 'skip'],
    options: [
      { label: 'A training buddy on two days', detail: 'You don’t cancel on people', by: 'priya', quote: 'I never skipped when a friend was waiting.' },
      { label: 'Tick the days on a calendar', detail: 'Don’t break the chain', by: 'rohan' },
      { label: 'Book the session before the day starts', detail: 'Treat it like a meeting' },
    ],
  },
  {
    id: 'cheat',
    title: 'Eating out & treats',
    keywords: ['cheat', 'treat', 'treats', 'junk', 'dessert', 'sweet', 'sweets', 'eating out', 'restaurant', 'party', 'alcohol', 'drinks'],
    options: [
      { label: 'One free meal a week', detail: 'Enjoy it, don’t compensate after', by: 'priya', quote: 'One free meal a week kept me sane.' },
      { label: 'Protein first at restaurants', detail: 'Order a grill or dal first, then add carbs', by: 'karan' },
      { label: 'Two drinks at most', detail: 'And not the night before a hard session' },
    ],
  },
]
