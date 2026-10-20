// Things people ask about beyond the main questions (shopping, nightlife,
// onsen…), with what the user's network shared in each city. The agent matches a
// custom question to a topic by its keywords, then answers from these.
// `by` is the friend who shared it and `quote` what they said.

export const topics = [
  {
    id: 'shopping',
    title: 'Shopping',
    keywords: ['shop', 'shopping', 'souvenir', 'gift', 'buy', 'omiyage'],
    options: [
      { city: 'tokyo', label: 'Don Quijote, Shibuya', detail: 'Late-night discount chain: snacks, cosmetics, gadgets', by: 'rohan', quote: 'Open until 5am, great for souvenirs.' },
      { city: 'tokyo', label: 'Itoya stationery, Ginza', detail: 'Twelve floors of beautiful stationery' },
      { city: 'tokyo', label: 'Muji flagship, Yūrakuchō', detail: 'Clothes, home goods and a café' },
      { city: 'kyoto', label: 'Aritsugu knives, Nishiki Market', detail: 'Handmade kitchen knives, engraved while you wait', by: 'arjun', quote: 'Best thing I brought home.' },
      { city: 'kyoto', label: 'Teramachi & Shinkyogoku arcades', detail: 'Covered streets of tea, ceramics and crafts' },
      { city: 'osaka', label: 'Shinsaibashi-suji arcade', detail: 'Osaka’s main shopping street', by: 'karan' },
      { city: 'osaka', label: 'Den Den Town', detail: 'Electronics, games and retro toys' },
      { city: 'nara', label: 'Handmade Nara brushes', detail: 'Calligraphy brushes made in the old town' },
    ],
  },
  {
    id: 'nightlife',
    title: 'Nightlife',
    keywords: ['night', 'nightlife', 'bar', 'bars', 'drinks', 'drink', 'pub', 'party', 'sake'],
    options: [
      { city: 'tokyo', label: 'Golden Gai bars, Shinjuku', detail: 'Six alleys of tiny bars seating five people each', by: 'arjun', quote: 'Pick one with a sign in English for your first night.' },
      { city: 'tokyo', label: 'Nonbei Yokochō, Shibuya', detail: 'A quieter drinking alley beside the tracks' },
      { city: 'kyoto', label: 'Pontochō evenings', detail: 'Lantern-lit alley of izakaya above the Kamo river', by: 'meera', quote: 'Go for the riverside terraces.' },
      { city: 'osaka', label: 'Hōzenji Yokochō', detail: 'A candlelit lane of old bars behind Dōtonbori' },
      { city: 'osaka', label: 'Dōtonbori after dark', detail: 'Neon, street food and crowds', by: 'karan', quote: 'Takoyaki at Wanaka, then just wander.' },
    ],
  },
  {
    id: 'onsen',
    title: 'Hot springs',
    keywords: ['onsen', 'spa', 'hot spring', 'springs', 'relax', 'bath'],
    options: [
      { city: 'hakone', label: 'Open-air ryokan bath at sunset', detail: 'A day-visit soak with mountain views', by: 'meera', quote: 'Do the outdoor bath at sunset.' },
      { city: 'hakone', label: 'Hakone Yuryō', detail: 'A large onsen complex, easy to reach' },
      { city: 'tokyo', label: 'Ōedo Onsen Monogatari', detail: 'An Edo-themed onsen theme park in Odaiba' },
      { city: 'kyoto', label: 'Kurama Onsen', detail: 'A mountain onsen north of the city', by: 'priya' },
    ],
  },
  {
    id: 'anime',
    title: 'Anime & pop culture',
    keywords: ['anime', 'manga', 'pokemon', 'pokémon', 'gaming', 'games', 'ghibli', 'otaku', 'nintendo', 'pop culture'],
    options: [
      { city: 'tokyo', label: 'Akihabara', detail: 'Arcades, anime shops and retro games', by: 'rohan', quote: 'Go in the afternoon, the arcades never close.' },
      { city: 'tokyo', label: 'Nakano Broadway', detail: 'Four floors of manga and collectibles' },
      { city: 'tokyo', label: 'Ghibli Museum, Mitaka', detail: 'Book weeks ahead, tickets sell out', by: 'meera', quote: 'Tickets sell out. Book the day they open.' },
      { city: 'tokyo', label: 'Pokémon Center, Shibuya', detail: 'The flagship store with exclusive merch' },
      { city: 'osaka', label: 'Nipponbashi Den Den Town', detail: 'Osaka’s answer to Akihabara' },
    ],
  },
  {
    id: 'photography',
    title: 'Photography & views',
    keywords: ['photo', 'photos', 'photography', 'instagram', 'sunrise', 'sunset', 'view', 'views', 'scenic', 'camera'],
    options: [
      { city: 'tokyo', label: 'Shibuya Sky at sunset', detail: 'The best rooftop view over Tokyo', by: 'priya', quote: 'Book the sunset slot a week ahead.' },
      { city: 'tokyo', label: 'Yanaka at golden hour', detail: 'Old streets and cats in warm light' },
      { city: 'kyoto', label: 'Fushimi Inari at sunrise', detail: 'The gates without the crowds', by: 'priya', quote: 'Start at 7am and hike past the halfway point.' },
      { city: 'kyoto', label: 'Arashiyama at dawn', detail: 'Bamboo grove before the tour buses', by: 'karan', quote: 'Very crowded after 9am.' },
      { city: 'kyoto', label: 'Shirakawa canal, Gion', detail: 'Willows and teahouses over a quiet canal' },
      { city: 'hakone', label: 'Mt Fuji from Lake Ashi', detail: 'A classic view on a clear morning' },
      { city: 'nara', label: 'Nara Park in the evening', detail: 'Deer among the lanterns once visitors leave' },
    ],
  },
  {
    id: 'kids',
    title: 'Travelling with kids',
    keywords: ['kid', 'kids', 'child', 'children', 'family', 'toddler', 'baby', 'son', 'daughter'],
    options: [
      { city: 'tokyo', label: 'teamLab Planets', detail: 'Walk through water and light, kids love it', by: 'meera', quote: 'Wear shorts, you walk through water.' },
      { city: 'tokyo', label: 'Ueno Zoo & park', detail: 'Pandas, boats and open space' },
      { city: 'kyoto', label: 'Kyoto Railway Museum', detail: 'Real trains to climb on', by: 'arjun' },
      { city: 'kyoto', label: 'Iwatayama Monkey Park', detail: 'A short hike to wild monkeys' },
      { city: 'nara', label: 'Feeding the deer', detail: 'Buy the cracker bundles from the stalls', by: 'priya', quote: 'Buy the cracker bundle, you’ll need it.' },
      { city: 'osaka', label: 'Kaiyukan Aquarium', detail: 'One of the world’s largest aquariums' },
    ],
  },
  {
    id: 'rainy',
    title: 'Rainy-day plans',
    keywords: ['rain', 'rainy', 'indoor', 'indoors', 'weather', 'wet'],
    options: [
      { city: 'tokyo', label: 'Tokyo National Museum, Ueno', detail: 'Japan’s largest collection, all indoors' },
      { city: 'tokyo', label: 'teamLab Planets', detail: 'Mostly indoors, and you walk through water anyway', by: 'meera' },
      { city: 'kyoto', label: 'Nishiki Market (covered)', detail: 'Graze stall to stall out of the rain', by: 'arjun', quote: 'Graze, skip the sit-down lunch.' },
      { city: 'kyoto', label: 'Kyoto Railway Museum', detail: 'Big, dry and fun' },
      { city: 'osaka', label: 'Kaiyukan Aquarium', detail: 'A full day indoors' },
      { city: 'nara', label: 'Nara National Museum', detail: 'Buddhist art, a short walk from the park' },
    ],
  },
  {
    id: 'free',
    title: 'Free things to do',
    keywords: ['free', 'cheap', 'save money', 'budget tips', 'no cost', 'inexpensive'],
    options: [
      { city: 'tokyo', label: 'Meiji Shrine', detail: 'A forest shrine, free to enter' },
      { city: 'tokyo', label: 'Sensō-ji at dawn', detail: 'Free, and almost empty early', by: 'priya', quote: 'Go before 8am. It’s calm and almost empty.' },
      { city: 'kyoto', label: 'Fushimi Inari gates', detail: 'Open all night and free', by: 'priya' },
      { city: 'kyoto', label: 'Philosopher’s Path', detail: 'A canal walk with no entry fee', by: 'rohan', quote: 'Perfect for a slow morning.' },
      { city: 'osaka', label: 'Dōtonbori canal walk', detail: 'Neon and street scenes, no ticket needed' },
    ],
  },
  {
    id: 'daytrip',
    title: 'Day trips',
    keywords: ['day trip', 'daytrip', 'nikko', 'kamakura', 'himeji', 'yokohama', 'uji', 'excursion', 'nearby'],
    options: [
      { city: 'tokyo', label: 'Kamakura', detail: 'Temples and a giant Buddha by the sea, an hour away' },
      { city: 'tokyo', label: 'Nikkō', detail: 'Ornate shrines in the mountains', by: 'rohan' },
      { city: 'kyoto', label: 'Uji tea town', detail: 'Matcha everything, 20 minutes by train', by: 'meera', quote: 'Matcha ice cream by the river.' },
      { city: 'kyoto', label: 'Himeji Castle', detail: 'Japan’s best-preserved castle' },
      { city: 'osaka', label: 'Himeji Castle', detail: 'An easy trip on the Shinkansen' },
    ],
  },
  {
    id: 'experience',
    title: 'Cultural experiences',
    keywords: ['tea ceremony', 'cooking', 'class', 'kimono', 'workshop', 'experience', 'experiences', 'culture', 'cultural', 'craft'],
    options: [
      { city: 'kyoto', label: 'Tea ceremony in Higashiyama', detail: 'A guided ceremony in a traditional teahouse', by: 'meera', quote: 'Worth booking ahead.' },
      { city: 'kyoto', label: 'Kimono rental in Gion', detail: 'Wear one for the day, hair included' },
      { city: 'tokyo', label: 'Sushi-making class', detail: 'Make your own with a chef' },
      { city: 'osaka', label: 'Takoyaki cooking class', detail: 'Learn the flip, then eat your work', by: 'karan' },
    ],
  },
]
