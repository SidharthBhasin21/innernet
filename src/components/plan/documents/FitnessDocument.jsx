import Avatar from '../../ui/Avatar'
import { getUser } from '../../../data/mockUsers'

// What a friend said about something, small and under it.
function Said({ by, quote }) {
  const friend = by ? getUser(by) : null
  if (!friend || !quote) return null
  return (
    <span className="mt-1 flex items-start gap-2 text-body-s text-gray-500">
      <Avatar user={friend} size="xs" />
      <span>“{quote}” · {friend.name.split(' ')[0]}</span>
    </span>
  )
}

function Week({ week }) {
  return (
    <section aria-label={`Week ${week.n}`} className="border-t border-gray-200 pt-5">
      <h3 className="text-heading-3 text-gray-900">
        <span className="text-gray-400">Week {week.n}</span> · {week.theme}
      </h3>
      <p className="mt-1.5 text-body-s text-gray-500">{week.note}</p>
      <div className="mt-4 flex flex-col gap-5">
        {week.sessions.map((session) => (
          <div key={session.day}>
            <p className="text-body-l font-semibold text-gray-900">
              <span className="text-gray-400">{session.day}</span> · {session.title}
              <span className="ml-2 text-body-s font-normal text-gray-400">{session.minutes} min</span>
            </p>
            <dl className="mt-2 flex flex-col gap-2.5">
              {session.items.map((item) => (
                <div key={item.text} className="grid grid-cols-[1fr_auto] gap-3">
                  <dt>
                    <span className="text-body-m text-gray-900">{item.text}</span>
                    <Said by={item.by} quote={item.quote} />
                  </dt>
                  <dd className="pt-0.5 text-right text-body-s text-gray-500">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  )
}

function Nutrition({ nutrition }) {
  return (
    <section aria-label="Eating" className="border-t border-gray-200 pt-5">
      <h3 className="text-heading-3 text-gray-900">Eating</h3>
      <p className="mt-1.5 text-body-s text-gray-500">{nutrition.headline}</p>
      <dl className="mt-3 flex flex-col gap-3">
        {nutrition.meals.map((meal) => (
          <div key={meal.text} className="grid grid-cols-[6.5rem_1fr] gap-3">
            <dt className="pt-0.5 text-body-s text-gray-400">{meal.slot}</dt>
            <dd>
              <span className="text-body-l text-gray-900">{meal.text}</span>
              {meal.chosen && <span className="ml-2 rounded-full bg-indigo-soft px-2 py-0.5 align-middle text-caption font-medium text-indigo">Your pick</span>}
              <span className="block text-body-s text-gray-500">{meal.detail}</span>
              <Said by={meal.by} quote={meal.quote} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function List({ label, items }) {
  if (!items.length) return null
  return (
    <section aria-label={label} className="border-t border-gray-200 pt-5">
      <h3 className="text-heading-3 text-gray-900">{label}</h3>
      <ul className="mt-3 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.label}>
            <span className="text-body-l text-gray-900">{item.label}</span>
            <span className="block text-body-s text-gray-500">{item.detail}</span>
            <Said by={item.by} quote={item.quote} />
          </li>
        ))}
      </ul>
    </section>
  )
}

// The fitness plan's part of the document: each week's sessions, what to eat,
// the kit you need and any extras you asked about.
export default function FitnessDocument({ itinerary: plan }) {
  return (
    <>
      {plan.weeks.map((week) => (
        <Week key={week.n} week={week} />
      ))}
      <Nutrition nutrition={plan.nutrition} />
      <List label="What you’ll need" items={plan.gear} />
      <List label="Extras you asked about" items={plan.extras} />
    </>
  )
}
