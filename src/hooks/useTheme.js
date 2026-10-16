import { useState } from 'react'
import { getStoredTheme, saveTheme } from '../lib/theme'

export default function useTheme() {
  const [theme, setThemeState] = useState(getStoredTheme)

  const setTheme = (id) => {
    saveTheme(id)
    setThemeState(id)
  }

  return [theme, setTheme]
}
