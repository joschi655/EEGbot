# Worklog

## 2026-06-12 — v0.1.0 Initial Build (Phasen 0–5)

- **Phase 0:** Repo-Scaffold — bun/TS, zod-Schemas für programs/workflows/forms/
  guardrails/parameters, Bedingungs-Evaluator, Parameter-Lookup (OpenFisca-Pattern), CI.
- **Phase 1:** Wissens-Layer — QuantLaw-Ingestion (EEG/EnWG in 6 Ständen ab
  2020-06 + MsbG/KWKG/WindBG/RDG aktuell), temporaler Normgraph (1.344 Expressions,
  10.135 Querverweise), §100-Resolver (BGH-XIII-ZR-3/24-Fixture grün), BM25-Index
  (5.390 Chunks), eeg-wissen MCP. Erkenntnis: QuantLaw-Commits sind per API nur bis
  ~2020-06 erreichbar (History vor Mai 2020 nicht über `until`-Queries adressierbar);
  EEG-2017-Volltext via Snapshot 2020-06-01 gesichert.
- **Phase 2:** Engines — §52-Radar (Heilung rückwirkend Nr. 1/3/4/11, Pauschal-2€
  Nr. 9a/10, Zusatzmonate Abs. 4, Kappung Abs. 5, Verjährung Abs. 6 — Mechanik aus
  dem aktuellen Normtext im Graphen verifiziert), Vergütungsrechner (deterministische
  Ablehnung für IBN < 30.07.2022 statt Falschwert), §24-Baum mit
  LLM_SUBSUMTION_ERFORDERLICH-Schnittstelle, Fristen, Schwellen, Ü20-Optionen,
  Guardrail-Classifier. Catala-Spezifikation §24.
- **Phase 3:** Förder-Layer — 4 Programme, 6 Formulare (MaStR-Feldinventar mit
  Fehlerfallen), Matcher + Kumulierungs-Matrix, eeg-foerder/eeg-daten MCPs.
- **Phase 4:** Agentik — 6 Skills, 7 Agenten, Guardrail-/Freshness-Hooks,
  4 Workflow-YAMLs, 5 E2E-Personas.
- **Phase 5:** Changefeed, EEG-Benchmark (16 deterministisch grün + 4 interpretativ),
  README, Docs.

**Offene Verifikationen (`ZU VERIFIZIEREN` in data/parameters/):**
- Vergütungssätze ab 01.02.2026 (rechnerisch fortgeschrieben) gegen BNetzA-Tabelle
- Jahresmarktwerte Solar 2023/2024 gegen netztransparenz.de
- E2E-Personas P1–P5 in frischer Session durchspielen (evals/personas.md)

## 2026-06-12 — v0.2.0 EEGbot-Migration + Vollausbau

- **Migration:** eeg-kompass (6 Commits) per `merge --allow-unrelated-histories`
  in den EEGbot-Clone (github.com/joschi655/EEGbot); LICENSE = MIT (Repo-Owner),
  package name = eegbot.
- **Dokumente-Layer (neu):** `dokumente/`-Ordner für Nutzer-Unterlagen;
  `ingest:dokumente` mit unpdf (PDF-Text), tesseract.js-OCR deu+eng
  (Gotcha: expliziter `workerPath` nötig, bun löst den Worker sonst aus dem
  Install-Cache ohne regenerator-runtime), pdftoppm-Rasterung für Scans,
  sips-HEIC-Konvertierung (macOS), DOCX via unzip; SHA-256-idempotent;
  Bilder/Pläne → Vision-Routing statt eigenem Plan-Parser. MCP `eeg-dokumente`
  (suche/lesen/status/bilder), Skill `Unterlagen`. E2E mit Fixture-PDF +
  OCR-Scan verifiziert.
- **Pipelines vervollständigt:** `ingest:rechtsprechung` (Open Legal Data —
  Listen-Endpunkt hat keinen Volltext, Detail-Fetch nötig; 8 Kernurteile + 30
  Breitensuche), `ingest:clearingstelle` (FAQ-Detailseiten numerisch
  enumerierbar, Facettensuche WAF-403; Drosselung nach ~200 Requests →
  Resume-Logik; 283 Einträge geladen), `ingest:markt` (SMARD live;
  netztransparenz via optionale NT_CLIENT_*-Credentials), `ingest:ausschreibungen`
  (§28a-Termine deterministisch + BNetzA-Höchstwert-Scrape defensiv).
  `eeg-wissen` um suche_clearingstelle + suche_rechtsprechung erweitert.
- **Docs:** user-guide.md (neu, Laien-Anleitung), architektur.md
  (RAG-Topologie-Tabelle, Dokumente-Layer), README (EEGbot, setup-Befehl,
  Unterlagen-Sektion), `bun run setup`.

**Weiter offen:** Vergütungssätze ab 01.02.2026 + Jahresmarktwerte 2023/2024
verifizieren (`ZU VERIFIZIEREN`), E2E-Personas P1–P5 in frischer Session,
Clearingstelle-Restbestand (FAQ ~198–330) per erneutem Pipeline-Lauf.

## 2026-06-12 — Catala-CI (Spezifikation ⇄ Engine Cross-Check)

- **Befund:** Catala unterstützt nur en/fr/pl-Syntax — die bisherige
  `.catala_de`-Datei war Pseudo-Syntax und nie kompilierbar. Ersetzt durch
  echtes `catala_en` (Keywords englisch, Gesetzestext deutsch).
- **Neu:** `rules/sanktion52.catala_en` (Abs. 2/3/4 + Exposure-Formel,
  7 Test-Scopes mit assertions), `rules/anlagenzusammenfassung_24.catala_en`
  (Tatbestand + Solarpaket-I-Rückausnahmen als label/exception-Hierarchie,
  5 Test-Scopes), `evals/catala-crosscheck.ts` (12 Szenarien durch BEIDE
  Implementierungen; Divergenz = Exit 1), CI-Job `catala` (setup-ocaml@v3,
  opam install catala.1.2.0, --require-catala).
- **Distribution:** Kein brew/npm/Docker-Image; Release-Binaries fehlen,
  Nightly-.deb hat kaputte Abhängigkeiten → opam ist der einzige Weg.
  Lokale Validierung via podman-Container (arm64, opam-Build).
- Scope-Abgrenzung dokumentiert: Kappung/Verjährung/Monats-Iteration bewusst
  nur in TS; Catala deckt Satzbestimmung + Entscheidungsbaum.

## 2026-07-03 — Hackathon-Vorbereitung Phase A (Team + UI-Fundament)

- **Zielbild fixiert:** Legal Loves Tech Hackathon 17.–21.08.2026 München
  (Zugang zum Recht); Lead-Story Wärmepumpe/iSFP-Förderfahrplan; fink als
  Produkt-Design (Klein-Blau, Gilmer), NormaGraph-Clickdummy nur als
  Inhalts-/Dramaturgie-Quelle. Plan: ~/.claude/plans/… (genehmigt 03.07.).
- **Pia-Onboarding:** docs/research-brief-pia.md + docs/onboarding-pia.md
  (+ PDF via make-pdf, 6 Seiten) — Projektüberblick, Arbeitsliste mit
  Deadlines, kuratierte KB-Auszüge (Förderlandschaft Q2/2026, RDG/Smartlaw,
  b17–b20), Rückgabe-Format. Erkenntnis: stories.js im Clickdummy basiert
  bereits auf Pias Mai-Recherche (§6, EuGH C-293/23) — Auftrag ist
  aktualisieren + vierte Wärmepumpen-Story, nicht neu füllen.
- **ui/:** fink Design System importiert (ui/fink/, ohne .mp4;
  Gilmer-.otf gitignored — kommerzielle Lizenz, Fallback-Stack dokumentiert);
  Clickdummy-Inhalte nach ui/content/ (stories.js, demo-dramaturgie.md).
- **ui/server.ts (bun):** fink-App + /api/status|frage|fahrplan|norm|cascade|
  uebergangsrecht — dieselben Engine-Funktionen wie die MCPs. Verifiziert:
  §100-Resolver (IBN 2005→EEG 2004-Kette), §24-Kaskade, Fahrplan-v1
  (KfW 458, 60 % für Testfall 38k€/selbstnutzend), Statics 200.
- **Offen (Plan B–E):** src/rules/fahrplan.ts (Reihenfolge-Logik, iSFP-Weiche),
  Screens an /api verdrahten, Region-Feld data/programs, PLZ→Netzbetreiber im
  Fahrplan, Ground-Truth-Fixtures KfW/BAFA, Personas P1–P6.
- **Zahlen-Flag aus KB-Abgleich:** KB-Recherche nennt Volleinspeisung ≤10 kWp
  12,34 ct (Param-Datei: 12,35 ZU VERIFIZIEREN) und Ü20-Vermarktungskosten
  0,715 ct (Code: 0,4) — an Pia zur Klärung (Brief 3.5).

## 2026-07-03 — Hackathon Phase B: Förderfahrplan-Generator + fink-Screen live

- **src/rules/fahrplan.ts (Lead-Feature):** deterministischer Fahrplan-Generator
  als GENERISCHER Interpreter über dem Programm-Schema — Reihenfolge aus
  `antrag_vor_massnahmenbeginn` (Vorbereitung→Antrag→Umsetzung→Nachweis bzw.
  steuerlich Umsetzung→Nachweis→Steuererklärung), Warntexte aus `ausschluesse`,
  Dokumente aus `benoetigte_formulare` (human_only ausgewiesen), iSFP-Weiche
  rein datengetrieben (kein falsches Bonus-Versprechen bei KfW 458),
  Entweder-oder aus Kumulierungsregeln, Markdown-Render mit Quelle je Schritt,
  RDG/StBerG-Disclaimer. Neue Programme (auch regionale) bekommen Fahrpläne
  ohne Codeänderung — per synthetischer Bayern-Fixture getestet.
- **Empfehlungsregel dokumentiert:** direkter Zuschuss vor Steuerermäßigung
  (§ 35c ist laut eigener Programmbeschreibung die „Alternative"); Wortwahl
  im UI/MD „Passendes Programm" statt „Empfehlung" (StBerG-vorsichtig,
  Advisor-Hinweis).
- **Daten:** kfw-458.json + Schema um `foerderfaehige_hoechstkosten_eur`
  (30 000 €) erweitert — Zuschuss-Schätzung kappt korrekt (42 T€ → 21 000 €).
- **Forge-Audit (GPT-5.4) fand 2 echte Bugs, beide behoben + Regressionstests:**
  (1) estg-35c.json ohne Maßnahmen-Typ-Gate — ein „Pool" bekam 20 %
  Steuerermäßigung empfohlen; Fix: Maßnahmenliste nach § 35c Abs. 1 S. 3 EStG.
  (2) begonnen-Warnung nannte § 35c als „verbleibenden Weg" auch wenn § 35c
  selbst ausgeschlossen war (Doppelförderung); Fix: nur passende steuerliche
  Programme nennen.
- **fink-App:** neuer Screen „Förder-Fahrplan" (ui/fink/ui_kits/app/Fahrplan.jsx,
  Sidebar-Eintrag) — POSTet live an /api/fahrplan, rendert Fördersatz+Boni,
  Entweder-oder-Banner, iSFP-Weiche, nummerierte Schritte mit roter
  Antrag-vor-Auftrag-Warnung (einzige Rot-Nutzung, Farbregel eingehalten),
  offene Fragen, Disclaimer. Erster Screen ohne FINK_DATA-Mocks (Plan-Todo 5
  für den Fahrplan-Flow erledigt; Dashboard/Assets bleiben Mock).
- **Verifiziert:** 61 Tests grün (12 Basis + 8 Forge-adversarial + Fixture),
  typecheck, validate:data, Benchmark 16/16; curl-Proben /api/fahrplan
  (Standard + leerer Fall + Regression status/uebergangsrecht); Browser-Proben
  Happy-Path (70 %/21 000 €/4 Schritte) und Ausschlussfall (begonnen=true →
  rote Warnung, § 35c-Pfad 20 %/8 400 €) per Playwright-Screenshot.
- **Offen (Plan C–E):** Region-Feld + PLZ→Netzbetreiber (Advisor: Deckelung
  der GESAMTförderquote über Programme hinweg fehlt im Schema — vor Phase C
  entscheiden), Ground-Truth-Fixtures KfW/BAFA, Freitext-KI-Endpoint,
  Compare-Mode-Screen, Personas P1–P6.
