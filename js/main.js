/* ============================================================
   main.js — Language toggle, nav scroll, smooth scroll
   ============================================================ */

/* ── Language Toggle ─────────────────────────────────────────── */
function setLang(lang) {
  document.documentElement.lang = lang;

  // Swap all data-de / data-en text content
  document.querySelectorAll('[data-de]').forEach((el) => {
    const val = el.dataset[lang];
    if (val !== undefined) el.textContent = val;
  });

  // Update active button state
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Persist (Speicher kann blockiert sein, dann läuft es ohne weiter)
  try { localStorage.setItem('lang', lang); } catch (e) { /* ignore */ }

  // Re-run terminal in new language
  if (window.runTerminal) window.runTerminal(lang);
}

/* ── Nav: scroll glassmorphism ───────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── Smooth scroll for nav links ─────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});

/* ── Hero mouse-follow glow ───────────────────────────────────── */
const hero = document.getElementById('hero');
const glow = document.getElementById('hero-glow');
if (hero && glow && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // Position per transform (kein Layout), gedrosselt über requestAnimationFrame
  const GLOW_HALF = 240;   // halbe Kantenlänge von .hero-glow (480px)
  let gx = 0, gy = 0, glowRaf = 0;
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    gx = e.clientX - rect.left - GLOW_HALF;
    gy = e.clientY - rect.top  - GLOW_HALF;
    if (!glowRaf) {
      glowRaf = requestAnimationFrame(() => {
        glowRaf = 0;
        glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
        glow.style.opacity = '1';
      });
    }
  }, { passive: true });
  hero.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
}

/* ── Init ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  let savedLang = 'de';
  try { savedLang = localStorage.getItem('lang') || 'de'; } catch (e) { /* ignore */ }
  setLang(savedLang === 'en' ? 'en' : 'de');

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
});
