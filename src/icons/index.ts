// Own flat SVG icons with a dark outline (D12). Imported as URLs: they are images,
// so their colors live in the files, not in the components.
import type { AppId } from '../os/appIds'
import about from './about.svg'
import assistant from './assistant.svg'
import avatar from './avatar.svg'
import back from './back.svg'
import contact from './contact.svg'
import controlPanel from './control-panel.svg'
import cv from './cv.svg'
import document from './document.svg'
import education from './education.svg'
import experience from './experience.svg'
import forward from './forward.svg'
import help from './help.svg'
import info from './info.svg'
import link from './link.svg'
import logOff from './log-off.svg'
import messenger from './messenger.svg'
import online from './online.svg'
import projects from './projects.svg'
import recycleBin from './recycle-bin.svg'
import skillGeneric from './skill-generic.svg'
import skills from './skills.svg'
import startLogo from './start-logo.svg'
import warning from './warning.svg'

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
  back,
  cv,
  document,
  education,
  forward,
  help,
  info,
  link,
  logOff,
  online,
  /** The portfolio's own logo: Start button and welcome screen. */
  startLogo,
  warning,
}

// Icon keys from the content files (`skills.json`, `contact.json`). Brand icons wait
// for a licensed library (spec §5.3); until then every key gets an own generic icon.
const skillIcons = new Map([['generic', skillGeneric]])
const linkIcons = new Map([['generic', link]])

/** Icon of a skill item; an unknown key gets the generic one. */
export function skillIcon(key: string): string {
  return skillIcons.get(key) ?? skillGeneric
}

/** Icon of a contact link; an unknown key gets the generic one. */
export function linkIcon(key: string): string {
  return linkIcons.get(key) ?? link
}
