---
name: Update
description: Hält die Wissensbasis aktuell — verarbeitet den Changefeed (BGBl-RSS, QuantLaw-Delta, DIP, BNetzA), aktualisiert Parameter und baut den Normgraphen neu. USE WHEN "update", "aktualisieren", Freshness-Warnung, neue EEG-Novelle, oder turnusmäßige Wartung.
---

# Update — Changefeed-Verarbeitung

## Ablauf

1. `bun run pipelines/changefeed.ts` — prüft: BGBl-RSS (recht.bund.de), Delta der
   QuantLaw-Snapshots gegen den lokalen Stand, DIP-Vorgänge zu EEG/EnWG.
   Output: Liste geänderter Normen + anstehender Vorhaben.
2. Bei Gesetzesänderungen: `bun run build:knowledge` (Ingestion → Normgraph → Index).
   Danach `bun test` — die Graph-Tests fangen Struktursprünge.
3. Geänderte Normen gegen `data/parameters/` abgleichen: betrifft eine Änderung
   Sätze/Schwellen/Fristen, neuen Zeitraum mit Quelle anhängen (NIE bestehende
   Zeiträume editieren) und `bun run validate:data` laufen lassen.
4. `ZU VERIFIZIEREN`-Hinweise in Parametern abarbeiten: Wert gegen BNetzA/
   netztransparenz prüfen, Hinweis entfernen oder korrigieren.
5. Änderungen in `docs/worklog.md` dokumentieren; bei strukturellen Änderungen
   `docs/architektur.md` mitziehen.
