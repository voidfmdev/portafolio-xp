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

function category(dialog: HTMLElement, name: string) {
  return within(dialog).getByRole('region', { name })
}

describe('SkillsWindow', () => {
  it('lists the categories with their count and shows the first one', () => {
    renderSession({ initialApps: [{ id: 'skills' }] })
    const dialog = screen.getByRole('dialog', { name: 'Habilidades' })
    const pane = within(dialog).getByRole('navigation', {
      name: 'Panel de tareas',
    })
    expect(within(pane).getByText('2 categorías')).toBeVisible()

    const shown = category(dialog, 'Lenguajes de programación')
    expect(within(shown).getByText('[RELLENO] Lenguaje A')).toBeVisible()
    // The level is text, never a bar.
    expect(within(shown).getByText('[RELLENO] Nivel')).toBeVisible()
    expect(within(shown).queryByRole('progressbar')).toBeNull()
  })

  it('opens the category a deep link names', () => {
    renderSession({
      initialApps: [{ id: 'skills', target: 'habilidades-blandas' }],
    })
    const dialog = screen.getByRole('dialog', { name: 'Habilidades' })
    expect(
      within(category(dialog, 'Habilidades blandas')).getByText(
        '[RELLENO] Habilidad blanda',
      ),
    ).toBeVisible()
  })

  it('names the selected category in the hash', () => {
    renderSession({ initialApps: [{ id: 'skills' }] })
    const dialog = screen.getByRole('dialog', { name: 'Habilidades' })
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Habilidades blandas' }),
    )
    expect(window.location.hash).toBe('#/habilidades/habilidades-blandas')
    expect(dialog.querySelector('.status-bar-field')).toHaveTextContent(
      'Habilidades blandas',
    )
  })

  it('translates bilingual skill names', () => {
    renderSession({
      lang: 'en',
      initialApps: [{ id: 'skills', target: 'habilidades-blandas' }],
    })
    const dialog = screen.getByRole('dialog', { name: 'Skills' })
    expect(
      within(category(dialog, 'Soft skills')).getByText('[RELLENO] Soft skill'),
    ).toBeVisible()
  })
})
