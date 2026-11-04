import { describe, expect, it } from 'vitest'
import { buildMailto, EMPTY_FIELDS, validateContact } from './contactForm'

const filled = {
  name: 'Ana',
  email: 'ana@example.com',
  subject: '',
  message: 'Hola',
}

describe('validateContact', () => {
  it('asks for the name, the email and the message; the subject is optional', () => {
    expect(validateContact(EMPTY_FIELDS)).toEqual({
      name: 'contact.required',
      email: 'contact.required',
      message: 'contact.required',
    })
  })

  it('treats blank text as missing', () => {
    expect(validateContact({ ...filled, name: '   ' })).toEqual({
      name: 'contact.required',
    })
  })

  it.each(['ana', 'ana@', 'ana@example', 'ana @example.com'])(
    'rejects the email "%s"',
    (email) => {
      expect(validateContact({ ...filled, email })).toEqual({
        email: 'contact.invalidEmail',
      })
    },
  )

  it('accepts a complete form', () => {
    expect(validateContact(filled)).toEqual({})
  })
})

describe('buildMailto', () => {
  it('keeps the address and encodes the subject and the body', () => {
    expect(buildMailto('ana@example.com', 'Hola & chao?', 'Línea 1')).toBe(
      'mailto:ana@example.com?subject=Hola%20%26%20chao%3F&body=L%C3%ADnea%201',
    )
  })

  it('ends body lines in CRLF', () => {
    expect(buildMailto('a@b.cl', 'x', 'uno\ndos\r\ntres')).toBe(
      'mailto:a@b.cl?subject=x&body=uno%0D%0Ados%0D%0Atres',
    )
  })

  it('encodes characters that would break the address', () => {
    expect(buildMailto('<correo>', 'x', 'y')).toBe(
      'mailto:%3Ccorreo%3E?subject=x&body=y',
    )
  })
})
