const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  category:    { type: String, enum: ['wedding','birthday','corporate','festival','private','other'], default: 'private' },
  capacity:    { type: Number, default: 50 },
  priceFrom:   { type: Number, default: 0 },
  duration:    { type: String },
  includes:    [String],
  images:      [{ url: String, public_id: String }],
  available:   { type: Boolean, default: true },
  featured:    { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
