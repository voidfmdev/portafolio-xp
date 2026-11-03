import { I18nProvider } from '../i18n/I18nProvider'
import { LanguagePreview } from './LanguagePreview'

export function App() {
  return (
    <I18nProvider>
      {/* Placeholder until the desktop is implemented. */}
      <LanguagePreview />
    </I18nProvider>
  )
}
