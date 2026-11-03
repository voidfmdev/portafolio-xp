import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storage } from './storage'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('storage', () => {
  it('round-trips strings under the app namespace', () => {
    expect(storage.set('lang', 'en')).toBe(true)
    expect(storage.get('lang')).toBe('en')
    expect(localStorage.getItem('portafolio-xp:lang')).toBe('en')
  })

  it('returns null for missing keys', () => {
    expect(storage.get('missing')).toBeNull()
    expect(storage.getJSON('missing')).toBeNull()
  })

  it('round-trips JSON and treats unreadable JSON as missing', () => {
    expect(storage.setJSON('prefs', { assistant: false })).toBe(true)
    expect(storage.getJSON('prefs')).toEqual({ assistant: false })

    localStorage.setItem('portafolio-xp:prefs', '{not json')
    expect(storage.getJSON('prefs')).toBeNull()
  })

  it('reports values JSON cannot represent instead of throwing', () => {
    const cyclic: Record<string, unknown> = {}
    cyclic.self = cyclic
    expect(storage.setJSON('prefs', cyclic)).toBe(false)
  })

  it('removes a single key', () => {
    storage.set('lang', 'es')
    storage.remove('lang')
    expect(storage.get('lang')).toBeNull()
  })

  it('clears only its own keys', () => {
    storage.set('lang', 'es')
    storage.setJSON('prefs', { assistant: true })
    localStorage.setItem('another-site:token', 'keep')

    storage.clear()

    expect(localStorage.length).toBe(1)
    expect(localStorage.getItem('another-site:token')).toBe('keep')
  })

  it('reports a failed write when the quota is exceeded', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })
    expect(storage.set('lang', 'es')).toBe(false)
    expect(storage.setJSON('prefs', {})).toBe(false)
  })

  it('keeps working when localStorage is blocked', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Access denied', 'SecurityError')
    })

    expect(storage.get('lang')).toBeNull()
    expect(storage.getJSON('prefs')).toBeNull()
    expect(storage.set('lang', 'es')).toBe(false)
    expect(() => storage.remove('lang')).not.toThrow()
    expect(() => storage.clear()).not.toThrow()
  })
})
