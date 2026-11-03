import { useContext, useMemo } from 'react'
import {
  formatClockTime,
  formatFullDate,
  formatIsoDate,
  formatPeriod,
} from '../lib/dates'
import { I18nContext } from './I18nContext'
import type { Lang } from './locales'
import {
  localize,
  translate,
  translatePlural,
  type MessageKey,
  type MessageVars,
  type PluralKey,
} from './messages'

/** Interface strings, content fields and dates in the current language. */
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>')
  const { lang, setLang } = context

  return useMemo(
    () => ({
      lang,
      setLang,
      t: (key: MessageKey, vars?: MessageVars) => translate(lang, key, vars),
      tn: (key: PluralKey, count: number, vars?: MessageVars) =>
        translatePlural(lang, key, count, vars),
      localize: (value: string | Record<Lang, string>) => localize(value, lang),
      formatDate: (iso: string) => formatIsoDate(iso, lang),
      formatPeriod: (start: string, end: string | null, today?: Date) =>
        formatPeriod(start, end, lang, translate(lang, 'dates.present'), today),
      formatTime: (date: Date) => formatClockTime(date, lang),
      formatFullDate: (date: Date) => formatFullDate(date, lang),
    }),
    [lang, setLang],
  )
}
