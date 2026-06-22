import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#0D1117",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}>
          <div style={{
            background: "#161B22",
            border: "1px solid #2D3748",
            borderRadius: "1rem",
            padding: "2rem",
            textAlign: "center",
            maxWidth: "28rem",
            width: "100%",
          }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>⚠️</p>
            <h2 style={{ color: "#E6EDF3", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Algo salió mal
            </h2>
            <p style={{ color: "#7D8590", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Ocurrió un error inesperado. Por favor recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#3DDC84",
                color: "#000",
                fontWeight: 700,
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
