import { describe, expect, it } from 'vitest'
import { resolveInitialLang } from './initialLang'

const none = { search: '', stored: null, browserLanguages: [] }

describe('resolveInitialLang', () => {
  it('prefers ?lang= over the saved choice and the browser', () => {
    expect(
      resolveInitialLang({
        search: '?lang=en',
        stored: 'es',
        browserLanguages: ['es-CL'],
      }),
    ).toBe('en')
  })

  it('accepts ?lang= in any case', () => {
    expect(resolveInitialLang({ ...none, search: '?lang=EN' })).toBe('en')
  })

  it('ignores an unsupported ?lang= and uses the saved choice', () => {
    expect(
      resolveInitialLang({
        search: '?lang=fr',
        stored: 'en',
        browserLanguages: ['es'],
      }),
    ).toBe('en')
  })

  it('uses the saved choice over the browser', () => {
    expect(
      resolveInitialLang({
        ...none,
        stored: 'en',
        browserLanguages: ['es-CL'],
      }),
    ).toBe('en')
  })

  it('ignores a saved value that is not a language', () => {
    expect(
      resolveInitialLang({
        ...none,
        stored: 'xx',
        browserLanguages: ['en-GB'],
      }),
    ).toBe('en')
  })

  it('takes the first supported browser language, by its primary subtag', () => {
    expect(
      resolveInitialLang({
        ...none,
        browserLanguages: ['fr-FR', 'en-US', 'es'],
      }),
    ).toBe('en')
    expect(resolveInitialLang({ ...none, browserLanguages: ['ES-cl'] })).toBe(
      'es',
    )
  })

  it('falls back to Spanish', () => {
    expect(resolveInitialLang(none)).toBe('es')
    expect(
      resolveInitialLang({ ...none, browserLanguages: ['de', 'pt-BR'] }),
    ).toBe('es')
  })
})
