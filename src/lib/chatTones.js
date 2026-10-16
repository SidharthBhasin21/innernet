// Per-chat accent. Purely visual: every chat is the same personal agent.
export const chatTones = {
  indigo: { soft: 'bg-indigo-soft', border: 'border-indigo-border', accent: 'var(--color-indigo)' },
  purple: { soft: 'bg-(--tone-purple-soft)', border: 'border-(--tone-purple-border)', accent: '#a855f7' },
  blue: { soft: 'bg-(--tone-blue-soft)', border: 'border-(--tone-blue-border)', accent: '#3b82f6' },
  amber: { soft: 'bg-(--tone-amber-soft)', border: 'border-(--tone-amber-border)', accent: '#f59e0b' },
  green: { soft: 'bg-(--tone-green-soft)', border: 'border-(--tone-green-border)', accent: '#22c55e' },
  pink: { soft: 'bg-(--tone-pink-soft)', border: 'border-(--tone-pink-border)', accent: '#ec4899' },
}

export const getTone = (tone) => chatTones[tone] ?? chatTones.indigo
