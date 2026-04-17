const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  capacity: { type: Number, default: 2 },
  size: { type: String },
  amenities: [String],
  images: [{ url: String, public_id: String }],
  available: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
