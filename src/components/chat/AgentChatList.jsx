import { Bot, Lightbulb, MessageCircle, Wallet } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import { agentChats } from '../../data/mockChats'

const icons = { message: MessageCircle, bot: Bot, lightbulb: Lightbulb, wallet: Wallet }
const tones = {
  indigo: 'bg-indigo-soft text-indigo',
  green: 'bg-[#e8f9ee] text-success',
  purple: 'bg-[#f1e9ff] text-purple',
}

export default function AgentChatList() {
  return (
    <section aria-label="Agent chats" className="flex flex-col gap-2">
      <SectionHeader title="Agent Chats" addLabel="New agent chat" />
      <ul>
        {agentChats.map(({ id, title, preview, time, tone, icon, active }) => {
          const Icon = icons[icon]
          return (
            <li key={id}>
              <button
                type="button"
                aria-current={active ? 'true' : undefined}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors focus-ring ${active ? 'bg-indigo-soft' : 'hover:bg-gray-100'}`}
              >
                <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-m font-medium text-gray-900">{title}</span>
                  <span className="block truncate text-body-s text-gray-500">{preview}</span>
                </span>
                <span className="self-start pt-0.5 text-body-s text-gray-400">{time}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
