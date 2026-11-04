import { useContext } from 'react'
import { PreferencesContext } from './PreferencesContext'

/** Control Panel settings and the actions that change them. */
export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used inside <PreferencesProvider>')
  }
  return context
}
