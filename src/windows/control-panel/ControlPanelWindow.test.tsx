import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PREFERENCE_KEYS, REDUCE_MOTION_ATTRIBUTE } from '../../app/preferences'
import { LANG_STORAGE_KEY } from '../../i18n/initialLang'
import { storage } from '../../lib/storage'
import { renderSession } from '../../os/test-utils'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  document.documentElement.removeAttribute(REDUCE_MOTION_ATTRIBUTE)
})

function controlPanel(name = 'Panel de control') {
  return screen.getByRole('dialog', { name })
}

describe('ControlPanelWindow', () => {
  it('switches the language of the whole desktop', () => {
    renderSession({ initialApps: [{ id: 'control-panel' }] })
    const dialog = controlPanel()
    const language = within(dialog).getByRole('group', { name: 'Idioma' })
    expect(
      within(language).getByRole('radio', { name: 'Español' }),
    ).toBeChecked()

    fireEvent.click(within(language).getByRole('radio', { name: 'English' }))

    expect(controlPanel('Control Panel')).toBeVisible()
    expect(document.documentElement.lang).toBe('en')
    expect(storage.get(LANG_STORAGE_KEY)).toBe('en')
  })

  it('turns the assistant off and saves it', () => {
    renderSession({ initialApps: [{ id: 'control-panel' }] })
    const assistant = within(controlPanel()).getByRole('checkbox', {
      name: 'Asistente activado',
    })
    expect(assistant).toBeChecked()

    fireEvent.click(assistant)
    expect(assistant).not.toBeChecked()
    expect(storage.get(PREFERENCE_KEYS.assistantEnabled)).toBe('false')
  })

  it('reduces the animations of the whole page and saves it', () => {
    renderSession({ initialApps: [{ id: 'control-panel' }] })
    const motion = within(controlPanel()).getByRole('checkbox', {
      name: 'Reducir animaciones',
    })
    expect(motion).not.toBeChecked()

    fireEvent.click(motion)
    expect(document.documentElement).toHaveAttribute(REDUCE_MOTION_ATTRIBUTE)
    expect(storage.get(PREFERENCE_KEYS.reduceMotion)).toBe('true')

    fireEvent.click(motion)
    expect(document.documentElement).not.toHaveAttribute(
      REDUCE_MOTION_ATTRIBUTE,
    )
  })

  it('asks before resetting, with Cancel focused, and changes nothing when cancelled', () => {
    renderSession({ initialApps: [{ id: 'control-panel' }] })
    const dialog = controlPanel()
    const reset = within(dialog).getByRole('button', {
      name: 'Restablecer escritorio',
    })
    fireEvent.click(reset)

    const confirm = within(dialog).getByRole('alertdialog', {
      name: 'Restablecer escritorio',
    })
    expect(confirm).toHaveAccessibleDescription(
      'Se borrarán las preferencias guardadas en este navegador. ¿Continuar?',
    )
    const cancel = within(confirm).getByRole('button', { name: 'Cancelar' })
    expect(cancel).toHaveFocus()

    fireEvent.click(cancel)
    expect(within(dialog).queryByRole('alertdialog')).toBeNull()
    expect(reset).toHaveFocus()
    expect(storage.get(LANG_STORAGE_KEY)).toBe('es')
  })

  it('resets: forgets what was saved and goes back to the defaults', () => {
    renderSession({ initialApps: [{ id: 'control-panel' }] })
    const dialog = controlPanel()
    const motion = within(dialog).getByRole('checkbox', {
      name: 'Reducir animaciones',
    })
    fireEvent.click(motion)

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Restablecer escritorio' }),
    )
    fireEvent.click(
      within(within(dialog).getByRole('alertdialog')).getByRole('button', {
        name: 'Aceptar',
      }),
    )

    expect(storage.get(LANG_STORAGE_KEY)).toBeNull()
    expect(storage.get(PREFERENCE_KEYS.reduceMotion)).toBeNull()
    expect(motion).not.toBeChecked()
    expect(document.documentElement).not.toHaveAttribute(
      REDUCE_MOTION_ATTRIBUTE,
    )
    // The language in use stays until the next visit.
    expect(document.documentElement.lang).toBe('es')
  })
})
