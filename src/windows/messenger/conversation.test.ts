import { describe, expect, it } from 'vitest'
import type { Messenger } from '../../content/schema'
import { answer, ask, startConversation } from './conversation'

const text = (value: string) => ({ es: value, en: value })

const messenger: Messenger = {
  header: { personalMessage: text('Hola') },
  greeting: text('Saludo'),
  start: ['a', 'b'],
  questions: [
    {
      id: 'a',
      label: text('A'),
      answer: text('Respuesta A'),
      followUps: ['c'],
    },
    { id: 'b', label: text('B'), answer: text('Respuesta B') },
    { id: 'c', label: text('C'), answer: text('Respuesta C') },
  ],
}

const t0 = new Date(2026, 10, 3, 9, 0)
const t1 = new Date(2026, 10, 3, 9, 1)

describe('conversation', () => {
  it('starts with the greeting and the start questions', () => {
    const conversation = startConversation(messenger, t0)
    expect(conversation.entries).toEqual([
      { id: 0, speaker: 'assistant', kind: 'greeting', time: t0 },
    ])
    expect(conversation.options).toEqual(['a', 'b'])
    expect(conversation.pending).toBeNull()
  })

  it('adds the question and waits for its answer, with nothing else to ask', () => {
    const asked = ask(startConversation(messenger, t0), 'a', t1)
    expect(asked.entries.at(-1)).toEqual({
      id: 1,
      speaker: 'visitor',
      kind: 'question',
      questionId: 'a',
      time: t1,
    })
    expect(asked.options).toEqual([])
    expect(asked.pending).toBe('a')
  })

  it('answers and offers the follow-up questions', () => {
    const answered = answer(
      ask(startConversation(messenger, t0), 'a', t0),
      messenger,
      t1,
    )
    expect(answered.entries.at(-1)).toEqual({
      id: 2,
      speaker: 'assistant',
      kind: 'answer',
      questionId: 'a',
      time: t1,
    })
    expect(answered.options).toEqual(['c'])
    expect(answered.pending).toBeNull()
  })

  it('offers the start questions again after an answer without follow-ups (D22)', () => {
    const answered = answer(
      ask(startConversation(messenger, t0), 'b', t0),
      messenger,
      t0,
    )
    expect(answered.options).toEqual(['a', 'b'])
  })

  it('ignores questions that are not on offer or arrive while one is pending', () => {
    const start = startConversation(messenger, t0)
    expect(ask(start, 'c', t0)).toBe(start)
    const asked = ask(start, 'a', t0)
    expect(ask(asked, 'b', t0)).toBe(asked)
  })

  it('has nothing to answer when no question is pending', () => {
    const start = startConversation(messenger, t0)
    expect(answer(start, messenger, t0)).toBe(start)
  })
})
