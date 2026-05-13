import { useEffect, useState } from 'react';
import { getTodayConcepts } from '../api/concepts.js';
import ConceptCard from '../components/ConceptCard.jsx';

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export default function Today() {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getTodayConcepts()
      .then((res) => setConcepts(res.data))
      .catch((err) => {
        // 401 is handled globally by the axios interceptor in main.jsx
        if (err.response?.status !== 401) {
          setError("Failed to load today's reviews");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (updatedConcept) => {
    const { start, end } = todayRange();
    setConcepts((prev) =>
      prev.map((c) => {
        if (c._id !== updatedConcept._id) return c;
        const todayReview = updatedConcept.reviews.find((r) => {
          const d = new Date(r.scheduledDate);
          return d >= start && d <= end;
        });
        return { ...updatedConcept, todayReview };
      })
    );
  };

  const handleDelete = (id) => setConcepts((prev) => prev.filter((c) => c._id !== id));

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const pending = concepts.filter((c) => !c.todayReview?.completed);
  const done = concepts.filter((c) => c.todayReview?.completed);

  if (loading) return <div className="loading">Loading today's reviews…</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Today's Reviews</h1>
          <p className="page-subtitle">{dateLabel}</p>
        </div>
        {concepts.length > 0 && (
          <div className="stat">{done.length} / {concepts.length} completed</div>
        )}
      </div>

      {concepts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h2>No reviews today!</h2>
          <p>Click <strong>+ Add Concept</strong> to start tracking a topic.</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section>
              <h2 className="section-title">Pending ({pending.length})</h2>
              <div className="cards-list">
                {pending.map((concept) => (
                  <ConceptCard
                    key={concept._id}
                    concept={concept}
                    todayReview={concept.todayReview}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
          {done.length > 0 && (
            <section>
              <h2 className="section-title section-title--done">Completed ({done.length})</h2>
              <div className="cards-list">
                {done.map((concept) => (
                  <ConceptCard
                    key={concept._id}
                    concept={concept}
                    todayReview={concept.todayReview}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
