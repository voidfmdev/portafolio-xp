import { act, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PREFERENCE_KEYS } from '../../app/preferences'
import type { Messenger } from '../../content/schema'
import { storage } from '../../lib/storage'
import { renderSession } from '../../os/test-utils'
import { TYPING_DELAY_MS } from './conversation'

// A conversation of its own, so these tests do not depend on the filler content.
const { messenger } = vi.hoisted(() => {
  const both = (es: string, en: string) => ({ es, en })
  const messenger: Messenger = {
    header: {
      name: 'Asistente de prueba',
      personalMessage: both('Mensaje personal', 'Personal message'),
    },
    greeting: both('Hola', 'Hi'),
    start: ['a', 'b'],
    questions: [
      {
        id: 'a',
        label: both('Pregunta A', 'Question A'),
        answer: both('Respuesta A', 'Answer A'),
        actions: [
          {
            type: 'openWindow',
            app: 'projects',
            target: 'proyecto-2',
            label: both('Ver el proyecto', 'See the project'),
          },
          {
            type: 'externalLink',
            url: 'https://example.com',
            label: both('Sitio', 'Site'),
          },
          {
            type: 'setLanguage',
            lang: 'en',
            label: both('En inglés', 'In English'),
          },
        ],
        followUps: ['c'],
      },
      {
        id: 'b',
        label: both('Pregunta B', 'Question B'),
        answer: both('Respuesta B', 'Answer B'),
      },
      {
        id: 'c',
        label: both('Pregunta C', 'Question C'),
        answer: both('Respuesta C', 'Answer C'),
      },
    ],
  }
  return { messenger }
})

vi.mock('../../content', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../content')>()
  return { content: { ...original.content, messenger } }
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

function messengerWindow(name = 'Messenger') {
  return screen.getByRole('dialog', { name })
}

function history(dialog: HTMLElement) {
  return within(dialog).getByRole('log')
}

function questions(dialog: HTMLElement) {
  const group = within(dialog).getByRole('group')
  return within(group)
    .queryAllByRole('button')
    .map((button) => button.textContent)
}

function askAndWait(dialog: HTMLElement, question: string) {
  fireEvent.click(within(dialog).getByRole('button', { name: question }))
  act(() => {
    vi.advanceTimersByTime(TYPING_DELAY_MS)
  })
}

describe('MessengerWindow', () => {
  it('greets with the contact header and the start questions', () => {
    renderSession({ initialApps: [{ id: 'messenger' }] })
    const dialog = messengerWindow()
    expect(
      within(dialog).getByRole('heading', { name: 'Asistente de prueba' }),
    ).toBeVisible()
    expect(within(dialog).getByText('Disponible')).toBeVisible()
    expect(within(dialog).getByText('Mensaje personal')).toBeVisible()
    expect(history(dialog)).toHaveTextContent(
      /Asistente de prueba \(\d{2}:\d{2}\):\s*Hola/,
    )
    expect(questions(dialog)).toEqual(['Pregunta A', 'Pregunta B'])
  })

  it('shows the question, "is typing…" and then the answer with its follow-ups', () => {
    renderSession({ initialApps: [{ id: 'messenger' }] })
    const dialog = messengerWindow()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Pregunta A' }))

    expect(history(dialog)).toHaveTextContent(
      /Tú \(\d{2}:\d{2}\):\s*Pregunta A/,
    )
    expect(
      within(dialog).getByText('Asistente de prueba está escribiendo…'),
    ).toBeVisible()
    expect(questions(dialog)).toEqual([])
    // The buttons went away; the focus waits on their group.
    expect(within(dialog).getByRole('group')).toHaveFocus()

    act(() => {
      vi.advanceTimersByTime(TYPING_DELAY_MS)
    })
    expect(history(dialog)).toHaveTextContent('Respuesta A')
    expect(within(dialog).queryByText(/está escribiendo/)).toBeNull()
    expect(questions(dialog)).toEqual(['Pregunta C'])
  })

  it('offers the start questions again after an answer without follow-ups (D22)', () => {
    renderSession({ initialApps: [{ id: 'messenger' }] })
    const dialog = messengerWindow()
    askAndWait(dialog, 'Pregunta A')
    askAndWait(dialog, 'Pregunta C')
    expect(history(dialog)).toHaveTextContent('Respuesta C')
    expect(questions(dialog)).toEqual(['Pregunta A', 'Pregunta B'])
  })

  it('answers right away when motion is reduced', () => {
    storage.set(PREFERENCE_KEYS.reduceMotion, 'true')
    renderSession({ initialApps: [{ id: 'messenger' }] })
    const dialog = messengerWindow()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Pregunta B' }))
    expect(history(dialog)).toHaveTextContent('Respuesta B')
    expect(within(dialog).queryByText(/está escribiendo/)).toBeNull()
  })

  it('opens a window on the item an answer names', () => {
    renderSession({ initialApps: [{ id: 'messenger' }] })
    askAndWait(messengerWindow(), 'Pregunta A')
    fireEvent.click(screen.getByRole('button', { name: 'Ver el proyecto' }))

    const projects = screen.getByRole('dialog', { name: 'Proyectos' })
    expect(projects).toHaveFocus()
    expect(
      within(within(projects).getByRole('article')).getByRole('heading', {
        level: 3,
      }),
    ).toHaveTextContent('[RELLENO] Proyecto 2')
    expect(window.location.hash).toBe('#/proyectos/proyecto-2')
  })

  it('links to other sites in a new tab', () => {
    renderSession({ initialApps: [{ id: 'messenger' }] })
    askAndWait(messengerWindow(), 'Pregunta A')
    const link = screen.getByRole('link', { name: 'Sitio' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('switches the language, and the whole conversation follows', () => {
    renderSession({ initialApps: [{ id: 'messenger' }] })
    askAndWait(messengerWindow(), 'Pregunta A')
    fireEvent.click(screen.getByRole('button', { name: 'En inglés' }))

    const dialog = messengerWindow('Messenger')
    expect(document.documentElement.lang).toBe('en')
    expect(within(dialog).getByText('Available')).toBeVisible()
    expect(history(dialog)).toHaveTextContent(
      /You \(\d{1,2}:\d{2} [AP]M\):\s*Question A/,
    )
    expect(history(dialog)).toHaveTextContent('Answer A')
  })
})
