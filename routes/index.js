const express = require('express');
const router  = express.Router();
const Booking = require('../models/Booking');
const Room    = require('../models/Room');
const Gallery = require('../models/Gallery');
const Review  = require('../models/Review');
const Contact = require('../models/Contact');
const moment  = require('moment');

// HOME
router.get('/', async (req, res) => {
  try {
    const rooms   = await Room.find({ available: true }).sort({ featured: -1, order: 1 }).limit(6);
    const gallery = await Gallery.find({ featured: true }).sort({ order: 1 }).limit(12);
    const reviews = await Review.find({ approved: true, featured: true }).limit(6);
    res.render('index', { rooms, gallery, reviews, moment, page: 'home' });
  } catch (err) {
    res.render('index', { rooms: [], gallery: [], reviews: [], moment, page: 'home' });
  }
});

// ROOMS listing (with availability + payment modal)
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find({ available: true }).sort({ order: 1, price: 1 });
    res.render('rooms', { rooms, page: 'rooms' });
  } catch { res.render('rooms', { rooms: [], page: 'rooms' }); }
});

// GALLERY
router.get('/gallery', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const gallery = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });
    res.render('gallery', { gallery, currentCategory: category || 'all', page: 'gallery' });
  } catch { res.render('gallery', { gallery: [], currentCategory: 'all', page: 'gallery' }); }
});

// ABOUT
router.get('/about', (req, res) => res.render('about', { page: 'about' }));

// CONTACT
router.get('/contact', (req, res) => res.render('contact', { page: 'contact', success: null, error: null }));
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    await Contact.create({ name, email, phone, subject, message });
    res.render('contact', { page: 'contact', success: 'Thank you! We will get back to you within 24 hours.', error: null });
  } catch {
    res.render('contact', { page: 'contact', success: null, error: 'Something went wrong. Please try again.' });
  }
});

// BOOKING page (offline/fallback)
router.get('/booking', async (req, res) => {
  try {
    const rooms = await Room.find({ available: true }).sort({ price: 1 });
    const { roomId, checkIn, checkOut } = req.query;
    res.render('booking', { rooms, page: 'booking', success: null, error: null, prefill: { roomId, checkIn, checkOut } });
  } catch { res.render('booking', { rooms: [], page: 'booking', success: null, error: null, prefill: {} }); }
});

router.post('/booking', async (req, res) => {
  try {
    const rooms = await Room.find({ available: true }).sort({ price: 1 });
    const { name, email, phone, roomType, checkIn, checkOut, guests, specialRequests } = req.body;
    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / 86400000));
    const room = await Room.findById(roomType).catch(() => null);
    const totalAmount = room ? room.price * nights : 0;
    const booking = await Booking.create({
      name, email, phone,
      roomId:    room?._id,
      roomType:  room ? room.name : roomType,
      checkIn:   checkInDate, checkOut: checkOutDate,
      nights, guests: parseInt(guests) || 2,
      specialRequests, totalAmount,
      paymentMethod: 'offline',
    });
    res.render('booking', {
      rooms, page: 'booking', prefill: {},
      success: `Booking received! Your ID is <strong>${booking.bookingId}</strong>. We'll call you at ${phone} within 2 hours to confirm.`,
      error: null
    });
  } catch (err) {
    console.error(err);
    const rooms = await Room.find({ available: true }).catch(() => []);
    res.render('booking', { rooms, page: 'booking', success: null, error: 'Booking failed. Please call +91 77759 47728.', prefill: {} });
  }
});

// BOOKING STATUS
router.get('/booking/status', (req, res) =>
  res.render('booking-status', { page: 'booking', booking: null, error: null })
);
router.post('/booking/status', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.body.bookingId.trim().toUpperCase() });
    res.render('booking-status', { page: 'booking', booking, error: booking ? null : 'Booking not found. Please check your ID.' });
  } catch {
    res.render('booking-status', { page: 'booking', booking: null, error: 'Error fetching booking.' });
  }
});

module.exports = router;
