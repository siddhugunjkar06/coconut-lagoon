const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const razorpay = require('../config/razorpay');
const Booking  = require('../models/Booking');
const Room     = require('../models/Room');
const { sendBookingConfirmation } = require('../config/mailer');

// ── Step 1: Create Razorpay order ──────────────────────────────────────────
router.post('/create-order', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, name, email, phone, specialRequests } = req.body;

    const room = await Room.findById(roomId);
    if (!room || !room.available) return res.json({ success: false, error: 'Room not available' });

    const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
    const totalAmount = room.price * nights;

    // Create Razorpay order (amount in paise)
    const rpOrder = await razorpay.orders.create({
      amount:   totalAmount * 100,
      currency: 'INR',
      receipt:  'CLR-' + Date.now(),
      notes:    { roomId, checkIn, checkOut, name, email, phone },
    });

    // Save pending booking
    const booking = await Booking.create({
      name, email, phone,
      roomId:    room._id,
      roomType:  room.name,
      checkIn:   new Date(checkIn),
      checkOut:  new Date(checkOut),
      nights, guests: parseInt(guests) || 2,
      specialRequests,
      totalAmount,
      status:        'pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'online',
      razorpayOrderId: rpOrder.id,
    });

    res.json({
      success: true,
      orderId:    rpOrder.id,
      amount:     rpOrder.amount,
      currency:   rpOrder.currency,
      bookingId:  booking.bookingId,
      bookingDbId: booking._id,
      keyId:      process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.json({ success: false, error: err.message });
  }
});

// ── Step 2: Verify payment & confirm booking ───────────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingDbId } = req.body;

    const body  = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      await Booking.findByIdAndUpdate(bookingDbId, { status: 'cancelled', paymentStatus: 'unpaid' });
      return res.json({ success: false, error: 'Payment verification failed' });
    }

    const booking = await Booking.findByIdAndUpdate(bookingDbId, {
      status:             'confirmed',
      paymentStatus:      'paid',
      razorpayPaymentId:  razorpay_payment_id,
      razorpaySignature:  razorpay_signature,
    }, { new: true });

    await sendBookingConfirmation(booking);

    res.json({ success: true, bookingId: booking.bookingId });
  } catch (err) {
    console.error('Verify error:', err);
    res.json({ success: false, error: err.message });
  }
});

// ── Availability check ─────────────────────────────────────────────────────
router.get('/check-availability', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.query;
    const room = await Room.findById(roomId);
    if (!room) return res.json({ available: false });

    // Check for overlapping confirmed bookings
    const conflict = await Booking.findOne({
      roomId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } },
      ],
    });

    res.json({ available: !conflict && room.available, room: { name: room.name, price: room.price } });
  } catch (err) {
    res.json({ available: false });
  }
});

module.exports = router;
