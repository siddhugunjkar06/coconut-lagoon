const mongoose = require('mongoose');

const diningItemSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  category:    { type: String, enum: ['breakfast','lunch','dinner','snacks','beverages','special'], default: 'lunch' },
  price:       { type: Number },
  isVeg:       { type: Boolean, default: true },
  isSpecial:   { type: Boolean, default: false },
  available:   { type: Boolean, default: true },
  image:       { url: String, public_id: String },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('DiningItem', diningItemSchema);
