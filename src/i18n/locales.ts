export type Lang = 'es' | 'en'

/** BCP 47 locale Intl uses for each language (spec §6: Chilean Spanish). */
export const LOCALES: Record<Lang, string> = {
  es: 'es-CL',
  en: 'en-US',
}
