import { describe, expect, it } from 'vitest'
import type { Assistant } from '../content/schema'
import { APP_IDS } from '../os/appIds'
import {
  assistantReducer,
  balloonDuration,
  eventKey,
  initialAssistantState,
  messageText,
  type AssistantAction,
  type AssistantState,
} from './engine'

function run(...actions: AssistantAction[]): AssistantState {
  return actions.reduce(assistantReducer, initialAssistantState)
}

const opened = (app: (typeof APP_IDS)[number]): AssistantAction => ({
  type: 'notify',
  event: { type: 'windowOpened', app },
})

const idle: AssistantAction = { type: 'notify', event: { type: 'idle' } }

function types(state: AssistantState) {
  return {
    current: state.current && eventKey(state.current.event),
    queue: state.queue.map((message) => eventKey(message.event)),
  }
}

describe('assistantReducer', () => {
  it('shows one balloon at a time and queues the rest in order', () => {
    const state = run(
      { type: 'notify', event: { type: 'firstVisit' } },
      opened('about'),
      idle,
    )
    expect(types(state)).toEqual({
      current: 'firstVisit',
      queue: ['windowOpened:about', 'idle'],
    })
  })

  it('moves to the next waiting message when the balloon closes', () => {
    const queued = run(opened('about'), idle)
    const first = queued.current!.id
    const next = assistantReducer(queued, { type: 'dismiss', id: first })
    expect(types(next)).toEqual({ current: 'idle', queue: [] })

    const empty = assistantReducer(next, {
      type: 'dismiss',
      id: next.current!.id,
    })
    expect(types(empty)).toEqual({ current: null, queue: [] })
  })

  it('ignores the timer of a balloon that is no longer on screen', () => {
    const state = run(opened('about'), idle)
    expect(assistantReducer(state, { type: 'dismiss', id: 99 })).toBe(state)
  })

  it('comments each event once per session, and each window once', () => {
    const state = run(opened('about'), opened('about'), idle, idle)
    expect(types(state)).toEqual({
      current: 'windowOpened:about',
      queue: ['idle'],
    })

    const later = assistantReducer(
      assistantReducer(state, { type: 'dismiss', id: state.current!.id }),
      opened('about'),
    )
    expect(types(later)).toEqual({ current: 'idle', queue: [] })
  })

  it('keeps only the newest waiting comment of each kind', () => {
    const state = run(idle, opened('about'), opened('projects'))
    expect(types(state)).toEqual({
      current: 'idle',
      queue: ['windowOpened:projects'],
    })

    // The comment that was replaced before it showed can still be made later.
    const again = assistantReducer(state, opened('about'))
    expect(types(again).queue).toEqual(['windowOpened:about'])
  })

  it('answers Help at once, every time, and leaves the queue waiting', () => {
    const state = run(opened('about'), idle, { type: 'help' })
    expect(types(state)).toEqual({ current: 'help', queue: ['idle'] })

    const closed = assistantReducer(state, {
      type: 'dismiss',
      id: state.current!.id,
    })
    const asked = assistantReducer(closed, { type: 'help' })
    expect(types(asked)).toEqual({ current: 'help', queue: [] })
    expect(asked.current!.id).toBeGreaterThan(state.current!.id)
  })

  it('drops everything when cleared, or everything but Help', () => {
    const waiting = run(opened('about'), idle)
    expect(types(assistantReducer(waiting, { type: 'clear' }))).toEqual({
      current: null,
      queue: [],
    })

    const helping = run(opened('about'), idle, { type: 'help' })
    expect(
      types(assistantReducer(helping, { type: 'clear', keepHelp: true })),
    ).toEqual({ current: 'help', queue: [] })
    expect(
      types(assistantReducer(waiting, { type: 'clear', keepHelp: true })),
    ).toEqual({ current: null, queue: [] })

    const empty = run()
    expect(assistantReducer(empty, { type: 'clear' })).toBe(empty)
  })
})

describe('messageText', () => {
  const text = (label: string) => ({ es: `${label} es`, en: `${label} en` })
  const assistant: Assistant = {
    firstVisit: text('first'),
    windowOpened: Object.fromEntries(
      APP_IDS.map((app) => [app, text(app)]),
    ) as Assistant['windowOpened'],
    idle: text('idle'),
    allWindowsClosed: text('closed'),
    languageChanged: text('language'),
    mobileDragAttempt: text('drag'),
    help: text('help'),
  }

  it('takes each event from assistant.json, and each window from its own entry', () => {
    expect(messageText(assistant, { type: 'help' })).toEqual(text('help'))
    expect(messageText(assistant, { type: 'mobileDragAttempt' })).toEqual(
      text('drag'),
    )
    expect(
      messageText(assistant, { type: 'windowOpened', app: 'contact' }),
    ).toEqual(text('contact'))
  })
})

describe('balloonDuration', () => {
  it('gives longer texts more time, between a floor and a ceiling', () => {
    expect(balloonDuration('Hola')).toBe(8_000)
    expect(balloonDuration('x'.repeat(200))).toBe(12_000)
    expect(balloonDuration('x'.repeat(1_000))).toBe(20_000)
  })
})
