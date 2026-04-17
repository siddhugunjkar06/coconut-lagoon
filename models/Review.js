const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String },
  review: { type: String, required: true },
  source: { type: String, default: 'website' },
  approved: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  avatar: String,
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
