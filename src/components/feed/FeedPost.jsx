import { useState } from 'react'
import { Bookmark, Heart, MessageCircle, MoreHorizontal } from 'lucide-react'
import Avatar from '../ui/Avatar'
import PostMedia from './PostMedia'
import { getUser } from '../../data/mockUsers'

export default function FeedPost({ post }) {
  const user = getUser(post.userId)
  const [liked, setLiked] = useState(Boolean(post.liked))
  const [saved, setSaved] = useState(false)
  const likes = post.likes + (liked && !post.liked ? 1 : 0) - (!liked && post.liked ? 1 : 0)

  return (
    <article className="flex gap-3 border-b border-gray-100 px-4 py-4">
      <Avatar user={user} size="lg" />
      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-1.5">
          <span className="truncate text-body-m font-semibold text-gray-900">{user.name.split(' ')[0]}</span>
          <span className="truncate text-body-s text-gray-500">@{user.username} · {post.time}</span>
          <button type="button" aria-label="More options" className="ml-auto rounded-full p-1 text-gray-400 hover:bg-gray-100 focus-ring">
            <MoreHorizontal className="size-4" />
          </button>
        </header>
        <p className="mt-0.5 text-body-m text-gray-900">{post.text}</p>
        <PostMedia media={post.media} />
        <footer className="mt-3 flex items-center gap-6 text-body-m text-gray-500">
          <button
            type="button"
            aria-pressed={liked}
            onClick={() => setLiked((v) => !v)}
            className={`flex items-center gap-1.5 rounded-sm focus-ring ${liked ? 'text-error' : 'hover:text-gray-900'}`}
          >
            <Heart className="size-5" fill={liked ? 'currentColor' : 'none'} aria-hidden="true" />
            <span className="sr-only">Like</span>
            {likes}
          </button>
          <button type="button" className="flex items-center gap-1.5 rounded-sm hover:text-gray-900 focus-ring">
            <MessageCircle className="size-5" aria-hidden="true" />
            <span className="sr-only">Comments</span>
            {post.comments}
          </button>
          <button
            type="button"
            aria-label="Save post"
            aria-pressed={saved}
            onClick={() => setSaved((v) => !v)}
            className={`ml-auto rounded-sm focus-ring ${saved ? 'text-indigo' : 'hover:text-gray-900'}`}
          >
            <Bookmark className="size-5" fill={saved ? 'currentColor' : 'none'} />
          </button>
        </footer>
      </div>
    </article>
  )
}
