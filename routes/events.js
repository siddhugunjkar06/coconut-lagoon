const express = require('express');
const router  = express.Router();
const Event        = require('../models/Event');
const EventBooking = require('../models/EventBooking');
const Activity     = require('../models/Activity');
const DiningItem   = require('../models/DiningItem');
const { sendEventBookingNotification } = require('../config/mailer');

// PUBLIC: Dining page
router.get('/dining', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category, available: true } : { available: true };
    const items = await DiningItem.find(filter).sort({ order: 1, createdAt: 1 });
    const cats  = ['breakfast','lunch','dinner','snacks','beverages','special'];
    res.render('dining', { items, cats, currentCat: category || 'all', page: 'dining' });
  } catch (e) {
    res.render('dining', { items: [], cats: [], currentCat: 'all', page: 'dining' });
  }
});

// PUBLIC: Activities page
router.get('/activities', async (req, res) => {
  try {
    const activities = await Activity.find({ available: true }).sort({ order: 1 });
    res.render('activities', { activities, page: 'activities' });
  } catch (e) {
    res.render('activities', { activities: [], page: 'activities' });
  }
});

// PUBLIC: Events page
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find({ available: true }).sort({ order: 1 });
    res.render('events', { events, page: 'events', success: null, error: null });
  } catch (e) {
    res.render('events', { events: [], page: 'events', success: null, error: null });
  }
});

// PUBLIC: Submit event booking enquiry
router.post('/events/book', async (req, res) => {
  try {
    const events = await Event.find({ available: true }).sort({ order: 1 });
    const { eventId, eventName, name, email, phone, eventDate, guests, message } = req.body;

    let eventTitle = eventName;
    if (eventId) {
      const ev = await Event.findById(eventId);
      if (ev) eventTitle = ev.title;
    }

    const eb = await EventBooking.create({
      eventId: eventId || undefined,
      eventName: eventTitle || 'Custom Event',
      name, email, phone,
      eventDate: new Date(eventDate),
      guests: parseInt(guests) || 10,
      message,
      status: 'pending', // always pending — admin confirms
    });

    await sendEventBookingNotification(eb);

    res.render('events', {
      events, page: 'events',
      success: `Event enquiry received! Your ID is <strong>${eb.eventBookingId}</strong>. Our team will contact you within 24 hours to confirm details.`,
      error: null,
    });
  } catch (e) {
    console.error(e);
    const events = await Event.find({ available: true });
    res.render('events', { events, page: 'events', success: null, error: 'Submission failed. Please call us at +91 77759 47728.' });
  }
});

module.exports = router;
