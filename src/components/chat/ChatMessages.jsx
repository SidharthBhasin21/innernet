import { useEffect, useRef } from 'react'
import AgentActivity from '../agent/AgentActivity'

function Message({ message }) {
  if (message.role === 'user') {
    return (
      <p className="ml-8 self-end rounded-md rounded-br-xs bg-indigo-soft px-3 py-2 text-body-m whitespace-pre-wrap text-gray-900">
        {message.content}
      </p>
    )
  }
  return (
    <p className="mr-4 rounded-md rounded-bl-xs bg-gray-100 px-3.5 py-2.5 text-body-m whitespace-pre-wrap text-gray-700">
      {message.content}
    </p>
  )
}

// `nowheel`/`nodrag` keep scrolling and text selection inside the card instead of moving the canvas.
export default function ChatMessages({ chat, autoHeight }) {
  const endRef = useRef(null)
  const count = chat.messages.length

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [count, chat.status])

  return (
    <div
      className={`nowheel nodrag flex min-h-0 flex-1 cursor-auto flex-col gap-2.5 overflow-y-auto px-4 pb-3 select-text ${autoHeight ? 'max-h-80' : ''}`}
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
      <div ref={endRef} />
    </div>
  )
}
