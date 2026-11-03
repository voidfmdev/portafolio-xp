import { createContext } from 'react'
import type { Lang } from './locales'

export interface I18nContextValue {
  lang: Lang
  /** Switches the whole interface at once and saves the choice. */
  setLang: (lang: Lang) => void
}

export const I18nContext = createContext<I18nContextValue | null>(null)
