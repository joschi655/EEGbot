# Architektur — EEGbot

> Spiegel-Regel: Materielle Änderungen hier UND in der Team-Knowledgebase
> (Obsidian `AI Werke/EEG Jura KI/Research/Agent Framework Architektur.md`) nachziehen,
> plus Eintrag in `docs/worklog.md`.

## Leitprinzip

**Deterministisch, wo Recht oder Prozess eindeutig sind; agentisch, wo Synthese,
Auslegung oder Nutzerführung gebraucht wird.** Die Trennlinie verläuft auf
Schritt-Ebene, nicht auf Agenten-Ebene — jeder Workflow mischt Tool-Schritte
(deterministisch) und Agent-Schritte (LLM) explizit im YAML.

## Schichten

| Schicht | Implementierung |
|---|---|
| Experience | Zwei Ebenen, ein Produkt: **Web-UI** (`bun ui/server.ts` → `/app/`, React/Babel/d3 lokal über `/vendor/*`, läuft ohne Netz) mit 10 B2C-Screens live gegen die Engines — Übersicht, Meine Anlage (versioniertes localStorage-Profil), Fristen, Rückforderungs-Check (§ 52), Vergütung, Solarspitzen, Ü20, Förder-Fahrplan, Recherche, Norm-Graph. **Claude Code** als agentische Ebene obendrauf (eigene PDFs, Freitext, Workflows, RDG-Guardrail). REST-Wrapper in `ui/server.ts`: `/api/{frage,fahrplan,intake,intake/vorschau,norm,cascade,uebergangsrecht,graph,sanktion52,verguetung,fristen,schwellen,solarspitzen,ue20,status}`. Rechner-REST und MCP verwenden dieselben Zod-Contracts aus `src/schemas/rechner.ts`; JSON-Fehler liefern 400, Contract-/Fachablehnungen 422 und unbekannte Fehler 500. Die optionale Anthropic-Extraktion verlangt Vorschau plus Einwilligung. Gehostet: fink.aiwerke.de (B2B-Artefakt, gepinnt) + eegbot.aiwerke.de (B2C, hinter Cloudflare Access) |
| Orchestrierung | Skills: `Intake` (Fall-Strukturierung + Routing) → `Workflow`-Runner (interpretiert `data/workflows/*.yaml` State-Machines) |
| Deterministische Engines | `src/rules/` (TypeScript) + `rules/*.catala_en` (formale Spezifikation) — §52, Vergütung, §24, Fristen, Schwellen, Solarspitzen (§§ 9/51/51a), Ü20, Förder-Matcher, Guardrail-Classifier |
| Agenten | `.claude/agents/`: intake, eligibility, process-navigator, document-prep, compliance-guardrail, eskalation, research. Ohne `tools`-Allowlist: sie erben sämtliche Built-ins und freigegebenen MCPs der Hauptsession. |
| Wissens-Layer | `knowledge/`: temporaler Normgraph (SQLite) + 4 BM25-Indizes (Normen, Clearingstelle, Rechtsprechung, Nutzer-Dokumente), gebaut aus QuantLaw-Snapshots, Clearingstelle, Open Legal Data und `dokumente/` |
| Dokumente-Layer | `dokumente/` (privat, gitignored): PDF-Extraktion (unpdf), OCR (tesseract.js deu+eng), DOCX/TXT, Bilder/Pläne → Claude-Vision-Routing; MCP `eeg-dokumente`. Speicherung/Suche laufen lokal, gelesene Treffer und Originale gelangen jedoch in den Modellkontext des konfigurierten Anbieters. |

## Temporaler Normgraph (SAT-Graph-RAG-Pattern, arXiv 2505.00039)

- **Work** (Gesetz) vs. **Expression** (Norm in konkreter Textfassung mit
  Gültigkeitsfenster). Expressions entstehen durch Kollabieren aufeinanderfolgender
  QuantLaw-Snapshots: neuer Knoten nur bei Textänderung.
- **Querverweise** werden per Regex extrahiert (`§ X Abs. Y [Gesetz]`) und als
  Kanten gespeichert → Multi-Hop-Navigation (`cross_refs`, Tiefe ≤ 3).
- **Genauigkeits-Grenze:** `fassung_von/bis` sind Snapshot-Daten (Raster:
  2020-06, 2021-01, 2023-01, 2024-06, 2025-04, heute), keine juristischen
  Inkrafttretensdaten. Für Stichtagsfragen zwischen Snapshots gilt der davor
  liegende Snapshot. Fassungen vor Juni 2019 (EEG 2000–2014) sind nicht im
  Archiv — der §100-Resolver weist das ehrlich aus (`volltext_verfuegbar: false`)
  und verweist auf die Arbeitsausgaben der Clearingstelle.
- **Deterministische API** (Pattern „Deterministic Legal Agents", arXiv 2510.06002):
  `norm_at_date`, `fassungen`, `diff_fassungen`, `cross_refs`,
  `resolve_uebergangsrecht` — komponierbare Primitive statt freier LLM-Suche.
- **EEG-2027-Entwurf (opt-in):** `bun run build:eeg2027` legt die kuratierten
  RefE-Kernänderungen (`data/entwuerfe/eeg-2027-refe.json`, sinngemäß + quellen-
  belegt) als Snapshot `2027-01-01` in den Graphen. Invariante: der Entwurf wird
  als **Overlay über den letzten Voll-Snapshot** erzeugt — ein Teil-Snapshot
  würde alle nicht kuratierten Normen fälschlich schließen (Regressionstest
  `src/graph/eeg2027.test.ts`). Jede Entwurfs-Norm trägt den ENTWURF-Marker in
  Titel und Text; Stichtags-Queries für heute bleiben unberührt.
- **Norm-Graph-Visualisierung:** `GET /api/graph?stichtag=…[&fall=…&tiefe=…]`
  aggregiert Knoten (je enbez) + Querverweis-Kanten zum Stichtag; der fink-Screen
  „Norm-Graph" rendert das Netz (Canvas + d3-force) mit Zeitreise-Slider und
  Fall-Modus (crossRefs-Umgebung der Seeds, alles andere gedimmt).

## OpenFisca-Pattern in TypeScript

`data/parameters/*.yaml` = datierte Zeiträume mit Quelle je Wert; Engines fragen
immer mit Stichtag ab (`parameterWert(id, datum)`). Invariante: bestehende
Zeiträume werden nie editiert, Änderungen hängen neue Zeiträume an
(`validate:data` prüft Lückenlosigkeit/Überlappung). Das ist OpenFiscas
`formula_YYYY()`-Idee ohne Python-Runtime.

## Catala-Rolle

`rules/*.catala_en` sind formale Spezifikationen (literate programming am
Gesetzestext, prioritized default logic für Ausnahme-von-der-Ausnahme) für die
rechnenden Normen: § 52 (Satzbestimmung/Zusatzmonate/Exposure-Formel) und § 24
(Entscheidungsbaum inkl. Solarpaket-I-Rückausnahmen). **Wichtig:** Catala
unterstützt als Oberflächensyntax nur en/fr/pl — die Keywords sind englisch,
der annotierte Gesetzestext bleibt deutsch (eine frühere `.catala_de`-Datei war
Pseudo-Syntax und wurde ersetzt).

Ausführbare Runtime bleibt der TS-Spiegel in `src/rules/`. Die CI (`catala`-Job)
installiert den Compiler via opam, interpretiert die Test-Scopes der
Spezifikationen (mit `assertion`-Ankern) und rechnet dieselben Szenarien per
`evals/catala-crosscheck.ts` durch die TS-Engines gegen — **Divergenz zwischen
Spezifikation und Engine bricht den Build.** Kappung (Abs. 5), Verjährung
(Abs. 6) und Monats-Iteration sind bewusst nur in TS (Kalender-/Listenlogik);
die Cross-Check-Szenarien sind so gewählt, dass sie nicht greifen.

## Guardrails (RDG/StBerG)

Dreistufig: (1) deterministischer Classifier (`data/guardrails/policy.yaml`,
Muster-Matching, < 100 ms) im UserPromptSubmit-Hook; sein Ampelbefund wird ohne
Prompttext sitzungsbezogen im geschützten System-Temp-Verzeichnis abgelegt.
(2) Ein Stop-Hook validiert `last_assistant_message`, bevor Claude den Turn
beendet: Rot verlangt klare Ablehnung + passenden Eskalationsweg und darf keinen
ROT-Trigger wiederholen; Gelb verlangt Unsicherheitskennzeichnung, Norm/Fassung
oder Fundstelle, Eskalationsoption und RDG-Disclaimer. Bei Verstoß erhält Claude
`decision: block` und muss neu formulieren. (3) Der Compliance-Agent hilft bei
gelben Grenzfällen. Begründungen je Kategorie stehen in der Policy (BGH I ZR
113/20 Smartlaw; § 2 RDG; StBerG).

## RAG-Topologie — wo welcher Index läuft

Speicherung, Indexierung und Retrieval laufen **lokal** (bun:sqlite +
MiniSearch-JSON), ohne Embeddings-API. Das bedeutet nicht lokale Inferenz:
MCP-Ergebnisse und per Read/Vision gelesene Dateien werden Teil der
Claude-Code-Sitzung und an den konfigurierten Modellanbieter übertragen. Vier
getrennte Retrieval-Quellen sind über MCP-Server abrufbar:

| Index | Quelle | Datei | Pipeline | MCP-Tool |
|---|---|---|---|---|
| Normen (temporal) | gesetze-im-internet via QuantLaw-Snapshots (+ optional EEG-2027-RefE) | `knowledge/normgraph.sqlite` + `knowledge/index/normen.json` (5 411 Chunks) | `build:knowledge` (+ `build:eeg2027`) | `eeg-wissen` → `suche_norm`, `norm_at_date`, `cross_refs`, `resolve_uebergangsrecht` |
| Clearingstelle | clearingstelle-eeg-kwkg.de (FAQ + Voten, Detailseiten-Enumeration; Facettensuche ist WAF-geschützt) | `knowledge/clearingstelle.sqlite` + Index | `ingest:clearingstelle` (mehrfach laufen lassen — Drosselung nach ~200 Requests) | `eeg-wissen` → `suche_clearingstelle` |
| Rechtsprechung | Open Legal Data (8 BGH-Kernurteile gezielt + EEG-Breitensuche) | `knowledge/rechtsprechung.sqlite` + Index | `ingest:rechtsprechung` | `eeg-wissen` → `suche_rechtsprechung` |
| Nutzer-Dokumente | `dokumente/` (privat) | `dokumente/.extrakte/` + `knowledge/index/dokumente.json` | `ingest:dokumente` | `eeg-dokumente` → `suche_dokumente`, `dokument_lesen`, `bilder_liste` |

Retrieval ist lexikalisch (BM25, AND-zuerst-OR-Fallback, Fuzzy für
OCR-Fehler) — für juristische Texte mit exakten Paragraphennummern die richtige
Basis. Ohne Stichtag filtert `sucheNormen` auf die **heute** geltenden Fassungen
(nicht `fassung_bis = null` — sonst würde ein künftiger Entwurfs-Snapshot als
geltendes Recht auftauchen; Regressionstest `src/rag/suche.test.ts`).
Vektor-Hybrid (jina-embeddings-v2-base-de via transformers.js) ist als
`Embedder`-Interface in `src/rag/suche.ts` vorbereitet (Roadmap).

## Dokumente-Layer (Nutzer-Unterlagen)

`pipelines/ingest-dokumente.ts` verarbeitet alles in `dokumente/`:
PDF-Textebene (unpdf, pure JS) → Scans per `pdftoppm`-Rasterung + tesseract.js-
OCR (deu+eng; expliziter `workerPath`, sonst löst bun den Worker aus dem
Install-Cache) → Bilder bekommen OCR **und** bleiben als Original im Manifest
fürs Claude-Vision-Lesen (Pläne, Fotos, Handschrift — kein eigener Plan-Parser,
das Modell liest Bilder nativ via Read-Tool) → DOCX via `unzip` →
idempotent über SHA-256-Manifest. Der Skill `Unterlagen` routet: Suche über
BM25-Extrakte, inhaltliches Verständnis über das Originalbild.

Datenschutzgrenze: Dateien, Extrakte und Indizes bleiben auf dem lokalen
Datenträger und sind gitignored. Der Skill weist bei ausdrücklichen
Dokumentenaufträgen auf die Modellübertragung hin; ohne solchen Auftrag verlangt
er vor dem ersten inhaltlichen Zugriff eine Bestätigung. Suche/Chunks gehen vor
Volltext, um die übertragenen Inhalte zu minimieren.

## Distribution

v0.x bleibt bewusst ein eigenständiges Projekt-Repository: Wissensbasis,
Dokumentordner, generierte Indizes, Workflows und Web-App gehören zu einem
abgegrenzten Arbeitsbereich. Die fünf Projekt-MCPs stehen in `.mcp.json` und
werden nach einmaliger Workspace-/MCP-Freigabe von Claude Code gestartet. Ein
Claude-Code-Plugin bleibt Roadmap für eine spätere Installation in beliebigen
Projekten; dafür müssen persistente Datenpfade, Setup/Updates und der Umgang mit
Nutzerunterlagen zuerst plugin-tauglich entkoppelt werden.

## Agent-SDK-Portierbarkeit (B2B-Phase)

Alle Geschäftslogik lebt in `data/`-Schemas (zod) und `src/rules/`-Funktionen —
nichts davon hängt an Claude Code. Portierung = MCP-Server-Wrapper gegen
Agent-SDK-Tasks tauschen; Workflows (YAML-State-Machines), Engines, Parameter
und Guardrail-Policy bleiben identisch. Bewusst vermieden: Claude-Code-Features
in Business-Logik, Prompt-Prosa als Regelquelle, Runtime-State im Repo.

## Bewusste Nicht-Ziele v0.1

- Keine PDF-/Portal-Automatisierung (Document-Prep liefert Checklisten + Vorbefüllungs-Mapping)
- Kein Vektor-Embedding (BM25 + Graph reichen für Norm-Lookup; Hybrid ist Roadmap)
- Keine Redistribution geschützter Korpora (Clearingstelle/Verbände) — nur Verweise
- Keine Steuer-/Prozess-/Vertragsberatung (Guardrail-Policy, hart)
