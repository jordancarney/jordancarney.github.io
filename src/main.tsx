import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LiberatePrivacyPolicyPage from './pages/LiberatePrivacyPolicy.tsx'

const LIBERATE_PRIVACY_POLICY_PATH = '/liberate-privacy-policy'
const rootElement = document.getElementById('root')
const normalizedPathname = window.location.pathname.replace(/\/+$/, '') || '/'

if (!rootElement) {
  throw new Error('Root element not found')
}

const isLiberatePrivacyPolicyPath = normalizedPathname === LIBERATE_PRIVACY_POLICY_PATH

document.documentElement.classList.toggle('dark', !isLiberatePrivacyPolicyPath)
document.documentElement.style.colorScheme = isLiberatePrivacyPolicyPath ? 'light' : 'dark'

createRoot(rootElement).render(
  <StrictMode>
    {isLiberatePrivacyPolicyPath ? <LiberatePrivacyPolicyPage /> : <App />}
  </StrictMode>,
)
