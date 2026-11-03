import type { AppId } from './appIds'

/** Deep link of each app (spec §4.6). The same URL serves both languages. */
const ROUTES: Partial<Record<AppId, string>> = {
  about: 'sobre-mi',
  projects: 'proyectos',
  skills: 'habilidades',
  experience: 'experiencia',
  contact: 'contacto',
  messenger: 'messenger',
}

/** Apps whose route can name an item: `#/proyectos/<slug>`, `#/habilidades/<categoria>`. */
const WITH_TARGET: readonly AppId[] = ['projects', 'skills']

const HASH = /^#\/([a-z0-9-]+)(?:\/([a-z0-9]+(?:-[a-z0-9]+)*))?\/?$/

export interface Route {
  id: AppId
  target?: string
}

export function hasRoute(id: AppId): boolean {
  return ROUTES[id] !== undefined
}

/** The window a hash names, or null for an empty or unknown hash. */
export function parseHash(hash: string): Route | null {
  let decoded: string
  try {
    decoded = decodeURIComponent(hash).toLowerCase()
  } catch {
    return null
  }
  const match = HASH.exec(decoded)
  if (!match) return null
  const [, path, target] = match
  const id = (Object.keys(ROUTES) as AppId[]).find(
    (app) => ROUTES[app] === path,
  )
  if (!id) return null
  if (target === undefined) return { id }
  return WITH_TARGET.includes(id) ? { id, target } : null
}

/** Hash of a window, e.g. `#/proyectos/<slug>`; empty for apps without a route. */
export function formatHash({ id, target }: Route): string {
  const path = ROUTES[id]
  if (path === undefined) return ''
  return target !== undefined && WITH_TARGET.includes(id)
    ? `#/${path}/${target}`
    : `#/${path}`
}

/** Replaces the hash without adding a history entry (D29). An empty hash drops the `#`. */
export function replaceHash(hash: string): void {
  if (window.location.hash === hash) return
  const { pathname, search } = window.location
  window.history.replaceState(
    window.history.state,
    '',
    pathname + search + hash,
  )
}
