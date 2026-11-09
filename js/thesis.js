/* ============================================================
   thesis.js — interaktiver α-Explorer (Bachelorarbeit)
   Inline-SVG, keine Chart-Bibliothek, keine Abhängigkeiten.

   Erwartet pro Explorer ein Element:
     <div class="alpha-explorer" data-src="data/alpha_sweep.json" ...>
       <div class="alpha-empty">…"Daten folgen"-Zustand…</div>
       <div class="alpha-live" hidden></div>
     </div>
   Optional: data-table="true" rendert zusätzlich eine Wertetabelle.

   ── Datenformat: data/alpha_sweep.json ─────────────────────
   Ohne Datei (oder ohne Webserver, z. B. file://) bleibt der
   "nicht verfügbar"-Zustand stehen, es werden keine Kurven erfunden.

   {
     "meta": { "caption": { "de": "…", "en": "…" } },      (optional)
     "sets": [
       { "id": "partial", "label": { "de": "…", "en": "…" },
         "msrvtt":   [ { "alpha": 0.0, "r1": 0.2, "r5": 0.4, "r10": 0.5 }, … ],
         "charades": [ … ] },
       { "id": "full", … }
     ]
   }

   Ein "set" ist eine Fine-Tuning-Variante. Bei mehreren Sets erscheint
   eine Auswahl. Mit data-simple="true" am Explorer-Element wird nur das
   erste Set und nur R@1 gezeigt (die JSON bleibt vollständig). Die ältere Form ohne "sets" (nur { "msrvtt": […],
   "charades": […] } auf oberster Ebene) wird als ein einzelnes Set gelesen.

   - "msrvtt" = In-Domain, "charades" = Out-of-Distribution.
   - alpha: Zahl von 0 bis 1 (in der Arbeit 0.0 bis 1.0 in 0.1er-Schritten).
     α = 0 ist das Zero-Shot-Modell, α = 1 das vollständig fine-getunte
     (die Daten bestätigen das: bei α = 0 sind alle Varianten identisch).
     Reihen müssen nicht dieselben α-Werte haben; Lücken werden als
     Lücken gezeichnet.
   - r1 / r5 / r10: Recall@K als Zahl. Liegen alle Werte <= 1, werden sie
     als Anteil (0–1) gelesen und als Prozent angezeigt, sonst als Prozent.
     Nicht vorhandene Metriken dürfen fehlen; die Metrik-Buttons richten
     sich nach den Daten.
   - meta.caption: eine Zeile unter der Legende (Checkpoint, Sampling, Queries).
   ============================================================ */

(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const SERIES = [
    { key: 'msrvtt',   cls: 'id'  },
    { key: 'charades', cls: 'ood' },
  ];
  const METRICS = ['r1', 'r5', 'r10'];
  const METRIC_LABEL = { r1: 'R@1', r5: 'R@5', r10: 'R@10' };

  /* ── Texte (zweisprachig) ──────────────────────────────────── */
  const T = {
    de: {
      id: 'Bekannte Daten · MSR-VTT',
      ood: 'Fremde Daten · Charades',
      slider: 'Fine-Tuning-Anteil α (0 = Original, 1 = voll angepasst)',
      metric: 'Metrik',
      variant: 'Fine-Tuning',
      atOptimum: 'bester Wert',
      best: (v, a) => `bester Wert: ${v} bei α = ${a}`,
      noValue: 'keine Messung bei diesem α',
      chart: (m) => `Liniendiagramm: Veränderung von ${m} gegenüber dem Original-Modell (α = 0) über α, für bekannte Daten (MSR-VTT) und fremde Daten (Charades)`,
      yTitle: (m) => `${m}-Gewinn ggü. Original (Pp)`,
      table: 'Werte je α',
      tableCaption: (m, v) => `Messwerte für ${m} je α${v ? ' · ' + v : ''}`,
    },
    en: {
      id: 'Familiar data · MSR-VTT',
      ood: 'Unseen data · Charades',
      slider: 'Fine-tuning share α (0 = original, 1 = fully adapted)',
      metric: 'Metric',
      variant: 'Fine-tuning',
      atOptimum: 'best value',
      best: (v, a) => `best value: ${v} at α = ${a}`,
      noValue: 'no measurement at this α',
      chart: (m) => `Line chart: change in ${m} relative to the original model (α = 0) over α, for familiar data (MSR-VTT) and unseen data (Charades)`,
      yTitle: (m) => `${m} gain vs. original model (pp)`,
      table: 'Values per α',
      tableCaption: (m, v) => `Measured ${m} per α${v ? ' · ' + v : ''}`,
    },
  };

  const getLang = () => (document.documentElement.lang === 'en' ? 'en' : 'de');

  /* ── Daten laden und prüfen ────────────────────────────────── */
  const cache = new Map();
  function loadData(src) {
    if (!cache.has(src)) {
      cache.set(
        src,
        fetch(src, { cache: 'no-cache' })
          .then((res) => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          })
          .then(normalize)
          .catch((err) => {
            // Erwartet bei file:// oder fehlender Datei. Der Hinweis-Zustand bleibt stehen.
            console.info('[thesis] α-Daten nicht verfügbar:', err.message);
            return null;
          })
      );
    }
    return cache.get(src);
  }

  const num = (v) => (typeof v === 'number' && isFinite(v) ? v : null);
  const roundA = (a) => Math.round(a * 1e4) / 1e4;

  /* Liefert { alphas[], sets: [{id, label, rows: {msrvtt: Map, charades: Map}}], metrics[], scale, digits, caption } oder null. */
  function normalize(raw) {
    if (!raw || typeof raw !== 'object') return null;

    // Ältere Form ohne "sets" = ein einzelnes Set.
    const rawSets = Array.isArray(raw.sets) && raw.sets.length ? raw.sets : [raw];
    const alphaSet = new Set();
    const sets = [];

    rawSets.forEach((rs, si) => {
      if (!rs || typeof rs !== 'object') return;
      const rows = {};
      let anyRows = false;
      for (const s of SERIES) {
        const m = new Map();
        const list = Array.isArray(rs[s.key]) ? rs[s.key] : [];
        for (const r of list) {
          const a = r && num(r.alpha);
          if (a === null || a < 0 || a > 1) continue;
          const entry = {};
          let any = false;
          for (const k of METRICS) {
            entry[k] = num(r[k]);
            if (entry[k] !== null) any = true;
          }
          if (!any) continue;
          m.set(roundA(a), entry);
          alphaSet.add(roundA(a));
          anyRows = true;
        }
        rows[s.key] = m;
      }
      if (anyRows) sets.push({ id: String(rs.id || 'set' + si), label: rs.label || null, rows });
    });
    if (!sets.length) return null;

    const alphas = [...alphaSet].sort((a, b) => a - b);
    const allRows = (s) => sets.flatMap((st) => [...st.rows[s.key].values()]);
    const metrics = METRICS.filter((k) =>
      SERIES.some((s) => allRows(s).some((e) => e[k] !== null))
    );
    if (!metrics.length) return null;

    let max = -Infinity;
    for (const s of SERIES) {
      for (const e of allRows(s)) {
        for (const k of metrics) if (e[k] !== null && e[k] > max) max = e[k];
      }
    }
    const scale = max <= 1 ? 100 : 1; // Anteil -> Prozent

    const digits = Math.max(
      1,
      ...alphas.map((a) => (String(a).split('.')[1] || '').length)
    );

    const caption = raw.meta && raw.meta.caption ? raw.meta.caption : null;
    return { alphas, sets, metrics, scale, digits, caption };
  }

  /* Text aus { de, en } (oder einfachem String) in der aktuellen Sprache. */
  function loc(v) {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v[getLang()] || v.de || v.en || '';
  }

  /* ── Hilfsfunktionen ───────────────────────────────────────── */
  function el(name, attrs, parent) {
    const n = document.createElementNS(SVG_NS, name);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function h(tag, cls, parent, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function fmt(v, digits) {
    const s = v.toFixed(digits);
    return getLang() === 'de' ? s.replace('.', ',') : s;
  }
  function fmtPct(v) {
    return getLang() === 'de' ? fmt(v, 1) + ' %' : fmt(v, 1) + '%';
  }
  function fmtSigned(v, digits) {
    const r = Number(v.toFixed(digits));
    if (r === 0) return fmt(0, digits);
    return (r < 0 ? '−' : '+') + fmt(Math.abs(r), digits);
  }
  function niceStep(range, ticks) {
    const raw = range / ticks;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const f = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
    return f * mag;
  }

  /* ── Explorer aufbauen ─────────────────────────────────────── */
  let uid = 0;

  function build(root, data) {
    const id = 'alpha' + ++uid;
    const live = root.querySelector('.alpha-live');
    const empty = root.querySelector('.alpha-empty');
    const showTable = root.dataset.table === 'true';

    // Einfacher Modus (data-simple="true"): nur die erste Variante und nur R@1, ohne Auswahl-Buttons.
    // Die Daten in der JSON bleiben vollständig; ohne das Attribut erscheinen Metrik- und Varianten-Auswahl wieder.
    const simple = root.dataset.simple === 'true';
    if (simple) {
      data = Object.assign({}, data, {
        sets: data.sets.slice(0, 1),
        metrics: data.metrics.includes('r1') ? ['r1'] : data.metrics.slice(0, 1),
      });
    }

    const state = {
      idx: Math.min(data.alphas.length - 1, Math.round((data.alphas.length - 1) / 2)),
      metric: data.metrics.includes('r1') ? 'r1' : data.metrics[0],
      set: 0,
    };
    // Start am Optimum der In-Domain-Reihe, falls vorhanden (kein Spoiler nötig, es sind ja die echten Daten).
    const initOpt = optimum('msrvtt');
    if (initOpt !== null) state.idx = initOpt;

    live.textContent = '';

    /* Legende */
    const legend = h('div', 'alpha-legend', live);
    const legendItems = SERIES.map((s) => {
      const item = h('span', 'alpha-legend-item', legend);
      const sw = el('svg', { width: 28, height: 10, viewBox: '0 0 28 10', 'aria-hidden': 'true', focusable: 'false' });
      el('line', { x1: 1, y1: 5, x2: 27, y2: 5, class: 'sw sw-' + s.cls }, sw);
      item.appendChild(sw);
      return h('span', 'alpha-legend-label', item);
    });

    /* Kurzbeschreibung der Messung (Checkpoint, Sampling, Queries) */
    const captionEl = data.caption ? h('p', 'alpha-caption', live) : null;

    /* Diagramm */
    const W = 640, H = 320;
    const M = { l: 48, r: 18, t: 30, b: 44 };
    const svg = el('svg', {
      class: 'alpha-chart', viewBox: `0 0 ${W} ${H}`, role: 'img',
    });
    const svgTitle = el('title', { id: id + '-title' }, svg);
    svg.setAttribute('aria-labelledby', id + '-title');
    live.appendChild(svg);

    /* Steuerung */
    const controls = h('div', 'alpha-controls', live);

    const sliderWrap = h('div', 'alpha-slider-wrap', controls);
    const sliderHead = h('div', 'alpha-slider-head', sliderWrap);
    const sliderLabel = h('label', 'alpha-slider-label', sliderHead);
    sliderLabel.setAttribute('for', id + '-range');
    const sliderValue = h('output', 'alpha-slider-value', sliderHead);
    sliderValue.setAttribute('for', id + '-range');
    // <output> ist implizit eine live region; die Ansage übernimmt der Slider (aria-valuetext)
    // und die Readout-Region, daher hier stumm schalten.
    sliderValue.setAttribute('aria-live', 'off');
    const slider = h('input', 'alpha-range', sliderWrap);
    slider.type = 'range';
    slider.id = id + '-range';
    slider.min = 0;
    slider.max = data.alphas.length - 1;
    slider.step = 1;
    slider.value = state.idx;
    const ends = h('div', 'alpha-slider-ends', sliderWrap);
    h('span', null, ends, fmt(data.alphas[0], data.digits));
    h('span', null, ends, fmt(data.alphas[data.alphas.length - 1], data.digits));

    const metricGroup = h('div', 'alpha-metrics', controls);
    metricGroup.setAttribute('role', 'group');
    const metricLabel = h('span', 'alpha-metrics-label', metricGroup);
    const metricBtns = data.metrics.map((k) => {
      const b = h('button', 'alpha-metric-btn', metricGroup, METRIC_LABEL[k]);
      b.type = 'button';
      b.dataset.metric = k;
      b.addEventListener('click', () => { state.metric = k; update(); });
      return b;
    });
    metricGroup.setAttribute('aria-labelledby', id + '-metric-label');
    metricLabel.id = id + '-metric-label';
    if (data.metrics.length < 2) metricGroup.style.display = 'none'; // nur eine Metrik: keine Auswahl nötig

    /* Auswahl der Fine-Tuning-Variante (nur bei mehr als einem Set) */
    let setLabelEl = null;
    let setBtns = [];
    if (data.sets.length > 1) {
      const setGroup = h('div', 'alpha-metrics', controls);
      setGroup.setAttribute('role', 'group');
      setLabelEl = h('span', 'alpha-metrics-label', setGroup);
      setLabelEl.id = id + '-set-label';
      setGroup.setAttribute('aria-labelledby', setLabelEl.id);
      setBtns = data.sets.map((st, i) => {
        const b = h('button', 'alpha-metric-btn', setGroup);
        b.type = 'button';
        b.addEventListener('click', () => { state.set = i; update(); });
        return b;
      });
    }

    /* Readout (aria-live) */
    const readout = h('div', 'alpha-readout', live);
    readout.setAttribute('aria-live', 'polite');
    readout.setAttribute('aria-atomic', 'true');


    /* Tabelle (optional) */
    let tableWrap = null, table = null, tableCaption = null, tableHead = null, tableBody = null;
    if (showTable) {
      tableWrap = h('div', 'alpha-table-wrap', live);
      table = h('table', 'alpha-table', tableWrap);
      tableCaption = h('caption', null, table);
      tableHead = h('thead', null, table);
      tableBody = h('tbody', null, table);
    }

    /* ── Logik ── */
    function value(seriesKey, idx, metric) {
      const row = data.sets[state.set].rows[seriesKey].get(data.alphas[idx]);
      return row && row[metric] !== null ? row[metric] * data.scale : null;
    }
    function optimum(seriesKey, metric) {
      const mt = metric || state.metric;
      let best = null, bestV = -Infinity;
      data.alphas.forEach((_, i) => {
        const v = value(seriesKey, i, mt);
        if (v !== null && v > bestV) { bestV = v; best = i; }
      });
      return best;
    }

    /* Das Diagramm zeigt die Veränderung gegenüber dem Zero-Shot-Modell (erster Messpunkt, α = 0)
       in Prozentpunkten. So sind In-Domain und Out-of-Distribution vergleichbar, obwohl ihre
       absoluten Werte weit auseinanderliegen. Readout und Tabelle zeigen weiter die Absolutwerte. */
    function baseline(setIdx, seriesKey, metric) {
      const rows = data.sets[setIdx].rows[seriesKey];
      for (const a of data.alphas) {
        const r = rows.get(a);
        if (r && r[metric] !== null) return r[metric] * data.scale;
      }
      return null;
    }
    function delta(setIdx, seriesKey, idx, metric) {
      const row = data.sets[setIdx].rows[seriesKey].get(data.alphas[idx]);
      const b = baseline(setIdx, seriesKey, metric);
      return row && row[metric] !== null && b !== null ? row[metric] * data.scale - b : null;
    }

    function drawChart() {
      const lang = getLang();
      const t = T[lang];
      // alte Inhalte (außer <title>) entfernen
      [...svg.childNodes].forEach((n) => { if (n !== svgTitle) svg.removeChild(n); });
      svgTitle.textContent = t.chart(METRIC_LABEL[state.metric]);

      // y-Achse über alle Sets bestimmen, damit sie beim Umschalten der Variante stabil bleibt
      const all = [0]; // 0 (Zero-Shot) liegt immer im Bild
      data.sets.forEach((_, si) => SERIES.forEach((s) => data.alphas.forEach((a, i) => {
        const v = delta(si, s.key, i, state.metric);
        if (v !== null) all.push(v);
      })));
      let lo = Math.min(...all), hi = Math.max(...all);
      if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
      const step = niceStep(hi - lo, 4);
      const yMin = Math.floor((lo - (hi - lo) * 0.08) / step) * step;
      const yMax = Math.ceil((hi + (hi - lo) * 0.08) / step) * step;

      const aMin = data.alphas[0], aMax = data.alphas[data.alphas.length - 1];
      const aSpan = aMax - aMin;
      const X = (a) => M.l + (aSpan ? (a - aMin) / aSpan : 0.5) * (W - M.l - M.r);
      const Y = (v) => M.t + (1 - (v - yMin) / (yMax - yMin)) * (H - M.t - M.b);

      /* Gitter + y-Achse */
      const gGrid = el('g', { class: 'ax-grid' }, svg);
      const gYT = el('g', { class: 'ax-ticks ax-ticks-y' }, svg);
      for (let v = yMin; v <= yMax + step / 1000; v += step) {
        el('line', { x1: M.l, y1: Y(v), x2: W - M.r, y2: Y(v) }, gGrid);
        const tx = el('text', { x: M.l - 8, y: Y(v) + 4, 'text-anchor': 'end' }, gYT);
        tx.textContent = fmtSigned(v, step < 1 ? Math.max(1, -Math.floor(Math.log10(step))) : 0);
      }
      /* Nulllinie = Zero-Shot */
      el('line', { class: 'ax-zero', x1: M.l, y1: Y(0), x2: W - M.r, y2: Y(0) }, svg);
      /* x-Achse */
      el('line', { class: 'ax-axis', x1: M.l, y1: H - M.b, x2: W - M.r, y2: H - M.b }, svg);
      const gXT = el('g', { class: 'ax-ticks ax-ticks-x' }, svg);
      const every = data.alphas.length > 12 ? Math.ceil(data.alphas.length / 10) : 1;
      data.alphas.forEach((a, i) => {
        if (i % every !== 0 && i !== data.alphas.length - 1) return;
        el('line', { class: 'ax-tick', x1: X(a), y1: H - M.b, x2: X(a), y2: H - M.b + 4 }, gXT);
        const tx = el('text', { x: X(a), y: H - M.b + 18, 'text-anchor': 'middle' }, gXT);
        tx.textContent = fmt(a, data.digits);
      });
      const ax = el('text', { class: 'ax-title', x: (M.l + W - M.r) / 2, y: H - 6, 'text-anchor': 'middle' }, svg);
      ax.textContent = 'α';
      const ay = el('text', { class: 'ax-title', x: M.l, y: 12, 'text-anchor': 'start' }, svg);
      ay.textContent = t.yTitle(METRIC_LABEL[state.metric]);

      /* Cursor */
      const cx = X(data.alphas[state.idx]);
      el('line', { class: 'ax-cursor', x1: cx, y1: M.t, x2: cx, y2: H - M.b }, svg);

      /* Kurven, Optima, aktuelle Punkte */
      SERIES.forEach((s) => {
        const pts = data.alphas.map((a, i) => {
          const v = delta(state.set, s.key, i, state.metric);
          return v === null ? null : { x: X(a), y: Y(v), i };
        });
        // Segmente (Lücken unterbrechen die Linie)
        let d = '', pen = false;
        pts.forEach((p) => {
          if (!p) { pen = false; return; }
          d += (pen ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
          pen = true;
        });
        el('path', { class: 'line line-' + s.cls, d }, svg);
        pts.forEach((p) => { if (p) el('circle', { class: 'pt pt-' + s.cls, cx: p.x, cy: p.y, r: 2.5 }, svg); });

        const oi = optimum(s.key);
        if (oi !== null && pts[oi]) {
          el('circle', { class: 'opt opt-' + s.cls, cx: pts[oi].x, cy: pts[oi].y, r: 8 }, svg);
        }
        const cur = pts[state.idx];
        if (cur) el('circle', { class: 'cur cur-' + s.cls, cx: cur.x, cy: cur.y, r: 5 }, svg);
      });

      svg._X = X; // für Pointer-Mapping
    }

    function drawReadout() {
      const t = T[getLang()];
      const alpha = data.alphas[state.idx];
      readout.textContent = '';

      const head = h('div', 'alpha-readout-head', readout);
      h('span', 'alpha-readout-alpha', head, 'α = ' + fmt(alpha, data.digits));
      h('span', 'alpha-readout-metric', head, METRIC_LABEL[state.metric]);

      SERIES.forEach((s) => {
        const row = h('div', 'alpha-readout-row alpha-readout-' + s.cls, readout);
        h('span', 'alpha-readout-name', row, t[s.cls]);
        const v = value(s.key, state.idx, state.metric);
        const oi = optimum(s.key);
        h('span', 'alpha-readout-val', row, v === null ? '—' : fmtPct(v));
        const note = h('span', 'alpha-readout-note', row);
        if (v === null) {
          note.textContent = t.noValue;
        } else if (oi === state.idx || (oi !== null && Math.abs(v - value(s.key, oi, state.metric)) < 1e-9)) {
          // auch bei Gleichstand mit dem Optimum
          note.textContent = t.atOptimum;
          row.classList.add('is-opt');
        } else if (oi !== null) {
          note.textContent = t.best(fmtPct(value(s.key, oi, state.metric)), fmt(data.alphas[oi], data.digits));
        }
      });
    }

    function drawTable() {
      if (!table) return;
      const t = T[getLang()];
      tableCaption.textContent = t.tableCaption(
        METRIC_LABEL[state.metric],
        data.sets.length > 1 ? loc(data.sets[state.set].label) : ''
      );
      tableHead.textContent = '';
      tableBody.textContent = '';
      const hr = h('tr', null, tableHead);
      const th0 = h('th', null, hr, 'α'); th0.scope = 'col';
      SERIES.forEach((s) => { const th = h('th', null, hr, t[s.cls]); th.scope = 'col'; });
      const opt = SERIES.map((s) => optimum(s.key));
      data.alphas.forEach((a, i) => {
        const tr = h('tr', i === state.idx ? 'is-current' : null, tableBody);
        const th = h('th', null, tr, fmt(a, data.digits)); th.scope = 'row';
        SERIES.forEach((s, si) => {
          const v = value(s.key, i, state.metric);
          const isOpt = v !== null && opt[si] !== null &&
            Math.abs(v - value(s.key, opt[si], state.metric)) < 1e-9; // Gleichstand zählt mit
          const td = h('td', isOpt ? 'is-opt' : null, tr, v === null ? '—' : fmtPct(v));
          if (i === state.idx) td.setAttribute('aria-current', 'true');
        });
      });
    }

    function applyLabels() {
      const t = T[getLang()];
      legendItems[0].textContent = t.id;
      legendItems[1].textContent = t.ood;
      sliderLabel.textContent = t.slider;
      metricLabel.textContent = t.metric;
      if (captionEl) {
        // Gibt es nur eine Variante, steht sie hier (sonst zeigt die Auswahl, welche aktiv ist).
        const only = data.sets.length === 1 ? loc(data.sets[0].label) : '';
        captionEl.textContent = loc(data.caption) + (only ? ' · ' + t.variant + ': ' + only : '');
      }
      if (setLabelEl) setLabelEl.textContent = t.variant;
      setBtns.forEach((b, i) => { b.textContent = loc(data.sets[i].label) || data.sets[i].id; });
    }

    function update() {
      const alpha = data.alphas[state.idx];
      slider.value = state.idx;
      slider.setAttribute('aria-valuetext', 'α = ' + fmt(alpha, data.digits));
      sliderValue.textContent = 'α = ' + fmt(alpha, data.digits);
      metricBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.metric === state.metric)));
      setBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === state.set)));
      applyLabels();
      drawChart();
      drawReadout();
      drawTable();
    }

    /* ── Events ── */
    slider.addEventListener('input', () => {
      state.idx = Number(slider.value);
      update();
    });

    // Klicken/Ziehen im Diagramm setzt α auf den nächsten Messpunkt.
    let dragging = false;
    function pick(e) {
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !svg._X) return;
      const x = ((e.clientX - rect.left) / rect.width) * W;
      let best = 0, bestD = Infinity;
      data.alphas.forEach((a, i) => {
        const d = Math.abs(svg._X(a) - x);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (best !== state.idx) { state.idx = best; update(); }
    }
    svg.addEventListener('pointerdown', (e) => {
      dragging = true;
      try { svg.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      pick(e);
    });
    svg.addEventListener('pointermove', (e) => { if (dragging) pick(e); });
    const stop = () => { dragging = false; };
    svg.addEventListener('pointerup', stop);
    svg.addEventListener('pointercancel', stop);

    // Sprachwechsel
    new MutationObserver(update).observe(document.documentElement, {
      attributes: true, attributeFilter: ['lang'],
    });

    update();
    live.hidden = false;
    if (empty) empty.hidden = true;
    root.dataset.state = 'ready';
  }

  /* ── Init ──────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    const roots = document.querySelectorAll('.alpha-explorer[data-src]');
    roots.forEach((root) => {
      loadData(root.dataset.src).then((data) => {
        if (!data) return; // "Daten folgen" bleibt stehen
        build(root, data);
        // Höhe hat sich geändert: ScrollTrigger-Positionen neu berechnen
        if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
          window.ScrollTrigger.refresh();
        }
      });
    });
  });
})();
