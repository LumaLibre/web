import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/store': 'http://127.0.0.1:7070',
      '/api/render': 'http://127.0.0.1:7070'
    }
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
});
