import { useEffect, useRef } from 'react'

const ACTIVITY_EVENTS = [
  'pointerdown',
  'pointermove',
  'keydown',
  'wheel',
  // Coming back to the tab counts as activity: time on another tab is not idle time here.
  'visibilitychange',
] as const

/**
 * Calls `onIdle` once the page has been visible for `timeoutMs` without pointer
 * or keyboard activity; it waits for new activity before counting again.
 */
export function useIdle(timeoutMs: number, onIdle: () => void, active = true) {
  const onIdleRef = useRef(onIdle)

  useEffect(() => {
    onIdleRef.current = onIdle
  })

  useEffect(() => {
    if (!active) return
    let lastActivity = Date.now()
    let timer: number | undefined
    let waiting = false

    function schedule(delay: number) {
      timer = window.setTimeout(check, delay)
    }

    function check() {
      if (document.visibilityState === 'hidden') {
        schedule(timeoutMs)
        return
      }
      const elapsed = Date.now() - lastActivity
      if (elapsed < timeoutMs) {
        schedule(timeoutMs - elapsed)
        return
      }
      waiting = true
      onIdleRef.current()
    }

    // Only stamps the time: pointer moves are frequent, the timer checks it later.
    function onActivity() {
      lastActivity = Date.now()
      if (waiting) {
        waiting = false
        schedule(timeoutMs)
      }
    }

    for (const type of ACTIVITY_EVENTS) {
      document.addEventListener(type, onActivity, { passive: true })
    }
    schedule(timeoutMs)

    return () => {
      window.clearTimeout(timer)
      for (const type of ACTIVITY_EVENTS) {
        document.removeEventListener(type, onActivity)
      }
    }
  }, [active, timeoutMs])
}
