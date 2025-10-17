import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

axios.defaults.withCredentials = true;
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
