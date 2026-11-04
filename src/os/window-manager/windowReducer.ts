import type { AppId } from '../appIds'
import { clampPosition, clampSize, type Point, type Size } from './geometry'
import { CASCADE, DEFAULT_SIZES } from './windowDefaults'

export interface WindowState {
  id: AppId
  /** Top-left corner of the restored window, relative to the desktop. */
  position: Point
  size: Size
  minimized: boolean
  maximized: boolean
  /** Item the window shows (project slug, skill category id), e.g. from a deep link. */
  target?: string
}

export interface WindowManagerState {
  /** Open windows, in the order they were opened (taskbar order). One per app. */
  windows: WindowState[]
  /** Stacking order, bottom first: the last id is drawn on top. */
  zOrder: AppId[]
  /** Window that holds the keyboard focus; null once the focus went back to the desktop. */
  activeId: AppId | null
  /** Windows opened since the desktop was last empty; picks the next cascade slot. */
  opened: number
  /** Grows on every request to bring a window forward, so it takes the focus again. */
  focusRequest: number
}

export type WindowAction =
  | { type: 'open'; id: AppId; target?: string; bounds?: Size }
  | { type: 'close'; id: AppId }
  | { type: 'minimize'; id: AppId }
  | { type: 'maximize'; id: AppId }
  | { type: 'restore'; id: AppId }
  | { type: 'focus'; id: AppId }
  | { type: 'move'; id: AppId; position: Point }
  /** The window shows another item (or its first one, without target); the hash follows (D29). */
  | { type: 'navigate'; id: AppId; target?: string }

export const initialWindowState: WindowManagerState = {
  windows: [],
  zOrder: [],
  activeId: null,
  opened: 0,
  focusRequest: 0,
}

function find(state: WindowManagerState, id: AppId): WindowState | undefined {
  return state.windows.find((window) => window.id === id)
}

function patch(
  state: WindowManagerState,
  id: AppId,
  changes: Partial<WindowState>,
): WindowState[] {
  return state.windows.map((window) =>
    window.id === id ? { ...window, ...changes } : window,
  )
}

/** The window showing `target`, or without the field when there is none, as `open` leaves it. */
function withTarget(window: WindowState, target?: string): WindowState {
  const next = { ...window }
  delete next.target
  return target === undefined ? next : { ...next, target }
}

function raise(zOrder: AppId[], id: AppId): AppId[] {
  return [...zOrder.filter((other) => other !== id), id]
}

/** Shows the window, puts it on top and gives it the focus. */
function bringForward(
  state: WindowManagerState,
  id: AppId,
  changes: Partial<WindowState> = {},
): WindowManagerState {
  return {
    ...state,
    windows: patch(state, id, { minimized: false, ...changes }),
    zOrder: raise(state.zOrder, id),
    activeId: id,
    focusRequest: state.focusRequest + 1,
  }
}

function openWindow(
  state: WindowManagerState,
  { id, target, bounds }: Extract<WindowAction, { type: 'open' }>,
): WindowManagerState {
  // One instance per app: opening it again only brings it forward (spec §4.5).
  if (find(state, id)) {
    return bringForward(state, id, target === undefined ? {} : { target })
  }

  const offset = (state.opened % CASCADE.slots) * CASCADE.step
  const cascade = { x: CASCADE.origin.x + offset, y: CASCADE.origin.y + offset }
  const size = bounds ? clampSize(DEFAULT_SIZES[id], bounds) : DEFAULT_SIZES[id]
  const position = bounds ? clampPosition(cascade, size, bounds) : cascade
  const window: WindowState = {
    id,
    position,
    size,
    minimized: false,
    maximized: false,
    ...(target === undefined ? {} : { target }),
  }

  return {
    windows: [...state.windows, window],
    zOrder: [...state.zOrder, id],
    activeId: id,
    opened: state.opened + 1,
    focusRequest: state.focusRequest + 1,
  }
}

export function windowReducer(
  state: WindowManagerState,
  action: WindowAction,
): WindowManagerState {
  if (action.type === 'open') return openWindow(state, action)

  const window = find(state, action.id)
  if (!window) return state

  switch (action.type) {
    case 'close': {
      const windows = state.windows.filter((other) => other.id !== action.id)
      return {
        ...state,
        windows,
        zOrder: state.zOrder.filter((other) => other !== action.id),
        // The focus goes back to where the window was opened from (spec §4.5).
        activeId: state.activeId === action.id ? null : state.activeId,
        opened: windows.length === 0 ? 0 : state.opened,
      }
    }

    case 'minimize':
      if (window.minimized) return state
      return {
        ...state,
        windows: patch(state, action.id, { minimized: true }),
        activeId: state.activeId === action.id ? null : state.activeId,
      }

    case 'maximize':
      return bringForward(state, action.id, { maximized: true })

    case 'restore':
      return bringForward(state, action.id, { maximized: false })

    case 'focus': {
      const onTop = state.zOrder.at(-1) === action.id
      if (state.activeId === action.id && onTop && !window.minimized) {
        return state
      }
      return bringForward(state, action.id)
    }

    case 'move': {
      const { x, y } = action.position
      if (window.maximized) return state
      if (window.position.x === x && window.position.y === y) return state
      return {
        ...state,
        windows: patch(state, action.id, { position: { x, y } }),
      }
    }

    case 'navigate': {
      if (window.target === action.target) return state
      return {
        ...state,
        windows: state.windows.map((other) =>
          other.id === action.id ? withTarget(other, action.target) : other,
        ),
      }
    }
  }
}

/** Windows that are not minimized, topmost first. */
export function visibleWindows(state: WindowManagerState): WindowState[] {
  return state.zOrder
    .toReversed()
    .map((id) => find(state, id))
    .filter((window): window is WindowState => !!window && !window.minimized)
}
