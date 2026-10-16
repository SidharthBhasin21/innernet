import Avatar from '../ui/Avatar'
import SectionHeader from '../ui/SectionHeader'
import { connections } from '../../data/mockConnections'

// `variant="page"` is the roomier mobile list; `limit` + `onSeeAll` show a preview.
export default function ConnectionList({ collapsed = false, variant = 'sidebar', limit, onSeeAll }) {
  const page = variant === 'page'
  const shown = limit ? connections.slice(0, limit) : connections

  return (
    <section aria-label="Connections" className="flex flex-col gap-2">
      <SectionHeader
        title="Connections"
        addLabel="Add connection"
        collapsed={collapsed}
        variant={variant}
        onSeeAll={shown.length < connections.length ? onSeeAll : undefined}
      />
      <ul>
        {shown.map(({ user, preview, time, online }) => (
          <li key={user.id}>
            <button
              type="button"
              aria-label={collapsed ? user.name : undefined}
              title={collapsed ? user.name : undefined}
              className={`flex w-full items-center gap-3 rounded-md text-left transition-colors hover:bg-gray-100 focus-ring ${page ? 'py-2.5' : 'py-2'} ${collapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <Avatar user={user} online={online} size={page ? 'xl' : 'md'} />
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate font-medium text-gray-900 ${page ? 'text-body-l' : 'text-body-m'}`}>{user.name}</span>
                    <span className={`block truncate text-gray-500 ${page ? 'text-body-m' : 'text-body-s'}`}>{preview}</span>
                  </span>
                  <span className="self-start pt-0.5 text-body-s text-gray-400">{time}</span>
                </>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
