---
name: Unterlagen
description: Arbeit mit den eigenen Dokumenten des Nutzers (dokumente/) — Suche, Volltext, Pläne und Fotos lesen. USE WHEN der Nutzer auf eigene Unterlagen verweist ("in meiner Einspeisezusage steht", "schau in den Bescheid", "ich habe den Plan abgelegt", "was steht in meinen Dokumenten"), oder wenn ein Workflow-Schritt Daten braucht, die typischerweise in Unterlagen stehen (IBN-Datum, Leistung, Netzbetreiber, Zählernummer).
---

# Unterlagen — die Dokumente des Nutzers nutzen

## Grundregeln

1. **Erst Status prüfen:** `dokumente_status` (MCP `eeg-dokumente`). Wenn leer →
   Nutzer bitten, Dateien in `dokumente/` zu legen und `bun run ingest:dokumente`
   auszuführen (oder es selbst per Bash ausführen, wenn Dateien schon da sind).
2. **Suche vor Volltext:** `suche_dokumente` mit konkreten Begriffen
   (z. B. "Inbetriebnahme", "kWp", "Zählernummer", "Netzverknüpfungspunkt").
   Erst bei Bedarf `dokument_lesen` für den ganzen Extrakt.
3. **Bilder und Pläne IMMER im Original lesen:** `bilder_liste` liefert die
   Pfade — das Originalbild mit dem **Read-Tool** öffnen. Claude liest Pläne,
   Dachbelegungen, Zählerschrank-Fotos und Handschriftliches nativ; der
   OCR-Extrakt ist nur der Suchköder, nie die Wahrheit.
4. **Hinweise ernst nehmen:** Manifest-Hinweise wie "Scan ohne Textebene"
   bedeuten: Inhalt fehlt eventuell. Dann das Original als Bild lesen oder den
   Nutzer auf `brew install poppler` hinweisen.

## Typische Verwendung in Workflows

- **Intake:** Bevor du den Nutzer nach IBN-Datum, Leistung, Netzbetreiber oder
  Anlagennummer fragst — erst in den Unterlagen suchen. Gefundene Werte dem
  Nutzer zur Bestätigung vorlegen ("In deiner Einspeisezusage steht 8,5 kWp,
  IBN 15.03.2024 — korrekt?"), nie ungeprüft übernehmen.
- **Formular-Vorbefüllung (Dokumente-Skill):** Felder aus den Unterlagen ziehen,
  Quelle nennen (Dateiname).
- **§52-Check:** MaStR-Bestätigung des Nutzers gegen seine Pflichtangaben halten.
- **Plan-Analyse:** Dachbelegungs-/Lagepläne per Read-Tool ansehen, um Fragen
  wie Modulanzahl, Ausrichtung, Nachbargebäude (→ §24 räumliche Nähe) zu klären.
  Ergebnisse als Beobachtung kennzeichnen, nicht als Rechtsbewertung.

## Datenschutz

Originale, Extrakte und Index in `dokumente/` sind privat und gitignored. Ein
MCP-Treffer oder per Read/Vision geöffnetes Original wird aber Teil des
Claude-Code-Modellkontexts und damit an den konfigurierten Modellanbieter
übertragen. Bei einem ausdrücklichen Dokumentenauftrag kurz darauf hinweisen;
sonst vor dem ersten inhaltlichen Zugriff bestätigen lassen. Suche vor
Volltext, nur erforderliche Ausschnitte lesen. Inhalte nie in committete
Dateien, Issues oder weitere externe Dienste kopieren.

## Förderfälle: Unterlagen → Fahrplan (Auto-Intake)

Bei Förder-/Wärmepumpen-Fällen ist das Ziel, dass der Nutzer **möglichst wenig
selbst ausfüllt**: Fall-Felder (massnahme.*, gebaeude.*, antragsteller.*,
eigentumsform, standort.*) aus den Unterlagen belegen — je Wert Quelle +
Textstelle nennen, nichts raten — und dann `foerderfahrplan` (MCP `eeg-foerder`)
aufrufen. Dessen `offene_fragen` sind die EINZIGEN Rückfragen an den Nutzer.
Testmaterial: `cp docs/beispiel-unterlagen/*.md dokumente/ && bun run ingest:dokumente`.
