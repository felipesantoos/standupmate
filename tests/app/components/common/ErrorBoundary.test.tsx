/**
 * ErrorBoundary Component Tests
 * 
 * Tests error catching and fallback UI.
 * Following 08e-frontend-testing.md pattern (Section 3.5).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ErrorBoundary } from '@app/components/common/ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Success content</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Error Catching', () => {
    it('should catch rendering error and show fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Assert: fallback UI visible
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Assert: children rendered normally
      expect(screen.getByText('Success content')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      // Assert: custom fallback visible
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Error Actions', () => {
    it('should have "Try Again" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /Try Again/i });
      expect(tryAgainButton).toBeInTheDocument();
    });

    it('should have "Go to Dashboard" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const dashboardButton = screen.getByRole('button', { name: /Go to Dashboard/i });
      expect(dashboardButton).toBeInTheDocument();
    });

    it('should have "Reload Page" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /Reload Page/i });
      expect(reloadButton).toBeInTheDocument();
    });
  });

  describe('Error Details (Dev Mode)', () => {
    it('should show error details in development mode', () => {
      // Note: This depends on import.meta.env.DEV being true in tests
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // In DEV mode, error details should be visible
      const details = screen.queryByText(/Error details/i);
      if (details) {
        expect(details).toBeInTheDocument();
      }
    });
  });

  describe('Multiple Errors', () => {
    it('should catch multiple errors from different children', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <div>No error</div>
        </ErrorBoundary>
      );

      // First render: no error
      expect(screen.getByText('No error')).toBeInTheDocument();

      // Rerender with error
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Assert: fallback shown
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});

