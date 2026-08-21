import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from a deep subpath on GitHub Pages, so use relative asset URLs.
// Engine wasm + openings live in public/ and are referenced via import.meta.env.BASE_URL.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
  },
});
