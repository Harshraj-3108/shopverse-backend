// src/app/App.tsx

import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import { store } from './store';
import { router } from './router';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

export function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
            },
          }}
        />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
