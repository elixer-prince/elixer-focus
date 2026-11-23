import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Error is already captured in state via getDerivedStateFromError
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center transition-colors duration-500">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-primary text-2xl font-bold">
            Something went wrong
          </h2>
          <p className="text-base-content/60 max-w-md">
            An unexpected error occurred. You can try refreshing the page, or
            navigate back home.
          </p>
          {this.state.error?.message && (
            <p className="bg-base-200 text-error max-w-md rounded-lg p-3 font-mono text-sm">
              {this.state.error.message}
            </p>
          )}
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => window.location.reload()}
            >
              Refresh page
            </button>
            <a href="/" className="btn btn-primary btn-sm">
              Go home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
