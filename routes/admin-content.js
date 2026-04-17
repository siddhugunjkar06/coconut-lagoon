const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const { storage, cloudinary } = require('../config/cloudinary');
const upload   = multer({ storage });
const { isAdmin } = require('../middleware/auth');
const Event        = require('../models/Event');
const EventBooking = require('../models/EventBooking');
const Activity     = require('../models/Activity');
const DiningItem   = require('../models/DiningItem');
const moment       = require('moment');

// ══════════════════════════════════════════
//  DINING MANAGEMENT
// ══════════════════════════════════════════
router.get('/dining', isAdmin, async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const items = await DiningItem.find(filter).sort({ order: 1 });
  res.render('admin/dining', {
    admin: { name: req.session.adminName },
    items, currentCat: category || 'all',
    page: 'dining',
    success: req.flash('success'), error: req.flash('error'),
  });
});

router.post('/dining', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, price, isVeg, isSpecial, order } = req.body;
    const image = req.file ? { url: req.file.path, public_id: req.file.filename } : undefined;
    await DiningItem.create({ name, description, category, price: parseFloat(price)||0, isVeg: isVeg==='true', isSpecial: isSpecial==='true', available: true, image, order: parseInt(order)||0 });
    req.flash('success', 'Menu item added');
    res.redirect('/admin/dining');
  } catch(e) { req.flash('error', e.message); res.redirect('/admin/dining'); }
});

router.put('/dining/:id', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, price, isVeg, isSpecial, available, order } = req.body;
    const upd = { name, description, category, price: parseFloat(price)||0, isVeg: isVeg==='true', isSpecial: isSpecial==='true', available: available==='true', order: parseInt(order)||0 };
    if (req.file) upd.image = { url: req.file.path, public_id: req.file.filename };
    await DiningItem.findByIdAndUpdate(req.params.id, upd);
    req.flash('success', 'Item updated');
    res.redirect('/admin/dining');
  } catch(e) { req.flash('error', e.message); res.redirect('/admin/dining'); }
});

router.delete('/dining/:id', isAdmin, async (req, res) => {
  try {
    const item = await DiningItem.findById(req.params.id);
    if (item?.image?.public_id) await cloudinary.uploader.destroy(item.image.public_id);
    await DiningItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch(e) { res.json({ success: false }); }
});

// ══════════════════════════════════════════
//  ACTIVITIES MANAGEMENT
// ══════════════════════════════════════════
router.get('/activities', isAdmin, async (req, res) => {
  const activities = await Activity.find().sort({ order: 1 });
  res.render('admin/activities', {
    admin: { name: req.session.adminName },
    activities, page: 'activities',
    success: req.flash('success'), error: req.flash('error'),
  });
});

router.post('/activities', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, duration, price, included, maxPersons, icon, order } = req.body;
    const image = req.file ? { url: req.file.path, public_id: req.file.filename } : undefined;
    await Activity.create({ name, description, category, duration, price: parseFloat(price)||0, included: included==='true', maxPersons: parseInt(maxPersons)||0, available: true, featured: false, icon: icon||'fas fa-star', image, order: parseInt(order)||0 });
    req.flash('success', 'Activity added');
    res.redirect('/admin/activities');
  } catch(e) { req.flash('error', e.message); res.redirect('/admin/activities'); }
});

router.put('/activities/:id', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, duration, price, included, maxPersons, available, featured, icon, order } = req.body;
    const upd = { name, description, category, duration, price: parseFloat(price)||0, included: included==='true', maxPersons: parseInt(maxPersons)||0, available: available==='true', featured: featured==='true', icon: icon||'fas fa-star', order: parseInt(order)||0 };
    if (req.file) upd.image = { url: req.file.path, public_id: req.file.filename };
    await Activity.findByIdAndUpdate(req.params.id, upd);
    req.flash('success', 'Activity updated');
    res.redirect('/admin/activities');
  } catch(e) { req.flash('error', e.message); res.redirect('/admin/activities'); }
});

router.delete('/activities/:id', isAdmin, async (req, res) => {
  try {
    const a = await Activity.findById(req.params.id);
    if (a?.image?.public_id) await cloudinary.uploader.destroy(a.image.public_id);
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch(e) { res.json({ success: false }); }
});

// ══════════════════════════════════════════
//  EVENTS MANAGEMENT
// ══════════════════════════════════════════
router.get('/events', isAdmin, async (req, res) => {
  const events = await Event.find().sort({ order: 1 });
  res.render('admin/events', {
    admin: { name: req.session.adminName },
    events, page: 'events',
    success: req.flash('success'), error: req.flash('error'),
  });
});

router.post('/events', isAdmin, upload.array('images', 6), async (req, res) => {
  try {
    const { title, description, category, capacity, priceFrom, duration, includes, order } = req.body;
    const images = req.files ? req.files.map(f => ({ url: f.path, public_id: f.filename })) : [];
    const inc = includes ? (Array.isArray(includes) ? includes : includes.split('\n').map(s=>s.trim()).filter(Boolean)) : [];
    await Event.create({ title, description, category, capacity: parseInt(capacity)||50, priceFrom: parseFloat(priceFrom)||0, duration, includes: inc, images, available: true, featured: false, order: parseInt(order)||0 });
    req.flash('success', 'Event package created');
    res.redirect('/admin/events');
  } catch(e) { req.flash('error', e.message); res.redirect('/admin/events'); }
});

router.put('/events/:id', isAdmin, upload.array('images', 6), async (req, res) => {
  try {
    const { title, description, category, capacity, priceFrom, duration, includes, available, featured, order } = req.body;
    const upd = { title, description, category, capacity: parseInt(capacity)||50, priceFrom: parseFloat(priceFrom)||0, duration, available: available==='true', featured: featured==='true', order: parseInt(order)||0 };
    upd.includes = includes ? (Array.isArray(includes) ? includes : includes.split('\n').map(s=>s.trim()).filter(Boolean)) : [];
    if (req.files?.length) upd.$push = { images: { $each: req.files.map(f => ({ url: f.path, public_id: f.filename })) } };
    await Event.findByIdAndUpdate(req.params.id, upd);
    req.flash('success', 'Event updated');
    res.redirect('/admin/events');
  } catch(e) { req.flash('error', e.message); res.redirect('/admin/events'); }
});

router.delete('/events/:id', isAdmin, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    for (const img of ev?.images||[]) if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch(e) { res.json({ success: false }); }
});

// ══════════════════════════════════════════
//  EVENT BOOKINGS MANAGEMENT
// ══════════════════════════════════════════
router.get('/event-bookings', isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    const bookings = await EventBooking.find(filter).populate('eventId').sort({ createdAt: -1 });
    res.render('admin/event-bookings', {
      admin: { name: req.session.adminName },
      bookings, status: status||'all', moment, page: 'events',
    });
  } catch(e) {
    res.render('admin/event-bookings', { admin: { name: req.session.adminName }, bookings: [], status: 'all', moment, page: 'events' });
  }
});

router.post('/event-bookings/:id/status', isAdmin, async (req, res) => {
  try {
    await EventBooking.findByIdAndUpdate(req.params.id, { status: req.body.status, adminNotes: req.body.adminNotes });
    req.flash('success', 'Event booking updated');
    res.redirect('/admin/event-bookings');
  } catch(e) { res.redirect('/admin/event-bookings'); }
});

router.delete('/event-bookings/:id', isAdmin, async (req, res) => {
  try { await EventBooking.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch(e) { res.json({ success: false }); }
});

module.exports = router;
