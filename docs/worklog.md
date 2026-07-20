# Worklog

## 2026-07-19 — Praxisfälle M. Schäfer: Benchmark b25–b36, Ampel-Autotest, Förder-Guardrails, Programmauskunft, Session-Judge

**Anlass:** Martin Schäfer (Energieeffizienz-Experte, Sophias Vater) lieferte
12 Praxis-Testfälle Förderrecht Wärmepumpe/BEG (PDF 17.07.2026, dort b21–b32) —
die bestellte Lieferung aus Onboarding-Brief §3.1/§3.4. Kernidee übernommen und
verallgemeinert: „Die Klassifikation ist der eigentliche Test."

- **Benchmark v0.4 (36 Fragen):** Die 12 Fälle als b25–b36 integriert (Repo-b21–b24
  waren schon durch adversariale Fehlermodelle belegt; Mapping im Dateikopf).
  ALLE Fragen tragen jetzt `pruefung: schema|auslegung|rdg_grenze` und
  `ampel_erwartung`; `validate:data` prüft die Benchmark-Konsistenz mit.
- **Ampel-Autotest:** `evals/run.ts` klassifiziert jeden Fragetext deterministisch
  gegen die RDG-Ampel und vergleicht mit `ampel_erwartung` — 36/36, Mismatch failt
  CI. Sichert die Kopplung Policy ↔ Fragetexte ↔ Erwartung (nicht die Welt-
  Abdeckung durch Paraphrasen — bekannte lexikalische Grenze).
- **Guardrail-Policy v0.2.0:** Neue ROT-Kategorie `anleitung_behoerdenangaben`
  („was soll ich angeben?" bei unbelegter Tatsache, § 264 StGB — gilt für
  Förderanträge UND MaStR), Ersatztext = 4 belegbare Nachweiswege. Neue GELB-
  Kategorien `subsumtion_foerderbegriffe` (funktionsfähig, überwiegend Heizen,
  Etagenheizung, WPB … → Energieberater) und `zahlungsverweigerung_strategie`
  (schließt die b20-Lücke: „zahle ich einfach nicht" war bisher GRÜN → jetzt GELB;
  Verhaltensänderung im Live-Hook, gewollt). Fix `hatEskalationsziel`: akzeptiert
  jetzt auch „Energieeffizienz-Experte"/BAFA/KfW als Eskalationsziel energieberater
  — vorher scheiterten korrekte Förder-Antworten am Stop-Hook.
- **Datenmodell:** `data/programs/` um Durchführer-Fakten erweitert (antragstellung/
  Vollmacht, antragsberechtigte/Nießbraucher, foerderfaehige_nebenkosten/
  Fachplanung, bearbeitungszeiten mit `kein_rechtsanspruch: true`) plus
  `auslegungshinweise` = strukturierte known unknowns (8 offene Praxisfragen mit
  Grundregel/offener Frage/Verweis) und `richtlinie`-Feld mit
  `naechste_fassung_gueltig_ab: 2026-07-21` (BEG-EM-Novelle; validate:data warnt ab
  Inkrafttreten bei offenem Verifikations-Marker). Alle Schäfer-Fakten tragen
  Quelle + „Merkblatt-Wortlaut verifizieren"-Marker. Bewusst NICHT modelliert:
  20-Jahre-Grenze/Hybrid-Ausschluss als harte Bedingungen (Auslegung ungeklärt,
  Novelle unverifiziert), WPB-Bonus, Gebäudenetz-Programm, GEG (Scope-Leitplanke
  Vision.md: kein GEG-Einstieg, keine neuen Rechtsbereiche).
- **Neue Engine `programmauskunft`:** deterministisches Lookup der Durchführer-
  Fakten (Arrays→Maps für stabile Goldpfade), MCP-Tool im eeg-foerder-Server;
  macht die SCHEMA-Fälle b33–b36 automatisch prüfbar. `erwartet` in fragen.yaml
  kann jetzt ein Array sein (alle Goldwerte müssen passen).
- **Session-Judge ohne API-Key:** Skill `Benchmark` — je interpretativer Frage ein
  frischer Subagent (bekommt nur den Fragetext, Gold/Kriterien nie), Judge bewertet
  binär je Kriterium, Ergebnis nach Schema `JudgeErgebnisse` in
  `evals/benchmark/judge-ergebnisse.json`; run.ts liest sie mit sha256-Stale-Guard.
  CI failt nur mit `EEGBOT_JUDGE_STRICT=1` (Pre-Pitch-Gate). Isolation ist
  prompt-basiert (ehrlich dokumentiert). Probelauf in frischer EEGbot-Session offen
  (ISC-95).
- **Compliance-Skill/Agent:** Förder-Eskalationsordnung ergänzt (BAFA/KfW-FAQ →
  gelisteter EEE → Träger-Anfrage; Clearingstelle für Fördersachen unzuständig)
  + Behörden-Angaben-Regel + auslegungshinweise als Formulierungsgrundlage.
- **Forge-Audit (GPT-5.4):** kein CRITICAL; 2 MAJOR gefunden und behoben:
  (1) trennbare Verben/Synonyme umgingen die ROT-Regex („Was trage ich … ein?",
  „Welches Jahr nenne ich?" blieben grün) → zusätzliches Muster
  Unkenntnis-Marker + Erst-Person-Verbstamm, Marker „weiß … nicht" jetzt
  satzintern distanztolerant; (2) `hatEskalationsziel` wertete beiläufige
  KfW-/BAFA-Nennung („Die KfW 458 fördert …") als erfüllte Eskalationspflicht →
  nur noch Verweis-Kontext („an/bei die BAFA", „KfW-Hotline") zählt. Plus MINOR:
  leeres `erwartet: []` kann nicht mehr vakuum-bestehen (run.ts-Guard +
  `.min(1)` in validate-data). Alle Befunde mit Regressionstests abgedeckt.
- **Verifikation:** typecheck grün; bun test 167/167 (+17); validate:data grün
  inkl. Benchmark-Check (36 Fragen); `bun run evals` deterministisch 24/24,
  Ampel-Autotest 36/36, 12 interpretativ gelistet; e2e 8/8; Hook-Smoke: ROT-Fall
  b27 wird live im UserPromptSubmit-Hook mit Nachweiswege-Ersatztext geblockt.
- **Offen:** ISC-94 (BEG-EM-Novelle 21.07. + Merkblatt-Fakten verifizieren,
  Marker auflösen), ISC-95 (Judge-Probelauf + judge-ergebnisse.json committen).

## 2026-07-16 — Claude-Code-Agenten, Output-Guardrail und Datenschutz

**Anlass:** Audit des tatsächlichen Claude-Code-Toolflusses und Entscheidung,
EEGbot vorerst als eigenständiges Projekt-Repository statt als Plugin zu
betreiben.

- **Agentenrechte:** Explizite `tools`-Allowlisten aus allen sieben
  Subagenten entfernt. Damit erben sie die Built-ins und alle in der
  Hauptsession freigegebenen MCP-Tools; Navigator, Eligibility und
  Document-Prep können ihre im Prompt verlangten deterministischen Tools nun
  tatsächlich aufrufen.
- **Guardrail:** Der UserPromptSubmit-Hook speichert den deterministischen
  Ampelbefund ohne Originalprompt im System-Temp-Verzeichnis. Ein neuer
  Stop-Hook validiert die fertige Antwort und blockiert den Turn bis zur
  sicheren Neufassung. ROT verlangt Ablehnung/Eskalation, GELB zusätzlich
  Unsicherheit, Quelle und RDG-Disclaimer.
- **Datenschutz:** Dokumentation und Agentenanweisungen unterscheiden jetzt
  lokale Ablage/Indexierung von Modellverarbeitung. Von Claude Code gelesene
  Auszüge oder Bilder gelangen zum konfigurierten Modellanbieter; Suche vor
  Volltext und transparenter Dokumentenauftrag minimieren den Datenfluss.
- **Distribution:** Projekt-Repository bleibt v0.x-Primärmodell. Ein
  Claude-Code-Plugin ist als spätere Roadmap-Option dokumentiert.
- **Verifikation:** Guardrail-Unit- und Hook-Integrationstests, TypeScript-
  Typecheck sowie vollständige Test-/Daten-/Eval-Suite.

## 2026-07-15-e — Solarspitzen-Check (§§ 9, 51, 51a EEG)

**Anlass:** Direkte Erweiterung des privaten Anlagen-Lebenszyklus um die
technischen und wirtschaftlichen Folgen des Solarspitzengesetzes.

- **Engine:** `src/rules/solarspitzen.ts` trennt Neuanlagen ab 25.02.2025,
  Übergangsanlagen 2023–24.02.2025, Kleinstanlagen und historische
  Großanlagen. Für Altanlagen ab 400 kW wird die historische Fassung verlangt,
  statt einen pauschalen Schwellenwert zu behaupten.
- **§ 9:** 60-%-Begrenzung nur in Einspeisevergütung/Mieterstrom und nur bis
  iMSys, Steuerungseinrichtung und erfolgreicher Ansteuerbarkeitstest
  vollständig vorliegen; 25-kW-Fernsteuer-Zwischenpflicht und
  Steckersolar-Ausnahme werden separat ausgewiesen.
- **§§ 51/51a:** Beginn nach Ablauf des iMSys-Einbaujahres, zusätzliche
  Kleinstanlagen-Ausnahme, alte 400-kW-/Stundenschwelle und Solar-Zeitkontingent
  ohne erfundenes Förderenddatum modelliert. §-100-Abs.-47-Bonus wird nur für
  Bestandsanlagen und mit §-101-Genehmigungsvorbehalt gezeigt.
- **Produkt:** Profil v3 migriert v1/v2 und speichert Vermarktungsform,
  iMSys-Einbaudatum, Steuerungseinrichtung und Teststatus. Neuer responsiver
  Screen zeigt Technik, Negativpreise, Verlängerung, Quellen und Rechenweg.
- **Schnittstellen:** Gemeinsamer Zod-Contract, REST `/api/solarspitzen` und MCP
  `solarspitzen_pruefen`; Schwellen-Hinweis nutzt dieselben zusätzlichen
  Profiltatsachen.
- **Verifiziert:** `bun test` 150/150, `bun run evals` 20/20 deterministisch,
  `bun run test:e2e` 8/8 auf Desktop und Pixel 7, Typecheck, `validate:data`
  und EEG-2027-Pflichtsuite 4/4.

## 2026-07-15-d — Audit-Härtung und belastbare Demo-Beweiskette

**Anlass:** Umsetzung des priorisierten Audit- und Gewinnplans. Fokus auf
Korrektheit, Datenschutz, einheitliche Contracts und reproduzierbare Demo-Pfade.

- **Fristen:** Monatsaddition klemmt auf den letzten Tag des Zielmonats gemäß
  § 188 Abs. 3 BGB (31.01.2024 → 29.02.2024). Jährliche
  Volleinspeisungs-Mitteilungen sind über bestätigte Kalenderjahre modelliert.
- **Datenschutz:** `/api/intake/vorschau` zeigt Dokumentauszüge/Freitext,
  Empfänger und Zweck vollständig. `/api/intake` verlangt ein ausdrückliches
  Consent-Feld. README, User-Guide und UI beschreiben den tatsächlichen Datenfluss.
- **Contracts/HTTP:** Alle Rechner-Tools verwenden gemeinsame strikte
  Zod-Schemas (`src/schemas/rechner.ts`) in MCP, REST und Evals. REST trennt
  kaputtes JSON (400), Contract-/Fachablehnung (422) und unbekannte Bugs (500,
  serverseitiges Log, kein Detail-Leak).
- **Parameter:** Beide Solar-Tarife enden am 31.07.2026; August liefert bewusst
  eine Datenlücke. `validate:data` verbietet offene letzte Tarifzeiträume.
  Amtliche Prüfung am 15.07.: BNetzA veröffentlicht weiterhin nur Februar–Juli
  2026. Jahresmarktwert Solar 2025 auf netztransparenz.de amtlich 4,508 ct/kWh.
- **P1/UI:** Profil v2 validiert/migriert v1; Null-/Negativleistungen und
  ungültige Altwerte werden verworfen. Ü20 liefert strukturierte Quellen und
  für noch geförderte Anlagen keine scheinpräzisen Zukunftsoptionen. Gemeinsame
  „So wurde gerechnet"-Ansicht zeigt Inputs, Schritte, Parameterstand, Normen
  und Links. Mobile Navigation und Rechner wechseln unter 760 px auf eine Spalte.
- **CI/Evals:** Drei Playwright-Golden-Paths laufen auf Desktop und Pixel-7-
  Viewport. EEG-2027 hat einen Pflichtjob mit `REQUIRE_EEG2027=1`. Benchmark um
  falsche Fassung, falsche Schwelle und fehlende Eingabe erweitert.
- **Verifiziert:** `bun test` 137/137, `bun run evals` 19/19 deterministisch
  (4 interpretativ gelistet), `bun run test:e2e` 6/6, `tsc --noEmit`,
  `validate:data`, EEG-2027-Pflichtsuite 4/4.
- **Bewusst offen (extern/operativ):** schriftliche energierechtliche Abzeichnung,
  fünf Nutzerinterviews, drei fehlerfreie Fünf-Minuten-Durchläufe plus lokales
  Recording und der Obsidian-Architekturspiegel.

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
- **Teammitglied-Onboarding (Sophia):** docs/research-brief-sophia.md +
  docs/onboarding-sophia.md (+ PDF via make-pdf) — Projektüberblick,
  Themenliste (ohne feste Deadlines), kuratierte KB-Auszüge (Förderlandschaft
  Q2/2026, RDG/Smartlaw, b17–b20), Beck-Kommentar-Sammelauftrag, Rückgabe-Format.
  Erkenntnis: stories.js im Clickdummy basiert bereits auf ihrer Mai-Recherche
  (§6, EuGH C-293/23) — Auftrag ist aktualisieren + vierte Wärmepumpen-Story,
  nicht neu füllen. (Ursprünglich als „Pia" angelegt, am 03.07. auf den echten
  Namen Sophia umbenannt; „Spezialgebiet"-Zuweisung entfernt.)
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

## 2026-07-03 — Hackathon Phase C (Teil 1): Region-Layer, Gesamtdeckel, KI-Intake

- **Schema (data/programs):** `region` (bundeslaender als 16er-Enum, kommunen,
  plz_praefixe — AND über definierte Dimensionen, OR innerhalb der Liste;
  Mismatch → benannter Ausschlussgrund „gilt nur: …", fehlende Angabe →
  dimensionsgenaue Rückfrage statt stillem false) und Kumulierungs-Deckel
  in beiden Richtlinien-Varianten: `kumulierung_gesamtquote_max_prozent`
  (Summe der Quoten ≤ X %) und `kumulierung_gesamtbetrag_max_eur`
  (Gesamtförderung ≤ X €, Advisor-Fund — wird ausgewiesen, nicht still
  verrechnet). Bestehende 4 Programme unverändert valide.
- **Engine:** `regionPasst()` im Matcher; `berechneKombination()` (pure) +
  `kombinationen` im Fahrplan — kombinierbare Zuschuss-Paare mit Min-Deckel-
  Regel; steuerlich/kredit nie addiert. Aktueller Datenbestand liefert
  bewusst [] (Anti-False-Positive-Test); scharf wird es mit Pias
  Regionalprogrammen — ohne Codeänderung.
- **KI-Intake (Anforderung Johannes: „möglichst wenig selber ausfüllen"):**
  `src/rag/intake.ts` + `POST /api/intake` — extrahiert Fall-Felder aus
  dokumente/-Extrakten + Freitext via Anthropic-API (claude-sonnet-5,
  ANTHROPIC_API_KEY in .env; .env jetzt gitignored). Guardrails:
  Beleg-Pflicht (Quelle + wörtliches Zitat, sonst verworfen),
  Zitat-deckt-Wert-Check für Zahlen (Advisor-Fund: Existenz ≠ Korrektheit),
  nur Katalog-Felder, Koerzierung (ja→true, „38.000 €"→38000, Enum exakt),
  Inferenz injizierbar (Tests ohne Key). UI: „Weniger tippen"-Block im
  Fahrplan-Screen — Freitext + Button, Vorschläge mit Beleg-Liste
  („bitte prüfen"); prefill ≠ approved: Berechnung erst auf expliziten
  Klick (RDG-Gate, grep-verifiziert). Ohne Key: klare deutsche Anleitung.
- **UI:** Bundesland-Select (16 Länder), PLZ/Kommune-Felder,
  Kombinierbar-Block (Klein-Blau, Farbregel eingehalten).
- **Pia-Brief §3 erweitert:** Geltungsbereich wörtlich, Quote- ODER
  Betragsdeckel (+ „kein Deckel genannt" explizit) je Regionalprogramm.
- **Verifiziert:** Tests grün (inkl. 7 Intake-Tests mit Fake-Inferenz),
  typecheck, validate:data; curl: /api/intake ohne Key → 400 mit Anleitung,
  /api/fahrplan mit standort → keine falschen Kombinationen/Rückfragen;
  Browser: KI-Block + Bundesland-Select gerendert, Leer-Pfad graceful.
- **Offen:** PLZ→Netzbetreiber via MaStR (Phase C Schritt 9),
  Recherche-Workflow „regionales Programm erfassen" (Schritt 10),
  Live-Test des Intake mit echtem API-Key + Beispiel-Dokumenten.

## 2026-07-03 — Claude-Code-Vollausbau + PLZ→Netzbetreiber (Phase C Schritt 9)

- **foerderfahrplan als MCP-Tool** (eeg-foerder): Das Lead-Artefakt ist jetzt
  in Claude Code erreichbar — dünner Adapter über erstelleFahrplan/
  renderFahrplanMarkdown, dieselbe Funktion wie Web-App/Tests/Skripte
  (Architektur-Antwort: MCP = Claude-Adapter, Logik existiert genau einmal;
  deterministische Skripte importieren die src-Funktion direkt, ohne MCP).
  Workflow-YAML: abschluss-Schritt ruft das Tool statt Prosa zu dichten.
- **PLZ→Netzbetreiber** (src/apis/netzbetreiber.ts + MCP netzbetreiber_fuer_plz
  + /api/fahrplan-Anreicherung + UI-Zeile): Heuristik über Anschluss-
  Netzbetreiber registrierter MaStR-Einheiten je PLZ (DL-DE-BY-2.0, © BNetzA),
  Verteilung + Stichprobe, ausdrücklich „vermutlich zuständig", Cache je PLZ
  (Fehler werden NICHT gecacht — Advisor-Fund), Entity-/Fullwidth-
  Normalisierung, injizierbares fetch. Live: 80331 → SWM Infrastruktur (17/17).
  Engine bleibt pur — Anreicherung nur am Rand (Server/MCP).
- **Claude-Code-KI-Pfad ohne API-Key live getestet:** synthetische
  Beispiel-Unterlagen (docs/beispiel-unterlagen/: Angebot 42.000 €, R290,
  Bestand 1994, Gas 1998 funktionstüchtig; Typenschild) → ingest → Extrakte
  gelesen → Fall NUR aus Dokumenten gefüllt → Engine: kfw-458 55 %
  (Einkommensbonus korrekt „unbekannt", nicht mitgezählt), 16.500 €.
  **Fund dabei:** fehlende Bonus-Felder erschienen nicht in offene_fragen
  (Matcher fragt nur Eligibility nach) → gefixt: Satz-Bedingungs-Felder der
  passenden Programme werden gezielt nachgefragt („eine Angabe = +30 %").
  Zweiter Fund: Intake-Test las das reale dokumente/ → Kontext-Sammlung
  injizierbar gemacht.
- **CLAUDE.md:** neuer Abschnitt „KI-Intake in Claude Code (ohne API-Key)"
  (5-Schritte-Pfad, offene_fragen als einzige Rückfragen), foerderfahrplan im
  Determinismus-Gebot, catala_de→catala_en korrigiert. Unterlagen-Skill:
  Förderfall-Routing ergänzt. README: Beispiel-Quickstart.
- **Entscheidungen (Johannes):** Team = 3 · Compare-Mode vs. Beck-Online
  bleibt im Pitch („provokativ — schlimmstenfalls kaufen sie uns").
- **Cato-Cross-Vendor-Audit (GPT-5.4, E4-Pflicht) — Verdikt „concerns", alle
  Punkte umgesetzt:** CRITICAL: der neue fahrplan-Workflow-Schritt war ein
  UNERREICHBARER Knoten (dokumente→abschluss übersprang ihn) und validate:data
  merkte es nicht → Kante gefixt + Erreichbarkeits-Check im Validator
  (CI-Gate; schützt künftig auch Pias YAML-Edits). MAJOR 1: Netzbetreiber-Cache
  nebenläufigkeitsfest (In-Flight-Promise statt Ergebnis). MAJOR 2:
  Bonus-Nachfragen nur noch für „unbekannt"-Sätze (semantisch statt
  syntaktisch, kein Fragen-Spam). MINOR: Tool-Beschreibung
  netzbetreiber_fuer_plz nennt Aufrufregel standort.plz.
- **Forge-Audit: 2 echte Bugs in netzbetreiber.ts** (Phantom-Leername nach
  HTML-Strip zählte zur Stichprobe; Data-Nicht-Array → roher TypeError statt
  deutscher Meldung) — behoben + Regressionstests promoted.
- **Verifiziert:** 113 Tests grün, typecheck, validate:data (inkl. neuem
  Erreichbarkeits-Check), Benchmark 16/16, MCP-stdio-Smoke (4 Tools inkl.
  foerderfahrplan), curl /api/fahrplan mit VNB-Anreicherung, Browser-DOM-Probe
  der Netzbetreiber-Zeile, Advisor + Cato (E4) vollständig.
- **Offen:** Recherche-Workflow „regionales Programm erfassen" (Phase C
  Schritt 10), Ground-Truth-Fixtures (Phase D), Personas + Pitch (Phase E),
  Compare-Mode-Screen.

## 2026-07-10 — Hackathon-Härtung: Offline-UI, Zahlen verifiziert, BGH-Zwilling, EEG-2027-Zeitmaschine

- **Offline-Demo (P0):** React/ReactDOM/Babel/lucide als bun-Dependencies +
  `/vendor/*`-Routen in ui/server.ts; `ui_kits/app/index.html` ohne unpkg-CDN.
  Verifiziert: 4× HTTP 200 lokal, 0 externe URLs im servierten HTML,
  Playwright-Render-Probe (einziger Konsolenfehler: favicon-404, kosmetisch).
  Modell-ID-Check: `claude-sonnet-5` ist gültige aktuelle ID, `INTAKE_MODEL`-
  Override existiert — kein Fix nötig.
- **Zahlen-Verifikation (P0, `ZU VERIFIZIEREN` aufgelöst):** Vergütungssätze
  ab 01.02.2026 gegen BNetzA-basierte konkordante Quellen (DGS/pv-magazine,
  SFV, Metzler, ADAC; Abruf 10.07.2026): Teileinspeisung 7,78 ✓ / **6,73**
  (war 6,74) / **5,50** (war 5,51); Volleinspeisung **12,34** (war 12,35) /
  **10,35** (war 10,36). Jahresmarktwert Solar 2023 = 7,2 ✓, 2024 = 4,62 ✓.
  **Ü20-Diskrepanz aufgelöst:** 0,4 ct/kWh ist die gesetzliche Pauschale
  (§ 53 S. 1 Nr. 2, Wortlaut im eigenen Normgraph verifiziert); 0,715 ct ist
  der empirische ÜNB-Kostenwert aus Fachdebatten — Code (0,4) war korrekt,
  Kommentar präzisiert. Doppelcheck bleibt Sophias Brief-Punkt 3.5.
- **BGH-Zwilling (P1):** `docs/beispiel-unterlagen-rueckforderung/` —
  Zahlungsaufforderung 45.540 € (§ 52 Abs. 1 S. 1 Nr. 11, 103,5 kWp,
  44 Monate à 10 €/kW), IBN-Protokoll 20.10.2022, MaStR-Nachregistrierung
  05.07.2026. Engine-verifiziert: Exposure **6.417,00 €** (geheilt, rückwirkend
  2 €/kW), **2.484,00 €** nur per Verjährungseinrede, Vor-2023-Zeitraum
  ehrlich als altes Sanktionsregime ausgewiesen; §100-Resolver: EEG 2021.
- **Demo-Drehbuch (P1):** `docs/demo-drehbuch.md` — 3 Akte ≤ 5 min, exakte
  Prompts + engine-verifizierte Erwartungswerte, Offline-Checkliste,
  Q&A-Munition, Fallbacks.
- **EEG-2027-Zeitmaschine (P2):** `data/entwuerfe/eeg-2027-refe.json`
  (7 kuratierte RefE-Kernänderungen, sinngemäß + quellenbelegt, Review Sophia)
  → `pipelines/build-eeg2027-entwurf.ts` erzeugt VOLLSTÄNDIGEN
  Entwurfs-Snapshot 2027-01-01 (Teil-Snapshot würde wegen der
  Schließ-Semantik von ingestFassungen alle übrigen Normen beenden!);
  `bun run build:eeg2027`. Graph: eeg_2014 jetzt 7 Snapshots/480 Expressions.
  `bun run demo:zeitmaschine`: § 21-Diff geltend↔ENTWURF + Euro-Delta
  IBN 15.12.2026 (12,34 ct → 24.433,20 €/20 J) vs. 15.01.2027
  (ENTWURF ~3,5 ct, ~30 Mon. → 866,25 €) = **Δ 23.566,95 €**.
  Parameter `markt.netzbetreiberabnahme_entwurf2027` als SCHÄTZUNG markiert.
- **Root-Cause-Fix Suche:** `sucheNormen` ohne Stichtag filtert jetzt auf
  „heute geltend" statt `fassung_bis = null` — sonst wäre der 2027-Entwurf
  in der Default-Suche als geltendes Recht aufgetaucht. Anti-Leak-Proben:
  Default-Suche 0 Entwurfs-Treffer, Stichtag 2027-01-15 findet ihn;
  normAtDate(heute) liefert für alle kuratierten §§ die geltende Fassung,
  § 100 bleibt am 2027-01-15 offen, §§ 20a/20b existieren heute nicht.
- **Forge-Audit (GPT-5.4): kein CRITICAL/MAJOR** — Kernlogik, Graph-Invariante
  (empirisch: genau 5 geschlossene + 7 geöffnete Expressions zum 2027-01-01)
  und Zwilling-Zahlen bestätigt. 7 MINOR behoben: leerer Stichtag hebelte
  sucheNormen aus (`||` statt `??` + /api/frage-Normalisierung); argv-Guard
  demo:zeitmaschine (deutsche Komma-Eingabe → vorher Crash); Δ-Label ehrlich
  als „geförderte Erlöse" (30-Monats- vs. 20-Jahres-Cashflow nicht mehr
  vermischt); § 25-Abs.-1a-Zitat zu „Branchenschätzung" entschärft (Norm nicht
  im kuratierten Datensatz); Drehbuch 45.538,55/45.540 explizit erklärt;
  2 neue Testdateien (suche-Leak-Regression, Overlay-Invariante inkl.
  ENTWURF-Marker-Check → 118 Tests); Containment-Check im Statics-Fallback.
- **Verifiziert:** 118 Tests grün, typecheck, validate:data, Benchmark 16/16
  (nach Graph-Rebuild mit Entwurf), Demo-Skript-Lauf, Browser-Probe.
- **Offen:** Personas P1–P5 E2E in frischer Session; Degressionsstufe
  01.08.2026 nachtragen, sobald BNetzA veröffentlicht; netztransparenz-
  Direktabruf (CSV) als Golddatei für Jahresmarktwerte; Sophia-Review der
  Entwurfs-Normen gegen SUER-Synopse.

## 2026-07-15 — Norm-Graph-Visualisierung + Statusübersicht + Doku-Entstaubung

- **Norm-Graph (Pitch-Feature):** `GET /api/graph?stichtag&slug[&fall&tiefe]`
  in ui/server.ts — Knoten je enbez, Kanten aus `querverweis` der zum Stichtag
  geltenden Expressions (aggregiert, Selbstverweise raus, externe Gesetze als
  Zähler), Fall-Modus über bestehendes `crossRefs`. Neuer fink-Screen
  `NormGraph.jsx` (Canvas + d3-force, d3 als 5. Vendor-Dependency):
  **Zeitreise-Slider** mit Snap-Punkten EEG 2017 → heute → EEG 2027-E
  (Entwurfs-Normen amber + Puls, Delta-Zeile „Neu gegenüber Heute: § 20a,
  § 20b"), **Fall-Modus** „45.540-EUR-Fall zeigen" (Seeds § 52/§ 71/§ 19,
  Tiefe 1 = 20 Knoten; Tiefe 2 wäre mit 113 Knoten bühnenuntauglich),
  Klick → Norm-Panel mit Stichtags-Fassung. Positions-Cache über
  Stichtagswechsel, Layout beruhigt sich in ~3 s (im Drehbuch vermerkt).
- **Playwright-verifiziert:** Landing→Login→Norm-Graph; heute 205 Normen/708
  Kanten mit § 100 als Hub; 2027-Slider kippt Header auf ENTWURF-Amber und
  zeigt 7 Entwurfs-Normen; Fall-Modus dimmt korrekt; § 100-Klick lädt
  „Übergangsbestimmungen". Einziger Konsolenfehler war favicon-404 → Inline-
  SVG-Favicon-Route ergänzt (saubere DevTools auf der Bühne).
- **Gotcha Edit-Tooling:** ein „→" aus einem Edit landete als NUL-Byte (\x00)
  im Quelltext (funktionierte in JS zufällig als Separator!) — durch ASCII-`|`
  ersetzt, alle Session-Dateien auf NUL gescannt (sauber). In Code-Edits keine
  Pfeil-Glyphen verwenden.
- **Statusübersicht (KB):** „26.07.15 - EEGbot Statusübersicht & Roadmap" —
  Fähigkeiten-Inventar (verifiziert), Funktionsweise, Bedienung,
  Roadmap-Abgleich (gebaut✓/offen✗ inkl. Embedder-Interface = vorbereitet,
  nicht implementiert) und Kapitel „Für Juristen erklärt" (Metaphern-Set:
  geeichter Taschenrechner, Schönfelder mit allen Auflagen, Vier-Augen-Catala,
  Loseblattsammlung mit Aktenführungspflicht).
- **Doku-Entstaubung:** source-inventory.md korrigiert (rechtsprechung/markt/
  clearingstelle/changefeed waren längst GEBAUT, standen aber als
  „Roadmap/offen"); architektur.md um 2027-Entwurf, Norm-Graph, /vendor-Offline
  und Such-Default „heute" ergänzt; Obsidian-Spiegel (Agent Framework
  Architektur) per Update-Abschnitt nachgezogen.
- **Drehbuch:** Graph-Momente in Akt 2 (Fall-Subgraph) und Akt 3
  (Slider-Umverdrahtung vor dem Euro-Delta), Glossar-Box Jura-Sprache,
  Q&A „Woher wisst ihr, dass euer Rechner stimmt?" (Vier-Augen-Prinzip).
- **Forge-Audit Norm-Graph: kein CRITICAL; 1 MAJOR + 5 MINOR + 3 Nits, alle
  behoben:** Out-of-order-Fetch-Race in der Hero-Interaktion (Sequenz-Guards
  für Graph- und Norm-Fetch), Drehbuch-vs-Realität § 100 (neuer
  `markiere`-Param: § 100 wird hervorgehoben ohne Expansion — mit Expansion
  wären es 68 statt 21 Knoten), Per-enbez-Dedupe + kanonische Kanten wie
  normAtDate (Robustheit gegen künftige Fenster-Overlaps), Fehlerzustand statt
  Dauer-Spinner im Norm-Panel, d3-fehlt-Hinweis, tiefe-Klemme [1,3],
  mouseleave-Handler, aufgehobene Entwurfsnormen gestrichelt, extern-Zähler im
  Panel genutzt. Sauber bestätigt: SQL-Injection, Halboffen-Fenster, Dedupe,
  dpr=2-Hit-Testing, Lifecycle/Leaks, Performance (kein Cache nötig).
  Verifiziert: 118 Tests, typecheck, curl-Proben (markiere=§ 100 → 21 Knoten,
  tiefe=0 geklemmt), Playwright-Smoke mit 0 Konsolenfehlern.


## 2026-07-15 — LIVE: fink.aiwerke.de + self-hosted Supabase (Opus-Deploy-Agent)

- **Produktmodell fixiert (KB Statusübersicht Kap. 6):** Open Core / Managed
  Hosting — Code für alle gleich und offen; bezahlt wird Betrieb, Aktualität,
  Bequemlichkeit. Gleiche fink-UI für lokal und gehostet (Flag statt zweitem
  Frontend); Installations-Resthürde ist bewusst der Conversion-Trichter.
- **fink.aiwerke.de LIVE:** /opt/eegbot @ a9754d9, systemd `eegbot-fink`
  (bun ui/server.ts, Port 3475, `EEGBOT_PUBLIC=1`), Cloudflare-Tunnel-Ingress +
  CNAME via `cloudflared tunnel route dns`. Wissensbasis + EEG-2027-Entwurf auf
  dem Server gebaut. Unabhängig verifiziert: /app/ 200 (0,13 s via CF),
  /api/graph liefert 2027-Entwurf, /api/intake 403 (Kosten-Härtung),
  /vendor/d3.js 200. Clearingstelle/Rechtsprechung bewusst nicht ingestiert
  (separate Scraper, bei Bedarf `bun run ingest:<quelle>` auf dem Server).
- **Supabase self-hosted (projektübergreifende Infra):** /opt/supabase/src/docker,
  11/11 Container healthy; Ports verschoben (Kong 8100/8443, Postgres 5433,
  Pooler 6543 — 8000/5432 waren belegt); alle Default-Secrets ersetzt
  (HS256-Legacy-Keys generiert, ES256 leer = Default); URLs auf
  supabase.aiwerke.de; Zugangsdaten NUR in
  `/home/ubuntu/supabase-credentials.txt` (600). Live: Kong/REST antworten
  401 ohne Key. Die fink-Demo braucht noch keine DB — Supabase ist für
  Accounts/Fälle/Zahlungen und andere Projekte vorbereitet.
- **cloudflared sicher angefasst:** Backup → beide Hostnames in EINEM Edit vor
  dem Catch-all → `ingress validate` → Restart via systemd-run (überlebt den
  eigenen SSH-Abbruch — SSH läuft selbst durch den Tunnel) → ssh-Ingress
  unversehrt. Runbook: docs/deploy-fink.md.
- **Cato-Cross-Vendor-Audit (E4) + Remediation:** REST-Auth sauber (401 ohne
  Key). Funde behoben: `.env` mit allen Live-Secrets war world-readable (0664)
  → chmod 600; fink band auf 0.0.0.0 → `HOST=127.0.0.1` (Code b633455 +
  systemd-Unit, nur der Tunnel spricht mit dem Prozess; live re-verifiziert).
  Dokumentiert, nicht geändert: Supabase-Docker-Ports (8100/5433/6543) binden
  0.0.0.0 = LAN-sichtbar hinter NAT (Internet nur via Tunnel); Studio hängt am
  offenen Internet nur hinter Kong-Basic-Auth.
- **Offen:** Impressum/RDG-Hinweis auf der öffentlichen Landing, Demo-Badge
  („Login ist Attrappe"), Supabase-Backups (pg_dump-Cron), Cloudflare Access
  vor das Studio bevor echte Projektdaten reinwandern, optional Supabase-Ports
  auf 127.0.0.1 mappen.


## 2026-07-15-c — B2C-Umbau: „Meine Anlage", echte Engines statt Mocks, eegbot.aiwerke.de

**Anlass:** Owner-Entscheid: Fokus auf den B2C-EEGbot (Open Source lokal + paid
gehostet); fink.aiwerke.de bleibt als B2B-Artefakt liegen. 6 von 8 fink-Screens
waren B2B-Mock-Attrappen (Fake-Login, Fake-Chat, hartkodiertes Portfolio) — die
Engines existierten aber alle. Umbau = Verdrahtung, kein Neubau. Team-Demo am
16.07.

- **Server (`ui/server.ts`):** 5 neue Endpunkte als dünne Wrapper um dieselben
  Engines wie mcp/rechner: GET+POST `/api/sanktion52`, `/api/verguetung`,
  `/api/fristen`, `/api/schwellen`, `/api/ue20`. Engine-Throws sind
  nutzerlesbare Validierungsmeldungen → 400 mit Originaltext (engine-Helper).
  Favicon „f"→„E".
- **Anlagenprofil (`profil.js`):** localStorage `eegbot.anlage.v1` deckt alle
  Engine-Inputs; Vorlagen `beispiel()` (9,8 kWp, konform) und `bghZwilling()`
  (103,5 kWp, IBN 20.10.2022, geheilter Nr.-11-Verstoß). Nur MeineAnlage
  schreibt, Screens lesen on-mount. Zentrales Fristen-Status-Mapping
  (ueberschritten→overdue …).
- **UI-Umbau:** Login-Stage raus (kommt mit Supabase; Login.jsx bleibt als
  Vorlage liegen). Shell FINK_DATA-frei, Text-Wordmark „EEGbot" (kein
  --font-outline — Gilmer liegt nicht auf dem Server). Sidebar B2C: Übersicht ·
  Meine Anlage · Fristen · Rückforderungs-Check · Vergütung · Nach der
  Förderung · Förder-Fahrplan · Recherche · Norm-Graph. Neue/umgebaute Screens:
  Landing (B2C-Hero + GitHub), Dashboard (parallel fristen/verguetung/schwellen
  mit SEPARATEN Catches — Vergütungs-400 beim >100-kWp-Zwilling ist Normalfall
  → KPI „—" + Direktvermarktungs-Hinweis), MeineAnlage (ersetzt
  Assets+AssetDetail; Schwellen-Befunde + §100-Rechtsregime-Karte via
  /api/uebergangsrecht), Deadlines (echte Fristen inkl. folge_bei_verstoss +
  Veräußerungsform-Erklärtext), Sanktion52 (Demo-Star: „Beispielfall laden" →
  6.417 € vs. 45.540 € durchgestrichen, Differenz 39.123 €, Monats-Tabelle mit
  verjährt-Badges), Verguetung/Ue20/Recherche (Forge, GPT-5.4 — Recherche
  bewusst OHNE Chat: Suchfeld → 3 Trefferblöcke Normen/Clearingstelle/
  Rechtsprechung). Reports-Fake-Chat und data.js werden nicht mehr geladen.
- **Doku:** docs/demo-guide-team.md (3 Demo-Stationen, Produktmodell „zwei
  Ebenen, ein Produkt", Echt-vs-Roadmap, Troubleshooting); Testzahl auf 118
  vereinheitlicht (README hatte 40, Drehbuch 113); architektur.md
  Experience-Schicht aktualisiert; ISA um ISC-41..67 erweitert (ID-stabil).
- **Deploy:** eegbot.aiwerke.de über zweiten Checkout /opt/eegbot-b2c
  (Port 3476, Cloudflare Access statt EEGBOT_PUBLIC) — Opus-Agent, Runbook
  docs/deploy-eegbot-b2c.md. Reihenfolge gegen offenes Key-Fenster:
  Access-Probe (302) VOR Key-Deploy; Fallback EEGBOT_PUBLIC=1.
- **Verifiziert:** 118 Tests, typecheck, curl je Endpunkt (BGH-Payload =
  6.417 €), Playwright alle 9 Screens (Konsole 0 Fehler außer gewollten
  4xx-Netzwerklogs), Flows Beispiel-Anlage/BGH-Zwilling, Fahrplan+NormGraph-
  Regression.
- **Gelernt:** Browser loggt gewollte 4xx als Konsole-Fehler → Abnahmekriterium
  präzisiert; _ds_bundle.js definiert FINK_DATA weiterhin (Z. 1847) → Anti-
  Kriterium als Grep der geladenen Screens statt „ist undefined".
