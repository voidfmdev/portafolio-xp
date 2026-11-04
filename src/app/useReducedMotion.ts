import { useSyncExternalStore } from 'react'
import { usePreferences } from './usePreferences'

const QUERY = '(prefers-reduced-motion: reduce)'

// matchMedia is missing in some test environments; then the system asks for nothing.
function mediaQuery(): MediaQueryList | undefined {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia(QUERY)
    : undefined
}

function subscribe(onChange: () => void) {
  const query = mediaQuery()
  query?.addEventListener('change', onChange)
  return () => query?.removeEventListener('change', onChange)
}

function systemPrefersReducedMotion(): boolean {
  return mediaQuery()?.matches ?? false
}

/** Motion is reduced when the system asks for it or "Reduce animations" is on. */
export function useReducedMotion(): boolean {
  const { reduceMotion } = usePreferences()
  const system = useSyncExternalStore(
    subscribe,
    systemPrefersReducedMotion,
    () => false,
  )
  return reduceMotion || system
}
