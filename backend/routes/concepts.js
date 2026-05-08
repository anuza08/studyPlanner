const express = require('express');
const router = express.Router();
const Concept = require('../models/Concept');
const auth = require('../middleware/auth');

const NEXT_DAY = { 7: 10, 10: 14, 14: 21, 21: 30, 30: 60 };

function dayRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function daysFromNow(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

// All routes require auth
router.use(auth);

// GET /api/concepts/today
router.get('/today', async (req, res) => {
  try {
    const { start, end } = dayRange();
    const concepts = await Concept.find({
      userId: req.userId,
      'reviews.scheduledDate': { $gte: start, $lte: end },
    });

    const result = concepts.map((concept) => {
      const todayReview = concept.reviews.find(
        (r) => r.scheduledDate >= start && r.scheduledDate <= end
      );
      return { ...concept.toObject(), todayReview };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/concepts
router.get('/', async (req, res) => {
  try {
    const concepts = await Concept.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(concepts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/concepts
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reviews = [1, 2, 3, 4, 5, 6, 7].map((day) => {
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + (day - 1));
      return { scheduledDate, day };
    });

    const concept = new Concept({ userId: req.userId, title, description, reviews });
    await concept.save();
    res.status(201).json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/concepts/:id/reviews/:reviewId/complete
router.patch('/:id/reviews/:reviewId/complete', async (req, res) => {
  try {
    const concept = await Concept.findOne({ _id: req.params.id, userId: req.userId });
    if (!concept) return res.status(404).json({ error: 'Concept not found' });

    const review = concept.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    review.completed = !review.completed;
    review.completedAt = review.completed ? new Date() : undefined;

    if (review.completed) {
      if (concept.priority === 'hard') {
        const nextDate = daysFromNow(3);
        const hasSoon = concept.reviews.some(
          (r) =>
            !r.completed &&
            new Date(r.scheduledDate) >= new Date() &&
            new Date(r.scheduledDate) <= new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
        );
        if (!hasSoon) {
          concept.reviews.push({ scheduledDate: nextDate, day: review.day, isExtra: true });
        }
      } else {
        const nextDay = NEXT_DAY[review.day];
        if (nextDay) {
          const alreadyScheduled = concept.reviews.some((r) => r.day === nextDay && !r.isExtra);
          if (!alreadyScheduled) {
            const base = new Date(concept.dateAdded);
            base.setHours(0, 0, 0, 0);
            const scheduledDate = new Date(base);
            scheduledDate.setDate(base.getDate() + nextDay - 1);
            concept.reviews.push({ scheduledDate, day: nextDay });
          }
        }
      }
    }

    await concept.save();
    res.json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/concepts/:id/priority
router.patch('/:id/priority', async (req, res) => {
  try {
    const concept = await Concept.findOne({ _id: req.params.id, userId: req.userId });
    if (!concept) return res.status(404).json({ error: 'Concept not found' });

    concept.priority = concept.priority === 'hard' ? 'normal' : 'hard';

    if (concept.priority === 'hard') {
      const twoDaysOut = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const hasSoon = concept.reviews.some(
        (r) => !r.completed && new Date(r.scheduledDate) <= twoDaysOut && new Date(r.scheduledDate) >= new Date()
      );
      if (!hasSoon) {
        concept.reviews.push({ scheduledDate: daysFromNow(1), day: 1, isExtra: true });
      }
    }

    await concept.save();
    res.json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/concepts/:id/notes
router.post('/:id/notes', async (req, res) => {
  try {
    const { content, link } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const concept = await Concept.findOne({ _id: req.params.id, userId: req.userId });
    if (!concept) return res.status(404).json({ error: 'Concept not found' });

    concept.notes.push({ content, link });
    await concept.save();
    res.json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/concepts/:id/notes/:noteId
router.delete('/:id/notes/:noteId', async (req, res) => {
  try {
    const concept = await Concept.findOne({ _id: req.params.id, userId: req.userId });
    if (!concept) return res.status(404).json({ error: 'Concept not found' });

    concept.notes.pull({ _id: req.params.noteId });
    await concept.save();
    res.json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/concepts/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const concept = await Concept.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, description },
      { new: true }
    );
    if (!concept) return res.status(404).json({ error: 'Concept not found' });
    res.json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/concepts/:id
router.delete('/:id', async (req, res) => {
  try {
    await Concept.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Concept deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
