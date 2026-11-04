import { act, render } from '@testing-library/react'
import { vi } from 'vitest'
import { PreferencesProvider } from '../app/PreferencesProvider'
import { AssistantProvider } from '../assistant/AssistantProvider'
import { I18nProvider } from '../i18n/I18nProvider'
import { LANG_STORAGE_KEY } from '../i18n/initialLang'
import type { Lang } from '../i18n/locales'
import { storage } from '../lib/storage'
import { DesktopSession } from './DesktopSession'
import type { Route } from './routes'
import { MOBILE_QUERY } from './useIsMobile'
import { WindowManagerProvider } from './window-manager/WindowManagerProvider'

/**
 * jsdom has no `matchMedia`: this one answers the mobile query with `mobile`
 * and any other query with false. Undo it with `vi.unstubAllGlobals()`.
 * `setMobile` switches the mode, as rotating a phone or resizing would.
 */
export function stubMobile(mobile = true) {
  let current = mobile
  const listeners = new Set<() => void>()
  vi.stubGlobal('matchMedia', (query: string) => ({
    media: query,
    get matches() {
      return query === MOBILE_QUERY && current
    },
    addEventListener: (_type: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) =>
      listeners.delete(listener),
  }))
  return {
    setMobile(next: boolean) {
      current = next
      act(() => listeners.forEach((listener) => listener()))
    },
  }
}

interface SessionOptions {
  lang?: Lang
  initialApps?: readonly Route[]
  onLogOff?: () => void
}

/** Renders a signed-in desktop session, in Spanish unless told otherwise. */
export function renderSession({
  lang = 'es',
  initialApps = [],
  onLogOff = () => {},
}: SessionOptions = {}) {
  storage.set(LANG_STORAGE_KEY, lang)
  return render(
    <I18nProvider>
      <PreferencesProvider>
        <WindowManagerProvider initialApps={initialApps}>
          <AssistantProvider>
            <DesktopSession onLogOff={onLogOff} />
          </AssistantProvider>
        </WindowManagerProvider>
      </PreferencesProvider>
    </I18nProvider>,
  )
}
