import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { reportError } from './lib/errorReporter.js'

window.addEventListener('error', (e) => {
  reportError({ message: e.message, stack: e.error?.stack, level: 'error' });
});
window.addEventListener('unhandledrejection', (e) => {
  reportError({
    message: e.reason?.message ?? String(e.reason),
    stack: e.reason?.stack,
    level: 'error',
  });
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
