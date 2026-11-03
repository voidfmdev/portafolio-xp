import { describe, expect, it } from 'vitest'
import en from './en.json'
import es from './es.json'
import { placeholdersOf } from './messages'

// Typed as plain records so the test also catches keys that exist only in en.json.
const catalogs: Record<string, Record<string, string>> = { es, en }
const keys = (lang: string) => Object.keys(catalogs[lang]).sort()

describe('interface strings parity', () => {
  it('defines the same keys in es.json and en.json', () => {
    expect(keys('en')).toEqual(keys('es'))
  })

  it.each(Object.keys(catalogs))('has no empty strings in %s.json', (lang) => {
    const empty = keys(lang).filter((key) => catalogs[lang][key].trim() === '')
    expect(empty).toEqual([])
  })

  it('uses the same {variables} in both languages', () => {
    const mismatched = keys('es').filter((key) => {
      const variables = (lang: string) =>
        placeholdersOf(catalogs[lang][key] ?? '')
          .sort()
          .join()
      return variables('es') !== variables('en')
    })
    expect(mismatched).toEqual([])
  })

  it.each(Object.keys(catalogs))(
    'gives every plural form in %s.json an .other fallback',
    (lang) => {
      const pluralBases = keys(lang)
        .filter((key) => /\.(zero|one|two|few|many)$/.test(key))
        .map((key) => key.replace(/\.\w+$/, ''))
      const missing = pluralBases.filter(
        (base) => !(`${base}.other` in catalogs[lang]),
      )
      expect(missing).toEqual([])
    },
  )
})
