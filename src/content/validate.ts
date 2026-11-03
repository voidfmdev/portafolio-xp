// Loaded by vite.config.ts: imports carry extensions (see files.ts).
import { contentSchema } from './schema.ts'

/** Placeholders (`<correo>`) and filler text (`[RELLENO]`) anywhere in a string. */
const PLACEHOLDER = /<[a-z][a-z0-9-]*>|\[RELLENO\]/

export interface ValidationOptions {
  /** Also reject placeholders and filler text anywhere in the content (D21). */
  strict: boolean
}

type Path = readonly PropertyKey[]

/** `profile.json: sections.0.title.en`; the first path segment is the file name. */
function formatPath([file, ...rest]: Path): string {
  if (file === undefined) return 'content'
  const location = `${String(file)}.json`
  return rest.length > 0
    ? `${location}: ${rest.map(String).join('.')}`
    : location
}

/** Every string holding a placeholder or filler text, with its path. */
export function findPlaceholders(
  value: unknown,
  path: Path = [],
): { path: Path; value: string }[] {
  if (typeof value === 'string') {
    return PLACEHOLDER.test(value) ? [{ path, value }] : []
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      findPlaceholders(item, [...path, index]),
    )
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, item]) =>
      findPlaceholders(item, [...path, key]),
    )
  }
  return []
}

/** One message per problem, as `file.json: field.path: reason`; empty when the content is valid. */
export function validateContent(
  files: unknown,
  { strict }: ValidationOptions,
): string[] {
  const result = contentSchema.safeParse(files)
  const errors = result.success
    ? []
    : result.error.issues.map(
        (issue) => `${formatPath(issue.path)}: ${issue.message}`,
      )

  if (strict) {
    for (const { path, value } of findPlaceholders(files)) {
      errors.push(
        `${formatPath(path)}: Placeholder left in strict mode: ${JSON.stringify(value)}`,
      )
    }
  }
  return errors
}
