const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { storage } = require('../config/cloudinary');
const { cloudinary } = require('../config/cloudinary');
const upload  = multer({ storage });
const Admin   = require('../models/Admin');
const Booking = require('../models/Booking');
const Room    = require('../models/Room');
const Gallery = require('../models/Gallery');
const Review  = require('../models/Review');
const Contact = require('../models/Contact');
const EventBooking = require('../models/EventBooking');
const { isAdmin, isGuest } = require('../middleware/auth');
const moment  = require('moment');

// LOGIN
router.get('/login', isGuest, (req, res) =>
  res.render('admin/login', { error: req.flash('error'), success: req.flash('success') })
);

router.post('/login', isGuest, async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin || !(await admin.comparePassword(password))) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/admin/login');
    }
    req.session.adminId   = admin._id;
    req.session.adminName = admin.name;
    req.session.adminRole = admin.role;
    admin.lastLogin = new Date();
    await admin.save();
    res.redirect('/admin/dashboard');
  } catch (err) {
    req.flash('error', 'Login failed. Try again.');
    res.redirect('/admin/login');
  }
});

router.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/admin/login'); });

// DASHBOARD
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const [
      totalBookings, pendingBookings, confirmedBookings,
      totalRooms, totalContacts, recentBookings,
      pendingReviews, totalEventBookings, pendingEvents,
      recentEventBookings
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Room.countDocuments({ available: true }),
      Contact.countDocuments({ read: false }),
      Booking.find().sort({ createdAt: -1 }).limit(8),
      Review.countDocuments({ approved: false }),
      EventBooking.countDocuments(),
      EventBooking.countDocuments({ status: 'pending' }),
      EventBooking.find().sort({ createdAt: -1 }).limit(6),
    ]);

    const revenueAgg = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.render('admin/dashboard', {
      admin: { name: req.session.adminName, role: req.session.adminRole },
      stats: { totalBookings, pendingBookings, confirmedBookings, totalRooms, totalContacts, totalRevenue, pendingReviews, totalEventBookings, pendingEvents },
      recentBookings, recentEventBookings, moment,
      page: 'dashboard'
    });
  } catch (err) {
    console.error(err);
    res.render('admin/dashboard', { admin: { name: req.session.adminName }, stats: {}, recentBookings: [], recentEventBookings: [], moment, page: 'dashboard' });
  }
});

// BOOKINGS
router.get('/bookings', isAdmin, async (req, res) => {
  try {
    const { status, search, page: pg = 1 } = req.query;
    const limit = 15, skip = (pg - 1) * limit;
    let filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { bookingId: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') }
    ];
    const [bookings, total] = await Promise.all([
      Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments(filter)
    ]);
    res.render('admin/bookings', {
      admin: { name: req.session.adminName },
      bookings, total, currentPage: parseInt(pg),
      totalPages: Math.ceil(total / limit),
      status: status || 'all', search: search || '', moment, page: 'bookings'
    });
  } catch (err) {
    res.render('admin/bookings', { admin: { name: req.session.adminName }, bookings: [], total: 0, currentPage: 1, totalPages: 1, status: 'all', search: '', moment, page: 'bookings' });
  }
});

router.get('/bookings/:id', isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.redirect('/admin/bookings');
    res.render('admin/booking-detail', { admin: { name: req.session.adminName }, booking, moment, page: 'bookings' });
  } catch { res.redirect('/admin/bookings'); }
});

router.post('/bookings/:id/status', isAdmin, async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status, notes: req.body.notes });
    req.flash('success', 'Booking updated');
    res.redirect('/admin/bookings/' + req.params.id);
  } catch { res.redirect('/admin/bookings'); }
});

router.delete('/bookings/:id', isAdmin, async (req, res) => {
  try { await Booking.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch { res.json({ success: false }); }
});

// ROOMS
router.get('/rooms', isAdmin, async (req, res) => {
  try {
    const rooms = await Room.find().sort({ order: 1, createdAt: -1 });
    res.render('admin/rooms', { admin: { name: req.session.adminName }, rooms, page: 'rooms', success: req.flash('success'), error: req.flash('error') });
  } catch {
    res.render('admin/rooms', { admin: { name: req.session.adminName }, rooms: [], page: 'rooms', success: [], error: [] });
  }
});

router.get('/rooms/new', isAdmin, (req, res) =>
  res.render('admin/room-form', { admin: { name: req.session.adminName }, room: null, page: 'rooms', error: null })
);

router.post('/rooms', isAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const { name, type, description, price, capacity, size, amenities } = req.body;
    const images = req.files ? req.files.map(f => ({ url: f.path, public_id: f.filename })) : [];
    const amenitiesArr = amenities ? (Array.isArray(amenities) ? amenities : amenities.split(',').map(a => a.trim())) : [];
    await Room.create({ name, type, description, price: parseFloat(price), capacity: parseInt(capacity), size, amenities: amenitiesArr, images });
    req.flash('success', 'Room created successfully');
    res.redirect('/admin/rooms');
  } catch (err) {
    res.render('admin/room-form', { admin: { name: req.session.adminName }, room: null, page: 'rooms', error: err.message });
  }
});

router.get('/rooms/:id/edit', isAdmin, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    res.render('admin/room-form', { admin: { name: req.session.adminName }, room, page: 'rooms', error: null });
  } catch { res.redirect('/admin/rooms'); }
});

router.put('/rooms/:id', isAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const { name, type, description, price, capacity, size, amenities, available, featured } = req.body;
    const newImages = req.files ? req.files.map(f => ({ url: f.path, public_id: f.filename })) : [];
    const amenitiesArr = amenities ? (Array.isArray(amenities) ? amenities : amenities.split(',').map(a => a.trim())) : [];
    const upd = { name, type, description, price: parseFloat(price), capacity: parseInt(capacity), size, amenities: amenitiesArr, available: available === 'on', featured: featured === 'on' };
    if (newImages.length > 0) upd.$push = { images: { $each: newImages } };
    await Room.findByIdAndUpdate(req.params.id, upd);
    req.flash('success', 'Room updated');
    res.redirect('/admin/rooms');
  } catch (err) { req.flash('error', err.message); res.redirect('/admin/rooms'); }
});

router.delete('/rooms/:id', isAdmin, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (room?.images) for (const img of room.images) if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch { res.json({ success: false }); }
});

// GALLERY
router.get('/gallery', isAdmin, async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ order: 1, createdAt: -1 });
    res.render('admin/gallery', { admin: { name: req.session.adminName }, gallery, page: 'gallery', success: req.flash('success') });
  } catch {
    res.render('admin/gallery', { admin: { name: req.session.adminName }, gallery: [], page: 'gallery', success: [] });
  }
});

router.post('/gallery', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, category, featured } = req.body;
    const image = req.file ? { url: req.file.path, public_id: req.file.filename } : null;
    if (!image) { req.flash('error', 'Image required'); return res.redirect('/admin/gallery'); }
    await Gallery.create({ title, category, image, featured: featured === 'on' });
    req.flash('success', 'Image uploaded');
    res.redirect('/admin/gallery');
  } catch (err) { req.flash('error', err.message); res.redirect('/admin/gallery'); }
});

router.delete('/gallery/:id', isAdmin, async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (item?.image?.public_id) await cloudinary.uploader.destroy(item.image.public_id);
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch { res.json({ success: false }); }
});

// REVIEWS
router.get('/reviews', isAdmin, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.render('admin/reviews', { admin: { name: req.session.adminName }, reviews, page: 'reviews', moment });
  } catch {
    res.render('admin/reviews', { admin: { name: req.session.adminName }, reviews: [], page: 'reviews', moment });
  }
});
router.post('/reviews/:id/approve', isAdmin, async (req, res) => {
  try { await Review.findByIdAndUpdate(req.params.id, { approved: true }); res.json({ success: true }); }
  catch { res.json({ success: false }); }
});
router.post('/reviews/:id/feature', isAdmin, async (req, res) => {
  try {
    const r = await Review.findById(req.params.id);
    await Review.findByIdAndUpdate(req.params.id, { featured: !r.featured });
    res.json({ success: true });
  } catch { res.json({ success: false }); }
});
router.delete('/reviews/:id', isAdmin, async (req, res) => {
  try { await Review.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch { res.json({ success: false }); }
});

// CONTACTS
router.get('/contacts', isAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    await Contact.updateMany({ read: false }, { read: true });
    res.render('admin/contacts', { admin: { name: req.session.adminName }, contacts, page: 'contacts', moment });
  } catch {
    res.render('admin/contacts', { admin: { name: req.session.adminName }, contacts: [], page: 'contacts', moment });
  }
});
router.delete('/contacts/:id', isAdmin, async (req, res) => {
  try { await Contact.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch { res.json({ success: false }); }
});

// SETTINGS
router.get('/settings', isAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.session.adminId);
    res.render('admin/settings', { admin: { ...admin.toObject(), name: req.session.adminName }, page: 'settings', success: req.flash('success'), error: req.flash('error') });
  } catch { res.redirect('/admin/dashboard'); }
});

router.post('/settings/password', isAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.session.adminId);
    if (!(await admin.comparePassword(currentPassword))) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/admin/settings');
    }
    admin.password = newPassword;
    await admin.save();
    req.flash('success', 'Password updated successfully');
    res.redirect('/admin/settings');
  } catch { req.flash('error', 'Update failed'); res.redirect('/admin/settings'); }
});

module.exports = router;
