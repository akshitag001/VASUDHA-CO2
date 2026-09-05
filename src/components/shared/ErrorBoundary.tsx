import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Top-level guard so a bad render (bad village data, a chart crash, a missing
// translation key) never white-screens the demo. Reload button clears local
// state as a last resort since a corrupt persisted village could be the cause.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // eslint-disable-next-line no-console
    console.error('VASUDHA CO2 render error:', error, info.componentStack);
  }

  handleReset = () => {
    try { localStorage.removeItem('vasudha_co2_state_v1'); } catch { /* ignore */ }
    window.location.href = '/';
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-6">
          <div className="max-w-md text-center card">
            <AlertTriangle size={32} className="text-amber-600 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-charcoal-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-charcoal-600 mb-4">
              VASUDHA CO2 hit an unexpected error while rendering this page. Your selected village
              and inputs may be corrupted — resetting will clear local state and return you to the
              landing page.
            </p>
            <p className="text-xs text-charcoal-500 mb-6 font-mono bg-earth-50 rounded p-2 break-words">
              {this.state.error.message}
            </p>
            <button onClick={this.handleReset} className="btn-primary inline-flex items-center gap-2">
              <RotateCcw size={14} /> Reset and go home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
