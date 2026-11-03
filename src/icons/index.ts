// Own flat SVG icons with a dark outline (D12). Imported as URLs: they are images,
// so their colors live in the files, not in the components.
import type { AppId } from '../os/appIds'
import about from './about.svg'
import assistant from './assistant.svg'
import avatar from './avatar.svg'
import contact from './contact.svg'
import controlPanel from './control-panel.svg'
import cv from './cv.svg'
import experience from './experience.svg'
import help from './help.svg'
import logOff from './log-off.svg'
import messenger from './messenger.svg'
import projects from './projects.svg'
import recycleBin from './recycle-bin.svg'
import skills from './skills.svg'
import startLogo from './start-logo.svg'

export const appIcons: Record<AppId, string> = {
  about,
  projects,
  skills,
  experience,
  contact,
  messenger,
  'recycle-bin': recycleBin,
  'control-panel': controlPanel,
}

export const icons = {
  assistant,
  avatar,
  cv,
  help,
  logOff,
  /** The portfolio's own logo: Start button and welcome screen. */
  startLogo,
}
