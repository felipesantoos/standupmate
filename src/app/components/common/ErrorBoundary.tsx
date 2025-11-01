/**
 * Error Boundary Component
 * 
 * Catches React rendering errors and displays fallback UI.
 * Following 08c-react-best-practices.md pattern from Colabora.
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@app/components/ui/button';
import { Card } from '@app/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary
 * 
 * Prevents entire app from crashing when component errors occur
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // TODO: Send to error tracking service (Sentry, LogRocket, etc)
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }
  }
  
  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    });
  };
  
  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              
              <h2 className="text-2xl font-bold">Something went wrong</h2>
              
              <p className="text-muted-foreground">
                An unexpected error occurred. Please try again.
              </p>
              
              {/* Error details (collapsed) */}
              {import.meta.env.DEV && (
                <details className="text-left w-full">
                  <summary className="cursor-pointer text-sm font-medium hover:underline">
                    Error details (Dev Mode)
                  </summary>
                  <div className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-60">
                    <div className="font-semibold text-destructive mb-2">
                      {this.state.error?.name}: {this.state.error?.message}
                    </div>
                    <pre className="whitespace-pre-wrap">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}
              
              {/* Action buttons */}
              <div className="flex gap-2 w-full">
                <Button 
                  onClick={this.handleReset} 
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  Go to Dashboard
                </Button>
              </div>
              
              {/* Reload page (last resort) */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.reload()}
                className="text-xs"
              >
                Reload Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    
    return this.props.children;
  }
}

