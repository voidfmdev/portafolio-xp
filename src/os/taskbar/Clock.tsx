import { useI18n } from '../../i18n/useI18n'
import { useMinuteClock } from './useMinuteClock'
import styles from './Clock.module.css'

/** Tray clock: time per language, full date on hover (spec §4.3, D25). */
export function Clock() {
  const { formatTime, formatFullDate } = useI18n()
  const now = useMinuteClock()

  return (
    <time
      className={styles.clock}
      dateTime={now.toISOString()}
      title={formatFullDate(now)}
    >
      {formatTime(now)}
    </time>
  )
}
