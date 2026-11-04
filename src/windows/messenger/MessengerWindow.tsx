import { useEffect, useId, useRef, useState } from 'react'
import { useReducedMotion } from '../../app/useReducedMotion'
import { AssistantCharacter } from '../../assistant/assistantCharacter'
import { content } from '../../content'
import type { MessengerAction } from '../../content/schema'
import { appIcons, icons } from '../../icons'
import { useI18n } from '../../i18n/useI18n'
import { useWindowManager } from '../../os/window-manager/useWindowManager'
import {
  answer,
  ask,
  startConversation,
  TYPING_DELAY_MS,
  type Entry,
} from './conversation'
import styles from './MessengerWindow.module.css'

/**
 * Chat with predefined questions from messenger.json (spec §5.6). Answers may
 * carry actions: open a window, follow a link or switch the language.
 */
export function MessengerWindow() {
  const { t, localize, setLang, formatTime } = useI18n()
  const { openApp } = useWindowManager()
  const reducedMotion = useReducedMotion()
  const { messenger } = content
  const id = useId()
  const [conversation, setConversation] = useState(() =>
    startConversation(messenger, new Date()),
  )
  const historyRef = useRef<HTMLDivElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)
  const assistantName = localize(messenger.header.name)
  const questions = new Map(messenger.questions.map((item) => [item.id, item]))

  useEffect(() => {
    if (conversation.pending === null) return
    const timer = window.setTimeout(
      () =>
        setConversation((current) => answer(current, messenger, new Date())),
      TYPING_DELAY_MS,
    )
    return () => window.clearTimeout(timer)
  }, [conversation.pending, messenger])

  // The newest message is always in view.
  useEffect(() => {
    const history = historyRef.current
    if (history) history.scrollTop = history.scrollHeight
  }, [conversation.entries.length, conversation.pending])

  function onAsk(questionId: string) {
    // The question buttons are about to change; the focus waits on their group.
    optionsRef.current?.focus()
    const now = new Date()
    setConversation((current) => {
      const asked = ask(current, questionId, now)
      return reducedMotion ? answer(asked, messenger, now) : asked
    })
  }

  function textOf(entry: Entry): string {
    if (entry.kind === 'greeting') return localize(messenger.greeting)
    const question = questions.get(entry.questionId)
    if (!question) return ''
    return localize(
      entry.kind === 'question' ? question.label : question.answer,
    )
  }

  function renderAction(action: MessengerAction) {
    const label = localize(action.label)
    switch (action.type) {
      case 'openWindow':
        return (
          <button
            type="button"
            className={styles.action}
            onClick={() => openApp(action.app, { target: action.target })}
          >
            <img
              className={styles.actionIcon}
              src={appIcons[action.app]}
              alt=""
            />
            {label}
          </button>
        )
      case 'externalLink':
        return (
          <a
            className={styles.action}
            href={action.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img className={styles.actionIcon} src={icons.link} alt="" />
            {label}
          </a>
        )
      case 'setLanguage':
        return (
          <button
            type="button"
            className={styles.action}
            onClick={() => setLang(action.lang)}
          >
            {label}
          </button>
        )
    }
  }

  return (
    <div className={styles.messenger}>
      <header className={styles.header}>
        {/* The desktop assistant's character (D5): it talks while it types. */}
        <span className={`${styles.avatar} ${styles.character}`}>
          <AssistantCharacter
            animation={conversation.pending === null ? 'idle' : 'talk'}
          />
        </span>
        <div className={styles.identity}>
          <h3 className={styles.name}>{assistantName}</h3>
          <p className={styles.status}>
            <img className={styles.statusIcon} src={icons.online} alt="" />
            {t('messenger.available')}
          </p>
          <p className={styles.personal}>
            {localize(messenger.header.personalMessage)}
          </p>
        </div>
      </header>

      <div
        ref={historyRef}
        className={styles.history}
        role="log"
        aria-label={t('messenger.history')}
        tabIndex={0}
      >
        <ol className={styles.entries}>
          {conversation.entries.map((entry) => {
            const actions =
              entry.kind === 'answer'
                ? questions.get(entry.questionId)?.actions
                : undefined
            return (
              <li key={entry.id} className={styles.entry}>
                <p className={styles.meta}>
                  {t('messenger.sender', {
                    name:
                      entry.speaker === 'visitor'
                        ? t('messenger.you')
                        : assistantName,
                    time: formatTime(entry.time),
                  })}
                </p>
                <p className={styles.text}>{textOf(entry)}</p>
                {actions && actions.length > 0 && (
                  <ul className={styles.actions}>
                    {actions.map((action, index) => (
                      <li key={index}>{renderAction(action)}</li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ol>
        {/* The answer itself is announced by the log; this line is only visual. */}
        {conversation.pending !== null && (
          <p className={styles.typing} aria-hidden="true">
            {t('messenger.typing', { name: assistantName })}
          </p>
        )}
      </div>

      <div className={styles.composer}>
        <div className={styles.visitor}>
          <img className={styles.avatar} src={icons.avatar} alt="" />
          <span>{t('messenger.you')}</span>
        </div>
        <div
          ref={optionsRef}
          className={styles.options}
          role="group"
          aria-labelledby={`${id}-questions`}
          tabIndex={-1}
        >
          <p id={`${id}-questions`} className={styles.prompt}>
            {t('messenger.questions')}
          </p>
          <div className={styles.optionGrid}>
            {conversation.options.map((questionId) => {
              const question = questions.get(questionId)
              return question ? (
                <button
                  key={questionId}
                  type="button"
                  className={styles.option}
                  onClick={() => onAsk(questionId)}
                >
                  {localize(question.label)}
                </button>
              ) : null
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
