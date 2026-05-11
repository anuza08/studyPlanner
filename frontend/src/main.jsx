import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './App.css';

// Attach token from localStorage to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear token and hard-redirect to login (skip login/register endpoints to avoid loops)
axios.interceptors.response.use(
  (res) => res,
  (error) => {
    const is401 = error.response?.status === 401;
    const url = error.config?.url || '';
    const isLoginOrRegister = url.includes('/auth/login') || url.includes('/auth/register');
    const isAuthPage = ['/login', '/register'].includes(window.location.pathname);

    if (is401 && !isLoginOrRegister && !isAuthPage) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
