const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  category:    { type: String, enum: ['water','land','cultural','adventure','wellness','kids'], default: 'land' },
  duration:    { type: String },
  price:       { type: Number, default: 0 },
  included:    { type: Boolean, default: true },
  maxPersons:  { type: Number },
  available:   { type: Boolean, default: true },
  featured:    { type: Boolean, default: false },
  image:       { url: String, public_id: String },
  icon:        { type: String, default: 'fas fa-star' },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
