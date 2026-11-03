import type { KeyboardEvent } from 'react'
import styles from './DesktopIcon.module.css'

interface DesktopIconProps {
  label: string
  icon: string
  selected: boolean
  onSelect: () => void
  /** Receives the icon, so the focus can come back to it when the window closes. */
  onOpen: (icon: HTMLButtonElement) => void
}

/** Desktop icon: one click selects, double click or Enter opens (spec §4.2). */
export function DesktopIcon({
  label,
  icon,
  selected,
  onSelect,
  onOpen,
}: DesktopIconProps) {
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
      onClick={onSelect}
      onDoubleClick={(event) => onOpen(event.currentTarget)}
      onKeyDown={onKeyDown}
    >
      <img className={styles.image} src={icon} alt="" draggable={false} />
      <span className={styles.label}>{label}</span>
    </button>
  )
}
