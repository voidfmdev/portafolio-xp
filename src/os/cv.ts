import { content } from '../content'
import { assetUrl } from '../content/assetUrl'
import type { Lang } from '../i18n/locales'

/** CV in the current language, inside public/ (spec §5.8). */
export function cvUrl(lang: Lang): string {
  return assetUrl(content.profile.cv[lang])
}

/** Opens the CV in a new tab, as the desktop icon does. */
export function openCv(lang: Lang): void {
  window.open(cvUrl(lang), '_blank', 'noopener')
}
