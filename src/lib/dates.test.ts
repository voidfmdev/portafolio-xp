import { describe, expect, it } from 'vitest'
import {
  formatClockTime,
  formatDuration,
  formatFullDate,
  formatIsoDate,
  formatPeriod,
  isIsoDate,
} from './dates'

// Spanish month abbreviations gained or lost a trailing dot across CLDR
// releases, so those assertions tolerate both.

describe('isIsoDate', () => {
  it.each(['2024-03', '2024-03-15', '2024-02-29'])('accepts %s', (value) => {
    expect(isIsoDate(value)).toBe(true)
  })

  it.each([
    '2024-13',
    '2024-00',
    '2024-3',
    '2023-02-29',
    '2024-04-31',
    '24-03',
    '',
  ])('rejects %s', (value) => {
    expect(isIsoDate(value)).toBe(false)
  })
})

describe('formatIsoDate', () => {
  it('formats months per language', () => {
    expect(formatIsoDate('2024-03', 'es')).toMatch(/^mar\.? 2024$/)
    expect(formatIsoDate('2024-03', 'en')).toBe('Mar 2024')
  })

  it('includes the day when the ISO string has one', () => {
    expect(formatIsoDate('2024-03-15', 'es')).toMatch(/^15 mar\.? 2024$/)
    expect(formatIsoDate('2024-03-15', 'en')).toBe('Mar 15, 2024')
  })

  it('does not shift the first day of a month into the previous one', () => {
    expect(formatIsoDate('2024-03-01', 'es')).toMatch(/^1 mar\.? 2024$/)
    expect(formatIsoDate('2024-03-01', 'en')).toBe('Mar 1, 2024')
  })

  it('throws on invalid input', () => {
    expect(() => formatIsoDate('2024/03', 'es')).toThrow(RangeError)
  })
})

describe('formatDuration', () => {
  it.each([
    [1, 'es', '1 mes'],
    [4, 'es', '4 meses'],
    [12, 'es', '1 año'],
    [16, 'es', '1 año y 4 meses'],
    [26, 'es', '2 años y 2 meses'],
    [1, 'en', '1 month'],
    [24, 'en', '2 years'],
    [16, 'en', '1 year, 4 months'],
  ] as const)('%i months in %s → %s', (months, lang, expected) => {
    expect(formatDuration(months, lang)).toBe(expected)
  })

  it.each([0, -1, 1.5])('rejects %s', (months) => {
    expect(() => formatDuration(months, 'es')).toThrow(RangeError)
  })
})

describe('formatPeriod', () => {
  it('counts months inclusively', () => {
    const { range, duration } = formatPeriod(
      '2023-01',
      '2023-04',
      'es',
      'Presente',
    )
    expect(range).toMatch(/^ene\.? 2023 – abr\.? 2023$/)
    expect(duration).toBe('4 meses')
  })

  it('treats a single month as one month', () => {
    expect(formatPeriod('2024-03', '2024-03', 'en', 'Present').duration).toBe(
      '1 month',
    )
  })

  it('ignores days when counting months', () => {
    expect(
      formatPeriod('2023-01-31', '2023-02-01', 'en', 'Present').duration,
    ).toBe('2 months')
  })

  it('runs ongoing periods up to today and shows the present label', () => {
    const today = new Date(2024, 4, 20)
    expect(formatPeriod('2024-01', null, 'en', 'Present', today)).toEqual({
      range: 'Jan 2024 – Present',
      duration: '5 months',
    })
  })

  it('reads an ongoing period that starts after today as just begun', () => {
    const today = new Date(2024, 4, 20)
    expect(
      formatPeriod('2024-06', null, 'es', 'Presente', today).duration,
    ).toBe('1 mes')
  })

  it('throws when the period ends before it starts', () => {
    expect(() => formatPeriod('2024-05', '2024-01', 'es', 'Presente')).toThrow(
      RangeError,
    )
  })
})

// Dates built from local parts, so the visitor's time zone gives back the same clock.
// Intl may separate "PM" with a narrow no-break space, hence `\s`.
describe('formatClockTime', () => {
  it('uses 24-hour time in Spanish', () => {
    expect(formatClockTime(new Date(2026, 10, 3, 9, 5), 'es')).toBe('09:05')
    expect(formatClockTime(new Date(2026, 10, 3, 14, 5), 'es')).toBe('14:05')
    expect(formatClockTime(new Date(2026, 10, 3, 0, 0), 'es')).toBe('00:00')
  })

  it('uses 12-hour time in English', () => {
    expect(formatClockTime(new Date(2026, 10, 3, 9, 5), 'en')).toMatch(
      /^9:05\sAM$/,
    )
    expect(formatClockTime(new Date(2026, 10, 3, 14, 5), 'en')).toMatch(
      /^2:05\sPM$/,
    )
  })
})

describe('formatFullDate', () => {
  it('writes the weekday and the full date per language', () => {
    const date = new Date(2026, 10, 3, 14, 5)
    expect(formatFullDate(date, 'es')).toBe('martes, 3 de noviembre de 2026')
    expect(formatFullDate(date, 'en')).toBe('Tuesday, November 3, 2026')
  })
})
