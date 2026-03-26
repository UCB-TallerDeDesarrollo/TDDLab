import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import tddTheme from './theme/tddTheme';

// Cargar Iconify desde CDN - Permite usar cualquier colección de íconos
const script = document.createElement('script');
script.src = 'https://code.iconify.design/iconify-icon/1.0.8/iconify-icon.min.js';
document.head.appendChild(script);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={tddTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
