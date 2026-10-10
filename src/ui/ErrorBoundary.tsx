import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: (reset: () => void) => ReactNode
}

interface State {
  error: Error | null
}

// Catches render errors so one broken page never blanks the whole app.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('VASUDHA CO2 render error:', error)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    if (this.props.fallback) return this.props.fallback(this.reset)
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="sheet max-w-md">
          <h1 className="text-2xl mb-2">Something went wrong / कुछ गड़बड़ हो गई</h1>
          <p className="mb-4 text-ink-2">The page could not be shown. Clearing saved inputs usually fixes this.</p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              try {
                localStorage.removeItem('vasudha_co2_v2')
              } catch {
                /* ignore */
              }
              window.location.href = '/'
            }}
          >
            Clear saved inputs and start again
          </button>
        </div>
      </div>
    )
  }
}
