import type { MessageKey } from '../../i18n/messages'

export type TitleBarControl = 'minimize' | 'maximize' | 'restore' | 'close'

/**
 * XP.css draws each title bar button from its English aria-label (D28). These
 * values are style hooks, never shown or read: the accessible name comes from
 * aria-labelledby, which points at the translated label and takes precedence.
 */
export const XP_CONTROL_STYLE: Record<TitleBarControl, string> = {
  minimize: 'Minimize',
  maximize: 'Maximize',
  restore: 'Restore',
  close: 'Close',
}

/** Translated accessible name of each title bar button. */
export const CONTROL_LABEL: Record<TitleBarControl, MessageKey> = {
  minimize: 'window.minimize',
  maximize: 'window.maximize',
  restore: 'window.restore',
  close: 'window.close',
}
