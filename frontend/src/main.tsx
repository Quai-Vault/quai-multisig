import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useThemeStore } from './store/themeStore'

// Initialize theme before render to set up system preference listener
useThemeStore.getState().initializeTheme()

// Ensure root element exists before mounting React
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Cannot mount React app.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
