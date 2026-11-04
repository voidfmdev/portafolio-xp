import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { storage } from '../lib/storage'
import {
  DEFAULT_PREFERENCES,
  PREFERENCE_KEYS,
  readPreferences,
  REDUCE_MOTION_ATTRIBUTE,
  type Preferences,
} from './preferences'
import { PreferencesContext } from './PreferencesContext'

/** Control Panel settings (spec §5.10), saved through the storage wrapper. */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readPreferences)

  useEffect(() => {
    document.documentElement.toggleAttribute(
      REDUCE_MOTION_ATTRIBUTE,
      preferences.reduceMotion,
    )
  }, [preferences.reduceMotion])

  const setPreference = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      storage.set(PREFERENCE_KEYS[key], String(value))
      setPreferences((current) => ({ ...current, [key]: value }))
    },
    [],
  )

  const reset = useCallback(() => {
    // Also forgets the saved language; the current one stays until the next visit.
    storage.clear()
    setPreferences(DEFAULT_PREFERENCES)
  }, [])

  const value = useMemo(
    () => ({ ...preferences, setPreference, reset }),
    [preferences, setPreference, reset],
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}
