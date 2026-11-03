const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** Elements inside `container` that Tab can reach, in document order. */
export function tabbableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !element.closest('[hidden], [inert]'),
  )
}

/**
 * Keeps Tab and Shift+Tab cycling inside `container` (spec §4.5): from the last
 * element Tab goes back to the first, and Shift+Tab from the first to the last.
 * Call it from a keydown handler; it only acts on the Tab key.
 */
export function keepTabInside(
  event: { key: string; shiftKey: boolean; preventDefault: () => void },
  container: HTMLElement,
): void {
  if (event.key !== 'Tab') return
  const elements = tabbableElements(container)
  if (elements.length === 0) {
    event.preventDefault()
    container.focus()
    return
  }
  const first = elements[0]
  const last = elements[elements.length - 1]
  const current = document.activeElement
  if (event.shiftKey && (current === first || current === container)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && current === last) {
    event.preventDefault()
    first.focus()
  }
}
