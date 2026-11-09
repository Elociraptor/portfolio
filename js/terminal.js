/* ============================================================
   terminal.js — Typewriter-Intro für das Hero-Terminal

   Zuständig nur für die Intro (cat about.md). Danach übernimmt
   js/terminal-shell.js (interaktiver Prompt, Befehle, History).

   - 22ms pro Zeichen, 60ms Pause zwischen Zeilen
   - Intro ist per Klick / Enter / Esc / Skip-Button überspringbar
   - prefers-reduced-motion: kein Typewriter, Intro erscheint sofort
   - Sprachwechsel: vor Intro-Ende wird neu getippt, danach rendert
     die Shell das gesamte Transkript in der neuen Sprache neu.
   ============================================================ */

(function () {
  'use strict';

  /* Intro-Texte (cat about.md). Der Status steht nur im Hero-Badge, "now:" ohne Werkstudent-Teil (Freshfields endet Nov 2026). */
  const TERMINAL_LINES = {
    de: [
      { type: 'cmd',   text: '$ cat about.md' },
      { type: 'blank', text: '' },
      { type: 'kv',    key: 'name',    val: 'Ole Marwede' },
      { type: 'kv',    key: 'degree',  val: 'M.Sc. Informatik · ML' },
      { type: 'kv',    key: 'school',  val: 'HU Berlin' },
      { type: 'kv',    key: 'gpa',     val: 'B.Sc. 1,1 · Bachelorarbeit 1,0' },
      { type: 'kv',    key: 'now',     val: 'Master-Start, Machine Learning' },
      { type: 'blank', text: '' },
      { type: 'text',  text: 'Für die Bachelorarbeit eine CLIP-Videosuche gebaut, die auf einer einzigen GTX 1080 läuft.' },
      { type: 'text',  text: 'Davor: Freshfields (Werkstudent, Legal Tech mit ML-Komponente), ASML (Praktikum) und eine Lernplattform für Kinder.' },
      { type: 'text',  text: 'Aktuell: Master Informatik (Machine Learning, Computer Vision), auf Jobsuche.' },
      { type: 'blank', text: '' },
      { type: 'kv',    key: 'github',  val: 'Elociraptor' },
      { type: 'blank', text: '' },
      { type: 'hint',  text: "Tipp: 'help' tippen oder unten einen Befehl anklicken." },
    ],
    en: [
      { type: 'cmd',   text: '$ cat about.md' },
      { type: 'blank', text: '' },
      { type: 'kv',    key: 'name',    val: 'Ole Marwede' },
      { type: 'kv',    key: 'degree',  val: 'M.Sc. Computer Science · ML' },
      { type: 'kv',    key: 'school',  val: 'HU Berlin' },
      { type: 'kv',    key: 'gpa',     val: 'B.Sc. 1.1 · thesis 1.0' },
      { type: 'kv',    key: 'now',     val: 'master start, machine learning' },
      { type: 'blank', text: '' },
      { type: 'text',  text: 'For the bachelor thesis, built a CLIP video search that runs on a single GTX 1080.' },
      { type: 'text',  text: 'Before that: Freshfields (working student, legal tech with an ML component), ASML (internship) and a learning platform for kids.' },
      { type: 'text',  text: 'Now: master in computer science (machine learning, computer vision), looking for a job.' },
      { type: 'blank', text: '' },
      { type: 'kv',    key: 'github',  val: 'Elociraptor' },
      { type: 'blank', text: '' },
      { type: 'hint',  text: "Tip: type 'help' or click a command below." },
    ],
  };

  const CHAR_DELAY = 22;       // Befehl und Key/Value-Zeilen
  const TEXT_DELAY = 9;        // Fließtext und Hinweis, sonst dauert die Intro zu lange
  const LINE_DELAY = 60;

  const reducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── HTML-Helfer (Shell nutzt sie ebenfalls) ───────────────── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* Alle Texte werden escaped. Einzige Ausnahme: type 'html', das ist
     ausschließlich für feste Konstanten im Code gedacht, nie für Nutzereingaben. */
  function buildLineHTML(line) {
    switch (line.type) {
      case 'cmd':
        return `<span class="t-cmd">${escHtml(line.text)}</span>`;
      case 'blank':
        return '&nbsp;';
      case 'kv': {
        const pad = 9 - line.key.length;
        const spaces = '&nbsp;'.repeat(Math.max(pad, 1));
        return `<span class="t-indent"><span class="t-key">${escHtml(line.key)}:</span>${spaces}<span class="t-val">${escHtml(line.val)}</span></span>`;
      }
      case 'text':
        return `<span class="t-indent t-line">${escHtml(line.text)}</span>`;
      case 'hint':
        return `<span class="t-hint">${escHtml(line.text)}</span>`;
      case 'err':
        return `<span class="t-err">${escHtml(line.text)}</span>`;
      case 'col': {
        const left = line.cmd
          ? `<button type="button" class="t-link" data-cmd="${escHtml(line.cmd)}">${escHtml(line.left)}</button>`
          : `<span class="t-key">${escHtml(line.left)}</span>`;
        return `<span class="t-col">${left}</span> <span class="t-line">${escHtml(line.right || '')}</span>`;
      }
      case 'link':
        return `<span class="t-line">${escHtml(line.text || '')}</span><button type="button" class="t-link" data-cmd="${escHtml(line.cmd)}">${escHtml(line.label)}</button>`;
      case 'html':
        return line.html;
      default:
        return escHtml(line.text || '');
    }
  }

  function renderTermLines(lines) {
    return lines.map((l) => `<div>${buildLineHTML(l)}</div>`).join('');
  }

  /* ── Zustand ───────────────────────────────────────────────── */
  let introState = 'idle';          // idle | running | done
  let currentLang = null;
  let termTimeout = null;

  const $out  = () => document.getElementById('term-output');
  const $term = () => document.getElementById('terminal');

  function schedule(fn, ms) {
    termTimeout = setTimeout(fn, ms);
  }

  /* Tippt den sichtbaren Text einer fertig gerenderten Zeile Zeichen für
     Zeichen ein. Die Struktur (Einzug, Farben) steht von Anfang an, dadurch
     springt am Zeilenende nichts. */
  function typewriterLine(container, lineHTML, done, charDelay) {
    const row = document.createElement('div');
    row.innerHTML = lineHTML;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;

    if (lineHTML === '&nbsp;') { schedule(done, LINE_DELAY); return; }

    const nodes = [];
    const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const full = nodes.map((n) => n.data);
    nodes.forEach((n) => { n.data = ''; });

    let ni = 0;
    let ci = 0;
    (function tick() {
      while (ni < nodes.length && ci >= full[ni].length) { ni++; ci = 0; }
      if (ni >= nodes.length) {
        container.scrollTop = container.scrollHeight;
        schedule(done, LINE_DELAY);
        return;
      }
      ci++;
      nodes[ni].data = full[ni].slice(0, ci);
      schedule(tick, charDelay);
    })();
  }

  function finishIntro() {
    clearTimeout(termTimeout);
    const out = $out();
    const term = $term();
    if (!out) return;
    // Wurde per Tastatur über den Skip-Button übersprungen, geht der Fokus sonst
    // verloren (Button wird ausgeblendet). Dann ins Eingabefeld weiterreichen.
    const skipBtn = document.getElementById('term-skip');
    const focusWasOnSkip = !!skipBtn && document.activeElement === skipBtn;
    introState = 'done';
    if (term) term.dataset.intro = 'done';
    if (window.termShell) {
      window.termShell.start(currentLang);
      if (focusWasOnSkip) {
        const field = document.getElementById('term-input');
        if (field) field.focus({ preventScroll: true });
      }
    } else {
      // Fallback ohne Shell: Intro statisch zeigen
      out.innerHTML = renderTermLines(TERMINAL_LINES[currentLang]);
    }
  }

  function skipIntro() {
    if (introState === 'running') finishIntro();
  }

  function runTerminal(lang) {
    const out = $out();
    const term = $term();
    if (!out || !TERMINAL_LINES[lang]) return;

    if (introState === 'done') {
      currentLang = lang;
      if (window.termShell) window.termShell.setLang(lang);
      return;
    }
    if (introState === 'running' && lang === currentLang) return;

    clearTimeout(termTimeout);
    currentLang = lang;
    if (window.termShell) window.termShell.setLang(lang);   // Labels (aria) schon jetzt umstellen
    introState = 'running';
    if (term) term.dataset.intro = 'running';
    out.setAttribute('aria-live', 'off');
    out.innerHTML = '';

    if (reducedMotion()) { finishIntro(); return; }

    const lines = TERMINAL_LINES[lang];
    let idx = 0;
    (function next() {
      if (idx >= lines.length) { finishIntro(); return; }
      const line = lines[idx++];
      const fast = line.type === 'text' || line.type === 'hint';
      typewriterLine(out, buildLineHTML(line), next, fast ? TEXT_DELAY : CHAR_DELAY);
    })();
  }

  /* ── Intro überspringen: Klick, Enter/Esc, Skip-Button ─────── */
  function wireSkip() {
    const term = $term();
    if (!term) return;

    term.addEventListener('pointerdown', skipIntro);

    const btn = document.getElementById('term-skip');
    if (btn) btn.addEventListener('click', skipIntro);

    document.addEventListener('keydown', (e) => {
      if (introState !== 'running') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Tab' || e.key === 'Shift') return;
      // Navigationstasten (Scrollen im Log/auf der Seite) überspringen nichts
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar',
           'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) return;
      // Enter/Esc nur, wenn der Fokus im Terminal oder auf der Seite (body) liegt,
      // damit Enter auf einem anderen Link die Intro nicht als Nebeneffekt beendet.
      const active = document.activeElement;
      const inTerm = term.contains(active);
      const onBody = !active || active === document.body;
      if (inTerm || ((e.key === 'Enter' || e.key === 'Escape') && onBody)) skipIntro();
    });
  }

  window.TERMINAL_LINES  = TERMINAL_LINES;
  window.escHtml         = escHtml;
  window.renderTermLines = renderTermLines;
  window.runTerminal     = runTerminal;
  window.skipTermIntro   = skipIntro;

  document.addEventListener('DOMContentLoaded', () => {
    wireSkip();
    let saved = 'de';
    try { saved = localStorage.getItem('lang') || 'de'; } catch (e) { /* ignore */ }
    runTerminal(saved === 'en' ? 'en' : 'de');
  });
})();
