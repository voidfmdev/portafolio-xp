import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderSession } from '../../os/test-utils'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  window.history.replaceState(null, '', '/')
})

describe('AboutWindow', () => {
  it('shows the page title and the profile card', () => {
    renderSession({ initialApps: [{ id: 'about' }] })
    const dialog = screen.getByRole('dialog', { name: 'Sobre mí' })
    const content = within(dialog).getByRole('region', {
      name: '[RELLENO] Ficha',
    })

    expect(
      within(content).getByRole('heading', {
        name: '[RELLENO] Título de la página',
      }),
    ).toBeVisible()
    expect(within(content).getByText('<nombre>')).toBeVisible()
    expect(within(content).getByText('[RELLENO] Línea de rol')).toBeVisible()
    expect(within(content).getByText('[RELLENO] Ciudad, país')).toBeVisible()
    expect(within(content).getByText('En línea')).toBeVisible()
  })

  it('uses the own avatar while the photo is a placeholder', () => {
    renderSession({ initialApps: [{ id: 'about' }] })
    const dialog = screen.getByRole('dialog', { name: 'Sobre mí' })
    expect(
      within(dialog).queryByRole('img', { name: '[RELLENO] Foto de perfil' }),
    ).toBeNull()
    expect(dialog.querySelector('img[src*="<foto>"]')).toBeNull()
  })

  it('names the profile in the address bar and the status bar', () => {
    renderSession({ initialApps: [{ id: 'about' }] })
    const dialog = screen.getByRole('dialog', { name: 'Sobre mí' })
    const address = within(dialog).getByRole('navigation', {
      name: 'Dirección',
    })
    expect(
      within(address)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Sobre mí', '[RELLENO] Ficha'])
    expect(dialog.querySelector('.status-bar-field')).toHaveTextContent(
      '<nombre>',
    )
  })

  it('jumps to a section from the task pane', () => {
    renderSession({ initialApps: [{ id: 'about' }] })
    const dialog = screen.getByRole('dialog', { name: 'Sobre mí' })
    const pane = within(dialog).getByRole('navigation', {
      name: 'Panel de tareas',
    })
    fireEvent.click(
      within(pane).getByRole('button', { name: '[RELLENO] Sección 2' }),
    )
    expect(
      within(dialog).getByRole('heading', {
        level: 4,
        name: '[RELLENO] Sección 2',
      }),
    ).toHaveFocus()
  })

  it('follows the language', () => {
    renderSession({ lang: 'en', initialApps: [{ id: 'about' }] })
    const dialog = screen.getByRole('dialog', { name: 'About me' })
    expect(
      within(dialog).getByRole('heading', { name: '[RELLENO] Section 1' }),
    ).toBeVisible()
    expect(within(dialog).getByText('Online')).toBeVisible()
  })
})
