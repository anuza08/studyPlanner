const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  link: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const reviewSchema = new mongoose.Schema({
  scheduledDate: { type: Date, required: true },
  day: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  isExtra: { type: Boolean, default: false },
});

const conceptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dateAdded: { type: Date, default: Date.now },
    priority: { type: String, enum: ['normal', 'hard'], default: 'normal' },
    reviews: [reviewSchema],
    notes: [noteSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Concept', conceptSchema);
