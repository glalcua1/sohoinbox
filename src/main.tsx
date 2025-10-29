import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'

console.log('[soho-web] Mounting app...')
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
