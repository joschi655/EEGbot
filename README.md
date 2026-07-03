# EEGbot

**Ein Open-Source-Claude-Code-Framework für deutsches Energierecht.** Geführte
Workflows für Balkonkraftwerk, PV-Dachanlage, Wärmepumpen-Förderung und
ausgeförderte Ü20-Anlagen — gebaut auf deterministischen Rechnern, einem
temporalen Normgraphen über alle EEG-Fassungen seit 2020 und harten
RDG-Guardrails.

> Du bringst deinen eigenen Claude mit (Claude Code), das Framework bringt das
> Energierechts-Wissen, die Rechner und die Leitplanken.

## Warum das kein „Chatbot über Gesetze" ist

Sprachmodelle raten Vergütungssätze, verwechseln EEG-Fassungen und übersehen
Fristen. EEGbot dreht das um — **deterministisch, wo das Recht eindeutig
ist; agentisch nur, wo Auslegung oder Nutzerführung gebraucht wird:**

- **§52 Liability Radar** — Strafzahlungs-Exposure (10 €/kW/Monat) mit Heilungs-
  ersparnis, Verjährung (§ 52 Abs. 6) und Kappung (Abs. 5) als nachrechenbare Engine
- **Temporaler Normgraph** — EEG & EnWG in 6 Fassungsständen (SQLite, 1.300+
  Norm-Expressions, 10.000+ Querverweise); jede Antwort zitiert Norm **und Fassung**
- **§100-Übergangsrechts-Resolver** — die Versteinerungs-Kaskade (BGH XIII ZR 3/24)
  als deterministisches Primitiv: IBN-Datum rein, anwendbare Fassung + Normenkette raus
- **§24-Entscheidungsbaum** — deterministische Prüfschritte; der unbestimmte
  Rechtsbegriff „unmittelbare räumliche Nähe" wird ehrlich als
  `LLM_SUBSUMTION_ERFORDERLICH` ausgewiesen (mit BGH-XIII-ZR-12/19-Pflichtkontext)
- **Förder-Matcher** — KfW 458/270, BAFA BEG EM, § 35c EStG als maschinenlesbare
  Schemas mit Boni-Logik und Kumulierungs-Matrix
- **Formularinventar** — MaStR-Felder, Veräußerungsform-Meldung, WEG-Zustimmung
  inkl. der dokumentierten Fehlerfallen (IBN ≠ Zählersetzung; die 0-€-Falle)
- **RDG-Ampel** — deterministischer Guardrail-Hook: Prozessstrategie, Steuer-
  gestaltung und Vertragsentwurf werden geblockt und auf Clearingstelle/Anwalt/
  Steuerberater eskaliert

## Quickstart

```bash
git clone https://github.com/joschi655/EEGbot && cd EEGbot
bun run setup             # installiert, validiert, baut Normgraph + Suchindex (~2–5 Min)
claude                    # Claude Code im Repo starten — MCPs & Hooks laden automatisch
```

Dann einfach fragen: *„Ich habe ein Balkonkraftwerk gekauft, was muss ich tun?"* —
der Intake-Skill strukturiert den Fall und führt durch den Workflow.

Voraussetzungen: [bun](https://bun.sh), [Claude Code](https://claude.ai/code).
Kein API-Key für die Wissensbasis nötig — alle Quellen sind offene Daten.
Ausführliche Anleitung: **[docs/user-guide.md](docs/user-guide.md)**.

## Deine Unterlagen als Wissensquelle

Leg deinen kompletten Papierkram in **einen Ordner** (`dokumente/`) —
Einspeisezusage, MaStR-Bestätigung, Angebote, Datenblätter, Dachpläne,
Zählerschrank-Fotos:

```bash
bun run ingest:dokumente
```

PDF-Text wird extrahiert, Scans und Fotos werden per OCR (tesseract.js, deutsch)
durchsuchbar, **Pläne und Fotos liest Claude zusätzlich im Original** (Vision).
Die Workflows ziehen Daten (IBN-Datum, Leistung, Netzbetreiber …) aus deinen
Unterlagen, statt dich abzufragen. Alles bleibt lokal und gitignored —
nichts wird hochgeladen oder committet.

Optionale Wissensquellen (je ein Befehl, lokal gebaut): Clearingstelle-FAQ +
Voten (`ingest:clearingstelle`), BGH-Rechtsprechung (`ingest:rechtsprechung`),
BNetzA-Gebotstermine (`ingest:ausschreibungen`), Marktwerte (`ingest:markt`).

## Architektur (Kurzfassung)

```
Claude Code (Runtime)
 ├─ Skills      Intake → Workflow-Runner (interpretiert data/workflows/*.yaml)
 │              + Compliance, Dokumente, Recherche, Update
 ├─ Agenten     7 Spezialisten (Intake, Eligibility, Navigator, DocPrep,
 │              Guardrail, Eskalation, Research)
 ├─ Hooks       RDG-Ampel (UserPromptSubmit) · Freshness (SessionStart)
 └─ MCP-Server  eeg-wissen     Normgraph, §100-Resolver, Norm-/Clearingstelle-/
                               Rechtsprechungs-Suche
                eeg-rechner    §52, Vergütung, §24, Fristen, Schwellen, Ü20
                eeg-foerder    Programme, Kumulierung, Formularinventar
                eeg-daten      MaStR-Suche, Marktwerte, DIP, Gebotstermine
                eeg-dokumente  DEINE Unterlagen: Suche, Volltext, Pläne/Fotos
data/           Geschäftslogik als DATEN (zod-validiert): Programme, Workflows,
                Formulare, Guardrail-Policy, datierte Parameter (OpenFisca-Pattern)
rules/          Catala-Spezifikationen (Gesetz-als-Code, Verifikations-Schicht)
knowledge/      generiert: Normgraph (SQLite) + BM25-Index — lokal gebaut
```

Details: [docs/architektur.md](docs/architektur.md). Vier Workflows sind die
Referenz-Testfälle — das System ist generisch: **neuer Fall-Typ = neue YAML-Datei.**

## Rechtlicher Rahmen (wichtig)

EEGbot liefert **allgemeine Rechtsinformationen und deterministische
Berechnungen nach veröffentlichten Werten** — keine Rechtsberatung im Einzelfall
(§ 2 RDG), keine Steuerberatung (StBerG). Du betreibst das Tool selbst, lokal,
mit deinem eigenen Modell-Zugang. Die Guardrail-Policy
(`data/guardrails/policy.yaml`) erzwingt diese Grenze technisch: streitige
Einzelfälle werden an die **Clearingstelle EEG|KWKG** (kostenfreie
Erstbearbeitung, kein Anwaltszwang), Fachanwälte oder Steuerberater eskaliert —
inklusive automatisch erstelltem Übergabe-Paket.

**Keine Gewähr für Richtigkeit oder Aktualität.** Gesetze ändern sich mehrmals
jährlich; der Freshness-Hook warnt bei veralteter Wissensbasis, `bun run
changefeed` überwacht BGBl, QuantLaw-Delta und Bundestags-Vorhaben.

## Qualitätssicherung

```bash
# Voraussetzung: bun run setup (Graph-Tests lesen die lokal gebaute Wissensbasis)
bun test              # 40 Tests: Normgraph, Engines, Förder-Matcher (BGH-/Clearingstelle-Fixtures)
bun run evals         # EEG-Benchmark: 16 deterministische + 4 interpretative Fragen
bun run validate:data # Schema- + Konsistenz-Gate für alle data/-Artefakte
bun run crosscheck:catala # Catala-Spezifikation ⇄ TS-Engine (12 Szenarien; Catala via opam, sonst nur TS-Seite)
```

Der **EEG-Benchmark** (`evals/benchmark/fragen.yaml`) ist unseres Wissens der
erste öffentliche Benchmark für mehrfassungs-EEG-Compliance — Beiträge (Ziel: 50+
Fragen) ausdrücklich willkommen.

## Datenquellen & Lizenzen

| Quelle | Nutzung | Lizenz |
|---|---|---|
| gesetze-im-internet.de via [QuantLaw-Archiv](https://github.com/QuantLaw/gesetze-im-internet) | Normtexte, Versionshistorie | amtliche Werke (§ 5 UrhG) |
| [MaStR](https://www.marktstammdatenregister.de) | Anlagendaten | DL-DE-BY-2.0 (© Bundesnetzagentur) |
| [DIP Bundestag](https://dip.bundestag.de) | Gesetzesvorhaben | offene Parlamentsdaten |
| [Open Legal Data](https://de.openlegaldata.io) | BGH-/EEG-Rechtsprechung | amtliche Werke (§ 5 UrhG), API CC |
| Clearingstelle EEG\|KWKG, KfW, BAFA, BDEW | FAQ/Voten werden **nur lokal** indexiert (`ingest:clearingstelle`) | **nicht** redistribuiert — das Repo shipped Scraper, keine Korpora |

Code: **MIT**. Generierte Wissensbasis (`knowledge/`) wird lokal gebaut
und nicht eingecheckt.

## Roadmap

- Historische Vergütungssätze (EEG 2000–2014) als Parameter — dann rechnet der
  Ü20-Pfad auch Alt-Vergütungen nach
- Hybrid-Retrieval: Vektor-Reranking (jina-embeddings-v2-base-de) über dem BM25-Index
- Catala-Kompilierung in CI (Spezifikation → ausführbare Verifikation)
- Neuro-symbolische Rückverifikation von LLM-Subsumtionen
- NeuRIS-API-Anbindung, sobald produktionsreif (ELI-kompatible IDs sind vorbereitet)
- **B2B-Ausbau** (gehostet, Agent-SDK): Kanzlei-Dashboards, Portfolio-§52-Batch für
  Stadtwerke, Kundenanlage-Migrations-Assessments — auf denselben `data/`-Schemas

## Web-App (fink)

`bun ui/server.ts` startet die fink-Web-App (Design-System in `ui/fink/`) samt
REST-API auf http://localhost:3475 — die `/api/*`-Endpunkte rufen **dieselben
Engine-Funktionen wie die MCP-Server** auf (Normsuche, §100-Resolver,
Querverweis-Kaskade, Förder-Matcher). Nichts ist gemockt. Hinweis: die
Gilmer-Fonts sind kommerziell lizenziert und nicht im Repo
(`ui/fink/assets/fonts/README.md`).

## Mitmachen

Der wertvollste Beitrag ist **Daten-Kuratierung**: Parameter verifizieren
(`ZU VERIFIZIEREN`-Hinweise), Förderprogramme ergänzen, Benchmark-Fragen mit
Quellen einreichen, Workflows für neue Fall-Typen schreiben. Jede Daten-Änderung
braucht eine Quelle und muss `bun run validate:data` bestehen.

**Ohne Git-Kenntnisse:** Dateien in `docs/` und `data/` lassen sich direkt im
GitHub-Web-Editor bearbeiten (Datei öffnen → Stift-Symbol → „Propose changes"
erzeugt einen Pull Request). Format je Fundstelle: Aussage · Quelle · Fundstelle
· Abrufdatum.
