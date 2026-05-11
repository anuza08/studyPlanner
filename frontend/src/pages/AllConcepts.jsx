import React, { useEffect, useState } from 'react';
import { getAllConcepts, deleteConcept, togglePriority } from '../api/concepts.js';
import NotesSection from '../components/NotesSection.jsx';
import EditConceptModal from '../components/EditConceptModal.jsx';

const DAY_COLOR = { 1: 'chip-blue', 3: 'chip-green', 7: 'chip-orange', 14: 'chip-purple', 30: 'chip-purple', 60: 'chip-purple' };

function ConceptRow({ concept, onDelete, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const isHard = concept.priority === 'hard';

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${concept.title}" and all its reviews?`)) return;
    try {
      await deleteConcept(concept._id);
      onDelete(concept._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePriority = async () => {
    try {
      const res = await togglePriority(concept._id);
      onUpdate(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const completedCount = concept.reviews.filter((r) => r.completed).length;
  const totalReviews = concept.reviews.length;

  return (
    <>
      <div className={`concept-row ${isHard ? 'hard-priority' : ''}`}>
        <div className="concept-row-header">
          <div className="concept-info">
            <div className="chip-row">
              <h3 className="concept-title">{concept.title}</h3>
              {isHard && <span className="hard-badge">🔥 Hard</span>}
            </div>
            {concept.description && <p className="concept-desc">{concept.description}</p>}
            <p className="concept-date">
              Added{' '}
              {new Date(concept.dateAdded).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
              &nbsp;·&nbsp;{completedCount}/{totalReviews} reviews done
            </p>
            <div className="review-schedule">
              {concept.reviews.map((review) => (
                <span
                  key={review._id}
                  className={`review-chip ${review.isExtra ? 'chip-red' : DAY_COLOR[review.day]} ${review.completed ? 'review-done' : ''}`}
                  title={new Date(review.scheduledDate).toLocaleDateString()}
                >
                  {review.completed ? '✓ ' : ''}{review.isExtra ? '🔥' : `Day ${review.day}`}
                </span>
              ))}
            </div>
          </div>
          <div className="concept-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Hide Notes' : `Notes (${concept.notes.length})`}
            </button>
            <button
              className={`btn btn-sm ${isHard ? 'btn-hard' : 'btn-ghost'}`}
              onClick={handlePriority}
              title={isHard ? 'Mark as normal' : 'Mark as hard'}
            >
              {isHard ? '🔥 Hard' : '🏁 Normal'}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowEdit(true)}
            >
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              ✕
            </button>
          </div>
        </div>

        {expanded && (
          <NotesSection
            conceptId={concept._id}
            notes={concept.notes}
            onUpdate={onUpdate}
          />
        )}
      </div>

      {showEdit && (
        <EditConceptModal
          concept={concept}
          onClose={() => setShowEdit(false)}
          onSuccess={(updated) => {
            onUpdate(updated);
            setShowEdit(false);
          }}
        />
      )}
    </>
  );
}

export default function AllConcepts() {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllConcepts()
      .then((res) => setConcepts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => setConcepts((prev) => prev.filter((c) => c._id !== id));
  const handleUpdate = (updated) =>
    setConcepts((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));

  const filtered = concepts.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const hardCount = concepts.filter((c) => c.priority === 'hard').length;

  if (loading) return <div className="loading">Loading concepts…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>All Concepts</h1>
          <p className="page-subtitle">
            {concepts.length} tracked{hardCount > 0 ? ` · ${hardCount} hard` : ''}
          </p>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Search concepts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>{search ? 'No matching concepts' : 'No concepts yet!'}</h2>
          <p>
            {search ? 'Try a different search term.' : 'Click + Add Concept to start tracking.'}
          </p>
        </div>
      ) : (
        <div className="concepts-list">
          {filtered.map((concept) => (
            <ConceptRow
              key={concept._id}
              concept={concept}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
