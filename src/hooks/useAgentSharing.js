import { useState } from 'react'
import { getStoredSharing, saveSharing } from '../lib/agentSharing'

export default function useAgentSharing() {
  const [sharing, setSharing] = useState(getStoredSharing)

  const toggle = (id) => {
    const next = { ...sharing, [id]: !sharing[id] }
    saveSharing(next)
    setSharing(next)
  }

  return [sharing, toggle]
}
