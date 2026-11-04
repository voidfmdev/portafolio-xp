import { useRef, type PointerEvent, type RefObject } from 'react'
import { useAssistant } from '../../assistant/useAssistant'
import { clampPosition, type Point } from './geometry'
import { useWindowManager } from './useWindowManager'
import type { WindowState } from './windowReducer'

/** Finger travel, in CSS pixels, before a touch on a window that cannot move counts as a drag. */
const BLOCKED_DRAG_DISTANCE = 16

interface DragStart {
  pointerId: number
  pointer: Point
  window: Point
}

interface BlockedDrag {
  pointerId: number
  pointer: Point
}

/** Whether a pointer event started on one of the title bar buttons. */
export function isOnTitleBarControls(target: EventTarget): boolean {
  return target instanceof Element && !!target.closest('.title-bar-controls')
}

/**
 * Drags a window by its title bar with pointer events, kept inside the desktop
 * (spec §4.5). Maximized windows do not move; trying with a finger, as on a
 * phone, gets a comment from the assistant (spec §5.7).
 */
export function useWindowDrag(
  window: WindowState,
  windowRef: RefObject<HTMLElement | null>,
) {
  const { desktopRef, moveWindow } = useWindowManager()
  const { notify } = useAssistant()
  const start = useRef<DragStart | null>(null)
  const blocked = useRef<BlockedDrag | null>(null)

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0) return
    if (isOnTitleBarControls(event.target)) return
    const pointer = { x: event.clientX, y: event.clientY }
    if (window.maximized) {
      if (event.pointerType === 'touch') {
        blocked.current = { pointerId: event.pointerId, pointer }
      }
      return
    }
    start.current = {
      pointerId: event.pointerId,
      pointer,
      window: window.position,
    }
    // Keeps receiving moves when the pointer leaves the title bar mid-drag.
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const attempt = blocked.current
    if (attempt && attempt.pointerId === event.pointerId) {
      const distance = Math.hypot(
        event.clientX - attempt.pointer.x,
        event.clientY - attempt.pointer.y,
      )
      if (distance >= BLOCKED_DRAG_DISTANCE) {
        blocked.current = null
        notify({ type: 'mobileDragAttempt' })
      }
      return
    }

    const drag = start.current
    const desktop = desktopRef.current
    const element = windowRef.current
    if (!drag || drag.pointerId !== event.pointerId || !desktop || !element) {
      return
    }
    const next = {
      x: drag.window.x + event.clientX - drag.pointer.x,
      y: drag.window.y + event.clientY - drag.pointer.y,
    }
    moveWindow(
      window.id,
      clampPosition(
        next,
        { width: element.offsetWidth, height: element.offsetHeight },
        { width: desktop.clientWidth, height: desktop.clientHeight },
      ),
    )
  }

  function onPointerEnd(event: PointerEvent<HTMLElement>) {
    if (start.current?.pointerId === event.pointerId) start.current = null
    if (blocked.current?.pointerId === event.pointerId) blocked.current = null
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
  }
}
