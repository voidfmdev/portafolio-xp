// Schemas of the content JSON files (docs/content-schema.md). Only the build and
// the tests import the schemas; the app imports the inferred types, so Zod stays
// out of the bundle. Loaded by vite.config.ts: imports carry extensions (see files.ts).
import { z } from 'zod'
import { LANGS } from '../i18n/locales.ts'
import { isIsoDate } from '../lib/dates.ts'
import { APP_IDS } from '../os/appIds.ts'
import { MARKER } from './marker.ts'

// Relative path inside public/: no leading slash, no `..` segment, no scheme, query or fragment.
const ASSET_PATH = /^(?![/\\])(?!(?:.*\/)?\.\.(?:\/|$))[^\s\\:?#]+$/

const nonEmpty = z.string().regex(/\S/, 'Must not be empty')

// Strict objects reject unknown fields, so a misspelled field name fails instead of being ignored.

/** Both languages, both non-empty (D20: this is what the parity check covers in content). */
export const textSchema = z.strictObject({ es: nonEmpty, en: nonEmpty })

/** A proper name kept as is in both languages, or a bilingual name (D20). */
export const nameSchema = z.union([nonEmpty, textSchema])

const isoDate = z
  .string()
  .refine(isIsoDate, 'Must be a calendar date as YYYY-MM or YYYY-MM-DD')

const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'Must be a lowercase slug like "my-project"',
  )

const httpsUrl = z.url({ protocol: /^https$/ })

// While strict mode is off, URLs, emails and asset paths may still hold placeholders (D21).
const url = z
  .string()
  .refine(
    (value) => MARKER.test(value) || httpsUrl.safeParse(value).success,
    'Must be an absolute https:// URL or a placeholder like "<linkedin>"',
  )

const email = z
  .string()
  .refine(
    (value) => MARKER.test(value) || z.email().safeParse(value).success,
    'Must be an email address or a placeholder like "<correo>"',
  )

const assetPath = z
  .string()
  .regex(
    ASSET_PATH,
    'Must be a path inside public/ without a leading "/", like "cv/file.pdf"',
  )

const appId = z.enum(APP_IDS)

const image = z.strictObject({ src: assetPath, alt: textSchema })

function duplicates(ids: string[]): number[] {
  const seen = new Set<string>()
  return ids.flatMap((id, index) => {
    if (seen.has(id)) return [index]
    seen.add(id)
    return []
  })
}

/** Array whose items have unique `field` values; the issue points at the repeated item. */
function uniqueList<T extends z.ZodType>(item: T, field: string) {
  return z.array(item).superRefine((items, ctx) => {
    const ids = items.map((value) =>
      String((value as Record<string, unknown>)[field]),
    )
    for (const index of duplicates(ids)) {
      ctx.addIssue({
        code: 'custom',
        path: [index, field],
        message: `Duplicate ${field} "${ids[index]}"`,
      })
    }
  })
}

// Months are compared first because durations ignore days (D16); days only break a tie.
function endsBeforeStart(start: string, end: string | null): boolean {
  if (end === null) return false
  const [startMonth, endMonth] = [start.slice(0, 7), end.slice(0, 7)]
  if (endMonth !== startMonth) return endMonth < startMonth
  return start.length === 10 && end.length === 10 && end < start
}

function periodRefinement(
  item: { start: string; end: string | null },
  ctx: z.RefinementCtx,
) {
  if (endsBeforeStart(item.start, item.end)) {
    ctx.addIssue({
      code: 'custom',
      path: ['end'],
      message: 'Must not be before start',
    })
  }
}

export const profileSchema = z.strictObject({
  name: nonEmpty,
  alias: nonEmpty,
  photo: z.strictObject({ src: assetPath, alt: textSchema }).optional(),
  role: textSchema,
  location: textSchema,
  pageTitle: textSchema,
  breadcrumb: textSchema,
  sections: uniqueList(
    z.strictObject({ id: slug, title: textSchema, body: textSchema }),
    'id',
  ).min(1),
  cv: z.strictObject({ es: assetPath, en: assetPath }),
  // Written into index.html at build time (D24).
  site: z.strictObject({ title: textSchema, description: textSchema }),
})

const projectSchema = z
  .strictObject({
    slug,
    name: nameSchema,
    year: z.number().int().min(1000).max(9999),
    role: textSchema,
    summary: textSchema,
    description: textSchema,
    tech: z.array(nonEmpty).min(1),
    links: z.strictObject({
      github: url.optional(),
      demo: url.optional(),
      caseStudy: url.optional(),
    }),
    images: z.array(image),
    visibility: z.enum(['public', 'restricted']),
  })
  .superRefine((project, ctx) => {
    if (project.visibility === 'restricted' && project.images.length > 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['images'],
        message: 'Restricted projects must not include screenshots',
      })
    }
  })

export const projectsSchema = z.strictObject({
  projects: uniqueList(projectSchema, 'slug'),
})

const skillCategorySchema = z.strictObject({
  id: slug,
  name: textSchema,
  description: textSchema,
  items: z.array(
    z.strictObject({
      name: nameSchema,
      icon: nonEmpty,
      level: textSchema.optional(),
    }),
  ),
})

export const skillsSchema = z.strictObject({
  categories: uniqueList(skillCategorySchema, 'id'),
})

const workSchema = z
  .strictObject({
    id: slug,
    role: textSchema,
    company: nameSchema,
    start: isoDate,
    end: isoDate.nullable(),
    location: textSchema,
  })
  .superRefine(periodRefinement)

const educationSchema = z
  .strictObject({
    id: slug,
    degree: textSchema,
    institution: nameSchema,
    start: isoDate,
    end: isoDate.nullable(),
    location: textSchema,
  })
  .superRefine(periodRefinement)

export const experienceSchema = z.strictObject({
  work: uniqueList(workSchema, 'id'),
  education: uniqueList(educationSchema, 'id'),
})

export const contactSchema = z.strictObject({
  email,
  links: uniqueList(
    z.strictObject({ id: slug, label: nameSchema, url, icon: nonEmpty }),
    'id',
  ),
})

const actionSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('openWindow'),
    app: appId,
    // Project slug or skill category id; checked against those files in contentSchema.
    target: slug.optional(),
    label: textSchema,
  }),
  z.strictObject({ type: z.literal('externalLink'), url, label: textSchema }),
  z.strictObject({
    type: z.literal('setLanguage'),
    lang: z.enum(LANGS),
    label: textSchema,
  }),
])

const questionSchema = z.strictObject({
  id: slug,
  label: textSchema,
  answer: textSchema,
  actions: z.array(actionSchema).optional(),
  // Without followUps, the conversation offers the `start` questions again (D22).
  followUps: z.array(slug).optional(),
})

export const messengerSchema = z
  .strictObject({
    header: z.strictObject({ name: nameSchema, personalMessage: textSchema }),
    greeting: textSchema,
    start: z.array(slug).min(1),
    questions: uniqueList(questionSchema, 'id'),
  })
  .superRefine((messenger, ctx) => {
    const ids = new Set(messenger.questions.map((question) => question.id))
    const unknownQuestion = (id: string, path: (string | number)[]) => {
      if (!ids.has(id)) {
        ctx.addIssue({
          code: 'custom',
          path,
          message: `No question with id "${id}"`,
        })
      }
    }

    messenger.start.forEach((id, index) =>
      unknownQuestion(id, ['start', index]),
    )
    messenger.questions.forEach((question, q) => {
      question.followUps?.forEach((id, f) =>
        unknownQuestion(id, ['questions', q, 'followUps', f]),
      )
      question.actions?.forEach((action, a) => {
        if (
          action.type === 'openWindow' &&
          action.target !== undefined &&
          action.app !== 'projects' &&
          action.app !== 'skills'
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['questions', q, 'actions', a, 'target'],
            message: 'Only allowed with app "projects" or "skills"',
          })
        }
      })
    })
  })

export const assistantSchema = z.strictObject({
  firstVisit: textSchema,
  // One per app; shown once per session.
  windowOpened: z.record(appId, textSchema),
  idle: textSchema,
  allWindowsClosed: textSchema,
  languageChanged: textSchema,
  mobileDragAttempt: textSchema,
  // Start menu › Help (D23).
  help: textSchema,
})

/** The seven files together, so checks that span files can run. */
export const contentSchema = z
  .strictObject({
    profile: profileSchema,
    projects: projectsSchema,
    skills: skillsSchema,
    experience: experienceSchema,
    contact: contactSchema,
    messenger: messengerSchema,
    assistant: assistantSchema,
  })
  .superRefine((content, ctx) => {
    const targets = {
      projects: new Set(
        content.projects.projects.map((project) => project.slug),
      ),
      skills: new Set(content.skills.categories.map((category) => category.id)),
    }
    content.messenger.questions.forEach((question, q) => {
      question.actions?.forEach((action, a) => {
        if (action.type !== 'openWindow' || action.target === undefined) return
        if (action.app !== 'projects' && action.app !== 'skills') return
        if (!targets[action.app].has(action.target)) {
          ctx.addIssue({
            code: 'custom',
            path: ['messenger', 'questions', q, 'actions', a, 'target'],
            message: `No ${action.app === 'projects' ? 'project' : 'skill category'} "${action.target}" in ${action.app}.json`,
          })
        }
      })
    })
  })

export type Text = z.infer<typeof textSchema>
export type Name = z.infer<typeof nameSchema>
export type Profile = z.infer<typeof profileSchema>
export type Project = z.infer<typeof projectSchema>
export type SkillCategory = z.infer<typeof skillCategorySchema>
export type Experience = z.infer<typeof experienceSchema>
export type Contact = z.infer<typeof contactSchema>
export type Messenger = z.infer<typeof messengerSchema>
export type MessengerAction = z.infer<typeof actionSchema>
export type Assistant = z.infer<typeof assistantSchema>
export type Content = z.infer<typeof contentSchema>
