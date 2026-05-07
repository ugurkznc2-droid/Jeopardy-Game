import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('App crashed:', error, info);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('jeopardy-game-store');
    } catch {
      // ignore
    }
    window.location.hash = '';
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-jeopardy-dark p-8">
        <div className="max-w-lg w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-black text-jeopardy-gold mb-3">Something went wrong</h1>
          <p className="text-white/60 mb-6">
            The app hit an unexpected error. This usually happens after an update — clearing the saved data should fix it.
          </p>
          {this.state.error && (
            <pre className="text-left bg-black/30 p-3 rounded-lg text-xs text-red-300 mb-6 overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-jeopardy-gold text-black font-bold rounded-xl hover:bg-yellow-400 cursor-pointer"
            >
              Reset App
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl cursor-pointer"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
