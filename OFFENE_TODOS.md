# Offene TODOs — Portfolio (Stand 30.10.2026)

Alles, was noch von dir kommen muss. Im Code steht an jeder Stelle ein Kommentar `TODO(Ole)`, auf der Seite ein sichtbarer Platzhalter (z. B. `· folgt`, `[Startdatum]`). Zeilennummern können sich beim Weiterarbeiten verschieben, such dann einfach nach `TODO(Ole)`.

Reihenfolge: oben das, was am meisten Wirkung hat.

---

## 1. Bachelorarbeit
Seiten: [index.html](index.html) (`#thesis`), [projects/bachelorarbeit.html](projects/bachelorarbeit.html), [js/thesis.js](js/thesis.js), Hero-Terminal in [js/terminal-shell.js](js/terminal-shell.js)

- [ ] **α-Sweep-Daten** als `data/alpha_sweep.json` anlegen (Ordner `data/` gibt es noch nicht). Format: `{ "msrvtt": [{alpha, r1, r5, r10}], "charades": [...] }`. Sobald die Datei da ist, erscheint auf der Detailseite der Slider mit Kurven und Wertetabelle. Format-Beschreibung: [js/thesis.js:13](js/thesis.js#L13)
- [ ] **Metriken** R@1 / R@5 / R@10 für die Ergebnistabelle: [bachelorarbeit.html:281](projects/bachelorarbeit.html#L281), außerdem `cat thesis.md` im Terminal: [terminal-shell.js:211](js/terminal-shell.js#L211)
- [ ] **Richtung der Interpolation:** Ist α = 0 Zero-Shot und α = 1 voll fine-getunt? Danach kann die Formel ergänzt werden: [bachelorarbeit.html:98](projects/bachelorarbeit.html#L98), [thesis.js:32](js/thesis.js#L32)
- [ ] **Grenzen-Abschnitt** gegen die finale Arbeit prüfen (Warmup-Konfiguration, α-Auswahl auf dem Test-Split). Optional weitere Grenzen, z. B. schmale Basis (ein Backbone, zwei Checkpoints, ein OOD-Test): [bachelorarbeit.html:291](projects/bachelorarbeit.html#L291)
- [ ] **Hardware-Grenzen konkretisieren** (Batchgröße, Laufzeiten, was wegen 8 GB nicht ging): [bachelorarbeit.html:226](projects/bachelorarbeit.html#L226)
- [ ] **Streamlit-Screenshot** nach `images/` legen und den Platzhalter ersetzen: [bachelorarbeit.html:216](projects/bachelorarbeit.html#L216)
- [ ] **Betreuer namentlich nennen?** (Prof. Dr. Klaus Jung): [bachelorarbeit.html:55](projects/bachelorarbeit.html#L55)
- [ ] **Links:** PDF (nur falls freigegeben), Repo, Slides: [bachelorarbeit.html:69](projects/bachelorarbeit.html#L69), [:71](projects/bachelorarbeit.html#L71), [:310](projects/bachelorarbeit.html#L310)
- [ ] **Note** (erst nach Bewertung) und **Kolloquiumsdatum**, falls du sie zeigen willst: [bachelorarbeit.html:315](projects/bachelorarbeit.html#L315)
- [ ] **Englischer Titel:** Das ist meine Übersetzung, offizielle Fassung prüfen: [index.html:169](index.html#L169), [bachelorarbeit.html:49](projects/bachelorarbeit.html#L49)

## 2. Experience & Education
Seite: [index.html](index.html)

- [ ] **Freshfields:** Startdatum (auf der Seite steht `[Startdatum]`), Stundenumfang, weitere Aufgaben: [index.html:572](index.html#L572)
- [ ] **Freshfields: Freigabe** klären, ob die Texte so öffentlich stehen dürfen (bewusst allgemein, keine Mandanten-/Projekt-/Toolnamen, nur cplace, Low-Code, KI-Workflows): [index.html:573](index.html#L573)
- [ ] **HU-Master:** Schwerpunkt so formulieren, wie du ihn öffentlich sagen willst, Startdatum Okt 2026 bestätigen: [index.html:654](index.html#L654)
- [ ] **HTW:** Abschlussdatum, finale Note (steht als `Note: [folgt nach Bewertung]`), exakter Studiengangname wie im Zeugnis: [index.html:675](index.html#L675)

## 3. Hero, Skills, Kontakt, Meta
Seiten: [index.html](index.html), [js/terminal.js](js/terminal.js), [js/terminal-shell.js](js/terminal-shell.js)

- [ ] **Status „Berlin · offen für Gespräche“** und **Kontakt-Text** noch korrekt? Bewusst vorsichtig formuliert, da du gerade eine Stelle hast: [index.html:64](index.html#L64), [index.html:737](index.html#L737), [terminal.js:17](js/terminal.js#L17)
- [ ] **git-log-Block im Hero:** Reihenfolge/Inhalte bestätigen (Hashes sind Deko). „Freshfields“ im Hero okay oder lieber neutral „Werkstudent Legal Tech“?: [index.html:77](index.html#L77)
- [ ] **`now.md` im Terminal** prüfen (Thesis-Stand, Master-Schwerpunkt, Werkstudent-Teil): [terminal-shell.js:201](js/terminal-shell.js#L201)
- [ ] **Skills-Auswahl** gegenchecken. Nicht aufgenommen, weil unbestätigt: scikit-learn, Docker, PostgreSQL, Grafana, Node-RED, MQTT, LaTeX, 3D-Druck: [index.html:437](index.html#L437)
- [ ] **Sprachstufen** (Englisch C1, Französisch B1, Spanisch Anfänger). Die Balkenlängen 100/85/50/15 sind Schätzungen: [index.html:498](index.html#L498)
- [ ] **`<title>` und Meta-Description** prüfen: [index.html:7](index.html#L7)
- [ ] **Vorschaubild** (ca. 1200×630 px) für LinkedIn & Co. nach `images/` legen. Dazu eine **Domain** für `og:image`, `og:url` und `canonical` (die CNAME wurde gelöscht, deshalb habe ich keine geraten): [index.html:16](index.html#L16)

## 4. Projekte
### XCrawler
Seiten: [index.html](index.html), [projects/xcrawler.html](projects/xcrawler.html)

- [ ] **Repo öffentlich oder privat?** Bis dahin steht nur `$ ./github · folgt`: [index.html:226](index.html#L226), [xcrawler.html:60](projects/xcrawler.html#L60)
- [ ] **Thema der wissenschaftlichen Arbeit** nennen oder bewusst offen lassen (Accounts und Thema stehen absichtlich nicht auf der Seite): [index.html:227](index.html#L227), [xcrawler.html:71](projects/xcrawler.html#L71)
- [ ] **ToS-Hinweis** („für nicht-kommerzielle Forschung“) bestätigen: [xcrawler.html:74](projects/xcrawler.html#L74)
- [ ] **Screenshot der Excel-Struktur**, anonymisiert, optional: [xcrawler.html:93](projects/xcrawler.html#L93)

### Battery-Monitoring
Seiten: [index.html](index.html), [projects/battery-monitoring.html](projects/battery-monitoring.html)

- [ ] **Finale Methodik** (Isolation Forest? LSTM-Autoencoder? GradientBoosting/RF für RUL?), nur nennen, was wirklich umgesetzt wurde: [battery-monitoring.html:86](projects/battery-monitoring.html#L86), [index.html:254](index.html#L254)
- [ ] **Stack:** Was davon stammt von dir, was vom Team? Danach kann der Abschnitt „Stack im Projekt“ zurück: [battery-monitoring.html:90](projects/battery-monitoring.html#L90)
- [ ] **Betreuer** (Prof. Severin / Prof. Huhn) namentlich nennen?: [battery-monitoring.html:72](projects/battery-monitoring.html#L72)
- [ ] **Repo- oder Berichtslink**, falls vorhanden: [battery-monitoring.html:64](projects/battery-monitoring.html#L64)

### Bildverarbeitung
- [ ] **Repo-URL** ergänzen (der alte Link zeigte nur aufs GitHub-Profil und wurde entfernt): [index.html:401](index.html#L401), [bildverarbeitung.html:49](projects/bildverarbeitung.html#L49)
- [ ] **Widerspruch klären:** Detailseite nennt Python/OpenCV/NumPy, die Karte auf der Startseite nennt Java: [bildverarbeitung.html:50](projects/bildverarbeitung.html#L50)

### Optional
- [ ] **E-Fahrzeug-Messsystem** (CAN/UDS) und **IoT-Workshop an der HTW** zeigen oder weglassen?: [index.html:222](index.html#L222)

---

## Von mir formuliert, bitte gegenlesen
Das sind keine Fakten von dir, sondern Texte im Schreibstil aus dem Plan:
- Hero-Fließtext im Terminal („Ich schreibe lieber Code, der läuft, als Folien, die es versprechen“) und die `now:`-Zeile
- Thesis-Vorstellung auf der Startseite: Überschrift „Wie findet man eine Szene in einem Haufen Videos?“, der Einleitungstext und die drei Kurz-Aussagen („Mehr Bilder sind nicht besser“, „Anpassen mit Maß“, „Der Start zählt“)
- Alle englischen Texte
- Die Skills-Gruppierung

## Noch nicht erledigt (technisch)
- [ ] **Lighthouse-Lauf** (Performance, A11y, SEO) fehlt, lokal nicht installiert.
- [ ] **Browser-Test** durch dich: DE und EN, Desktop und ca. 390 px, vor allem Hero-Terminal, Projektkarten per Tastatur und die neuen Detailseiten.
- [ ] **Google Fonts und GSAP-CDN** lokal hosten (Datenschutz, in Deutschland sauberer). Nur ein Vorschlag, nichts umgebaut.
- [ ] **Committen und pushen** habe ich nicht gemacht, das machst du oder sagst mir Bescheid.
