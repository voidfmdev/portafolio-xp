import type { WindowState } from '../os/window-manager/windowReducer'

/** What the window manager hands to the content of each app window. */
export interface AppWindowProps {
  window: WindowState
}
