import en from './en.json'
import es from './es.json'
import { LOCALES, type Lang } from './locales'

/** Interface string keys. `es.json` is the reference; `en.json` must define the same keys. */
export type MessageKey = keyof typeof es

/** Base of a key with plural forms: `explorer.projectCount` for `explorer.projectCount.one` / `.other`. */
export type PluralKey = MessageKey extends infer K
  ? K extends `${infer Base}.other`
    ? Base
    : never
  : never

export type MessageVars = Record<string, string | number>

/** A missing key in `en.json` fails type checking here; the parity test covers extra keys. */
export const catalogs: Record<Lang, Record<MessageKey, string>> = { es, en }

const PLACEHOLDER = /\{(\w+)\}/g

const numberFormats = new Map<Lang, Intl.NumberFormat>()
const pluralRules = new Map<Lang, Intl.PluralRules>()

function cached<T>(cache: Map<Lang, T>, lang: Lang, create: () => T): T {
  let value = cache.get(lang)
  if (value === undefined) {
    value = create()
    cache.set(lang, value)
  }
  return value
}

/** Variable names a template uses, e.g. `["count"]` for `"{count} proyectos"`. */
export function placeholdersOf(template: string): string[] {
  return Array.from(template.matchAll(PLACEHOLDER), (match) => match[1])
}

function interpolate(template: string, lang: Lang, vars?: MessageVars): string {
  if (!vars) return template
  return template.replace(PLACEHOLDER, (match, name: string) => {
    const value = vars[name]
    if (value === undefined) return match // Left visible so a missing variable is easy to spot.
    if (typeof value === 'string') return value
    return cached(
      numberFormats,
      lang,
      () => new Intl.NumberFormat(LOCALES[lang]),
    ).format(value)
  })
}

/** Interface string in `lang`, with `{name}` variables filled in. Numbers follow the language's format. */
export function translate(
  lang: Lang,
  key: MessageKey,
  vars?: MessageVars,
): string {
  return interpolate(catalogs[lang][key], lang, vars)
}

/** Plural form for `count` (`.one`, `.other`…, falling back to `.other`), with `{count}` filled in. */
export function translatePlural(
  lang: Lang,
  key: PluralKey,
  count: number,
  vars?: MessageVars,
): string {
  const category = cached(
    pluralRules,
    lang,
    () => new Intl.PluralRules(LOCALES[lang]),
  ).select(count)
  const catalog: Record<string, string> = catalogs[lang]
  const template = catalog[`${key}.${category}`] ?? catalog[`${key}.other`]
  return interpolate(template, lang, { count, ...vars })
}

/** Content field in `lang`: a bilingual `{ es, en }` text, or a plain string shown as is in both languages. */
export function localize(
  value: string | Record<Lang, string>,
  lang: Lang,
): string {
  return typeof value === 'string' ? value : value[lang]
}
