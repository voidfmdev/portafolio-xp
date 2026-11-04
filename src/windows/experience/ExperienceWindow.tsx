import { useId, useRef } from 'react'
import { content } from '../../content'
import type { Experience, Name, Text } from '../../content/schema'
import { appIcons, icons } from '../../icons'
import type { MessageKey } from '../../i18n/messages'
import { useI18n } from '../../i18n/useI18n'
import { useIsMobile } from '../../os/useIsMobile'
import { Explorer } from '../explorer/Explorer'
import { TaskPaneItem } from '../explorer/TaskPaneItem'
import { TaskPaneSection } from '../explorer/TaskPaneSection'
import text from '../explorer/content.module.css'
import styles from './ExperienceWindow.module.css'

interface Row {
  id: string
  title: Text
  place: Name
  start: string
  end: string | null
  location: Text
}

interface Table {
  key: 'work' | 'education'
  heading: MessageKey
  columns: readonly [MessageKey, MessageKey]
  icon: string
  rows: Row[]
}

/** Most recent first (spec §5.4). ISO dates sort as plain text; the JSON order does not matter. */
function byStartDescending(rows: Row[]): Row[] {
  return rows.toSorted((a, b) =>
    a.start === b.start ? 0 : a.start < b.start ? 1 : -1,
  )
}

function tables({ work, education }: Experience): Table[] {
  return [
    {
      key: 'work',
      heading: 'experience.work',
      columns: ['experience.role', 'experience.company'],
      icon: appIcons.experience,
      rows: byStartDescending(
        work.map(({ role, company, ...rest }) => ({
          ...rest,
          title: role,
          place: company,
        })),
      ),
    },
    {
      key: 'education',
      heading: 'experience.education',
      columns: ['experience.degree', 'experience.institution'],
      icon: icons.education,
      rows: byStartDescending(
        education.map(({ degree, institution, ...rest }) => ({
          ...rest,
          title: degree,
          place: institution,
        })),
      ),
    },
  ]
}

/**
 * Work and education as two Details views of the Explorer (spec §5.4); in
 * mobile mode each row is a card (spec §4.7).
 */
export function ExperienceWindow() {
  const { t, tn, localize, formatPeriod } = useI18n()
  const mobile = useIsMobile()
  const id = useId()
  const headings = useRef(new Map<string, HTMLHeadingElement>())
  const sections = tables(content.experience)
  const total = sections.reduce((sum, table) => sum + table.rows.length, 0)

  return (
    <Explorer
      icon={appIcons.experience}
      path={[t('apps.experience.title'), t('apps.experience.subtitle')]}
      taskPane={
        <TaskPaneSection title={t('apps.experience.title')}>
          {sections.map((table) => (
            <TaskPaneItem
              key={table.key}
              icon={table.icon}
              label={t(table.heading)}
              onSelect={() => headings.current.get(table.key)?.focus()}
            />
          ))}
        </TaskPaneSection>
      }
      status={{
        icon: appIcons.experience,
        text: tn('explorer.objectCount', total),
      }}
    >
      <h3 className={text.pageTitle}>{t('apps.experience.subtitle')}</h3>

      {sections.map((table) => (
        <section
          key={table.key}
          className={styles.section}
          aria-labelledby={`${id}-${table.key}`}
        >
          <h4
            id={`${id}-${table.key}`}
            ref={(element) => {
              if (element) headings.current.set(table.key, element)
              else headings.current.delete(table.key)
            }}
            className={text.sectionTitle}
            tabIndex={-1}
          >
            {t(table.heading)}
          </h4>

          {table.rows.length === 0 ? (
            <p className={text.empty}>{t('explorer.empty')}</p>
          ) : mobile ? (
            <ul className={styles.cards} aria-labelledby={`${id}-${table.key}`}>
              {table.rows.map((row) => {
                const period = formatPeriod(row.start, row.end)
                return (
                  <li key={row.id} className={styles.card}>
                    <h5 className={styles.cardTitle}>
                      <img className={styles.rowIcon} src={table.icon} alt="" />
                      {localize(row.title)}
                    </h5>
                    <dl className={styles.facts}>
                      <dt>{t(table.columns[1])}</dt>
                      <dd>{localize(row.place)}</dd>
                      <dt>{t('experience.period')}</dt>
                      <dd>
                        <span className={styles.range}>{period.range}</span>
                        <span className={styles.duration}>
                          {period.duration}
                        </span>
                      </dd>
                      <dt>{t('experience.location')}</dt>
                      <dd>{localize(row.location)}</dd>
                    </dl>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className={styles.frame}>
              <table
                className={styles.details}
                aria-labelledby={`${id}-${table.key}`}
              >
                <thead>
                  <tr>
                    <th scope="col">{t(table.columns[0])}</th>
                    <th scope="col">{t(table.columns[1])}</th>
                    <th scope="col">{t('experience.period')}</th>
                    <th scope="col">{t('experience.location')}</th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => {
                    const period = formatPeriod(row.start, row.end)
                    return (
                      <tr key={row.id}>
                        <td>
                          <span className={styles.titleCell}>
                            <img
                              className={styles.rowIcon}
                              src={table.icon}
                              alt=""
                            />
                            {localize(row.title)}
                          </span>
                        </td>
                        <td>{localize(row.place)}</td>
                        <td>
                          <span className={styles.range}>{period.range}</span>
                          <span className={styles.duration}>
                            {period.duration}
                          </span>
                        </td>
                        <td>{localize(row.location)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </Explorer>
  )
}
