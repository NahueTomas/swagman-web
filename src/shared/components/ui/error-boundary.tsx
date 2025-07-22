import { ReactNode, ErrorInfo } from "react";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Card className="p-6 m-4 border-danger">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-danger">
          Something went wrong
        </h2>
        <p className="text-default-600">
          An unexpected error occurred while rendering this component.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-4">
            <summary className="cursor-pointer font-medium text-sm">
              Error Details (Development Mode)
            </summary>
            <pre className="mt-2 p-3 bg-default-100 rounded text-xs overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-2">
          <Button color="primary" variant="solid" onPress={resetErrorBoundary}>
            Try Again
          </Button>
          <Button
            color="default"
            variant="bordered"
            onPress={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </div>
    </Card>
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
