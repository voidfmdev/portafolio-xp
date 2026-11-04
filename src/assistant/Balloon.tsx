import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { icons } from '../icons'
import { useI18n } from '../i18n/useI18n'
import styles from './Balloon.module.css'

interface BalloonProps {
  title: string
  children: ReactNode
  /**
   * Closes on its own after this time, which starts over while the pointer or
   * the focus is on the balloon. Without it, the balloon waits to be closed.
   */
  autoCloseMs?: number
  /** Close button, Esc and the end of `autoCloseMs`. */
  onClose: () => void
  /** "Don't show again"; left out where it makes no sense, such as Help. */
  onDontShowAgain?: () => void
}

/** Balloon tip like those of the XP notification area (spec §5.7). */
export function Balloon({
  title,
  children,
  autoCloseMs,
  onClose,
  onDontShowAgain,
}: BalloonProps) {
  const { t } = useI18n()
  const id = useId()
  const [pointerInside, setPointerInside] = useState(false)
  const [focusInside, setFocusInside] = useState(false)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  // Nobody loses a message they are reading or about to click.
  const held = pointerInside || focusInside
  useEffect(() => {
    if (autoCloseMs === undefined || held) return
    const timer = window.setTimeout(() => onCloseRef.current(), autoCloseMs)
    return () => window.clearTimeout(timer)
  }, [autoCloseMs, held])

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Escape') return
    event.preventDefault()
    onClose()
  }

  function onBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocusInside(false)
    }
  }

  return (
    <section
      className={styles.balloon}
      aria-labelledby={`${id}-title`}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setPointerInside(true)}
      onPointerLeave={() => setPointerInside(false)}
      onFocus={() => setFocusInside(true)}
      onBlur={onBlur}
    >
      <div className={styles.header}>
        <img className={styles.icon} src={icons.info} alt="" />
        <h2 id={`${id}-title`} className={styles.title}>
          {title}
        </h2>
        <button
          type="button"
          className={styles.close}
          aria-label={t('assistant.close')}
          onClick={onClose}
        >
          <img className={styles.icon} src={icons.close} alt="" />
        </button>
      </div>
      <p className={styles.text}>{children}</p>
      {onDontShowAgain && (
        <button type="button" className={styles.link} onClick={onDontShowAgain}>
          {t('assistant.dontShowAgain')}
        </button>
      )}
    </section>
  )
}
