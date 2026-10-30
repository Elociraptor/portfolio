/* ============================================================
   animations.js — GSAP ScrollTrigger animations
   Easing: power3.out ≈ cubic-bezier(0.32, 0.72, 0, 1)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP not loaded — animations skipped');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const ease = 'power3.out';

  /* ── prefers-reduced-motion: keine Bewegung, nur Endzustände ─ */
  // Alle Reveals/Stagger unten laufen nur ohne reduced motion. Die Sprach-
  // balken bekommen direkt ihre Endbreite, alles andere bleibt unverändert sichtbar.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.lang-bar-fill').forEach((bar) => {
      gsap.set(bar, { scaleX: parseFloat(bar.dataset.pct) / 100 });
    });
    return;
  }

  /* ── Hero: staggered fade-up on load ─────────────────────── */
  // Nur Container/Zeilen animieren, die nicht bereits von anderem Code bewegt
  // werden: der Terminal-Inhalt gehört terminal.js (Typewriter), die Zeilen
  // des git-log-Blocks werden einzeln gestaffelt (nicht zusätzlich der Block).
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.from('.hero-avail', {
      y: 12, opacity: 0, duration: 0.5, delay: 0.0, ease,
    });
    gsap.from('.hero-name', {
      y: 28, opacity: 0, duration: 0.8, delay: 0.15, ease,
    });
    gsap.from('.gitlog-cmd', {
      y: 12, opacity: 0, duration: 0.5, delay: 0.32, ease,
    });
    gsap.from('.gitlog-row', {
      y: 12, opacity: 0, duration: 0.5, delay: 0.42, stagger: 0.09, ease,
    });
    gsap.from('.terminal-window', {
      y: 20, opacity: 0, duration: 0.7, delay: 0.35, ease,
    });
    gsap.from('.term-chips', {
      y: 12, opacity: 0, duration: 0.5, delay: 0.7, ease,
    });
  }

  /* ── Section headers: fade-up on scroll ──────────────────── */
  gsap.utils.toArray('.section-header').forEach((el) => {
    gsap.from(el, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    });
  });

  /* ── Project cards: staggered fade-up ────────────────────── */
  gsap.utils.toArray('.bento-grid .card-shell').forEach((card, i) => {
    gsap.from(card, {
      y: 24,
      opacity: 0,
      duration: 0.6,
      delay: i * 0.07,
      ease,
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        once: true,
      },
    });
  });

  /* ── Skill cards ─────────────────────────────────────────── */
  gsap.utils.toArray('.skills-grid .card-shell').forEach((card, i) => {
    gsap.from(card, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      delay: i * 0.1,
      ease,
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        once: true,
      },
    });
  });

  /* ── Skill pills: scale-in ───────────────────────────────── */
  gsap.utils.toArray('.skills-grid .card-shell').forEach((group, j) => {
    const pills = group.querySelectorAll('.skill-pill');
    pills.forEach((pill, i) => {
      gsap.from(pill, {
        scale: 0.85,
        opacity: 0,
        duration: 0.35,
        delay: 0.1 + j * 0.05 + i * 0.04,
        ease,
        scrollTrigger: {
          trigger: pill,
          start: 'top 92%',
          once: true,
        },
      });
    });
  });

  /* ── Language bars: scaleX animation ────────────────────── */
  document.querySelectorAll('.lang-bar-fill').forEach((bar, i) => {
    const pct = parseFloat(bar.dataset.pct) / 100;
    gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: pct,
        duration: 0.9,
        delay: 0.3 + i * 0.1,
        ease,
        scrollTrigger: {
          trigger: bar,
          start: 'top 90%',
          once: true,
        },
      }
    );
  });

  /* ── Timeline items: fade-in from left ──────────────────── */
  gsap.utils.toArray('.tl-item').forEach((item, i) => {
    gsap.from(item, {
      x: -16,
      opacity: 0,
      duration: 0.5,
      delay: i * 0.08,
      ease,
      scrollTrigger: {
        trigger: item,
        start: 'top 90%',
        once: true,
      },
    });
  });

  /* ── Thesis section: scroll-reveal (.th-reveal) ───────────── */
  // Eigene Klasse, damit nichts doppelt animiert wird (die Section nutzt
  // weder .section-header noch .card-shell/.tl-item). Respektiert reduced motion.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.utils.toArray('.th-reveal').forEach((el, i) => {
      gsap.from(el, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        delay: (i % 2) * 0.07,
        ease,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true,
        },
      });
    });
  }

  /* ── Contact heading ─────────────────────────────────────── */
  gsap.from('.contact-heading', {
    y: 24,
    opacity: 0,
    duration: 0.7,
    ease,
    scrollTrigger: {
      trigger: '.contact-heading',
      start: 'top 88%',
      once: true,
    },
  });
  gsap.from('.contact-sub', {
    y: 16,
    opacity: 0,
    duration: 0.6,
    delay: 0.1,
    ease,
    scrollTrigger: {
      trigger: '.contact-sub',
      start: 'top 90%',
      once: true,
    },
  });
  gsap.from('.contact-btn-wrap', {
    y: 12,
    opacity: 0,
    duration: 0.5,
    delay: 0.2,
    ease,
    scrollTrigger: {
      trigger: '.contact-btn-wrap',
      start: 'top 92%',
      once: true,
    },
  });
});
