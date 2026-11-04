import { useContext } from 'react'
import { AssistantContext } from './AssistantContext'

/** The desktop assistant: its balloon, its visibility and the events it listens to. */
export function useAssistant() {
  const context = useContext(AssistantContext)
  if (!context) {
    throw new Error('useAssistant must be used inside <AssistantProvider>')
  }
  return context
}
