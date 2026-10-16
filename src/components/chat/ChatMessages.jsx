import { useEffect, useRef } from 'react'
import AgentActivity from '../agent/AgentActivity'
import AttachmentList from './AttachmentList'

// How close to the bottom (px) still counts as "following" the conversation.
const STICK_THRESHOLD = 80

function Message({ message }) {
  if (message.role === 'user') {
    return (
      <div className="ml-8 flex flex-col items-end gap-1.5 self-end">
        {message.attachments?.length > 0 && <AttachmentList attachments={message.attachments} />}
        {message.content && (
          <p className="rounded-md rounded-br-xs bg-indigo-soft px-3 py-2 text-body-m whitespace-pre-wrap text-gray-900">{message.content}</p>
        )}
      </div>
    )
  }
  return (
    <p className="mr-4 rounded-md rounded-bl-xs bg-gray-100 px-3.5 py-2.5 text-body-m whitespace-pre-wrap text-gray-700">
      {message.content}
    </p>
  )
}

// The card has a fixed max height; history scrolls here. `nowheel`/`nodrag`
// keep scrolling and text selection inside the card instead of moving the canvas.
export default function ChatMessages({ chat }) {
  const scrollRef = useRef(null)
  const followingRef = useRef(true)
  const count = chat.messages.length
  const lastRole = chat.messages.at(-1)?.role

  // Follow new messages unless the user has scrolled up to read history;
  // their own message always brings them back to the bottom.
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !(followingRef.current || lastRole === 'user')) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [count, chat.status, lastRole])

  return (
    <div
      ref={scrollRef}
      onScroll={(event) => {
        const el = event.currentTarget
        followingRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD
      }}
      className="nowheel nodrag flex min-h-0 flex-1 cursor-auto flex-col gap-2.5 overflow-y-auto overscroll-contain px-4 pb-3 select-text"
    >
      {chat.messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      {chat.status === 'working' && <AgentActivity activity={chat.activity} />}
      {chat.status === 'error' && (
        <p role="alert" className="text-body-s text-error">
          Your agent couldn't reach your network. Try sending again.
        </p>
      )}
    </div>
  )
}
