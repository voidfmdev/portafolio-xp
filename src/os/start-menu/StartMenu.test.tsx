import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderSession } from '../test-utils'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  window.history.replaceState(null, '', '/')
})

function openMenu() {
  const start = screen.getByRole('button', { name: 'Inicio' })
  fireEvent.click(start)
  return { start, menu: screen.getByRole('menu', { name: 'Menú Inicio' }) }
}

describe('StartMenu', () => {
  it('lists the six sections, the places and Log off', () => {
    renderSession()
    const { start, menu } = openMenu()
    expect(start).toHaveAttribute('aria-expanded', 'true')
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual([
      'Sobre míConóceme',
      'ProyectosExplora mi trabajo',
      'HabilidadesMi caja de herramientas',
      'ExperienciaTrayectoria y educación',
      'ContactoHablemos',
      'MessengerUn mensaje de bienvenida',
      'Descargar CV',
      'Panel de control',
      'Ayuda',
      'Cerrar sesión',
    ])
    expect(screen.getByText('Invitado')).toBeVisible()
  })

  it('focuses the first item and moves with the arrow keys', () => {
    renderSession()
    const { menu } = openMenu()
    const items = within(menu).getAllByRole('menuitem')
    expect(items[0]).toHaveFocus()

    fireEvent.keyDown(items[0], { key: 'ArrowUp' })
    expect(items[items.length - 1]).toHaveFocus()

    fireEvent.keyDown(items[items.length - 1], { key: 'Home' })
    fireEvent.keyDown(items[0], { key: 'ArrowRight' })
    expect(
      within(menu).getByRole('menuitem', { name: 'Descargar CV' }),
    ).toHaveFocus()
  })

  it('closes with Esc and gives the focus back to Start', () => {
    renderSession()
    const { start, menu } = openMenu()
    fireEvent.keyDown(menu, { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(start).toHaveAttribute('aria-expanded', 'false')
    expect(start).toHaveFocus()
  })

  it('closes on a click outside', () => {
    renderSession()
    openMenu()
    fireEvent.pointerDown(screen.getByRole('main'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('toggles with the Start button', () => {
    renderSession()
    const { start } = openMenu()
    fireEvent.pointerDown(start)
    fireEvent.click(start)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('opens a window and closes; closing the window focuses Start', () => {
    renderSession()
    const { start, menu } = openMenu()
    fireEvent.click(within(menu).getByRole('menuitem', { name: /Proyectos/ }))

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    const dialog = screen.getByRole('dialog', { name: 'Proyectos' })
    expect(dialog).toHaveFocus()

    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(start).toHaveFocus()
  })

  it('opens the Control Panel', () => {
    renderSession()
    const { menu } = openMenu()
    fireEvent.click(
      within(menu).getByRole('menuitem', { name: 'Panel de control' }),
    )
    expect(
      screen.getByRole('dialog', { name: 'Panel de control' }),
    ).toBeVisible()
  })

  it('links the CV of the current language', () => {
    renderSession({ lang: 'en' })
    const start = screen.getByRole('button', { name: 'start' })
    fireEvent.click(start)
    expect(
      screen.getByRole('menuitem', { name: 'Download CV' }),
    ).toHaveAttribute('href', '/cv/<alias>-cv-en.pdf')
  })

  it('shows the assistant from Help', () => {
    renderSession()
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar asistente' }))
    const { menu, start } = openMenu()
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Ayuda' }))
    expect(
      screen.getByRole('button', { name: 'Ocultar asistente' }),
    ).toBeVisible()
    expect(start).toHaveFocus()
  })

  it('logs off', () => {
    const onLogOff = vi.fn()
    renderSession({ onLogOff })
    const { menu } = openMenu()
    fireEvent.click(
      within(menu).getByRole('menuitem', { name: 'Cerrar sesión' }),
    )
    expect(onLogOff).toHaveBeenCalledOnce()
  })
})
