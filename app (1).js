/* ============================================================
   REENVO — The Hydro-Hygiene Paradox
   JS: Canvas, Cursor, Reveals, Interactions, Forms, Comments
   ============================================================ */

'use strict';

// ============================================================
// CUSTOM CURSOR
// ============================================================
(function initCursor() {
  const ring = document.getElementById('cursor');
  const dot  = document.getElementById('cursorDot');
  if (!ring || !dot) return;
  if (window.matchMedia('(hover: none)').matches) return;

  let mx = -200, my = -200;
  let rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function tick() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  })();

  const hovers = 'a, button, input, textarea, .dc, .comment-card, .ops-card, .option';
  document.querySelectorAll(hovers).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
})();


// ============================================================
// HERO CANVAS — Ripple water
// ============================================================
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, ripples = [], lastDrop = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Ripple {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.r = 0;
      this.maxR = 150 + Math.random() * 130;
      this.speed = 0.55 + Math.random() * 0.65;
      this.a = 0.28 + Math.random() * 0.18;
      this.done = false;
    }
    update() {
      this.r    += this.speed;
      this.a    *= 0.988;
      if (this.r >= this.maxR || this.a < 0.003) this.done = true;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(74,142,245,${this.a})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drop(x, y) {
    // Centre glow
    const g = ctx.createRadialGradient(x,y,0, x,y,8);
    g.addColorStop(0, 'rgba(74,142,245,0.55)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x,y,8,0,Math.PI*2); ctx.fill();
    for (let i = 0; i < 3; i++) setTimeout(() => ripples.push(new Ripple(x,y)), i*185);
  }

  function autoSpawn(now) {
    if (now - lastDrop > 2600) {
      lastDrop = now;
      drop(W*0.18 + Math.random()*W*0.64, H*0.15 + Math.random()*H*0.7);
    }
  }

  function render(now) {
    ctx.clearRect(0,0,W,H);
    ripples = ripples.filter(r => !r.done);
    ripples.forEach(r => { r.update(); r.draw(); });
    autoSpawn(now);
    requestAnimationFrame(render);
  }

  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    drop(e.clientX - r.left, e.clientY - r.top);
  });
  canvas.addEventListener('touchend', e => {
    const t = e.changedTouches[0];
    const r = canvas.getBoundingClientRect();
    drop(t.clientX - r.left, t.clientY - r.top);
  }, { passive: true });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(render);

  // Opening sequence
  setTimeout(() => drop(W * 0.52, H * 0.52), 700);
  setTimeout(() => drop(W * 0.30, H * 0.46), 1500);
  setTimeout(() => drop(W * 0.72, H * 0.62), 2200);
})();


// ============================================================
// NAVBAR
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
(function initMenu() {
  const btn  = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
  });
  menu.querySelectorAll('.mobile-link').forEach(l => {
    l.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
    });
  });
})();


// ============================================================
// SCROLL REVEAL
// ============================================================
(function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('revealed'), delay);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.09, rootMargin: '0px 0px -44px 0px' });

  els.forEach((el, idx) => {
    if (!el.dataset.delay) {
      const siblings = Array.from(
        (el.parentElement || document.body).querySelectorAll('[data-reveal]')
      );
      const i = siblings.indexOf(el);
      if (i > 0) el.dataset.delay = Math.min(i * 90, 420);
    }
    io.observe(el);
  });
})();


// ============================================================
// BENTO CARDS REVEAL
// ============================================================
(function initBento() {
  const cards = document.querySelectorAll('.ops-card, .ops-gallery-card');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = [...cards].indexOf(entry.target);
      setTimeout(() => {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
      }, idx * 60);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.06 });

  cards.forEach(c => {
    c.style.opacity   = '0';
    c.style.transform = 'translateY(26px)';
    c.style.transition = 'opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1)';
    io.observe(c);
  });
})();


// ============================================================
// DOUBT CARDS — slide in
// ============================================================
(function initDoubt() {
  const cards   = document.querySelectorAll('.dc');
  const section = document.querySelector('.doubt-cards');
  if (!section) return;
  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    cards.forEach((c,i) => setTimeout(() => {
      c.style.opacity   = '1';
      c.style.transform = 'translateX(0)';
    }, i * 100));
    io.unobserve(section);
  }, { threshold: 0.2 });
  cards.forEach(c => {
    c.style.opacity   = '0';
    c.style.transform = 'translateX(-18px)';
    c.style.transition = 'opacity .65s ease, transform .65s ease';
  });
  io.observe(section);
})();


// ============================================================
// TIMELINE REVEAL
// ============================================================
(function initTimeline() {
  const nodes = document.querySelectorAll('.tl-node, .tl-connector');
  const wrap  = document.querySelector('.pivot-timeline');
  if (!wrap) return;
  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    nodes.forEach((n,i) => setTimeout(() => {
      n.style.opacity   = '1';
      n.style.transform = 'translateY(0)';
    }, i * 140));
    io.unobserve(wrap);
  }, { threshold: 0.2 });
  nodes.forEach(n => {
    n.style.opacity   = '0';
    n.style.transform = 'translateY(18px)';
    n.style.transition = 'opacity .7s ease, transform .7s ease';
  });
  io.observe(wrap);
})();


// ============================================================
// PARALLAX on scale + doubt sections
// ============================================================
(function initParallax() {
  const pairs = [
    ['.scale-bg img',  '.scale-section'],
    ['.doubt-bg img',  '.doubt-section'],
  ];
  let ticking = false;

  function update() {
    pairs.forEach(([sel, sec]) => {
      const img  = document.querySelector(sel);
      const sect = document.querySelector(sec);
      if (!img || !sect) return;
      const rect = sect.getBoundingClientRect();
      const prog = 1 - rect.bottom / (window.innerHeight + rect.height);
      img.style.transform = `translateY(${prog * 55}px)`;
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();


// ============================================================
// SMOOTH ANCHORS
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

  const span = btn.querySelector('span');
  span.textContent = 'Sending...';
  btn.disabled = true;

  setTimeout(() => {
    btn.classList.add('success');
    span.textContent = "You're on the list.";
    btn.querySelector('svg').innerHTML =
      '<path d="M3 8l4 4 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
    setTimeout(() => {
      btn.classList.remove('success');
      span.textContent = 'Notify me when you launch';
      btn.querySelector('svg').innerHTML =
        '<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
      btn.disabled = false;
      e.target.reset();
    }, 4200);
  }, 900);
}


// ============================================================
// CONTACT FORM
// ============================================================
function handleContact(e) {
  e.preventDefault();
  const btn = document.getElementById('contactBtn');
  const span = btn.querySelector('span');
  span.textContent = 'Sending...';
  btn.disabled = true;

  setTimeout(() => {
    span.textContent = 'Message sent. We will be in touch.';
    btn.classList.add('success');
    setTimeout(() => {
      span.textContent = 'Send your question';
      btn.classList.remove('success');
      btn.disabled = false;
      e.target.reset();
    }, 4200);
  }, 900);
}


// ============================================================
// COMMENT FORM — adds cards to the feed live
// ============================================================
function handleComment(e) {
  e.preventDefault();
  const btn  = document.getElementById('cfBtn');
  const name = document.getElementById('c-name')?.value.trim();
  const city = document.getElementById('c-city')?.value.trim();
  const msg  = document.getElementById('c-msg')?.value.trim();
  if (!name || !msg) { shakeEl(btn); return; }

  const span = btn.querySelector('span');
  span.textContent = 'Sharing...';
  btn.disabled = true;

  setTimeout(() => {
    // Build the new comment card
    const initial = name.charAt(0).toUpperCase();
    const hue     = Math.floor(Math.random() * 360);
    const card    = document.createElement('div');
    card.className = 'comment-card user-added';
    card.style.opacity   = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity .6s ease, transform .6s ease';

    card.innerHTML = `
      <div class="comment-top">
        <div class="comment-avatar" style="--av-bg:hsl(${hue},35%,22%)">${initial}</div>
        <div class="comment-who">
          <span class="comment-name">${escHtml(name)}</span>
          ${city ? `<span class="comment-loc mono">${escHtml(city)}</span>` : ''}
        </div>
      </div>
      <p>"${escHtml(msg)}"</p>
    `;

    const feed = document.getElementById('commentsFeed');
    feed.prepend(card);
    // Trigger animation
    requestAnimationFrame(() => requestAnimationFrame(() => {
      card.style.opacity   = '1';
      card.style.transform = 'translateY(0)';
    }));

    // Reset form
    span.textContent = 'Story shared. Thank you.';
    btn.classList.add('success');
    setTimeout(() => {
      span.textContent = 'Share your story';
      btn.classList.remove('success');
      btn.disabled = false;
      e.target.reset();
    }, 3800);
  }, 800);
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


// ============================================================
// SHAKE UTILITY
// ============================================================
function shakeEl(el) {
  el.style.animation = 'shake .42s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
}

const _styleEl = document.createElement('style');
_styleEl.textContent = `
  @keyframes shake {
    0%,100%{ transform:translateX(0); }
    22%    { transform:translateX(-6px); }
    44%    { transform:translateX(6px); }
    66%    { transform:translateX(-4px); }
    88%    { transform:translateX(4px); }
  }
`;
document.head.appendChild(_styleEl);


// ============================================================
// MOSAIC — Ken Burns on load
// ============================================================
(function initMosaic() {
  document.querySelectorAll('.mosaic-cell img').forEach((img, i) => {
    img.style.transitionDelay = (i * 0.35) + 's';
    setTimeout(() => { img.style.transform = 'scale(1.0)'; }, 400 + i * 350);
  });
})();

console.log('💧 REENVO — Pure water. A flawed vessel.');
