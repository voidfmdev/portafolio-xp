import { useCallback, useId, useRef, useState } from 'react'
import { Desktop } from './desktop/Desktop'
import { StartMenu, type CloseOptions } from './start-menu/StartMenu'
import { Taskbar } from './taskbar/Taskbar'
import { useHashRoute } from './useHashRoute'
import styles from './DesktopSession.module.css'

interface DesktopSessionProps {
  onLogOff: () => void
}

/** Desktop, taskbar and Start menu of a signed-in guest. Needs a WindowManagerProvider. */
export function DesktopSession({ onLogOff }: DesktopSessionProps) {
  useHashRoute()
  const [startMenuOpen, setStartMenuOpen] = useState(false)
  // Placeholder until the assistant is implemented: the tray button and Help only toggle this.
  const [assistantVisible, setAssistantVisible] = useState(true)
  const startButtonRef = useRef<HTMLButtonElement>(null)
  const startMenuId = useId()

  const closeStartMenu = useCallback(({ restoreFocus }: CloseOptions) => {
    setStartMenuOpen(false)
    if (restoreFocus) startButtonRef.current?.focus()
  }, [])

  return (
    <div className={styles.session}>
      <Desktop />
      <Taskbar
        startButtonRef={startButtonRef}
        startMenuId={startMenuId}
        startMenuOpen={startMenuOpen}
        onToggleStartMenu={() => setStartMenuOpen((open) => !open)}
        assistantVisible={assistantVisible}
        onToggleAssistant={() => setAssistantVisible((visible) => !visible)}
      />
      {startMenuOpen && (
        <StartMenu
          id={startMenuId}
          startButtonRef={startButtonRef}
          onClose={closeStartMenu}
          onHelp={() => setAssistantVisible(true)}
          onLogOff={onLogOff}
        />
      )}
    </div>
  )
}
