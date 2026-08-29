import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  server: {
    proxy: {
      '/api': process.env.LUMA_BACKEND_ORIGIN ?? 'http://127.0.0.1:7070',
      '/chat': process.env.LUMA_BACKEND_ORIGIN ?? 'http://127.0.0.1:7070',
      '/discord': process.env.LUMA_BACKEND_ORIGIN ?? 'http://127.0.0.1:7070'
    }
  }
});
