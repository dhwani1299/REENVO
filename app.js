/* ============================================================
   REENVO — The Hydro-Hygiene Paradox
   JavaScript: Canvas, Scroll Reveals, Cursor, Interactions
   ============================================================ */

'use strict';

// ============================================================
// CUSTOM CURSOR
// ============================================================
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot    = document.getElementById('cursorDot');
  if (!cursor || !dot) return;
  if (window.matchMedia('(hover: none)').matches) return;

  let mx = -100, my = -100;
  let cx = -100, cy = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function moveCursor() {
    cx += (mx - cx) * 0.13;
    cy += (my - cy) * 0.13;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(moveCursor);
  }
  moveCursor();

  document.querySelectorAll('a, button, input, textarea, .doubt-card, .ops-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
})();


// ============================================================
// HERO CANVAS — Water ripple animation
// ============================================================
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, ripples = [], lastDrop = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Ripple {
    constructor(x, y, fast) {
      this.x = x; this.y = y;
      this.r = 0;
      this.maxR = 160 + Math.random() * 140;
      this.speed = fast ? 1.2 + Math.random() * 0.8 : 0.5 + Math.random() * 0.6;
      this.alpha = 0.32 + Math.random() * 0.22;
      this.done = false;
    }
    update() {
      this.r += this.speed;
      this.alpha *= 0.987;
      if (this.r >= this.maxR || this.alpha < 0.003) this.done = true;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(72, 150, 240, ${this.alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  function spawnDrop(x, y, fast) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
    g.addColorStop(0, 'rgba(72,150,240,0.65)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      setTimeout(() => ripples.push(new Ripple(x, y, fast)), i * 190);
    }
  }

  function autoSpawn(now) {
    if (now - lastDrop > 2700) {
      lastDrop = now;
      spawnDrop(
        W * 0.15 + Math.random() * W * 0.7,
        H * 0.15 + Math.random() * H * 0.7,
        false
      );
    }
  }

  function render(now) {
    ctx.clearRect(0, 0, W, H);
    ripples = ripples.filter(r => !r.done);
    ripples.forEach(r => { r.update(); r.draw(); });
    autoSpawn(now);
    requestAnimationFrame(render);
  }

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    spawnDrop(e.clientX - rect.left, e.clientY - rect.top, true);
  });
  canvas.addEventListener('touchend', e => {
    const t = e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    spawnDrop(t.clientX - rect.left, t.clientY - rect.top, true);
  }, { passive: true });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(render);

  // Opening drops
  setTimeout(() => spawnDrop(W * 0.5, H * 0.5, false), 600);
  setTimeout(() => spawnDrop(W * 0.3, H * 0.45, false), 1400);
  setTimeout(() => spawnDrop(W * 0.7, H * 0.6, false), 2100);
})();


// ============================================================
// NAVBAR SCROLL STATE
// ============================================================
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();


// ============================================================
// MOBILE MENU
// ============================================================
(function initMobileMenu() {
  const btn  = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
    });
  });
})();


// ============================================================
// SCROLL REVEAL — IntersectionObserver
// ============================================================
(function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('revealed'), delay);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  els.forEach(el => {
    // auto-stagger siblings that don't have an explicit delay
    if (!el.dataset.delay) {
      const siblings = Array.from(
        (el.parentElement || document.body).querySelectorAll('[data-reveal]')
      );
      const idx = siblings.indexOf(el);
      if (idx > 0) el.dataset.delay = Math.min(idx * 100, 450);
    }
    io.observe(el);
  });
})();


// ============================================================
// BENTO CARDS — staggered reveal
// ============================================================
(function initBentoReveal() {
  const cards = document.querySelectorAll('.ops-card, .ops-gallery-card');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = [...cards].indexOf(entry.target);
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, idx * 65);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.06 });

  cards.forEach(card => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(28px)';
    card.style.transition = 'opacity 0.8s cubic-bezier(.25,.46,.45,.94), transform 0.8s cubic-bezier(.25,.46,.45,.94)';
    io.observe(card);
  });
})();


// ============================================================
// DOUBT CARDS — slide in on scroll
// ============================================================
(function initDoubtCards() {
  const cards   = document.querySelectorAll('.doubt-card');
  const section = document.querySelector('.doubt-cards');
  if (!section) return;

  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    cards.forEach((c, i) => {
      setTimeout(() => {
        c.style.opacity   = '1';
        c.style.transform = 'translateX(0)';
      }, i * 110);
    });
    io.unobserve(section);
  }, { threshold: 0.2 });

  cards.forEach(c => {
    c.style.opacity   = '0';
    c.style.transform = 'translateX(-20px)';
    c.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
  });
  io.observe(section);
})();


// ============================================================
// TIMELINE — step reveal
// ============================================================
(function initTimeline() {
  const items = document.querySelectorAll('.tl-item');
  const tl    = document.querySelector('.timeline');
  if (!tl) return;

  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    items.forEach((el, i) => {
      setTimeout(() => {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      }, i * 180);
    });
    io.unobserve(tl);
  }, { threshold: 0.2 });

  items.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  });
  io.observe(tl);
})();


// ============================================================
// MOSAIC — subtle Ken Burns on load
// ============================================================
(function initMosaic() {
  const cells = document.querySelectorAll('.mosaic-cell img');
  cells.forEach((img, i) => {
    img.style.transitionDelay = (i * 0.4) + 's';
    setTimeout(() => {
      img.style.transform = 'scale(1.0)';
    }, 300 + i * 400);
  });
})();


// ============================================================
// PARALLAX — scale bg image on scroll (scale section)
// ============================================================
(function initParallax() {
  const scaleBg = document.querySelector('.scale-bg-img img');
  const doubtBg = document.querySelector('.doubt-bg img');
  if (!scaleBg && !doubtBg) return;

  let ticking = false;

  function update() {
    const scrollY = window.scrollY;

    if (scaleBg) {
      const section = scaleBg.closest('.scale-section');
      if (section) {
        const rect = section.getBoundingClientRect();
        const progress = 1 - rect.bottom / (window.innerHeight + rect.height);
        scaleBg.style.transform = `translateY(${progress * 60}px)`;
      }
    }

    if (doubtBg) {
      const section = doubtBg.closest('.doubt-section');
      if (section) {
        const rect = section.getBoundingClientRect();
        const progress = 1 - rect.bottom / (window.innerHeight + rect.height);
        doubtBg.style.transform = `translateY(${progress * 50}px)`;
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();


// ============================================================
// SMOOTH ANCHOR LINKS
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const t = document.querySelector(href);
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


// ============================================================
// NOTIFY FORM
// ============================================================
function handleNotify(e) {
  e.preventDefault();
  const btn   = document.getElementById('notifyBtn');
  const email = document.getElementById('n-email')?.value.trim();
  if (!email) { shakeEl(btn); return; }

  btn.querySelector('span').textContent = 'Sending...';
  btn.disabled = true;

  setTimeout(() => {
    btn.classList.add('success');
    btn.querySelector('span').textContent = "You're on the list!";
    btn.querySelector('svg').innerHTML = '<path d="M3 8l4 4 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
    setTimeout(() => {
      btn.classList.remove('success');
      btn.querySelector('span').textContent = 'Notify me when you launch';
      btn.querySelector('svg').innerHTML = '<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
      btn.disabled = false;
      e.target.reset();
    }, 4000);
  }, 900);
}

function shakeEl(el) {
  el.style.animation = 'shake 0.4s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
}

// Shake keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-6px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }
`;
document.head.appendChild(style);

console.log('💧 REENVO — Something better is coming.');
