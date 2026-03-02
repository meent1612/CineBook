import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
} else {
  console.error("Root element not found.");
}