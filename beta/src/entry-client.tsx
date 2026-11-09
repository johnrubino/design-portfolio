import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production pages are prerendered (scripts/prerender.mjs), so React attaches
// to the HTML that is already on screen. In dev there is nothing to attach to.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
