import type { RefObject } from 'react'
import { useAssistant } from '../../assistant/useAssistant'
import { appIcons, icons } from '../../icons'
import { LANGS } from '../../i18n/locales'
import { translate } from '../../i18n/messages'
import { useI18n } from '../../i18n/useI18n'
import { useWindowManager } from '../window-manager/useWindowManager'
import { TASKBAR_BUTTON_ATTRIBUTE } from '../window-manager/WindowManagerContext'
import type { WindowState } from '../window-manager/windowReducer'
import { Clock } from './Clock'
import styles from './Taskbar.module.css'

interface TaskbarProps {
  startButtonRef: RefObject<HTMLButtonElement | null>
  startMenuId: string
  startMenuOpen: boolean
  onToggleStartMenu: () => void
}

/** Start button, one button per open window, and the tray (spec §4.3). */
export function Taskbar({
  startButtonRef,
  startMenuId,
  startMenuOpen,
  onToggleStartMenu,
}: TaskbarProps) {
  const { t, lang, setLang } = useI18n()
  const { state, focusApp, minimizeApp } = useWindowManager()
  const {
    visible: assistantVisible,
    toggle: toggleAssistant,
    trayButtonRef,
  } = useAssistant()
  const nextLang = LANGS.find((other) => other !== lang) ?? lang

  // Clicking the active window minimizes it; any other is restored and brought forward.
  function onWindowButton(window: WindowState) {
    const isActive = state.activeId === window.id && !window.minimized
    if (isActive) minimizeApp(window.id)
    else focusApp(window.id)
  }

  return (
    <section className={styles.taskbar} aria-label={t('taskbar.label')}>
      <button
        ref={startButtonRef}
        type="button"
        className={styles.start}
        aria-haspopup="menu"
        aria-expanded={startMenuOpen}
        aria-controls={startMenuOpen ? startMenuId : undefined}
        onClick={onToggleStartMenu}
      >
        <img className={styles.startLogo} src={icons.startLogo} alt="" />
        <span>{t('taskbar.start')}</span>
      </button>

      <ul className={styles.windows} aria-label={t('taskbar.windows')}>
        {state.windows.map((window) => (
          <li key={window.id} className={styles.windowItem}>
            <button
              type="button"
              {...{ [TASKBAR_BUTTON_ATTRIBUTE]: window.id }}
              className={styles.windowButton}
              aria-pressed={state.activeId === window.id && !window.minimized}
              onClick={() => onWindowButton(window)}
            >
              <img
                className={styles.windowIcon}
                src={appIcons[window.id]}
                alt=""
              />
              <span className={styles.windowTitle}>
                {t(`apps.${window.id}.title`)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.tray} role="group" aria-label={t('tray.label')}>
        <button
          type="button"
          className={styles.trayButton}
          aria-label={t('tray.language', {
            current: t('language.name'),
            next: translate(nextLang, 'language.name'),
          })}
          onClick={() => setLang(nextLang)}
        >
          {t('language.code')}
        </button>
        <button
          ref={trayButtonRef}
          type="button"
          className={styles.trayButton}
          aria-label={
            assistantVisible ? t('tray.assistantHide') : t('tray.assistantShow')
          }
          onClick={toggleAssistant}
        >
          <img className={styles.trayIcon} src={icons.assistant} alt="" />
        </button>
        <Clock />
      </div>
    </section>
  )
}
