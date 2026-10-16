import { useState } from 'react'
import { ChevronsRight } from 'lucide-react'
import FeedPost from './FeedPost'
import FeedResizeHandle from './FeedResizeHandle'
import SegmentedTabs from '../ui/SegmentedTabs'
import { posts } from '../../data/mockPosts'

const tabs = ['For You', 'Following']

// `panel` is the resizable desktop side panel; `page` is the full-width mobile screen.
export default function Feed({ variant = 'panel', panel, onCollapse }) {
  const [tab, setTab] = useState('For You')
  const isPage = variant === 'page'
  // Following shows only direct connections; all mock posters are, so both tabs share data for now.
  const visible = posts

  return (
    <aside
      aria-label="Feed"
      style={isPage ? undefined : { width: panel.width }}
      className={`relative flex h-full flex-col bg-white ${isPage ? 'w-full' : 'shrink-0 border-l border-gray-200'}`}
    >
      {isPage ? (
        <div className="shrink-0 px-4 pt-1 pb-2">
          <SegmentedTabs label="Feed filter" tabs={tabs} value={tab} onChange={setTab} />
        </div>
      ) : (
        <>
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
        </>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {visible.length === 0 ? (
          <p className="p-8 text-center text-body-m text-gray-500">Nothing here yet. Posts from your connections will appear here.</p>
        ) : (
          visible.map((post) => <FeedPost key={post.id} post={post} compact={!isPage} />)
        )}
      </div>
    </aside>
  )
}
