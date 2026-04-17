const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId:      { type: String, unique: true },
  name:           { type: String, required: true, trim: true },
  email:          { type: String, required: true, lowercase: true },
  phone:          { type: String, required: true },
  roomId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  roomType:       { type: String, required: true },
  checkIn:        { type: Date, required: true },
  checkOut:       { type: Date, required: true },
  nights:         { type: Number, default: 1 },
  guests:         { type: Number, default: 2 },
  specialRequests:{ type: String },
  totalAmount:    { type: Number },
  status:         { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending' },
  paymentStatus:  { type: String, enum: ['unpaid','paid','refunded'], default: 'unpaid' },
  paymentMethod:  { type: String, enum: ['online','offline'], default: 'offline' },
  razorpayOrderId:{ type: String },
  razorpayPaymentId:{ type: String },
  razorpaySignature:{ type: String },
  source:         { type: String, default: 'website' },
  notes:          { type: String },
}, { timestamps: true });

bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'CLR-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2,4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
