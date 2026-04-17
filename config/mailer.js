const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST  || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const sendBookingConfirmation = async (booking) => {
  if (!process.env.SMTP_USER) return; // skip if not configured
  try {
    await transporter.sendMail({
      from: `"Coconut Lagoon Resort" <${process.env.SMTP_USER}>`,
      to: booking.email,
      subject: `Booking Confirmed — ${booking.bookingId} | Coconut Lagoon Resort`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f6f4ef">
          <div style="background:#2a5c3a;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:22px">🌴 Coconut Lagoon Agro Resort</h1>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px">Booking Confirmation</p>
          </div>
          <div style="background:white;padding:32px;border-radius:0 0 12px 12px">
            <p style="font-size:16px;color:#333">Dear <strong>${booking.name}</strong>,</p>
            <p style="color:#555;line-height:1.6">Your booking has been <strong style="color:#2a5c3a">confirmed</strong>. Here are your details:</p>
            <div style="background:#f6f4ef;padding:20px;border-radius:8px;margin:20px 0">
              <table style="width:100%;font-size:14px;color:#333">
                <tr><td style="padding:6px 0;color:#888">Booking ID</td><td style="font-weight:600;font-family:monospace">${booking.bookingId}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Room</td><td>${booking.roomType}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Check-in</td><td>${new Date(booking.checkIn).toDateString()}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Check-out</td><td>${new Date(booking.checkOut).toDateString()}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Guests</td><td>${booking.guests}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Amount</td><td style="font-weight:600;color:#2a5c3a">₹${(booking.totalAmount||0).toLocaleString('en-IN')}</td></tr>
                <tr><td style="padding:6px 0;color:#888">Payment</td><td>${booking.paymentStatus === 'paid' ? '✅ Paid Online' : '🔔 Pay at Resort'}</td></tr>
              </table>
            </div>
            <p style="color:#555;font-size:13px">Check-in: 12:00 PM &nbsp;|&nbsp; Check-out: 11:00 AM</p>
            <p style="color:#555;font-size:13px">📍 Gut No 222, Pingali, Parbhani, MH 431401</p>
            <p style="color:#555;font-size:13px">📞 +91 77759 47728</p>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#aaa;text-align:center">
              Coconut Lagoon Agro Resort · Parbhani, Maharashtra
            </div>
          </div>
        </div>
      `,
    });
  } catch(e) { console.log('Email error:', e.message); }
};

const sendEventBookingNotification = async (eventBooking) => {
  if (!process.env.SMTP_USER) return;
  try {
    await transporter.sendMail({
      from: `"Coconut Lagoon Resort" <${process.env.SMTP_USER}>`,
      to: [eventBooking.email, process.env.RESORT_EMAIL || process.env.SMTP_USER],
      subject: `Event Enquiry Received — ${eventBooking.eventBookingId}`,
      html: `<p>Event booking enquiry for <strong>${eventBooking.eventName}</strong> from ${eventBooking.name} (${eventBooking.phone}) on ${new Date(eventBooking.eventDate).toDateString()}. <br>ID: ${eventBooking.eventBookingId}. Admin will confirm within 24 hours.</p>`,
    });
  } catch(e) { console.log('Email error:', e.message); }
};

module.exports = { sendBookingConfirmation, sendEventBookingNotification };
