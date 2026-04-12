# Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Ole Marwede's personal developer portfolio — dark mode, GitHub-inspired, animated, fully bilingual (DE/EN), data-driven.

**Architecture:** Next.js 14 App Router with `[locale]` routing via next-intl. All content lives in `src/data/` (TypeScript) and `messages/` (JSON translations). Components are purely presentational — they receive props and render. Framer Motion handles all animations.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, next-intl, Vercel

---

## File Map

```
Portfolio/
├── messages/
│   ├── de.json                          # German strings (all user-visible text)
│   └── en.json                          # English strings
├── src/
│   ├── middleware.ts                    # next-intl locale detection + redirect
│   ├── i18n/
│   │   ├── routing.ts                   # defineRouting({ locales, defaultLocale })
│   │   └── request.ts                   # getRequestConfig (loads messages)
│   ├── types/
│   │   └── portfolio.ts                 # Project, ExperienceEntry, SkillGroup, Stat types
│   ├── data/
│   │   ├── projects.ts                  # Project[] — slug, icon, tags, urls, featured flag
│   │   ├── experience.ts                # ExperienceEntry[] — period, company, keys, color
│   │   ├── skills.ts                    # SkillGroup[] — group title key + badge labels
│   │   └── stats.ts                     # Stat[] — value + labelKey + optional color
│   ├── hooks/
│   │   └── useCountUp.ts               # Count-up animation hook
│   ├── components/
│   │   ├── AnimateInView.tsx            # Framer Motion fade-up viewport wrapper
│   │   ├── Nav.tsx                      # Sticky nav + glassmorphism + DE/EN toggle
│   │   ├── Hero.tsx                     # Name, role, tagline, CTA buttons
│   │   ├── StatsRow.tsx                 # Count-up stats bar
│   │   ├── ProjectCard.tsx              # Single project card (hover lift + gradient stripe)
│   │   ├── ProjectsSection.tsx          # Grid of ProjectCards
│   │   ├── Timeline.tsx                 # Experience timeline
│   │   ├── SkillsSection.tsx            # Skill group grid + staggered badges
│   │   └── Footer.tsx                   # Copyright + social links
│   └── app/
│       ├── globals.css                  # Tailwind base + CSS custom properties + @keyframes
│       └── [locale]/
│           ├── layout.tsx               # HTML shell + NextIntlClientProvider + Nav + Footer
│           ├── page.tsx                 # Main page — assembles all sections
│           └── projects/
│               └── [slug]/
│                   └── page.tsx         # Project detail page
├── next.config.ts                       # withNextIntl wrapper
├── tailwind.config.ts                   # Extend with custom keyframes
└── tsconfig.json                        # (generated, no custom changes needed)
```

---

## Task 1: Bootstrap Next.js Project

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json` (via create-next-app)

- [ ] **Step 1: Scaffold the project**

Run inside `/Users/eloschmelo/Code/Claude/Portfolio`:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --yes
```

Expected output ends with: `Success! Created portfolio`

- [ ] **Step 2: Install additional dependencies**

```bash
npm install framer-motion next-intl
```

Expected: `added X packages` — no errors.

- [ ] **Step 3: Remove create-next-app boilerplate**

Delete the default content files (keep the file structure):

```bash
rm src/app/page.tsx src/app/favicon.ico
rm -rf public/next.svg public/vercel.svg
```

- [ ] **Step 4: Create empty placeholder for page.tsx**

Create `src/app/page.tsx` with a redirect to default locale:

```typescript
// src/app/page.tsx
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/de')
}
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: `Ready on http://localhost:3000` — browser shows redirect to `/de` (404 is OK for now, server starts = success).

Stop the server with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: bootstrap Next.js project with next-intl and framer-motion"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/portfolio.ts`

- [ ] **Step 1: Create the types file**

```typescript
// src/types/portfolio.ts

export interface TechTag {
  label: string
  /** Hex color for the language dot, e.g. '#ff3e00' */
  color: string
}

export interface Project {
  slug: string
  icon: string
  /** Translation key path: projects.{slug}.name */
  nameKey: string
  /** Translation key path: projects.{slug}.desc */
  descKey: string
  featured: boolean
  techs: TechTag[]
  githubUrl?: string
  liveUrl?: string
}

export interface ExperienceEntry {
  id: string
  /** Display string, not translated — it's a proper noun or date range */
  period: string
  company: string
  location?: string
  /** Translation key path: experience.{id}.role */
  roleKey: string
  /** Translation key path: experience.{id}.desc */
  descKey: string
  /** Tailwind color class for the timeline dot, e.g. 'bg-[#58a6ff]' */
  accentColor: string
}

export interface SkillGroup {
  /** Translation key path: skills.{groupKey} */
  titleKey: string
  skills: string[]
}

export interface Stat {
  /** Numeric value (for count-up) or string (displayed as-is) */
  value: number | string
  /** Translation key path: stats.{index}.label */
  labelKey: string
  /** Optional Tailwind text color class, e.g. 'text-[#58a6ff]' */
  accentColor?: string
}
```

- [ ] **Step 2: Verify TypeScript accepts the file**

```bash
npx tsc --noEmit
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/types/portfolio.ts
git commit -m "feat: add portfolio TypeScript types"
```

---

## Task 3: Data Layer

**Files:**
- Create: `src/data/projects.ts`, `src/data/experience.ts`, `src/data/skills.ts`, `src/data/stats.ts`

- [ ] **Step 1: Create projects.ts**

```typescript
// src/data/projects.ts
import type { Project } from '@/types/portfolio'

export const projects: Project[] = [
  {
    slug: 'dkwdp',
    icon: '🚀',
    nameKey: 'projects.dkwdp.name',
    descKey: 'projects.dkwdp.desc',
    featured: true,
    techs: [
      { label: 'SvelteKit', color: '#ff3e00' },
      { label: 'TypeScript', color: '#3178c6' },
      { label: 'p5.js', color: '#ed8796' },
    ],
    githubUrl: 'https://github.com/dkwdp/Der-kleine-Weg-des-Programmierens',
    liveUrl: 'https://dkwdp.f4.htw-berlin.de/',
  },
  {
    slug: 'asml',
    icon: '⚙️',
    nameKey: 'projects.asml.name',
    descKey: 'projects.asml.desc',
    featured: true,
    techs: [
      { label: 'MATLAB', color: '#e16737' },
      { label: 'MVC', color: '#58a6ff' },
    ],
  },
  {
    slug: 'knn',
    icon: '🤖',
    nameKey: 'projects.knn.name',
    descKey: 'projects.knn.desc',
    featured: false,
    techs: [
      { label: 'Python', color: '#3572a5' },
    ],
    githubUrl: 'https://github.com/Elociraptor/kNearestNeighbor',
  },
  {
    slug: 'smartgarden',
    icon: '🌱',
    nameKey: 'projects.smartgarden.name',
    descKey: 'projects.smartgarden.desc',
    featured: false,
    techs: [
      { label: 'Python', color: '#3572a5' },
    ],
    githubUrl: 'https://github.com/Elociraptor/dln-smartgarden',
  },
  {
    slug: 'bildverarbeitung',
    icon: '👁️',
    nameKey: 'projects.bildverarbeitung.name',
    descKey: 'projects.bildverarbeitung.desc',
    featured: false,
    techs: [
      { label: 'Java', color: '#b07219' },
    ],
    githubUrl: 'https://github.com/Elociraptor/UebungenBildverarbeitung',
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
```

- [ ] **Step 2: Create experience.ts**

```typescript
// src/data/experience.ts
import type { ExperienceEntry } from '@/types/portfolio'

export const experience: ExperienceEntry[] = [
  {
    id: 'asml',
    period: 'Sep – Dez 2025',
    company: 'ASML',
    location: 'Eindhoven, Netherlands',
    roleKey: 'experience.asml.role',
    descKey: 'experience.asml.desc',
    accentColor: 'bg-[#58a6ff]',
  },
  {
    id: 'dsb',
    period: 'Nov 2024 – Sep 2025',
    company: 'dsb Deutsche Sanierungsberatung',
    roleKey: 'experience.dsb.role',
    descKey: 'experience.dsb.desc',
    accentColor: 'bg-[#3fb950]',
  },
  {
    id: 'htw',
    period: 'Seit Okt 2023',
    company: 'HTW Berlin',
    roleKey: 'experience.htw.role',
    descKey: 'experience.htw.desc',
    accentColor: 'bg-[#a371f7]',
  },
]
```

- [ ] **Step 3: Create skills.ts**

```typescript
// src/data/skills.ts
import type { SkillGroup } from '@/types/portfolio'

export const skillGroups: SkillGroup[] = [
  {
    titleKey: 'skills.languages',
    skills: ['Java', 'Python', 'TypeScript', 'JavaScript', 'MATLAB'],
  },
  {
    titleKey: 'skills.frameworks',
    skills: ['SvelteKit', 'Next.js', 'p5.js', 'Vite', 'Git', 'Node.js'],
  },
  {
    titleKey: 'skills.domains',
    skills: ['Machine Learning', 'Computer Vision', 'IoT', 'MVC Architecture'],
  },
]
```

- [ ] **Step 4: Create stats.ts**

```typescript
// src/data/stats.ts
import type { Stat } from '@/types/portfolio'

export const stats: Stat[] = [
  { value: '1,16', labelKey: 'stats.0.label', accentColor: 'text-[#58a6ff]' },
  { value: 4,      labelKey: 'stats.1.label' },
  { value: 5,      labelKey: 'stats.2.label', accentColor: 'text-[#3fb950]' },
  { value: 3,      labelKey: 'stats.3.label' },
]
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/data/ src/types/
git commit -m "feat: add data layer (projects, experience, skills, stats)"
```

---

## Task 4: Translation Files

**Files:**
- Create: `messages/de.json`, `messages/en.json`

- [ ] **Step 1: Create messages/de.json**

```json
{
  "nav": {
    "about": "Über mich",
    "projects": "Projekte",
    "experience": "Erfahrung",
    "contact": "Kontakt",
    "lang_toggle": "EN"
  },
  "hero": {
    "badge": "Offen für Chancen",
    "greeting": "Hi, ich bin",
    "role": "Medieninformatik Student @ HTW Berlin",
    "tagline": "Building things that matter — Web, ML, IoT",
    "cta_projects": "Projekte ansehen",
    "cta_github": "GitHub",
    "cta_linkedin": "LinkedIn"
  },
  "sections": {
    "featured_projects": "Featured Projects",
    "experience": "Experience",
    "skills": "Skills"
  },
  "projects": {
    "dkwdp": {
      "name": "Der kleine Weg des Programmierens",
      "desc": "Interaktive Lernplattform für Kinder — spielerisch JavaScript programmieren lernen. Levelbasiert, mit KI-Maskottchen und integriertem Code-Editor. Entwickelt für CoderDojo Schöneweide @ HTW Berlin."
    },
    "asml": {
      "name": "ASML Application Framework",
      "desc": "Entwicklung eines MATLAB MVC Frameworks bei ASML — dem weltgrößten Hersteller von Lithographiesystemen. Eigenständige Architektur, Datenverarbeitungs-Pipeline und Demo-Applikation."
    },
    "knn": {
      "name": "kNearestNeighbor",
      "desc": "K-NN Algorithmus von Grund auf implementiert mit dem CIFAR-10 Datensatz für Bildklassifikation."
    },
    "smartgarden": {
      "name": "dln-smartgarden",
      "desc": "Smart Garden System — IoT, Sensorik und Automatisierung mit Python."
    },
    "bildverarbeitung": {
      "name": "UebungenBildverarbeitung",
      "desc": "Bildverarbeitungs-Algorithmen und Computer Vision Übungen in Java."
    }
  },
  "experience": {
    "asml": {
      "role": "Software Development Intern",
      "desc": "Entwicklung eines MATLAB Application Frameworks (MVC). Eigenständige Architektur des Models, Datenverarbeitung und Demo-App."
    },
    "dsb": {
      "role": "Werkstudent — 3D Modeling & Energieberatung",
      "desc": "3D-Modellierung von Gebäuden, Erstellung von Sanierungsfahrplänen zur Energieberatung."
    },
    "htw": {
      "role": "B.Sc. Medieninformatik — Ø 1,16",
      "desc": "Fokus: Bildverarbeitung, Machine Learning, Web-Entwicklung. Voraussichtlicher Abschluss: September 2026."
    }
  },
  "skills": {
    "languages": "Languages",
    "frameworks": "Frameworks & Tools",
    "domains": "Domains"
  },
  "stats": {
    "0": { "label": "GPA" },
    "1": { "label": "Monate @ ASML" },
    "2": { "label": "Projekte" },
    "3": { "label": "Sprachen" }
  },
  "footer": {
    "copyright": "© 2025 Ole Marwede · Berlin",
    "github": "GitHub",
    "linkedin": "LinkedIn",
    "email": "E-Mail"
  },
  "project_detail": {
    "back": "← Zurück",
    "tech_stack": "Tech Stack",
    "links": "Links",
    "view_github": "GitHub ansehen",
    "view_live": "Live ansehen",
    "featured_badge": "Featured"
  }
}
```

- [ ] **Step 2: Create messages/en.json**

```json
{
  "nav": {
    "about": "About",
    "projects": "Projects",
    "experience": "Experience",
    "contact": "Contact",
    "lang_toggle": "DE"
  },
  "hero": {
    "badge": "Open for opportunities",
    "greeting": "Hi, I'm",
    "role": "Media Informatics Student @ HTW Berlin",
    "tagline": "Building things that matter — web, ML, IoT",
    "cta_projects": "View Projects",
    "cta_github": "GitHub",
    "cta_linkedin": "LinkedIn"
  },
  "sections": {
    "featured_projects": "Featured Projects",
    "experience": "Experience",
    "skills": "Skills"
  },
  "projects": {
    "dkwdp": {
      "name": "Der kleine Weg des Programmierens",
      "desc": "Interactive learning platform for kids — learn JavaScript through play. Level-based system with AI mascot and integrated code editor. Built for CoderDojo Schöneweide @ HTW Berlin."
    },
    "asml": {
      "name": "ASML Application Framework",
      "desc": "Built a MATLAB MVC framework at ASML — the world's largest manufacturer of lithography systems. Independent architecture design, data processing pipeline, and demo application."
    },
    "knn": {
      "name": "kNearestNeighbor",
      "desc": "K-NN algorithm implemented from scratch using the CIFAR-10 dataset for image classification."
    },
    "smartgarden": {
      "name": "dln-smartgarden",
      "desc": "Smart Garden system — IoT, sensors, and automation with Python."
    },
    "bildverarbeitung": {
      "name": "UebungenBildverarbeitung",
      "desc": "Image processing algorithms and computer vision exercises in Java."
    }
  },
  "experience": {
    "asml": {
      "role": "Software Development Intern",
      "desc": "Built a MATLAB Application Framework (MVC). Independent architecture of the model, data processing pipeline, and demo application."
    },
    "dsb": {
      "role": "Working Student — 3D Modeling & Energy Consulting",
      "desc": "3D modeling of buildings, creation of renovation roadmaps for energy consulting."
    },
    "htw": {
      "role": "B.Sc. Media Informatics — GPA 1.16",
      "desc": "Focus: image processing, machine learning, web development. Expected graduation: September 2026."
    }
  },
  "skills": {
    "languages": "Languages",
    "frameworks": "Frameworks & Tools",
    "domains": "Domains"
  },
  "stats": {
    "0": { "label": "GPA" },
    "1": { "label": "Months @ ASML" },
    "2": { "label": "Projects" },
    "3": { "label": "Languages" }
  },
  "footer": {
    "copyright": "© 2025 Ole Marwede · Berlin",
    "github": "GitHub",
    "linkedin": "LinkedIn",
    "email": "Email"
  },
  "project_detail": {
    "back": "← Back",
    "tech_stack": "Tech Stack",
    "links": "Links",
    "view_github": "View on GitHub",
    "view_live": "View Live",
    "featured_badge": "Featured"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add messages/
git commit -m "feat: add DE/EN translation files"
```

---

## Task 5: next-intl Configuration

**Files:**
- Create: `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/middleware.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Create routing.ts**

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',
})
```

- [ ] **Step 2: Create request.ts**

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as 'de' | 'en')) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

- [ ] **Step 3: Create middleware.ts**

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
```

- [ ] **Step 4: Update next.config.ts**

Replace the entire file:

```typescript
// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const config: NextConfig = {}

export default withNextIntl(config)
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/ src/middleware.ts next.config.ts
git commit -m "feat: configure next-intl for DE/EN routing"
```

---

## Task 6: Global Styles + Root Layout

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Replace globals.css**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0d1117;
  --surface: #161b22;
  --border: #30363d;
  --border-muted: #21262d;
  --text: #e6edf3;
  --text-muted: #8b949e;
  --accent-blue: #58a6ff;
  --accent-green: #3fb950;
  --accent-purple: #a371f7;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.4); }
}
```

- [ ] **Step 2: Update tailwind.config.ts to include the custom keyframes**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        blink: 'blink 1s step-end infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.4)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 3: Create [locale] directory and layout**

```bash
mkdir -p src/app/\[locale\]
```

```typescript
// src/app/[locale]/layout.tsx
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Ole Marwede — Portfolio',
  description: 'Medieninformatik Student @ HTW Berlin. Web, ML, IoT.',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'de' | 'en')) notFound()

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <Nav />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/\[locale\]/layout.tsx tailwind.config.ts
git commit -m "feat: add global styles and locale layout"
```

---

## Task 7: AnimateInView Wrapper + useCountUp Hook

**Files:**
- Create: `src/components/AnimateInView.tsx`, `src/hooks/useCountUp.ts`

- [ ] **Step 1: Create AnimateInView.tsx**

```typescript
// src/components/AnimateInView.tsx
'use client'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  delay?: number
  className?: string
}

export default function AnimateInView({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Create useCountUp.ts**

```typescript
// src/hooks/useCountUp.ts
'use client'
import { useEffect, useState } from 'react'

/**
 * Counts from 0 to `target` over `duration` ms using an ease-out cubic curve.
 * Only starts when `shouldStart` becomes true.
 */
export function useCountUp(
  target: number,
  duration = 1200,
  shouldStart = false
): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!shouldStart) return
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [target, duration, shouldStart])

  return count
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AnimateInView.tsx src/hooks/useCountUp.ts
git commit -m "feat: add AnimateInView wrapper and useCountUp hook"
```

---

## Task 8: Nav Component

**Files:**
- Create: `src/components/Nav.tsx`

- [ ] **Step 1: Create Nav.tsx**

```typescript
// src/components/Nav.tsx
'use client'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const NAV_KEYS = ['about', 'projects', 'experience', 'contact'] as const

export default function Nav() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function toggleLocale() {
    const newLocale = locale === 'de' ? 'en' : 'de'
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0d1117]/85 backdrop-blur-md border-b border-[#21262d]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-4xl mx-auto px-8 py-3.5 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          <span className="text-[#58a6ff]">ole</span>.dev
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6">
            {NAV_KEYS.map((key) => (
              <a
                key={key}
                href={`#${key}`}
                className="text-[13px] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                {t(key)}
              </a>
            ))}
          </div>

          <button
            onClick={toggleLocale}
            className="text-[12px] font-medium text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] rounded px-2.5 py-1 hover:border-[#58a6ff] transition-all"
            aria-label="Toggle language"
          >
            {t('lang_toggle')}
          </button>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "feat: add Nav component with DE/EN toggle and scroll blur"
```

---

## Task 9: Footer Component

**Files:**
- Create: `src/components/Footer.tsx`

- [ ] **Step 1: Create Footer.tsx**

```typescript
// src/components/Footer.tsx
import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('footer')

  return (
    <footer
      id="contact"
      className="border-t border-[#21262d] mt-20"
    >
      <div className="max-w-4xl mx-auto px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-[12px] text-[#8b949e]">{t('copyright')}</span>
        <div className="flex gap-5">
          <a
            href="https://github.com/Elociraptor"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            {t('github')}
          </a>
          <a
            href="https://www.linkedin.com/in/ole-marwede/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            {t('linkedin')}
          </a>
          <a
            href="mailto:ole.marwede@gmail.com"
            className="text-[12px] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            {t('email')}
          </a>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: add Footer component"
```

---

## Task 10: Hero Component

**Files:**
- Create: `src/components/Hero.tsx`

- [ ] **Step 1: Create Hero.tsx**

```typescript
// src/components/Hero.tsx
'use client'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default function Hero() {
  const t = useTranslations('hero')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Tiny delay so CSS transitions fire on first paint
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const base = 'transition-all duration-500'
  const show = 'opacity-100 translate-y-0'
  const hide = 'opacity-0 translate-y-5'

  return (
    <section id="about" className="max-w-4xl mx-auto px-8 pt-20 pb-16">
      {/* Badge */}
      <div
        className={`inline-flex items-center gap-2 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-full px-3 py-1 text-[11px] text-[#58a6ff] mb-6 ${base} ${mounted ? show : hide}`}
        style={{ transitionDelay: '0ms' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse-dot" />
        {t('badge')}
      </div>

      {/* Name */}
      <h1
        className={`text-5xl font-bold tracking-tight leading-tight mb-4 ${base} ${mounted ? show : hide}`}
        style={{ transitionDelay: '80ms' }}
      >
        {t('greeting')}
        <br />
        <span className="bg-gradient-to-r from-[#58a6ff] to-[#a371f7] bg-clip-text text-transparent">
          Ole Marwede
        </span>
      </h1>

      {/* Role */}
      <p
        className={`text-lg text-[#8b949e] mb-2 ${base} ${mounted ? show : hide}`}
        style={{ transitionDelay: '160ms' }}
      >
        {t('role')}
      </p>

      {/* Tagline with cursor */}
      <p
        className={`text-[15px] text-[#58a6ff] font-mono mb-8 ${base} ${mounted ? show : hide}`}
        style={{ transitionDelay: '240ms' }}
      >
        {t('tagline')}
        <span className="inline-block w-0.5 h-[1em] bg-[#58a6ff] ml-0.5 animate-blink align-text-bottom" />
      </p>

      {/* CTAs */}
      <div
        className={`flex flex-wrap gap-3 ${base} ${mounted ? show : hide}`}
        style={{ transitionDelay: '320ms' }}
      >
        <a
          href="#projects"
          className="bg-[#238636] border border-[#2ea043] text-white px-5 py-2 rounded-md text-[13px] font-medium hover:bg-[#2ea043] hover:-translate-y-px transition-all"
        >
          📁 {t('cta_projects')}
        </a>
        <a
          href="https://github.com/Elociraptor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#21262d] border border-[#30363d] text-[#e6edf3] px-5 py-2 rounded-md text-[13px] hover:bg-[#30363d] hover:-translate-y-px transition-all"
        >
          <GitHubIcon />
          {t('cta_github')}
        </a>
        <a
          href="https://www.linkedin.com/in/ole-marwede/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#21262d] border border-[#30363d] text-[#e6edf3] px-5 py-2 rounded-md text-[13px] hover:bg-[#30363d] hover:-translate-y-px transition-all"
        >
          <LinkedInIcon />
          {t('cta_linkedin')}
        </a>
      </div>
    </section>
  )
}

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "feat: add Hero component with entrance animations"
```

---

## Task 11: Stats Row Component

**Files:**
- Create: `src/components/StatsRow.tsx`

- [ ] **Step 1: Create StatsRow.tsx**

```typescript
// src/components/StatsRow.tsx
'use client'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, useInView } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'
import { stats } from '@/data/stats'
import type { Stat } from '@/types/portfolio'

export default function StatsRow() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="max-w-4xl mx-auto px-8 mb-16"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#21262d] rounded-xl overflow-hidden">
        {stats.map((stat, i) => (
          <StatCell key={i} stat={stat} index={i} shouldCount={inView} />
        ))}
      </div>
    </motion.div>
  )
}

function StatCell({
  stat,
  index,
  shouldCount,
}: {
  stat: Stat
  index: number
  shouldCount: boolean
}) {
  const t = useTranslations()
  const numericValue = typeof stat.value === 'number' ? stat.value : null
  const count = useCountUp(numericValue ?? 0, 1200, shouldCount && numericValue !== null)

  const displayValue =
    numericValue !== null
      ? count.toString()
      : stat.value.toString()

  return (
    <div
      className={`px-6 py-5 text-center ${
        index < stats.length - 1 ? 'border-r border-[#21262d]' : ''
      }`}
    >
      <span className={`block text-3xl font-bold tracking-tight ${stat.accentColor ?? 'text-[#e6edf3]'}`}>
        {displayValue}
      </span>
      <span className="block text-[11px] text-[#8b949e] uppercase tracking-wide mt-1">
        {t(stat.labelKey)}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StatsRow.tsx
git commit -m "feat: add StatsRow with count-up animation"
```

---

## Task 12: Project Card + Projects Section

**Files:**
- Create: `src/components/ProjectCard.tsx`, `src/components/ProjectsSection.tsx`

- [ ] **Step 1: Create ProjectCard.tsx**

```typescript
// src/components/ProjectCard.tsx
'use client'
import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Project } from '@/types/portfolio'

interface Props {
  project: Project
  featured?: boolean
}

export default function ProjectCard({ project, featured = false }: Props) {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`relative group bg-[#161b22] border border-[#30363d] rounded-xl p-5 cursor-pointer overflow-hidden hover:border-[#58a6ff] hover:shadow-[0_8px_24px_rgba(88,166,255,0.1)] transition-colors ${
        featured ? 'col-span-2' : ''
      }`}
    >
      {/* Gradient top stripe — reveals on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#58a6ff] to-[#a371f7] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between mb-3">
        <span className="text-xl" role="img" aria-label={project.slug}>
          {project.icon}
        </span>
        {featured && (
          <span className="text-[10px] text-[#58a6ff] bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-full px-2 py-0.5">
            {t('project_detail.featured_badge')}
          </span>
        )}
      </div>

      <Link
        href={`/${locale}/projects/${project.slug}`}
        className="block group-hover:text-[#58a6ff] transition-colors"
      >
        <h3 className="text-[14px] font-semibold text-[#58a6ff] mb-2">
          {t(project.nameKey)}
        </h3>
      </Link>

      <p className="text-[12px] text-[#8b949e] leading-relaxed mb-4 line-clamp-3">
        {t(project.descKey)}
      </p>

      <div className="flex flex-wrap gap-3">
        {project.techs.map((tech) => (
          <span key={tech.label} className="flex items-center gap-1.5 text-[11px] text-[#8b949e]">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: tech.color }}
            />
            {tech.label}
          </span>
        ))}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[11px] text-[#3fb950] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            ↗ Live
          </a>
        )}
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Create ProjectsSection.tsx**

```typescript
// src/components/ProjectsSection.tsx
import { useTranslations } from 'next-intl'
import { projects } from '@/data/projects'
import ProjectCard from './ProjectCard'
import AnimateInView from './AnimateInView'

export default function ProjectsSection() {
  const t = useTranslations('sections')
  const featured = projects.filter((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)

  return (
    <section id="projects" className="max-w-4xl mx-auto px-8 mb-16">
      <AnimateInView>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-base font-semibold text-[#e6edf3]">
            {t('featured_projects')}
          </h2>
          <div className="flex-1 h-px bg-[#21262d]" />
          <span className="text-[11px] text-[#8b949e] bg-[#21262d] px-2.5 py-0.5 rounded-full">
            {projects.length} repositories
          </span>
        </div>
      </AnimateInView>

      <div className="grid grid-cols-2 gap-3">
        {featured.map((project, i) => (
          <AnimateInView key={project.slug} delay={i * 0.1}>
            <ProjectCard project={project} featured />
          </AnimateInView>
        ))}
        {rest.map((project, i) => (
          <AnimateInView key={project.slug} delay={(featured.length + i) * 0.08}>
            <ProjectCard project={project} />
          </AnimateInView>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectCard.tsx src/components/ProjectsSection.tsx
git commit -m "feat: add ProjectCard and ProjectsSection with hover animations"
```

---

## Task 13: Timeline Component

**Files:**
- Create: `src/components/Timeline.tsx`

- [ ] **Step 1: Create Timeline.tsx**

```typescript
// src/components/Timeline.tsx
import { useTranslations } from 'next-intl'
import { experience } from '@/data/experience'
import AnimateInView from './AnimateInView'

export default function Timeline() {
  const t = useTranslations()

  return (
    <section id="experience" className="max-w-4xl mx-auto px-8 mb-16">
      <AnimateInView>
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-base font-semibold text-[#e6edf3]">
            {t('sections.experience')}
          </h2>
          <div className="flex-1 h-px bg-[#21262d]" />
        </div>
      </AnimateInView>

      <div className="flex flex-col">
        {experience.map((entry, i) => (
          <AnimateInView key={entry.id} delay={i * 0.1}>
            <div className="flex gap-0">
              {/* Date column */}
              <div className="w-36 flex-shrink-0 pt-4 pr-4 text-right">
                <span className="text-[11px] text-[#8b949e] leading-tight">
                  {entry.period}
                </span>
              </div>

              {/* Spine */}
              <div className="flex flex-col items-center mx-4">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-4 flex-shrink-0 ring-2 ring-[#0d1117] ring-offset-1 ring-offset-[#0d1117] transition-all duration-300 hover:ring-4 ${entry.accentColor}`}
                />
                {i < experience.length - 1 && (
                  <div className="w-px flex-1 bg-[#21262d] mt-1" />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 pt-3 ${i < experience.length - 1 ? 'pb-8 border-b border-[#21262d]' : 'pb-0'}`}>
                <div className="text-[13px] font-semibold text-[#e6edf3] mb-0.5">
                  {entry.company}
                  {entry.location && (
                    <span className="text-[#8b949e] font-normal"> · {entry.location}</span>
                  )}
                </div>
                <div className="text-[12px] text-[#58a6ff] mb-2">
                  {t(entry.roleKey)}
                </div>
                <div className="text-[12px] text-[#8b949e] leading-relaxed">
                  {t(entry.descKey)}
                </div>
              </div>
            </div>
          </AnimateInView>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Timeline.tsx
git commit -m "feat: add Timeline component for experience section"
```

---

## Task 14: Skills Section

**Files:**
- Create: `src/components/SkillsSection.tsx`

- [ ] **Step 1: Create SkillsSection.tsx**

```typescript
// src/components/SkillsSection.tsx
'use client'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { skillGroups } from '@/data/skills'
import AnimateInView from './AnimateInView'

export default function SkillsSection() {
  const t = useTranslations()

  return (
    <section id="skills" className="max-w-4xl mx-auto px-8 mb-16">
      <AnimateInView>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-base font-semibold text-[#e6edf3]">
            {t('sections.skills')}
          </h2>
          <div className="flex-1 h-px bg-[#21262d]" />
        </div>
      </AnimateInView>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {skillGroups.map((group, groupIndex) => (
          <AnimateInView key={group.titleKey} delay={groupIndex * 0.1}>
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
              <p className="text-[11px] text-[#8b949e] uppercase tracking-wide mb-3">
                {t(group.titleKey)}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill, skillIndex) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: groupIndex * 0.1 + skillIndex * 0.04 }}
                    whileHover={{ y: -2, borderColor: '#58a6ff' }}
                    className="bg-[#21262d] border border-[#30363d] rounded px-2.5 py-1 text-[11px] text-[#e6edf3] cursor-default"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          </AnimateInView>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SkillsSection.tsx
git commit -m "feat: add SkillsSection with staggered badge animations"
```

---

## Task 15: Main Page Assembly

**Files:**
- Create: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Create page.tsx**

```typescript
// src/app/[locale]/page.tsx
import Hero from '@/components/Hero'
import StatsRow from '@/components/StatsRow'
import ProjectsSection from '@/components/ProjectsSection'
import Timeline from '@/components/Timeline'
import SkillsSection from '@/components/SkillsSection'

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsRow />
      <ProjectsSection />
      <Timeline />
      <SkillsSection />
    </>
  )
}
```

- [ ] **Step 2: Run the dev server and verify the page renders**

```bash
npm run dev
```

Open `http://localhost:3000/de` — you should see the full page: Hero → Stats → Projects → Timeline → Skills → Footer.

Open `http://localhost:3000/en` — verify the English version renders correctly.

Click the language toggle in the Nav — verify it switches between `/de` and `/en`.

Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add src/app/\[locale\]/page.tsx
git commit -m "feat: assemble main page from all section components"
```

---

## Task 16: Project Detail Page

**Files:**
- Create: `src/app/[locale]/projects/[slug]/page.tsx`

- [ ] **Step 1: Create the project detail page**

```bash
mkdir -p "src/app/[locale]/projects/[slug]"
```

```typescript
// src/app/[locale]/projects/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { getProjectBySlug, projects } from '@/data/projects'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const t = await getTranslations({ locale })

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      {/* Back */}
      <Link
        href={`/${locale}`}
        className="inline-flex items-center text-[13px] text-[#8b949e] hover:text-[#e6edf3] transition-colors mb-8"
      >
        {t('project_detail.back')}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-3xl">{project.icon}</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t(project.nameKey)}
          </h1>
          {project.featured && (
            <span className="text-[11px] text-[#58a6ff]">
              {t('project_detail.featured_badge')}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-[15px] text-[#8b949e] leading-relaxed mb-8 max-w-2xl">
        {t(project.descKey)}
      </p>

      {/* Tech Stack */}
      <div className="mb-8">
        <h2 className="text-[12px] text-[#8b949e] uppercase tracking-wide mb-3">
          {t('project_detail.tech_stack')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {project.techs.map((tech) => (
            <span
              key={tech.label}
              className="flex items-center gap-1.5 bg-[#21262d] border border-[#30363d] rounded px-3 py-1.5 text-[12px] text-[#e6edf3]"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: tech.color }}
              />
              {tech.label}
            </span>
          ))}
        </div>
      </div>

      {/* Links */}
      {(project.githubUrl || project.liveUrl) && (
        <div>
          <h2 className="text-[12px] text-[#8b949e] uppercase tracking-wide mb-3">
            {t('project_detail.links')}
          </h2>
          <div className="flex gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#21262d] border border-[#30363d] text-[#e6edf3] px-4 py-2 rounded-md text-[13px] hover:border-[#58a6ff] hover:-translate-y-px transition-all"
              >
                {t('project_detail.view_github')}
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#238636] border border-[#2ea043] text-white px-4 py-2 rounded-md text-[13px] hover:bg-[#2ea043] hover:-translate-y-px transition-all"
              >
                {t('project_detail.view_live')}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify project pages render**

```bash
npm run dev
```

Open `http://localhost:3000/de/projects/dkwdp` — verify project detail renders with back link, description, tech stack, and GitHub link.

Open `http://localhost:3000/en/projects/asml` — verify English version renders correctly.

Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/projects/"
git commit -m "feat: add project detail page with static params"
```

---

## Task 17: Build Verification + Vercel Deployment

**Files:**
- Create: `.gitignore` update (add `.vercel`)

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no errors. You should see routes listed for `/de`, `/en`, `/de/projects/[slug]`, etc.

If there are type errors, fix them before proceeding.

- [ ] **Step 2: Add .vercel to .gitignore**

Open `.gitignore` and add at the bottom:

```
.vercel
```

- [ ] **Step 3: Push to GitHub**

```bash
git add .gitignore
git commit -m "chore: add .vercel to gitignore"
git push origin main
```

- [ ] **Step 4: Deploy to Vercel**

Go to [vercel.com](https://vercel.com), click **Add New Project**, import the GitHub repo. Vercel auto-detects Next.js — no configuration needed. Click **Deploy**.

Expected: build succeeds, live URL is provided (e.g., `ole-portfolio.vercel.app`).

---

## Self-Review

**Spec coverage:**

| Spec requirement | Covered by |
|---|---|
| Dark mode GitHub-inspired design | Tasks 6, 8–14 (colors, CSS vars) |
| Playful animations (Framer Motion) | Tasks 7, 11–14 |
| Next.js + TypeScript + Tailwind | Task 1 |
| next-intl DE/EN toggle | Tasks 4, 5, 8 (Nav) |
| Data-driven (all content in src/data/) | Tasks 2–3 |
| Nav with glassmorphism scroll | Task 8 |
| Hero: gradient, badge, typing cursor, CTAs | Task 10 |
| Stats row with count-up | Task 11 |
| Project cards: hover lift + gradient stripe | Task 12 |
| ASML in both projects + experience | Tasks 3 (data), 12, 13 |
| Timeline with colored dots | Task 13 |
| Skills: staggered badges | Task 14 |
| Footer with GitHub + LinkedIn + email | Task 9 |
| Project detail pages `/projects/[slug]` | Task 16 |
| Vercel deployment | Task 17 |

**Placeholder scan:** None found — all steps contain full code.

**Type consistency:**
- `Project.nameKey` / `Project.descKey` used consistently in `ProjectCard`, `ProjectsSection`, and `ProjectDetail`
- `ExperienceEntry.accentColor` is a Tailwind class string (`bg-[#...]`) — used directly in `Timeline`
- `Stat.labelKey` uses `t(stat.labelKey)` — translation path format matches `messages/de.json` key structure
- `useCountUp` signature: `(target: number, duration: number, shouldStart: boolean) => number` — matches all call sites
- `getProjectBySlug` defined in `projects.ts` and imported in `project detail page`
