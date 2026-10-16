import AgentMascot from '../agent/AgentMascot'

// The user's one personal agent, shown as part of their account rather than a separate identity.
export default function PersonalAgentCard() {
  return (
    <section aria-labelledby="agent-heading" className="rounded-xl border border-indigo-border bg-gradient-accent p-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white shadow-subtle">
          <AgentMascot className="size-7" />
        </span>
        <div className="min-w-0">
          <h3 id="agent-heading" className="text-body-l font-semibold text-gray-900">
            Personal Agent
          </h3>
          <p className="text-body-s text-gray-500">Part of your account</p>
        </div>
      </div>
      <p className="mt-3 text-body-m text-gray-700">
        When people you know ask their agents something, yours answers only with what you allow below.
      </p>
    </section>
  )
}
