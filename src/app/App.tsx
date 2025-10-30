/**
 * Main Application Component
 * 
 * Root component with routing and global providers.
 * Following React best practices from guides.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TicketProvider } from './store/TicketContext';
import { TemplateProvider } from './store/TemplateContext';
import { ThemeProvider } from './store/ThemeContext';
import { MainLayout } from './components/layouts/MainLayout';
// Temporarily commenting out CommandPalette until it's recreated with shadcn
// import { CommandPalette } from './components/command/CommandPalette';
import { useCommandPalette } from './hooks/useCommandPalette';
import { DashboardPage } from './pages/DashboardPage';
import { TicketsPage } from './pages/TicketsPage';
import { TicketEditPage } from './pages/TicketEditPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { TemplateBuilderPage } from './pages/TemplateBuilderPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { isOpen, close } = useCommandPalette();

  return (
    <BrowserRouter>
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

