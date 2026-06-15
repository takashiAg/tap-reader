import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './web/App';
import './web/App.css';
import { registerServiceWorker } from './web/pwa';

registerServiceWorker();

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
