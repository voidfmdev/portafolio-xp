import { act, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderSession } from '../test-utils'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  window.history.replaceState(null, '', '/')
  vi.useRealTimers()
})

function taskbar() {
  return screen.getByRole('region', { name: 'Barra de tareas' })
}

describe('Taskbar', () => {
  it('shows one button per open window, pressed for the active one', () => {
    renderSession({ initialApps: [{ id: 'about' }, { id: 'projects' }] })
    const windows = within(taskbar()).getByRole('list', {
      name: 'Ventanas abiertas',
    })
    expect(
      within(windows)
        .getAllByRole('button')
        .map((button) => [
          button.textContent,
          button.getAttribute('aria-pressed'),
        ]),
    ).toEqual([
      ['Sobre mí', 'false'],
      ['Proyectos', 'true'],
    ])
  })

  it('minimizes the active window, restores it, and brings an inactive one forward', () => {
    renderSession({ initialApps: [{ id: 'about' }, { id: 'projects' }] })
    const bar = taskbar()
    const projects = within(bar).getByRole('button', { name: 'Proyectos' })

    fireEvent.click(projects)
    expect(
      screen.queryByRole('dialog', { name: 'Proyectos' }),
    ).not.toBeInTheDocument()

    fireEvent.click(projects)
    expect(screen.getByRole('dialog', { name: 'Proyectos' })).toHaveFocus()

    fireEvent.click(within(bar).getByRole('button', { name: 'Sobre mí' }))
    expect(screen.getByRole('dialog', { name: 'Sobre mí' })).toHaveFocus()
    expect(
      within(bar).getByRole('button', { name: 'Sobre mí' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows a green Start button labelled for each language', () => {
    renderSession()
    expect(
      within(taskbar()).getByRole('button', { name: 'Inicio' }),
    ).toHaveAttribute('aria-haspopup', 'menu')
  })

  it('switches the language from the tray', () => {
    renderSession({ initialApps: [{ id: 'about' }] })
    const tray = within(taskbar()).getByRole('group', {
      name: 'Área de notificación',
    })
    fireEvent.click(
      within(tray).getByRole('button', {
        name: 'Idioma: Español. Cambiar a English',
      }),
    )

    expect(document.documentElement.lang).toBe('en')
    expect(screen.getByRole('dialog', { name: 'About me' })).toBeVisible()
    expect(
      screen.getByRole('button', {
        name: 'Language: English. Switch to Español',
      }),
    ).toHaveTextContent('EN')
  })

  it('shows and hides the assistant from the tray', () => {
    renderSession()
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar asistente' }))
    expect(
      screen.getByRole('button', { name: 'Mostrar asistente' }),
    ).toBeVisible()
  })

  it('shows the time per language and moves to the next minute', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
    vi.setSystemTime(new Date(2026, 10, 3, 14, 5, 50))
    renderSession()
    const clock = within(taskbar()).getByText('14:05')
    expect(clock).toHaveAttribute('title', 'martes, 3 de noviembre de 2026')

    act(() => vi.advanceTimersByTime(10_000))
    expect(within(taskbar()).getByText('14:06')).toBeVisible()
  })
})
