import { describe, expect, it } from 'vitest'
import { content } from '.'
import type { Content } from './schema'
import {
  escapeHtml,
  HEAD_ANCHOR,
  NOSCRIPT_ANCHOR,
  siteHead,
  siteNoscript,
  writeSiteHtml,
} from './siteHtml'

const both = (es: string, en: string) => ({ es, en })

// Real content with values that need escaping, so the tests do not depend on the filler text.
const sample: Content = {
  ...content,
  profile: {
    ...content.profile,
    name: '<nombre>',
    site: {
      title: both('Portafolio de <nombre>', '<nombre> "portfolio"'),
      description: both('Proyectos & más', 'Projects & more'),
    },
  },
  contact: {
    email: '<correo>',
    links: [
      {
        id: 'github',
        label: 'GitHub',
        url: 'https://github.com/a?b=1&c=2',
        icon: 'github',
      },
    ],
  },
  projects: {
    projects: [
      {
        ...content.projects.projects[0],
        name: both('Uno', 'One'),
        summary: both('Resumen', 'Summary'),
      },
    ],
  },
}

const PAGE = `<html><head>${HEAD_ANCHOR}</head><body>${NOSCRIPT_ANCHOR}<div id="root"></div></body></html>`

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('escapeHtml', () => {
  it('escapes the characters that would break markup or attributes', () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;',
    )
  })
})

describe('siteHead (D24)', () => {
  const head = parse(`<head>${siteHead(sample)}</head>`)
  const meta = (selector: string) =>
    head.querySelector(selector)?.getAttribute('content')

  it('writes the Spanish title and description from profile.json', () => {
    expect(head.title).toBe('Portafolio de <nombre>')
    expect(meta('meta[name="description"]')).toBe('Proyectos & más')
  })

  it('writes the Open Graph tags, Spanish first and English as the alternate', () => {
    expect(meta('meta[property="og:type"]')).toBe('website')
    expect(meta('meta[property="og:title"]')).toBe('Portafolio de <nombre>')
    expect(meta('meta[property="og:description"]')).toBe('Proyectos & más')
    expect(meta('meta[property="og:locale"]')).toBe('es_CL')
    expect(meta('meta[property="og:locale:alternate"]')).toBe('en_US')
  })
})

describe('siteNoscript', () => {
  // DOMParser runs without scripting, so the <noscript> content is parsed as
  // markup. Its nodes belong to another document: compare their text directly.
  const page = parse(`<body>${siteNoscript(sample, '/portafolio-xp/')}</body>`)
  const section = (lang: string) =>
    page.querySelector<HTMLElement>(`noscript section[lang="${lang}"]`)!

  it('has a summary in each language', () => {
    expect(section('es').querySelector('h1')?.textContent).toBe(
      'Portafolio de <nombre>',
    )
    expect(section('en').querySelector('h1')?.textContent).toBe(
      '<nombre> "portfolio"',
    )
    expect(section('es').textContent).toContain('necesita JavaScript')
    expect(section('en').textContent).toContain('needs JavaScript')
  })

  it('lists the projects with their summary', () => {
    expect(section('es').querySelector('dt')?.textContent).toContain('Uno')
    expect(section('es').querySelector('dd')?.textContent).toContain('Resumen')
    expect(section('en').querySelector('dt')?.textContent).toContain('One')
  })

  it('links the email, the contact links and the CV of each language under the base path', () => {
    const hrefs = (lang: string) =>
      Array.from(section(lang).querySelectorAll('a'), (link) =>
        link.getAttribute('href'),
      )
    expect(hrefs('es')).toEqual([
      'mailto:<correo>',
      'https://github.com/a?b=1&c=2',
      `/portafolio-xp/${content.profile.cv.es}`,
    ])
    expect(hrefs('en').at(-1)).toBe(`/portafolio-xp/${content.profile.cv.en}`)
    expect(section('es').textContent).toContain('Descargar CV')
    expect(section('en').textContent).toContain('Download CV')
  })
})

describe('writeSiteHtml', () => {
  it('replaces both anchors', () => {
    const html = writeSiteHtml(PAGE, sample, '/')
    expect(html).not.toContain(HEAD_ANCHOR)
    expect(html).not.toContain(NOSCRIPT_ANCHOR)
    expect(parse(html).title).toBe('Portafolio de <nombre>')
    expect(html).toContain('<noscript>')
  })

  it('fails when index.html lost an anchor', () => {
    expect(() =>
      writeSiteHtml(PAGE.replace(NOSCRIPT_ANCHOR, ''), sample, '/'),
    ).toThrow('site-noscript')
  })

  it('works with the real content', () => {
    const html = writeSiteHtml(PAGE, content, '/')
    expect(parse(html).title).toBe(content.profile.site.title.es)
  })
})
