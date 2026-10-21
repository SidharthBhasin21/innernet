import { ExternalLink, Plane, Train } from 'lucide-react'
import Avatar from '../../ui/Avatar'
import { flightHelp } from '../../../lib/trip/flights'
import { getUser } from '../../../data/mockUsers'
import SwapControl, { SwappedTag } from './Swap'

const rupees = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`

function Day({ day, onSwap }) {
  return (
    <section aria-label={`Day ${day.n}`} className="border-t border-gray-200 pt-5">
      <h3 className="text-heading-3 text-gray-900">
        <span className="text-gray-400">Day {day.n}</span> · {day.title}
      </h3>
      {day.travel && (
        <p className="mt-1.5 flex items-center gap-1.5 text-body-s text-gray-500">
          <Train className="size-4" aria-hidden="true" />
          {day.travel}
        </p>
      )}
      <dl className="mt-3 flex flex-col gap-3">
        {day.items.map((item) => {
          const friend = item.by ? getUser(item.by) : null
          return (
            <div key={item.slot} className="grid grid-cols-[6.5rem_1fr] gap-3">
              <dt className="pt-0.5 text-body-s text-gray-400">{item.slot}</dt>
              <dd>
                <span className="text-body-l text-gray-900">{item.text}</span>
                <SwappedTag item={item} />
                {item.chosen && <span className="ml-2 rounded-full bg-indigo-soft px-2 py-0.5 align-middle text-caption font-medium text-indigo">Picked</span>}
                {item.detail && (
                  <span className="mt-1 flex items-start gap-2 text-body-s text-gray-500">
                    {friend && <Avatar user={friend} size="xs" />}
                    <span>{friend ? `“${item.detail}” · ${friend.name.split(' ')[0]}` : item.detail}</span>
                  </span>
                )}
                <SwapControl item={item} onSwap={onSwap} />
              </dd>
            </div>
          )
        })}
      </dl>
      {day.departure && (
        <p className="mt-4 flex items-center gap-1.5 text-body-s text-gray-500">
          <Plane className="size-4" aria-hidden="true" />
          {day.departure}
        </p>
      )}
    </section>
  )
}

function Costs({ budget }) {
  return (
    <section aria-label="Estimated cost" className="border-t border-gray-200 pt-5">
      <h3 className="text-heading-3 text-gray-900">Estimated cost per person</h3>
      <table className="mt-3 w-full text-left">
        <tbody>
          {budget.lines.map((line) => (
            <tr key={line.label} className="border-b border-gray-100">
              <th className="py-2 pr-3 text-body-m font-normal text-gray-900">
                {line.label} <span className="text-body-s text-gray-400">{line.detail}</span>
              </th>
              <td className="py-2 text-right text-body-m text-gray-700 tabular-nums">{rupees(line.amount)}</td>
            </tr>
          ))}
          <tr>
            <th className="pt-3 text-body-l font-semibold text-gray-900">Total</th>
            <td className="pt-3 text-right text-body-l font-semibold text-gray-900 tabular-nums">{rupees(budget.total)}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3 text-body-m text-gray-600">
        {budget.target === null
          ? 'You didn’t pick a budget, so this uses typical prices.'
          : budget.left >= 0
            ? `That’s ${rupees(budget.left)} under your budget of ${rupees(budget.target)}.`
            : `That’s ${rupees(-budget.left)} over your budget of ${rupees(budget.target)}.`}
      </p>
    </section>
  )
}

// Real booking sites for the flights, opening in a new tab. Innernet doesn't book.
function Flights({ itinerary }) {
  const help = flightHelp(itinerary)
  return (
    <section aria-label="Book your flights" className="border-t border-gray-200 pt-5">
      <h3 className="text-heading-3 text-gray-900">Book your flights</h3>
      <p className="mt-1.5 text-body-m text-gray-600">
        Fly {help.from} → {help.into}
        {help.openJaw ? `, and home from ${help.out}. Search “multi-city” (or “open jaw”) so you don’t have to go back to ${help.into}.` : ' and back.'}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {help.sites.map((site) => (
          <li key={site.id}>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-3.5 py-2.5 transition-colors hover:border-indigo-border hover:bg-indigo-soft focus-ring"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-body-m font-medium text-gray-900">{site.name}</span>
                <span className="block text-body-s text-gray-500">{site.detail}</span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-gray-400" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-caption text-gray-400">These open the booking sites in a new tab. Innernet doesn’t book flights for you.</p>
    </section>
  )
}

// The trip's part of the document: each day, what it costs, and where to book flights.
export default function TripDocument({ itinerary, onSwap }) {
  return (
    <>
      {itinerary.days.map((day) => (
        <Day key={day.n} day={day} onSwap={onSwap} />
      ))}
      <Costs budget={itinerary.budget} />
      <Flights itinerary={itinerary} />
    </>
  )
}
