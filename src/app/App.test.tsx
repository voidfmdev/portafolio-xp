import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { LANG_STORAGE_KEY } from '../i18n/initialLang'
import { storage } from '../lib/storage'
import { App } from './App'

beforeEach(() => {
  localStorage.clear()
  storage.set(LANG_STORAGE_KEY, 'es')
})

describe('App', () => {
  it('shows the interface in the saved language', () => {
    render(<App />)
    expect(
      screen.getByRole('region', { name: 'Panel de control' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Conóceme')).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: 'Invitado · Español' }),
    ).toBeChecked()
  })

  it('switches the whole interface when another language is picked', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('radio', { name: 'Guest · English' }))

    expect(
      screen.getByRole('region', { name: 'Control Panel' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Get to know me')).toBeInTheDocument()
    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
    expect(storage.get(LANG_STORAGE_KEY)).toBe('en')
  })
})
