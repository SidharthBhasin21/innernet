// Visual themes. A theme is just a `data-theme` attribute on <html>;
// the token overrides live in src/theme/themes.css.

export const THEMES = [
  {
    id: 'paper',
    label: 'Paper',
    description: 'Warm paper and ink, like innernet.company',
    chrome: '#faf9f5',
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Charcoal surfaces with paper-colored ink',
    chrome: '#171915',
  },
  {
    id: 'classic',
    label: 'Classic',
    description: 'Bright, with soft purple accents',
    chrome: '#ffffff',
  },
]

// The first theme is the default.
const DEFAULT_THEME = THEMES[0].id

const STORAGE_KEY = 'innernet:theme'

export function getStoredTheme() {
  try {
    const id = localStorage.getItem(STORAGE_KEY)
    if (THEMES.some((theme) => theme.id === id)) return id
  } catch {
    // Storage blocked: fall back to the default theme.
  }
  return DEFAULT_THEME
}

export function applyTheme(id) {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0]
  document.documentElement.dataset.theme = theme.id
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.chrome)
}

export function saveTheme(id) {
  applyTheme(id)
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Storage blocked: the theme still applies for this session.
  }
}
