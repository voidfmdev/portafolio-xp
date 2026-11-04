import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderSession } from '../test-utils'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  window.history.replaceState(null, '', '/')
  vi.restoreAllMocks()
})

const ICONS = [
  'Descargar CV',
  'Sobre mí',
  'Proyectos',
  'Habilidades',
  'Experiencia',
  'Contacto',
  'Messenger',
  'Papelera de reciclaje',
]

describe('Desktop', () => {
  it('shows the eight icons as buttons in one list, CV first and the Recycle Bin last', () => {
    renderSession()
    const desktop = screen.getByRole('main', { name: 'Escritorio' })
    const list = within(desktop).getByRole('list')
    expect(
      within(list)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(ICONS)
  })

  it('selects with one click and opens with a double click', () => {
    renderSession()
    const icon = screen.getByRole('button', { name: 'Habilidades' })

    fireEvent.click(icon)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.doubleClick(icon)
    expect(screen.getByRole('dialog', { name: 'Habilidades' })).toBeVisible()
  })

  it('opens with a tap, whatever the screen width', () => {
    renderSession()
    const icon = screen.getByRole('button', { name: 'Proyectos' })
    fireEvent.pointerDown(icon, { pointerType: 'touch' })
    fireEvent.click(icon)
    expect(screen.getByRole('dialog', { name: 'Proyectos' })).toBeVisible()
  })

  it('does not open with a single mouse click', () => {
    renderSession()
    const icon = screen.getByRole('button', { name: 'Proyectos' })
    fireEvent.pointerDown(icon, { pointerType: 'mouse' })
    fireEvent.click(icon)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens with Enter', () => {
    renderSession()
    fireEvent.keyDown(screen.getByRole('button', { name: 'Experiencia' }), {
      key: 'Enter',
    })
    expect(screen.getByRole('dialog', { name: 'Experiencia' })).toBeVisible()
  })

  it('opens each app only once', () => {
    renderSession()
    const icon = screen.getByRole('button', { name: 'Messenger' })
    fireEvent.doubleClick(icon)
    fireEvent.doubleClick(icon)
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
  })

  it('opens the CV of the current language in a new tab', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    renderSession()
    fireEvent.doubleClick(screen.getByRole('button', { name: 'Descargar CV' }))
    expect(open).toHaveBeenCalledWith('/cv/cv-es.pdf', '_blank', 'noopener')
  })

  it('names the icons in English when the language changes', () => {
    renderSession({ lang: 'en' })
    expect(screen.getByRole('button', { name: 'Download CV' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Recycle Bin' })).toBeVisible()
  })
})
