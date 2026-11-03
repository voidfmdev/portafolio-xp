import { describe, expect, it } from 'vitest'
import { clampPosition, clampSize } from './geometry'

const bounds = { width: 800, height: 600 }
const size = { width: 300, height: 200 }

describe('clampPosition', () => {
  it('keeps a position that is already inside', () => {
    expect(clampPosition({ x: 10, y: 20 }, size, bounds)).toEqual({
      x: 10,
      y: 20,
    })
  })

  it('stops at every edge of the desktop', () => {
    expect(clampPosition({ x: -50, y: -10 }, size, bounds)).toEqual({
      x: 0,
      y: 0,
    })
    expect(clampPosition({ x: 900, y: 700 }, size, bounds)).toEqual({
      x: 500,
      y: 400,
    })
  })

  it('pins a box larger than the desktop to the top-left corner', () => {
    expect(
      clampPosition({ x: 40, y: 40 }, { width: 1000, height: 900 }, bounds),
    ).toEqual({ x: 0, y: 0 })
  })
})

describe('clampSize', () => {
  it('shrinks only what does not fit', () => {
    expect(clampSize({ width: 1000, height: 200 }, bounds)).toEqual({
      width: 800,
      height: 200,
    })
  })
})
