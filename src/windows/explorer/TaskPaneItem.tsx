import styles from './TaskPane.module.css'

interface TaskPaneItemProps {
  icon: string
  label: string
  /** The item on screen. */
  current?: boolean
  onSelect: () => void
}

/** One entry of a task pane list: an item to show or a part of the page to jump to. */
export function TaskPaneItem({
  icon,
  label,
  current = false,
  onSelect,
}: TaskPaneItemProps) {
  return (
    <li>
      <button
        type="button"
        className={styles.item}
        aria-current={current ? 'page' : undefined}
        onClick={onSelect}
      >
        <img className={styles.icon} src={icon} alt="" />
        <span className={styles.label}>{label}</span>
      </button>
    </li>
  )
}
