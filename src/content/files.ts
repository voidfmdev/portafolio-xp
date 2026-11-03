// vite.config.ts loads this file to validate the content, so its imports carry
// extensions and JSON import attributes (checked by tsconfig.node.json).
import assistant from './assistant.json' with { type: 'json' }
import contact from './contact.json' with { type: 'json' }
import experience from './experience.json' with { type: 'json' }
import messenger from './messenger.json' with { type: 'json' }
import profile from './profile.json' with { type: 'json' }
import projects from './projects.json' with { type: 'json' }
import skills from './skills.json' with { type: 'json' }

/** The content files as imported, before validation. Keys are the file names. */
export const contentFiles = {
  profile,
  projects,
  skills,
  experience,
  contact,
  messenger,
  assistant,
}
