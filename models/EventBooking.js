const mongoose = require('mongoose');

const eventBookingSchema = new mongoose.Schema({
  eventBookingId: { type: String, unique: true },
  eventId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  eventName:  { type: String, required: true },
  name:       { type: String, required: true },
  email:      { type: String, required: true, lowercase: true },
  phone:      { type: String, required: true },
  eventDate:  { type: Date, required: true },
  guests:     { type: Number, default: 10 },
  message:    { type: String },
  totalAmount:{ type: Number },
  status:     { type: String, enum: ['pending','confirmed','cancelled'], default: 'pending' },
  adminNotes: { type: String },
}, { timestamps: true });

eventBookingSchema.pre('save', function(next) {
  if (!this.eventBookingId) {
    this.eventBookingId = 'EVT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2,4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('EventBooking', eventBookingSchema);
