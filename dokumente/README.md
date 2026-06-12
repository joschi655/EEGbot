# dokumente/ — Deine Unterlagen

**Leg hier alles ab, was zu deinem Fall gehört.** Unterordner sind erlaubt.
Nichts aus diesem Ordner wird jemals committet oder hochgeladen — alles bleibt
auf deinem Rechner (siehe `.gitignore`).

## Was reinlegen?

| Typ | Beispiele |
|---|---|
| Verträge & Zusagen | Einspeisezusage, Netzanschlussvertrag, Messstellenvertrag |
| Behörden & Register | MaStR-Registrierungsbestätigung, BAFA-/KfW-Bescheide |
| Rechnungen & Angebote | Installateur-Angebot, Wechselrichter-/Modul-Rechnung |
| Technik | Datenblätter (Module, Wechselrichter, Speicher, Wärmepumpe) |
| Pläne & Fotos | Dachbelegungsplan, Lageplan, Zählerschrank-Foto, Stringplan |
| Schriftverkehr | Briefe vom Netzbetreiber, E-Mails (als PDF), WEG-Beschlüsse |

## Unterstützte Formate

- **PDF** — Textebene wird direkt extrahiert; Scans ohne Textebene werden
  per OCR gelesen (dafür einmalig `brew install poppler`)
- **PNG / JPG / WEBP / TIFF** — OCR für die Suche **und** Claude liest das
  Originalbild direkt (Pläne, Fotos, Handschriftliches)
- **HEIC** (iPhone-Fotos) — wird auf macOS automatisch konvertiert
- **DOCX / TXT / MD / CSV** — direkt

## Einlesen

```bash
bun run ingest:dokumente
```

Idempotent: unveränderte Dateien werden übersprungen. Danach kann Claude in
jeder Session über den MCP-Server `eeg-dokumente` deine Unterlagen durchsuchen
(`suche_dokumente`), komplett lesen (`dokument_lesen`) und Pläne/Fotos im
Original ansehen (`bilder_liste` → Read-Tool).

Die Extrakte liegen in `dokumente/.extrakte/` als Markdown — du kannst sie
jederzeit selbst lesen oder löschen (`ingest:dokumente` baut sie neu).
