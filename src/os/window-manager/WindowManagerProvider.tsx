import { useCallback, useMemo, useReducer, useRef, type ReactNode } from 'react'
import type { AppId } from '../appIds'
import type { Point, Size } from './geometry'
import {
  TASKBAR_BUTTON_ATTRIBUTE,
  WindowManagerContext,
  type OpenOptions,
  type OpenRequest,
} from './WindowManagerContext'
import { initialWindowState, windowReducer } from './windowReducer'

function canTakeFocus(element: HTMLElement | null | undefined) {
  return !!element && element.isConnected && !element.closest('[hidden]')
}

function focusedElement(): HTMLElement | null {
  const element = document.activeElement
  return element instanceof HTMLElement && element !== document.body
    ? element
    : null
}

interface WindowManagerProviderProps {
  /** Windows open from the start, e.g. the one a deep link names. */
  initialApps?: readonly OpenRequest[]
  children: ReactNode
}

/** Window state of one desktop session (Context + useReducer, D9). */
export function WindowManagerProvider({
  initialApps = [],
  children,
}: WindowManagerProviderProps) {
  const [state, dispatch] = useReducer(windowReducer, initialApps, (apps) =>
    apps.reduce(
      (current, { id, target }) =>
        windowReducer(current, { type: 'open', id, target }),
      initialWindowState,
    ),
  )
  const desktopRef = useRef<HTMLElement>(null)
  const openers = useRef(new Map<AppId, HTMLElement>())

  const desktopBounds = useCallback((): Size | undefined => {
    const desktop = desktopRef.current
    if (!desktop || desktop.clientWidth === 0 || desktop.clientHeight === 0) {
      return undefined
    }
    return { width: desktop.clientWidth, height: desktop.clientHeight }
  }, [])

  const openApp = useCallback(
    (id: AppId, { target, opener }: OpenOptions = {}) => {
      const origin = opener ?? focusedElement()
      if (origin) openers.current.set(id, origin)
      dispatch({ type: 'open', id, target, bounds: desktopBounds() })
    },
    [desktopBounds],
  )

  const closeApp = useCallback((id: AppId) => {
    const opener = openers.current.get(id)
    openers.current.delete(id)
    // Moved before the window unmounts, so the focus is never lost to <body>.
    const returnTo = canTakeFocus(opener) ? opener : desktopRef.current
    returnTo?.focus()
    dispatch({ type: 'close', id })
  }, [])

  const minimizeApp = useCallback((id: AppId) => {
    document
      .querySelector<HTMLElement>(`[${TASKBAR_BUTTON_ATTRIBUTE}="${id}"]`)
      ?.focus()
    dispatch({ type: 'minimize', id })
  }, [])

  const maximizeApp = useCallback(
    (id: AppId) => dispatch({ type: 'maximize', id }),
    [],
  )
  const restoreApp = useCallback(
    (id: AppId) => dispatch({ type: 'restore', id }),
    [],
  )
  const focusApp = useCallback(
    (id: AppId) => dispatch({ type: 'focus', id }),
    [],
  )
  const moveWindow = useCallback(
    (id: AppId, position: Point) => dispatch({ type: 'move', id, position }),
    [],
  )

  const value = useMemo(
    () => ({
      state,
      desktopRef,
      openApp,
      closeApp,
      minimizeApp,
      maximizeApp,
      restoreApp,
      focusApp,
      moveWindow,
    }),
    [
      state,
      openApp,
      closeApp,
      minimizeApp,
      maximizeApp,
      restoreApp,
      focusApp,
      moveWindow,
    ],
  )

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  )
}
