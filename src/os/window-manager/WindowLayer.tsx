import { appIcons } from '../../icons'
import { useI18n } from '../../i18n/useI18n'
import { APP_WINDOWS } from '../../windows/appWindows'
import { useWindowManager } from './useWindowManager'
import { Window } from './Window'

/** Every open window, drawn over the desktop, with its app's content. */
export function WindowLayer() {
  const { t } = useI18n()
  const { state } = useWindowManager()

  return state.windows.map((window) => {
    const Content = APP_WINDOWS[window.id]
    return (
      <Window
        key={window.id}
        window={window}
        title={t(`apps.${window.id}.title`)}
        icon={appIcons[window.id]}
      >
        <Content window={window} />
      </Window>
    )
  })
}
