import { act, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderSession } from '../test-utils'
import { DEFAULT_SIZES } from './windowDefaults'

let desktop = { width: 0, height: 0 }

beforeEach(() => {
  localStorage.clear()
  // jsdom has no layout: every element reports the desktop size set here.
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
    () => desktop.width,
  )
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(
    () => desktop.height,
  )
})

afterEach(() => {
  vi.restoreAllMocks()
  window.history.replaceState(null, '', '/')
})

function placement(name: string) {
  const { left, top, width, height } = screen.getByRole('dialog', {
    name,
  }).style
  return { left, top, width, height }
}

describe('WindowManagerProvider', () => {
  it('fits the window a deep link opens on load into a phone-sized desktop', () => {
    desktop = { width: 360, height: 770 }
    renderSession({ initialApps: [{ id: 'projects' }] })
    expect(placement('Proyectos')).toEqual({
      left: '0px',
      top: '24px',
      width: '360px',
      height: `${DEFAULT_SIZES.projects.height}px`,
    })
  })

  it('fits it into a short desktop too', () => {
    desktop = { width: 1024, height: 400 }
    renderSession({ initialApps: [{ id: 'about' }] })
    expect(placement('Sobre mí')).toMatchObject({
      top: '0px',
      height: '400px',
    })
  })

  it('fits the open windows again when the viewport shrinks', () => {
    desktop = { width: 1280, height: 900 }
    renderSession({ initialApps: [{ id: 'about' }] })
    expect(placement('Sobre mí').width).toBe(`${DEFAULT_SIZES.about.width}px`)

    desktop = { width: 500, height: 900 }
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(placement('Sobre mí')).toMatchObject({ left: '0px', width: '500px' })
  })
})
