import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { tabbableElements } from '../../lib/a11y'
import { renderSession } from '../test-utils'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  window.history.replaceState(null, '', '/')
})

function openFromDesktop(name: string) {
  const icon = screen.getByRole('button', { name })
  fireEvent.click(icon)
  fireEvent.doubleClick(icon)
  return icon
}

describe('Window', () => {
  it('is a dialog named by its title', () => {
    renderSession({ initialApps: [{ id: 'about' }] })
    const dialog = screen.getByRole('dialog', { name: 'Sobre mí' })
    expect(
      within(dialog).getByRole('heading', { level: 2, name: 'Sobre mí' }),
    ).toBeVisible()
  })

  it('names its buttons in the current language and keeps the XP.css style hooks', () => {
    renderSession({ initialApps: [{ id: 'about' }] })
    const dialog = screen.getByRole('dialog', { name: 'Sobre mí' })
    const close = within(dialog).getByRole('button', { name: 'Cerrar' })
    expect(close).toHaveAttribute('aria-label', 'Close')
    expect(
      within(dialog).getByRole('button', { name: 'Minimizar' }),
    ).toHaveAttribute('aria-label', 'Minimize')
    expect(
      within(dialog).getByRole('button', { name: 'Maximizar' }),
    ).toHaveAttribute('aria-label', 'Maximize')
  })

  it('switches the button names with the language', () => {
    renderSession({ lang: 'en', initialApps: [{ id: 'about' }] })
    const dialog = screen.getByRole('dialog', { name: 'About me' })
    expect(within(dialog).getByRole('button', { name: 'Close' })).toBeVisible()
  })

  it('takes the focus when it opens and gives it back to its icon when it closes', () => {
    renderSession()
    const icon = openFromDesktop('Proyectos')
    const dialog = screen.getByRole('dialog', { name: 'Proyectos' })
    expect(dialog).toHaveFocus()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(icon).toHaveFocus()
  })

  it('closes with Esc', () => {
    renderSession()
    const icon = openFromDesktop('Contacto')
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Contacto' }), {
      key: 'Escape',
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(icon).toHaveFocus()
  })

  it('maximizes and restores with its button and with a double click on the title', () => {
    renderSession({ initialApps: [{ id: 'about' }] })
    const dialog = screen.getByRole('dialog', { name: 'Sobre mí' })

    fireEvent.click(within(dialog).getByRole('button', { name: 'Maximizar' }))
    const restore = within(dialog).getByRole('button', { name: 'Restaurar' })
    expect(restore).toHaveAttribute('aria-label', 'Restore')

    fireEvent.doubleClick(within(dialog).getByRole('heading', { level: 2 }))
    expect(
      within(dialog).getByRole('button', { name: 'Maximizar' }),
    ).toBeVisible()
  })

  it('minimizes to its taskbar button, which brings it back', () => {
    renderSession({ initialApps: [{ id: 'about' }] })
    const dialog = screen.getByRole('dialog', { name: 'Sobre mí' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Minimizar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const taskbarButton = screen.getByRole('button', {
      name: 'Sobre mí',
      pressed: false,
    })
    expect(taskbarButton).toHaveFocus()

    fireEvent.click(taskbarButton)
    expect(screen.getByRole('dialog', { name: 'Sobre mí' })).toHaveFocus()
  })

  it('keeps Tab cycling inside the window', () => {
    renderSession({ initialApps: [{ id: 'about' }] })
    const dialog = screen.getByRole('dialog', { name: 'Sobre mí' })
    const elements = tabbableElements(dialog)
    const first = elements[0]
    const last = elements[elements.length - 1]
    expect(first).toBe(
      within(dialog).getByRole('button', { name: 'Minimizar' }),
    )

    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(first).toHaveFocus()

    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()
  })

  it('comes to the front and becomes active when clicked', () => {
    renderSession({ initialApps: [{ id: 'about' }, { id: 'projects' }] })
    const about = screen.getByRole('dialog', { name: 'Sobre mí' })
    const projects = screen.getByRole('dialog', { name: 'Proyectos' })
    expect(Number(about.style.zIndex)).toBeLessThan(
      Number(projects.style.zIndex),
    )

    fireEvent.pointerDown(about)

    expect(Number(about.style.zIndex)).toBeGreaterThan(
      Number(projects.style.zIndex),
    )
    expect(about).toHaveFocus()
  })

  it('drags by the title bar and stays inside the desktop', () => {
    renderSession({ initialApps: [{ id: 'about' }] })
    const desktop = screen.getByRole('main')
    const dialog = screen.getByRole('dialog', { name: 'Sobre mí' })
    // jsdom has no layout: give the desktop and the window a size.
    Object.defineProperties(desktop, {
      clientWidth: { value: 1000 },
      clientHeight: { value: 700 },
    })
    Object.defineProperties(dialog, {
      offsetWidth: { value: 400 },
      offsetHeight: { value: 300 },
    })
    const titleBar = within(dialog).getByRole('heading', {
      level: 2,
    }).parentElement!
    const left = Number.parseInt(dialog.style.left)
    const top = Number.parseInt(dialog.style.top)

    fireEvent.pointerDown(titleBar, {
      button: 0,
      pointerId: 1,
      clientX: 100,
      clientY: 100,
    })
    fireEvent.pointerMove(titleBar, {
      pointerId: 1,
      clientX: 150,
      clientY: 130,
    })
    expect(dialog.style.left).toBe(`${left + 50}px`)
    expect(dialog.style.top).toBe(`${top + 30}px`)

    fireEvent.pointerMove(titleBar, {
      pointerId: 1,
      clientX: 5000,
      clientY: 5000,
    })
    expect(dialog.style.left).toBe('600px')
    expect(dialog.style.top).toBe('400px')

    fireEvent.pointerUp(titleBar, { pointerId: 1 })
    fireEvent.pointerMove(titleBar, { pointerId: 1, clientX: 0, clientY: 0 })
    expect(dialog.style.left).toBe('600px')
  })

  it('does not drag from the title bar buttons', () => {
    renderSession({ initialApps: [{ id: 'about' }] })
    const dialog = screen.getByRole('dialog', { name: 'Sobre mí' })
    const before = dialog.style.left
    const close = within(dialog).getByRole('button', { name: 'Minimizar' })
    fireEvent.pointerDown(close, {
      button: 0,
      pointerId: 1,
      clientX: 0,
      clientY: 0,
    })
    fireEvent.pointerMove(close, { pointerId: 1, clientX: 80, clientY: 80 })
    expect(dialog.style.left).toBe(before)
  })
})
