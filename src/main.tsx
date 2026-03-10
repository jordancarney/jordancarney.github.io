import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LiberatePrivacyPolicyPage from './pages/LiberatePrivacyPolicy.tsx'
import TheOrbPrivacyPolicyPage from './pages/TheOrbPrivacyPolicy.tsx'

const LIBERATE_PRIVACY_POLICY_PATH = '/liberate-privacy-policy'
const THE_ORB_PRIVACY_POLICY_PATH = '/the-orb-privacy-policy'
const rootElement = document.getElementById('root')
const normalizedPathname = window.location.pathname.replace(/\/+$/, '') || '/'

if (!rootElement) {
  throw new Error('Root element not found')
}

const isLiberatePrivacyPolicyPath = normalizedPathname === LIBERATE_PRIVACY_POLICY_PATH
const isTheOrbPrivacyPolicyPath = normalizedPathname === THE_ORB_PRIVACY_POLICY_PATH
const isPrivacyPolicyPath = isLiberatePrivacyPolicyPath || isTheOrbPrivacyPolicyPath

document.documentElement.classList.toggle('dark', !isPrivacyPolicyPath)
document.documentElement.style.colorScheme = isPrivacyPolicyPath ? 'light' : 'dark'

createRoot(rootElement).render(
  <StrictMode>
    {isLiberatePrivacyPolicyPath ? (
      <LiberatePrivacyPolicyPage />
    ) : isTheOrbPrivacyPolicyPath ? (
      <TheOrbPrivacyPolicyPage />
    ) : (
      <App />
    )}
  </StrictMode>,
)
