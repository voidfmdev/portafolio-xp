import { describe, expect, it } from 'vitest'
import type { AppId } from '../appIds'
import { CASCADE, DEFAULT_SIZES } from './windowDefaults'
import {
  initialWindowState,
  visibleWindows,
  windowReducer,
  type WindowAction,
  type WindowManagerState,
} from './windowReducer'

function run(...actions: WindowAction[]): WindowManagerState {
  return actions.reduce(windowReducer, initialWindowState)
}

const open = (id: AppId, extra: Partial<WindowAction> = {}): WindowAction =>
  ({ type: 'open', id, ...extra }) as WindowAction

function windowOf(state: WindowManagerState, id: AppId) {
  const window = state.windows.find((other) => other.id === id)
  if (!window) throw new Error(`${id} is not open`)
  return window
}

describe('windowReducer: open', () => {
  it('opens a window at its default size, on top and active', () => {
    const state = run(open('about'))
    expect(state.windows).toEqual([
      {
        id: 'about',
        position: CASCADE.origin,
        size: DEFAULT_SIZES.about,
        minimized: false,
        maximized: false,
      },
    ])
    expect(state.zOrder).toEqual(['about'])
    expect(state.activeId).toBe('about')
  })

  it('cascades each new window and starts over after the last slot', () => {
    const apps: AppId[] = [
      'about',
      'projects',
      'skills',
      'experience',
      'contact',
      'messenger',
      'recycle-bin',
      'control-panel',
    ]
    const state = run(...apps.map((id) => open(id)))
    apps.forEach((id, index) => {
      const offset = (index % CASCADE.slots) * CASCADE.step
      expect(windowOf(state, id).position).toEqual({
        x: CASCADE.origin.x + offset,
        y: CASCADE.origin.y + offset,
      })
    })
  })

  it('keeps one instance per app: opening again only brings it forward', () => {
    const state = run(open('about'), open('projects'), open('about'))
    expect(state.windows.map((window) => window.id)).toEqual([
      'about',
      'projects',
    ])
    expect(state.zOrder).toEqual(['projects', 'about'])
    expect(state.activeId).toBe('about')
  })

  it('restores a minimized window when it is opened again', () => {
    const state = run(
      open('about'),
      { type: 'minimize', id: 'about' },
      open('about'),
    )
    expect(windowOf(state, 'about').minimized).toBe(false)
    expect(state.activeId).toBe('about')
  })

  it('asks for the focus again even when the window was already active', () => {
    const once = run(open('about'))
    const twice = windowReducer(once, { type: 'open', id: 'about' })
    expect(twice.focusRequest).toBeGreaterThan(once.focusRequest)
  })

  it('stores the item a deep link names and updates it on reopen', () => {
    const first = run(open('projects', { target: 'first' }))
    expect(windowOf(first, 'projects').target).toBe('first')
    const second = windowReducer(first, {
      type: 'open',
      id: 'projects',
      target: 'second',
    })
    expect(windowOf(second, 'projects').target).toBe('second')
  })

  it('fits the window inside a small desktop', () => {
    const bounds = { width: 500, height: 300 }
    const state = run(open('projects', { bounds }))
    expect(windowOf(state, 'projects')).toMatchObject({
      size: { width: 500, height: 300 },
      position: { x: 0, y: 0 },
    })
  })

  it('pulls the cascade back so the window stays on the desktop', () => {
    const bounds = { width: 800, height: 520 }
    const state = run(open('about'), open('projects', { bounds }))
    const { position, size } = windowOf(state, 'projects')
    expect(position.y + size.height).toBeLessThanOrEqual(bounds.height)
    expect(position.x + size.width).toBeLessThanOrEqual(bounds.width)
  })
})

describe('windowReducer: close', () => {
  it('removes the window and leaves no active window', () => {
    const state = run(open('about'), open('projects'), {
      type: 'close',
      id: 'projects',
    })
    expect(state.windows.map((window) => window.id)).toEqual(['about'])
    expect(state.zOrder).toEqual(['about'])
    expect(state.activeId).toBeNull()
  })

  it('keeps the active window when another one closes', () => {
    const state = run(open('about'), open('projects'), {
      type: 'close',
      id: 'about',
    })
    expect(state.activeId).toBe('projects')
  })

  it('starts the cascade over once the desktop is empty', () => {
    const state = run(
      open('about'),
      open('projects'),
      { type: 'close', id: 'about' },
      { type: 'close', id: 'projects' },
      open('skills'),
    )
    expect(windowOf(state, 'skills').position).toEqual(CASCADE.origin)
  })
})

describe('windowReducer: minimize, maximize and restore', () => {
  it('minimizes without closing and drops the focus', () => {
    const state = run(open('about'), { type: 'minimize', id: 'about' })
    expect(windowOf(state, 'about').minimized).toBe(true)
    expect(state.activeId).toBeNull()
    expect(state.zOrder).toEqual(['about'])
  })

  it('maximizes and restores the window, bringing it forward', () => {
    const maximized = run(open('about'), open('projects'), {
      type: 'maximize',
      id: 'about',
    })
    expect(windowOf(maximized, 'about').maximized).toBe(true)
    expect(maximized.zOrder.at(-1)).toBe('about')
    expect(maximized.activeId).toBe('about')

    const restored = windowReducer(maximized, { type: 'restore', id: 'about' })
    expect(windowOf(restored, 'about').maximized).toBe(false)
    expect(windowOf(restored, 'about').position).toEqual(
      windowOf(maximized, 'about').position,
    )
  })
})

describe('windowReducer: focus', () => {
  it('puts the window on top, restores it and makes it active', () => {
    const state = run(
      open('about'),
      open('projects'),
      { type: 'minimize', id: 'about' },
      { type: 'focus', id: 'about' },
    )
    expect(state.zOrder).toEqual(['projects', 'about'])
    expect(state.activeId).toBe('about')
    expect(windowOf(state, 'about').minimized).toBe(false)
  })

  it('returns the same state when the window is already active and on top', () => {
    const state = run(open('about'))
    expect(windowReducer(state, { type: 'focus', id: 'about' })).toBe(state)
  })
})

describe('windowReducer: move', () => {
  it('moves the restored window', () => {
    const state = run(open('about'), {
      type: 'move',
      id: 'about',
      position: { x: 100, y: 60 },
    })
    expect(windowOf(state, 'about').position).toEqual({ x: 100, y: 60 })
  })

  it('does not move a maximized window', () => {
    const maximized = run(open('about'), { type: 'maximize', id: 'about' })
    expect(
      windowReducer(maximized, {
        type: 'move',
        id: 'about',
        position: { x: 100, y: 60 },
      }),
    ).toBe(maximized)
  })
})

describe('windowReducer: unknown windows', () => {
  it.each<WindowAction>([
    { type: 'close', id: 'about' },
    { type: 'minimize', id: 'about' },
    { type: 'maximize', id: 'about' },
    { type: 'restore', id: 'about' },
    { type: 'focus', id: 'about' },
    { type: 'move', id: 'about', position: { x: 1, y: 1 } },
  ])('ignores $type on a window that is not open', (action) => {
    const state = run(open('projects'))
    expect(windowReducer(state, action)).toBe(state)
  })
})

describe('visibleWindows', () => {
  it('lists the windows that are not minimized, topmost first', () => {
    const state = run(open('about'), open('projects'), open('skills'), {
      type: 'minimize',
      id: 'skills',
    })
    expect(visibleWindows(state).map((window) => window.id)).toEqual([
      'projects',
      'about',
    ])
  })
})
