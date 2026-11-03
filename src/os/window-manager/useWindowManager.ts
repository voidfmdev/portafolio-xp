import { useContext } from 'react'
import { WindowManagerContext } from './WindowManagerContext'

/** Open windows and the actions that change them. */
export function useWindowManager() {
  const context = useContext(WindowManagerContext)
  if (!context) {
    throw new Error(
      'useWindowManager must be used inside <WindowManagerProvider>',
    )
  }
  return context
}
