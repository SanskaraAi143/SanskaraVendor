
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './hooks/useAuthContext.tsx'
import { Toaster } from './components/ui/toaster'
import { DirectionProvider } from '@radix-ui/react-direction'

createRoot(document.getElementById("root")!).render(
  <DirectionProvider dir="ltr">
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  </DirectionProvider>
);
