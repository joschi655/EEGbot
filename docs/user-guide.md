# EEGbot — User Guide

EEGbot ist ein Open-Source-Framework, das Claude Code in einen geführten
Assistenten für deutsches EEG-/Energierecht verwandelt: Balkonkraftwerk
anmelden, PV-Dachanlage durchziehen, Förderungen finden, §52-Sanktionsrisiko
prüfen, ausgeförderte Ü20-Anlage weiterbetreiben — mit deterministischen
Rechnern, versionierten Gesetzestexten und deinen eigenen Unterlagen als
Wissensquelle.

> **Kein Rechtsrat.** EEGbot liefert Rechtsinformation auf Kategorie-Ebene und
> verweist bei allem, was individuelle Rechtsberatung wäre, an Anwalt,
> Steuerberater oder Energieberater. Das ist technisch erzwungen (Guardrails),
> nicht nur ein Disclaimer.

---

## 1. Installation

**Voraussetzungen:**
- [bun](https://bun.sh) ≥ 1.1 (`curl -fsSL https://bun.sh/install | bash`)
- [Claude Code](https://docs.anthropic.com/claude-code) mit aktivem Claude-Abo/API-Key
- Optional für OCR von gescannten PDFs: `brew install poppler` (macOS) bzw. `apt install poppler-utils` (Linux)

**Setup (ein Befehl):**

```bash
git clone https://github.com/joschi655/EEGbot.git
cd EEGbot
bun run setup
```

`setup` installiert Abhängigkeiten, validiert die Datenbasis und baut die
Gesetzes-Wissensbasis lokal auf (lädt EEG/EnWG/MsbG/KWKG/WindBG/RDG von
gesetze-im-internet-Snapshots, ~2–5 Min beim ersten Mal). Es wird nichts
hochgeladen; alles bleibt auf deinem Rechner.

**Optionale Wissensquellen (empfohlen):**

```bash
bun run ingest:rechtsprechung    # BGH-Kernurteile + EEG-Rechtsprechung (Open Legal Data)
bun run ingest:clearingstelle    # Clearingstelle-FAQ + Voten — mehrfach laufen lassen,
                                 # die Website drosselt nach ~200 Abrufen (Pipeline merkt
                                 # sich den Fortschritt und macht beim nächsten Lauf weiter)
bun run ingest:ausschreibungen   # BNetzA-Gebotstermine
bun run ingest:markt             # Marktwerte-Abgleich (SMARD; netztransparenz mit API-Key)
```

Beim ersten OCR-Lauf lädt tesseract.js einmalig deutsche+englische
Spracherkennungsdaten (~20 MB) herunter. Sonst sind keine manuellen Downloads
nötig.

## 2. Deine Unterlagen einbringen

**Alles in einen Ordner: `dokumente/`.** Einspeisezusage, MaStR-Bestätigung,
Angebote, Rechnungen, Datenblätter, Dachpläne, Zählerschrank-Fotos,
Netzbetreiber-Briefe — PDF, JPG/PNG, HEIC (iPhone), DOCX, TXT. Unterordner
sind ok. Details: `dokumente/README.md`.

```bash
bun run ingest:dokumente
```

- PDFs mit Textebene werden direkt extrahiert
- Scans/Fotos werden per OCR lesbar gemacht (für die Suche)
- **Pläne und Fotos schaut sich Claude zusätzlich im Original an** — frag z. B.
  „schau dir meinen Dachplan an und sag mir, wie viele Module da eingezeichnet sind"
- Nichts davon wird committet oder verlässt deinen Rechner

## 3. Loslegen

Claude Code im Repo-Ordner starten:

```bash
claude
```

Die MCP-Server (Gesetzes-Wissen, Rechner, Förderung, Live-Daten, deine
Dokumente) verbinden sich automatisch über `.mcp.json`. Dann einfach in
normalem Deutsch:

| Du willst… | Sag z. B. |
|---|---|
| Balkonkraftwerk anmelden | „Ich habe ein 800-W-Balkonkraftwerk gekauft — was muss ich tun?" |
| PV-Dachanlage | „Wir planen 12 kWp aufs Dach, was kommt auf uns zu?" |
| Förderung finden | „Welche Förderung gibt es für eine Wärmepumpe im Altbau?" |
| §52-Risiko prüfen | „Ich habe meine Anlage zu spät im MaStR gemeldet — was droht mir?" |
| Ü20-Anlage | „Meine PV-Anlage von 2004 fällt aus der Vergütung — was nun?" |
| Eigene Unterlagen | „Was steht in meiner Einspeisezusage zur Inbetriebnahme?" |

Die geführten Workflows (Schritt-für-Schritt-State-Machines) starten
automatisch, fragen nur, was wirklich nötig ist, und ziehen Daten — wo möglich —
aus deinen Unterlagen statt dich zu fragen.

## 4. Was deterministisch ist (und warum das wichtig ist)

Vergütungssätze, §52-Sanktionsbeträge, Fristen, Schwellen und das anwendbare
EEG je Inbetriebnahmedatum berechnet **Code, nicht das Sprachmodell** — mit
datierten, quellenbelegten Parametern (`data/parameters/`). Wo das Gesetz einen
unbestimmten Begriff hat (z. B. „unmittelbare räumliche Nähe" bei § 24), sagt
das System das explizit und kennzeichnet die Einschätzung als Auslegung.

Jede Antwort nennt Norm **und Fassung** (z. B. „§ 8 Abs. 5a EEG 2023 i.d.F.
2024-06-01"), weil bei EEG-Anlagen das Inbetriebnahmejahr bestimmt, welches
EEG überhaupt gilt (§ 100, „Versteinerung").

## 5. Aktualität

```bash
bun run changefeed        # prüft BGBl-RSS, Gesetzes-Snapshots und Bundestags-Vorhaben
bun run build:knowledge   # baut die Gesetzes-Wissensbasis neu, wenn sich etwas geändert hat
```

Beim Start einer Claude-Session warnt ein Hook, wenn die Wissensbasis älter
als 30 Tage ist.

## 6. FAQ

**Brauche ich API-Keys?**
Nur Claude (über Claude Code). Optional: `DIP_API_KEY` (kostenlos,
Bundestags-API) für Gesetzesvorhaben-Tracking, `NT_CLIENT_ID`/`NT_CLIENT_SECRET`
(kostenlos, netztransparenz.de) für automatischen Marktwert-Abgleich.

**Wo liegen meine Daten?**
Komplett lokal: `dokumente/` (deine Dateien), `dokumente/.extrakte/`
(Text-Extrakte), `knowledge/` (Gesetze, Indizes). Alles gitignored.

**Ein Scan wird nicht gelesen?**
`brew install poppler`, dann `bun run ingest:dokumente` erneut. Oder die Seite
als PNG/JPG exportieren und in `dokumente/` legen.

**Die Clearingstelle-Pipeline bricht mit 403 ab?**
Normal — die Website drosselt. Später `bun run ingest:clearingstelle` erneut
ausführen; sie macht dort weiter, wo sie blockiert wurde.

**Kann ich das für Wind/Biogas/KWK nutzen?**
Die Wissensbasis (EEG, KWKG, EnWG) und die generischen Engines ja; die
geführten Workflows sind v0.1 auf Solar + Wärmepumpe zugeschnitten. Neuer
Workflow = neue YAML-Datei in `data/workflows/` — kein Code nötig.

**Was EEGbot bewusst nicht tut:**
Klagen vorbereiten, Verträge entwerfen, Steuern gestalten, für dich Anträge
absenden. Bei solchen Fragen bekommst du den passenden Eskalationshinweis
(Anwalt / Steuerberater / Energieberater) statt einer Antwort.
