import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { logout } from './api/auth.js';
import Today from './pages/Today.jsx';
import AllConcepts from './pages/AllConcepts.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AddConceptModal from './components/AddConceptModal.jsx';

function Nav({ onAdd }) {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="nav">
      <div className="nav-brand">📚 StudyTracker</div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          Today
        </Link>
        <Link
          to="/concepts"
          className={`nav-link ${location.pathname === '/concepts' ? 'active' : ''}`}
        >
          All Concepts
        </Link>
      </div>
      <div className="nav-right">
        <span className="nav-user">👤 {user?.name}</span>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Logout
        </button>
        <button className="btn btn-primary" onClick={onAdd}>
          + Add Concept
        </button>
      </div>
    </nav>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, loading } = useAuth();
  const location = useLocation();

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div className="app">
      {!isAuthPage && user && <Nav onAdd={() => setShowModal(true)} />}
      <main className={isAuthPage ? '' : 'main'}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Today key={refreshKey} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/concepts"
            element={
              <ProtectedRoute>
                <AllConcepts key={refreshKey} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {showModal && (
        <AddConceptModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
