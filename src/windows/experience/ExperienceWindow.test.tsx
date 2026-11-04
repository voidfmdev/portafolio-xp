import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderSession } from '../../os/test-utils'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  window.history.replaceState(null, '', '/')
})

function columns(table: HTMLElement) {
  return within(table)
    .getAllByRole('columnheader')
    .map((header) => header.textContent)
}

describe('ExperienceWindow', () => {
  it('shows work and education as two detail tables', () => {
    renderSession({ initialApps: [{ id: 'experience' }] })
    const dialog = screen.getByRole('dialog', { name: 'Experiencia' })

    const work = within(dialog).getByRole('table', {
      name: 'Experiencia laboral',
    })
    expect(columns(work)).toEqual(['Cargo', 'Empresa', 'Período', 'Ubicación'])

    const education = within(dialog).getByRole('table', { name: 'Educación' })
    expect(columns(education)).toEqual([
      'Formación',
      'Institución',
      'Período',
      'Ubicación',
    ])
    expect(within(education).getByText('[RELLENO] Título 1')).toBeVisible()
  })

  it('lists the most recent first, with "Presente" and the duration', () => {
    renderSession({ initialApps: [{ id: 'experience' }] })
    const work = screen.getByRole('table', { name: 'Experiencia laboral' })
    const [, first, second] = within(work).getAllByRole('row')

    // Both start in January 2000; the one with a day sorts after its month.
    expect(first).toHaveTextContent('[RELLENO] Cargo 2')
    expect(first).toHaveTextContent('4 meses')
    expect(second).toHaveTextContent('[RELLENO] Cargo 1')
    expect(second).toHaveTextContent('Presente')
  })

  it('counts the entries in the status bar', () => {
    renderSession({ initialApps: [{ id: 'experience' }] })
    const dialog = screen.getByRole('dialog', { name: 'Experiencia' })
    expect(dialog.querySelector('.status-bar-field')).toHaveTextContent(
      '3 objetos',
    )
  })

  it('jumps to a table from the task pane', () => {
    renderSession({ initialApps: [{ id: 'experience' }] })
    const dialog = screen.getByRole('dialog', { name: 'Experiencia' })
    const pane = within(dialog).getByRole('navigation', {
      name: 'Panel de tareas',
    })
    fireEvent.click(within(pane).getByRole('button', { name: 'Educación' }))
    expect(
      within(dialog).getByRole('heading', { level: 4, name: 'Educación' }),
    ).toHaveFocus()
  })

  it('follows the language', () => {
    renderSession({ lang: 'en', initialApps: [{ id: 'experience' }] })
    const work = screen.getByRole('table', { name: 'Work experience' })
    expect(columns(work)).toEqual(['Position', 'Company', 'Period', 'Location'])
    expect(work).toHaveTextContent('Present')
    expect(work).toHaveTextContent('[RELLENO] Remote')
  })
})
