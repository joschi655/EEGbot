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
