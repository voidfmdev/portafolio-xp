import { useMediaQuery } from '../lib/useMediaQuery'
import { usePreferences } from './usePreferences'

/** Motion is reduced when the system asks for it or "Reduce animations" is on. */
export function useReducedMotion(): boolean {
  const { reduceMotion } = usePreferences()
  const system = useMediaQuery('(prefers-reduced-motion: reduce)')
  return reduceMotion || system
}
