import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMe } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token'); // clear bad/expired token
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Listen for token expiry fired by axios interceptor
  useEffect(() => {
    const handle = () => setUser(null);
    window.addEventListener('auth:expired', handle);
    return () => window.removeEventListener('auth:expired', handle);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
