import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './App.css';

axios.defaults.withCredentials = true;

// When any API call returns 401, fire a custom event so AuthContext can react
axios.interceptors.response.use(
  (res) => res,
  (error) => {
    const is401 = error.response?.status === 401;
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    const isAuthPage = ['/login', '/register'].includes(window.location.pathname);

    if (is401 && !isAuthEndpoint && !isAuthPage) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
