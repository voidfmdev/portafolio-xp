import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storage } from '../lib/storage'
import { I18nProvider } from './I18nProvider'
import { LANG_STORAGE_KEY } from './initialLang'
import { useI18n } from './useI18n'

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider>{children}</I18nProvider>
)

beforeEach(() => {
  localStorage.clear()
  storage.set(LANG_STORAGE_KEY, 'es')
})

afterEach(() => {
  window.history.replaceState(null, '', '/')
  vi.restoreAllMocks()
})

describe('useI18n', () => {
  it('starts in the saved language and sets <html lang>', () => {
    const { result } = renderHook(() => useI18n(), { wrapper })
    expect(result.current.lang).toBe('es')
    expect(result.current.t('startMenu.help')).toBe('Ayuda')
    expect(document.documentElement.lang).toBe('es')
  })

  it('lets ?lang= win over the saved language', () => {
    window.history.replaceState(null, '', '/?lang=en#/proyectos')
    const { result } = renderHook(() => useI18n(), { wrapper })
    expect(result.current.lang).toBe('en')
    // Only an explicit choice is saved.
    expect(storage.get(LANG_STORAGE_KEY)).toBe('es')
  })

  it('switches every string at once, updates <html lang> and saves the choice', () => {
    function Labels() {
      const { t, tn, setLang } = useI18n()
      return (
        <>
          <p>{t('apps.about.title')}</p>
          <p>{tn('explorer.projectCount', 2)}</p>
          <button onClick={() => setLang('en')}>{t('language.name')}</button>
        </>
      )
    }
    render(<Labels />, { wrapper })
    expect(screen.getByText('Sobre mí')).toBeInTheDocument()
    expect(screen.getByText('2 proyectos')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Español' }))

    expect(screen.getByText('About me')).toBeInTheDocument()
    expect(screen.getByText('2 projects')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
    expect(storage.get(LANG_STORAGE_KEY)).toBe('en')
  })

  it('localizes content and dates in the current language', () => {
    const { result } = renderHook(() => useI18n(), { wrapper })
    const text = { es: 'Habilidades blandas', en: 'Soft skills' }
    expect(result.current.localize(text)).toBe('Habilidades blandas')
    expect(
      result.current.formatPeriod('2023-01', null, new Date(2023, 3, 10)),
    ).toEqual({
      range: expect.stringMatching(/^ene\.? 2023 – Presente$/),
      duration: '4 meses',
    })

    act(() => result.current.setLang('en'))

    expect(result.current.localize(text)).toBe('Soft skills')
    expect(result.current.formatTime(new Date(2026, 10, 3, 14, 5))).toMatch(
      /^2:05\sPM$/,
    )
  })

  it('fails loudly outside the provider', () => {
    // React reports the thrown error on the console as well; keep the output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useI18n())).toThrow(/I18nProvider/)
  })
})
