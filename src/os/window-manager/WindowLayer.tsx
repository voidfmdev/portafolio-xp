import { appIcons } from '../../icons'
import { useI18n } from '../../i18n/useI18n'
import { useWindowManager } from './useWindowManager'
import { Window } from './Window'

/** Every open window, drawn over the desktop. Their content arrives with each app. */
export function WindowLayer() {
  const { t } = useI18n()
  const { state } = useWindowManager()

  return state.windows.map((window) => (
    <Window
      key={window.id}
      window={window}
      title={t(`apps.${window.id}.title`)}
      icon={appIcons[window.id]}
    />
  ))
}
