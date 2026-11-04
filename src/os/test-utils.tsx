import { render } from '@testing-library/react'
import { PreferencesProvider } from '../app/PreferencesProvider'
import { AssistantProvider } from '../assistant/AssistantProvider'
import { I18nProvider } from '../i18n/I18nProvider'
import { LANG_STORAGE_KEY } from '../i18n/initialLang'
import type { Lang } from '../i18n/locales'
import { storage } from '../lib/storage'
import { DesktopSession } from './DesktopSession'
import type { Route } from './routes'
import { WindowManagerProvider } from './window-manager/WindowManagerProvider'

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
