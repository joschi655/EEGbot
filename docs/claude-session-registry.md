# Claude-Session-Registry

Working Set der letzten nützlichen Sessions (max. 5, älteste fliegt raus).
Vor längeren Läufen prüfen, ob eine bestehende Session fortgesetzt werden kann.

| Datum | Thema | Ergebnis | Wiederverwendbar für |
|---|---|---|---|
| 2026-06-12 | v0.1.0 Initial Build (Phasen 0–5) | Komplettes Framework, 40 Tests grün, Benchmark 16/16 | Folge-Phasen, Bugfixes, Daten-Kuratierung |

## Session 2026-07-15-c — B2C-Umbau + eegbot.aiwerke.de + Demo-Guide
- 5 neue Engine-Endpunkte in ui/server.ts (sanktion52/verguetung/fristen/schwellen/ue20), Throws als lesbare 400er
- UI komplett B2C: Anlagenprofil in localStorage (profil.js), 9 echte Screens, Login/Mocks raus; Forge baute Verguetung/Ue20/Recherche parallel
- Demo-Star Sanktion52: „Beispielfall laden" → 6.417 € vs. 45.540 € durchgestrichen; BGH-Zwilling-Dashboard zeigt Vergütungs-400 ehrlich als „—"
- docs/demo-guide-team.md (3 Stationen); Testzahl 118 vereinheitlicht; ISA ISC-41..67; Deploy eegbot.aiwerke.de via /opt/eegbot-b2c:3476 hinter Cloudflare Access (Opus-Agent)

## Session 2026-07-15-b — LIVE-Deploy fink.aiwerke.de + Supabase (Opus-Agent)
- fink.aiwerke.de: /opt/eegbot, systemd eegbot-fink (3475, EEGBOT_PUBLIC=1), Tunnel-Ingress + CNAME — live verifiziert
- Supabase self-hosted: /opt/supabase/src/docker, 11/11 healthy, Kong 8100, PG 5433; Creds nur in ~/supabase-credentials.txt (600)
- cloudflared: Backup → ein Edit (beide Hostnames) → validate → systemd-run-Restart; Runbook docs/deploy-fink.md
- Produktmodell Open Core in KB Statusübersicht Kap. 6; Delegations-Präferenz: Infra an Opus-Subagents

## Session 2026-07-15 — Norm-Graph + Statusübersicht + Doku-Entstaubung
- fink-Screen „Norm-Graph": echtes Querverweis-Netz, Zeitreise-Slider bis EEG 2027-E, Fall-Modus (45.540-€-Kette)
- /api/graph (Stichtags-Aggregation + crossRefs-Fall-Modus); d3 als Vendor; favicon-Route
- KB-Doc „26.07.15 - EEGbot Statusübersicht & Roadmap" (Fähigkeiten, Bedienung, Roadmap-Abgleich, Jura-Metaphern)
- source-inventory/architektur.md/Obsidian-Spiegel entstaubt; Drehbuch um Graph-Momente + Glossar erweitert
- Gotcha: „→" in Edits kann als NUL-Byte landen — ASCII-Separatoren in Code

## Session 2026-07-10 — Hackathon-Härtung + Pitch-Artefakte (E3, ISA im Repo-Root)
- Offline-UI: /vendor/*-Routen statt unpkg-CDN, Playwright-verifiziert
- Zahlen ab 02/2026 verifiziert/korrigiert (12,34/10,35; 6,73/5,50), Ü20 0,4-vs-0,715 aufgelöst
- BGH-Zwilling docs/beispiel-unterlagen-rueckforderung/ (45.540 € → 6.417 €) + docs/demo-drehbuch.md
- EEG-2027-Zeitmaschine: data/entwuerfe/ + build:eeg2027 + demo:zeitmaschine (Δ ~23.567 €)
- Root-Cause-Fix sucheNormen (Default = heute, kein Entwurfs-Leak)
- KB-Doc „26.07.10 - Re-Audit & Pitch-Konzept Hackathon" in Obsidian für das Team

## Session 2026-07-03 — Hackathon Phase A
- Onboarding-PDF Pia (make-pdf), Research-Brief mit Deadlines bis 17.08.
- fink-DS → ui/fink (Fonts gitignored), Clickdummy-Stories → ui/content
- ui/server.ts: echte Engine-API + App-Serving, alle Endpunkte curl-verifiziert
