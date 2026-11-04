// Loaded by vite.config.ts: imports carry extensions and JSON import attributes (see files.ts).
import en from '../i18n/en.json' with { type: 'json' }
import es from '../i18n/es.json' with { type: 'json' }
import { LANGS, LOCALES, type Lang } from '../i18n/locales.ts'
import type { Content, Name } from './schema.ts'

/** Comments in index.html that the build replaces (D24). */
export const HEAD_ANCHOR = '<!-- site-head -->'
export const NOSCRIPT_ANCHOR = '<!-- site-noscript -->'

const MESSAGES = { es, en }

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Text safe inside HTML elements and quoted attributes. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ENTITIES[char])
}

function localized(value: Name, lang: Lang): string {
  return escapeHtml(typeof value === 'string' ? value : value[lang])
}

/** `es-CL` → `es_CL`, as Open Graph writes locales. */
function ogLocale(lang: Lang): string {
  return LOCALES[lang].replace('-', '_')
}

/**
 * Title, description and Open Graph tags from `profile.json` (`site`), in
 * Spanish by default, with English as the alternate locale (D24).
 */
export function siteHead({ profile }: Content): string {
  const title = localized(profile.site.title, 'es')
  const description = localized(profile.site.description, 'es')
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:locale" content="${ogLocale('es')}" />`,
    `<meta property="og:locale:alternate" content="${ogLocale('en')}" />`,
  ].join('\n    ')
}

/** Summary and links of one language, for visitors and crawlers without JavaScript. */
function summary(content: Content, lang: Lang, base: string): string {
  const { profile, projects, contact } = content
  const t = MESSAGES[lang]
  const projectItems = projects.projects.map(
    (project) =>
      `<dt>${localized(project.name, lang)}</dt><dd>${localized(project.summary, lang)}</dd>`,
  )
  const links = [
    `<li><a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></li>`,
    ...contact.links.map(
      (link) =>
        `<li><a href="${escapeHtml(link.url)}" rel="noopener noreferrer">${localized(link.label, lang)}</a></li>`,
    ),
    `<li><a href="${escapeHtml(base + profile.cv[lang])}">${escapeHtml(t['actions.downloadCv'])}</a></li>`,
  ]
  return [
    `<section lang="${lang}">`,
    `<h1>${localized(profile.site.title, lang)}</h1>`,
    `<p>${localized(profile.site.description, lang)}</p>`,
    `<p>${escapeHtml(t['noscript.message'])}</p>`,
    `<p><strong>${escapeHtml(profile.name)}</strong><br />${localized(profile.role, lang)}<br />${localized(profile.location, lang)}</p>`,
    `<h2>${escapeHtml(t['apps.projects.title'])}</h2>`,
    `<dl>${projectItems.join('')}</dl>`,
    `<h2>${escapeHtml(t['apps.contact.title'])}</h2>`,
    `<ul>${links.join('')}</ul>`,
    `</section>`,
  ].join('')
}

/**
 * `<noscript>` with the essentials in both languages (spec §9): who, the
 * projects, how to get in touch and the CV. `base` is Vite's public base path.
 */
export function siteNoscript(content: Content, base: string): string {
  const sections = LANGS.map((lang) => summary(content, lang, base))
  return `<noscript><div class="noscript">${sections.join('')}</div></noscript>`
}

/** index.html with both anchors replaced; fails when an anchor is missing. */
export function writeSiteHtml(
  html: string,
  content: Content,
  base: string,
): string {
  for (const anchor of [HEAD_ANCHOR, NOSCRIPT_ANCHOR]) {
    if (!html.includes(anchor)) {
      throw new Error(`index.html is missing the ${anchor} anchor`)
    }
  }
  return html
    .replace(HEAD_ANCHOR, () => siteHead(content))
    .replace(NOSCRIPT_ANCHOR, () => siteNoscript(content, base))
}
