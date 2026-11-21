import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Generates relative asset links for resilient GitHub Pages hosting
  server: {
    port: 5173,
    host: true
  }
});
