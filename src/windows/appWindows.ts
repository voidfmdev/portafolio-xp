import type { ComponentType } from 'react'
import type { AppId } from '../os/appIds'
import { AboutWindow } from './about/AboutWindow'
import { ContactWindow } from './contact/ContactWindow'
import { ControlPanelWindow } from './control-panel/ControlPanelWindow'
import { ExperienceWindow } from './experience/ExperienceWindow'
import { MessengerWindow } from './messenger/MessengerWindow'
import { ProjectsWindow } from './projects/ProjectsWindow'
import { RecycleBinWindow } from './recycle-bin/RecycleBinWindow'
import { SkillsWindow } from './skills/SkillsWindow'
import type { AppWindowProps } from './types'

/** Content of each app's window (spec §5). */
export const APP_WINDOWS: Record<AppId, ComponentType<AppWindowProps>> = {
  about: AboutWindow,
  projects: ProjectsWindow,
  skills: SkillsWindow,
  experience: ExperienceWindow,
  contact: ContactWindow,
  messenger: MessengerWindow,
  'recycle-bin': RecycleBinWindow,
  'control-panel': ControlPanelWindow,
}
