/** A whole-value placeholder such as `<correo>` (spec §3, principle 5). */
export const MARKER = /^<[a-z][a-z0-9-]*>$/

/** Whether a content value is still a placeholder, e.g. `<foto>` before the real photo exists. */
export function isMarker(value: string): boolean {
  return MARKER.test(value)
}
