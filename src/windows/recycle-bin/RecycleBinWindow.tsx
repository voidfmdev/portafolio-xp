import { appIcons } from '../../icons'
import { useI18n } from '../../i18n/useI18n'
import styles from './RecycleBinWindow.module.css'

/** First version of the Recycle Bin: always empty (spec §5.9). */
export function RecycleBinWindow() {
  const { t, tn } = useI18n()

  return (
    <div className={styles.recycleBin}>
      <div className={styles.content}>
        <img className={styles.icon} src={appIcons['recycle-bin']} alt="" />
        <p className={styles.message}>{t('recycleBin.empty')}</p>
      </div>
      <div className={`status-bar ${styles.statusBar}`}>
        <p className="status-bar-field">{tn('explorer.objectCount', 0)}</p>
      </div>
    </div>
  )
}
