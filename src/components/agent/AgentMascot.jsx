import { useId } from 'react'

const tones = {
  indigo: ['#6366f1', '#a855f7'],
  green: ['#22c55e', '#3b82f6'],
  purple: ['#a855f7', '#ec4899'],
}

// Mascot for the user's personal agent. Tone only tints it per chat; it is
// always the same agent, never a separate account.
export default function AgentMascot({ tone = 'indigo', className = 'size-7' }) {
  const id = useId()
  const [from, to] = tones[tone] ?? tones.indigo

  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <line x1="20" y1="5" x2="20" y2="10" stroke={from} strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="4.5" r="2.5" fill={to} />
      <rect x="5" y="10" width="30" height="24" rx="12" fill={`url(#${id})`} />
      <rect x="9.5" y="15" width="21" height="13" rx="6.5" fill="#fff" />
      <ellipse cx="16" cy="21" rx="1.8" ry="2.2" fill="#0f172a" />
      <ellipse cx="24" cy="21" rx="1.8" ry="2.2" fill="#0f172a" />
      <path d="M17.5 24.6q2.5 1.8 5 0" fill="none" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
