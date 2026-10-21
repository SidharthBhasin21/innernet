// Mock Japan knowledge from the user's network, used to build the trip tree and
// the itinerary. `by` is the friend who shared it and `quote` what they said;
// only things people chose to share appear here.

// Geographic order, which is also the order a route visits them in.
export const CITY_ORDER = ['tokyo', 'hakone', 'kyoto', 'nara', 'osaka']

export const cities = {
  tokyo: { name: 'Tokyo', detail: 'Neon, food and old temples', by: 'priya', quote: 'Do Asakusa at 7am, before anyone else is up.' },
  hakone: { name: 'Hakone', detail: 'Hot springs and Mt Fuji views · 1 day', by: 'meera', quote: 'Perfect reset between Tokyo and Kyoto.', maxDays: 1 },
  kyoto: { name: 'Kyoto', detail: 'Temples, gardens and geisha lanes', by: 'karan', quote: 'Two days is not enough. Give it three.' },
  nara: { name: 'Nara', detail: 'Deer park and the Great Buddha · day trip', by: 'arjun', quote: 'Bow to the deer and they bow back.', maxDays: 1 },
  osaka: { name: 'Osaka', detail: 'Street food and nightlife', by: 'rohan', quote: 'Eat until you cannot move. Then eat more.' },
}

export const attractions = {
  tokyo: [
    { id: 'senso-ji', label: 'Sensō-ji, Asakusa', detail: 'Tokyo’s oldest temple', by: 'priya', quote: 'Go before 8am. It’s calm and almost empty.' },
    { id: 'meiji', label: 'Meiji Shrine & Harajuku', detail: 'Forest shrine, then street fashion' },
    { id: 'teamlab', label: 'teamLab Planets', detail: 'Walk barefoot through light and water', by: 'meera', quote: 'Wear shorts, you walk through water.' },
    { id: 'shibuya-sky', when: 'dusk', label: 'Shibuya Sky at sunset', detail: 'The best view over Tokyo', by: 'priya', quote: 'Book the sunset slot a week ahead.' },
    { id: 'yanaka', label: 'Yanaka old streets', detail: 'The Tokyo that survived', by: 'rohan', quote: 'Great snacks too.' },
    { id: 'ueno', label: 'Ueno Park & museums', detail: 'Parks, a zoo and the national museum' },
    { id: 'shinjuku-gyoen', label: 'Shinjuku Gyoen garden', detail: 'A calm garden in the middle of the city' },
    { id: 'akihabara', label: 'Akihabara', detail: 'Arcades, anime shops and electronics' },
    { id: 'skytree', label: 'Tokyo Skytree & Sumida river', detail: 'Towering views and a riverside walk' },
  ],
  hakone: [
    { id: 'ropeway', label: 'Hakone Ropeway & Owakudani', detail: 'Volcanic valley with Fuji views' },
    { id: 'lake-ashi', label: 'Lake Ashi cruise', detail: 'A pirate-ship ferry across the lake' },
    { id: 'onsen', label: 'Hot spring soak', detail: 'A day-visit onsen with mountain views', by: 'meera', quote: 'Do the outdoor bath at sunset.' },
  ],
  kyoto: [
    { id: 'fushimi', label: 'Fushimi Inari gates', detail: 'Thousands of orange torii up a mountain', by: 'priya', quote: 'Start at 7am and hike past the halfway point.' },
    { id: 'arashiyama', label: 'Arashiyama bamboo grove', detail: 'Bamboo, a monkey park and a river', by: 'karan', quote: 'Very crowded after 9am.' },
    { id: 'gion', when: 'dusk', label: 'Gion at dusk', detail: 'Lantern-lit lanes and teahouses', by: 'meera', quote: 'Walk Hanamikoji just as the lanterns come on.' },
    { id: 'kiyomizu', label: 'Kiyomizu-dera', detail: 'Hillside temple over the city' },
    { id: 'nishiki', label: 'Nishiki Market', detail: 'Kyoto’s kitchen, stall to stall', by: 'arjun', quote: 'Graze, skip the sit-down lunch.' },
    { id: 'philosophers', label: 'Philosopher’s Path', detail: 'A quiet canal walk', by: 'rohan', quote: 'Perfect for a slow morning.' },
    { id: 'kinkaku-ji', label: 'Kinkaku-ji, the Golden Pavilion', detail: 'A temple covered in gold leaf' },
    { id: 'nijo', label: 'Nijō Castle', detail: 'Shogun palace with squeaky “nightingale” floors' },
  ],
  nara: [
    { id: 'nara-park', label: 'Nara Park deer', detail: 'Hundreds of friendly deer', by: 'priya', quote: 'Buy the cracker bundle, you’ll need it.' },
    { id: 'todai-ji', label: 'Tōdai-ji Great Buddha', detail: 'One of Japan’s largest bronze Buddhas', by: 'arjun', quote: 'Bigger than you expect.' },
    { id: 'kasuga', label: 'Kasuga Taisha lanterns', detail: 'A forest shrine of thousands of lanterns' },
  ],
  osaka: [
    { id: 'osaka-castle', label: 'Osaka Castle park', detail: 'The castle and its moat' },
    { id: 'dotonbori', when: 'dusk', label: 'Dōtonbori at night', detail: 'Neon canal and street food', by: 'karan', quote: 'Takoyaki at Wanaka, then just wander.' },
    { id: 'umeda-sky', label: 'Umeda Sky Building', detail: 'Open-air rooftop views', by: 'meera', quote: 'Cheaper than Tokyo views and no queue.' },
    { id: 'kuromon', label: 'Kuromon Market', detail: 'Grilled seafood stalls', by: 'rohan', quote: 'Grilled scallops, straight off the stall.' },
  ],
}

export const foods = [
  { id: 'sushi', label: 'Sushi', detail: 'From market breakfast to a chef’s counter', by: 'arjun', quote: 'Tamagoyaki and fresh tuna at 7am.' },
  { id: 'ramen', label: 'Ramen', detail: 'Rich bowls, every region different', by: 'karan', quote: 'Never more than a 10-minute walk from a great bowl.' },
  { id: 'street', label: 'Street food', detail: 'Takoyaki, skewers and market snacks', by: 'rohan' },
  { id: 'kaiseki', label: 'Kaiseki dinner', detail: 'A multi-course seasonal tasting menu', by: 'karan', quote: 'Splurge-worthy. Book two weeks out.' },
  { id: 'veg', label: 'Vegetarian-friendly', detail: 'Temple cuisine and plant-based ramen' },
]

// Where to eat each kind of food, in the cities people ate it. `meal` is when it
// suits (breakfast, lunch); spots without one are for dinner.
export const spots = {
  sushi: [
    { id: 'tsukiji-sushi', meal: 'breakfast', city: 'tokyo', label: 'Tsukiji Outer Market sushi breakfast', detail: 'Tokyo · standing counters, fresh tuna', by: 'arjun', quote: 'Tamagoyaki and fresh tuna at 7am.' },
    { id: 'ginza-omakase', city: 'tokyo', label: 'Ginza omakase counter', detail: 'Tokyo · a chef’s set menu' },
    { id: 'nishiki-sushi', meal: 'lunch', city: 'kyoto', label: 'Nishiki Market sushi bar', detail: 'Kyoto · quick and cheap' },
    { id: 'kaiten-osaka', city: 'osaka', label: 'Conveyor-belt sushi in Namba', detail: 'Osaka · fun and inexpensive', by: 'rohan' },
  ],
  ramen: [
    { id: 'ichiran', city: 'tokyo', label: 'Ichiran, Shibuya', detail: 'Tokyo · solo booths', by: 'karan', quote: 'The solo booths are a fun experience.' },
    { id: 'ramen-street', city: 'tokyo', label: 'Tokyo Station Ramen Street', detail: 'Tokyo · eight shops under one roof' },
    { id: 'kyoto-ramen', city: 'kyoto', label: 'Honke Daiichi-Asahi', detail: 'Kyoto · a late-night local favourite' },
    { id: 'osaka-ramen', city: 'osaka', label: 'Kamukura, Dōtonbori', detail: 'Osaka · kimchi-and-pork broth' },
  ],
  street: [
    { id: 'takoyaki', city: 'osaka', label: 'Takoyaki at Wanaka', detail: 'Osaka · octopus balls on Dōtonbori', by: 'karan', quote: 'Takoyaki at Wanaka, then just wander.' },
    { id: 'asakusa-snacks', meal: 'lunch', city: 'tokyo', label: 'Nakamise street snacks', detail: 'Tokyo · melon pan and rice crackers' },
    { id: 'nishiki-graze', meal: 'lunch', city: 'kyoto', label: 'Nishiki Market grazing', detail: 'Kyoto · skewers, pickles and tofu doughnuts', by: 'arjun' },
  ],
  kaiseki: [
    { id: 'gion-kaiseki', city: 'kyoto', label: 'Kaiseki dinner in Gion', detail: 'Kyoto · book two weeks ahead', by: 'karan', quote: 'Splurge-worthy. Book two weeks out.' },
    { id: 'hakone-kaiseki', city: 'hakone', label: 'Ryokan kaiseki dinner', detail: 'Hakone · served in your room' },
    { id: 'tokyo-kaiseki', city: 'tokyo', label: 'Kaiseki in Akasaka', detail: 'Tokyo · quieter and less formal' },
  ],
  veg: [
    { id: 'shojin', meal: 'lunch', city: 'kyoto', label: 'Shōjin ryōri temple lunch', detail: 'Kyoto · fully vegetarian monk cuisine' },
    { id: 'vegan-ramen', city: 'tokyo', label: 'T’s TanTan vegan ramen', detail: 'Tokyo · inside Tokyo Station' },
    { id: 'nara-veg', meal: 'lunch', city: 'nara', label: 'Vegetarian set lunch in Nara', detail: 'Nara · near the park' },
  ],
}

// Dinners to fall back on when someone hasn't picked a food for a city.
export const localDinners = {
  tokyo: ['Izakaya dinner in Omoide Yokocho', 'Tonkatsu set dinner in Shinjuku', 'Monjayaki in Tsukishima'],
  hakone: ['Ryokan dinner with local specialities'],
  kyoto: ['Yudofu (tofu hotpot) dinner', 'Pontocho alley izakaya', 'Obanzai home-style dinner'],
  nara: ['Kakinoha-zushi (persimmon-leaf sushi) dinner'],
  osaka: ['Okonomiyaki dinner', 'Kushikatsu skewers in Shinsekai', 'Izakaya dinner in Namba'],
}

export const budgets = [
  { id: 'lean', label: '₹1,00,000', amount: 100000, detail: 'Lean: hostels, street food, lots of walking' },
  { id: 'comfort', label: '₹2,00,000', amount: 200000, detail: 'Comfortable: good hotels, a mix of eats' },
  { id: 'treat', label: '₹3,50,000', amount: 350000, detail: 'Treat yourself: a ryokan night, a big dinner' },
]

// Per person per night, in rupees (rooms are shared between two).
export const stays = {
  lean: [
    { id: 'hostel', label: 'Hostel (private room)', nightly: 3500, detail: 'Clean, friendly, near stations', by: 'rohan', quote: 'Clean, friendly, and near Sensō-ji.' },
    { id: 'business', label: 'Business hotel', nightly: 6000, detail: 'Small, spotless and well located' },
  ],
  comfort: [
    { id: 'business', label: 'Business hotel', nightly: 6000, detail: 'Small, spotless and well located' },
    { id: 'boutique', label: 'Boutique hotel', nightly: 10000, detail: 'More space and character', by: 'arjun', quote: 'Great location, right by the station.' },
  ],
  treat: [
    { id: 'boutique', label: 'Boutique hotel', nightly: 10000, detail: 'More space and character' },
    { id: 'ryokan', label: 'Ryokan (traditional inn)', nightly: 14000, detail: 'Tatami rooms, breakfast in the garden', by: 'priya', quote: 'Breakfast in the garden was the highlight.' },
    { id: 'luxury', label: 'Luxury hotel', nightly: 22000, detail: 'Top-floor views and full service' },
  ],
}

export const paces = [
  { id: 'relaxed', label: 'Relaxed', detail: 'One sight a day, long dinners', by: 'meera', quote: 'Slow down in Kyoto.' },
  { id: 'balanced', label: 'Balanced', detail: 'Two sights a day with a proper dinner' },
  { id: 'packed', label: 'Packed', detail: 'Three sights a day, early starts' },
]

export const dayOptions = [
  { id: '5', label: '5 days', detail: 'Tokyo and Kyoto, nothing else' },
  { id: '7', label: '7 days', detail: 'The way most of your friends did it', by: 'arjun', quote: 'Seven days felt just right.' },
  { id: '10', label: '10 days', detail: 'Room for Nara, Hakone or Osaka', by: 'meera' },
  { id: '14', label: '14 days', detail: 'Add a slower pace everywhere' },
]

// Rough per-person costs from India, in rupees.
export const costs = { flights: 58000, rail: 14000, dailyFoodAndTravel: { lean: 3000, comfort: 4500, treat: 7000 } }

export const trainBetween = {
  'tokyo-hakone': 'Romancecar from Shinjuku (~85 min)',
  'tokyo-kyoto': 'Shinkansen from Tokyo (~2h15)',
  'hakone-kyoto': 'Via Odawara, then Shinkansen (~3h)',
  'kyoto-nara': 'Kintetsu line from Kyoto (~45 min)',
  'kyoto-osaka': 'Special rapid from Kyoto (~30 min)',
  'nara-osaka': 'Kintetsu line to Osaka (~40 min)',
}

// How each friend's Japan trip actually went (what they chose to share). The
// agent reasons from these: typical length, spend, route and food, plus what
// they'd tell you.
export const friendTrips = [
  { userId: 'priya', days: 8, spend: 210000, route: ['tokyo', 'kyoto', 'nara'], ate: ['sushi', 'ramen', 'kaiseki'], note: 'Kyoto mornings before the crowds were the highlight.' },
  { userId: 'arjun', days: 7, spend: 180000, route: ['tokyo', 'kyoto', 'nara'], ate: ['sushi', 'street', 'ramen'], note: 'Eat at the markets and get a Suica card on day one.' },
  { userId: 'meera', days: 10, spend: 260000, route: ['tokyo', 'hakone', 'kyoto', 'osaka'], ate: ['sushi', 'veg', 'ramen'], note: 'Slow down in Kyoto. Two days is not enough.' },
  { userId: 'karan', days: 6, spend: 150000, route: ['tokyo', 'kyoto'], ate: ['ramen', 'kaiseki', 'street'], note: 'Six days felt rushed. I’d add two.' },
  { userId: 'rohan', days: 9, spend: 220000, route: ['tokyo', 'kyoto', 'nara', 'osaka'], ate: ['street', 'sushi', 'ramen'], note: 'Stay near a station. It saves hours every day.' },
]
