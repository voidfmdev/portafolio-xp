import { act, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PREFERENCE_KEYS } from '../app/preferences'
import type { Assistant } from '../content/schema'
import { storage } from '../lib/storage'
import { renderSession } from '../os/test-utils'
import { balloonDuration, FIRST_VISIT_KEY, IDLE_TIMEOUT_MS } from './engine'

// Comments of their own, so these tests do not depend on the filler content.
const { assistant } = vi.hoisted(() => {
  const both = (es: string, en: string) => ({ es, en })
  const assistant: Assistant = {
    firstVisit: both('Bienvenida', 'Welcome'),
    windowOpened: {
      about: both('Abriste Sobre mí', 'You opened About me'),
      projects: both('Abriste Proyectos', 'You opened Projects'),
      skills: both('Abriste Habilidades', 'You opened Skills'),
      experience: both('Abriste Experiencia', 'You opened Experience'),
      contact: both('Abriste Contacto', 'You opened Contact'),
      messenger: both('Abriste Messenger', 'You opened Messenger'),
      'recycle-bin': both('Abriste la Papelera', 'You opened the Bin'),
      'control-panel': both('Abriste el Panel', 'You opened the Panel'),
    },
    idle: both('¿Sigues ahí?', 'Still there?'),
    allWindowsClosed: both('Cerraste todo', 'All closed'),
    languageChanged: both('Cambiaste al español', 'Switched to English'),
    mobileDragAttempt: both('No se arrastra', 'It does not drag'),
    help: both('Así se usa', 'How to use it'),
  }
  return { assistant }
})

vi.mock('../content', async (importOriginal) => {
  const original = await importOriginal<typeof import('../content')>()
  return { content: { ...original.content, assistant } }
})

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', '/')
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  window.history.replaceState(null, '', '/')
})

/** Later visits: no first-visit greeting in the way. */
function returningVisitor() {
  storage.set(FIRST_VISIT_KEY, 'true')
}

/** Floppy leaves at once, so its presence can be checked right after. */
function reduceMotion() {
  storage.set(PREFERENCE_KEYS.reduceMotion, 'true')
}

function balloon() {
  return screen.queryByRole('region', { name: 'Floppy' })
}

function corner() {
  return screen.queryByRole('complementary', { name: 'Asistente' })
}

function closeBalloon() {
  fireEvent.click(
    within(balloon()!).getByRole('button', { name: 'Cerrar mensaje' }),
  )
}

function trayButton(name: 'Mostrar asistente' | 'Ocultar asistente') {
  return screen.getByRole('button', { name })
}

function openFromDesktop(name: string) {
  const icon = screen.getByRole('button', { name })
  fireEvent.click(icon)
  fireEvent.doubleClick(icon)
}

describe('Assistant', () => {
  it('greets on the first visit only, and stays in its corner afterwards', () => {
    const { unmount } = renderSession()
    expect(corner()).toBeVisible()
    expect(balloon()).toHaveTextContent('Bienvenida')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Floppy dice: Bienvenida',
    )
    unmount()

    renderSession()
    expect(corner()).toBeVisible()
    expect(balloon()).toBeNull()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('shows one balloon at a time, in order', () => {
    renderSession({ initialApps: [{ id: 'about' }] })
    expect(balloon()).toHaveTextContent('Bienvenida')
    closeBalloon()
    expect(balloon()).toHaveTextContent('Abriste Sobre mí')
    closeBalloon()
    expect(balloon()).toBeNull()
  })

  it('comments each window once per session, and when the last one closes', () => {
    returningVisitor()
    renderSession()
    openFromDesktop('Proyectos')
    expect(balloon()).toHaveTextContent('Abriste Proyectos')
    closeBalloon()

    const dialog = screen.getByRole('dialog', { name: 'Proyectos' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar' }))
    expect(balloon()).toHaveTextContent('Cerraste todo')
    closeBalloon()

    openFromDesktop('Proyectos')
    expect(balloon()).toBeNull()
  })

  it('closes a balloon on its own, but not while the pointer is on it', () => {
    returningVisitor()
    renderSession({ initialApps: [{ id: 'about' }] })
    const text = 'Abriste Sobre mí'

    fireEvent.pointerEnter(balloon()!)
    act(() => vi.advanceTimersByTime(balloonDuration(text) * 2))
    expect(balloon()).toHaveTextContent(text)

    fireEvent.pointerLeave(balloon()!)
    act(() => vi.advanceTimersByTime(balloonDuration(text)))
    expect(balloon()).toBeNull()
  })

  it('closes with Esc and gives the focus to the tray button', () => {
    returningVisitor()
    renderSession({ initialApps: [{ id: 'about' }] })
    const close = within(balloon()!).getByRole('button', {
      name: 'Cerrar mensaje',
    })
    close.focus()
    fireEvent.keyDown(close, { key: 'Escape' })
    expect(balloon()).toBeNull()
    expect(trayButton('Ocultar asistente')).toHaveFocus()
    // Esc closed the balloon only, not the window.
    expect(screen.getByRole('dialog', { name: 'Sobre mí' })).toBeVisible()
  })

  it('"Don\'t show again" switches it off for good, as the Control Panel shows', () => {
    reduceMotion()
    renderSession({ initialApps: [{ id: 'control-panel' }] })
    const dontShow = within(balloon()!).getByRole('button', {
      name: 'No mostrar más',
    })
    dontShow.focus()
    fireEvent.click(dontShow)

    expect(balloon()).toBeNull()
    expect(corner()).toBeNull()
    expect(trayButton('Mostrar asistente')).toHaveFocus()
    expect(storage.get(PREFERENCE_KEYS.assistantEnabled)).toBe('false')
    const panel = screen.getByRole('dialog', { name: 'Panel de control' })
    expect(
      within(panel).getByRole('checkbox', { name: 'Asistente activado' }),
    ).not.toBeChecked()
  })

  it('says nothing while switched off, and comes back from the tray', () => {
    storage.set(PREFERENCE_KEYS.assistantEnabled, 'false')
    renderSession({ initialApps: [{ id: 'about' }] })
    expect(corner()).toBeNull()
    expect(balloon()).toBeNull()
    openFromDesktop('Proyectos')
    expect(balloon()).toBeNull()

    fireEvent.click(trayButton('Mostrar asistente'))
    expect(corner()).toBeVisible()
    expect(storage.get(PREFERENCE_KEYS.assistantEnabled)).toBe('true')
    openFromDesktop('Habilidades')
    expect(balloon()).toHaveTextContent('Abriste Habilidades')
  })

  it('switches on and off from the Control Panel', () => {
    reduceMotion()
    returningVisitor()
    renderSession({ initialApps: [{ id: 'control-panel' }] })
    closeBalloon()
    const panel = screen.getByRole('dialog', { name: 'Panel de control' })
    const enabled = within(panel).getByRole('checkbox', {
      name: 'Asistente activado',
    })

    fireEvent.click(enabled)
    expect(corner()).toBeNull()
    fireEvent.click(enabled)
    expect(corner()).toBeVisible()
  })

  it('hides from the tray for this session only, dropping what was waiting', () => {
    reduceMotion()
    renderSession({ initialApps: [{ id: 'about' }] })
    fireEvent.click(trayButton('Ocultar asistente'))
    expect(corner()).toBeNull()
    expect(storage.get(PREFERENCE_KEYS.assistantEnabled)).toBeNull()

    openFromDesktop('Proyectos')
    fireEvent.click(trayButton('Mostrar asistente'))
    expect(corner()).toBeVisible()
    expect(balloon()).toBeNull()
  })

  it('answers Help even when hidden, without a timer, and leaves again afterwards', () => {
    reduceMotion()
    returningVisitor()
    renderSession()
    fireEvent.click(trayButton('Ocultar asistente'))

    fireEvent.click(screen.getByRole('button', { name: 'Inicio' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Ayuda' }))
    expect(balloon()).toHaveTextContent('Así se usa')
    expect(
      within(balloon()!).queryByRole('button', { name: 'No mostrar más' }),
    ).toBeNull()
    expect(trayButton('Ocultar asistente')).toBeVisible()

    act(() => vi.advanceTimersByTime(IDLE_TIMEOUT_MS * 2))
    expect(balloon()).toHaveTextContent('Así se usa')

    closeBalloon()
    expect(corner()).toBeNull()
    expect(trayButton('Mostrar asistente')).toBeVisible()
  })

  it('comments after a minute without activity, once per session', () => {
    returningVisitor()
    renderSession()
    act(() => vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 1_000))
    fireEvent.pointerMove(document)
    act(() => vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 1_000))
    expect(balloon()).toBeNull()

    act(() => vi.advanceTimersByTime(1_000))
    expect(balloon()).toHaveTextContent('¿Sigues ahí?')
    closeBalloon()

    fireEvent.keyDown(document, { key: 'a' })
    act(() => vi.advanceTimersByTime(IDLE_TIMEOUT_MS * 2))
    expect(balloon()).toBeNull()
  })

  it('comments a language change in the new language', () => {
    returningVisitor()
    renderSession()
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Idioma: Español. Cambiar a English',
      }),
    )
    expect(screen.getByRole('region', { name: 'Floppy' })).toHaveTextContent(
      'Switched to English',
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Floppy says: Switched to English',
    )
  })

  it('comments when a finger tries to drag a maximized window', () => {
    returningVisitor()
    renderSession({ initialApps: [{ id: 'about' }] })
    closeBalloon()
    const dialog = screen.getByRole('dialog', { name: 'Sobre mí' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Maximizar' }))
    const titleBar = within(dialog).getByRole('heading', {
      level: 2,
    }).parentElement!
    const touch = { pointerId: 1, pointerType: 'touch', button: 0 }

    fireEvent.pointerDown(titleBar, { ...touch, clientX: 100, clientY: 10 })
    fireEvent.pointerMove(titleBar, { ...touch, clientX: 104, clientY: 14 })
    expect(balloon()).toBeNull()

    fireEvent.pointerMove(titleBar, { ...touch, clientX: 100, clientY: 60 })
    expect(balloon()).toHaveTextContent('No se arrastra')
  })

  it('does not comment a mouse drag on a maximized window', () => {
    returningVisitor()
    renderSession({ initialApps: [{ id: 'about' }] })
    closeBalloon()
    const dialog = screen.getByRole('dialog', { name: 'Sobre mí' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Maximizar' }))
    const titleBar = within(dialog).getByRole('heading', {
      level: 2,
    }).parentElement!
    const mouse = { pointerId: 1, pointerType: 'mouse', button: 0 }

    fireEvent.pointerDown(titleBar, { ...mouse, clientX: 100, clientY: 10 })
    fireEvent.pointerMove(titleBar, { ...mouse, clientX: 100, clientY: 200 })
    expect(balloon()).toBeNull()
  })

  it('plays its hide animation before leaving', () => {
    returningVisitor()
    const { container } = renderSession()
    const character = container.querySelector('svg[data-animation]')!
    fireEvent.click(trayButton('Ocultar asistente'))
    expect(character).toHaveAttribute('data-animation', 'hide')
    expect(corner()).toBeVisible()

    fireEvent.animationEnd(character.firstElementChild!)
    expect(corner()).toBeNull()
  })

  it('greets, talks while its balloon is up, and rests once it closes', () => {
    const { container } = renderSession()
    const character = container.querySelector('svg[data-animation]')!
    expect(character).toHaveAttribute('data-animation', 'greet')

    fireEvent.animationEnd(character.firstElementChild!)
    expect(character).toHaveAttribute('data-animation', 'talk')

    closeBalloon()
    expect(character).toHaveAttribute('data-animation', 'idle')
  })
})
