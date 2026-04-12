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

  // Persist
  localStorage.setItem('lang', lang);

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
if (hero && glow) {
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    glow.style.left = (e.clientX - rect.left) + 'px';
    glow.style.top  = (e.clientY - rect.top)  + 'px';
    glow.style.opacity = '1';
  }, { passive: true });
  hero.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
}

/* ── Init ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('lang') || 'de';
  setLang(savedLang);

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
});
