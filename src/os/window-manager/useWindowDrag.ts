import { useRef, type PointerEvent, type RefObject } from 'react'
import { clampPosition, type Point } from './geometry'
import { useWindowManager } from './useWindowManager'
import type { WindowState } from './windowReducer'

interface DragStart {
  pointerId: number
  pointer: Point
  window: Point
}

/** Whether a pointer event started on one of the title bar buttons. */
export function isOnTitleBarControls(target: EventTarget): boolean {
  return target instanceof Element && !!target.closest('.title-bar-controls')
}

/**
 * Drags a window by its title bar with pointer events, kept inside the desktop
 * (spec §4.5). Maximized windows do not move.
 */
export function useWindowDrag(
  window: WindowState,
  windowRef: RefObject<HTMLElement | null>,
) {
  const { desktopRef, moveWindow } = useWindowManager()
  const start = useRef<DragStart | null>(null)

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0 || window.maximized) return
    if (isOnTitleBarControls(event.target)) return
    start.current = {
      pointerId: event.pointerId,
      pointer: { x: event.clientX, y: event.clientY },
      window: window.position,
    }
    // Keeps receiving moves when the pointer leaves the title bar mid-drag.
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
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
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
  }
}
