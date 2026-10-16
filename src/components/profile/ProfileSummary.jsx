import Avatar from '../ui/Avatar'
import { useCanvas } from '../../store/canvasStore'
import { currentUser } from '../../data/mockUsers'
import { connections } from '../../data/mockConnections'

// The account at a glance: avatar, name and a couple of counts.
export default function ProfileSummary() {
  const { chats } = useCanvas()

  return (
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
  )
}
