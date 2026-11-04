import { useId, type ReactNode } from 'react'
import styles from './TaskPane.module.css'

interface TaskPaneSectionProps {
  title: string
  /** Short note right of the title, such as "3 proyectos". */
  aside?: string
  /** `TaskPaneItem`s. */
  children: ReactNode
}

/** Box of the blue task pane: header with its title, then a list of items. */
export function TaskPaneSection({
  title,
  aside,
  children,
}: TaskPaneSectionProps) {
  const id = useId()

  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.header}>
        <h3 id={id} className={styles.title}>
          {title}
        </h3>
        {aside && <span className={styles.aside}>{aside}</span>}
      </div>
      <ul className={styles.list}>{children}</ul>
    </section>
  )
}
