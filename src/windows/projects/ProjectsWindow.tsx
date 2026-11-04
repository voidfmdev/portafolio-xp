import { useEffect, useId } from 'react'
import { content } from '../../content'
import type { Project } from '../../content/schema'
import { appIcons, icons } from '../../icons'
import type { MessageKey } from '../../i18n/messages'
import { useI18n } from '../../i18n/useI18n'
import { useWindowManager } from '../../os/window-manager/useWindowManager'
import { Explorer } from '../explorer/Explorer'
import { TaskPaneItem } from '../explorer/TaskPaneItem'
import { TaskPaneSection } from '../explorer/TaskPaneSection'
import { useExplorerHistory } from '../explorer/useExplorerHistory'
import text from '../explorer/content.module.css'
import type { AppWindowProps } from '../types'
import { Gallery } from './Gallery'
import styles from './ProjectsWindow.module.css'

/** Buttons under a project, in this order; each one only when its link exists. */
const LINKS: readonly [keyof Project['links'], MessageKey][] = [
  ['github', 'projects.github'],
  ['demo', 'projects.demo'],
  ['caseStudy', 'projects.caseStudy'],
]

/**
 * Projects from projects.json (spec §5.2): the list in the task pane, the
 * selected one in the content. The selection is the window's target, so the
 * hash names it (`#/proyectos/<slug>`).
 */
export function ProjectsWindow({ window }: AppWindowProps) {
  const { t, tn, localize } = useI18n()
  const { navigateApp } = useWindowManager()
  const id = useId()
  const { projects } = content.projects
  const project =
    projects.find((item) => item.slug === window.target) ?? projects.at(0)
  const show = (slug?: string) => navigateApp(window.id, slug)
  const navigation = useExplorerHistory(project?.slug, show)

  // A link to a project that no longer exists shows the first one, and the hash says so.
  const unknownTarget =
    window.target !== undefined && project?.slug !== window.target
  useEffect(() => {
    if (unknownTarget) navigateApp(window.id)
  }, [unknownTarget, navigateApp, window.id])

  const count = tn('explorer.projectCount', projects.length)
  const name = project ? localize(project.name) : undefined

  return (
    <Explorer
      icon={appIcons.projects}
      path={
        name ? [t('apps.projects.title'), name] : [t('apps.projects.title')]
      }
      navigation={navigation}
      taskPane={
        <TaskPaneSection title={t('apps.projects.title')} aside={count}>
          {projects.map((item) => (
            <TaskPaneItem
              key={item.slug}
              icon={icons.document}
              label={localize(item.name)}
              current={item.slug === project?.slug}
              onSelect={() => show(item.slug)}
            />
          ))}
        </TaskPaneSection>
      }
      status={
        name
          ? { icon: icons.document, text: name }
          : { icon: appIcons.projects, text: count }
      }
    >
      {project ? (
        <article aria-labelledby={`${id}-title`}>
          <h3 id={`${id}-title`} className={text.pageTitle}>
            {name}
          </h3>
          <p className={`${styles.meta} ${text.muted}`}>
            {t('projects.meta', {
              // A string, so the year is not formatted as a number ("2.024").
              year: String(project.year),
              role: localize(project.role),
            })}
          </p>

          <Gallery
            key={project.slug}
            images={project.images}
            restricted={project.visibility === 'restricted'}
          />

          <p className={`${text.text} ${styles.summary}`}>
            {localize(project.summary)}
          </p>
          <p className={text.text}>{localize(project.description)}</p>

          <h4 className={text.sectionTitle}>{t('projects.technologies')}</h4>
          <ul className={styles.chips}>
            {project.tech.map((tech) => (
              <li key={tech} className={styles.chip}>
                {tech}
              </li>
            ))}
          </ul>

          <div className={styles.links}>
            {LINKS.map(([key, label]) => {
              const url = project.links[key]
              return url ? (
                <a
                  key={key}
                  className={styles.linkButton}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img className={styles.linkIcon} src={icons.link} alt="" />
                  {t(label)}
                </a>
              ) : null
            })}
          </div>
        </article>
      ) : (
        <p className={text.empty}>{t('explorer.empty')}</p>
      )}
    </Explorer>
  )
}
