// GitHub Pages project sites share one origin (`<usuario-github>.github.io`),
// so every key is namespaced and `clear` only touches this app's data.
const PREFIX = 'portafolio-xp:'

function getStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    // Reading `localStorage` throws when storage is blocked (privacy settings, sandboxed iframes).
    return null
  }
}

/**
 * `localStorage` wrapper that never throws: reads fall back to `null`
 * and writes report whether they were saved.
 */
export const storage = {
  get(key: string): string | null {
    try {
      return getStorage()?.getItem(PREFIX + key) ?? null
    } catch {
      return null
    }
  },

  set(key: string, value: string): boolean {
    try {
      const store = getStorage()
      if (!store) return false
      store.setItem(PREFIX + key, value)
      return true
    } catch {
      // Quota exceeded or storage disabled mid-session.
      return false
    }
  },

  remove(key: string): void {
    try {
      getStorage()?.removeItem(PREFIX + key)
    } catch {
      // Nothing was stored, so there is nothing to undo.
    }
  },

  /** Parsed JSON, or `null` when missing or unreadable. Callers validate the shape. */
  getJSON(key: string): unknown {
    const raw = storage.get(key)
    if (raw === null) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  setJSON(key: string, value: unknown): boolean {
    try {
      return storage.set(key, JSON.stringify(value))
    } catch {
      // Values JSON cannot represent (cycles, BigInt).
      return false
    }
  },

  /** Removes every key this app wrote ("Restablecer escritorio", spec §5.10). */
  clear(): void {
    try {
      const store = getStorage()
      if (!store) return
      const ownKeys = Array.from({ length: store.length }, (_, i) =>
        store.key(i),
      ).filter((key): key is string => key?.startsWith(PREFIX) ?? false)
      for (const key of ownKeys) store.removeItem(key)
    } catch {
      // Storage became unavailable; there is nothing left to clear.
    }
  },
}
