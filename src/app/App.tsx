import { useState } from 'react'
import { I18nProvider } from '../i18n/I18nProvider'
import { LANG_STORAGE_KEY } from '../i18n/initialLang'
import { isLang } from '../i18n/locales'
import { storage } from '../lib/storage'
import { DesktopSession } from '../os/DesktopSession'
import { parseHash, replaceHash, type Route } from '../os/routes'
import { Welcome } from '../os/welcome/Welcome'
import { WindowManagerProvider } from '../os/window-manager/WindowManagerProvider'
import { PreferencesProvider } from './PreferencesProvider'

type Screen =
  { name: 'welcome' } | { name: 'desktop'; initialApps: readonly Route[] }

function desktopFromHash(): Screen {
  const route = parseHash(window.location.hash)
  return { name: 'desktop', initialApps: route ? [route] : [] }
}

/** Spec §4.6: a deep link skips the welcome screen when a language was already chosen. */
function initialScreen(): Screen {
  const returning = isLang(storage.get(LANG_STORAGE_KEY))
  return returning && parseHash(window.location.hash)
    ? desktopFromHash()
    : { name: 'welcome' }
}

export function App() {
  const [screen, setScreen] = useState(initialScreen)

  function logOff() {
    replaceHash('')
    setScreen({ name: 'welcome' })
  }

  return (
    <I18nProvider>
      <PreferencesProvider>
        {screen.name === 'welcome' ? (
          <Welcome onEnter={() => setScreen(desktopFromHash())} />
        ) : (
          <WindowManagerProvider initialApps={screen.initialApps}>
            <DesktopSession onLogOff={logOff} />
          </WindowManagerProvider>
        )}
      </PreferencesProvider>
    </I18nProvider>
  )
}
