import { useEffect } from 'react'
import { content } from '../../content'
import { appIcons, skillIcon } from '../../icons'
import { useI18n } from '../../i18n/useI18n'
import { useWindowManager } from '../../os/window-manager/useWindowManager'
import { Explorer } from '../explorer/Explorer'
import { TaskPaneItem } from '../explorer/TaskPaneItem'
import { TaskPaneSection } from '../explorer/TaskPaneSection'
import { useExplorerHistory } from '../explorer/useExplorerHistory'
import text from '../explorer/content.module.css'
import type { AppWindowProps } from '../types'
import styles from './SkillsWindow.module.css'

/**
 * Skill categories from skills.json (spec §5.3): categories in the task pane,
 * the items of the selected one as an icon grid. The selection is the window's
 * target, so the hash names it (`#/habilidades/<categoria>`).
 */
export function SkillsWindow({ window }: AppWindowProps) {
  const { t, tn, localize } = useI18n()
  const { navigateApp } = useWindowManager()
  const { categories } = content.skills
  const category =
    categories.find((item) => item.id === window.target) ?? categories.at(0)
  const show = (categoryId?: string) => navigateApp(window.id, categoryId)
  const navigation = useExplorerHistory(category?.id, show)

  // A link to a category that no longer exists shows the first one, and the hash says so.
  const unknownTarget =
    window.target !== undefined && category?.id !== window.target
  useEffect(() => {
    if (unknownTarget) navigateApp(window.id)
  }, [unknownTarget, navigateApp, window.id])

  const count = tn('explorer.categoryCount', categories.length)
  const name = category ? localize(category.name) : undefined

  return (
    <Explorer
      icon={appIcons.skills}
      path={name ? [t('apps.skills.title'), name] : [t('apps.skills.title')]}
      navigation={navigation}
      taskPane={
        <TaskPaneSection title={t('apps.skills.title')} aside={count}>
          {categories.map((item) => (
            <TaskPaneItem
              key={item.id}
              icon={appIcons.skills}
              label={localize(item.name)}
              current={item.id === category?.id}
              onSelect={() => show(item.id)}
            />
          ))}
        </TaskPaneSection>
      }
      status={{ icon: appIcons.skills, text: name ?? count }}
    >
      {category ? (
        // The content region is already named after the category.
        <div>
          <h3 className={text.pageTitle}>{name}</h3>
          <p className={`${text.text} ${text.muted}`}>
            {localize(category.description)}
          </p>
          {category.items.length > 0 ? (
            <ul className={styles.grid}>
              {/* Item names are not unique ids; the list never reorders. */}
              {category.items.map((item, index) => (
                <li key={index} className={styles.item}>
                  <img
                    className={styles.icon}
                    src={skillIcon(item.icon)}
                    alt=""
                  />
                  <span className={styles.name}>{localize(item.name)}</span>
                  {item.level && (
                    <span className={styles.level}>{localize(item.level)}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className={text.empty}>{t('explorer.empty')}</p>
          )}
        </div>
      ) : (
        <p className={text.empty}>{t('explorer.empty')}</p>
      )}
    </Explorer>
  )
}
