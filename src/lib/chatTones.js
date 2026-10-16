// Per-chat accent. Purely visual: every chat is the same personal agent.
export const chatTones = {
  indigo: { soft: 'bg-indigo-soft', border: 'border-[#d7d9fc]', accent: '#6366f1' },
  purple: { soft: 'bg-[#f1e9ff]', border: 'border-[#e6d5fd]', accent: '#a855f7' },
  blue: { soft: 'bg-[#e8f1ff]', border: 'border-[#cfe0fd]', accent: '#3b82f6' },
  amber: { soft: 'bg-[#fff4e0]', border: 'border-[#fbe2b4]', accent: '#f59e0b' },
  green: { soft: 'bg-[#e8f9ee]', border: 'border-[#c4ecd3]', accent: '#22c55e' },
  pink: { soft: 'bg-[#fdebf4]', border: 'border-[#f9cfe3]', accent: '#ec4899' },
}

export const getTone = (tone) => chatTones[tone] ?? chatTones.indigo
