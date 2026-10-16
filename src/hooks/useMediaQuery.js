import { useSyncExternalStore } from 'react'

// Below Tailwind's `md` breakpoint the app switches to the phone layout.
export const MOBILE_QUERY = '(max-width: 767px)'

export const isMobileViewport = () => window.matchMedia(MOBILE_QUERY).matches

export default function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}
