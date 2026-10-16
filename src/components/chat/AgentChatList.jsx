import AgentMascot from '../agent/AgentMascot'
import SectionHeader from '../ui/SectionHeader'
import { agentChats } from '../../data/mockChats'

const tones = {
  indigo: 'bg-indigo-soft text-indigo',
  green: 'bg-[#e8f9ee] text-success',
  purple: 'bg-[#f1e9ff] text-purple',
}

export default function AgentChatList({ collapsed = false }) {
  return (
    <section aria-label="Agent chats" className="flex flex-col gap-2">
      <SectionHeader title="Agent Chats" addLabel="New agent chat" collapsed={collapsed} />
      <ul>
        {agentChats.map(({ id, title, preview, time, tone, active }) => {
          return (
            <li key={id}>
              <button
                type="button"
                aria-current={active ? 'true' : undefined}
                aria-label={collapsed ? title : undefined}
                title={collapsed ? title : undefined}
                className={`flex w-full items-center gap-3 rounded-md py-2 text-left transition-colors focus-ring ${collapsed ? 'justify-center px-0' : 'px-3'} ${active ? 'bg-indigo-soft' : 'hover:bg-gray-100'}`}
              >
                <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}>
                  <AgentMascot tone={tone} />
                </span>
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-m font-medium text-gray-900">{title}</span>
                      <span className="block truncate text-body-s text-gray-500">{preview}</span>
                    </span>
                    <span className="self-start pt-0.5 text-body-s text-gray-400">{time}</span>
                  </>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
