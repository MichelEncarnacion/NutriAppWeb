import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sentry, initSentry } from './lib/sentry'
import { initAnalytics } from './lib/analytics'
import './index.css'
import App from './App.jsx'

initSentry()
initAnalytics()

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <div style={{
          minHeight: "100vh", background: "#0D1117", display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 16, padding: 24, fontFamily: "sans-serif", color: "#E6EDF3"
        }}>
          <span style={{ fontSize: 48 }}>⚠️</span>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Algo salió mal</h2>
          <p style={{ margin: 0, color: "#7D8590", fontSize: 14, textAlign: "center", maxWidth: 360 }}>
            Ocurrió un error inesperado. El equipo fue notificado automáticamente.
          </p>
          <button
            onClick={() => window.location.href = "/panel"}
            style={{
              marginTop: 8, padding: "12px 24px", background: "#3DDC84", color: "#000",
              border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer"
            }}
          >
            Volver al inicio
          </button>
        </div>
      }
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
