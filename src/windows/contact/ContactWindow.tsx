import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { content } from '../../content'
import { appIcons, icons, linkIcon } from '../../icons'
import { useI18n } from '../../i18n/useI18n'
import { MessageDialog } from '../../os/window-manager/MessageDialog'
import {
  buildMailto,
  EMPTY_FIELDS,
  validateContact,
  type ContactFields,
} from './contactForm'
import styles from './ContactWindow.module.css'

type Field = keyof ContactFields
type FieldElement = HTMLInputElement | HTMLTextAreaElement

/** Fields above the message, in this order; `type` and autocomplete of each. */
const HEADER_FIELDS: readonly {
  field: Exclude<Field, 'message'>
  type: 'text' | 'email'
  autoComplete?: string
  required: boolean
}[] = [
  { field: 'name', type: 'text', autoComplete: 'name', required: true },
  { field: 'email', type: 'email', autoComplete: 'email', required: true },
  { field: 'subject', type: 'text', required: false },
]

const FIELD_ORDER: readonly Field[] = ['name', 'email', 'subject', 'message']

/**
 * "New message" form (spec §5.5): validates in the browser, then tries to open
 * the visitor's mail app through `mailto:`. The browser cannot tell whether it
 * opened, so the XP message box gives the address to write to instead.
 */
export function ContactWindow() {
  const { t, localize } = useI18n()
  const id = useId()
  const [fields, setFields] = useState(EMPTY_FIELDS)
  const [submitted, setSubmitted] = useState(false)
  const [ready, setReady] = useState(false)
  const sendRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef(false)
  // Errors show after the first try and then follow every change.
  const errors = submitted ? validateContact(fields) : {}

  // The Send button can only take the focus back once the form is no longer inert.
  useEffect(() => {
    if (ready || !returnFocus.current) return
    returnFocus.current = false
    sendRef.current?.focus()
  }, [ready])

  const fieldId = (field: Field) => `${id}-${field}`

  const update = (field: Field) => (event: ChangeEvent<FieldElement>) => {
    const { value } = event.target
    setFields((current) => ({ ...current, [field]: value }))
  }

  const describe = (field: Field) => ({
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${fieldId(field)}-error` : undefined,
  })

  const errorFor = (field: Field) => {
    const error = errors[field]
    return error ? (
      <p id={`${fieldId(field)}-error`} className={styles.error}>
        {t(error)}
      </p>
    ) : null
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    const found = validateContact(fields)
    const invalid = FIELD_ORDER.find((field) => found[field])
    if (invalid) {
      document.getElementById(fieldId(invalid))?.focus()
      return
    }
    const subject = fields.subject.trim() || t('contact.defaultSubject')
    const body = t('contact.mailBody', {
      message: fields.message.trim(),
      name: fields.name.trim(),
      email: fields.email.trim(),
    })
    window.open(buildMailto(content.contact.email, subject, body), '_self')
    setReady(true)
  }

  function closeDialog() {
    returnFocus.current = true
    setReady(false)
  }

  return (
    <div className={styles.contact}>
      <form
        className={styles.form}
        noValidate
        aria-labelledby={`${id}-heading`}
        inert={ready}
        onSubmit={onSubmit}
      >
        <h3 id={`${id}-heading`} className={styles.heading}>
          <img className={styles.headingIcon} src={appIcons.contact} alt="" />
          {t('contact.heading')}
        </h3>

        <div className={styles.fields}>
          <label htmlFor={`${id}-to`}>{t('contact.to')}</label>
          <input
            id={`${id}-to`}
            className={styles.to}
            type="text"
            value={content.profile.alias}
            readOnly
          />

          {HEADER_FIELDS.map(({ field, type, autoComplete, required }) => (
            <div key={field} className={styles.row}>
              <label htmlFor={fieldId(field)}>{t(`contact.${field}`)}</label>
              <div className={styles.control}>
                <input
                  id={fieldId(field)}
                  type={type}
                  autoComplete={autoComplete}
                  required={required}
                  value={fields[field]}
                  onChange={update(field)}
                  {...describe(field)}
                />
                {errorFor(field)}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.message}>
          <label htmlFor={fieldId('message')}>{t('contact.message')}</label>
          <textarea
            id={fieldId('message')}
            className={styles.textarea}
            required
            value={fields.message}
            onChange={update('message')}
            {...describe('message')}
          />
          {errorFor('message')}
        </div>

        <div className={styles.footer}>
          <nav className={styles.links} aria-labelledby={`${id}-links`}>
            <span id={`${id}-links`} className={styles.linksLabel}>
              {t('contact.otherLinks')}
            </span>
            <ul className={styles.linkList}>
              {content.contact.links.map((link) => (
                <li key={link.id}>
                  <a
                    className={styles.link}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      className={styles.linkIcon}
                      src={linkIcon(link.icon)}
                      alt=""
                    />
                    {localize(link.label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <button ref={sendRef} type="submit" className={styles.send}>
            <img className={styles.sendIcon} src={appIcons.contact} alt="" />
            {t('contact.send')}
          </button>
        </div>
      </form>

      {ready && (
        <MessageDialog
          title={t('contact.readyTitle')}
          icon={icons.info}
          buttons={[{ label: t('dialog.ok'), onClick: closeDialog }]}
          onCancel={closeDialog}
        >
          {t('contact.readyBody', { email: content.contact.email })}
        </MessageDialog>
      )}
    </div>
  )
}
