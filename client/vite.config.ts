import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/store/package-limits': {
          target: env.STORE_LIMITS_PROXY_TARGET || 'https://lumamc.net',
          changeOrigin: true
        },
        '/api/store': 'http://127.0.0.1:7070',
        '/api/render': 'http://127.0.0.1:7070'
      }
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') }
    }
  };
});
