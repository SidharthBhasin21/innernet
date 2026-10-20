// Mock fitness knowledge from the user's network, used to build the fitness tree
// and the plan. `by` is the friend who shared it and `quote` what they said;
// only things people chose to share appear here.

export const goals = [
  { id: 'fat', label: 'Lose fat', plan: 'fat-loss plan', detail: 'Burn more, keep your muscle', by: 'priya', quote: 'Walk 10k steps on rest days. It adds up.' },
  { id: 'muscle', label: 'Build muscle', plan: 'strength plan', detail: 'Get stronger and fuller', by: 'karan', quote: 'Protein at every meal changed how I recovered.' },
  { id: 'endurance', label: 'Build stamina', plan: 'stamina plan', detail: 'Run or cycle longer without gasping', by: 'meera' },
  { id: 'flex', label: 'Move better', plan: 'mobility plan', detail: 'Mobility, posture and a stronger core' },
]

export const sessionOptions = [
  { id: '3', label: '3 days', detail: 'Mon, Wed, Fri · plenty of recovery', by: 'rohan', quote: 'Three solid days beat six half-hearted ones.' },
  { id: '4', label: '4 days', detail: 'Mon, Tue, Thu, Fri · balanced for most people', by: 'meera' },
  { id: '5', label: '5 days', detail: 'Mon to Fri · needs good sleep' },
]

export const lengths = [
  { id: '30', label: '30 min', detail: 'Short and sharp, easy to keep up' },
  { id: '45', label: '45 min', detail: 'The sweet spot for most plans', by: 'priya' },
  { id: '60', label: '60 min', detail: 'Room for a proper warm-up and more sets' },
]

export const wheres = [
  { id: 'gym', label: 'At the gym', detail: 'Machines, cables and free weights', by: 'priya', quote: 'I stuck to it because I had to go somewhere.' },
  { id: 'home', label: 'At home', detail: 'A mat and a little kit is enough', by: 'arjun', quote: 'Dumbbells and bands were enough.' },
  { id: 'outdoor', label: 'Outdoors', detail: 'Parks, tracks and bodyweight', by: 'meera' },
]

export const diets = [
  { id: 'protein', label: 'High protein', detail: 'Protein at every meal', by: 'karan', quote: 'Protein at every meal changed how I recovered.' },
  { id: 'balanced', label: 'Balanced & simple', detail: 'Home food, sensible portions', by: 'priya' },
  { id: 'veg', label: 'Vegetarian', detail: 'Paneer, dal, tofu and sprouts', by: 'meera' },
]

// What each goal can focus on. Ids point into `exercises`.
export const focusAreas = {
  fat: [
    { id: 'hiit', label: 'Circuits', detail: 'Full-body rounds that keep your heart rate up', by: 'rohan', quote: 'Twenty minutes of circuits beat an hour of walking on the treadmill.' },
    { id: 'cardio', label: 'Steady cardio', detail: 'Brisk walks, easy runs or cycling', by: 'priya', quote: 'Walk 10k steps on rest days. It adds up.' },
    { id: 'legs', label: 'Legs & glutes', detail: 'The biggest muscles burn the most' },
    { id: 'core', label: 'Core', detail: 'Planks and anti-rotation work' },
    { id: 'push', label: 'Upper body', detail: 'Push-ups and presses to keep muscle' },
  ],
  muscle: [
    { id: 'push', label: 'Chest & shoulders', detail: 'Presses and push-ups', by: 'karan' },
    { id: 'pull', label: 'Back & arms', detail: 'Rows, pulldowns and pull-ups', by: 'karan', quote: 'Add a pulling day. Your posture will thank you.' },
    { id: 'legs', label: 'Legs & glutes', detail: 'Squats, hinges and lunges', by: 'arjun' },
    { id: 'core', label: 'Core', detail: 'A stable trunk for every lift' },
    { id: 'cardio', label: 'Light cardio', detail: 'A short finisher for your heart' },
  ],
  endurance: [
    { id: 'cardio', label: 'Easy runs', detail: 'Build the base slowly', by: 'meera', quote: 'Keep it conversational for the first two weeks.' },
    { id: 'hiit', label: 'Intervals', detail: 'Short hard efforts with rests' },
    { id: 'legs', label: 'Leg strength', detail: 'Strong legs run farther', by: 'meera' },
    { id: 'core', label: 'Core', detail: 'Holds your form when you tire' },
    { id: 'mobility', label: 'Mobility', detail: 'Hips and hamstrings for easier strides' },
  ],
  flex: [
    { id: 'mobility', label: 'Mobility flows', detail: 'Hips, spine and shoulders', by: 'meera', quote: 'Ten minutes every morning changed my back.' },
    { id: 'core', label: 'Core', detail: 'Controlled strength through your middle' },
    { id: 'legs', label: 'Hips & legs', detail: 'Strong and open hips' },
    { id: 'pull', label: 'Posture', detail: 'Upper back work against desk hunch', by: 'karan' },
    { id: 'cardio', label: 'Walks', detail: 'Easy movement between sessions' },
  ],
}

// Equipment people use in each place.
export const kits = {
  gym: [
    { id: 'machines', label: 'Machines & cables', detail: 'Guided, good for beginners', by: 'priya' },
    { id: 'free', label: 'Free weights', detail: 'Barbells and dumbbells', by: 'karan' },
    { id: 'cardio-machines', label: 'Cardio machines', detail: 'Treadmill, bike and rower' },
  ],
  home: [
    { id: 'dumbbells', label: 'Adjustable dumbbells', detail: 'The one thing worth buying', by: 'arjun', quote: 'Dumbbells and bands were enough.' },
    { id: 'bands', label: 'Resistance bands', detail: 'Cheap, light and surprisingly hard', by: 'arjun' },
    { id: 'mat', label: 'Yoga mat', detail: 'For floor work and mobility' },
    { id: 'rope', label: 'Skipping rope', detail: 'A cardio finisher in a drawer', by: 'rohan' },
  ],
  outdoor: [
    { id: 'shoes', label: 'Good running shoes', detail: 'The only kit you really need', by: 'meera', quote: 'Spend on the shoes, not the watch.' },
    { id: 'bench', label: 'Park bench & bar', detail: 'Dips, step-ups and pull-ups' },
    { id: 'bands', label: 'Resistance bands', detail: 'Light enough to carry' },
    { id: 'watch', label: 'Fitness watch', detail: 'Pace and heart rate' },
  ],
}

// Meals to build the week around, by how someone wants to eat.
export const meals = {
  protein: [
    { id: 'eggs-oats', meal: 'Breakfast', label: 'Eggs & oats', detail: '3 eggs, oats with banana', by: 'karan', quote: 'Eggs every morning, no excuses.' },
    { id: 'paneer-wrap', meal: 'Lunch', label: 'Paneer bhurji wrap', detail: 'High protein, travels well' },
    { id: 'chicken-rice', meal: 'Lunch', label: 'Chicken & rice bowl', detail: 'The classic training meal', by: 'karan' },
    { id: 'yogurt-nuts', meal: 'Snack', label: 'Greek yogurt & nuts', detail: 'Easy protein between meals', by: 'karan' },
    { id: 'dal-curd', meal: 'Dinner', label: 'Dal, rice & curd', detail: 'Light, with complete protein' },
  ],
  balanced: [
    { id: 'poha', meal: 'Breakfast', label: 'Poha with peanuts', detail: 'Light and filling', by: 'priya' },
    { id: 'roti-dal', meal: 'Lunch', label: 'Roti, dal & sabzi', detail: 'Plain home food, sensible portions', by: 'priya', quote: 'I didn’t change what I ate, just how much.' },
    { id: 'fruit-nuts', meal: 'Snack', label: 'Fruit & a handful of nuts', detail: 'Keeps you away from biscuits' },
    { id: 'khichdi', meal: 'Dinner', label: 'Moong khichdi', detail: 'Easy on the stomach after training', by: 'rohan' },
  ],
  veg: [
    { id: 'tofu-scramble', meal: 'Breakfast', label: 'Tofu or paneer scramble', detail: 'Protein without eggs', by: 'meera' },
    { id: 'chole-salad', meal: 'Lunch', label: 'Chole & big salad', detail: 'Chickpeas for protein and fibre', by: 'meera', quote: 'Chole and a big salad kept me full.' },
    { id: 'sprouts', meal: 'Snack', label: 'Sprouts chaat', detail: 'Cheap and crunchy' },
    { id: 'dal-quinoa', meal: 'Dinner', label: 'Dal with quinoa', detail: 'Complete protein, light on the stomach' },
  ],
}

const x = (text, extra = {}) => ({ text, ...extra })

// What a session of each kind is made of, by place. `sets` exercises follow the
// week's sets and reps; the others carry their own detail.
export const exercises = {
  push: {
    gym: [x('Barbell bench press', { sets: true, by: 'karan', quote: 'Leave one rep in the tank.' }), x('Overhead dumbbell press', { sets: true }), x('Incline dumbbell press', { sets: true }), x('Cable fly', { sets: true })],
    home: [x('Push-ups', { sets: true }), x('Dumbbell floor press', { sets: true }), x('Pike push-ups', { sets: true }), x('Band chest fly', { sets: true })],
    outdoor: [x('Push-ups', { sets: true }), x('Bench dips', { sets: true }), x('Pike push-ups', { sets: true }), x('Incline push-ups on a bench', { sets: true })],
  },
  pull: {
    gym: [x('Lat pulldown', { sets: true }), x('Seated cable row', { sets: true, by: 'karan' }), x('Face pulls', { sets: true }), x('Dumbbell curls', { sets: true })],
    home: [x('One-arm dumbbell row', { sets: true }), x('Band pull-aparts', { sets: true }), x('Band rows', { sets: true }), x('Dumbbell curls', { sets: true })],
    outdoor: [x('Pull-ups or hangs from a bar', { sets: true }), x('Inverted rows under a bench', { sets: true }), x('Band pull-aparts', { sets: true }), x('Superman holds', { detail: '3 × 30 sec' })],
  },
  legs: {
    gym: [x('Back squat', { sets: true, by: 'karan' }), x('Romanian deadlift', { sets: true }), x('Leg press', { sets: true }), x('Walking lunges', { sets: true })],
    home: [x('Goblet squat', { sets: true, by: 'arjun', quote: 'One heavy dumbbell is plenty.' }), x('Reverse lunges', { sets: true }), x('Glute bridges', { sets: true }), x('Single-leg Romanian deadlift', { sets: true })],
    outdoor: [x('Walking lunges', { sets: true }), x('Step-ups on a bench', { sets: true }), x('Bodyweight squats', { sets: true }), x('Glute bridges', { sets: true })],
  },
  core: {
    gym: [x('Plank', { detail: '3 × 40 sec' }), x('Hanging knee raises', { sets: true }), x('Cable woodchop', { sets: true }), x('Dead bug', { detail: '3 × 10 each side' })],
    home: [x('Plank', { detail: '3 × 40 sec' }), x('Dead bug', { detail: '3 × 10 each side' }), x('Side plank', { detail: '3 × 25 sec each side' }), x('Bicycle crunch', { sets: true })],
    outdoor: [x('Plank', { detail: '3 × 40 sec' }), x('Dead bug', { detail: '3 × 10 each side' }), x('Side plank', { detail: '3 × 25 sec each side' }), x('Mountain climbers', { detail: '3 × 30 sec' })],
  },
  cardio: {
    gym: [x('Treadmill brisk walk or jog', { minutes: 15, by: 'priya' }), x('Rowing machine, steady', { minutes: 10 }), x('Stationary bike, easy', { minutes: 10 })],
    home: [x('Brisk walk around the block', { minutes: 15 }), x('Skipping rope, easy', { minutes: 8 }), x('Stair climbs', { minutes: 8 })],
    outdoor: [x('Easy run, conversational pace', { minutes: 15, by: 'meera' }), x('Brisk walk', { minutes: 15 }), x('Cycle, steady', { minutes: 15 })],
  },
  hiit: {
    gym: [x('Kettlebell swings', { detail: '4 × 30 sec on, 30 sec off' }), x('Rower sprints', { detail: '6 × 20 sec hard' }), x('Battle ropes', { detail: '4 × 30 sec' }), x('Box step-ups', { detail: '4 × 30 sec' })],
    home: [x('Burpees', { detail: '4 × 30 sec on, 30 sec off', by: 'rohan' }), x('Mountain climbers', { detail: '4 × 30 sec' }), x('Squat jumps', { detail: '4 × 30 sec' }), x('Skipping rope', { detail: '4 × 45 sec' })],
    outdoor: [x('Hill or stair sprints', { detail: '6 × 20 sec hard, walk back' }), x('Burpees', { detail: '4 × 30 sec on, 30 sec off' }), x('Sprint-walk intervals', { detail: '8 × 1 min hard, 1 min easy' }), x('Squat jumps', { detail: '4 × 30 sec' })],
  },
  mobility: {
    gym: [x('Hip 90/90 switches', { detail: '2 × 10 each side' }), x('Cat-cow & thoracic rotations', { detail: '2 × 10' }), x('Hamstring flow', { detail: '2 × 45 sec each side' })],
    home: [x('World’s greatest stretch', { detail: '2 × 8 each side', by: 'meera' }), x('Cat-cow & thoracic rotations', { detail: '2 × 10' }), x('Hamstring flow', { detail: '2 × 45 sec each side' })],
    outdoor: [x('World’s greatest stretch', { detail: '2 × 8 each side' }), x('Hip 90/90 switches', { detail: '2 × 10 each side' }), x('Hamstring flow', { detail: '2 × 45 sec each side' })],
  },
}

// Each week of a plan, by how far through it is. Strength sets and reps change; cardio grows by two minutes.
export const weekThemes = {
  first: { theme: 'Foundation', sets: '3 × 10, easy effort', note: 'Learn the moves. Stop each set with two reps left.' },
  build: { theme: 'Build', sets: '3 × 12', note: 'Add a little weight or a few minutes where it feels easy.' },
  push: { theme: 'Push', sets: '4 × 8–10', note: 'The hardest week. Go heavier, rest a minute and a half.' },
  last: { theme: 'Test & ease off', sets: '3 × 10, lighter', note: 'Back off a little, then retest the numbers you started with.' },
}

// What the user's network did, for the agent to reason from.
export const friendPlans = [
  { userId: 'priya', weeks: 4, perWeek: 4, minutes: 45, goal: 'fat', where: 'gym', diet: 'balanced', note: 'Walking 10k steps on rest days did more than extra sessions.' },
  { userId: 'arjun', weeks: 6, perWeek: 3, minutes: 45, goal: 'muscle', where: 'home', diet: 'protein', note: 'Dumbbells and bands were enough. I just added a little each week.' },
  { userId: 'meera', weeks: 4, perWeek: 5, minutes: 30, goal: 'endurance', where: 'outdoor', diet: 'veg', note: 'Five days burnt me out by week three. I’d do four.' },
  { userId: 'karan', weeks: 8, perWeek: 4, minutes: 60, goal: 'muscle', where: 'gym', diet: 'protein', note: 'Protein at every meal changed how I recovered.' },
  { userId: 'rohan', weeks: 4, perWeek: 3, minutes: 30, goal: 'fat', where: 'home', diet: 'balanced', note: 'Three solid days beat six half-hearted ones.' },
]
