import { useId, useRef } from 'react'
import { content } from '../../content'
import { assetUrl } from '../../content/assetUrl'
import { isMarker } from '../../content/marker'
import { appIcons, icons } from '../../icons'
import { useI18n } from '../../i18n/useI18n'
import { Explorer } from '../explorer/Explorer'
import { TaskPaneItem } from '../explorer/TaskPaneItem'
import { TaskPaneSection } from '../explorer/TaskPaneSection'
import text from '../explorer/content.module.css'
import styles from './AboutWindow.module.css'

/** Profile card and free sections from profile.json (spec §5.1). */
export function AboutWindow() {
  const { t, localize } = useI18n()
  const { profile } = content
  const id = useId()
  const headings = useRef(new Map<string, HTMLHeadingElement>())
  // Until the real photo exists (`<foto>`), the card shows the own avatar.
  const photo =
    profile.photo && !isMarker(profile.photo.src) ? profile.photo : undefined

  return (
    <Explorer
      icon={appIcons.about}
      path={[t('apps.about.title'), localize(profile.breadcrumb)]}
      taskPane={
        <TaskPaneSection title={t('apps.about.title')}>
          {profile.sections.map((section) => (
            <TaskPaneItem
              key={section.id}
              icon={icons.document}
              label={localize(section.title)}
              onSelect={() => headings.current.get(section.id)?.focus()}
            />
          ))}
        </TaskPaneSection>
      }
      status={{ icon: appIcons.about, text: profile.name }}
    >
      <h3 className={text.pageTitle}>{localize(profile.pageTitle)}</h3>

      <div className={styles.card}>
        <img
          className={styles.photo}
          src={photo ? assetUrl(photo.src) : icons.avatar}
          alt={photo ? localize(photo.alt) : ''}
        />
        <div className={styles.details}>
          <p className={styles.name}>{profile.name}</p>
          <p className={styles.line}>{localize(profile.role)}</p>
          <p className={styles.line}>{localize(profile.location)}</p>
          <p className={styles.status}>
            <img className={styles.statusIcon} src={icons.online} alt="" />
            {t('about.online')}
          </p>
        </div>
      </div>

      {profile.sections.map((section) => (
        <section
          key={section.id}
          className={styles.section}
          aria-labelledby={`${id}-${section.id}`}
        >
          <h4
            id={`${id}-${section.id}`}
            ref={(element) => {
              if (element) headings.current.set(section.id, element)
              else headings.current.delete(section.id)
            }}
            className={text.sectionTitle}
            tabIndex={-1}
          >
            {localize(section.title)}
          </h4>
          <p className={text.text}>{localize(section.body)}</p>
        </section>
      ))}
    </Explorer>
  )
}
