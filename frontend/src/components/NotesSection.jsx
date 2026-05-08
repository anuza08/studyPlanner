import React, { useState } from 'react';
import { addNote, deleteNote } from '../api/concepts.js';

export default function NotesSection({ conceptId, notes, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await addNote(conceptId, { content: content.trim(), link: link.trim() });
      onUpdate(res.data);
      setContent('');
      setLink('');
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      const res = await deleteNote(conceptId, noteId);
      onUpdate(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="notes-section">
      <div className="notes-header">
        <span className="notes-title">📝 Notes &amp; Problem Links</span>
        <button className="btn-text" onClick={() => setShowForm(!showForm)}>
          {showForm ? '− Cancel' : '+ Add Note'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="note-form">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Note or problem name..."
            autoFocus
          />
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Problem link (optional)..."
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={loading || !content.trim()}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}

      {notes.length === 0 && !showForm && (
        <p className="notes-empty">No notes yet. Add problem links or reminders here.</p>
      )}

      <ul className="notes-list">
        {notes.map((note) => (
          <li key={note._id} className="note-item">
            <div className="note-content">
              {note.link ? (
                <a
                  href={note.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="note-link"
                >
                  🔗 {note.content}
                </a>
              ) : (
                <span>• {note.content}</span>
              )}
            </div>
            <button
              className="note-delete"
              onClick={() => handleDelete(note._id)}
              title="Delete note"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
