import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

/**
 * Catches unexpected render errors so the whole app never shows a blank
 * page. Only a safe message is shown — stack traces stay in the console.
 */
interface ErrorBoundaryState {
  hasError: boolean;
}

/** Shared fallback UI used by the router's `errorElement` and the boundary. */
export function ErrorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 p-6">
      <div className="w-full max-w-lg rounded-card border border-ink-200 bg-white p-8 text-center shadow-card">
        <h1 className="text-xl font-bold text-ink-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-600">
          An unexpected error stopped the page from rendering. Reloading usually fixes it.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => window.location.reload()}>Reload the page</Button>
          <Button variant="outline" onClick={() => window.location.assign('/')}>
            Go to the home page
          </Button>
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Tutor UG encountered an unexpected error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return <ErrorFallback />;
  }
}
