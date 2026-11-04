import { useEffect, useRef, useState } from 'react'
import { content } from '../content'
import { useI18n } from '../i18n/useI18n'
import { AssistantCharacter } from './assistantCharacter'
import { Balloon } from './Balloon'
import { ONE_SHOT_ANIMATIONS, type CharacterAnimation } from './Character'
import { balloonDuration, messageText, type AssistantEventType } from './engine'
import { useAssistant } from './useAssistant'
import styles from './Assistant.module.css'

/** How the character reacts to each message, before going back to idle. */
const REACTIONS: Record<AssistantEventType, readonly CharacterAnimation[]> = {
  firstVisit: ['greet', 'talk'],
  idle: ['greet', 'talk'],
  help: ['think', 'talk'],
  mobileDragAttempt: ['think', 'talk'],
  windowOpened: ['talk'],
  allWindowsClosed: ['talk'],
  languageChanged: ['talk'],
}

/** Coming onto the desktop with nothing to say yet. */
const ARRIVAL: readonly CharacterAnimation[] = ['greet']

/** How long a looping animation (talk, think) lasts within a reaction. */
const BEAT_MS = 2_400

interface Reaction {
  steps: readonly CharacterAnimation[]
  step: number
}

/**
 * The assistant in the bottom-right corner of the desktop: its character and,
 * above it, the balloon of the current message (spec §5.7).
 */
export function Assistant() {
  const { t, localize } = useI18n()
  const { visible, message, dismiss, turnOff, trayButtonRef } = useAssistant()
  const balloonRef = useRef<HTMLDivElement>(null)

  // The character stays mounted while it plays `hide`, after `visible` turned false.
  const [present, setPresent] = useState(visible)
  const [leaving, setLeaving] = useState(false)
  const [reaction, setReaction] = useState<Reaction>({
    steps: visible ? ARRIVAL : [],
    step: 0,
  })
  const [seenVisible, setSeenVisible] = useState(visible)
  const [seenMessageId, setSeenMessageId] = useState<number | null>(null)

  // Follows the engine during render, so the right animation is in the same paint.
  if (visible !== seenVisible) {
    setSeenVisible(visible)
    if (visible) {
      setPresent(true)
      setLeaving(false)
      setReaction({ steps: ARRIVAL, step: 0 })
    } else if (present) {
      setLeaving(true)
    }
  }
  const messageId = message?.id ?? null
  if (messageId !== seenMessageId) {
    setSeenMessageId(messageId)
    // Without a balloon there is nothing left to say: back to idle.
    setReaction({
      steps: message ? REACTIONS[message.event.type] : [],
      step: 0,
    })
  }

  const animation: CharacterAnimation = leaving
    ? 'hide'
    : (reaction.steps[reaction.step] ?? 'idle')

  // A loop plays for a beat; a one-shot animation moves on through `onCharacterDone`.
  useEffect(() => {
    if (animation === 'idle' || ONE_SHOT_ANIMATIONS.has(animation)) return
    const timer = window.setTimeout(
      () => setReaction((current) => ({ ...current, step: current.step + 1 })),
      BEAT_MS,
    )
    return () => window.clearTimeout(timer)
  }, [animation, reaction])

  function onCharacterDone(done: CharacterAnimation) {
    if (done === 'hide') {
      setPresent(false)
      setLeaving(false)
      return
    }
    setReaction((current) =>
      current.steps[current.step] === done
        ? { ...current, step: current.step + 1 }
        : current,
    )
  }

  // A focused balloon is going away: the focus waits on the tray button, which
  // brings the assistant back, instead of falling to the page.
  function leaveBalloon(action: () => void) {
    const hadFocus =
      balloonRef.current?.contains(document.activeElement) ?? false
    action()
    if (hadFocus) trayButtonRef.current?.focus()
  }

  const name = t('assistant.name')
  const balloon = visible ? message : null
  const text = balloon
    ? localize(messageText(content.assistant, balloon.event))
    : ''
  const isHelp = balloon?.event.type === 'help'

  return (
    <>
      {/* Always in the page, so screen readers announce every new message. */}
      <p role="status" className={styles.announcer}>
        {balloon ? t('assistant.said', { name, message: text }) : ''}
      </p>
      {present && (
        <aside className={styles.assistant} aria-label={t('assistant.label')}>
          {balloon && (
            <div ref={balloonRef} className={styles.balloon}>
              <Balloon
                key={balloon.id}
                title={name}
                autoCloseMs={isHelp ? undefined : balloonDuration(text)}
                onClose={() => leaveBalloon(() => dismiss(balloon.id))}
                onDontShowAgain={
                  isHelp ? undefined : () => leaveBalloon(turnOff)
                }
              >
                {text}
              </Balloon>
            </div>
          )}
          <AssistantCharacter
            className={styles.character}
            animation={animation}
            onDone={onCharacterDone}
          />
        </aside>
      )}
    </>
  )
}
