/**
 * Main Application Component
 * 
 * Root component with routing and global providers.
 * Following React best practices from guides.
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TicketProvider } from './contexts/TicketContext';
import { TemplateProvider } from './contexts/TemplateContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { MainLayout } from './components/layouts/MainLayout';
import { Spinner } from './components/ui/spinner';
// CommandPalette temporarily disabled - will be recreated with shadcn Command
// import { CommandPalette } from './components/command/CommandPalette';
import { useCommandPalette } from './hooks/useCommandPalette';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TicketsPage = lazy(() => import('./pages/TicketsPage').then(m => ({ default: m.TicketsPage })));
const TicketEditPage = lazy(() => import('./pages/TicketEditPage').then(m => ({ default: m.TicketEditPage })));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage').then(m => ({ default: m.TemplatesPage })));
const TemplateBuilderPage = lazy(() => import('./pages/TemplateBuilderPage').then(m => ({ default: m.TemplateBuilderPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

/**
 * Page Loading Fallback
 * 
 * Displays while lazy loading page components
 */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
}

function AppContent() {
  const { isOpen, close } = useCommandPalette();

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="tickets/new" element={<TicketEditPage />} />
              <Route path="tickets/:id" element={<TicketEditPage />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="templates/builder/:id" element={<TemplateBuilderPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
      
      {/* Temporarily commenting out CommandPalette */}
      {/* <CommandPalette isOpen={isOpen} onClose={close} /> */}
    </BrowserRouter>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <TemplateProvider>
        <TicketProvider>
          <AppContent />
        </TicketProvider>
      </TemplateProvider>
    </ThemeProvider>
  );
}

