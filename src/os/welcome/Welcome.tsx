import { useEffect, useRef } from 'react'
import { icons } from '../../icons'
import { LANGS, type Lang } from '../../i18n/locales'
import { translate } from '../../i18n/messages'
import { useI18n } from '../../i18n/useI18n'
import styles from './Welcome.module.css'

interface WelcomeProps {
  /** Called after the language of the chosen account is set and saved. */
  onEnter: () => void
}

/**
 * Welcome screen with two accounts, one per language (spec §4.1, D4). The
 * account of the initial language is highlighted and focused: one click or Enter.
 */
export function Welcome({ onEnter }: WelcomeProps) {
  const { t, lang, setLang } = useI18n()
  const preselected = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    preselected.current?.focus()
  }, [])

  function enter(account: Lang) {
    setLang(account)
    onEnter()
  }

  return (
    <main className={styles.welcome}>
      <div className={styles.band} />
      <div className={styles.middle}>
        <div className={styles.brand}>
          <img className={styles.logo} src={icons.startLogo} alt="" />
          <h1 className={styles.instruction}>{t('welcome.instruction')}</h1>
        </div>
        <div className={styles.divider} />
        <ul className={styles.accounts} aria-label={t('welcome.accounts')}>
          {LANGS.map((account) => (
            <li key={account}>
              <button
                ref={account === lang ? preselected : undefined}
                type="button"
                className={
                  account === lang
                    ? `${styles.account} ${styles.selected}`
                    : styles.account
                }
                onClick={() => enter(account)}
              >
                <img className={styles.avatar} src={icons.avatar} alt="" />
                {/* Each account is named in its own language, whatever the current one. */}
                <span lang={account}>
                  {translate(account, 'welcome.account')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.band} />
    </main>
  )
}
