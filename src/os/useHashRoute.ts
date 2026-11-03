import { useEffect } from 'react'
import { formatHash, hasRoute, parseHash, replaceHash } from './routes'
import { useWindowManager } from './window-manager/useWindowManager'
import { visibleWindows } from './window-manager/windowReducer'

/**
 * Keeps the URL hash and the windows in step (spec §4.6, D29): a new hash opens
 * its window, and the hash always names the topmost visible window that has a
 * route. The window a hash names on load is opened by the provider's initial state.
 */
export function useHashRoute() {
  const { state, openApp } = useWindowManager()

  useEffect(() => {
    function openFromHash() {
      const route = parseHash(window.location.hash)
      if (route) openApp(route.id, { target: route.target })
    }
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [openApp])

  const top = visibleWindows(state).find((window) => hasRoute(window.id))
  const hash = top ? formatHash(top) : ''

  useEffect(() => replaceHash(hash), [hash])
}
