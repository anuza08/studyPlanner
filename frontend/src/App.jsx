import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Today from './pages/Today.jsx';
import AllConcepts from './pages/AllConcepts.jsx';
import AddConceptModal from './components/AddConceptModal.jsx';

function Nav({ onAdd }) {
  const location = useLocation();
  return (
    <nav className="nav">
      <div className="nav-brand">
        <span>📚</span> StudyTracker
      </div>
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
      <button className="btn btn-primary" onClick={onAdd}>
        + Add Concept
      </button>
    </nav>
  );
}

export default function App() {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleConceptAdded = () => {
    setShowModal(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Nav onAdd={() => setShowModal(true)} />
        <main className="main">
          <Routes>
            <Route path="/" element={<Today key={refreshKey} />} />
            <Route path="/concepts" element={<AllConcepts key={refreshKey} />} />
          </Routes>
        </main>
        {showModal && (
          <AddConceptModal onClose={() => setShowModal(false)} onSuccess={handleConceptAdded} />
        )}
      </div>
    </BrowserRouter>
  );
}
