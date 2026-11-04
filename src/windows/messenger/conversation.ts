import type { Messenger } from '../../content/schema'

/** How long "is typing…" shows before an answer, unless motion is reduced. */
export const TYPING_DELAY_MS = 900

/**
 * One message of the history. It keeps the question id, not the text, so the
 * whole conversation follows a change of language.
 */
export type Entry =
  | { id: number; speaker: 'assistant'; kind: 'greeting'; time: Date }
  | {
      id: number
      speaker: 'visitor'
      kind: 'question'
      questionId: string
      time: Date
    }
  | {
      id: number
      speaker: 'assistant'
      kind: 'answer'
      questionId: string
      time: Date
    }

export interface Conversation {
  entries: readonly Entry[]
  /** Question ids the visitor can ask now; empty while an answer is on its way. */
  options: readonly string[]
  /** Question waiting for its answer ("is typing…"). */
  pending: string | null
}

/** The greeting, then the `start` questions (spec §5.6). */
export function startConversation(
  messenger: Messenger,
  now: Date,
): Conversation {
  return {
    entries: [{ id: 0, speaker: 'assistant', kind: 'greeting', time: now }],
    options: messenger.start,
    pending: null,
  }
}

/** The visitor asks one of the questions on offer. */
export function ask(
  conversation: Conversation,
  questionId: string,
  now: Date,
): Conversation {
  if (conversation.pending !== null) return conversation
  if (!conversation.options.includes(questionId)) return conversation
  const { entries } = conversation
  return {
    entries: [
      ...entries,
      {
        id: entries.length,
        speaker: 'visitor',
        kind: 'question',
        questionId,
        time: now,
      },
    ],
    options: [],
    pending: questionId,
  }
}

/**
 * The answer to the pending question arrives, with its follow-up questions; an
 * answer without follow-ups offers the `start` questions again (D22).
 */
export function answer(
  conversation: Conversation,
  messenger: Messenger,
  now: Date,
): Conversation {
  const questionId = conversation.pending
  if (questionId === null) return conversation
  const question = messenger.questions.find((item) => item.id === questionId)
  const { entries } = conversation
  return {
    entries: [
      ...entries,
      {
        id: entries.length,
        speaker: 'assistant',
        kind: 'answer',
        questionId,
        time: now,
      },
    ],
    options: question?.followUps ?? messenger.start,
    pending: null,
  }
}
