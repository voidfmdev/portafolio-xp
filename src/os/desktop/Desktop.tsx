import { useEffect, useState, type PointerEvent } from 'react'
import { appIcons, icons } from '../../icons'
import { useI18n } from '../../i18n/useI18n'
import type { AppId } from '../appIds'
import { openCv } from '../cv'
import { useWindowManager } from '../window-manager/useWindowManager'
import { WindowLayer } from '../window-manager/WindowLayer'
import { DesktopIcon } from './DesktopIcon'
import styles from './Desktop.module.css'

type DesktopItem = AppId | 'cv'

/** Spec §4.2: the CV on top, then the six sections; the Recycle Bin top right. */
const LEFT_COLUMN: readonly DesktopItem[] = [
  'cv',
  'about',
  'projects',
  'skills',
  'experience',
  'contact',
  'messenger',
]
const RIGHT_COLUMN: readonly DesktopItem[] = ['recycle-bin']

/** Wallpaper, icons and the windows on top of them. */
export function Desktop() {
  const { t, lang } = useI18n()
  const { desktopRef, openApp } = useWindowManager()
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

  const renderIcons = (items: readonly DesktopItem[], className: string) => (
    <ul className={className}>
      {items.map((item) => (
        <li key={item}>
          <DesktopIcon
            label={
              item === 'cv' ? t('actions.downloadCv') : t(`apps.${item}.title`)
            }
            icon={item === 'cv' ? icons.cv : appIcons[item]}
            selected={selected === item}
            onSelect={() => setSelected(item)}
            onOpen={(icon) => open(item, icon)}
          />
        </li>
      ))}
    </ul>
  )

  return (
    <main
      ref={desktopRef}
      tabIndex={-1}
      aria-label={t('desktop.label')}
      className={styles.desktop}
      onPointerDown={clearSelection}
    >
      {renderIcons(LEFT_COLUMN, styles.left)}
      {renderIcons(RIGHT_COLUMN, styles.right)}
      <WindowLayer />
    </main>
  )
}
