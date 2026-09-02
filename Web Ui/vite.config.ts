import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  appType: 'spa',
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
  optimizeDeps: {
      // Fuerza a Vite a procesar correctamente estos submódulos antes de construir
      // include: ['firebase/app', 'firebase/auth'],
    },
  build: {
    commonjsOptions: {
      // Evita conflictos con transformaciones CommonJS en paquetes modernos
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'chart-libs': ['chart.js', 'react-chartjs-2', 'recharts'],
          'mui-libs': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled']
        }
      }
    }
  },
  resolve: {
      alias: {
        // Fuerza a Vite a resolver cualquier importación suelta hacia el módulo de app
        // 'firebase': 'firebase/app'
      }
    },
})
