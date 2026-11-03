export const LANGS = ['es', 'en'] as const

export type Lang = (typeof LANGS)[number]

/** Used when neither the URL, the saved choice nor the browser name a supported language. */
export const DEFAULT_LANG: Lang = 'es'

/** BCP 47 locale Intl uses for each language (spec §6: Chilean Spanish). */
export const LOCALES: Record<Lang, string> = {
  es: 'es-CL',
  en: 'en-US',
}

export function isLang(value: unknown): value is Lang {
  return LANGS.includes(value as Lang)
}
