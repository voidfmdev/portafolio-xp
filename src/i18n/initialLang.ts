import { storage } from '../lib/storage'
import { DEFAULT_LANG, isLang, type Lang } from './locales'

/** Storage key of the language the visitor chose (account on the welcome screen or language switch). */
export const LANG_STORAGE_KEY = 'lang'

interface LangSources {
  /** `location.search`, e.g. `"?lang=en"`. */
  search: string
  stored: string | null
  /** `navigator.languages`, most preferred first. */
  browserLanguages: readonly string[]
}

/** Initial language: `?lang=` > saved choice > first supported browser language > `es` (D4). */
export function resolveInitialLang({
  search,
  stored,
  browserLanguages,
}: LangSources): Lang {
  const fromUrl = new URLSearchParams(search).get('lang')?.toLowerCase()
  if (isLang(fromUrl)) return fromUrl
  if (isLang(stored)) return stored
  for (const tag of browserLanguages) {
    const primary = tag.toLowerCase().split('-')[0]
    if (isLang(primary)) return primary
  }
  return DEFAULT_LANG
}

export function detectInitialLang(): Lang {
  return resolveInitialLang({
    search: window.location.search,
    stored: storage.get(LANG_STORAGE_KEY),
    browserLanguages: navigator.languages?.length
      ? navigator.languages
      : [navigator.language],
  })
}
