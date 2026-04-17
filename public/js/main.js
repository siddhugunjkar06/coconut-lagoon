// ═══ NAVBAR SCROLL ═══
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// ═══ HAMBURGER ═══
const hamburger = document.getElementById('navHamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });
}

// ═══ SCROLL REVEAL ═══
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => observer.observe(el));

// ═══ LIGHTBOX ═══
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const src = item.querySelector('.gallery-item-img').style.backgroundImage
      .replace(/url\(["']?/, '').replace(/["']?\)/, '');
    if (lightboxImg && lightbox) {
      lightboxImg.src = src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });
});
if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// ═══ GALLERY FILTER ═══
document.querySelectorAll('.gallery-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;
    document.querySelectorAll('.gallery-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.gallery-item').forEach(item => {
      if (category === 'all' || item.dataset.category === category) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
});

// ═══ CHECK-IN / CHECK-OUT DATE VALIDATION ═══
const checkIn = document.getElementById('checkIn');
const checkOut = document.getElementById('checkOut');
if (checkIn && checkOut) {
  const today = new Date().toISOString().split('T')[0];
  checkIn.min = today;
  checkOut.min = today;
  checkIn.addEventListener('change', () => {
    checkOut.min = checkIn.value;
    if (checkOut.value && checkOut.value <= checkIn.value) checkOut.value = '';
    updateNights();
  });
  checkOut.addEventListener('change', updateNights);
}

function updateNights() {
  const ni = document.getElementById('nightsDisplay');
  if (!ni || !checkIn || !checkOut || !checkIn.value || !checkOut.value) return;
  const diff = (new Date(checkOut.value) - new Date(checkIn.value)) / 86400000;
  if (diff > 0) ni.textContent = diff + (diff === 1 ? ' Night' : ' Nights');
}

// ═══ ROOM PRICE UPDATER ═══
const roomSelect = document.getElementById('roomSelect');
const priceLine = document.getElementById('priceLine');
if (roomSelect && priceLine) {
  roomSelect.addEventListener('change', () => {
    const option = roomSelect.options[roomSelect.selectedIndex];
    const price = option.dataset.price;
    if (price) {
      const nights = parseInt(document.getElementById('nightsDisplay')?.textContent) || 1;
      priceLine.textContent = '₹' + (parseInt(price) * nights).toLocaleString('en-IN') + ' est.';
    }
  });
}

// ═══ COUNTER ANIMATION ═══
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { el.textContent = target + (el.dataset.suffix || ''); clearInterval(timer); }
    else el.textContent = Math.floor(current) + (el.dataset.suffix || '');
  }, 16);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      animateCounter(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ═══ PARALLAX HERO ═══
const heroImg = document.querySelector('.hero-img');
if (heroImg) {
  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    if (scroll < window.innerHeight) {
      heroImg.style.transform = `translateY(${scroll * 0.3}px)`;
    }
  }, { passive: true });
}

// ═══ 3D CARD TILT ═══
document.querySelectorAll('.room-card, .amenity-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-8px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ═══ SMOOTH ANCHOR SCROLL ═══
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
