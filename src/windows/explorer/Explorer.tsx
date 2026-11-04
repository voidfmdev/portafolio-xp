import { useId, type ReactNode } from 'react'
import { icons } from '../../icons'
import { useI18n } from '../../i18n/useI18n'
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
 * area and status bar.
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
        <nav className={styles.taskPane} aria-label={t('explorer.taskPane')}>
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
