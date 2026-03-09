import { ReactNode, ErrorInfo } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-6 m-4 border border-danger-500/30 rounded-lg bg-danger-500/5">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-danger-500">
          Something went wrong
        </h2>
        <p className="text-foreground-500">
          An unexpected error occurred while rendering this component.
        </p>

        <button
          className="px-4 py-2 rounded-md text-sm font-medium bg-danger-500/15 border border-danger-500/25 text-danger-400 hover:bg-danger-500/25 transition-colors"
          type="button"
          onClick={resetErrorBoundary}
        >
          Try Again
        </button>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-4">
            <summary className="cursor-pointer font-medium text-sm text-foreground-400">
              Error Details (Development Mode)
            </summary>
            <pre className="mt-2 p-3 rounded-md text-xs overflow-auto bg-background-700/50 text-foreground-400 border border-white/[0.06]">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

interface CustomErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function ErrorBoundary({
  children,
  fallback,
  onError,
}: CustomErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Call custom error handler if provided
    onError?.(error, errorInfo);
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  );
}
