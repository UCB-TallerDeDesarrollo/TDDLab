import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  appType: 'spa',
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.test.js': 'empty', '.test.ts': 'empty', '.test.tsx': 'empty' },
    },
  },
  server: {
    watch: {
      ignored: [
        '**/node_modules/**'
        ,'**/.git/**'
        , '**/dist/**'
        ,'**/test/**'
        ,'**/tests/**'
      ]
    }
  },
  plugins: [
    react(),
    {
      name: 'serve-spa-index-html',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const url = req.url ?? '';
          const isAsset =
            url.startsWith('/@') ||
            url.startsWith('/src/') ||
            url.startsWith('/node_modules/') ||
            url.includes('.') ||
            url.startsWith('/__vite');

          if (!isAsset) {
            req.url = '/index.html';
          }
          next();
        });
      },
    },
  ],
})
