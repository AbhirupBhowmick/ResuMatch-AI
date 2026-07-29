import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from "axios";
import './index.css'
import App from './App.tsx'

// Standardize Axios for the entire application
const rawUrl = import.meta.env.VITE_API_URL || 'https://resumatch-api-fjh5bfbwh5bthxbs.eastasia-01.azurewebsites.net';
const envUrl = (rawUrl.trim() === '' || rawUrl.includes('railway.app') || rawUrl.includes('onrender.com')) 
  ? 'https://resumatch-api-fjh5bfbwh5bthxbs.eastasia-01.azurewebsites.net' 
  : rawUrl;
const formattedUrl = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
axios.defaults.baseURL = formattedUrl.replace(/\/+$/, '');
axios.defaults.withCredentials = true;

// Automatically attach JWT token to all outgoing request headers
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor to handle expired sessions / 401 Unauthorized
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_tier");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

import { NotificationProvider } from './context/NotificationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </StrictMode>,
)
