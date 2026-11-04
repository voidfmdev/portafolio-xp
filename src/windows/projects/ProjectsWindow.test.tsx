import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderSession } from '../../os/test-utils'

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  window.history.replaceState(null, '', '/')
})

function projectsWindow(name = 'Proyectos') {
  return screen.getByRole('dialog', { name })
}

function title(dialog: HTMLElement) {
  const project = within(dialog).getByRole('article')
  return within(project).getByRole('heading', { level: 3 }).textContent
}

function statusText(dialog: HTMLElement) {
  return dialog.querySelector('.status-bar-field')?.textContent
}

describe('ProjectsWindow', () => {
  it('lists the projects with their count and shows the first one', () => {
    renderSession({ initialApps: [{ id: 'projects' }] })
    const dialog = projectsWindow()
    const pane = within(dialog).getByRole('navigation', {
      name: 'Panel de tareas',
    })

    expect(within(pane).getByText('2 proyectos')).toBeVisible()
    expect(
      within(pane).getByRole('button', { name: '[RELLENO] Proyecto 1' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(title(dialog)).toBe('[RELLENO] Proyecto 1')
    expect(statusText(dialog)).toBe('[RELLENO] Proyecto 1')
    // The year is a plain string: no thousands separator.
    expect(within(dialog).getByText('2000 · [RELLENO] Rol')).toBeVisible()
  })

  it('shows the technologies and only the links the project has', () => {
    renderSession({ initialApps: [{ id: 'projects' }] })
    const dialog = projectsWindow()
    expect(within(dialog).getByText('[RELLENO] Tech A')).toBeVisible()

    const github = within(dialog).getByRole('link', { name: 'GitHub' })
    expect(github).toHaveAttribute(
      'href',
      'https://github.com/<usuario-github>',
    )
    expect(github).toHaveAttribute('target', '_blank')
    expect(github).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(dialog).queryByRole('link', { name: 'Demo' })).toBeNull()
    expect(within(dialog).getByText('Sin capturas')).toBeVisible()
  })

  it('names the selected project in the hash, the address bar and the status bar', () => {
    renderSession({ initialApps: [{ id: 'projects' }] })
    const dialog = projectsWindow()
    fireEvent.click(
      within(dialog).getByRole('button', { name: '[RELLENO] Proyecto 2' }),
    )

    expect(window.location.hash).toBe('#/proyectos/proyecto-2')
    expect(title(dialog)).toBe('[RELLENO] Proyecto 2')
    expect(statusText(dialog)).toBe('[RELLENO] Proyecto 2')
    const address = within(dialog).getByRole('navigation', {
      name: 'Dirección',
    })
    expect(within(address).getByText('[RELLENO] Proyecto 2')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('hides screenshots and links of an employer or client project', () => {
    renderSession({ initialApps: [{ id: 'projects', target: 'proyecto-2' }] })
    const dialog = projectsWindow()
    expect(
      within(dialog).getByText(
        'Proyecto de empleador o cliente: sin capturas por confidencialidad',
      ),
    ).toBeVisible()
    expect(within(dialog).queryByRole('link')).toBeNull()
  })

  it('goes back and forward through the projects it showed', () => {
    renderSession({ initialApps: [{ id: 'projects' }] })
    const dialog = projectsWindow()
    const back = within(dialog).getByRole('button', { name: 'Atrás' })
    const forward = within(dialog).getByRole('button', { name: 'Adelante' })
    expect(back).toBeDisabled()
    expect(forward).toBeDisabled()

    fireEvent.click(
      within(dialog).getByRole('button', { name: '[RELLENO] Proyecto 2' }),
    )
    expect(back).toBeEnabled()

    fireEvent.click(back)
    expect(title(dialog)).toBe('[RELLENO] Proyecto 1')
    expect(window.location.hash).toBe('#/proyectos/proyecto-1')
    expect(back).toBeDisabled()

    fireEvent.click(forward)
    expect(title(dialog)).toBe('[RELLENO] Proyecto 2')
    expect(forward).toBeDisabled()
  })

  it('shows the first project for an unknown slug and fixes the hash', () => {
    window.history.replaceState(null, '', '/#/proyectos/no-existe')
    renderSession({ initialApps: [{ id: 'projects', target: 'no-existe' }] })
    expect(title(projectsWindow())).toBe('[RELLENO] Proyecto 1')
    expect(window.location.hash).toBe('#/proyectos')
  })

  it('follows the language, bilingual names included', () => {
    renderSession({ lang: 'en', initialApps: [{ id: 'projects' }] })
    const dialog = projectsWindow('Projects')
    expect(within(dialog).getByText('2 projects')).toBeVisible()
    expect(
      within(dialog).getByRole('button', { name: '[RELLENO] Project 2' }),
    ).toBeVisible()
    expect(within(dialog).getByText('Technologies')).toBeVisible()
  })
})
