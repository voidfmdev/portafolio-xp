import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderSession } from '../../os/test-utils'
import { buildMailto } from './contactForm'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  window.history.replaceState(null, '', '/')
  vi.restoreAllMocks()
})

function contactWindow() {
  renderSession({ initialApps: [{ id: 'contact' }] })
  return screen.getByRole('dialog', { name: 'Contacto' })
}

function fill(dialog: HTMLElement, label: string, value: string) {
  fireEvent.change(within(dialog).getByLabelText(label), {
    target: { value },
  })
}

function fillValid(dialog: HTMLElement) {
  fill(dialog, 'Nombre', 'Ana')
  fill(dialog, 'Correo electrónico', 'ana@example.com')
  fill(dialog, 'Mensaje', 'Hola\nmundo')
}

describe('ContactWindow', () => {
  it('writes to the alias, which cannot be edited', () => {
    const dialog = contactWindow()
    const to = within(dialog).getByLabelText('Para')
    expect(to).toHaveValue('<alias>')
    expect(to).toHaveAttribute('readonly')
  })

  it('lists the other contact links', () => {
    const dialog = contactWindow()
    const links = within(dialog).getByRole('navigation', {
      name: 'Otras formas de contacto',
    })
    expect(within(links).getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/<usuario-github>',
    )
    expect(
      within(links).getByRole('link', { name: 'LinkedIn' }),
    ).toHaveAttribute('target', '_blank')
  })

  it('marks the missing fields and focuses the first one', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const dialog = contactWindow()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar' }))

    const name = within(dialog).getByLabelText('Nombre')
    expect(name).toHaveFocus()
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription('Completa este campo.')
    expect(within(dialog).getByLabelText('Mensaje')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(
      within(dialog).getByLabelText('Asunto (opcional)'),
    ).not.toHaveAttribute('aria-invalid')
    expect(open).not.toHaveBeenCalled()
  })

  it('rejects an invalid email and clears the error once fixed', () => {
    const dialog = contactWindow()
    fillValid(dialog)
    fill(dialog, 'Correo electrónico', 'ana')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar' }))

    const email = within(dialog).getByLabelText('Correo electrónico')
    expect(email).toHaveFocus()
    expect(email).toHaveAccessibleDescription(
      'Escribe un correo electrónico válido.',
    )

    fill(dialog, 'Correo electrónico', 'ana@example.com')
    expect(email).not.toHaveAttribute('aria-invalid')
  })

  it('tries to open the mail app and gives the address in a message box', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const dialog = contactWindow()
    fillValid(dialog)
    const send = within(dialog).getByRole('button', { name: 'Enviar' })
    fireEvent.click(send)

    expect(open).toHaveBeenCalledWith(
      buildMailto(
        '<correo>',
        'Mensaje desde el portafolio',
        'Hola\nmundo\n\nAna\nana@example.com',
      ),
      '_self',
    )
    const message = within(dialog).getByRole('alertdialog', {
      name: 'Mensaje listo',
    })
    expect(message).toHaveAccessibleDescription(
      'Intentamos abrir tu programa de correo. Si no se abrió, escribe a <correo>.',
    )
    expect(
      within(message).getByRole('button', { name: 'Aceptar' }),
    ).toHaveFocus()
    // The form behind the message box cannot be used meanwhile.
    expect(send.closest('form')).toHaveAttribute('inert')

    fireEvent.click(within(message).getByRole('button', { name: 'Aceptar' }))
    expect(within(dialog).queryByRole('alertdialog')).toBeNull()
    expect(send).toHaveFocus()
  })

  it('gives the address in English too', () => {
    vi.spyOn(window, 'open').mockReturnValue(null)
    renderSession({ lang: 'en', initialApps: [{ id: 'contact' }] })
    const dialog = screen.getByRole('dialog', { name: 'Contact' })
    fill(dialog, 'Name', 'Ana')
    fill(dialog, 'Email', 'ana@example.com')
    fill(dialog, 'Message', 'Hello')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Send' }))

    expect(
      within(dialog).getByRole('alertdialog', { name: 'Message ready' }),
    ).toHaveAccessibleDescription(
      "We tried to open your email app. If it didn't open, write to <correo>.",
    )
  })

  it('uses the subject when there is one', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const dialog = contactWindow()
    fillValid(dialog)
    fill(dialog, 'Asunto (opcional)', 'Oferta')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar' }))
    expect(open.mock.calls[0][0]).toContain('?subject=Oferta&')
  })

  it('closes the message box with Esc and keeps the window open', () => {
    vi.spyOn(window, 'open').mockReturnValue(null)
    const dialog = contactWindow()
    fillValid(dialog)
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar' }))
    fireEvent.keyDown(within(dialog).getByRole('alertdialog'), {
      key: 'Escape',
    })

    expect(within(dialog).queryByRole('alertdialog')).toBeNull()
    expect(screen.getByRole('dialog', { name: 'Contacto' })).toBeVisible()
  })
})
