import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getMe } from '../api/auth.js';

const AuthContext = createContext(null);

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 4000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const validatingRef = useRef(false);

  const validate = async () => {
    if (validatingRef.current) return;
    validatingRef.current = true;

    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      validatingRef.current = false;
      return;
    }

    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      try {
        const res = await getMe();
        setUser(res.data);
        setLoading(false);
        validatingRef.current = false;
        return;
      } catch (err) {
        const status = err.response?.status;

        if (status === 401) {
          // Token is genuinely invalid or expired — clear it and redirect via ProtectedRoute
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
          validatingRef.current = false;
          return;
        }

        // Network error or backend cold-starting (Render free tier sleeps after 15 min).
        // Retry before giving up so users aren't logged out just because the backend is waking up.
        const isLastAttempt = attempt === RETRY_ATTEMPTS - 1;
        if (!isLastAttempt) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        } else {
          // All retries exhausted — backend unreachable. Keep the token so the next
          // visit can try again; just clear the user so ProtectedRoute redirects to login.
          setUser(null);
          setLoading(false);
          validatingRef.current = false;
        }
      }
    }
  };

  useEffect(() => {
    validate();

    const onVisible = () => {
      // Re-validate when the user returns to the tab after a long absence so an
      // expired/changed token is caught immediately instead of on the next API call.
      if (document.visibilityState === 'visible' && localStorage.getItem('token')) {
        setLoading(true);
        validate();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
