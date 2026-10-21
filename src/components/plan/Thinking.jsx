import AgentActivity from '../agent/AgentActivity'

// The node while the agent is still working it out: the question isn't there yet.
export default function Thinking({ icon: Icon, message }) {
  return (
    <div className="p-4">
      <div className="plan-drag-handle flex cursor-grab items-center gap-2.5 active:cursor-grabbing">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400" aria-hidden="true">
          <Icon className="size-4" />
        </span>
        <AgentActivity activity={{ message }} />
      </div>
      <div aria-hidden="true" className="mt-4 flex flex-wrap gap-1.5 animate-pulse-soft">
        {[20, 14, 24, 16].map((w, i) => (
          <span key={i} style={{ width: `${w * 4}px` }} className="h-8 rounded-full bg-gray-100" />
        ))}
      </div>
    </div>
  )
}
