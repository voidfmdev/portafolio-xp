import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { storage } from '../lib/storage'
import { I18nContext } from './I18nContext'
import { detectInitialLang, LANG_STORAGE_KEY } from './initialLang'
import type { Lang } from './locales'

/**
 * Holds the interface language apart from the window state, so switching
 * windows does not re-render every translated string.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    // `?lang=` only decides the first render; an explicit choice is what gets saved.
    storage.set(LANG_STORAGE_KEY, next)
    setLangState(next)
  }, [])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
