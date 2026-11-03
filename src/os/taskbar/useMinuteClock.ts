import { useEffect, useState } from 'react'

function msToNextMinute(date: Date): number {
  return 60_000 - (date.getSeconds() * 1000 + date.getMilliseconds())
}

/** Current time, updated when each minute starts, so the clock flips on time. */
export function useMinuteClock(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer: number
    function schedule(from: Date) {
      timer = window.setTimeout(() => {
        const next = new Date()
        setNow(next)
        schedule(next)
      }, msToNextMinute(from))
    }
    schedule(new Date())
    return () => window.clearTimeout(timer)
  }, [])

  return now
}
