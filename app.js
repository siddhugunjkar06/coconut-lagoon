require('dotenv').config();
const express      = require('express');
const session      = require('express-session');
const flash        = require('connect-flash');
const methodOverride = require('method-override');
const path         = require('path');
const connectDB    = require('./config/db');

const app = express();
connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'coconut-lagoon-secret-2024',
  resave: false, saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg   = req.flash('error');
  res.locals.isAdmin     = !!(req.session && req.session.adminId);
  res.locals.adminName   = req.session.adminName || '';
  next();
});

// Routes
app.use('/',        require('./routes/index'));
app.use('/',        require('./routes/events'));   // dining / activities / events
app.use('/payment', require('./routes/payment'));
app.use('/admin',   require('./routes/admin'));
app.use('/admin',   require('./routes/admin-content'));

app.use((req, res) => res.status(404).render('404', { page: '' }));

// ── Auto-seed ────────────────────────────────────────────────────────────────
const seed = async () => {
  const Admin    = require('./models/Admin');
  const Room     = require('./models/Room');
  const Event    = require('./models/Event');
  const Activity = require('./models/Activity');
  const DiningItem = require('./models/DiningItem');

  // Admin
  if (!await Admin.countDocuments()) {
    await Admin.create({ name: 'Resort Admin', email: process.env.ADMIN_EMAIL||'admin@coconutlagoon.com', password: process.env.ADMIN_PASSWORD||'Admin@2024', role: 'superadmin' });
    console.log('✅ Admin seeded — admin@coconutlagoon.com / Admin@2024');
  }

  // Rooms
  if (!await Room.countDocuments()) {
    await Room.insertMany([
      { name:'Garden View Villa', type:'Villa', description:'Luxurious villa with private garden view, king bed, and all modern comforts amidst nature.', price:2369, capacity:2, size:'45 sqm', amenities:['AC','Free WiFi','Smart TV','Mini Bar','Garden View','King Bed','Free Breakfast','Room Service'], images:[{url:'https://images.trvl-media.com/lodging/120000000/119770000/119762000/119761966/0af54401.jpg',public_id:'s1'}], available:true, featured:true, order:1 },
      { name:'Family Suite',      type:'Suite',       description:'Spacious family suite with twin beds and extra living area, ideal for families and groups.', price:3500, capacity:4, size:'70 sqm', amenities:['AC','Free WiFi','Smart TV','Kitchen','Pool View','Twin Beds','Free Breakfast','Kids Amenities'], images:[{url:'https://images.trvl-media.com/lodging/120000000/119770000/119762000/119761966/e7aae43a.jpg',public_id:'s2'}], available:true, featured:true, order:2 },
      { name:'Nature Retreat Room',type:'Premium Room',description:'Eco-themed agro room with farm-fresh décor, 100+ Mbps Wi-Fi, and serene nature views.', price:2800, capacity:2, size:'35 sqm', amenities:['AC','Free WiFi','Smart TV','Eco Theme','Garden View','Double Bed','Free Breakfast'], images:[{url:'https://images.trvl-media.com/lodging/120000000/119770000/119762000/119761966/d59ceade.jpg',public_id:'s3'}], available:true, featured:true, order:3 },
    ]);
    console.log('✅ Rooms seeded');
  }

  // Events
  if (!await Event.countDocuments()) {
    await Event.insertMany([
      { title:'Wedding Celebration', description:'Create your dream wedding surrounded by nature at Coconut Lagoon. Our dedicated team handles every detail.', category:'wedding', capacity:200, priceFrom:150000, duration:'1-2 days', includes:['Decorated venue','Catering','Photography','Accommodation for couple','Floral décor','Sound system'], available:true, featured:true, order:1 },
      { title:'Birthday Bash', description:'Celebrate your special day with a private party at our resort with pool access and customised arrangements.', category:'birthday', capacity:50, priceFrom:25000, duration:'Half / Full day', includes:['Private party area','Customised cake','Pool access','DJ','Decorations'], available:true, featured:true, order:2 },
      { title:'Corporate Retreat', description:'Team-building retreats and corporate events with modern AV facilities and outdoor activities.', category:'corporate', capacity:100, priceFrom:50000, duration:'1-3 days', includes:['Conference hall','AV equipment','Accommodation','All meals','Team activities'], available:true, featured:false, order:3 },
      { title:'Family Get-together', description:'Gather your loved ones for a memorable family reunion with exclusive resort access and activities.', category:'private', capacity:80, priceFrom:40000, duration:'1-2 days', includes:['Exclusive lawn','BBQ setup','Pool access','Bonfire','Meals'], available:true, featured:true, order:4 },
    ]);
    console.log('✅ Events seeded');
  }

  // Activities
  if (!await Activity.countDocuments()) {
    await Activity.insertMany([
      { name:'Swimming Pool & Rain Dance', category:'water',    duration:'All day', price:0, included:true,  icon:'fas fa-swimming-pool', description:'Olympic-style pool with rain dance facility.', available:true, featured:true, order:1 },
      { name:'Farm Walk & Agro Tour',       category:'cultural', duration:'2 hrs',  price:0, included:true,  icon:'fas fa-tractor',       description:'Walk through our farm and learn about agro practices.', available:true, featured:true, order:2 },
      { name:'Bonfire Night',              category:'cultural', duration:'3 hrs',  price:0, included:true,  icon:'fas fa-fire',          description:'Cosy bonfire evenings with music and snacks.', available:true, featured:true, order:3 },
      { name:'Nature Bird Watching',       category:'land',     duration:'1.5 hrs',price:0, included:true,  icon:'fas fa-dove',          description:'Guided bird watching walk through the resort grounds.', available:true, featured:false, order:4 },
      { name:'Indoor Games',               category:'kids',     duration:'Flexible',price:0,included:true,  icon:'fas fa-chess',         description:'Carrom, chess, table tennis and more for all ages.', available:true, featured:false, order:5 },
      { name:'Cycling Tour',               category:'land',     duration:'1 hr',   price:200,included:false, icon:'fas fa-bicycle',      description:'Explore the surrounding countryside by bicycle.', available:true, featured:false, order:6 },
    ]);
    console.log('✅ Activities seeded');
  }

  // Dining items
  if (!await DiningItem.countDocuments()) {
    await DiningItem.insertMany([
      { name:'Farm Fresh Breakfast Buffet', category:'breakfast', price:0,    isVeg:true,  isSpecial:false, description:'Daily complimentary breakfast with farm-fresh produce, breads, and juices.', available:true, order:1 },
      { name:'Marathwada Thali',            category:'lunch',     price:350,  isVeg:true,  isSpecial:true,  description:'Authentic regional thali with dal, sabzi, bhakri, and dessert.', available:true, order:2 },
      { name:'Tandoori Platter',            category:'dinner',    price:450,  isVeg:false, isSpecial:true,  description:'Mixed tandoori platter with naan, raita, and salad.', available:true, order:3 },
      { name:'Veg Biryani',                 category:'lunch',     price:280,  isVeg:true,  isSpecial:false, description:'Fragrant basmati rice cooked with seasonal vegetables and spices.', available:true, order:4 },
      { name:'Poolside Snack Platter',      category:'snacks',    price:250,  isVeg:true,  isSpecial:false, description:'Samosas, pakoras, and sandwiches served at the pool.', available:true, order:5 },
      { name:'Fresh Fruit Juices',          category:'beverages', price:120,  isVeg:true,  isSpecial:false, description:'Seasonal fresh pressed juices — mango, sugarcane, pomegranate.', available:true, order:6 },
      { name:'Special BBQ Dinner',          category:'special',   price:600,  isVeg:false, isSpecial:true,  description:'Weekend BBQ spread with grilled meats, corn, and sauces.', available:true, order:7 },
    ]);
    console.log('✅ Dining items seeded');
  }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🌴 Coconut Lagoon Resort → http://localhost:${PORT}`);
  await seed().catch(e => console.error('Seed error:', e.message));
});
