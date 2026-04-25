# 🌴 Coconut Lagoon Agro Resort — Full Stack Website v2.0

Production-ready resort website with **online payments**, **event booking**, and full admin control over Dining, Activities & Events.


## 🌐 Public Website

| Page | URL | Features |
|------|-----|----------|
| Home | `/` | Full-bleed hero, rooms, dining, gallery, booking form |
| Rooms | `/rooms` | Availability check + **Razorpay online payment** + offline option |
| Dining | `/dining` | Full menu by category (veg/non-veg, specials) |
| Activities | `/activities` | All resort activities with categories |
| Events | `/events` | Event packages + **enquiry form** (admin confirms) |
| Gallery | `/gallery` | Filterable photo gallery with lightbox |
| Booking | `/booking` | Offline booking form |
| Booking Status | `/booking/status` | Check any booking by ID |
| Contact | `/contact` | Contact form + Google Maps |

---

## 💳 Online Payment Flow (Rooms)

1. Guest visits `/rooms` → clicks **Book Now** on an available room
2. Booking modal opens → guest fills in dates (availability checked live)
3. Guest chooses **Pay Online** → Razorpay checkout launches
4. On success → booking auto-confirmed + confirmation email sent
5. **Pay at Resort** option also available (status: pending, admin confirms)

---

## 🎉 Event Booking Flow

1. Guest visits `/events` → selects a package → clicks **Enquire Now**
2. Fills enquiry form → submitted with status **`pending`**
3. Admin receives notification → reviews at `/admin/event-bookings`
4. Admin changes status to **Confirmed** → guest is notified
5. Events are **never auto-confirmed** — always require admin approval

---

## 🔐 Admin Panel (`/admin/login`)

### All Admin Modules

| Module | URL | What You Can Do |
|--------|-----|-----------------|
| Dashboard | `/admin/dashboard` | Stats overview, pending alerts, quick actions |
| Room Bookings | `/admin/bookings` | Search, filter, update status, view payment info |
| **Event Bookings** | `/admin/event-bookings` | Review & confirm/reject event enquiries |
| Rooms | `/admin/rooms` | Add/Edit/Delete rooms, upload images |
| **Dining Menu** | `/admin/dining` | Add/Edit menu items, categories, veg/non-veg, pricing |
| **Activities** | `/admin/activities` | Add/Edit activities, icons, categories, pricing |
| **Event Packages** | `/admin/events` | Create event packages shown on website |
| Gallery | `/admin/gallery` | Upload/delete photos by category |
| Reviews | `/admin/reviews` | Approve, feature, or delete guest reviews |
| Messages | `/admin/contacts` | Read enquiries, one-click reply |
| Settings | `/admin/settings` | Change admin password |

---

## 📁 Project Structure

```
coconut-lagoon/
├── app.js                    # Express app + auto-seed
├── config/
│   ├── db.js                 # MongoDB connection
│   ├── cloudinary.js         # Image upload config
│   ├── razorpay.js           # Payment gateway config
│   └── mailer.js             # Email confirmations
├── models/
│   ├── Admin.js              # Admin users
│   ├── Booking.js            # Room bookings (+ payment fields)
│   ├── EventBooking.js       # Event enquiries (admin-confirmed)
│   ├── Event.js              # Event packages
│   ├── Activity.js           # Resort activities
│   ├── DiningItem.js         # Menu items
│   ├── Room.js               # Rooms
│   ├── Gallery.js            # Gallery images
│   ├── Review.js             # Guest reviews
│   └── Contact.js            # Contact messages
├── routes/
│   ├── index.js              # Public pages (home, rooms, gallery, booking)
│   ├── events.js             # Dining / Activities / Events public routes
│   ├── payment.js            # Razorpay order create + verify + availability
│   ├── admin.js              # Admin auth + bookings + rooms + gallery
│   └── admin-content.js      # Admin dining + activities + events + event-bookings
├── middleware/
│   └── auth.js               # Session auth
├── views/
│   ├── partials/             # head, navbar, footer, admin-sidebar
│   ├── admin/                # 12 admin views
│   └── *.ejs                 # 9 public pages
└── public/
    ├── css/ main.css + admin.css + hero-override.css
    └── js/  main.js
```

---


*Built for Coconut Lagoon Agro Resort, Parbhani, Maharashtra*
