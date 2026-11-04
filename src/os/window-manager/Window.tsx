import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { useI18n } from '../../i18n/useI18n'
import { keepTabInside } from '../../lib/a11y'
import {
  CONTROL_LABEL,
  XP_CONTROL_STYLE,
  type TitleBarControl,
} from './titleBarControls'
import { isOnTitleBarControls, useWindowDrag } from './useWindowDrag'
import { useWindowManager } from './useWindowManager'
import type { WindowState } from './windowReducer'
import styles from './Window.module.css'

interface WindowProps {
  window: WindowState
  title: string
  icon: string
  children?: ReactNode
}

/** XP window: title bar with its buttons, dragging, focus and stacking (spec §4.5). */
export function Window({ window, title, icon, children }: WindowProps) {
  const { t } = useI18n()
  const { state, closeApp, minimizeApp, maximizeApp, restoreApp, focusApp } =
    useWindowManager()
  const id = useId()
  const ref = useRef<HTMLElement>(null)
  const drag = useWindowDrag(window, ref)
  const isActive = state.activeId === window.id
  const zIndex = state.zOrder.indexOf(window.id) + 1

  // The focus enters the window when it opens or comes forward, unless it is already inside.
  useEffect(() => {
    const element = ref.current
    if (!isActive || window.minimized || !element) return
    if (!element.contains(document.activeElement)) element.focus()
  }, [isActive, window.minimized, state.focusRequest])

  const toggleMaximize = () =>
    window.maximized ? restoreApp(window.id) : maximizeApp(window.id)

  const controls: {
    key: string
    control: TitleBarControl
    onClick: () => void
  }[] = [
    {
      key: 'minimize',
      control: 'minimize',
      onClick: () => minimizeApp(window.id),
    },
    {
      // Same key for both states, so the button keeps the focus when it switches.
      key: 'size',
      control: window.maximized ? 'restore' : 'maximize',
      onClick: toggleMaximize,
    },
    { key: 'close', control: 'close', onClick: () => closeApp(window.id) },
  ]

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeApp(window.id)
      return
    }
    if (ref.current) keepTabInside(event, ref.current)
  }

  function onTitleDoubleClick(event: MouseEvent<HTMLElement>) {
    if (!isOnTitleBarControls(event.target)) toggleMaximize()
  }

  const className = [
    'window',
    styles.window,
    !isActive && styles.inactive,
    window.maximized && styles.maximized,
  ]
    .filter(Boolean)
    .join(' ')

  const placement = window.maximized
    ? { zIndex }
    : {
        zIndex,
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
      }

  return (
    <section
      ref={ref}
      role="dialog"
      aria-labelledby={`${id}-title`}
      tabIndex={-1}
      hidden={window.minimized}
      className={className}
      style={placement}
      onPointerDownCapture={() => focusApp(window.id)}
      onKeyDown={onKeyDown}
    >
      <div
        className={`title-bar ${styles.titleBar}`}
        onDoubleClick={onTitleDoubleClick}
        {...drag}
      >
        <img className={styles.titleIcon} src={icon} alt="" draggable={false} />
        <h2 id={`${id}-title`} className={`title-bar-text ${styles.title}`}>
          {title}
        </h2>
        <div className="title-bar-controls">
          {controls.map(({ key, control, onClick }) => (
            <button
              key={key}
              type="button"
              aria-label={XP_CONTROL_STYLE[control]}
              aria-labelledby={`${id}-${key}`}
              onClick={onClick}
            >
              <span id={`${id}-${key}`} hidden>
                {t(CONTROL_LABEL[control])}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className={`window-body ${styles.body}`}>{children}</div>
    </section>
  )
}
