import { useState } from 'react'
import SegmentedTabs from '../ui/SegmentedTabs'
import ConnectionList from '../connections/ConnectionList'
import AgentChatList from './AgentChatList'

const tabs = ['All', 'People', 'Agents']
// How many rows of each list the "All" tab previews before "See all".
const PREVIEW = { people: 4, agents: 5 }

// Mobile "Chats" tab: the sidebar's connections and agent chats as a full screen.
export default function ChatsScreen({ onOpenChat }) {
  const [tab, setTab] = useState('All')
  const all = tab === 'All'

  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <div className="sticky top-0 z-10 bg-white px-4 pt-1 pb-3">
        <SegmentedTabs label="Filter chats" tabs={tabs} value={tab} onChange={setTab} />
      </div>
      <div className="flex flex-col gap-6 px-1 pb-6">
        {tab !== 'Agents' && (
          <ConnectionList variant="page" limit={all ? PREVIEW.people : undefined} onSeeAll={() => setTab('People')} />
        )}
        {tab !== 'People' && (
          <AgentChatList
            variant="page"
            limit={all ? PREVIEW.agents : undefined}
            onSeeAll={() => setTab('Agents')}
            onOpenChat={onOpenChat}
          />
        )}
      </div>
    </div>
  )
}
