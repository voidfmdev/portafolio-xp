import { describe, expect, it } from 'vitest'
import { contentFiles } from './files'
import { findPlaceholders, validateContent } from './validate'

type Path = (string | number)[]

/** A copy of the real content with one value replaced, or removed when `value` is undefined. */
function withValue(path: Path, value: unknown): unknown {
  const files: unknown = structuredClone(contentFiles)
  const parent = path
    .slice(0, -1)
    .reduce<unknown>(
      (node, key) => (node as Record<string | number, unknown>)[key],
      files,
    ) as Record<string | number, unknown>
  const last = path[path.length - 1]
  if (value === undefined) delete parent[last]
  else parent[last] = value
  return files
}

const lenient = { strict: false }
const strict = { strict: true }

describe('content files', () => {
  it('match the schemas (placeholders allowed while strict mode is off)', () => {
    expect(validateContent(contentFiles, lenient)).toEqual([])
  })
})

describe('validateContent', () => {
  it.each<[string, Path, unknown, string]>([
    [
      'a text missing a language',
      ['profile', 'role', 'en'],
      '  ',
      'profile.json: role.en: Must not be empty',
    ],
    [
      'a bilingual name missing a language (D20)',
      ['skills', 'categories', 1, 'items', 0, 'name'],
      { es: 'Habilidad' },
      'skills.json: categories.1.items.0.name',
    ],
    [
      'an unknown field',
      ['profile', 'nickname'],
      'x',
      'profile.json: Unrecognized key: "nickname"',
    ],
    [
      'a missing site field (D24)',
      ['profile', 'site'],
      undefined,
      'profile.json: site',
    ],
    [
      'an asset path with a leading slash',
      ['profile', 'cv', 'es'],
      '/cv/cv.pdf',
      'profile.json: cv.es',
    ],
    [
      'an invalid slug',
      ['projects', 'projects', 0, 'slug'],
      'Proyecto 1',
      'projects.json: projects.0.slug',
    ],
    [
      'a repeated slug',
      ['projects', 'projects', 1, 'slug'],
      'proyecto-1',
      'projects.json: projects.1.slug: Duplicate slug "proyecto-1"',
    ],
    [
      'a year that is not 4 digits',
      ['projects', 'projects', 0, 'year'],
      99,
      'projects.json: projects.0.year',
    ],
    [
      'an http URL',
      ['projects', 'projects', 0, 'links', 'github'],
      'http://example.com',
      'projects.json: projects.0.links.github',
    ],
    [
      'screenshots in a restricted project',
      ['projects', 'projects', 1, 'images'],
      [{ src: 'og/a.png', alt: { es: 'a', en: 'a' } }],
      'projects.json: projects.1.images: Restricted projects',
    ],
    [
      'a date that is not on the calendar',
      ['experience', 'work', 0, 'start'],
      '2024-02-30',
      'experience.json: work.0.start',
    ],
    [
      'an end before the start',
      ['experience', 'work', 1, 'end'],
      '1999-12',
      'experience.json: work.1.end: Must not be before start',
    ],
    ['an invalid email', ['contact', 'email'], 'correo', 'contact.json: email'],
    [
      'an unknown start question',
      ['messenger', 'start', 0],
      'nope',
      'messenger.json: start.0: No question with id "nope"',
    ],
    [
      'an unknown follow-up',
      ['messenger', 'questions', 1, 'followUps', 0],
      'nope',
      'messenger.json: questions.1.followUps.0',
    ],
    [
      'a target on an app without targets',
      ['messenger', 'questions', 0, 'actions', 0, 'target'],
      'proyecto-1',
      'messenger.json: questions.0.actions.0.target: Only allowed with app',
    ],
    [
      'a target that does not exist',
      ['messenger', 'questions', 1, 'actions', 0, 'target'],
      'nope',
      'messenger.json: questions.1.actions.0.target: No project "nope" in projects.json',
    ],
    [
      'an unknown action type',
      ['messenger', 'questions', 0, 'actions', 0, 'type'],
      'download',
      'messenger.json: questions.0.actions.0.type',
    ],
    [
      'the assistant name in Messenger, which lives in the interface strings (D38)',
      ['messenger', 'header', 'name'],
      'Floppy',
      'messenger.json: header',
    ],
    [
      'a missing window comment',
      ['assistant', 'windowOpened', 'recycle-bin'],
      undefined,
      'assistant.json: windowOpened.recycle-bin',
    ],
    [
      'a missing help comment (D23)',
      ['assistant', 'help'],
      undefined,
      'assistant.json: help',
    ],
  ])('rejects %s', (_label, path, value, expected) => {
    expect(
      validateContent(withValue(path, value), lenient).join('\n'),
    ).toContain(expected)
  })

  it('accepts a plain name and a bilingual name (D20)', () => {
    const files = withValue(['projects', 'projects', 0, 'name'], {
      es: 'Uno',
      en: 'One',
    })
    expect(validateContent(files, lenient)).toEqual([])
  })

  it('accepts a question without follow-ups (D22)', () => {
    const files = withValue(
      ['messenger', 'questions', 1, 'followUps'],
      undefined,
    )
    expect(validateContent(files, lenient)).toEqual([])
  })

  it.each<[Path, string]>([
    [['contact', 'email'], '<correo>'],
    [['contact', 'links', 1, 'url'], '<linkedin>'],
    [['profile', 'photo', 'src'], '<foto>'],
  ])(
    'accepts the placeholder at %j while strict mode is off',
    (path, value) => {
      expect(validateContent(withValue(path, value), lenient)).toEqual([])
    },
  )
})

describe('strict mode (D21)', () => {
  it.each<[Path, string]>([
    [['profile', 'name'], '<nombre>'],
    [['profile', 'alias'], '<alias>'],
    [['contact', 'email'], '<correo>'],
    [['contact', 'links', 0, 'url'], 'https://github.com/<usuario-github>'],
    [['profile', 'cv', 'en'], 'cv/<alias>-cv-en.pdf'],
    [['profile', 'role', 'es'], '[RELLENO] Rol'],
    [['skills', 'categories', 0, 'items', 0, 'name'], '[RELLENO] Lenguaje'],
  ])('rejects a placeholder at %j', (path, value) => {
    const errors = validateContent(withValue(path, value), strict)
    const [file, ...rest] = path
    expect(errors).toContain(
      `${file}.json: ${rest.join('.')}: Placeholder left in strict mode: ${JSON.stringify(value)}`,
    )
  })
})

describe('findPlaceholders', () => {
  it('finds placeholders and filler text anywhere, with their path', () => {
    const found = findPlaceholders({
      a: { b: ['ok', '<correo>'] },
      c: '[RELLENO] texto',
      d: 'https://github.com/<usuario-github>',
      e: 'C++ y TypeScript',
      f: 2000,
      g: null,
    })
    expect(found).toEqual([
      { path: ['a', 'b', 1], value: '<correo>' },
      { path: ['c'], value: '[RELLENO] texto' },
      { path: ['d'], value: 'https://github.com/<usuario-github>' },
    ])
  })
})
