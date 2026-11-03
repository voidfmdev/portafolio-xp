// Loaded by vite.config.ts through the content schemas: imports carry extensions.
import { LOCALES, type Lang } from '../i18n/locales.ts'

// Content dates are ISO months (`YYYY-MM`) or days (`YYYY-MM-DD`).
const ISO_DATE = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/

interface ParsedDate {
  year: number
  month: number
  day?: number
}

function parse(iso: string): ParsedDate | null {
  const match = ISO_DATE.exec(iso)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = match[3] === undefined ? undefined : Number(match[3])
  // Date.UTC rolls overflow into the next month, so a round trip rejects 2024-02-30.
  const date = new Date(Date.UTC(year, month - 1, day ?? 1))
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== (day ?? 1)) {
    return null
  }
  return { year, month, day }
}

function parseOrThrow(iso: string): ParsedDate {
  const parsed = parse(iso)
  if (!parsed) throw new RangeError(`Invalid ISO date: "${iso}"`)
  return parsed
}

function monthIndex({ year, month }: ParsedDate): number {
  return year * 12 + month
}

export function isIsoDate(value: string): boolean {
  return parse(value) !== null
}

/** "mar 2024" / "Mar 2024", with the day when the ISO string has one. */
export function formatIsoDate(iso: string, lang: Lang): string {
  const { year, month, day } = parseOrThrow(iso)
  // UTC on both sides so the visitor's time zone never shifts the day.
  return new Intl.DateTimeFormat(LOCALES[lang], {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: day === undefined ? undefined : 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day ?? 1)))
}

/** "1 año y 4 meses" / "1 year, 4 months". */
export function formatDuration(months: number, lang: Lang): string {
  if (!Number.isInteger(months) || months < 1) {
    throw new RangeError(
      `Duration must be a whole number of months ≥ 1: ${months}`,
    )
  }
  const locale = LOCALES[lang]
  const unit = (name: 'year' | 'month', value: number) =>
    new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: name,
      unitDisplay: 'long',
    }).format(value)

  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts = [
    ...(years > 0 ? [unit('year', years)] : []),
    ...(rest > 0 ? [unit('month', rest)] : []),
  ]
  return new Intl.ListFormat(locale, { type: 'unit', style: 'long' }).format(
    parts,
  )
}

// The es-CL locale data writes "2:05 p. m."; the Spanish clock reads 24-hour "14:05".
const HOUR_CYCLE: Record<Lang, 'h12' | 'h23'> = { es: 'h23', en: 'h12' }

/** Taskbar clock and message times, in the visitor's time zone: "09:05" / "9:05 AM". */
export function formatClockTime(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[lang], {
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: HOUR_CYCLE[lang],
  }).format(date)
}

/** Clock tooltip, in the visitor's time zone: "martes, 3 de noviembre de 2026" / "Tuesday, November 3, 2026". */
export function formatFullDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[lang], { dateStyle: 'full' }).format(
    date,
  )
}

/**
 * Date range and duration of a job or degree. Months count inclusively
 * (2023-01 → 2023-04 is 4 months) and days are ignored for the duration.
 * `end: null` means ongoing: the range shows `presentLabel`, the duration runs to `today`.
 */
export function formatPeriod(
  start: string,
  end: string | null,
  lang: Lang,
  presentLabel: string,
  today: Date = new Date(),
): { range: string; duration: string } {
  const from = parseOrThrow(start)
  const to =
    end === null
      ? { year: today.getFullYear(), month: today.getMonth() + 1 }
      : parseOrThrow(end)
  const months = monthIndex(to) - monthIndex(from) + 1

  if (end !== null && months < 1) {
    throw new RangeError(`Period ends before it starts: ${start} → ${end}`)
  }

  return {
    range: `${formatIsoDate(start, lang)} – ${end === null ? presentLabel : formatIsoDate(end, lang)}`,
    // An ongoing period that starts next month still reads as just begun.
    duration: formatDuration(Math.max(months, 1), lang),
  }
}
