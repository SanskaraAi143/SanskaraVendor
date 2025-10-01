import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './hooks/useAuthContext.tsx';
import { Toaster } from './components/ui/toaster';
import { DirectionProvider } from '@radix-ui/react-direction';

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    // `worker.start()` returns a Promise that resolves
    // once the Service Worker is up and ready to intercept requests.
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
  return Promise.resolve();
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);

  enableMocking().then(() => {
    root.render(
      <React.StrictMode>
        <DirectionProvider dir="ltr">
          <BrowserRouter>
            <AuthProvider>
              <App />
              <Toaster />
            </AuthProvider>
          </BrowserRouter>
        </DirectionProvider>
      </React.StrictMode>
    );
  });
}