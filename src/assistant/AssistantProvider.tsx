import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePreferences } from '../app/usePreferences'
import { useI18n } from '../i18n/useI18n'
import { storage } from '../lib/storage'
import type { AppId } from '../os/appIds'
import { useWindowManager } from '../os/window-manager/useWindowManager'
import { AssistantContext } from './AssistantContext'
import {
  assistantReducer,
  FIRST_VISIT_KEY,
  IDLE_TIMEOUT_MS,
  initialAssistantState,
  type AutomaticEvent,
} from './engine'
import { useIdle } from './useIdle'

/**
 * Engine of the desktop assistant (spec §5.7): turns what happens on the desktop
 * into comments, one balloon at a time. Lives for one desktop session, inside
 * the WindowManagerProvider whose windows it watches.
 */
export function AssistantProvider({ children }: { children: ReactNode }) {
  const { lang } = useI18n()
  const { assistantEnabled, setPreference } = usePreferences()
  const { state: windowState } = useWindowManager()
  const [hidden, setHidden] = useState(false)
  const [state, dispatch] = useReducer(assistantReducer, initialAssistantState)
  const trayButtonRef = useRef<HTMLButtonElement>(null)

  // Switched on in the Control Panel and not hidden from the tray.
  const canComment = assistantEnabled && !hidden
  const canCommentRef = useRef(canComment)
  useEffect(() => {
    canCommentRef.current = canComment
    // Whatever was waiting is dropped, not shown later out of context.
    if (!canComment) dispatch({ type: 'clear', keepHelp: true })
  }, [canComment])

  const notify = useCallback((event: AutomaticEvent) => {
    if (canCommentRef.current) dispatch({ type: 'notify', event })
  }, [])

  // First visit ever in this browser; comes before the windows a deep link opens.
  useEffect(() => {
    if (storage.get(FIRST_VISIT_KEY) !== null || !canCommentRef.current) return
    storage.set(FIRST_VISIT_KEY, 'true')
    notify({ type: 'firstVisit' })
  }, [notify])

  const openWindows = useRef<AppId[]>([])
  useEffect(() => {
    const ids = windowState.windows.map((window) => window.id)
    for (const app of ids) {
      if (!openWindows.current.includes(app)) {
        notify({ type: 'windowOpened', app })
      }
    }
    // Minimized windows are still open; only closing the last one counts.
    if (openWindows.current.length > 0 && ids.length === 0) {
      notify({ type: 'allWindowsClosed' })
    }
    openWindows.current = ids
  }, [windowState.windows, notify])

  const previousLang = useRef(lang)
  useEffect(() => {
    if (previousLang.current === lang) return
    previousLang.current = lang
    notify({ type: 'languageChanged' })
  }, [lang, notify])

  useIdle(IDLE_TIMEOUT_MS, () => notify({ type: 'idle' }), canComment)

  const visible = canComment || state.current?.event.type === 'help'

  const help = useCallback(() => dispatch({ type: 'help' }), [])

  const dismiss = useCallback(
    (id: number) => dispatch({ type: 'dismiss', id }),
    [],
  )

  const turnOff = useCallback(() => {
    setPreference('assistantEnabled', false)
    dispatch({ type: 'clear' })
  }, [setPreference])

  const toggle = useCallback(() => {
    if (visible) {
      setHidden(true)
      dispatch({ type: 'clear' })
      return
    }
    setHidden(false)
    if (!assistantEnabled) setPreference('assistantEnabled', true)
  }, [visible, assistantEnabled, setPreference])

  const message = state.current
  const value = useMemo(
    () => ({
      visible,
      message,
      notify,
      help,
      dismiss,
      turnOff,
      toggle,
      trayButtonRef,
    }),
    [visible, message, notify, help, dismiss, turnOff, toggle],
  )

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  )
}
