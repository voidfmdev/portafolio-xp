import { afterEach, describe, expect, it } from 'vitest'
import { formatHash, parseHash, replaceHash } from './routes'

afterEach(() => {
  window.history.replaceState(null, '', '/')
})

describe('parseHash', () => {
  it.each([
    ['#/sobre-mi', { id: 'about' }],
    ['#/proyectos', { id: 'projects' }],
    ['#/proyectos/mi-proyecto', { id: 'projects', target: 'mi-proyecto' }],
    ['#/habilidades', { id: 'skills' }],
    ['#/habilidades/lenguajes', { id: 'skills', target: 'lenguajes' }],
    ['#/experiencia', { id: 'experience' }],
    ['#/contacto', { id: 'contact' }],
    ['#/messenger', { id: 'messenger' }],
  ])('reads %s', (hash, route) => {
    expect(parseHash(hash)).toEqual(route)
  })

  it('accepts a trailing slash and any letter case', () => {
    expect(parseHash('#/Proyectos/')).toEqual({ id: 'projects' })
  })

  it.each([
    '',
    '#',
    '#/',
    '#/desconocida',
    '#/sobre-mi/algo',
    '#/proyectos/no válido',
    '#proyectos',
    '#/%E0%A4%A',
  ])('rejects %j', (hash) => {
    expect(parseHash(hash)).toBeNull()
  })
})

describe('formatHash', () => {
  it('writes the route of an app, with its item when it takes one', () => {
    expect(formatHash({ id: 'about' })).toBe('#/sobre-mi')
    expect(formatHash({ id: 'projects', target: 'mi-proyecto' })).toBe(
      '#/proyectos/mi-proyecto',
    )
  })

  it('ignores an item for apps whose route has none', () => {
    expect(formatHash({ id: 'contact', target: 'x' })).toBe('#/contacto')
  })

  it('is empty for apps without a route', () => {
    expect(formatHash({ id: 'recycle-bin' })).toBe('')
    expect(formatHash({ id: 'control-panel' })).toBe('')
  })

  it('round-trips through parseHash', () => {
    const route = { id: 'skills', target: 'certificaciones' } as const
    expect(parseHash(formatHash(route))).toEqual(route)
  })
})

describe('replaceHash', () => {
  it('replaces the hash without a new history entry and keeps ?lang=', () => {
    window.history.replaceState(null, '', '/?lang=en#/contacto')
    const entries = window.history.length
    replaceHash('#/proyectos')
    expect(window.location.search).toBe('?lang=en')
    expect(window.location.hash).toBe('#/proyectos')
    expect(window.history.length).toBe(entries)
  })

  it('drops the # when the hash is empty', () => {
    window.history.replaceState(null, '', '/#/contacto')
    replaceHash('')
    expect(window.location.href.endsWith('/')).toBe(true)
  })
})
