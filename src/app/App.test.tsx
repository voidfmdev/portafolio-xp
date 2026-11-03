import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LANG_STORAGE_KEY } from '../i18n/initialLang'
import { storage } from '../lib/storage'
import { App } from './App'

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  window.history.replaceState(null, '', '/')
  vi.restoreAllMocks()
})

function accounts() {
  return screen.getByRole('list', { name: /Cuentas de usuario|User accounts/ })
}

describe('App', () => {
  it('starts on the welcome screen with one account per language', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CL'])
    render(<App />)
    expect(
      screen.getByRole('heading', {
        name: 'Para comenzar, haz clic en tu nombre de usuario',
      }),
    ).toBeVisible()
    const buttons = within(accounts()).getAllByRole('button')
    expect(buttons.map((button) => button.textContent)).toEqual([
      'Invitado · Español',
      'Guest · English',
    ])
    // The account of the initial language is focused: one Enter is enough.
    expect(buttons[0]).toHaveFocus()
  })

  it('highlights the saved language', () => {
    storage.set(LANG_STORAGE_KEY, 'en')
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'To begin, click your user name' }),
    ).toBeVisible()
    expect(
      within(accounts()).getByRole('button', { name: 'Guest · English' }),
    ).toHaveFocus()
  })

  it('enters the desktop in the language of the chosen account and saves it', () => {
    render(<App />)
    fireEvent.click(
      within(accounts()).getByRole('button', { name: 'Guest · English' }),
    )

    expect(screen.getByRole('main', { name: 'Desktop' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'start' })).toBeVisible()
    expect(document.documentElement.lang).toBe('en')
    expect(storage.get(LANG_STORAGE_KEY)).toBe('en')
  })

  it('opens the window of a deep link after the welcome screen', () => {
    window.history.replaceState(null, '', '/#/contacto')
    render(<App />)
    fireEvent.click(
      within(accounts()).getByRole('button', { name: 'Invitado · Español' }),
    )
    expect(screen.getByRole('dialog', { name: 'Contacto' })).toHaveFocus()
  })

  it('skips the welcome screen for a deep link when a language was saved', () => {
    storage.set(LANG_STORAGE_KEY, 'es')
    window.history.replaceState(null, '', '/#/proyectos')
    render(<App />)
    expect(
      screen.queryByRole('list', { name: 'Cuentas de usuario' }),
    ).toBeNull()
    expect(screen.getByRole('dialog', { name: 'Proyectos' })).toHaveFocus()
  })

  it('shows the welcome screen for a saved language without a deep link', () => {
    storage.set(LANG_STORAGE_KEY, 'es')
    render(<App />)
    expect(accounts()).toBeVisible()
  })

  it('logs off back to the welcome screen, closing the windows', () => {
    storage.set(LANG_STORAGE_KEY, 'es')
    window.history.replaceState(null, '', '/#/proyectos')
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Inicio' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }))

    expect(accounts()).toBeVisible()
    expect(window.location.hash).toBe('')

    fireEvent.click(
      within(accounts()).getByRole('button', { name: 'Invitado · Español' }),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
