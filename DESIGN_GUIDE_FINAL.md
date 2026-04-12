# Design Guide — Ole Marwede Portfolio (Final)

> Finales Referenzdokument. Erarbeitet April 2026.
> Basis: Guide 1 (Struktur & Theme) + Guide 2 (Typografie, Cards, Animationen, Grün-Akzent)

---

## 1. Design DNA

**Aesthetic**: Dark terminal-editorial mit modernem Touch. Technisch und präzise, aber nicht kalt — der Terminal-Charakter bleibt, die Formen werden runder und hochwertiger.
**Stack**: Next.js, Tailwind CSS v4, Framer Motion
**Kernregel**: Hero ist clean ohne Hintergrundeffekte. Die Cards folgen dem Gradient-Border-Trick. Grün-500 ist der einzige Akzent — sparsam eingesetzt.

---

## 2. Farben

```css
:root {
  /* Backgrounds */
  --bg:            #0a0a0a;
  --bg-elevated:   #111111;
  --bg-card:       #111111;
  --bg-card-hover: #161616;

  /* Borders */
  --border:        #1e1e1e;
  --border-2:      #2d2d2d;

  /* Text */
  --text:          #edece6;   /* Primärtext — warmes Off-White */
  --text-dim:      #858585;
  --text-muted:    #3d3d3d;

  /* Green — UI Akzente */
  --green:         #22c55e;   /* green-500 — Eyebrows, Dots, CTAs, aktive States */
  --green-hover:   #4ade80;   /* green-400 — Hover-States */
  --green-glow:    rgba(34, 197, 94, 0.20);  /* Card-Border-Glow on hover */
  --green-dim:     rgba(34, 197, 94, 0.12);  /* Button-BG, subtle fills */

  /* Green — Terminal & Code ONLY */
  --green-term:    #52b788;   /* Terminal-Prompt, Code-Syntax, Cursor */
}
```

**Verwendungsregeln:**
- `--green` → Eyebrow-Labels, Availability-Dot, aktive Nav-Links, Button-Borders
- `--green-hover` → alle Hover-States (Links, Card-Titel, Arrows)
- `--green-term` → ausschließlich im Terminal-Fenster und Code-Snippets
- `--green-glow` → Card-Border-Glow beim Hover (via Gradient-Border-Trick)
- Kein `#000` oder `#fff` — immer die definierten Töne

---

## 3. Typografie

```ts
// Google Fonts laden
Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
})
```

```css
--font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', monospace;
```

| Element                  | Font              | Weight | Size                         | Besonderheit                         |
|--------------------------|-------------------|--------|------------------------------|--------------------------------------|
| Hero Name                | Plus Jakarta Sans | 800    | `clamp(3.8rem, 10vw, 8.5rem)`| `tracking: -0.03em`, `line-height: 0.92` |
| Section Headings         | Plus Jakarta Sans | 800    | `clamp(2rem, 4.5vw, 3.5rem)` | `tracking: -0.025em`                 |
| Footer CTA Heading       | Plus Jakarta Sans | 800    | `clamp(3rem, 8vw, 7rem)`     | `tracking: -0.03em`, `line-height: 0.92` |
| Card-Titel               | Plus Jakarta Sans | 600    | 16px                         | hover → `--green-hover`              |
| Body Text                | Plus Jakarta Sans | 400    | 14–15px                      | `line-height: 1.75`                  |
| Nav-Prompt               | JetBrains Mono    | 400    | 13px                         | `om ~/portfolio $`                   |
| Nav-Links                | JetBrains Mono    | 500    | 12px                         | `./linkname` Format                  |
| Terminal-Inhalt          | JetBrains Mono    | 400    | 13px                         | `line-height: 1.9`                   |
| Labels / Chips / Tags    | JetBrains Mono    | 700    | 10–11px                      | uppercase, `letter-spacing: 0.18em`  |
| Eyebrow / Kicker         | JetBrains Mono    | 700    | 11px                         | `// text · text` Style               |
| Skill-Pills              | Plus Jakarta Sans | 500    | 12px                         | —                                    |
| Meta / Timestamps        | JetBrains Mono    | 400    | 11px                         | `--text-muted`                       |

---

## 4. Navigation

**Style**: Terminal-Prompt links, alle Links + Sprach-Toggle rechtsbündig in einer Gruppe.

```
[om. ~/portfolio $]                [./projects]  [./skills]  [./experience]  [./contact]  [DE] [EN]
```

```css
nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 50px;
  background: rgba(10, 10, 10, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  padding: 0 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
}

/* Rechte Gruppe: Nav-Links + Sprach-Toggle zusammen */
.nav-right {
  display: flex;
  align-items: center;
  gap: 28px;
}

/* Sprach-Toggle als Buttons mit Hintergrund */
.lang-btn {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
  border: none;
}
.lang-btn.active {
  background: rgba(34, 197, 94, 0.15);
  color: var(--green);
  border: 1px solid rgba(34, 197, 94, 0.25);
}
```

| Element         | Style                                                                 |
|-----------------|-----------------------------------------------------------------------|
| Prompt `om.`    | JetBrains Mono 13px — `om` in `--green`, `.` in `--green`, `~/portfolio` in `--text-dim`, `$` in `--text-muted` |
| Nav-Links       | JetBrains Mono 12px, `--text-dim` → `--green-hover` on hover, rechtsbündig |
| Language Toggle | Zwei Buttons `DE` / `EN`, ganz rechts. Aktiver Button hat grünen Hintergrund |

---

## 5. Hero-Sektion

### Layout

```
┌─────────────────────────────────────────────────────┐
│  // developer · designer · student                  │
│                                                     │
│  Ole              ┌─────────────────────────────┐  │
│  Marwede.         │  $ cat about.md             │  │
│  (ghost + grüner .|                             │  │
│                   │  name:    Ole Marwede       │  │
│  [kurzer Tagline] │  gpa:     1.15              │  │
│                   │  school:  HTW Berlin        │  │
│  [$ ./work]       │  ...                        │  │
│  [./contact]      │  $ _█                       │  │
│                   └─────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

```css
.hero {
  display: grid;
  grid-template-columns: 58fr 42fr;
  align-items: center;
  min-height: 100dvh;
  padding-top: 50px; /* Nav-Höhe */
  position: relative;
  overflow: hidden;
}
```

**Kein Hintergrundbild, kein Glow, kein Parallax** — Hero ist clean.

### Hero-Name

```css
.hero-name-line-1 {
  font-family: var(--font-display);
  font-size: clamp(3.8rem, 10vw, 8.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 0.92;
  color: var(--text);           /* Solid */
}

.hero-name-line-2 {
  font-family: var(--font-display);
  font-size: clamp(3.8rem, 10vw, 8.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 0.92;
  color: rgba(237, 236, 230, 0.11);  /* Ghost-Effekt */
}

.name-dot { color: var(--green); } /* Der Punkt am Ende von "Marwede." */
```

### Eyebrow

```css
.hero-eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--green);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 20px;
}
/* Inhalt: // developer · designer · student */
```

### Tagline (unter dem Namen)

Kurzer Satz unter dem Namenszug — nicht zu lang, kein ganzer Absatz.

```css
.hero-tagline {
  font-size: 15px;
  color: var(--text-dim);
  line-height: 1.7;
  max-width: 380px;
  margin-bottom: 36px;
}
/* Beispiel: "Ich baue Dinge, die funktionieren — und gut aussehen." */
```

### Buttons

```css
/* Primary */
.btn-primary {
  font-family: var(--font-mono);
  font-size: 13px;
  padding: 11px 22px;
  background: var(--green-dim);
  border: 1px solid var(--green);
  color: var(--green-term);
  border-radius: 6px;
  transition: background 0.2s;
  active: scale(0.97);
}
.btn-primary:hover { background: var(--green); color: #000; }

/* Ghost */
.btn-ghost {
  font-family: var(--font-mono);
  font-size: 13px;
  padding: 11px 22px;
  background: transparent;
  border: 1px solid var(--border-2);
  color: var(--text-dim);
  border-radius: 6px;
  transition: border-color 0.2s, color 0.2s;
  active: scale(0.97);
}
.btn-ghost:hover { border-color: var(--green); color: var(--green-hover); }
```

---

## 6. Terminal-Fenster

```css
.terminal-window {
  background: var(--bg-elevated);
  border: 1px solid var(--border-2);
  border-radius: 8px;
  overflow: hidden;
  font-family: var(--font-mono);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.5);
}

.term-titlebar {
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 7px;
}

.term-dot { width: 11px; height: 11px; border-radius: 50%; }
.term-dot-1, .term-dot-2 { background: #2a2a2a; }
.term-dot-3 { background: rgba(34, 197, 94, 0.3); border: 1px solid var(--green); }
```

### Syntax-Klassen

```css
.t-cmd    { color: var(--green-term); }
.t-key    { color: var(--text); }
.t-val    { color: var(--green); }
.t-muted  { color: var(--text-muted); }
.t-line   { color: var(--text-dim); }

.t-cursor {
  display: inline-block;
  width: 8px; height: 15px;
  background: var(--green-term);
  vertical-align: text-bottom;
  animation: blink 1s step-end infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
```

### Terminal-Inhalt (Hero)

```
$ cat about.md

  name:     Ole Marwede
  degree:   B.Sc. Medieninformatik
  school:   HTW Berlin
  gpa:      1.15

  [kurze Bio — 2–3 Sätze]

  status:   available · Berlin
  github:   Elociraptor

$ _
```

Live-Typing-Effekt, 22ms pro Zeichen, 60ms Pause zwischen Zeilen.

---

## 7. Card-System (Guide 2 — Gradient-Border-Trick)

Gilt für alle Cards (Projects, Skills, Education):

```tsx
// Äußere Shell — liefert den Gradient-Border
<div className="p-[1px] rounded-2xl bg-white/[0.07] hover:bg-green-500/20
                transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
  <div className="h-full rounded-[calc(1rem-1px)] bg-[#111111] p-5 md:p-6">
    ...
  </div>
</div>
```

Hover: Shell wechselt von `white/[0.07]` zu `green-500/20` — subtiler grüner Glow-Border.

---

## 8. Sektionen & Trennlinien

```css
.section {
  padding: 96px 80px;
  border-top: 1px solid var(--border);
  max-width: 1200px;
  margin: 0 auto;
}

/* Section-Header */
.section-header {
  margin-bottom: 56px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding-bottom: 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.section-eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--green);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.section-title {
  font-family: var(--font-display);
  font-weight: 800;
  letter-spacing: -0.025em;
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  color: var(--text);
}
```

### Sektions-Reihenfolge

```
1. Hero                     — Name + Terminal
2. Projects                 — Bento Grid
3. Skills                   — Pills + Sprachbalken
4. Experience & Education   — Eine Timeline, zwei Labels
5. Contact/Footer
```

---

## 9. Projekt-Cards — Bento Grid

```tsx
<div className="grid grid-cols-12 gap-2.5">
  {/* dkwdp — Featured */}
  <div className="col-span-12 md:col-span-7"> ... </div>
  {/* ASML */}
  <div className="col-span-12 md:col-span-5"> ... </div>
  {/* kNearestNeighbor */}
  <div className="col-span-12 md:col-span-4"> ... </div>
  {/* Smart Garden */}
  <div className="col-span-12 md:col-span-4"> ... </div>
  {/* Bildverarbeitung */}
  <div className="col-span-12 md:col-span-4"> ... </div>
</div>
```

### Card-Anatomie

```
[Tag-Badge]                              [Live ↗] [GitHub]
[Titel]
[Role / Kategorie]
[Desc — max 3 Zeilen]
[● Tech  ● Tech  ● Tech]                 [mehr →]
```

| Element      | Style                                                                  |
|--------------|------------------------------------------------------------------------|
| Tag          | JetBrains Mono 10px bold uppercase, border `white/[0.08]`, rounded-full |
| Titel        | Plus Jakarta Sans 16px 600, hover → `--green-hover`                   |
| Desc         | 13px, `--text-dim`, `line-clamp-3`                                     |
| Tech-Dot     | `w-1.5 h-1.5 rounded-full`, jeweilige Tech-Farbe                       |
| Tech-Label   | 11px medium, `--text-muted`                                            |
| Icon-Buttons | `w-7 h-7 rounded-full border white/[0.08]`, hover `--green-hover`      |

### Projekte

| Projekt                               | Tag                  | Stack                   |
|---------------------------------------|----------------------|-------------------------|
| Der kleine Weg des Programmierens     | Semesterprojekt SS25 | SvelteKit, TS, p5.js    |
| ASML Framework                        | Internship Project   | MATLAB, MVC             |
| kNearestNeighbor                      | Machine Learning     | Python, NumPy           |
| dln-smartgarden                       | IoT · Hardware       | Python                  |
| Bildverarbeitung                      | Uni Projekt          | Python, OpenCV          |

---

## 10. Skills-Sektion

### Skill-Gruppen (3 Spalten, Card-System)

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-2.5">
```

```css
.skill-group-title {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 14px;
}

/* Skill-Pills */
.skill-pill {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 9999px;
  padding: 4px 10px;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  transition: all 0.2s;
}
.skill-pill:hover {
  color: var(--green-hover);
  border-color: rgba(34,197,94,0.3);
  background: rgba(34,197,94,0.05);
}
```

### Sprachbalken — Menschliche Sprachen (volle Breite darunter, Card-System)

Nicht Programmiersprachen — die stehen bereits in den Pills oben.

| Sprache       | Level          | Balken |
|---------------|----------------|--------|
| Deutsch       | Muttersprache  | 100%   |
| Englisch      | C1             | 85%    |
| Niederländisch| A2             | 30%    |

```css
.lang-bar-track {
  height: 2px;
  background: rgba(255,255,255,0.06);
  border-radius: 1px;
}
.lang-bar-fill {
  height: 100%;
  background: var(--green);
  border-radius: 1px;
  transform-origin: left;
  /* Framer Motion: scaleX: 0 → pct/100, duration: 0.9s */
}
```

Level-Label rechts neben dem Sprachnamen (z.B. "Muttersprache", "C1", "A2") statt Prozentzahl.

---

## 11. Experience & Education — Kombinierte Timeline

Eine Section, Header "Experience & Education". Innerhalb der Timeline zwei klar beschriftete Blöcke: **Work** und **Education** — getrennt durch ein Label, nicht durch eine Linie oder eine eigene Sektion.

```
// work ──────────────────────────────

  ●  ASML · Okt 2024 – Feb 2025
  │  // software engineering intern
  │  → Entwicklung MVC-Framework ...

// education ─────────────────────────

  ○  HTW Berlin · 2022 – heute
     // b.sc. medieninformatik
     [Schwerpunkt: Web, ML]  [GPA 1.15]
```

```css
/* Vertikale Linie Guide 1-Stil */
.tl-item {
  position: relative;
  padding: 0 0 36px 48px;
  border-left: 1px solid var(--border-2);
  margin-left: 8px;
}
.tl-item:last-child { border-left: 1px solid transparent; }

/* Dot */
.tl-item::before {
  content: '';
  position: absolute;
  left: -5px; top: 4px;
  width: 9px; height: 9px;
  border-radius: 50%;
  background: var(--text-muted);
  border: 1px solid var(--border-2);
  transition: background 0.2s;
}
.tl-item.featured::before {
  background: var(--green);
  border-color: var(--green);
  box-shadow: 0 0 8px rgba(34,197,94,0.4);
}
.tl-item:hover::before { background: var(--green); }
```

| Element    | Style                                                          |
|------------|----------------------------------------------------------------|
| Datum      | JetBrains Mono 11px, `--text-muted`                           |
| Company    | Plus Jakarta Sans 18px 700, hover → `--green-hover`           |
| Role       | JetBrains Mono 12px, `--green` (`// role-title` Format)       |
| Bullets    | `→` Prefix in `--green`, Text 13–14px `--text-dim`            |
| Block-Label| JetBrains Mono 10px uppercase `--text-muted`, kein Border     |

**Nav-Link**: bleibt `./experience` — im Nav wird nicht zwischen Work und Education unterschieden.

---

## 13. Contact / Footer

**Style**: CTA-Block oben, Footer-Bar unten. Keine separaten Link-Cards — Links gehören in den Footer.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  // get in touch                                     │
│  Lass uns reden.                                     │
│  Offen für Projekte, Werkstudentenstellen...         │
│  [$ ./contact.sh]                                    │
│                                                      │
├──────────────────────────────────────────────────────┤
│  om. ~/portfolio $ █      [linkedin] [github] [email]│
└──────────────────────────────────────────────────────┘
```

```css
footer {
  padding: 32px 80px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

**Contact-Heading**: `clamp(2.2rem, 5vw, 4rem)` — bewusst kleiner als Section-Headings, kein riesiges CTA.

- Keine separaten Link-Cards für GitHub/LinkedIn/Email
- Footer-Bar links: `om. ~/portfolio $` Prompt + blinkender Cursor in `--green-term`
- Footer-Bar rechts: LinkedIn, GitHub, Email — JetBrains Mono 12px, `--text-dim`, hover → `--green-hover`

---

## 14. Animationen

**Standard-Easing:** `cubic-bezier(0.32, 0.72, 0, 1)` für alle Framer Motion Bewegungen
**Viewport-Trigger:** `{ once: true, margin: '0px 0px 80px 0px' }`

### Hero — Staggered Fade-Up on Mount

| Element          | delay  | y    | duration |
|------------------|--------|------|----------|
| Availability     | 0.00s  | 12px | 0.5s     |
| Eyebrow          | 0.05s  | 12px | 0.5s     |
| Name             | 0.15s  | 28px | 0.8s     |
| Tagline          | 0.32s  | 12px | 0.5s     |
| Buttons          | 0.48s  | 12px | 0.5s     |
| Terminal-Fenster | 0.35s  | 20px | 0.7s     |

### Section-Elemente (whileInView)

- `y: 20→0, opacity: 0→1`, `duration: 0.6s`
- Cards gestaffelt: delay `index * 0.07s`
- Skill-Pills: `scale: 0.9→1`, delay `i*0.06 + j*0.03`
- Sprachbalken: `scaleX: 0→pct/100`, `duration: 0.9s`, delay `0.3 + i*0.1`

### Hover-Transitions (CSS)

- Farb-Wechsel: `200ms`
- Card-Border-Glow: `400–500ms`
- Button transforms: `200ms`
- Icon-Arrows: `300ms`, `translate-x-0.5 -translate-y-0.5`

### Regeln
- Nur `opacity` und `transform` animieren — nie `top`, `left`, `width`, `height`
- `active:scale-[0.97]` auf allen Buttons
- `viewport: { once: true }` — Animationen wiederholen sich nicht

---

## 15. Responsive

| Breakpoint  | Änderung                                                            |
|-------------|---------------------------------------------------------------------|
| `md: 768px` | Hero: single column; Nav: kompakt; Bento: col-spans aktiv; 3 Spalten Skills |
| `< md`      | Alles single-column; Section-Padding: `64px 24px`                  |

```css
@media (max-width: 768px) {
  .hero { grid-template-columns: 1fr; padding: 80px 24px 48px; }
  .section { padding: 64px 24px; }
  nav, footer { padding-left: 20px; padding-right: 20px; }
}
```

---

## 16. Dos & Don'ts

| DO                                               | DON'T                                         |
|--------------------------------------------------|-----------------------------------------------|
| `--green-term` nur in Terminal/Code              | `--green-term` für UI-Elemente                |
| `--green` (green-500) für alle UI-Akzente        | Gedämpfte Waldgrün-Töne aus Guide 1            |
| Plus Jakarta Sans für Headings & Body            | Inter, Roboto, Space Grotesk                  |
| JetBrains Mono für Nav, Labels, Terminal         | Plus Jakarta Sans im Terminal-Fenster          |
| Gradient-Border-Trick für alle Cards             | Harte Border-Farbe direkt auf Cards           |
| Ghost-Effekt für zweite Hero-Namenszeile         | Beide Zeilen gleichwertig solid               |
| Grüner Punkt am Ende von "Marwede."              | Punkt in `--text` oder `--text-dim`           |
| Kurzen Tagline-Text unter dem Namen              | Langen Beschreibungsabsatz im Hero            |
| `min-h-[100dvh]` für Hero                        | `h-screen`                                    |
| Hero clean ohne Hintergrundbild                  | Grid-Pattern, Glow oder Parallax im Hero      |
| `active:scale-[0.97]` auf Buttons               | Transform-Animationen auf Cards               |
| `viewport: { once: true }` für alle Animationen | Animationen die sich beim Scrollen wiederholen|
| Film Grain: **nicht verwenden**                  | Film Grain Overlay                            |
| ASML zuerst in der Work-Timeline                 | Chronologisch absteigend ohne Gewichtung      |
| Work + Education in einer Timeline-Section       | Education als eigene separate Sektion         |
| Sprachbalken = menschliche Sprachen              | Programmiersprachen in den Balken             |
| Keine Link-Cards im Contact-Bereich              | GitHub/LinkedIn/Email als separate Cards      |
| LinkedIn im Footer                               | dkwdp-Link im Footer                          |

---

*Finalisiert: April 2026*
