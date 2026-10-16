const palette = {
  Primary: [['Indigo', 'bg-indigo'], ['Purple', 'bg-purple'], ['Pink', 'bg-pink'], ['Blue', 'bg-blue']],
  Neutrals: [['Gray 900', 'bg-gray-900'], ['Gray 700', 'bg-gray-700'], ['Gray 500', 'bg-gray-500'], ['Gray 400', 'bg-gray-400'], ['Gray 300', 'bg-gray-300'], ['Gray 200', 'bg-gray-200'], ['Gray 100', 'bg-gray-100'], ['White', 'bg-white border border-gray-200']],
  Semantic: [['Success', 'bg-success'], ['Warning', 'bg-warning'], ['Error', 'bg-error'], ['Info', 'bg-info']],
  Gradients: [['Primary', 'bg-gradient-primary'], ['Soft', 'bg-gradient-soft'], ['Accent', 'bg-gradient-accent'], ['Canvas', 'bg-gradient-canvas border border-gray-200']],
}

const type = [
  ['text-display-xl', 'Display XL', 'Infinite ideas.'],
  ['text-display-l', 'Display L', 'Your space to think.'],
  ['text-heading-1', 'Heading 1', 'Plan, research, create.'],
  ['text-heading-2', 'Heading 2', 'Everything in one place.'],
  ['text-heading-3', 'Heading 3', 'Chats on your canvas'],
  ['text-body-l', 'Body L', 'Turn your thoughts into detail, with AI that understands your context.'],
  ['text-body-m', 'Body M', 'Click anywhere to start a new chat.'],
  ['text-body-s', 'Body S', 'Each chat is a separate conversation.'],
  ['text-caption text-gray-500', 'Caption', 'Last updated 2m ago'],
]

const shadows = ['shadow-subtle', 'shadow-medium', 'shadow-large', 'shadow-glow']
const radii = ['rounded-xs', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full']

function Section({ title, children }) {
  return (
    <section className="card p-6">
      <h2 className="mb-4 text-heading-3">{title}</h2>
      {children}
    </section>
  )
}

export default function DesignSystem() {
  return (
    <main className="min-h-svh bg-gradient-canvas p-8">
      <header className="mx-auto mb-8 max-w-6xl">
        <h1 className="text-display-l text-gradient-primary">innernet</h1>
        <p className="text-body-l text-gray-500">Design System v1.0: a modern workspace for infinite thinking.</p>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
        <Section title="Color Palette">
          {Object.entries(palette).map(([group, items]) => (
            <div key={group} className="mb-4">
              <h3 className="mb-2 text-body-m font-semibold text-gray-700">{group}</h3>
              <div className="flex flex-wrap gap-3">
                {items.map(([name, cls]) => (
                  <div key={name} className="flex flex-col items-center gap-1 text-caption text-gray-500">
                    <span className={`size-12 rounded-full ${cls}`} />
                    {name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section title="Typography">
          <div className="space-y-3">
            {type.map(([cls, label, sample]) => (
              <div key={label}>
                <p className="text-caption uppercase text-gray-400">{label}</p>
                <p className={cls}>{sample}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn btn-primary">+ New Chat</button>
            <button className="btn btn-secondary">+ New Chat</button>
            <button className="btn btn-tertiary">+ New Chat</button>
            <button className="btn-icon" aria-label="New chat">+</button>
            <button className="btn btn-primary" disabled>Disabled</button>
          </div>
        </Section>

        <Section title="Input Fields">
          <div className="space-y-3">
            <label className="input"><input className="w-full bg-transparent outline-none" placeholder="Search across your canvas…" /></label>
            <input className="input w-full" placeholder="Message Innernet…" />
            <input className="input w-full" placeholder="Disabled" disabled />
          </div>
        </Section>

        <Section title="Chips / Tags">
          <div className="flex flex-wrap gap-3">
            <span className="chip chip-online">● Online</span>
            <span className="chip chip-thinking animate-pulse-soft">● Thinking…</span>
            <span className="chip chip-offline">● Offline</span>
            <span className="chip">Tag</span>
          </div>
        </Section>

        <Section title="Tabs">
          <div role="tablist" className="flex border-b border-gray-200">
            <button role="tab" aria-selected="true" className="tab">For You</button>
            <button role="tab" aria-selected="false" className="tab">Following</button>
          </div>
        </Section>

        <Section title="Shadows">
          <div className="flex gap-4">
            {shadows.map((s) => <div key={s} className={`size-16 rounded-lg bg-white ${s}`} />)}
          </div>
        </Section>

        <Section title="Border Radius">
          <div className="flex gap-4">
            {radii.map((r) => <div key={r} className={`size-14 border border-gray-200 bg-white ${r}`} />)}
          </div>
        </Section>
      </div>
    </main>
  )
}
