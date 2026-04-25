import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from "axios";
import './index.css'
import App from './App.tsx'

// Standardize Axios for the entire application
const envUrl = import.meta.env.VITE_API_URL || '';
axios.defaults.baseURL = envUrl === '' ? '' : (envUrl.startsWith('http') ? envUrl : `https://${envUrl}`);
axios.defaults.withCredentials = true;

import { NotificationProvider } from './context/NotificationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </StrictMode>,
)
