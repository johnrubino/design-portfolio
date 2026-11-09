import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App';

/** Used at build time only, to write the page's HTML into dist/index.html. */
export const render = () =>
  renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
