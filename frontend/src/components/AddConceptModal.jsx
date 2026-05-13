import React, { useState } from 'react';
import { createConcept } from '../api/concepts.js';

const SCHEDULE_LABELS = ['Day 1', 'Day 3', 'Day 7', 'Day 14', 'Day 30', 'Day 60'];

export default function AddConceptModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Concept name is required');
      return;
    }
    setLoading(true);
    try {
      await createConcept({ title: title.trim(), description: description.trim() });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add concept');
      setLoading(false);
    }
  };
  console.log(require('crypto').randomBytes(64).toString('hex'))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Concept</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Concept Name *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Binary Search, Two Pointers, DP..."
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief notes about this concept..."
              rows={3}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="schedule-preview">
            <p className="schedule-label">Reviews will be auto-scheduled for:</p>
            <div className="schedule-chips">
              {SCHEDULE_LABELS.map((label, i) => (
                <span key={i} className="schedule-chip">{label}</span>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Concept'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
