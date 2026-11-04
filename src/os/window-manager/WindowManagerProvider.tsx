import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import type { AppId } from '../appIds'
import { useIsMobile } from '../useIsMobile'
import type { Point, Size } from './geometry'
import {
  TASKBAR_BUTTON_ATTRIBUTE,
  WindowManagerContext,
  type OpenOptions,
  type OpenRequest,
} from './WindowManagerContext'
import {
  initialWindowState,
  visibleWindows,
  windowReducer,
} from './windowReducer'

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
  const mobile = useIsMobile()
  // Read by the actions, which must not change on every window update.
  const stateRef = useRef(state)
  useLayoutEffect(() => {
    stateRef.current = state
  })

  const desktopBounds = useCallback((): Size | undefined => {
    const desktop = desktopRef.current
    if (!desktop || desktop.clientWidth === 0 || desktop.clientHeight === 0) {
      return undefined
    }
    return { width: desktop.clientWidth, height: desktop.clientHeight }
  }, [])

  // The windows of the initial state opened before the desktop had a size; fit
  // them before the first paint, and again whenever the viewport shrinks.
  useLayoutEffect(() => {
    function fit() {
      const bounds = desktopBounds()
      if (bounds) dispatch({ type: 'fit', bounds })
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [desktopBounds])

  const openApp = useCallback(
    (id: AppId, { target, opener }: OpenOptions = {}) => {
      const origin = opener ?? focusedElement()
      if (origin) openers.current.set(id, origin)
      dispatch({ type: 'open', id, target, bounds: desktopBounds() })
    },
    [desktopBounds],
  )

  const closeApp = useCallback(
    (id: AppId) => {
      const opener = openers.current.get(id)
      openers.current.delete(id)
      // Mobile shows one window at a time: the next one comes up with the focus,
      // since the icon or button the closed one came from now lies under it.
      const next = mobile
        ? visibleWindows(stateRef.current).find((window) => window.id !== id)
        : undefined
      if (next) {
        dispatch({ type: 'close', id })
        dispatch({ type: 'focus', id: next.id })
        return
      }
      // Moved before the window unmounts, so the focus is never lost to <body>.
      const returnTo = canTakeFocus(opener) ? opener : desktopRef.current
      returnTo?.focus()
      dispatch({ type: 'close', id })
    },
    [mobile],
  )

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
  const navigateApp = useCallback(
    (id: AppId, target?: string) => dispatch({ type: 'navigate', id, target }),
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
      navigateApp,
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
      navigateApp,
    ],
  )

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  )
}
