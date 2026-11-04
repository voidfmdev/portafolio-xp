import { useCallback, useId, useRef, useState } from 'react'
import { Assistant } from '../assistant/Assistant'
import { useAssistant } from '../assistant/useAssistant'
import { Desktop } from './desktop/Desktop'
import { StartMenu, type CloseOptions } from './start-menu/StartMenu'
import { Taskbar } from './taskbar/Taskbar'
import { useHashRoute } from './useHashRoute'
import styles from './DesktopSession.module.css'

interface DesktopSessionProps {
  onLogOff: () => void
}

/**
 * Desktop, assistant, taskbar and Start menu of a signed-in guest. Needs a
 * WindowManagerProvider and an AssistantProvider.
 */
export function DesktopSession({ onLogOff }: DesktopSessionProps) {
  useHashRoute()
  const { help } = useAssistant()
  const [startMenuOpen, setStartMenuOpen] = useState(false)
  const startButtonRef = useRef<HTMLButtonElement>(null)
  const startMenuId = useId()

  const closeStartMenu = useCallback(({ restoreFocus }: CloseOptions) => {
    setStartMenuOpen(false)
    if (restoreFocus) startButtonRef.current?.focus()
  }, [])

  return (
    <div className={styles.session}>
      <Desktop />
      <Assistant />
      <Taskbar
        startButtonRef={startButtonRef}
        startMenuId={startMenuId}
        startMenuOpen={startMenuOpen}
        onToggleStartMenu={() => setStartMenuOpen((open) => !open)}
      />
      {startMenuOpen && (
        <StartMenu
          id={startMenuId}
          startButtonRef={startButtonRef}
          onClose={closeStartMenu}
          onHelp={help}
          onLogOff={onLogOff}
        />
      )}
    </div>
  )
}
