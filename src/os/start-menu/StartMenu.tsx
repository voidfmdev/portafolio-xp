import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react'
import { appIcons, icons } from '../../icons'
import { useI18n } from '../../i18n/useI18n'
import { START_MENU_APPS, type AppId } from '../appIds'
import { cvUrl } from '../cv'
import { useWindowManager } from '../window-manager/useWindowManager'
import styles from './StartMenu.module.css'

export interface CloseOptions {
  /** Back to the Start button (Esc, Help); not when the focus already moved on. */
  restoreFocus: boolean
}

interface StartMenuProps {
  id: string
  startButtonRef: RefObject<HTMLButtonElement | null>
  onClose: (options: CloseOptions) => void
  onHelp: () => void
  onLogOff: () => void
}

function menuItems(menu: HTMLElement | null): HTMLElement[] {
  return menu
    ? Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'))
    : []
}

/**
 * Two-column Start menu (spec §4.4): sections on the left, places on the right,
 * Log off at the bottom. Arrow keys move between items; Esc or a click elsewhere closes it.
 */
export function StartMenu({
  id,
  startButtonRef,
  onClose,
  onHelp,
  onLogOff,
}: StartMenuProps) {
  const { t, lang } = useI18n()
  const { openApp } = useWindowManager()
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    menuItems(menuRef.current)[0]?.focus()
  }, [])

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      // The Start button toggles the menu itself.
      if (startButtonRef.current?.contains(target)) return
      onClose({ restoreFocus: false })
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [onClose, startButtonRef])

  function openFromMenu(app: AppId) {
    onClose({ restoreFocus: false })
    // The menu item disappears; closing the window brings the focus back to Start.
    openApp(app, { opener: startButtonRef.current })
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = menuItems(menuRef.current)
    const current = items.indexOf(document.activeElement as HTMLElement)
    const focusAt = (index: number) =>
      items[(index + items.length) % items.length]?.focus()
    const otherColumn = () => {
      const column = items[current]?.closest('[data-column]')
      const next = items.find(
        (item) => item.closest('[data-column]') !== column,
      )
      next?.focus()
    }

    switch (event.key) {
      case 'ArrowDown':
        focusAt(current + 1)
        break
      case 'ArrowUp':
        focusAt(current - 1)
        break
      case 'Home':
        focusAt(0)
        break
      case 'End':
        focusAt(items.length - 1)
        break
      case 'ArrowLeft':
      case 'ArrowRight':
        otherColumn()
        break
      case 'Escape':
        onClose({ restoreFocus: true })
        break
      case 'Tab':
        // The focus leaves the menu, so it closes without taking the focus back.
        onClose({ restoreFocus: false })
        return
      default:
        return
    }
    event.preventDefault()
  }

  return (
    <div ref={rootRef} id={id} className={styles.startMenu}>
      <div className={styles.header}>
        <img className={styles.avatar} src={icons.avatar} alt="" />
        <span>{t('startMenu.user')}</span>
      </div>

      <div
        ref={menuRef}
        role="menu"
        aria-label={t('startMenu.label')}
        className={styles.menu}
        onKeyDown={onKeyDown}
      >
        <div role="none" className={styles.columns}>
          <div role="none" className={styles.programs} data-column="programs">
            {START_MENU_APPS.map((app) => (
              <button
                key={app}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={styles.item}
                onClick={() => openFromMenu(app)}
              >
                <img className={styles.itemIcon} src={appIcons[app]} alt="" />
                <span className={styles.itemText}>
                  <span className={styles.itemTitle}>
                    {t(`apps.${app}.title`)}
                  </span>
                  <span className={styles.itemSubtitle}>
                    {t(`apps.${app}.subtitle`)}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div role="none" className={styles.places} data-column="places">
            <a
              role="menuitem"
              tabIndex={-1}
              className={styles.item}
              href={cvUrl(lang)}
              target="_blank"
              rel="noopener"
              onClick={() => onClose({ restoreFocus: true })}
            >
              <img className={styles.itemIcon} src={icons.cv} alt="" />
              <span className={styles.itemTitle}>
                {t('actions.downloadCv')}
              </span>
            </a>
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={styles.item}
              onClick={() => openFromMenu('control-panel')}
            >
              <img
                className={styles.itemIcon}
                src={appIcons['control-panel']}
                alt=""
              />
              <span className={styles.itemTitle}>
                {t('apps.control-panel.title')}
              </span>
            </button>
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={styles.item}
              onClick={() => {
                onHelp()
                onClose({ restoreFocus: true })
              }}
            >
              <img className={styles.itemIcon} src={icons.help} alt="" />
              <span className={styles.itemTitle}>{t('startMenu.help')}</span>
            </button>
          </div>
        </div>

        <div role="none" className={styles.footer}>
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={styles.footerItem}
            onClick={onLogOff}
          >
            <img className={styles.footerIcon} src={icons.logOff} alt="" />
            <span>{t('startMenu.logOff')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
