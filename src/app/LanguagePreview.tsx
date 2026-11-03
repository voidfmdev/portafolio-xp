import { useId, useState } from 'react'
import { content } from '../content'
import { LANGS } from '../i18n/locales'
import { translate } from '../i18n/messages'
import { useI18n } from '../i18n/useI18n'
import { START_MENU_APPS } from '../os/appIds'
import styles from './LanguagePreview.module.css'

/**
 * Temporary screen to check that switching languages updates interface strings,
 * content and dates at once. Removed when the desktop is implemented.
 */
export function LanguagePreview() {
  const {
    lang,
    setLang,
    t,
    tn,
    localize,
    formatPeriod,
    formatTime,
    formatFullDate,
  } = useI18n()
  const [now] = useState(() => new Date())
  const id = useId()
  const job = content.experience.work[0]

  return (
    <main className={styles.screen}>
      <section
        className={`window ${styles.window}`}
        aria-labelledby={`${id}-title`}
      >
        <div className="title-bar">
          <div className="title-bar-text" id={`${id}-title`}>
            {t('apps.control-panel.title')}
          </div>
        </div>

        <div className="window-body">
          <fieldset>
            <legend>{t('controlPanel.language')}</legend>
            {LANGS.map((option) => (
              <div className="field-row" key={option}>
                <input
                  type="radio"
                  id={`${id}-${option}`}
                  name={`${id}-lang`}
                  checked={lang === option}
                  onChange={() => setLang(option)}
                />
                {/* Each account is named in its own language, whatever the current one. */}
                <label htmlFor={`${id}-${option}`} lang={option}>
                  {translate(option, 'welcome.account')}
                </label>
              </div>
            ))}
          </fieldset>

          <dl>
            {START_MENU_APPS.map((app) => (
              <div key={app}>
                <dt>{t(`apps.${app}.title`)}</dt>
                <dd>{t(`apps.${app}.subtitle`)}</dd>
              </div>
            ))}
          </dl>

          <dl>
            <div>
              <dt>{t('apps.projects.title')}</dt>
              <dd>
                {tn('explorer.projectCount', content.projects.projects.length)}
              </dd>
            </div>
            <div>
              <dt>{localize(job.role)}</dt>
              <dd>
                {t(
                  'experience.periodWithDuration',
                  formatPeriod(job.start, job.end, now),
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="status-bar">
          <p className="status-bar-field">{t('language.code')}</p>
          <p className="status-bar-field">{formatTime(now)}</p>
          <p className="status-bar-field">{formatFullDate(now)}</p>
        </div>
      </section>
    </main>
  )
}
