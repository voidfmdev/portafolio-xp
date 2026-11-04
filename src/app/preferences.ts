import { storage } from '../lib/storage'

/** Control Panel settings saved in this browser (spec §5.10). The language lives in i18n. */
export interface Preferences {
  /** The desktop assistant may comment; read by the assistant once it exists. */
  assistantEnabled: boolean
  /** Same effect as the system's `prefers-reduced-motion: reduce`. */
  reduceMotion: boolean
}

export const DEFAULT_PREFERENCES: Preferences = {
  assistantEnabled: true,
  reduceMotion: false,
}

export const PREFERENCE_KEYS: Record<keyof Preferences, string> = {
  assistantEnabled: 'assistant-enabled',
  reduceMotion: 'reduce-motion',
}

/** Set on `<html>` while "Reduce animations" is on; tokens.css then stops the motion. */
export const REDUCE_MOTION_ATTRIBUTE = 'data-reduce-motion'

function readFlag(key: string, fallback: boolean): boolean {
  const value = storage.get(key)
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

/** Saved preferences, with the default for anything missing or unreadable. */
export function readPreferences(): Preferences {
  return {
    assistantEnabled: readFlag(
      PREFERENCE_KEYS.assistantEnabled,
      DEFAULT_PREFERENCES.assistantEnabled,
    ),
    reduceMotion: readFlag(
      PREFERENCE_KEYS.reduceMotion,
      DEFAULT_PREFERENCES.reduceMotion,
    ),
  }
}
