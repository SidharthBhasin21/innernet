import Avatar from '../ui/Avatar'
import SectionHeader from '../ui/SectionHeader'
import { connections } from '../../data/mockConnections'

export default function ConnectionList() {
  return (
    <section aria-label="Connections" className="flex flex-col gap-2">
      <SectionHeader title="Connections" addLabel="Add connection" />
      <ul>
        {connections.map(({ user, preview, time, online }) => (
          <li key={user.id}>
            <button type="button" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-gray-100 focus-ring">
              <Avatar user={user} online={online} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-m font-medium text-gray-900">{user.name}</span>
                <span className="block truncate text-body-s text-gray-500">{preview}</span>
              </span>
              <span className="self-start pt-0.5 text-body-s text-gray-400">{time}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
