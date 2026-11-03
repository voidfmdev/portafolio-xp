import { describe, expect, it } from 'vitest'
import {
  localize,
  placeholdersOf,
  translate,
  translatePlural,
} from './messages'

describe('translate', () => {
  it('returns the string in each language', () => {
    expect(translate('es', 'taskbar.start')).toBe('Inicio')
    expect(translate('en', 'taskbar.start')).toBe('start')
  })

  it('fills in variables', () => {
    expect(
      translate('es', 'tray.language', { current: 'Español', next: 'English' }),
    ).toBe('Idioma: Español. Cambiar a English')
  })

  it('formats numbers per language', () => {
    expect(
      translate('es', 'projects.galleryPosition', { current: 1, total: 1000 }),
    ).toBe('Imagen 1 de 1.000')
    expect(
      translate('en', 'projects.galleryPosition', { current: 1, total: 1000 }),
    ).toBe('Image 1 of 1,000')
  })

  it('leaves a missing variable visible', () => {
    expect(translate('en', 'messenger.typing')).toBe('{name} is typing…')
    expect(translate('en', 'messenger.typing', {})).toBe('{name} is typing…')
  })
})

describe('translatePlural', () => {
  it.each([
    ['es', 1, '1 proyecto'],
    ['es', 0, '0 proyectos'],
    ['es', 2, '2 proyectos'],
    ['en', 1, '1 project'],
    ['en', 3, '3 projects'],
  ] as const)('%s, %i → %s', (lang, count, expected) => {
    expect(translatePlural(lang, 'explorer.projectCount', count)).toBe(expected)
  })

  it('falls back to .other for categories without their own form', () => {
    // Spanish has a "many" category for 1 000 000 that the catalogs do not define.
    expect(translatePlural('es', 'explorer.categoryCount', 1_000_000)).toBe(
      '1.000.000 categorías',
    )
  })
})

describe('localize', () => {
  it('picks the language of a bilingual text', () => {
    expect(
      localize({ es: 'Habilidades blandas', en: 'Soft skills' }, 'en'),
    ).toBe('Soft skills')
  })

  it('shows a plain name as is in both languages', () => {
    expect(localize('TypeScript', 'es')).toBe('TypeScript')
    expect(localize('TypeScript', 'en')).toBe('TypeScript')
  })
})

describe('placeholdersOf', () => {
  it('lists the variable names of a template', () => {
    expect(placeholdersOf('Imagen {current} de {total}')).toEqual([
      'current',
      'total',
    ])
    expect(placeholdersOf('Inicio')).toEqual([])
  })
})
