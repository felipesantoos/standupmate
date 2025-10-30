/**
 * Application Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './styles/global.css';
import { ToastProvider } from './app/components/ui/Toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);

