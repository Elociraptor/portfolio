/* ============================================================
   terminal-shell.js — interaktiver Prompt im Hero-Terminal

   Wird von terminal.js nach der Intro gestartet (termShell.start).
   - Befehle: help, whoami, ls, cat, open, lang, clear (+ Easter Egg)
   - Verlauf (Pfeil hoch/runter), Tab-Completion, Ctrl+L
   - Befehls-Chips unter dem Terminal funktionieren ohne Tippen
   - Das Transkript speichert pro Eintrag eine Ausgabe-Funktion, deshalb
     lässt sich bei Sprachwechsel alles sofort in der neuen Sprache neu
     rendern. Effekte (Scrollen, Navigieren) laufen nur beim ersten Mal.
   - Alle Ausgaben werden HTML-escaped (siehe terminal.js, buildLineHTML).

   ── PROJEKTLISTE ───────────────────────────────────────────
   `ls projects` und `open <projekt>` lesen die Karten aus dem DOM
   (#projects .card-shell: Titel aus .card-title, Ziel aus
   <a href> bzw. onclick="location.href='…'"). Neue Projektkarten
   tauchen deshalb automatisch auf. PROJECTS_FALLBACK greift nur,
   wenn im DOM nichts gefunden wird.
   ============================================================ */

(function () {
  'use strict';

  const output = document.getElementById('term-output');
  const form   = document.getElementById('term-form');
  const input  = document.getElementById('term-input');
  const term   = document.getElementById('terminal');
  const chips  = document.querySelector('.term-chips');
  if (!output || !form || !input || !term) return;

  const esc   = window.escHtml;
  const render = window.renderTermLines;

  /* ── Konstanten ────────────────────────────────────────────── */
  const THESIS_DETAIL = 'projects/bachelorarbeit.html';

  // Nur Fallback, siehe Kommentar oben.
  const PROJECTS_FALLBACK = [
    { slug: 'xcrawler',         title: 'XCrawler',                          href: 'projects/xcrawler.html' },
    { slug: 'battery-monitoring', title: 'Battery-Monitoring mit ML',       href: 'projects/battery-monitoring.html' },
    { slug: 'dkwdp',            title: 'Coder Dojo',                        href: 'projects/dkwdp.html' },
    { slug: 'asml',             title: 'ASML — Application Framework',      href: 'projects/asml.html' },
    { slug: 'knn',              title: 'kNearestNeighbor',                  href: 'projects/knn.html' },
    { slug: 'smartgarden',      title: 'smartgarden',                       href: 'projects/smartgarden.html' },
    { slug: 'bildverarbeitung', title: 'Bildverarbeitung',                  href: 'projects/bildverarbeitung.html' },
  ];

  // Ziele für `open <ziel>`, die auf Sections der Startseite scrollen.
  const SECTIONS = ['thesis', 'projects', 'skills', 'experience', 'contact'];
  const FILES    = ['about.md', 'now.md', 'thesis.md'];
  const MAX_ENTRIES = 200;

  const reducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Zustand ───────────────────────────────────────────────── */
  let lang = 'de';
  let started = false;
  const transcript = [];
  const history = [];
  let histIdx = -1;
  let draft = '';

  const tr = (l, de, en) => (l === 'de' ? de : en);

  /* ── Projekte aus dem DOM lesen ────────────────────────────── */
  function getProjects() {
    const list = [];
    document.querySelectorAll('#projects .card-shell').forEach((card) => {
      let href = card.dataset.href || '';
      if (!href) {
        const a = card.querySelector('.card-title a[href], a.card-stretch[href], a.card-stretched[href]');
        if (a) href = a.getAttribute('href');
      }
      if (!href) {
        const m = /location\.href\s*=\s*['"]([^'"]+)['"]/.exec(card.getAttribute('onclick') || '');
        if (m) href = m[1];
      }
      const titleEl = card.querySelector('.card-title');
      const title = titleEl ? titleEl.textContent.trim() : '';
      const file = href.split('#')[0].split('/').pop() || '';
      const slug = file.replace(/\.html?$/i, '').toLowerCase();
      if (href && title && slug) list.push({ slug, title, href });
    });
    return list.length ? list : PROJECTS_FALLBACK;
  }

  function findProject(query) {
    const q = query.toLowerCase();
    const all = getProjects();
    const exact = all.filter((p) => p.slug === q);
    if (exact.length) return { hit: exact[0] };
    const pre = all.filter((p) => p.slug.startsWith(q) || p.title.toLowerCase().startsWith(q));
    if (pre.length === 1) return { hit: pre[0] };
    if (pre.length > 1) return { many: pre };
    const sub = all.filter((p) => p.title.toLowerCase().includes(q));
    if (sub.length === 1) return { hit: sub[0] };
    if (sub.length > 1) return { many: sub };
    return {};
  }

  /* ── Navigation ────────────────────────────────────────────── */
  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top, behavior: reducedMotion() ? 'instant' : 'smooth' });
  }

  function navigateTo(href) {
    setTimeout(() => { window.location.href = href; }, reducedMotion() ? 0 : 450);
  }

  /* ── Zeilen-Bausteine ──────────────────────────────────────── */
  const kv   = (key, val) => ({ type: 'kv', key, val });
  const txt  = (text) => ({ type: 'text', text });
  const out1 = (text) => ({ type: 'out', text });
  const err  = (text) => ({ type: 'err', text });
  const hint = (text) => ({ type: 'hint', text });
  const col  = (left, right, cmd) => ({ type: 'col', left, right, cmd });
  const link = (text, label, cmd) => ({ type: 'link', text, label, cmd });
  const blank = { type: 'blank', text: '' };

  /* ── Befehle ───────────────────────────────────────────────── */
  /* run(args) wird einmal beim Ausführen aufgerufen und liefert
       { out: (lang) => Zeilen[], after?: () => void }
     out darf beliebig oft (bei Sprachwechsel) neu aufgerufen werden. */
  const COMMANDS = {
    help: {
      run() {
        return { out: (l) => [
          col('help',          tr(l, 'diese Liste', 'this list'), 'help'),
          col('whoami',        tr(l, 'wer ist das?', 'who is this?'), 'whoami'),
          col('ls projects',   tr(l, 'Projekte auflisten', 'list projects'), 'ls projects'),
          col('cat thesis.md', tr(l, 'Bachelorarbeit in Kurzform', 'bachelor thesis in short'), 'cat thesis.md'),
          col('cat now.md',    tr(l, 'woran ich gerade sitze', 'what I am working on'), 'cat now.md'),
          col('cat about.md',  tr(l, 'die Intro nochmal', 'the intro again'), 'cat about.md'),
          col(tr(l, 'open <ziel>', 'open <target>'), tr(l, 'projekt | thesis | contact | skills | experience', 'project | thesis | contact | skills | experience')),
          col('lang de|en',    tr(l, 'Sprache wechseln', 'switch language')),
          col('clear',         tr(l, 'Terminal leeren', 'clear terminal'), 'clear'),
          hint(tr(l, 'Tab: vervollständigen · Pfeil hoch/runter: Verlauf', 'Tab: complete · Arrow up/down: history')),
        ] };
      },
    },

    whoami: {
      run() {
        return { out: (l) => [
          kv('name', 'Ole Marwede'),
          kv('study', tr(l, 'M.Sc. Informatik, HU Berlin', 'M.Sc. Computer Science, HU Berlin')),
          kv('bachelor', tr(l, 'Internationale Medieninformatik, HTW Berlin', 'International Media Informatics, HTW Berlin')),
          kv('base', 'Berlin'),
          kv('github', 'Elociraptor'),
          hint(tr(l, 'Mehr: cat about.md · cat now.md', 'More: cat about.md · cat now.md')),
        ] };
      },
    },

    ls: {
      args: ['projects'],
      run(args) {
        const targets = args.filter((a) => !a.startsWith('-'));
        if (!targets.length) {
          return { out: () => [out1('about.md   now.md   thesis.md   projects/')] };
        }
        const t = targets[0].replace(/^\.\//, '').replace(/\/$/, '').toLowerCase();
        if (t !== 'projects') {
          return { out: (l) => [err(tr(l,
            `ls: Zugriff auf '${targets[0]}' nicht möglich: Datei oder Verzeichnis nicht gefunden`,
            `ls: cannot access '${targets[0]}': No such file or directory`))] };
        }
        return { out: (l) => {
          const lines = getProjects().map((p) => col(p.slug, p.title, `open ${p.slug}`));
          lines.push(hint(tr(l,
            "open <name> öffnet die Detailseite · Bachelorarbeit: 'cat thesis.md'",
            "open <name> opens the detail page · bachelor thesis: 'cat thesis.md'")));
          return lines;
        } };
      },
    },

    cat: {
      args: FILES,
      run(args) {
        if (!args.length) {
          return { out: (l) => [err(tr(l, 'cat: Dateiname fehlt', 'cat: missing file operand'))] };
        }
        const name = args[0].replace(/^\.\//, '').toLowerCase();
        const key = name.replace(/\.md$/, '');

        if (key === 'about') {
          // Intro ohne Prompt-Zeile und Hinweis
          return { out: (l) => {
            const lines = window.TERMINAL_LINES[l].filter((x) => x.type !== 'cmd' && x.type !== 'hint');
            while (lines.length && lines[lines.length - 1].type === 'blank') lines.pop();
            return lines;
          } };
        }

        if (key === 'now') {
          /* Werkstudent-Zeile ist raus, weil Freshfields im Nov 2026 endet. */
          return { out: (l) => [
            kv('thesis', tr(l, 'abgeschlossen, Note 1,0', 'done, grade 1.0')),
            kv('master', tr(l, 'Informatik an der HU, Schwerpunkte ML und Computer Vision', 'computer science at HU, focus on ML and computer vision')),
          ] };
        }

        if (key === 'thesis') {
          return { out: (l) => [
            out1(tr(l,
              'Optimierungsstrategien für CLIP-basierte Text-zu-Video-Retrieval-Systeme',
              'Optimization Strategies for CLIP-Based Text-to-Video Retrieval Systems')),
            blank,
            kv('context',  tr(l, 'Known-Item-Search (wie beim Video Browser Showdown)', 'known-item search (as at the Video Browser Showdown)')),
            kv('sampling', tr(l, '2 / 1 / 0,5 fps und shot-basiert (TransNetV2)', '2 / 1 / 0.5 fps and shot-based (TransNetV2)')),
            kv('wise-ft',  tr(l, 'α von 0,0 bis 1,0 in 0,1er-Schritten', 'α from 0.0 to 1.0 in steps of 0.1')),
            kv('data',     tr(l, 'MSR-VTT, Charades als Out-of-Distribution-Test', 'MSR-VTT, Charades as out-of-distribution test')),
            kv('runs',     tr(l, '~200 Messungen auf einer GTX 1080 (8 GB)', '~200 measurements on one GTX 1080 (8 GB)')),
            kv('grade',    tr(l, '1,0', '1.0')),
            blank,
            txt(tr(l,
              'α-Optimum in-domain bei 0,7–0,9, out-of-distribution bei 0,2–0,6. 1 fps reicht: 2 fps bringt kaum etwas, kostet aber doppelt so viele Frames. Der Pretraining-Checkpoint wirkt stärker als die Optimierungen, die ich untersucht habe.',
              'α optimum sits at 0.7–0.9 in-domain and 0.2–0.6 out-of-distribution. 1 fps is enough: 2 fps adds hardly anything but costs twice the frames. The pretraining checkpoint matters more than the optimizations I tested.')),
            blank,
            kv('efficiency', tr(l, 'partielles Fine-Tuning in 55 % der Zeit', 'partial fine-tuning in 55% of the time')),
            hint(tr(l, 'Alle Messwerte und den Code gibt es auf GitHub: Elociraptor/bachelor_thesis_code', 'All measurements and the code are on GitHub: Elociraptor/bachelor_thesis_code')),
            link('→ ', 'open thesis', 'open thesis'),
            link('→ ', 'open bachelorarbeit', 'open bachelorarbeit'),
          ] };
        }

        return { out: (l) => [err(tr(l,
          `cat: ${args[0]}: Datei oder Verzeichnis nicht gefunden`,
          `cat: ${args[0]}: No such file or directory`))] };
      },
    },

    open: {
      run(args) {
        if (!args.length) {
          return { out: (l) => [err(tr(l,
            'Aufruf: open <projekt|thesis|contact|skills|experience>',
            'usage: open <project|thesis|contact|skills|experience>'))] };
        }
        const query = args.join(' ').replace(/^\.\//, '').replace(/^#/, '').toLowerCase();

        if (SECTIONS.includes(query)) {
          return {
            out: (l) => [out1(tr(l, `öffne ${query} …`, `opening ${query} …`))],
            after: () => scrollToSection(query),
          };
        }
        if (query === 'bachelorarbeit') {
          return {
            out: (l) => [out1(tr(l, `öffne ${THESIS_DETAIL} …`, `opening ${THESIS_DETAIL} …`))],
            after: () => navigateTo(THESIS_DETAIL),
          };
        }
        const res = findProject(query);
        if (res.hit) {
          const p = res.hit;
          return {
            out: (l) => [out1(tr(l, `öffne ${p.href} …`, `opening ${p.href} …`))],
            after: () => navigateTo(p.href),
          };
        }
        if (res.many) {
          const names = res.many.map((p) => p.slug);
          return { out: (l) => [
            err(tr(l, `open: '${args.join(' ')}' ist nicht eindeutig`, `open: '${args.join(' ')}' is ambiguous`)),
            ...names.map((n) => col(n, '', `open ${n}`)),
          ] };
        }
        return { out: (l) => [err(tr(l,
          `open: ${args.join(' ')}: nicht gefunden. Probier 'ls projects'`,
          `open: ${args.join(' ')}: not found. Try 'ls projects'`))] };
      },
    },

    lang: {
      args: ['de', 'en'],
      run(args) {
        const target = (args[0] || '').toLowerCase();
        if (target !== 'de' && target !== 'en') {
          return { out: (l) => [err(tr(l, 'Aufruf: lang de|en', 'usage: lang de|en'))] };
        }
        return {
          out: (l) => [out1(tr(l, `Sprache: ${target}`, `language: ${target}`))],
          after: () => {
            if (typeof window.setLang === 'function') window.setLang(target);
            else api.setLang(target);
          },
        };
      },
    },

    clear: { run: () => null },

    // Easter Egg, steht bewusst nicht in `help`.
    sudo: {
      hidden: true,
      run(args) {
        const rest = args.join(' ').toLowerCase();
        if (!args.length) {
          return { out: (l) => [err(tr(l, 'Aufruf: sudo <befehl>', 'usage: sudo <command>'))] };
        }
        if (/^hire\s+ole(\s+marwede)?$/.test(rest)) {
          return { out: (l) => [
            out1(tr(l, '[sudo] Passwort für recruiter: ********', '[sudo] password for recruiter: ********')),
            out1(tr(l, 'ole wurde eingestellt.*', 'ole has been hired.*')),
            hint(tr(l, '*Kleingedrucktes: erst reden wir kurz miteinander.', '*fine print: we talk first.')),
            link('→ ', 'open contact', 'open contact'),
          ] };
        }
        if (args[0] === 'rm') {
          return { out: (l) => [out1(tr(l,
            'Netter Versuch. Dieses Portfolio ist read-only.',
            'Nice try. This portfolio is read-only.'))] };
        }
        return { out: (l) => [err(tr(l,
          'recruiter steht nicht in der sudoers-Datei. Dieser Vorfall wird gemeldet. (Spoiler: nicht.)',
          'recruiter is not in the sudoers file. This incident will be reported. (Spoiler: it won\'t.)'))] };
      },
    },
  };

  /* ── Rendering ─────────────────────────────────────────────── */
  function scrollBottom() {
    output.scrollTop = output.scrollHeight;
  }

  function entryHTML(e) {
    const echo = e.raw === null ? ''
      : `<div><span class="t-cmd">$ </span><span class="t-typed">${esc(e.raw)}</span></div>`;
    const gap = e.noGap ? '' : '<div>&nbsp;</div>';
    return `<div class="t-entry">${echo}${render(e.out(lang))}${gap}</div>`;
  }

  function renderAll() {
    output.innerHTML = transcript.map(entryHTML).join('');
    scrollBottom();
  }

  function addEntry(e) {
    transcript.push(e);
    if (transcript.length > MAX_ENTRIES) transcript.shift();
    output.insertAdjacentHTML('beforeend', entryHTML(e));
    scrollBottom();
  }

  /* ── A11y-Labels (Attribute laufen nicht über data-de/data-en) ─ */
  function applyLabels() {
    output.setAttribute('aria-label', tr(lang, 'Terminal-Ausgabe', 'Terminal output'));
    input.setAttribute('placeholder', tr(lang, "'help' eingeben", "type 'help'"));
    if (chips) chips.setAttribute('aria-label', tr(lang, 'Befehle zum Anklicken', 'Clickable commands'));
  }

  /* ── Ausführen ─────────────────────────────────────────────── */
  function run(raw) {
    const line = raw.trim().replace(/\s+/g, ' ');
    if (!line || !started) return;

    if (history[history.length - 1] !== line) history.push(line);
    histIdx = -1;
    draft = '';

    const parts = line.split(' ');
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);
    const cmd = Object.prototype.hasOwnProperty.call(COMMANDS, name) ? COMMANDS[name] : null;

    if (!cmd) {
      addEntry({ raw: line, out: (l) => [err(tr(l,
        `Befehl nicht gefunden: ${name} — probier 'help'`,
        `command not found: ${name} — try 'help'`))] });
      return;
    }

    const res = cmd.run(args);
    if (res === null) { clearTerminal(); return; }

    addEntry({ raw: line, out: res.out });
    if (res.after) res.after();
  }

  function clearTerminal() {
    transcript.length = 0;
    output.innerHTML = '';
  }

  /* ── Tab-Completion ────────────────────────────────────────── */
  function candidatesFor(parts) {
    const idx = parts.length - 1;
    const cur = parts[idx].toLowerCase();
    let pool = [];
    if (idx === 0) {
      pool = Object.keys(COMMANDS).filter((k) => !COMMANDS[k].hidden);
    } else {
      const base = parts[0].toLowerCase();
      if (base === 'open') pool = getProjects().map((p) => p.slug).concat(SECTIONS, ['bachelorarbeit']);
      else if (base === 'cat' || base === 'ls' || base === 'lang') pool = COMMANDS[base].args || [];
      else if (base === 'sudo' && idx === 1) pool = ['hire'];
      else if (base === 'sudo' && idx === 2 && parts[1].toLowerCase() === 'hire') pool = ['ole'];
    }
    return pool.filter((c) => c.startsWith(cur)).sort();
  }

  function commonPrefix(list) {
    let p = list[0];
    for (const s of list) { while (!s.startsWith(p)) p = p.slice(0, -1); }
    return p;
  }

  function complete() {
    const value = input.value;
    if (!value.trim()) return false;            // leere Eingabe: Tab bewegt den Fokus normal weiter
    const parts = value.replace(/^\s+/, '').split(/\s+/);
    if (/\s$/.test(value)) parts.push('');
    const cands = candidatesFor(parts);
    if (!cands.length) return false;

    const idx = parts.length - 1;
    const cur = parts[idx].toLowerCase();
    const hasArgs = (name) => name === 'ls' || name === 'cat' || name === 'open' || name === 'lang' || name === 'sudo';

    if (cands.length === 1) {
      parts[idx] = cands[0];
      let v = parts.join(' ');
      if (idx === 0 && hasArgs(cands[0])) v += ' ';
      input.value = v;
      return true;
    }
    const lcp = commonPrefix(cands);
    if (lcp.length > cur.length) {
      parts[idx] = lcp;
      input.value = parts.join(' ');
    } else {
      const last = transcript[transcript.length - 1];
      const key = `${value}\u0000${cands.join(' ')}`;
      if (!last || last.completionKey !== key) {   // gleiche Liste nicht zweimal hintereinander
        addEntry({ raw: value, completionKey: key, out: () => [out1(cands.join('   '))], noGap: true });
      }
    }
    return true;
  }

  /* ── Events ────────────────────────────────────────────────── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = '';
    run(v);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      if (!history.length) return;
      e.preventDefault();
      if (histIdx === -1) { draft = input.value; histIdx = history.length; }
      histIdx = Math.max(0, histIdx - 1);
      input.value = history[histIdx];
    } else if (e.key === 'ArrowDown') {
      if (histIdx === -1) return;
      e.preventDefault();
      histIdx++;
      if (histIdx >= history.length) { histIdx = -1; input.value = draft; }
      else input.value = history[histIdx];
    } else if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (complete()) e.preventDefault();
    } else if ((e.key === 'l' || e.key === 'L') && e.ctrlKey) {
      e.preventDefault();
      clearTerminal();
    }
  });

  // Befehle in der Ausgabe (Links wie "open thesis") ausführen
  output.addEventListener('click', (e) => {
    const btn = e.target.closest('.t-link[data-cmd]');
    if (btn) run(btn.dataset.cmd);
  });

  // Chips: funktionieren auch, solange die Intro noch läuft (überspringt sie)
  if (chips) {
    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('.term-chip[data-cmd]');
      if (!chip) return;
      if (!started && typeof window.skipTermIntro === 'function') window.skipTermIntro();
      run(chip.dataset.cmd);
    });
  }

  // Klick ins Terminal fokussiert die Eingabe, aber nur mit Maus (kein Tastatur-Popup auf Touch)
  term.addEventListener('click', (e) => {
    if (!started) return;
    if (e.target.closest('button, a, input')) return;
    const sel = window.getSelection && window.getSelection();
    if (sel && String(sel).length) return;
    if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
      input.focus({ preventScroll: true });
    }
  });

  /* ── Öffentliche API (wird von terminal.js / main.js genutzt) ─ */
  const api = {
    start(l) {
      lang = l === 'en' ? 'en' : 'de';
      started = true;
      transcript.length = 0;
      transcript.push({
        raw: null,
        noGap: true,
        out: (ll) => window.TERMINAL_LINES[ll],
      });
      applyLabels();
      renderAll();
      output.setAttribute('aria-live', 'polite');
    },
    setLang(l) {
      lang = l === 'en' ? 'en' : 'de';
      applyLabels();
      if (!started) return;
      // Neu rendern ohne Vorlesen des gesamten Verlaufs
      output.setAttribute('aria-live', 'off');
      renderAll();
      requestAnimationFrame(() => output.setAttribute('aria-live', 'polite'));
    },
  };

  window.termShell = api;
  applyLabels();
})();
