// The current user's agent-sharing choices, kept in localStorage so they
// survive reloads and stay the same across the desktop and mobile layouts.
import { sharingCategories } from '../data/mockPermissions'

const STORAGE_KEY = 'innernet:agent-sharing'

const defaults = () => Object.fromEntries(sharingCategories.map((c) => [c.id, c.shared]))

export function getStoredSharing() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (stored && typeof stored === 'object') return { ...defaults(), ...stored }
  } catch {
    // Storage blocked or malformed: fall back to the defaults.
  }
  return defaults()
}

export function saveSharing(sharing) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sharing))
  } catch {
    // Storage blocked: the choice still holds for this session.
  }
}
