import { useState } from 'react'

const hues = {
  indigo: 'from-indigo to-purple',
  pink: 'from-pink to-purple',
  blue: 'from-blue to-indigo',
  purple: 'from-purple to-pink',
  green: 'from-success to-blue',
  amber: 'from-warning to-pink',
}

const sizes = { sm: 'size-8 text-caption', md: 'size-10 text-body-m', lg: 'size-11 text-body-l' }

// Photo avatar with an initials fallback and an optional presence dot.
export default function Avatar({ user, size = 'md', online }) {
  const [failed, setFailed] = useState(false)
  const showPhoto = user.avatar && !failed

  return (
    <span className="relative inline-flex shrink-0">
      {showPhoto ? (
        <img
          src={user.avatar}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className={`rounded-full bg-gray-100 object-cover ${sizes[size]}`}
        />
      ) : (
        <span
          aria-hidden="true"
          className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ${hues[user.hue]} ${sizes[size]}`}
        >
          {user.name.charAt(0)}
        </span>
      )}
      {online && (
        <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-success">
          <span className="sr-only">Online</span>
        </span>
      )}
    </span>
  )
}
