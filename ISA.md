---
project: EEGbot
task: B2C-Umbau (Meine Anlage, echte Engines statt Mocks) + eegbot.aiwerke.de + Team-Demo-Guide
effort: E4
phase: verify
progress: 55/67
mode: build
started: 2026-07-15T12:10:00+02:00
updated: 2026-07-15T15:50:00+02:00
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
- [x] ISC-36: Anti: `knowledge/` und `dokumente/` bleiben uncommitted (git status)
- [x] ISC-37: Anti: Johannes' uncommitted Onboarding-Sophia-Edits sind in keinem meiner Commits (git show)
- [x] ISC-38: `docs/worklog.md` + Session-Registry um diese Session ergänzt (Read)
- [x] ISC-39: Forge-Audit über neue Artefakte gelaufen; Funde behoben oder begründet dokumentiert (Read Audit-Log)
- [x] ISC-40: Logische Commits je Werkpaket, Arbeitsverzeichnis am Ende sauber bis auf Fremd-Edits (git status)

### D10 — B2C-Server-Endpunkte (Run 2026-07-15-c)
- [x] ISC-41: `GET /api/sanktion52` liefert `{kategorien}` = VERSTOSS_KATEGORIEN (curl)
- [x] ISC-42: `POST /api/sanktion52` mit BGH-Zwilling-Payload → `exposure_gesamt_eur == 6417`, verjährt 2484, 43 Monate (curl)
- [x] ISC-43: `POST /api/verguetung` 2023er 9,8 kWp → satz 8.2, foerderende 2043-12-31; 2020er → HTTP 400 mit lesbarer Engine-Meldung (curl)
- [x] ISC-44: `POST /api/fristen` + `/api/schwellen` + `/api/ue20` liefern Engine-Shapes (Array/Objekt, Status/Norm/Optionen) (curl)
- [x] ISC-45: Engine-Throw wird als 400 mit Originaltext gereicht (engine-Helper), nicht als 500 (curl 2020er-Fall)
- [x] ISC-46: `bun test` 118 grün + `tsc --noEmit` sauber nach Server-Edits (Bash)

### D11 — B2C-UI-Umbau
- [x] ISC-47: `profil.js`: window.EEGBOT_PROFIL {lade, speichere, loesche, vollstaendig, beispiel, bghZwilling, FRIST_STATUS/LABEL}, Key `eegbot.anlage.v1` (Read + Browser-Flow)
- [x] ISC-48: Login-Stage entfernt; Landing → App direkt; „Abmelden" → „Startseite" (App.jsx/shell.jsx + Klick-Probe)
- [x] ISC-49: Kein geladener Screen liest FINK_DATA; data.js/Login/Assets/AssetDetail/Reports nicht mehr in index.html (Grep + Read)
- [x] ISC-50: Wordmark „EEGbot" als Text OHNE --font-outline (Gilmer fehlt auf Server) in Shell + Landing (Read + Screenshot)
- [x] ISC-51: Alle 12 Script-Dateien laden: Konsole 0 Fehler außer gewollten 4xx-Netzwerklogs (Playwright console_messages)
- [x] ISC-52: Flow Landing → App → Empty-State → „Beispiel-Anlage laden" → KPIs live (8,2 ct/kWh, Förderende 2043, Schwellen-Handlungsbedarf) (Playwright)
- [x] ISC-53: BGH-Zwilling-Flow: Vergütungs-KPI „—" + Erklär-Card (>100 kWp → Direktvermarktung), Fristen/Schwellen rechnen trotzdem (separate Catches) (Playwright)
- [x] ISC-54: Sanktion52 „Beispielfall laden" → „6.417 €" groß sichtbar, Forderung 45.540 € durchgestrichen, Differenz 39.123 €, Monats-Tabelle mit verjährt-Badges (Playwright + Screenshot)
- [x] ISC-55: Forge-Screens: Vergütung (13 ct Volleinspeisung + Stufen + 400-als-Hinweis), Ü20 (Options-Cards, beste Option 4.027,80 €/Jahr), Recherche (Chip → 13 Treffer, 3 Blöcke, kein Chat) (Playwright)
- [x] ISC-56: Regression: Fahrplan + NormGraph rendern unter neuem AppShell (205 Normen/708 Kanten) (Playwright)

### D12 — Deploy eegbot.aiwerke.de
- [x] ISC-57: `/opt/eegbot-b2c` als zweiter Checkout (Commit 7a6fce0); `/opt/eegbot` (fink, b633455) unangetastet — Agent-Report + eigene Gegenprobe fink 200
- [x] ISC-58: systemd `eegbot-b2c` aktiv auf 127.0.0.1:3476, EnvironmentFile 600 root:root, kein EEGBOT_PUBLIC in der Unit (Agent-Report)
- [x] ISC-59: cloudflared-Ingress ergänzt NACH `ingress validate` (OK), fink-Eintrag unverändert, Config-Backup, Restart via systemd-run überlebt SSH-Abbruch (Agent-Report)
- [~] ISC-60: Access-Probe ergab **Fall B** — https://eegbot.aiwerke.de/app/ = 200 (Access im Dashboard NOCH NICHT angelegt). Sicherer Fallback korrekt: KEIN Key, `EEGBOT_PUBLIC=1` → eigene Live-Probe /api/intake = **403**. OFFEN für Johannes: Access anlegen, dann Key rein (docs/deploy-eegbot-b2c.md §Umschalten)
- [x] ISC-61: eigene Live-Gegenproben: fink.aiwerke.de/app/ = 200; eegbot /api/status = 200 (4 Indizes vorhanden); /api/sanktion52 BGH-Payload = **6417**; Supabase-Container healthy (Agent-Report)
- [x] ISC-62: Runbook `docs/deploy-eegbot-b2c.md` im Repo (Read — Architektur-Diffs, Access-vs-EEGBOT_PUBLIC, Update-Prozess, Gefahren)

### D13 — Doku + Weitergabe
- [x] ISC-63: `docs/demo-guide-team.md`: 3 Stationen, Produktmodell-Absatz („wann Web-UI, wann Claude Code"), Prep-Checkliste, Echt-vs-Roadmap, Troubleshooting (Read)
- [x] ISC-64: Testzahlen-Inkonsistenz behoben: README 40→118, Drehbuch 113→118 (Grep)
- [x] ISC-65: `docs/architektur.md` Experience-Schicht: 9 B2C-Screens + 13 REST-Routen + Zwei-Ebenen-Modell (Read)
- [ ] ISC-66: worklog + Session-Registry um Run 2026-07-15-c ergänzt (Read)
- [ ] ISC-67: Obsidian-Statusübersicht Kap. Produktmodell um eegbot.aiwerke.de ergänzt (Read)

### D14 — Audit-Härtung (Run 2026-07-15-d)
- [x] ISC-68: MaStR-Monatsfrist folgt § 188 Abs. 3 BGB (31.01.2024 → 29.02.2024; Normaljahr und Schaltjahr getestet)
- [x] ISC-69: Web-KI-Intake zeigt Empfänger, Zweck und vollständige übertragene Inhalte; API verlangt ausdrückliche Einwilligung (Unit + REST)
- [x] ISC-70: Vergütung 01.02.–31.07.2026 ist geschlossen; 01.08.2026 liefert Datenlücke, Freshness-Gate verbietet offene letzte Tarifzeiträume
- [x] ISC-71: Alle Rechner-MCP-Inputs und alle Rechner-REST-Routen verwenden `src/schemas/rechner.ts`; JSON=400, Contract/Fach=422, unbekannt=500 ohne Detail-Leak
- [x] ISC-72: Volleinspeisungs-Meldejahr modelliert; Browserprofil v2 migriert valide v1-Werte und verwirft ungültige Altprofile
- [x] ISC-73: Ü20-Quellen strukturiert und verlinkt; Zukunftsanlagen liefern Vorschau ohne scheinpräzise Optionen; `null` nimmt nicht am Zahlenvergleich teil
- [x] ISC-74: Drei Golden Paths laufen in CI auf Desktop-Chromium und Mobile-Chromium (6/6 lokal grün)
- [x] ISC-75: EEG-2027 hat separaten Pflichtjob; `REQUIRE_EEG2027=1` macht fehlenden Entwurf zum Fehler statt Skip
- [x] ISC-76: Mobile Navigation + einspaltige Rechner; Ergebnis-Screens zeigen „So wurde gerechnet" mit Inputs, Schritten, Parameterstand, Normen und Links
- [x] ISC-77: Jahresmarktwert Solar 2025 amtlich gegen netztransparenz.de auf 4,508 ct/kWh verifiziert
- [x] ISC-78: Benchmark um falsche Fassung, falsche Schwelle und fehlende Eingabe erweitert (19/19 deterministisch)
- [ ] ISC-79: Drei Golden Cases durch Energierechtsanwältin/Clearingstellen-erfahrene Person schriftlich abgezeichnet (externe Abnahme)
- [ ] ISC-80: Fünf Nutzerinterviews und drei fehlerfreie Fünf-Minuten-Durchläufe plus lokales Recording durchgeführt (externe/operative Abnahme)

### D15 — Solarspitzen-Check (Run 2026-07-15-e)
- [x] ISC-81: Engine trennt IBN ab 25.02.2025, Übergang 2023–24.02.2025, Kleinstanlagen und historische ≥400-kW-Fälle ohne pauschale Altregime-Antwort
- [x] ISC-82: §-9-Ergebnis berücksichtigt Vermarktungsform, 60 %, 25-kW-Fernsteuerpflicht, Steckersolar-Ausnahme sowie iMSys + Steuerung + erfolgreichen Test
- [x] ISC-83: §§ 51/51a modellieren iMSys-Einbaujahr, Kleinstanlagen-Ausnahme, alte Stundenschwelle und Verlängerungsregel; § 100 Abs. 47 trägt §-101-Genehmigungsvorbehalt
- [x] ISC-84: Profil v3 migriert v1/v2; REST und MCP verwenden den gemeinsamen Solarspitzen-Zod-Contract
- [x] ISC-85: Responsiver B2C-Screen zeigt exakte 5,88-kW-Grenze für 9,8 kWp, Negativpreisstatus, Rechenweg und Quellen
- [x] ISC-86: Abnahme grün — 150/150 Unit/Integration, 20/20 Evals, 8/8 Desktop/Mobile-Browserpfade, typecheck, validate:data, EEG-2027 4/4

### D16 — Praxisfälle Förderrecht M. Schäfer + Ampel-Autotest (Run 2026-07-19)
- [x] ISC-87: 12 Praxisfälle (Schäfer-PDF b21–b32) als b25–b36 in fragen.yaml; ALLE 36 Fragen tragen pruefung (schema|auslegung|rdg_grenze) + ampel_erwartung; validate:data prüft Benchmark-Konsistenz (Bash)
- [x] ISC-88: RDG-Ampel-Autotest in evals/run.ts — klassifiziere(frage) vs. ampel_erwartung, 36/36, Mismatch failt CI (Bash)
- [x] ISC-89: programmauskunft-Engine (Durchführer-Fakten KfW vs. BAFA: Vollmacht, Nießbraucher, Fachplanung, Bearbeitungszeit) + MCP-Tool; SCHEMA-Fälle b33–b36 deterministisch grün, 24/24 gesamt (Bash)
- [x] ISC-90: ROT-Kategorie anleitung_behoerdenangaben (Behörden-Angaben bei unbelegter Tatsache, § 264 StGB; gilt auch MaStR) mit Nachweiswege-Ersatztext; hatEskalationsziel akzeptiert Energieeffizienz-Experte/BAFA/KfW; Negativ-Tests gegen Formularhilfe-FPs (bun test)
- [x] ISC-91: GELB-Kategorien subsumtion_foerderbegriffe (eskalation energieberater) + zahlungsverweigerung_strategie (b20-Lücke, eskalation clearingstelle); Compliance-Skill/Agent mit Förder-Eskalationsordnung (BAFA/KfW-FAQ → EEE → Träger; Clearingstelle für Fördersachen unzuständig) (Read/bun test)
- [x] ISC-92: Session-Judge ohne API-Key — Skill Benchmark, JudgeErgebnisse-Schema, run.ts-Ingestion mit sha256-Stale-Guard und EEGBOT_JUDGE_STRICT=1-Gate (Read/Bash)
- [x] ISC-93: auslegungshinweise als strukturierte known unknowns in kfw-458/bafa-beg-em (8 offene Praxisfragen mit grundregel/offene_frage/verweis_an); richtlinie-Feld mit naechste_fassung_gueltig_ab 2026-07-21; validate:data warnt ab Inkrafttreten bei offenem Marker (Bash)
- [ ] ISC-94: BEG-EM-Novelle 21.07.2026 Wortlaut verifiziert (Hybrid-Ausschluss b31, WPB b32, Durchführer-Fakten b33–b35, BAFA-Bearbeitungszeit b36) und Verifikations-Marker aufgelöst (Recherche + Read)
- [ ] ISC-95: Judge-Probelauf in frischer EEGbot-Session (Skill Benchmark, 12 interpretative Fragen), judge-ergebnisse.json committed, EEGBOT_JUDGE_STRICT=1 grün (Bash)

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
| 41–46 | api | curl je Endpunkt gegen Engine-Erwartung | BGH = 6417 exakt | curl/Bash |
| 47–56 | ui | Playwright-Flows + Konsole | 0 Fehler (außer gewollte 4xx) | Playwright |
| 57–62 | deploy | Agent-Report + Live-Proben | Access vor Key | curl/ssh |
| 63–67 | doc | Read/Grep der Artefakte | vollständig | Read/Grep |
| 81–86 | solarspitzen | Engine/Contract/Profil/UI + Browserpfad | 100 % grün | bun/Playwright/Read |
| 87–95 | benchmark/guardrail | Ampel-Autotest, programmauskunft, Policy-Tests, Judge-Ingestion | 36/36 Ampel, 24/24 det., Tests grün | bun/Bash/Read |

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
| b2c-endpunkte | ISC-41..46 | – | ja |
| b2c-ui-umbau | ISC-47..56 | b2c-endpunkte | teilweise (Forge: 3 Screens) |
| deploy-eegbot-b2c | ISC-57..62 | b2c-ui-umbau, Push | ja (Opus-Agent) |
| demo-guide+doku | ISC-63..67 | alle | ja |

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
- 2026-07-15: Folge-Task (Plan 15.07., genehmigt): Norm-Graph-Visualisierung als Pitch-Feature — `/api/graph` (Stichtags-Aggregation, Fall-Modus via crossRefs Tiefe 1; Tiefe 2 mit 113 Knoten verworfen, bühnenuntauglich) + fink-Screen `NormGraph.jsx` (d3-force als 5. Vendor). Playwright-verifiziert (heute 205/708; 2027: 7 ENTWURF amber; Fall: 20 Knoten). Dazu Statusübersicht+Jura-Metaphern in der KB, source-inventory/architektur.md entstaubt (4 als „Roadmap" markierte Pipelines waren längst gebaut).
- 2026-07-15: Tooling-Gotcha: „→" in einem Edit landete als NUL-Byte im Quelltext (JS-funktional, aber Korruption) — durch ASCII-`|` ersetzt; Regel: keine Pfeil-Glyphen in Code-Edits.
- 2026-07-15 (Run c): Produkt-Entscheid (Owner): Fokus B2C-EEGbot; fink.aiwerke.de bleibt als B2B-Artefakt liegen. Subdomain eegbot.aiwerke.de, Schutz Cloudflare Access (Team-E-Mails), Supabase-Login NACH der Demo, Mocks echt auf B2C umgebaut („Meine Anlage"-Konzept, localStorage als Vor-Supabase-Persistenz).
- 2026-07-15 (Run c): Alte B2B-Dateien (Login/Assets/AssetDetail/Reports/data.js) bleiben auf Platte, werden aber nicht mehr geladen — Login.jsx ist Vorlage für den Supabase-Login, Rest ist fink-Referenz. `_ds_bundle.js` definiert FINK_DATA weiterhin (Z. 1847) — deshalb Anti-Kriterium ISC-49 als Grep statt „ist undefined".
- 2026-07-15 (Run c): Forge (E4-Binding) baute Verguetung/Ue20/Recherche parallel als neue Dateien (Kontrakt: nur window.*-Schnittstelle, keine Shared-File-Edits) — Kollisionsfreiheit durch Datei-Ownership statt Locking.
- 2026-07-15 (Run c): Deploy-Reihenfolge gegen offenes Key-Fenster: Access-Probe (302 auf cloudflareaccess.com) MUSS vor dem Key-Deploy grün sein; Fallback bei fehlendem Access ist EEGBOT_PUBLIC=1 (Intake-403) statt Key.

## Changelog

- **Conjectured:** Ein kuratierter Teil-Snapshot (nur geänderte §§) reicht für die EEG-2027-Zeitmaschine.
  **Refuted by:** `ingestFassungen` schließt alle in einem Snapshot fehlenden Normen (`fassung_bis` gesetzt) — § 100 wäre am 2027-01-15 „weggefallen".
  **Learned:** Entwurfs-Snapshots müssen als Overlay über den letzten Voll-Snapshot erzeugt werden; unveränderte Normen kollabieren dann hash-gleich in dieselbe Expression.
  **Criterion now:** ISC-28 (Voll-Snapshot via Pipeline) + ISC-32 (Anti-Leak heute) + Stichprobe § 100 am 2027-01-15.

- **Conjectured (Run c):** „Konsole == 0 Fehler" ist das saubere UI-Abnahmekriterium je Screen.
  **Refuted by:** Der Browser loggt jeden HTTP-4xx als Konsole-Fehler — der GEWOLLTE Vergütungs-400 beim 103,5-kWp-Zwilling erscheint dort zwangsläufig.
  **Learned:** Fehlerfreiheit heißt: 0 Script-/Render-Fehler; erwartete 4xx-Netzwerklogs sind explizit whitelisted.
  **Criterion now:** ISC-51/53 (Formulierung „außer gewollten 4xx-Netzwerklogs").

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
- ISC-36/37/40: git log --name-only HEAD~5..HEAD → 0× onboarding, 0× knowledge/dokumente; 5 logische Commits (9a0aab9, 9e587b5, 3263f7a, 5f3b867, 29d4ea3); status sauber bis auf Fremd-Edits.
- ISC-39: Forge-Audit (GPT-5.4) abgeschlossen — kein CRITICAL/MAJOR, Kernlogik/Invariante/Zahlen empirisch bestätigt; alle 7 MINOR-Funde behoben (leerer Stichtag, argv-Guard, Δ-Framing, § 25-Zitat, Drehbuch-Zahl, 2 Regressionstest-Dateien, Containment-Check). Nachweis: 118 Tests grün, typecheck, demo-Läufe (Guard exit 1, neues Label im Output).

### Run 2026-07-15-c (B2C-Umbau)
- ISC-41..45: curl-Proben lokal:3475 — GET sanktion52 12+ Kategorien; BGH-Payload exposure_gesamt_eur=6417/verjährt=2484/43 Monate; verguetung 2023 satz=8.2 + foerderende=2043-12-31; verguetung 2020 HTTP 400 „IBN … liegt vor dem 30.07.2022 …"; fristen=Array mit status/norm/folge_bei_verstoss, schwellen=Array thema/zutreffend, ue20=Objekt foerderende/optionen/warnungen/quellen.
- ISC-46: bun test „118 pass / 0 fail"; tsc --noEmit leer (nach Server- UND UI-Edits).
- ISC-47..50: Read profil.js/App.jsx/shell.jsx/index.html; Grep FINK_DATA in app/*.jsx → nur ungenutzte Altdateien; Grep font-outline in neuen Dateien → 0.
- ISC-51: Playwright console_messages nach Vollladung: 0 Fehler; nach BGH-Flows: nur /api/verguetung-400 (gewollt).
- ISC-52..54: Screenshots — Dashboard-KPIs 8,2 ct/kWh / 2043 / Schwellen-Rows; BGH-Dashboard „—" + „Kein fester Vergütungssatz berechenbar" + Volleinspeisungs-Frist offen; Sanktion52 „6.417 €" 44px Klein-Blau + „45.540 €" durchgestrichen + „Differenz 39.123 €" + Monatszeilen mit verjährt-Badge.
- ISC-55: Screenshots — Vergütung 13 ct/kWh + Stufen-Tabelle + „Kein fester Satz"-400-Card; Ü20 „Ausgefördert seit 31.12.2024" + beste Option 4.027,80 €/Jahr; Recherche „13 Treffer" mit Normen-Block (KWKG § 13b, EEG 2014 § 55b …).
- ISC-56: Screenshot NormGraph „205 Normen · 708 Querverweis-Kanten" unter neuem Shell; Fahrplan-Screen rendert.
- ISC-63..65: Read demo-guide-team.md (3 Stationen + Produktmodell-Absatz + Tabellen); Grep „118" in README:141 + demo-drehbuch:21; Read architektur.md Experience-Zeile.

### Run 2026-07-15-c — Deploy (Live-Proben durch den Hauptagenten)
- ISC-57..59/61: Opus-Subagent-Deploy /opt/eegbot-b2c (7a6fce0), systemd eegbot-b2c 127.0.0.1:3476, cloudflared-Ingress nach validate=OK; eigene externe Proben: eegbot.aiwerke.de/app/=200, /api/status=200 (normgraph/normen/clearingstelle/rechtsprechung „vorhanden"), /api/sanktion52 BGH=6417, /api/intake=403, fink.aiwerke.de/app/=200 (Gegenprobe unverändert).
- ISC-60: Fall B (Access fehlt noch) → Instanz öffentlich, Intake per EEGBOT_PUBLIC=1 gehärtet (403 verifiziert). Owner-Aktion offen: Cloudflare Access anlegen, dann Key statt EEGBOT_PUBLIC.
- ISC-62: docs/deploy-eegbot-b2c.md gelesen — vollständig, ID-stabil zu deploy-fink.md.

### Offen (Owner)
- Cross-Vendor-Audit (GPT-5.6): vom Owner auf später verschoben — codex-Account läuft auf GPT-5.5 (ChatGPT-Login), 5.6 braucht OPENAI_API_KEY. VERIFY bleibt bis dahin ohne Cross-Vendor-Gate; phase bleibt `verify`.
- Cloudflare Access für eegbot.aiwerke.de anlegen, dann Key deployen (Runbook §Umschalten).
