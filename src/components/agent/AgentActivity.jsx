// High-level progress of the agent (never private reasoning).
export default function AgentActivity({ activity }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2.5 animate-pop-in">
      <span className="inline-flex h-7 items-center gap-1 rounded-full bg-[#f1e9ff] px-3" aria-hidden="true">
        {[0, 150, 300].map((delay) => (
          <span key={delay} style={{ animationDelay: `${delay}ms` }} className="size-1.5 rounded-full bg-purple animate-pulse-soft" />
        ))}
      </span>
      <span className="text-body-s text-gray-500">{activity?.message ?? 'Thinking…'}</span>
    </div>
  )
}
