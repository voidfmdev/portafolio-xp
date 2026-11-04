/**
 * Back/Forward history inside one Explorer window (spec §4.5): the items it
 * showed, like a browser's, and the position of the one on screen.
 */
export interface ExplorerHistory {
  readonly entries: readonly string[]
  /** Position of the item on screen; -1 while nothing was shown. */
  readonly index: number
}

export const EMPTY_HISTORY: ExplorerHistory = { entries: [], index: -1 }

export function currentEntry(history: ExplorerHistory): string | undefined {
  return history.entries[history.index]
}

/** Records a new item; going somewhere else after Back drops the Forward entries. */
export function visit(
  history: ExplorerHistory,
  entry: string,
): ExplorerHistory {
  if (currentEntry(history) === entry) return history
  const entries = [...history.entries.slice(0, history.index + 1), entry]
  return { entries, index: entries.length - 1 }
}

export function canGoBack(history: ExplorerHistory): boolean {
  return history.index > 0
}

export function canGoForward(history: ExplorerHistory): boolean {
  return history.index < history.entries.length - 1
}

export function goBack(history: ExplorerHistory): ExplorerHistory {
  return canGoBack(history) ? { ...history, index: history.index - 1 } : history
}

export function goForward(history: ExplorerHistory): ExplorerHistory {
  return canGoForward(history)
    ? { ...history, index: history.index + 1 }
    : history
}
