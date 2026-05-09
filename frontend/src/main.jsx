import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './App.css';

// Send cookies with every request (needed for auth)
axios.defaults.withCredentials = true;

// If token expires mid-session, redirect to login
axios.interceptors.response.use(
  (res) => res,
  (error) => {
    const is401 = error.response?.status === 401;
    const isAuthCheck = error.config?.url?.includes('/auth/me');
    const isAuthPage = ['/login', '/register'].includes(window.location.pathname);

    if (is401 && !isAuthCheck && !isAuthPage) {
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
