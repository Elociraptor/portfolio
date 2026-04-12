
# Portfolio Information – Ole Marwede

> Diese Datei enthält alle gesammelten Informationen für die Erstellung eines persönlichen Developer-Portfolios.
> Gedacht zur Integration in Claude Code als Kontext-Datei.

---

## 1. Persönliche Daten

- **Name:** Ole Marwede
- **Rolle:** Bachelor Student Informatik (Medieninformatik)
- **Standort:** Berlin (Grünberger Straße 55, 10245 Berlin)
- **E-Mail:** ole.marwede@gmail.com
- **Telefon:** +49-15229702822
- **GitHub (Persönlich):** https://github.com/Elociraptor
- **GitHub (Projekt-Organisation):** https://github.com/dkwdp

---

## 2. Bildung

### HTW Berlin – Hochschule für Technik und Wirtschaft Berlin
- **Studiengang:** Bachelor of Science in Medieninformatik
- **Zeitraum:** ab Oktober 2023
- **Notendurchschnitt:** 1,15
- **Voraussichtlicher Abschluss:** September 2026

### Gymnasium Cäcilienschule Oldenburg
- **Abschluss:** Abitur (2013–2022)
- **Note:** 1,8

---

## 3. Berufserfahrung

### Praktikum Software-Entwicklung – ASML (Niederlande)
- **Zeitraum:** September – Dezember 2025
- **Beschreibung:**
  - Einarbeitung in MATLAB und eigenständige Entwicklung eines Application Frameworks
  - Schwerpunkt: Design des Models der MVC-Architektur und Datenverarbeitungsprozesse
  - Entwicklung zentraler Funktionen für Datenhandling und Workflow-Steuerung
  - Erstellung einer Demo-Applikation zur Validierung des Framework-Designs
- **Technologien:** MATLAB, MVC-Architektur
- **Highlights für Portfolio:**
  - Internationales Unternehmen (ASML – weltgrößter Hersteller von Lithographiesystemen für die Halbleiterindustrie)
  - Eigenständige Framework-Entwicklung
  - Software-Architektur (MVC Pattern)

### Werkstudent Energieberatung – dsb Deutsche Sanierungsberatung
- **Zeitraum:** November 2024 – September 2025
- **Beschreibung:**
  - Erstellen von 3D-Modellen von Kundenhäusern
  - Erstellung von Sanierungsfahrplänen zur Energieberatung
- **Highlights für Portfolio:**
  - 3D-Modellierung
  - Praktische Anwendung technischer Skills außerhalb der reinen Softwareentwicklung

### Minijobs in der Gastronomie
- **Zeitraum:** 2020–2025
- **Beschreibung:** Einarbeitung neuer Angestellter, Verkauf von Getränken und Speisen
- **Mehrere Betriebe**

---

## 4. Projekte

### 🌟 Hauptprojekt: "Der kleine Weg des Programmierens" (Semesterprojekt SS25)

**Kurzbeschreibung:** Eine interaktive, kinderfreundliche Webseite für das CoderDojo Schöneweide, auf der Kinder spielerisch JavaScript programmieren lernen können.

**Links:**
- GitHub (Semesterprojekt-Repo): https://github.com/dkwdp/Der-kleine-Weg-des-Programmierens
- GitHub (Offizielle Implementation): https://github.com/dkwdp/dkwdp
- Live-Webseite: https://dkwdp.f4.htw-berlin.de/
- HTW Showtime-Seite: https://showtime.f4.htw-berlin.de/ss25/bachelor/b1-der-kleine-weg-des-programmierens/
- GitHub-Organisation: https://github.com/dkwdp

**Team:** 7 Personen (Anas Yunis Altaee, Anna Gröpler, Duncan Wittner, Jonathan Zieger, Kevin Le, Manh Hoáng, Ole Marwede)
**Betreuer:** Bruno Schilling

**Technologien:**
- **Frontend:** SvelteKit, Svelte
- **Sprachen:** Svelte (75.8%), CSS (15.3%), TypeScript (5.8%), JavaScript (2.5%), HTML (0.6%)
- **Build-Tools:** Vite
- **Grafik:** p5.js (Canvas-basierte interaktive Elemente)
- **KI-Integration:** Lokaler KI-Server als Lern-Assistent/Maskottchen

**Features:**
- Levelbasiertes Lernsystem (10 Hauptlevel + Bonuslevel)
- Zwei Modi: geführter Modus (sequentiell) und freier Modus (alle Level sofort zugänglich)
- Integrierte Programmierumgebung (Code-Editor + Output-Ansicht)
- KI-Maskottchen als Hilfestellung bei Aufgaben
- Progressionssystem zum Nachverfolgen des Lernfortschritts
- Kinderfreundliches, buntes UI-Design
- Interaktive Map zur Level-Auswahl
- Erweiterbar designt (einfaches Hinzufügen neuer Levels via JSON + Svelte-Routen)

**Projektstruktur (vereinfacht):**
```
Der-kleine-Weg-des-Programmierens/
├── backend/           # KI-Server
├── src/
│   ├── data/          # Level-Definitionen (levels.json), CSS
│   ├── lib/           # Shared Components (Canvas, Editor, Level-Logik)
│   │   ├── Canvas/    # p5.js Canvas-Komponenten
│   │   ├── editorStore.ts
│   │   ├── JavaScriptEditor.svelte
│   │   └── levelpage.svelte
│   └── routes/        # SvelteKit File-based Routing
│       ├── levels/    # 10 Level + Bonuslevel
│       ├── map/       # Interaktive Karten-Ansicht
│       └── mascot/    # KI-Maskottchen-Komponente
├── static/            # Assets (Icons, Bilder)
├── svelte.config.js
├── vite.config.js
└── package.json
```

**Zusätzliche Repos der Organisation:**
- `dkwdp/dkwdp` – Offizielle/weiterentwickelte Implementation (125 Commits)
- `dkwdp/dkwdp-interactivelib` – JS-Library auf Basis von p5.js für interaktive Tutorials (TypeScript, GPL-3.0)
- `dkwdp/dkwdpil-template` – Template für interaktive Tutorials (TypeScript, GPL-3.0)


### Persönliche Projekte (GitHub: Elociraptor)

**GitHub-Profil:** https://github.com/Elociraptor
**GitHub Achievements:** Pair Extraordinaire, Pull Shark

#### kNearestNeighbor
- **Repo:** https://github.com/Elociraptor/kNearestNeighbor
- **Beschreibung:** Eigene Implementation des K-Nearest-Neighbor-Algorithmus mit dem CIFAR-10 Datensatz
- **Sprache:** Python
- **Themengebiet:** Machine Learning, Bildklassifikation
- **Highlights für Portfolio:** Eigenständige ML-Implementation, Arbeit mit realen Datensätzen

#### dln-smartgarden
- **Repo:** https://github.com/Elociraptor/dln-smartgarden
- **Beschreibung:** Smart Garden Projekt (vermutlich IoT/Hardware-nahes Projekt)
- **Sprache:** Python
- **Themengebiet:** IoT, Hardware, Automatisierung
- **Highlights für Portfolio:** Interdisziplinär (Software + Hardware/IoT), Python

---

## 5. Technische Skills

### Programmiersprachen
- Java
- Python
- JavaScript / TypeScript
- HTML / CSS
- MATLAB
- Svelte / SvelteKit

### Tools & Frameworks
- Git / GitHub
- SQL
- Jira
- Microsoft 365
- Vite
- p5.js
- Node.js / npm

### Architektur-Kenntnisse
- MVC-Pattern (ASML-Praktikum)
- File-based Routing (SvelteKit)
- Component-based Architecture


---

## 6. Sprachen

| Sprache     | Niveau        |
|-------------|---------------|
| Deutsch     | Muttersprache |
| Englisch    | C1            |
| Französisch | B1            |
| Spanisch    | Anfänger      |

---

## 7. TODOs für Portfolio-Erstellung

Diese Punkte sollten noch ergänzt werden:

- [ ] **Kurze Bio / Über mich** – 2-3 Sätze, wer du bist und was dich antreibt
- [ ] **Kontakt-Links** – LinkedIn, andere Social Media für das Portfolio?
- [ ] **Details zu dln-smartgarden** – was genau war das Projekt? IoT? Uni-Kurs? Welche Hardware?
- [ ] **Domain / Hosting** – wo soll das Portfolio gehostet werden? (GitHub Pages, Vercel, Netlify?)
- [ ] **Kontakt-Links** – LinkedIn, andere Social Media für das Portfolio?