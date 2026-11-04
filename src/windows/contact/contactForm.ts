import type { MessageKey } from '../../i18n/messages'

export interface ContactFields {
  name: string
  email: string
  subject: string
  message: string
}

export type ContactErrors = Partial<Record<keyof ContactFields, MessageKey>>

export const EMPTY_FIELDS: ContactFields = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

// Basic shape only (spec §5.5): the visitor's mail app does the real check.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Errors to show, by field, in the order of the form; empty when it can be sent. */
export function validateContact(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {}
  if (!fields.name.trim()) errors.name = 'contact.required'
  if (!fields.email.trim()) errors.email = 'contact.required'
  else if (!EMAIL.test(fields.email.trim()))
    errors.email = 'contact.invalidEmail'
  if (!fields.message.trim()) errors.message = 'contact.required'
  return errors
}

/**
 * `mailto:` link with the subject and body filled in (RFC 6068): the address
 * keeps its `@`, everything else is percent-encoded and lines end in CRLF.
 */
export function buildMailto(to: string, subject: string, body: string): string {
  const encode = (value: string) =>
    encodeURIComponent(value.replace(/\r?\n/g, '\r\n'))
  const address = encodeURIComponent(to).replace(/%40/g, '@')
  return `mailto:${address}?subject=${encode(subject)}&body=${encode(body)}`
}
