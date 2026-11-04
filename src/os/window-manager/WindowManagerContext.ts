import { createContext, type RefObject } from 'react'
import type { AppId } from '../appIds'
import type { Point } from './geometry'
import type { WindowManagerState } from './windowReducer'

/** Marks the taskbar button of each window; minimizing moves the focus there. */
export const TASKBAR_BUTTON_ATTRIBUTE = 'data-taskbar-app'

export interface OpenRequest {
  id: AppId
  target?: string
}

export interface OpenOptions {
  target?: string
  /** Element that gets the focus back when the window closes (spec §4.5). Defaults to the focused element. */
  opener?: HTMLElement | null
}

export interface WindowManagerValue {
  state: WindowManagerState
  /** Desktop area the windows live in: cascade and dragging keep them inside it. */
  desktopRef: RefObject<HTMLElement | null>
  openApp: (id: AppId, options?: OpenOptions) => void
  closeApp: (id: AppId) => void
  minimizeApp: (id: AppId) => void
  maximizeApp: (id: AppId) => void
  restoreApp: (id: AppId) => void
  focusApp: (id: AppId) => void
  moveWindow: (id: AppId, position: Point) => void
  /** Shows another item inside an open window, without moving the focus. */
  navigateApp: (id: AppId, target?: string) => void
}

export const WindowManagerContext = createContext<WindowManagerValue | null>(
  null,
)
