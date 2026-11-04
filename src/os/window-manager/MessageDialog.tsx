import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { useI18n } from '../../i18n/useI18n'
import { CONTROL_LABEL, XP_CONTROL_STYLE } from './titleBarControls'
import styles from './MessageDialog.module.css'

export interface DialogButton {
  label: string
  onClick: () => void
}

interface MessageDialogProps {
  title: string
  /** Info or warning icon, shown left of the message. */
  icon: string
  /** Buttons in XP order (OK before Cancel). */
  buttons: readonly DialogButton[]
  /** Index of the button that takes the focus; Cancel for destructive actions. */
  initialFocus?: number
  /** Esc and the title bar's close button. */
  onCancel: () => void
  children: ReactNode
}

/**
 * XP message box over the content of a window (spec §5.5). The caller makes the
 * content behind it `inert` and gives the focus back once it closes.
 */
export function MessageDialog({
  title,
  icon,
  buttons,
  initialFocus = 0,
  onCancel,
  children,
}: MessageDialogProps) {
  const { t } = useI18n()
  const id = useId()
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    buttonRefs.current[initialFocus]?.focus()
  }, [initialFocus])

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Escape') return
    // Closes the message box only, not the window around it.
    event.preventDefault()
    event.stopPropagation()
    onCancel()
  }

  return (
    <div className={styles.overlay}>
      <section
        role="alertdialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-message`}
        className={`window ${styles.dialog}`}
        onKeyDown={onKeyDown}
      >
        <div className="title-bar">
          <h3 id={`${id}-title`} className={`title-bar-text ${styles.title}`}>
            {title}
          </h3>
          <div className="title-bar-controls">
            <button
              type="button"
              aria-label={XP_CONTROL_STYLE.close}
              aria-labelledby={`${id}-close`}
              onClick={onCancel}
            >
              <span id={`${id}-close`} hidden>
                {t(CONTROL_LABEL.close)}
              </span>
            </button>
          </div>
        </div>
        <div className={`window-body ${styles.body}`}>
          <div className={styles.message}>
            <img className={styles.icon} src={icon} alt="" />
            <p id={`${id}-message`} className={styles.text}>
              {children}
            </p>
          </div>
          <div className={styles.buttons}>
            {buttons.map((button, index) => (
              <button
                key={button.label}
                ref={(element) => {
                  buttonRefs.current[index] = element
                }}
                type="button"
                onClick={button.onClick}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
