import { beforeEach, describe, expect, it } from 'vitest'
import { storage } from '../lib/storage'
import {
  DEFAULT_PREFERENCES,
  PREFERENCE_KEYS,
  readPreferences,
} from './preferences'

beforeEach(() => {
  localStorage.clear()
})

describe('readPreferences', () => {
  it('uses the defaults when nothing was saved: assistant on, full motion', () => {
    expect(readPreferences()).toEqual(DEFAULT_PREFERENCES)
    expect(DEFAULT_PREFERENCES).toEqual({
      assistantEnabled: true,
      reduceMotion: false,
    })
  })

  it('reads the saved choices', () => {
    storage.set(PREFERENCE_KEYS.assistantEnabled, 'false')
    storage.set(PREFERENCE_KEYS.reduceMotion, 'true')
    expect(readPreferences()).toEqual({
      assistantEnabled: false,
      reduceMotion: true,
    })
  })

  it('falls back to the default for an unreadable value', () => {
    storage.set(PREFERENCE_KEYS.reduceMotion, 'maybe')
    expect(readPreferences().reduceMotion).toBe(false)
  })
})
