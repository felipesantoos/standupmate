/**
 * Application Entry Point
 * 
 * Initializes database and DI Container before rendering React app.
 * Following Hexagonal Architecture pattern from Colabora guides.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { App } from './app/App';
import { Toaster } from '@app/components/ui/sonner';
import { getDatabase } from '@infra/database/sqlite';
import { runSeeds } from '@infra/database/seed';
import { diContainer } from '@app/dicontainer/dicontainer';
import './styles/global.css';

/**
 * React Query Client
 * 
 * Configurado para local database (staleTime curto já que não há latência de rede)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 segundos (local DB é rápido)
      gcTime: 5 * 60 * 1000, // 5 minutos (cacheTime renomeado para gcTime no v5)
      retry: 1,
      refetchOnWindowFocus: false, // Local DB não precisa refetch ao focar
    },
    mutations: {
      retry: 0, // Não retry mutations por padrão
    },
  },
});

/**
 * Initialize application
 * 
 * 1. Initialize database
 * 2. Run seeds (default template)
 * 3. Configure DI Container with database
 * 4. Render React app
 */
async function initializeApp() {
  try {
    console.log('🚀 Initializing StandupMate...');
    
    // 1. Initialize database (singleton)
    console.log('📂 Initializing database...');
    const db = await getDatabase();
    
    // 2. Run seeds (creates default template if needed)
    console.log('🌱 Running database seeds...');
    await runSeeds(db);
    
    // 3. Configure DI Container with database
    console.log('🔧 Configuring DI Container...');
    diContainer.setDatabase(db);
    
    console.log('✅ Application initialized successfully');
    
    // 4. Render React app
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </StrictMode>
    );
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    
    // Show error to user
    document.getElementById('root')!.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 2rem; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
        <h1 style="color: #ef4444; font-size: 2rem; margin-bottom: 1rem;">Failed to Initialize Application</h1>
        <p style="color: #6b7280; margin-bottom: 1rem;">An error occurred while starting StandupMate.</p>
        <pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; max-width: 600px; overflow: auto; text-align: left;">${error instanceof Error ? error.message : String(error)}</pre>
        <button 
          onclick="location.reload()" 
          style="margin-top: 1.5rem; background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;"
        >
          Reload Page
        </button>
      </div>
    `;
  }
}

// Start application initialization
initializeApp();

