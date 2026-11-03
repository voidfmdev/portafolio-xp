/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { contentFiles } from './src/content/files.ts'
import { validateContent } from './src/content/validate.ts'

// Invalid content stops the build before bundling, with the file and field of each
// problem. Strict mode also rejects placeholders and filler text (D21).
function validateContentPlugin(strict: boolean): Plugin {
  return {
    name: 'validate-content',
    apply: 'build',
    buildStart() {
      const errors = validateContent(contentFiles, { strict })
      if (errors.length > 0) {
        this.error(
          `Invalid content${strict ? ' (CONTENT_STRICT=true)' : ''}:\n${errors.map((error) => `  - ${error}`).join('\n')}`,
        )
      }
    },
  }
}

// XP.css bundles fonts whose license is undocumented (D18). Drop their @font-face
// rules and the declarations that request them, so no font file reaches dist/;
// xp-overrides.css gives those controls the Luna font instead.
function stripXpFonts(): Plugin {
  return {
    name: 'strip-xp-fonts',
    enforce: 'pre',
    transform(code, id) {
      if (!id.split('?')[0].endsWith('/xp.css/dist/XP.css')) return null
      const stripped = code
        .replace(/@font-face\{[^}]*\}/g, '')
        .replace(
          /font-family:(?:"Pixelated MS Sans Serif"|Perfect DOS VGA\\ 437 Win)[^;}]*;?/g,
          '',
        )
      if (/Pixelated MS Sans Serif|Perfect DOS VGA/.test(stripped)) {
        this.error(
          'XP.css font rules changed; update stripXpFonts in vite.config.ts',
        )
      }
      return { code: stripped, map: null }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // The deploy workflow sets VITE_BASE to '/<repo>/' for GitHub Pages project sites,
  // and CONTENT_STRICT=true once the content is final (D21).
  const { VITE_BASE, CONTENT_STRICT } = loadEnv(mode, process.cwd(), [
    'VITE_',
    'CONTENT_',
  ])

  return {
    base: VITE_BASE || '/',
    plugins: [
      validateContentPlugin(CONTENT_STRICT === 'true'),
      stripXpFonts(),
      react(),
    ],
    css: {
      // XP.css ships a selector Lightning CSS rejects (`:before:not([value])`);
      // browsers already drop that rule, so recover and keep it as a build warning.
      lightningcss: { errorRecovery: true },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['src/vitest.setup.ts'],
    },
  }
})
