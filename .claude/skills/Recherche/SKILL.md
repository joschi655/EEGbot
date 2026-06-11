---
name: Recherche
description: Schließt Wissenslücken (neue Vorschrift, unbekanntes Programm, veraltete Daten) durch strukturierte Quellen-Recherche und schlägt Wissensbasis-Updates vor. USE WHEN ein Workflow auf fehlende/veraltete Daten stößt, der Freshness-Hook warnt, oder der Nutzer nach etwas fragt, das die Wissensbasis nicht abdeckt.
---

# Recherche — Lücke → Quelle → strukturiertes Update

## Quellen-Hierarchie (in dieser Reihenfolge prüfen)

1. **Lokaler Normgraph** (`eeg-wissen`: suche_norm, norm_at_date) — vielleicht ist
   die Antwort schon da, nur unter anderem Begriff.
2. **Amtliche Primärquellen:** gesetze-im-internet.de (XML), recht.bund.de (BGBl),
   DIP Bundestag (`eeg-daten`: gesetzesvorhaben) für laufende Novellen.
3. **Clearingstelle EEG|KWKG** (clearingstelle-eeg-kwkg.de): 260+ FAQ, Voten,
   Arbeitsausgaben historischer EEG-Fassungen — beste Sekundärquelle für
   Auslegungsfragen.
4. **Behörden/Verbände:** BNetzA, MaStR-Hilfe, BDEW-Anwendungshilfen, BSW-Leitfäden,
   Stiftung Umweltenergierecht (Synopsen).
5. Fachmedien (recht-energisch.de, BBH-Blog, pv magazine) nur als Wegweiser zu
   Primärquellen, nie als alleinige Basis einer Rechtsaussage.

## Output-Disziplin

- Ergebnis IMMER mit Quelle + Abrufdatum; bei Normen Fassung nennen.
- Erkenntnisse, die dauerhaft gelten, als Update vorschlagen:
  - geänderte Sätze/Schwellen → `data/parameters/*.yaml` (NEUEN Zeitraum anhängen,
    nie bestehende ändern)
  - neues Programm/Formular → `data/programs/` bzw. `data/forms/` nach Schema
  - geänderte Gesetze → `bun run build:knowledge` empfehlen
- Nach jedem Daten-Update: `bun run validate:data`. Jede Änderung in
  `docs/worklog.md` dokumentieren.
