import { useMediaQuery } from '../lib/useMediaQuery'

/**
 * Mobile mode (spec §4.7): viewports narrower than `--breakpoint-mobile`.
 * Media queries cannot read custom properties, so every CSS module repeats this
 * query word for word; `mobile.test.ts` keeps the copies and the token in step.
 */
export const MOBILE_QUERY = '(width < 768px)'

/**
 * Whether the desktop runs in mobile mode: one maximized window at a time,
 * no dragging, full-screen Start menu and the assistant as a floating button.
 */
export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY)
}
