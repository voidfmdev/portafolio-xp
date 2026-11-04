import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FIRST_VISIT_KEY } from '../assistant/engine'
import { content } from '../content'
import { storage } from '../lib/storage'
import { renderSession, stubMobile } from './test-utils'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

function dialog(name: string) {
  return screen.getByRole('dialog', { name })
}

function taskbarButton(name: string) {
  const windows = screen.getByRole('list', { name: 'Ventanas abiertas' })
  return within(windows).getByRole('button', { name })
}

describe('Mobile mode (spec §4.7)', () => {
  it('opens an icon with a single click or tap', () => {
    stubMobile()
    renderSession()
    fireEvent.click(screen.getByRole('button', { name: 'Habilidades' }))
    expect(dialog('Habilidades')).toBeVisible()
  })

  it('shows windows maximized, without the size button', () => {
    stubMobile()
    renderSession({ initialApps: [{ id: 'about' }] })
    const about = dialog('Sobre mí')
    expect(about.style.left).toBe('')
    expect(
      within(about).getByRole('button', { name: 'Minimizar' }),
    ).toBeVisible()
    expect(within(about).getByRole('button', { name: 'Cerrar' })).toBeVisible()
    expect(
      within(about).queryByRole('button', { name: /Maximizar|Restaurar/ }),
    ).toBeNull()
  })

  it('shows one window at a time and switches from the taskbar', () => {
    stubMobile()
    renderSession({ initialApps: [{ id: 'about' }, { id: 'projects' }] })
    expect(dialog('Proyectos')).toBeVisible()
    expect(screen.queryByRole('dialog', { name: 'Sobre mí' })).toBeNull()

    fireEvent.click(taskbarButton('Sobre mí'))
    expect(dialog('Sobre mí')).toBeVisible()
    expect(dialog('Sobre mí')).toHaveFocus()
    expect(screen.queryByRole('dialog', { name: 'Proyectos' })).toBeNull()
  })

  it('brings up the next window with the focus when one closes', () => {
    stubMobile()
    renderSession({ initialApps: [{ id: 'about' }, { id: 'projects' }] })
    fireEvent.click(
      within(dialog('Proyectos')).getByRole('button', { name: 'Cerrar' }),
    )
    expect(dialog('Sobre mí')).toBeVisible()
    expect(dialog('Sobre mí')).toHaveFocus()
  })

  it('gives the focus back to the icon when the last window closes', () => {
    stubMobile()
    renderSession()
    const icon = screen.getByRole('button', { name: 'Contacto' })
    fireEvent.click(icon)
    fireEvent.keyDown(dialog('Contacto'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(icon).toHaveFocus()
  })

  it('keeps the desktop layout of each window for when the screen widens', () => {
    const viewport = stubMobile()
    renderSession({ initialApps: [{ id: 'about' }, { id: 'projects' }] })

    viewport.setMobile(false)
    expect(dialog('Sobre mí')).toBeVisible()
    expect(dialog('Proyectos')).toBeVisible()
    expect(dialog('Proyectos').style.left).not.toBe('')
    expect(
      within(dialog('Proyectos')).getByRole('button', { name: 'Maximizar' }),
    ).toBeVisible()
  })

  it('does not drag, and the assistant comments a finger trying to', () => {
    stubMobile()
    storage.set(FIRST_VISIT_KEY, 'true')
    renderSession({ initialApps: [{ id: 'about' }] })
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar mensaje' }))
    const about = dialog('Sobre mí')
    const titleBar = within(about).getByRole('heading', {
      level: 2,
    }).parentElement!
    const touch = { pointerId: 1, pointerType: 'touch', button: 0 }

    fireEvent.pointerDown(titleBar, { ...touch, clientX: 100, clientY: 10 })
    fireEvent.pointerMove(titleBar, { ...touch, clientX: 100, clientY: 80 })

    expect(about.style.top).toBe('')
    expect(screen.getByRole('status')).toHaveTextContent(
      content.assistant.mobileDragAttempt.es,
    )
  })

  it('folds the Explorer task pane into a drop-down named after what is on screen', () => {
    stubMobile()
    renderSession({ initialApps: [{ id: 'projects' }] })
    const projects = dialog('Proyectos')
    const toggle = within(projects).getByRole('button', {
      name: '[RELLENO] Proyecto 1 (panel de tareas)',
    })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(
      within(projects).queryByRole('navigation', { name: 'Panel de tareas' }),
    ).toBeNull()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const pane = within(projects).getByRole('navigation', {
      name: 'Panel de tareas',
    })
    const second = within(pane).getAllByRole('button')[1]
    second.focus()
    fireEvent.click(second)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
    expect(toggle).toHaveAccessibleName(
      `${second.textContent} (panel de tareas)`,
    )
  })

  it('lets a section heading keep the focus when the drop-down folds', () => {
    stubMobile()
    renderSession({ initialApps: [{ id: 'about' }] })
    const about = dialog('Sobre mí')
    fireEvent.click(
      within(about).getByRole('button', { name: /\(panel de tareas\)$/ }),
    )
    fireEvent.click(
      within(about).getByRole('button', { name: '[RELLENO] Sección 2' }),
    )
    expect(
      within(about).getByRole('heading', {
        level: 4,
        name: '[RELLENO] Sección 2',
      }),
    ).toHaveFocus()
  })

  it('shows Experience as cards instead of tables', () => {
    stubMobile()
    renderSession({ initialApps: [{ id: 'experience' }] })
    const experience = dialog('Experiencia')
    expect(within(experience).queryByRole('table')).toBeNull()

    const work = within(experience).getByRole('list', {
      name: 'Experiencia laboral',
    })
    const cards = within(work).getAllByRole('listitem')
    expect(cards.length).toBeGreaterThan(0)
    expect(within(cards[0]).getByRole('heading', { level: 5 })).toBeVisible()
    expect(
      within(cards[0])
        .getAllByRole('term')
        .map((term) => term.textContent),
    ).toEqual(['Empresa', 'Período', 'Ubicación'])
    expect(
      within(experience).getByRole('list', { name: 'Educación' }),
    ).toBeVisible()
  })
})
