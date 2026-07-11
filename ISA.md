---
project: EEGbot
task: Hackathon-Demo-Härtung + Pitch-Artefakte (Legal Loves Tech 17.–21.08.2026)
effort: E3
phase: verify
progress: 36/40
mode: build
started: 2026-07-10T22:05:00+02:00
updated: 2026-07-11T00:20:00+02:00
---

# ISA — EEGbot (Projekt)

## Problem

EEGbot hat die Substanz (1.344 Norm-Expressions, 27 MCP-Tools, deterministische
Engines, 113 Tests), aber sie ist beim Pitch nicht sichtbar und nicht robust:
Die fink-App lädt React/Babel von unpkg (ohne Netz = weißer Screen), zentrale
Vergütungszahlen ab 02/2026 tragen `ZU VERIFIZIEREN`-Marker, es gibt keine
Demo-Unterlagen für den Killer-Workflow (Dokumente → Fassung → Exposure) und
kein Wow-Feature, das die Jury nicht erwartet. Das Team hat außerdem kein
gemeinsames Dokument mit Audit-Verdikt und Pitch-Drehbuch.

## Vision

Beim Pitch legt jemand einen Ordner Unterlagen hin, sagt „Prüf das", und in
Minuten steht eine Euro-Zahl mit Norm und Fassung dahinter — offline-fest,
nachrechenbar, ehrlich über die eigenen Grenzen. Danach der Moment, den keiner
erwartet: dieselbe Anlage einen Monat später in Betrieb genommen, und der
Normgraph zeigt live den EEG-2027-Systemwechsel als Diff mit Euro-Delta.
Die Jury erkennt: Das ist kein Chatbot, das ist Recht als rechenbare Daten.

## Out of Scope

- Kein neuer UI-Screen für die Zeitmaschine (CLI/MCP-Output reicht laut Plan).
- Keine Offline-Härtung der fink-Component-Card-Previews (`ui/fink/components/**`,
  `ui/fink/templates/**`) — nur der servierte Demopfad `/app/`.
- Keine IP-/Anmelde-Themen (Team-Vereinbarung, Domain, Namensfrage) — separat.
- Kein Nachziehen der Clearingstelle-FAQ ~198–330 (P3, nur bei Restzeit).
- Keine Engine-Umbauten für EEG-2027-Berechnung — das Euro-Delta ist ein
  eigenständiges Demo-Skript über den bestehenden Parametern.
- Die uncommitted Onboarding-Sophia-Edits (Johannes' Arbeitsstand) bleiben unberührt.

## Principles

- Deterministisch, wo das Recht eindeutig ist; agentisch nur, wo Subsumtion nötig ist.
- Jede Zahl trägt Quelle + Fassung + Abrufdatum; unverifizierte Werte sagen es laut.
- Das Tool benennt, was es NICHT weiß (`unbekannt`, `LLM_SUBSUMTION_ERFORDERLICH`).
- Entwurfsrecht wird nie als geltendes Recht ausgegeben.

## Constraints

- TypeScript/bun only; niemals npm/npx; keine Python-Beimischung.
- `knowledge/` und `dokumente/` werden NIE committet (gitignored).
- Parameter-Dateien sind append-only (Korrekturen als neue Gültigkeitszeiträume,
  Ausnahme: Fehlerkorrektur unverifizierten Werts mit Quellenbeleg).
- Logik existiert genau einmal in `src/`; MCP/API/UI sind dünne Adapter.
- Farbregel fink: Rot nur für echte Warnungen; Klein-Blau als Akzent.
- RDG-Gate: prefill ≠ approved; keine Empfehlung ohne „Passendes Programm"-Wortwahl.

## Goal

Der Demopfad (fink-App + Claude-Code-Workflow) läuft offline und mit verifizierten
Zahlen; der Rückforderungs-Check hat vorzeigbare synthetische Unterlagen samt
Drehbuch; der Normgraph enthält den EEG-2027-RefE als klar markierte
Entwurfs-Fassung mit lauffähigem Euro-Delta-Vergleich; das Team hat Audit +
Pitch-Konzept als KB-Dokument.

## Criteria

### D1 — KB-Dokument (Obsidian)
- [x] ISC-1: KB-Dokument existiert unter `AI Werke/EEG Jura KI/` und beantwortet die 3 Audit-Fragen (Read)
- [x] ISC-2: KB-Dokument enthält das 3-Akte-Pitch-Konzept inkl. „45.538"-Anker (Grep "45.538")
- [x] ISC-3: KB-Dokument nennt Sophia (nicht Pia) in der Pitch-Rollenverteilung (Grep)
- [x] ISC-4: KB-Dokument enthält den priorisierten Build-Plan P0–P3 mit Verantwortlichen (Read)

### D2 — P0.1 Offline-Demo (Vendoring)
- [x] ISC-5: `ui/fink/ui_kits/app/index.html` enthält keine unpkg-/CDN-URL mehr (Grep "unpkg")
- [x] ISC-6: React/ReactDOM/Babel/lucide liegen lokal vor (node_modules oder ui/vendor) (ls)
- [x] ISC-7: `ui/server.ts` liefert die Vendor-Skripte mit HTTP 200 aus (curl)
- [x] ISC-8: Served `/app/`-HTML referenziert ausschließlich same-origin-Ressourcen (curl + Grep "https://")
- [x] ISC-9: fink-App rendert nach Vendoring fehlerfrei (Browser-/DOM-Probe)
- [x] ISC-10: Anti: keine neue externe CDN-URL im Demopfad eingeführt (Grep)

### D3 — P0.2 Modell-ID
- [x] ISC-11: `src/rag/intake.ts` Default-Modell ist gültige aktuelle ID + `INTAKE_MODEL`-Override dokumentiert (Grep + Doku-Read)

### D4 — P0.3 Zahlen-Verifikation
- [x] ISC-12: Teileinspeisung-Sätze ab 01.02.2026 verifiziert oder korrigiert, Quelle+Abrufdatum im YAML, Marker weg (Read)
- [x] ISC-13: Volleinspeisung-Sätze ab 01.02.2026 verifiziert oder korrigiert, Quelle+Abrufdatum im YAML, Marker weg (Read)
- [x] ISC-14: Jahresmarktwerte Solar 2023/2024 gegen netztransparenz verifiziert, Marker weg (Read)
- [x] ISC-15: Ü20-Diskrepanz (0,4 vs. 0,715 ct) an der Rechtsquelle aufgelöst und in Code/KB konsistent dokumentiert (Read)
- [x] ISC-16: `bun run validate:data` grün nach allen Parameter-Edits (Bash)

### D5 — P0.4 Testbasis
- [x] ISC-17: `bun test` vollständig grün (Bash)
- [x] ISC-18: Benchmark/Evals deterministisch grün (16/16) (Bash)
- [x] ISC-19: `bun run typecheck` grün (Bash)

### D6 — P1.5 BGH-Zwilling-Unterlagen
- [x] ISC-20: Rückforderungsschreiben (synthetisch) existiert in `docs/beispiel-unterlagen-rueckforderung/` (Read)
- [x] ISC-21: MaStR-Auszug + IBN-Protokoll existieren und sind in Anlage/Daten konsistent zum Schreiben (Read)
- [x] ISC-22: §52-Radar liefert für den Zwillingsfall eine Exposure-Zahl in Euro (bun-Probe)
- [x] ISC-23: §100-Resolver liefert für das IBN-Datum die korrekte Fassungskette (Probe)
- [x] ISC-24: Anti: alle Unterlagen tragen sichtbaren SYNTHETISCH/Beispiel-Hinweis (Grep)

### D7 — P1.6 Demo-Drehbuch
- [x] ISC-25: `docs/demo-drehbuch.md` existiert mit exakten Prompts + erwarteten Ausgaben je Akt (Read)
- [x] ISC-26: Drehbuch enthält Offline-Checkliste + Backup-Plan (Screen-Recording) + Zeitbudget ≤5 min (Grep)

### D8 — P2 EEG-2027-Zeitmaschine
- [x] ISC-27: Kuratierte Entwurfs-Normen als eingecheckte Quelldatei mit RefE-/Synopse-Quellenangaben (Read)
- [x] ISC-28: Pipeline erzeugt `knowledge/gesetze/eeg_2014/2027-01-01.json` mit ENTWURF-Kennzeichnung (Bash + Read)
- [x] ISC-29: Normgraph enthält nach Rebuild die Entwurfs-Fassung (SQLite-Probe: fassungen-Count)
- [x] ISC-30: `diff_fassungen` zeigt für § 21 den Unterschied aktuelle Fassung vs. 2027-Entwurf (Probe)
- [x] ISC-31: `normAtDate` zum Entwurfs-Stichtag liefert die Entwurfs-Norm mit ENTWURF-Marker (Probe)
- [x] ISC-32: Anti: `normAtDate` für HEUTIGES Datum liefert weiterhin die geltende Fassung, nie den Entwurf (Probe)
- [x] ISC-33: Parameter „Netzbetreiberabnahme" existiert, als SCHÄTZUNG markiert, mit Quelle (Read)
- [x] ISC-34: Euro-Delta-Skript läuft: IBN 15.12.2026 vs. 15.01.2027 → beide Regime + Differenz in € (bun-Probe)
- [x] ISC-35: Euro-Delta-Output kennzeichnet 2027-Zweig unübersehbar als ENTWURF (Grep im Output)

### D9 — Meta/Repo-Hygiene
- [ ] ISC-36: Anti: `knowledge/` und `dokumente/` bleiben uncommitted (git status)
- [ ] ISC-37: Anti: Johannes' uncommitted Onboarding-Sophia-Edits sind in keinem meiner Commits (git show)
- [x] ISC-38: `docs/worklog.md` + Session-Registry um diese Session ergänzt (Read)
- [ ] ISC-39: Forge-Audit über neue Artefakte gelaufen; Funde behoben oder begründet dokumentiert (Read Audit-Log)
- [ ] ISC-40: Logische Commits je Werkpaket, Arbeitsverzeichnis am Ende sauber bis auf Fremd-Edits (git status)

## Test Strategy

| isc | type | check | threshold | tool |
|---|---|---|---|---|
| 1–4 | file | Inhalt gegen Plan-Teil 1+2 | vollständig | Read/Grep |
| 5–10 | offline | keine externen URLs im Demopfad, 200er lokal | 0 externe | Grep/curl |
| 11 | code | Default-ID + Override + Doku | vorhanden | Grep |
| 12–16 | data | Quelle+Abrufdatum je Wert, validate:data | 0 Marker offen oder begründet | Read/Bash |
| 17–19 | suite | bun test / evals / typecheck | 100 % grün | Bash |
| 20–24 | demo | Engines liefern Zahlen für Zwillingsfall | Exposure > 0 € | bun |
| 25–26 | doc | Drehbuch vollständig | alle 3 Akte | Read |
| 27–35 | graph | Entwurf drin, heute unberührt | Anti-32 zwingend | sqlite/bun |
| 36–40 | repo | Hygiene + Audit | 0 Verstöße | git/Read |

## Features

| name | satisfies | depends_on | parallelizable |
|---|---|---|---|
| kb-dokument | ISC-1..4 | – | ja |
| vendoring-offline | ISC-5..10 | – | ja |
| zahlen-verifikation | ISC-12..16 | research-Agent | ja (Agent) |
| bgh-zwilling | ISC-20..24 | – | ja |
| demo-drehbuch | ISC-25..26 | bgh-zwilling, zeitmaschine | nein |
| eeg2027-zeitmaschine | ISC-27..35 | – | ja |
| verify-und-audit | ISC-17..19, 36..40 | alle | nein |

## Decisions

- 2026-07-10: `effort_source: classifier` (E3). Plan war vorab genehmigt (ExitPlanMode → Freigabe „execute plan").
- 2026-07-10: P0.2 entfällt als Code-Änderung — `claude-sonnet-5` ist gültige aktuelle Modell-ID, `INTAKE_MODEL`-Override existiert bereits (src/rag/intake.ts:104). Verbleibt: Doku-Check.
- 2026-07-10: Pitch-Rollen auf „Sophia" umgestellt — Repo-Commit e742041 benennt das Jura-Teammitglied real so; Plan-Text („Pia") war Stand 03.07.
- 2026-07-10: ISA-Skill-Workflows nicht als Skill-Tool verfügbar in dieser Session → ISA direkt per Write gepflegt (v6.2.x-Deferred-Klausel).
- 2026-07-10: Vendoring über `bun add` + Server-Route `/vendor/*` aus node_modules statt eingecheckter Binärblobs — Fresh Clone + `bun run setup` bleibt der einzige Installationspfad, Repo bleibt blob-frei.
- 2026-07-10: research-Agent (Zahlen-Verifikation) und Forge-Audit-Versuch 1 sind am Claude-Session-Limit gescheitert (Reset 01:40) — Zahlen-Verifikation inline via Perplexity-MCP übernommen (Delegation-Floor show-your-math: beide Delegationen wurden gespawnt; Forge-Retry läuft nach Reset).
- 2026-07-10: BGH-Zwilling bewusst als moderner § 52-Fall (IBN 2022, Nr. 11 MaStR) statt 1:1-Nachbau des 2012er-BGH-Falls — das §52-Zahlungsregime gilt erst ab EEG 2023; der Vor-2023-Zeitraum wird ehrlich als altes Sanktionsregime ausgewiesen (Ehrlichkeits-Beat im Pitch).
- 2026-07-10: Ü20-Klärung: 0,4 ct/kWh = gesetzliche Pauschale (§ 53 S. 1 Nr. 2, Wortlaut im Normgraph verifiziert); 0,715 ct = empirischer ÜNB-Kostenwert, rechtlich nicht maßgeblich. Code war korrekt; KB-Flag geschlossen.
- 2026-07-10: `sucheNormen`-Default von `fassung_bis = null` auf „heute" umgestellt (Root-Cause-Fix): mit künftigen Fassungen im Graph wäre „bis = null" der Entwurfstext gewesen — Ingestion-Punkt statt Symptom gefixt.

## Changelog

- **Conjectured:** Ein kuratierter Teil-Snapshot (nur geänderte §§) reicht für die EEG-2027-Zeitmaschine.
  **Refuted by:** `ingestFassungen` schließt alle in einem Snapshot fehlenden Normen (`fassung_bis` gesetzt) — § 100 wäre am 2027-01-15 „weggefallen".
  **Learned:** Entwurfs-Snapshots müssen als Overlay über den letzten Voll-Snapshot erzeugt werden; unveränderte Normen kollabieren dann hash-gleich in dieselbe Expression.
  **Criterion now:** ISC-28 (Voll-Snapshot via Pipeline) + ISC-32 (Anti-Leak heute) + Stichprobe § 100 am 2027-01-15.

## Verification

- ISC-1..4: Read/Grep KB-Doc „26.07.10 - Re-Audit & Pitch-Konzept Hackathon.md" — 3 Fragen, „45.538,55 €", „Sophia pitcht", P0–P3-Tabelle mit Wer-Spalte.
- ISC-5..8, 10: Grep 0× "unpkg"/"https://" im served HTML; curl /vendor/{react,react-dom,babel,lucide}.js → 4× HTTP 200 (110 KB–3,1 MB).
- ISC-9: Playwright-Probe http://localhost:3475/app/ — Landing rendert (banner, nav, hero); einziger Konsolenfehler favicon-404 (kosmetisch).
- ISC-11: Grep src/rag/intake.ts:104 `INTAKE_MODEL ?? "claude-sonnet-5"`; ID lt. aktueller Modellliste gültig.
- ISC-12..15: Read der drei YAMLs (Quelle + „Abruf 10.07.2026", Marker ersetzt); § 53-Wortlaut („0,4 Cent … Solaranlagen") per normAtDate-Probe aus dem eigenen Graphen.
- ISC-16..19: validate:data „Alle data/-Artefakte valide"; bun test 113 pass/0 fail; Benchmark „Deterministisch: 16/16"; tsc --noEmit leer.
- ISC-20..24: Read der 3 Dokumente (103,50 kWp / IBN 20.10.2022 / 45.540,00 € konsistent, SYNTHETISCH-Header); berechneSanktion52 → exposure 6.417,00 €, verjährt 2.484,00 €, 43 Monate, 3 Hinweise; resolveUebergangsrecht("2022-10-20") → EEG 2021 + Normenkette.
- ISC-25..26: Read demo-drehbuch.md — Prompts, Erwartungstabellen, Offline-Checkliste („WLAN AUS"), Screen-Recording-Backup, Zeitbudget-Tabelle.
- ISC-27..29: Read eeg-2027-refe.json (5 Quellen-URLs); Pipeline-Lauf „205 Normen → 207, 7 Änderungen"; build-normgraph „eeg_2014: 7 Snapshots → 480 Expressions".
- ISC-30..32: demo-Lauf zeigt Diff (4 geänderte Absätze); normAtDate-Proben: 2027-01-15 → „[ENTWURF EEG 2027]…", heute → geltende Fassungen; §§ 20a/20b heute nicht existent; § 100 am 2027-01-15 vorhanden; Default-Suche 0 Entwurfs-Treffer, Stichtagssuche 2027 findet ihn.
- ISC-33..35: Read Parameter-YAML (SCHÄTZUNG/ENTWURF, Quelle); demo:zeitmaschine-Lauf: 24.433,20 € vs. 866,25 € → „Δ … ≈ 23.566,95 €", ⚠️-ENTWURF-Blöcke im Output.
- ISC-38: Read worklog-Abschnitt 2026-07-10 + Registry-Eintrag.
- ISC-36/37/39/40: offen bis Commit bzw. Forge-Rücklauf.
