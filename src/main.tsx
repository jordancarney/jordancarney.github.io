import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LiberatePrivacyPolicyPage from './pages/LiberatePrivacyPolicy.tsx'

const LIBERATE_PRIVACY_POLICY_PATH = '/liberate-privacy-policy'
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const isLiberatePrivacyPolicyPath =
  window.location.pathname === LIBERATE_PRIVACY_POLICY_PATH ||
  window.location.pathname.startsWith(`${LIBERATE_PRIVACY_POLICY_PATH}/`)

if (isLiberatePrivacyPolicyPath) {
  document.documentElement.classList.remove('dark')
  document.documentElement.style.colorScheme = 'light'
} else {
  document.documentElement.classList.add('dark')
  document.documentElement.style.colorScheme = 'dark'
}

createRoot(rootElement).render(
  <StrictMode>
    {isLiberatePrivacyPolicyPath ? <LiberatePrivacyPolicyPage /> : <App />}
  </StrictMode>,
)
