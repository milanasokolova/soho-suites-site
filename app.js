/* ================================================================
   SOHO SUITES — app.js
   Animations: parallax · stagger · counter · page transitions · cursor
   ================================================================ */

'use strict';

/* ── helpers ──────────────────────────────────────────────────── */
const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ── 1. NAV SCROLL STATE ────────────────────────────────────── */
(function navScroll() {
  const nav = qs('.nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── 2. MOBILE BURGER ───────────────────────────────────────── */
(function burger() {
  const btn   = qs('.burger');
  const panel = qs('.nav-panel');
  const nav   = qs('.nav');
  if (!btn || !panel) return;

  btn.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    nav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    btn.setAttribute('aria-expanded', open);
  });

  qsa('a', panel).forEach(a => a.addEventListener('click', () => {
    panel.classList.remove('open');
    nav.classList.remove('is-open');
    document.body.style.overflow = '';
    btn.setAttribute('aria-expanded', 'false');
  }));
})();

/* ── 3. SCROLL REVEALS ──────────────────────────────────────── */
(function reveals() {
  const els = qsa('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ── 4. GALLERY STAGGER REVEAL ──────────────────────────────── */
(function galleryReveal() {
  const figs = qsa('.masonry figure');
  if (!figs.length) return;
  figs.forEach((f, i) => f.style.transitionDelay = (i * 0.045) + 's');
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in-view');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.06 });
  figs.forEach(f => io.observe(f));
})();

/* ── 5. HERO PARALLAX ───────────────────────────────────────── */
(function heroParallax() {
  const hero = qs('.hero:not(.hero--small)');
  if (!hero) return;
  const img  = qs('.hero-media img', hero);
  if (!img) return;

  // Only on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const scrolled = window.scrollY;
      const limit    = hero.offsetHeight;
      if (scrolled < limit) {
        img.style.transform = `scale(1) translateY(${scrolled * 0.18}px)`;
      }
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

/* ── 6. ANIMATED NUMBER COUNTERS ────────────────────────────── */
(function counters() {
  const nums = qsa('.suite-stat-num');
  if (!nums.length) return;

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounter(el) {
    const target = parseFloat(el.textContent);
    if (isNaN(target)) return;
    const duration = 900;
    const start    = performance.now();
    const isFloat  = el.textContent.includes('.');

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutQuart(progress);
      const value    = target * eased;
      el.textContent = isFloat ? value.toFixed(1) : Math.round(value);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animateCounter(e.target);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
})();

/* ── 7. AMENITY ITEM STAGGER ────────────────────────────────── */
(function amenityStagger() {
  const items = qsa('.amenity-item');
  if (!items.length) return;

  // Set initial state
  items.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const idx = items.indexOf(e.target);
      setTimeout(() => {
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
      }, idx * 40);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  items.forEach(el => io.observe(el));
})();

/* ── 8. SUITE CARD STAGGER ──────────────────────────────────── */
(function cardStagger() {
  const cards = qsa('.suite-card');
  if (!cards.length) return;

  cards.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity .7s cubic-bezier(.25,.46,.45,.94), transform .7s cubic-bezier(.25,.46,.45,.94)';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const idx = cards.indexOf(e.target);
      setTimeout(() => {
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
      }, idx * 120);
    });
  }, { threshold: 0.12 });

  cards.forEach(el => io.observe(el));
})();

/* ── 9. HORIZONTAL SCROLL MARQUEE (pause on interact) ──────── */
/* Already handled in CSS: .marquee-strip:hover .marquee-track pauses */

/* ── 10. SMOOTH ACTIVE NAV LINK ON SCROLL (index only) ──────── */
(function activeNav() {
  const sections = qsa('section[id]');
  const links    = qsa('.nav-links a');
  if (!sections.length || !links.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.remove('active'));
      const match = qs(`.nav-links a[href="#${e.target.id}"]`);
      if (match) match.classList.add('active');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
})();

/* ── 11. LIGHTBOX ───────────────────────────────────────────── */
(function lightbox() {
  const lb    = qs('.lightbox');
  const lbImg = lb && qs('img', lb);
  if (!lb || !lbImg) return;

  const images = qsa('.masonry figure img');
  let current  = 0;

  const open = (i) => {
    current = i;
    lbImg.src = images[i].src;
    lbImg.alt = images[i].alt;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  };
  const prev = () => open((current - 1 + images.length) % images.length);
  const next = () => open((current + 1) % images.length);

  images.forEach((img, i) => img.parentElement.addEventListener('click', () => open(i)));
  qs('.lightbox-close', lb).addEventListener('click', close);
  qs('.lightbox-prev',  lb).addEventListener('click', e => { e.stopPropagation(); prev(); });
  qs('.lightbox-next',  lb).addEventListener('click', e => { e.stopPropagation(); next(); });
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  // Swipe support on touch
  let touchStartX = 0;
  lb.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  lb.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });
})();

/* ── 12. FOOTER YEAR ────────────────────────────────────────── */
(function year() {
  const el = qs('#year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ── 13. CONTACT FORM ───────────────────────────────────────── */
(function contactForm() {
  const forms = qsa('form.form');
  if (!forms.length) return;

  function toast(msg, isError = false) {
    let t = qs('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.toggle('error', isError);
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4500);
  }

  forms.forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = qs('button[type="submit"]', form);
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        if (res.ok) {
          form.reset();
          toast('Thank you — we\'ll reply shortly.');
          setTimeout(() => { window.location.href = 'thank-you.html'; }, 1200);
        } else {
          toast('Something went wrong. Please try again or WhatsApp us.', true);
        }
      } catch {
        toast('Network error. Please WhatsApp us directly.', true);
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Send Enquiry'; }
      }
    });
  });
})();

/* ── 14. PAGE TRANSITION (fade-out on link click) ───────────── */
(function pageTransition() {
  // Inject transition overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:var(--cream,#F0E8DC);
    opacity:0;pointer-events:none;
    transition:opacity .35s ease;
  `;
  document.body.appendChild(overlay);

  // Fade in when page loads
  document.addEventListener('DOMContentLoaded', () => {
    overlay.style.opacity = '0';
  });

  // Fade out on internal link click
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    // Only internal, same-origin, non-hash links
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel') ||
        link.target === '_blank') return;
    e.preventDefault();
    overlay.style.pointerEvents = 'all';
    overlay.style.opacity = '1';
    setTimeout(() => { window.location.href = href; }, 360);
  });

  // Fade in on arrival
  window.addEventListener('pageshow', () => {
    overlay.style.transition = 'none';
    overlay.style.opacity = '1';
    requestAnimationFrame(() => {
      overlay.style.transition = 'opacity .5s ease';
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.style.pointerEvents = 'none'; }, 520);
    });
  });
})();

/* ── 15. FORM INPUT FLOAT LABELS (subtle enhancement) ────────── */
(function floatLabels() {
  qsa('.form-row input, .form-row textarea').forEach(input => {
    // Just add a filled class for potential styling hooks
    const update = () => input.classList.toggle('has-value', input.value.length > 0);
    input.addEventListener('input', update);
    update();
  });
})();
