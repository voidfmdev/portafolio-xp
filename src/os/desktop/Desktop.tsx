import { useEffect, useState, type PointerEvent } from 'react'
import { appIcons, icons } from '../../icons'
import { useI18n } from '../../i18n/useI18n'
import type { AppId } from '../appIds'
import { openCv } from '../cv'
import { useIsMobile } from '../useIsMobile'
import { useWindowManager } from '../window-manager/useWindowManager'
import { WindowLayer } from '../window-manager/WindowLayer'
import { DesktopIcon } from './DesktopIcon'
import styles from './Desktop.module.css'

type DesktopItem = AppId | 'cv'

/**
 * Spec §4.2: the CV on top, then the six sections, in a column; the Recycle Bin
 * in the top-right corner. One list, so mobile mode can lay them all out in a
 * three-column grid (spec §4.7) in the same order.
 */
const ITEMS: readonly DesktopItem[] = [
  'cv',
  'about',
  'projects',
  'skills',
  'experience',
  'contact',
  'messenger',
  'recycle-bin',
]
const TOP_RIGHT: DesktopItem = 'recycle-bin'

/** Wallpaper, icons and the windows on top of them. */
export function Desktop() {
  const { t, lang } = useI18n()
  const { desktopRef, openApp } = useWindowManager()
  const mobile = useIsMobile()
  const [selected, setSelected] = useState<DesktopItem | null>(null)

  // Entering the desktop puts the focus on it, unless a window already took it.
  useEffect(() => {
    if (document.activeElement === document.body) desktopRef.current?.focus()
  }, [desktopRef])

  function open(item: DesktopItem, icon: HTMLButtonElement) {
    if (item === 'cv') openCv(lang)
    else openApp(item, { opener: icon })
  }

  function clearSelection(event: PointerEvent<HTMLElement>) {
    const target = event.target as Element
    if (!target.closest('[data-desktop-icon], [role="dialog"]')) {
      setSelected(null)
    }
  }

  return (
    <main
      ref={desktopRef}
      tabIndex={-1}
      aria-label={t('desktop.label')}
      className={styles.desktop}
      onPointerDown={clearSelection}
    >
      <ul className={styles.icons}>
        {ITEMS.map((item) => (
          <li
            key={item}
            className={item === TOP_RIGHT ? styles.topRight : undefined}
          >
            <DesktopIcon
              label={
                item === 'cv'
                  ? t('actions.downloadCv')
                  : t(`apps.${item}.title`)
              }
              icon={item === 'cv' ? icons.cv : appIcons[item]}
              selected={selected === item}
              openOnClick={mobile}
              onSelect={() => setSelected(item)}
              onOpen={(icon) => open(item, icon)}
            />
          </li>
        ))}
      </ul>
      <WindowLayer />
    </main>
  )
}
