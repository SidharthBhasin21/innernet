import { ShieldCheck } from 'lucide-react'
import useAgentSharing from '../../hooks/useAgentSharing'
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

// The categories the user's agent may draw on when a connection's agent asks.
export default function AgentSharingSettings() {
  const [sharing, toggle] = useAgentSharing()

  return (
    <section aria-labelledby="sharing-heading">
      <div className="flex items-center gap-2 px-1">
        <ShieldCheck className="size-5 text-indigo" aria-hidden="true" />
        <h3 id="sharing-heading" className="text-body-l font-semibold text-gray-900">
          What your agent can share
        </h3>
      </div>
      <ul className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {sharingCategories.map(({ id, label, description }) => (
          <li key={id}>
            <SharingToggle label={label} description={description} checked={sharing[id]} onChange={() => toggle(id)} />
          </li>
        ))}
      </ul>
    </section>
  )
}
