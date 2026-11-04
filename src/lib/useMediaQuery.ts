import { useCallback, useSyncExternalStore } from 'react'

// matchMedia is missing in some test environments; then no query matches.
function mediaQueryList(query: string): MediaQueryList | undefined {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia(query)
    : undefined
}

/** Whether the media `query` matches; re-renders when that changes. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = mediaQueryList(query)
      list?.addEventListener('change', onChange)
      return () => list?.removeEventListener('change', onChange)
    },
    [query],
  )
  const matches = useCallback(
    () => mediaQueryList(query)?.matches ?? false,
    [query],
  )
  return useSyncExternalStore(subscribe, matches, () => false)
}
