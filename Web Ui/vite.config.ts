import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import terminal from 'vite-plugin-terminal'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  appType: 'spa',
  plugins: [
    react(),
    terminal({
      console: "terminal"
    }),
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
