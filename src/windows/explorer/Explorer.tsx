import { useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { icons } from '../../icons'
import { useI18n } from '../../i18n/useI18n'
import { useIsMobile } from '../../os/useIsMobile'
import type { ExplorerNavigation } from './useExplorerHistory'
import styles from './Explorer.module.css'

interface ExplorerProps {
  /** Icon of the app, at the start of the address bar. */
  icon: string
  /** Address bar crumbs, from the section down to what is on screen. */
  path: readonly string[]
  /** Back and Forward; without it both stay disabled. */
  navigation?: ExplorerNavigation
  /** Task pane sections, left of the content. */
  taskPane: ReactNode
  /** Status bar: what is on screen or how many items there are. */
  status: { icon: string; text: string }
  children: ReactNode
}

/**
 * Explorer chrome shared by About, Projects, Skills and Experience (spec §4.5):
 * Back/Forward toolbar, address bar with crumbs, blue task pane, white content
 * area and status bar. In mobile mode (spec §4.7) the task pane folds into a
 * drop-down above the content, named after what is on screen.
 */
export function Explorer({
  icon,
  path,
  navigation,
  taskPane,
  status,
  children,
}: ExplorerProps) {
  const { t } = useI18n()
  const id = useId()
  const mobile = useIsMobile()
  const [paneOpen, setPaneOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const current = path[path.length - 1]

  // Choosing an item folds the drop-down. The focus waits on its toggle, unless
  // the item already sent it elsewhere (a section heading).
  function onPaneClick(event: MouseEvent<HTMLElement>) {
    if (!mobile || !(event.target as Element).closest('button')) return
    setPaneOpen(false)
    if (event.currentTarget.contains(document.activeElement)) {
      toggleRef.current?.focus()
    }
  }

  return (
    <div className={styles.explorer}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.toolButton}
          disabled={!navigation?.canGoBack}
          onClick={navigation?.back}
        >
          <img className={styles.toolIcon} src={icons.back} alt="" />
          <span>{t('explorer.back')}</span>
        </button>
        <button
          type="button"
          className={styles.toolButton}
          aria-label={t('explorer.forward')}
          title={t('explorer.forward')}
          disabled={!navigation?.canGoForward}
          onClick={navigation?.forward}
        >
          <img className={styles.toolIcon} src={icons.forward} alt="" />
        </button>
      </div>

      <div className={styles.addressBar}>
        <span id={`${id}-address`} className={styles.addressLabel}>
          {t('explorer.address')}
        </span>
        <nav aria-labelledby={`${id}-address`} className={styles.address}>
          <img className={styles.addressIcon} src={icon} alt="" />
          <ol className={styles.crumbs}>
            {path.map((crumb, index) => (
              <li
                key={index}
                className={styles.crumb}
                aria-current={index === path.length - 1 ? 'page' : undefined}
              >
                {crumb}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className={styles.main}>
        {mobile && (
          <button
            ref={toggleRef}
            type="button"
            className={styles.paneToggle}
            aria-label={t('explorer.taskPaneToggle', { current })}
            aria-expanded={paneOpen}
            aria-controls={`${id}-pane`}
            onClick={() => setPaneOpen((open) => !open)}
          >
            <img className={styles.paneToggleIcon} src={icon} alt="" />
            <span className={styles.paneToggleText}>{current}</span>
          </button>
        )}
        <nav
          id={`${id}-pane`}
          className={styles.taskPane}
          aria-label={t('explorer.taskPane')}
          hidden={mobile && !paneOpen}
          onClick={onPaneClick}
        >
          {taskPane}
        </nav>
        {/* Focusable so the keyboard can scroll it, named after what it shows. */}
        <div
          className={styles.content}
          role="region"
          aria-label={path[path.length - 1]}
          tabIndex={0}
        >
          {children}
        </div>
      </div>

      <div className={`status-bar ${styles.statusBar}`}>
        <p className={`status-bar-field ${styles.status}`}>
          <img className={styles.statusIcon} src={status.icon} alt="" />
          <span className={styles.statusText}>{status.text}</span>
        </p>
      </div>
    </div>
  )
}
