import { useCallback, useState } from 'react'

const read = (key, fallback) => {
  try {
    const value = Number(localStorage.getItem(key))
    return value || fallback
  } catch {
    return fallback
  }
}

// Width state for a right-docked panel, clamped to [min, max] and persisted.
export default function useResizablePanel({ key, initial, min, max }) {
  const clamp = useCallback((w) => Math.min(max, Math.max(min, w)), [min, max])
  const [width, setWidthState] = useState(() => clamp(read(key, initial)))

  const setWidth = useCallback(
    (next) => {
      const value = clamp(next)
      setWidthState(value)
      try {
        localStorage.setItem(key, String(value))
      } catch {
        // Persistence is best-effort in the prototype.
      }
    },
    [clamp, key],
  )

  return { width, setWidth, min, max }
}
