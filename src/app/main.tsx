import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'xp.css/dist/XP.css'
import '../styles/tokens.css'
import '../styles/global.css'
import '../styles/xp-overrides.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
