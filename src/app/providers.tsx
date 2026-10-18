import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ToastProvider } from '@/components/common/Toast';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in DevOps Control Plane:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-subtle flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-border p-6 shadow-glass text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Application Error Encountered</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              An unexpected error occurred in the control plane view. You can safely reload the view without losing saved state.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => window.location.reload()}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reload View
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ToastProvider>{children}</ToastProvider>
    </ErrorBoundary>
  );
};
