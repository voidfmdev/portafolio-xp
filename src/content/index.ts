import { contentFiles } from './files'
import type { Content } from './schema'

// The build stops when these files do not match the schemas (vite.config.ts),
// so the app trusts them without shipping the validator.
export const content = contentFiles as unknown as Content
