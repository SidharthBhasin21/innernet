import { useState } from 'react'
import { ChevronsRight } from 'lucide-react'
import FeedPost from './FeedPost'
import FeedResizeHandle from './FeedResizeHandle'
import { posts } from '../../data/mockPosts'

const tabs = ['For You', 'Following']

export default function Feed({ panel, onCollapse }) {
  const [tab, setTab] = useState('For You')
  // Following shows only direct connections; all mock posters are, so both tabs share data for now.
  const visible = posts

  return (
    <aside
      aria-label="Feed"
      style={{ width: panel.width }}
      className="relative flex h-full shrink-0 flex-col border-l border-gray-200 bg-white"
    >
      <FeedResizeHandle width={panel.width} min={panel.min} max={panel.max} onResize={panel.setWidth} />
      <div className="flex items-center justify-between px-4 pt-4">
        <button type="button" onClick={onCollapse} aria-label="Collapse feed" className="rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 focus-ring">
          <ChevronsRight className="size-5" />
        </button>
      </div>
      <div role="tablist" aria-label="Feed filter" className="flex border-b border-gray-200 px-2">
        {tabs.map((t) => (
          <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)} className="tab">
            {t}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <p className="p-8 text-center text-body-m text-gray-500">Nothing here yet. Posts from your connections will appear here.</p>
        ) : (
          visible.map((post) => <FeedPost key={post.id} post={post} />)
        )}
      </div>
    </aside>
  )
}
