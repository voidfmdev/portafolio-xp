import {
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import styles from './DesktopIcon.module.css'

interface DesktopIconProps {
  label: string
  icon: string
  selected: boolean
  /** A single click opens it too, as in mobile mode (spec §4.7). */
  openOnClick?: boolean
  onSelect: () => void
  /** Receives the icon, so the focus can come back to it when the window closes. */
  onOpen: (icon: HTMLButtonElement) => void
}

/**
 * Desktop icon (spec §4.2): one click selects, double click or Enter opens; a
 * tap opens, at any screen width.
 */
export function DesktopIcon({
  label,
  icon,
  selected,
  openOnClick = false,
  onSelect,
  onOpen,
}: DesktopIconProps) {
  const tapped = useRef(false)

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    tapped.current = event.pointerType === 'touch'
  }

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    onSelect()
    if (openOnClick || tapped.current) onOpen(event.currentTarget)
    tapped.current = false
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'Enter') return
    // Enter would also click the button; opening is enough.
    event.preventDefault()
    onSelect()
    onOpen(event.currentTarget)
  }

  return (
    <button
      type="button"
      className={selected ? `${styles.icon} ${styles.selected}` : styles.icon}
      data-desktop-icon=""
      onPointerDown={onPointerDown}
      onClick={onClick}
      onDoubleClick={(event) => onOpen(event.currentTarget)}
      onKeyDown={onKeyDown}
    >
      <img className={styles.image} src={icon} alt="" draggable={false} />
      <span className={styles.label}>{label}</span>
    </button>
  )
}
