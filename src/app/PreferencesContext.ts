import { createContext } from 'react'
import type { Preferences } from './preferences'

export interface PreferencesValue extends Preferences {
  setPreference: <K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) => void
  /** "Reset desktop": clears everything saved in this browser and goes back to the defaults. */
  reset: () => void
}

export const PreferencesContext = createContext<PreferencesValue | null>(null)
