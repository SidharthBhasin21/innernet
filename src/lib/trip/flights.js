// Where to book flights for an itinerary. These are real booking sites; they
// open in a new tab and Innernet doesn't book anything itself.

// The airport city each stop is flown into or out of.
const AIRPORT_CITY = { tokyo: 'Tokyo', hakone: 'Tokyo', kyoto: 'Osaka', nara: 'Osaka', osaka: 'Osaka' }
const HOME = 'Delhi'

const sites = (into) => [
  {
    id: 'google-flights',
    name: 'Google Flights',
    detail: 'Compare dates and see the cheapest days',
    url: `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${HOME} to ${into}`)}`,
  },
  { id: 'skyscanner', name: 'Skyscanner', detail: 'Search a whole month for the lowest fare', url: 'https://www.skyscanner.co.in/flights' },
  { id: 'makemytrip', name: 'MakeMyTrip', detail: 'Book in rupees, with Indian carriers', url: 'https://www.makemytrip.com/flights/' },
  { id: 'ixigo', name: 'ixigo', detail: 'Fare alerts and flexible dates', url: 'https://www.ixigo.com/flights' },
  { id: 'cleartrip', name: 'Cleartrip', detail: 'Simple booking with fare filters', url: 'https://www.cleartrip.com/flights' },
]

/**
 * What to tell the user about flights, from the drafted itinerary: where to fly
 * into and out of (the first and last stops) and where to book.
 */
export function flightHelp(itinerary) {
  const first = itinerary.days[0]?.city
  const last = itinerary.days.at(-1)?.city
  const into = AIRPORT_CITY[first] ?? 'Tokyo'
  const out = AIRPORT_CITY[last] ?? into
  return {
    from: HOME,
    into,
    out,
    // Flying out of a different city than you flew into: search "multi-city".
    openJaw: into !== out,
    sites: sites(into),
  }
}
