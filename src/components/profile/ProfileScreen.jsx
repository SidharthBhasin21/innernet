import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import Avatar from '../ui/Avatar'
import AgentMascot from '../agent/AgentMascot'
import { useCanvas } from '../../store/canvasStore'
import { currentUser } from '../../data/mockUsers'
import { connections } from '../../data/mockConnections'
import { sharingCategories } from '../../data/mockPermissions'

function SharingToggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 px-4 py-3">
      <span className="min-w-0 flex-1">
        <span className="block text-body-m font-medium text-gray-900">{label}</span>
        <span className="block text-body-s text-gray-500">{description}</span>
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative h-6 w-10 shrink-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-indigo peer-focus-visible:shadow-focus after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-subtle after:transition-transform peer-checked:after:translate-x-4"
      />
    </label>
  )
}

// Mobile "Profile" tab: the account, its single personal agent, and what that agent may share.
export default function ProfileScreen() {
  const { chats } = useCanvas()
  const [sharing, setSharing] = useState(() => Object.fromEntries(sharingCategories.map((c) => [c.id, c.shared])))

  return (
    <div className="h-full overflow-y-auto overscroll-contain px-4 pt-2 pb-8">
      <section aria-label="Your profile" className="flex flex-col items-center text-center">
        <Avatar user={currentUser} size="2xl" />
        <h2 className="mt-3 text-heading-3 text-gray-900">{currentUser.name}</h2>
        <p className="text-body-m text-gray-500">@{currentUser.username}</p>
        <dl className="mt-4 flex gap-10">
          <div>
            <dt className="text-body-s text-gray-500">Connections</dt>
            <dd className="text-body-l font-semibold text-gray-900">{connections.length}</dd>
          </div>
          <div>
            <dt className="text-body-s text-gray-500">Agent chats</dt>
            <dd className="text-body-l font-semibold text-gray-900">{chats.length}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="agent-heading" className="mt-6 rounded-xl border border-[#d7d9fc] bg-gradient-accent p-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white shadow-subtle">
            <AgentMascot className="size-7" />
          </span>
          <div className="min-w-0">
            <h3 id="agent-heading" className="text-body-l font-semibold text-gray-900">
              Personal Agent
            </h3>
            <p className="text-body-s text-gray-500">Part of your account</p>
          </div>
        </div>
        <p className="mt-3 text-body-m text-gray-700">
          When people you know ask their agents something, yours answers only with what you allow below.
        </p>
      </section>

      <section aria-labelledby="sharing-heading" className="mt-6">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck className="size-5 text-indigo" aria-hidden="true" />
          <h3 id="sharing-heading" className="text-body-l font-semibold text-gray-900">
            What your agent can share
          </h3>
        </div>
        <ul className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {sharingCategories.map(({ id, label, description }) => (
            <li key={id}>
              <SharingToggle
                label={label}
                description={description}
                checked={sharing[id]}
                onChange={() => setSharing((current) => ({ ...current, [id]: !current[id] }))}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
