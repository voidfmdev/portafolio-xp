import type { ComponentType } from 'react'

/** Animations every assistant character supports (spec §5.7). */
export const CHARACTER_ANIMATIONS = [
  'idle',
  'greet',
  'talk',
  'think',
  'hide',
] as const

export type CharacterAnimation = (typeof CHARACTER_ANIMATIONS)[number]

/**
 * Animations that end on their own and report it through `onDone`. The others
 * (`idle` with its blinking, `talk`, `think`) loop until the host picks another.
 */
export const ONE_SHOT_ANIMATIONS: ReadonlySet<CharacterAnimation> = new Set([
  'greet',
  'hide',
])

export interface CharacterProps {
  animation: CharacterAnimation
  /**
   * Called once a one-shot animation ends. With reduced motion nothing moves, so
   * it is called right away. After `hide` the character is out of sight and the
   * host may unmount it.
   */
  onDone?: (animation: CharacterAnimation) => void
  /** Size and placement; the character fills the box it is given. */
  className?: string
}

/**
 * Contract of the assistant character: swapping it never touches the engine.
 * It is decorative, hidden from assistive technology: the balloon carries the
 * words. It honours `useReducedMotion()`, which covers both the system setting
 * and "Reduce animations" (D33).
 */
export type Character = ComponentType<CharacterProps>
