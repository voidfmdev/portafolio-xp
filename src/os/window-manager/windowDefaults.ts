import type { AppId } from '../appIds'
import type { Size } from './geometry'

/**
 * Size each app opens at, in CSS pixels, before it is fitted to the desktop
 * (spec §4.5). Window-manager data, not styling: the CSS reads it as inline sizes.
 */
export const DEFAULT_SIZES: Record<AppId, Size> = {
  about: { width: 640, height: 460 },
  projects: { width: 720, height: 500 },
  skills: { width: 680, height: 480 },
  experience: { width: 720, height: 440 },
  contact: { width: 520, height: 480 },
  messenger: { width: 420, height: 520 },
  'recycle-bin': { width: 480, height: 340 },
  'control-panel': { width: 460, height: 400 },
}

/**
 * New windows open in a cascade: the first at `origin` (right of the icon
 * column, so the icons stay visible on wide screens), each next one `step`
 * lower and to the right, starting over after `slots` windows.
 */
export const CASCADE = {
  origin: { x: 120, y: 24 },
  step: 28,
  slots: 8,
} as const
