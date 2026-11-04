import type { Assistant, Text } from '../content/schema'
import type { AppId } from '../os/appIds'

/** What the desktop assistant comments on (spec §5.7, D23). */
export type AssistantEvent =
  | { type: 'firstVisit' }
  | { type: 'windowOpened'; app: AppId }
  | { type: 'idle' }
  | { type: 'allWindowsClosed' }
  | { type: 'languageChanged' }
  | { type: 'mobileDragAttempt' }
  /** Start menu › Help: asked for by the visitor, so it is never skipped or queued. */
  | { type: 'help' }

export type AssistantEventType = AssistantEvent['type']

/** Events the desktop raises on its own; Help is requested instead. */
export type AutomaticEvent = Exclude<AssistantEvent, { type: 'help' }>

export interface AssistantMessage {
  /** Grows with every message, so a timer of an older balloon cannot close a newer one. */
  id: number
  event: AssistantEvent
}

export interface AssistantState {
  /** Balloon on screen: one at a time. */
  current: AssistantMessage | null
  /** Messages waiting for the balloon, oldest first; at most one per event type. */
  queue: AssistantMessage[]
  /** Comments already made in this session (see `eventKey`); each is made once. */
  commented: string[]
  nextId: number
}

export type AssistantAction =
  | { type: 'notify'; event: AutomaticEvent }
  | { type: 'help' }
  | { type: 'dismiss'; id: number }
  /** The assistant was switched off or hidden: nothing waits any longer. */
  | { type: 'clear'; keepHelp?: boolean }

/** Spec §5.7: a comment after 60 seconds without pointer or keyboard activity. */
export const IDLE_TIMEOUT_MS = 60_000

/** Storage key saved once the first-visit comment was made; "Reset desktop" erases it. */
export const FIRST_VISIT_KEY = 'assistant-first-visit'

// A balloon closes on its own after a reading time that grows with its text.
const BALLOON_MIN_MS = 8_000
const BALLOON_MAX_MS = 20_000
const BALLOON_MS_PER_CHARACTER = 60

export const initialAssistantState: AssistantState = {
  current: null,
  queue: [],
  commented: [],
  nextId: 0,
}

/** Identifies a comment for the once-per-session rule: one per event, one per window. */
export function eventKey(event: AssistantEvent): string {
  return event.type === 'windowOpened'
    ? `windowOpened:${event.app}`
    : event.type
}

/** Text of a message, from assistant.json. */
export function messageText(assistant: Assistant, event: AssistantEvent): Text {
  return event.type === 'windowOpened'
    ? assistant.windowOpened[event.app]
    : assistant[event.type]
}

/** How long a balloon stays before closing on its own; Help stays until it is closed. */
export function balloonDuration(text: string): number {
  return Math.min(
    BALLOON_MAX_MS,
    Math.max(BALLOON_MIN_MS, text.length * BALLOON_MS_PER_CHARACTER),
  )
}

function notify(state: AssistantState, event: AutomaticEvent): AssistantState {
  const key = eventKey(event)
  if (state.commented.includes(key)) return state
  const message = { id: state.nextId, event }
  const nextId = state.nextId + 1

  if (state.current === null) {
    return {
      ...state,
      current: message,
      commented: [...state.commented, key],
      nextId,
    }
  }

  // A newer comment of the same kind replaces the waiting one (the window just
  // opened, not the one before it); the replaced comment may still be made later.
  const replaced = state.queue.find((item) => item.event.type === event.type)
  return {
    ...state,
    queue: [...state.queue.filter((item) => item !== replaced), message],
    commented: [
      ...state.commented.filter(
        (other) => !replaced || other !== eventKey(replaced.event),
      ),
      key,
    ],
    nextId,
  }
}

/** Queue of balloons: one on screen, the rest waiting in order (spec §5.7). */
export function assistantReducer(
  state: AssistantState,
  action: AssistantAction,
): AssistantState {
  switch (action.type) {
    case 'notify':
      return notify(state, action.event)

    case 'help':
      // Replaces whatever the balloon was saying; the waiting comments stay in line.
      return {
        ...state,
        current: { id: state.nextId, event: { type: 'help' } },
        nextId: state.nextId + 1,
      }

    case 'dismiss': {
      if (state.current?.id !== action.id) return state
      const [next = null, ...rest] = state.queue
      return { ...state, current: next, queue: rest }
    }

    case 'clear': {
      const current =
        action.keepHelp && state.current?.event.type === 'help'
          ? state.current
          : null
      if (current === state.current && state.queue.length === 0) return state
      return { ...state, current, queue: [] }
    }
  }
}
