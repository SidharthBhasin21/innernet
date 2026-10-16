const states = {
  working: { label: 'Thinking…', dot: 'bg-purple animate-pulse-soft', text: 'text-purple' },
  error: { label: 'Something went wrong', dot: 'bg-error', text: 'text-error' },
  idle: { label: 'Online', dot: 'bg-success', text: 'text-success' },
}

export default function AgentStatus({ status }) {
  const { label, dot, text } = states[status] ?? states.idle

  return (
    <span className={`flex items-center gap-1.5 text-body-s ${text}`}>
      <span aria-hidden="true" className={`size-2 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
