import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  // The artifact preview build is served from a sub-path, so assets are relative.
  base: mode === 'artifact' ? './' : '/',
  plugins: [react()],
  build: { target: 'es2022' },
}));
