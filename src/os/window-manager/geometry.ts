export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

/** Shrinks a size so it fits inside `bounds`. */
export function clampSize(size: Size, bounds: Size): Size {
  return {
    width: Math.min(size.width, bounds.width),
    height: Math.min(size.height, bounds.height),
  }
}

/**
 * Keeps a box of `size` fully inside `bounds` (spec §4.5: windows stay on the desktop).
 * A box larger than the bounds sticks to the top-left corner, so its title bar stays reachable.
 */
export function clampPosition(
  position: Point,
  size: Size,
  bounds: Size,
): Point {
  return {
    x: Math.max(0, Math.min(position.x, bounds.width - size.width)),
    y: Math.max(0, Math.min(position.y, bounds.height - size.height)),
  }
}
