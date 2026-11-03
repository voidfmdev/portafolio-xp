/** Every app the desktop can open, one window each (spec §4.2, §5). */
export const APP_IDS = [
  'about',
  'projects',
  'skills',
  'experience',
  'contact',
  'messenger',
  'recycle-bin',
  'control-panel',
] as const

export type AppId = (typeof APP_IDS)[number]

/** Left column of the Start menu, in this order, each with a subtitle (spec §4.4). */
export const START_MENU_APPS = [
  'about',
  'projects',
  'skills',
  'experience',
  'contact',
  'messenger',
] as const satisfies readonly AppId[]
