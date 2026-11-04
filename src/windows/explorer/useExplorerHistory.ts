import { useState } from 'react'
import {
  canGoBack,
  canGoForward,
  currentEntry,
  EMPTY_HISTORY,
  goBack,
  goForward,
  visit,
  type ExplorerHistory,
} from './explorerHistory'

export interface ExplorerNavigation {
  canGoBack: boolean
  canGoForward: boolean
  back: () => void
  forward: () => void
}

/**
 * Back and Forward over the items a window showed. `current` is the item on
 * screen, wherever the change came from (task pane, deep link, Messenger);
 * `show` asks the window to show another one. The history ends with the window.
 */
export function useExplorerHistory(
  current: string | undefined,
  show: (entry: string) => void,
): ExplorerNavigation {
  const [history, setHistory] = useState<ExplorerHistory>(() =>
    current === undefined ? EMPTY_HISTORY : visit(EMPTY_HISTORY, current),
  )

  // Adjusting state while rendering, as React recommends for props that change.
  if (current !== undefined && currentEntry(history) !== current) {
    setHistory(visit(history, current))
  }

  function move(next: ExplorerHistory) {
    const entry = currentEntry(next)
    if (next === history || entry === undefined) return
    setHistory(next)
    show(entry)
  }

  return {
    canGoBack: canGoBack(history),
    canGoForward: canGoForward(history),
    back: () => move(goBack(history)),
    forward: () => move(goForward(history)),
  }
}
