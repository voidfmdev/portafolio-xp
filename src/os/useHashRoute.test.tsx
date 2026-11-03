import { act, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderSession } from './test-utils'

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  window.history.replaceState(null, '', '/')
})

function goTo(hash: string) {
  act(() => {
    window.history.replaceState(null, '', hash)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
}

describe('useHashRoute', () => {
  it('names the topmost window in the hash, with its item', () => {
    window.history.replaceState(null, '', '/#/proyectos/mi-proyecto')
    renderSession({ initialApps: [{ id: 'projects', target: 'mi-proyecto' }] })
    expect(window.location.hash).toBe('#/proyectos/mi-proyecto')

    fireEvent.doubleClick(screen.getByRole('button', { name: 'Sobre mí' }))
    expect(window.location.hash).toBe('#/sobre-mi')
  })

  it('replaces the history entry instead of adding one (D29)', () => {
    renderSession()
    const entries = window.history.length
    fireEvent.doubleClick(screen.getByRole('button', { name: 'Contacto' }))
    expect(window.location.hash).toBe('#/contacto')
    expect(window.history.length).toBe(entries)
  })

  it('opens the window a new hash names', () => {
    renderSession()
    goTo('#/habilidades/certificaciones')
    expect(screen.getByRole('dialog', { name: 'Habilidades' })).toHaveFocus()
    expect(window.location.hash).toBe('#/habilidades/certificaciones')
  })

  it('ignores a hash it does not know', () => {
    renderSession()
    goTo('#/desconocida')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('skips windows without a route and clears the hash when none is visible', () => {
    renderSession({ initialApps: [{ id: 'about' }] })
    fireEvent.doubleClick(
      screen.getByRole('button', { name: 'Papelera de reciclaje' }),
    )
    expect(window.location.hash).toBe('#/sobre-mi')

    const about = screen.getByRole('dialog', { name: 'Sobre mí' })
    fireEvent.click(within(about).getByRole('button', { name: 'Minimizar' }))
    expect(window.location.hash).toBe('')
  })
})
