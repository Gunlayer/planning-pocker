import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { WebSocketProvider } from './WebSocketProvider.tsx';
import DarkModeToggle from '@components/DarkModeToggle';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DarkModeToggle className='absolute top-4 right-4' />
    <BrowserRouter>
      <WebSocketProvider>
        <App />
      </WebSocketProvider>
    </BrowserRouter>
  </StrictMode>,
);
