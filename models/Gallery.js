const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String },
  category: { type: String, enum: ['resort','rooms','dining','activities','events','nature'], default: 'resort' },
  image: { url: String, public_id: String },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
