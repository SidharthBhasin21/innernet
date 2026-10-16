import { X } from 'lucide-react'
import AgentMascot from '../agent/AgentMascot'
import ChatInput from './ChatInput'

// Appears where the user clicked on the canvas; sending turns it into a chat card.
export default function ChatComposer({ initialPrompt, onSubmit, onCancel }) {
  return (
    <div className="w-80 rounded-xl border border-[#d7d9fc] bg-white p-3 shadow-large ring-4 ring-indigo/8 animate-pop-in">
      <div className="mb-2.5 flex items-center gap-2.5 px-1">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-indigo-soft">
          <AgentMascot className="size-6" />
        </span>
        <p className="flex-1 text-body-m font-semibold text-gray-900">New chat</p>
        <button type="button" onClick={onCancel} aria-label="Cancel new chat" className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900 focus-ring">
          <X className="size-4" />
        </button>
      </div>
      <ChatInput
        autoFocus
        initialValue={initialPrompt}
        label="Ask your agent"
        placeholder="Ask your agent anything…"
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
      <p className="mt-2 px-1 text-caption text-gray-400 max-md:hidden">Enter to send · Shift+Enter for a new line · Esc to cancel</p>
    </div>
  )
}
