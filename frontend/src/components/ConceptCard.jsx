import React, { useState } from 'react';
import { completeReview, deleteConcept, togglePriority } from '../api/concepts.js';
import NotesSection from './NotesSection.jsx';
import EditConceptModal from './EditConceptModal.jsx';

const DAY_LABEL = {
  1:  'Day 1 · First Read',
  3:  'Day 3 · Recall',
  7:  'Day 7 · Reinforce',
  14: 'Day 14 · Solidify',
  30: 'Day 30 · Long-term',
  60: 'Day 60 · Mastered',
};
const DAY_COLOR = {
  1:  'chip-blue',
  3:  'chip-green',
  7:  'chip-orange',
  14: 'chip-purple',
  30: 'chip-purple',
  60: 'chip-purple',
};

function getChip(review) {
  if (!review) return { label: 'Review', color: 'chip-blue' };
  if (review.isExtra) return { label: '🔥 Hard Review', color: 'chip-red' };
  // Day 60+ repeating reviews
  if (review.day > 60) return { label: `Day ${review.day} · Ongoing`, color: 'chip-purple' };
  return {
    label: DAY_LABEL[review.day] || `Day ${review.day}`,
    color: DAY_COLOR[review.day] || 'chip-purple',
  };
}

export default function ConceptCard({ concept, todayReview, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const isCompleted = todayReview?.completed;
  const isHard = concept.priority === 'hard';
  const chip = getChip(todayReview);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await completeReview(concept._id, todayReview._id);
      onUpdate(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${concept.title}"?`)) return;
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

  return (
    <>
      <div className={`concept-card ${isCompleted ? 'completed' : ''} ${isHard ? 'hard-priority' : ''}`}>
        <div className="concept-card-header">
          <div className="concept-info">
            <div className="chip-row">
              <span className={`day-chip ${chip.color}`}>{chip.label}</span>
              {isHard && <span className="hard-badge">🔥 Hard</span>}
            </div>
            <h3 className="concept-title">{concept.title}</h3>
            {concept.description && (
              <p className="concept-desc">{concept.description}</p>
            )}
          </div>
          <div className="concept-actions">
            <button
              className={`btn ${isCompleted ? 'btn-success' : 'btn-primary'}`}
              onClick={handleComplete}
              disabled={loading}
            >
              {isCompleted ? '✓ Done' : 'Mark Done'}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Hide Notes' : 'Notes'}
            </button>
            <button
              className={`btn btn-sm ${isHard ? 'btn-hard' : 'btn-ghost'}`}
              onClick={handlePriority}
              title={isHard ? 'Mark as normal priority' : 'Mark as hard — review more often'}
            >
              {isHard ? '🔥 Hard' : '🏁 Normal'}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowEdit(true)}
              title="Edit concept"
            >
              Edit
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              title="Delete concept"
            >
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
