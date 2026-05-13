import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getMe } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const validatingRef = useRef(false);

  /**
   * Calls GET /auth/me and updates auth state.
   *
   * showLoading – controls whether loading=true is shown while the call is in
   *   flight. Set true on initial mount (shows spinner), false for background
   *   re-checks (e.g. tab-focus) so the Nav never disappears mid-session.
   *
   * retries – extra attempts on network error (cold start on Render free tier).
   *   Only used on initial load; background re-checks use 0 retries so a brief
   *   network hiccup doesn't log the user out.
   */
  const validate = async ({ showLoading = false, retries = 0 } = {}) => {
    if (validatingRef.current) return;
    validatingRef.current = true;

    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      if (showLoading) setLoading(false);
      validatingRef.current = false;
      return;
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await getMe();
        setUser(res.data);
        if (showLoading) setLoading(false);
        validatingRef.current = false;
        return;
      } catch (err) {
        if (err.response?.status === 401) {
          // Genuine auth failure — token is invalid or JWT_SECRET changed on Render.
          localStorage.removeItem('token');
          setUser(null);
          if (showLoading) setLoading(false);
          validatingRef.current = false;
          return;
        }
        // Network error (Render cold start). Retry if attempts remain.
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 4000));
        }
      }
    }

    // All retries exhausted — backend unreachable. Keep the token in localStorage
    // so the next page load can retry. Clear user so ProtectedRoute redirects.
    setUser(null);
    if (showLoading) setLoading(false);
    validatingRef.current = false;
  };

  useEffect(() => {
    // Initial load: show the spinner and retry up to 2× so Render's cold start
    // (30–50 s wake-up) doesn't immediately log the user out.
    validate({ showLoading: true, retries: 2 });

    const onVisible = () => {
      // Silent re-check when the user returns to the tab after a long absence.
      // No spinner (Nav stays visible), no retries (one quick check is enough).
      if (document.visibilityState === 'visible' && localStorage.getItem('token')) {
        validate({ showLoading: false, retries: 0 });
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
