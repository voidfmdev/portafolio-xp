import { describe, expect, it } from 'vitest'
import tokens from '../styles/tokens.css?raw'
import { MOBILE_QUERY } from './useIsMobile'

// Every stylesheet of the app, as written (CSS Modules included).
const stylesheets = import.meta.glob<string>('../**/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
})

describe('MOBILE_QUERY', () => {
  it('is the --breakpoint-mobile token as a media query', () => {
    const breakpoint = /--breakpoint-mobile:\s*([^;]+);/.exec(tokens)?.[1]
    expect(breakpoint).toBeDefined()
    expect(MOBILE_QUERY).toBe(`(width < ${breakpoint})`)
  })

  it('is the only width query in the stylesheets, written the same way', () => {
    const widthQueries = Object.entries(stylesheets).flatMap(([file, css]) =>
      Array.from(
        css.matchAll(/@media\s*([^{]*width[^{]*?)\s*\{/g),
        (match) => ({
          file,
          query: match[1],
        }),
      ),
    )
    expect(widthQueries.length).toBeGreaterThan(0)
    for (const { file, query } of widthQueries) {
      expect({ file, query }).toEqual({ file, query: MOBILE_QUERY })
    }
  })
})
