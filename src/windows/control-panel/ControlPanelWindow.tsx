import { useEffect, useId, useRef, useState } from 'react'
import { usePreferences } from '../../app/usePreferences'
import { icons } from '../../icons'
import { LANGS } from '../../i18n/locales'
import { translate } from '../../i18n/messages'
import { useI18n } from '../../i18n/useI18n'
import { MessageDialog } from '../../os/window-manager/MessageDialog'
import styles from './ControlPanelWindow.module.css'

/** Language, assistant, reduced motion and reset (spec §5.10). */
export function ControlPanelWindow() {
  const { t, lang, setLang } = useI18n()
  const { assistantEnabled, reduceMotion, setPreference, reset } =
    usePreferences()
  const id = useId()
  const [confirming, setConfirming] = useState(false)
  const resetRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef(false)

  // The reset button can only take the focus back once the panel is no longer inert.
  useEffect(() => {
    if (confirming || !returnFocus.current) return
    returnFocus.current = false
    resetRef.current?.focus()
  }, [confirming])

  function closeDialog() {
    returnFocus.current = true
    setConfirming(false)
  }

  return (
    <div className={styles.controlPanel}>
      <div className={styles.settings} inert={confirming}>
        <fieldset className={styles.group}>
          <legend>{t('controlPanel.language')}</legend>
          {LANGS.map((option) => (
            <div key={option} className="field-row">
              <input
                id={`${id}-lang-${option}`}
                type="radio"
                name={`${id}-lang`}
                checked={lang === option}
                onChange={() => setLang(option)}
              />
              {/* Each language is named in itself, and read in its own voice. */}
              <label htmlFor={`${id}-lang-${option}`} lang={option}>
                {translate(option, 'language.name')}
              </label>
            </div>
          ))}
        </fieldset>

        <fieldset className={styles.group}>
          <legend>{t('controlPanel.preferences')}</legend>
          <div className="field-row">
            <input
              id={`${id}-assistant`}
              type="checkbox"
              checked={assistantEnabled}
              onChange={(event) =>
                setPreference('assistantEnabled', event.target.checked)
              }
            />
            <label htmlFor={`${id}-assistant`}>
              {t('controlPanel.assistant')}
            </label>
          </div>
          <div className="field-row">
            <input
              id={`${id}-motion`}
              type="checkbox"
              checked={reduceMotion}
              onChange={(event) =>
                setPreference('reduceMotion', event.target.checked)
              }
            />
            <label htmlFor={`${id}-motion`}>
              {t('controlPanel.reduceMotion')}
            </label>
          </div>
        </fieldset>

        <div className={styles.actions}>
          <button
            ref={resetRef}
            type="button"
            onClick={() => setConfirming(true)}
          >
            {t('controlPanel.reset')}
          </button>
        </div>
      </div>

      {confirming && (
        <MessageDialog
          title={t('controlPanel.reset')}
          icon={icons.warning}
          buttons={[
            {
              label: t('dialog.ok'),
              onClick: () => {
                reset()
                closeDialog()
              },
            },
            { label: t('dialog.cancel'), onClick: closeDialog },
          ]}
          // Erasing is not undone: Enter right away cancels.
          initialFocus={1}
          onCancel={closeDialog}
        >
          {t('controlPanel.resetConfirm')}
        </MessageDialog>
      )}
    </div>
  )
}
