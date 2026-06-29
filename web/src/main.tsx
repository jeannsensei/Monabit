import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/stores/auth.store';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

const hash = window.location.hash;
if (hash && hash.includes('access_token=')) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const t = params.get('access_token');
  if (t) {
    localStorage.setItem('monabit-access-token', t);
    localStorage.setItem('monabit-refresh-token', params.get('refresh_token') ?? '');
    localStorage.setItem('monabit-expires-at', params.get('expires_at') ?? '0');
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 3, staleTime: 60_000, refetchOnWindowFocus: true },
  },
});

useAuthStore.getState().initialize();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
          <ThemeProvider>
          <App />
          <Toaster richColors position="top-right" />
          </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
