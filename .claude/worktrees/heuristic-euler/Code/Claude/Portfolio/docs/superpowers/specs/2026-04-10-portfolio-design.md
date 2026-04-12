# Portfolio Design Spec — Ole Marwede

**Date:** 2026-04-10  
**Status:** Approved

---

## Overview

A personal developer portfolio for Ole Marwede (B.Sc. Medieninformatik, HTW Berlin). The portfolio showcases professional experience, projects, and technical skills to potential employers and collaborators.

---

## Design Direction

- **Style:** Developer Dark Mode — GitHub-inspired aesthetic, clean and professional
- **Personality:** Playful animations layered on top of a serious layout — not gimmicky, but alive
- **Color palette:**
  - Background: `#0d1117`
  - Surface: `#161b22`
  - Border: `#30363d` / `#21262d`
  - Text primary: `#e6edf3`
  - Text muted: `#8b949e`
  - Accent blue: `#58a6ff`
  - Accent green: `#3fb950`
  - Accent purple: `#a371f7`
- **Typography:** Inter (system fallback), monospace for code snippets
- **Animation library:** Framer Motion
  - Sections fade-up on scroll (viewport intersection)
  - Staggered appearance for badges and list items
  - Project cards: 3D tilt on hover
  - Stats: count-up on first scroll into view
  - Hero badge: pulse animation on green dot
  - Nav: blur/glassmorphism appears on scroll

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Industry standard, Vercel-native, React ecosystem |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS | Rapid development, consistent utility classes |
| Animations | Framer Motion | Declarative, performant React animations |
| i18n | next-intl | Lightweight, App Router compatible, JSON-based translations |
| Hosting | Vercel | Zero-config Next.js deployment |
| Package manager | npm | Standard |

---

## Page Structure (Hybrid)

### Main Page `/`

Single-page scroll with these sections in order:

1. **Nav** — Sticky, blur backdrop on scroll. Links: About, Projects, Experience, Contact. Logo: `ole.dev`. Language toggle (DE/EN) in the top-right corner.
2. **Hero** — Name with gradient, role, typing-cursor tagline, CTA buttons (View Projects, GitHub, LinkedIn)
3. **Stats row** — Count-up animation on scroll. Content TBD (see Content TODOs). Stats are defined in `data/stats.ts` so they can be changed without touching component code.
4. **Featured Projects** — 2-column grid. Featured project spans full width. Hover: lift + blue gradient top-border reveal.
5. **Experience** — Vertical timeline. Each entry has a colored dot with glow-pulse on hover.
6. **Skills** — 3-column grid of skill groups (Languages, Frameworks & Tools, Domains). Badges stagger in on scroll.
7. **Footer** — Copyright, GitHub, LinkedIn, email links.

### Project Detail Pages `/projects/[slug]`

Each project gets its own page with:
- Back navigation
- Project title, description, tech stack badges
- Bullet list of features / what was built
- Links: GitHub repo, live demo (where available)
- (Optional later: screenshots or video)

---

## Content

### Projects (initial)

| Slug | Name | Highlight |
|---|---|---|
| `dkwdp` | Der kleine Weg des Programmierens | Featured — SvelteKit, p5.js, KI-Maskottchen |
| `asml` | ASML Internship | Featured — MATLAB, MVC Framework, internationales Unternehmen |
| `knn` | kNearestNeighbor | Python, ML, CIFAR-10 |
| `smartgarden` | dln-smartgarden | Python, IoT |
| `bildverarbeitung` | UebungenBildverarbeitung | Java, Computer Vision |

The ASML internship appears in **both** the Projects section (as a project card) and the Experience timeline — two different angles: what was built vs. where it was done. The project card focuses on the framework and architecture work; the timeline entry focuses on the role and company context.

### Experience (initial)

1. ASML — Software Development Intern (Sep–Dez 2025)
2. dsb Deutsche Sanierungsberatung — Werkstudent (Nov 2024–Sep 2025)
3. HTW Berlin — B.Sc. Medieninformatik (seit Okt 2023, Ø 1,16)

### Social Links

- GitHub: https://github.com/Elociraptor
- LinkedIn: https://www.linkedin.com/in/ole-marwede/
- Email: ole.marwede@gmail.com

---

## Content TODOs (to fill in later)

These are known gaps — placeholders will be used during build:

- [ ] Short bio / About Me text (2–3 sentences)
- [ ] Profile photo / headshot
- [ ] Own specific contributions to the DKWDP semester project
- [ ] ASML project card text — what was built, what the framework does, key decisions
- [ ] Stats row content — which 4 numbers to highlight
- [ ] Details on dln-smartgarden (hardware used, scope)
- [ ] Details on UebungenBildverarbeitung (algorithms covered)
- [ ] Additional social links if desired

---

## Out of Scope (for now)

- Blog / writing section
- Dark/light mode toggle
- Contact form (email link is sufficient)
- CMS integration

---

## File Structure (planned)

```
Portfolio/
├── messages/
│   ├── de.json                 # German translations
│   └── en.json                 # English translations
├── src/
│   ├── app/
│   │   ├── [locale]/           # next-intl locale wrapper
│   │   │   ├── layout.tsx      # Root layout, nav, footer
│   │   │   ├── page.tsx        # Main single-page
│   │   │   └── projects/
│   │   │       └── [slug]/
│   │   │           └── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Nav.tsx             # includes DE/EN toggle
│   │   ├── Hero.tsx
│   │   ├── StatsRow.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── Timeline.tsx
│   │   ├── SkillBadge.tsx
│   │   └── Footer.tsx
│   └── data/
│       ├── projects.ts         # Project definitions (slug, tags, links, featured flag)
│       ├── experience.ts       # Experience + education entries
│       ├── skills.ts           # Skill groups and badges
│       └── stats.ts            # Stats row values and labels
├── public/
├── PORTFOLIO_INFO.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Data-Driven Architecture

All content lives in `src/data/`. No content is hardcoded in components. To add a project, edit `projects.ts`. To change a stat, edit `stats.ts`. Components are pure presentational — they receive props, render, nothing else. Translations in `messages/de.json` and `messages/en.json` cover all user-visible strings.
