import { createContext, type RefObject } from 'react'
import type { AssistantMessage, AutomaticEvent } from './engine'

export interface AssistantValue {
  /** The character is on the desktop: switched on and not hidden, or answering Help. */
  visible: boolean
  /** Balloon on screen, if any. */
  message: AssistantMessage | null
  /** Something happened on the desktop; it is commented only when the assistant may speak. */
  notify: (event: AutomaticEvent) => void
  /** Start menu › Help (D23): shows the instructions even when hidden or switched off. */
  help: () => void
  /** Closes a balloon; the next one waiting takes its place. */
  dismiss: (id: number) => void
  /** "Don't show again": switches the assistant off, as the Control Panel does. */
  turnOff: () => void
  /** Tray button: hides it for this session, or brings it back (switching it on again). */
  toggle: () => void
  /** The tray button, which takes the focus when a focused balloon goes away. */
  trayButtonRef: RefObject<HTMLButtonElement | null>
}

export const AssistantContext = createContext<AssistantValue | null>(null)
