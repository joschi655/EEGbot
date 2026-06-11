# Architektur — EEG-Kompass

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
| Experience | Claude Code (Chat) — B2C-Frontend folgt später auf denselben Schemas |
| Orchestrierung | Skills: `Intake` (Fall-Strukturierung + Routing) → `Workflow`-Runner (interpretiert `data/workflows/*.yaml` State-Machines) |
| Deterministische Engines | `src/rules/` (TypeScript) + `rules/*.catala_de` (formale Spezifikation) — §52, Vergütung, §24, Fristen, Schwellen, Ü20, Förder-Matcher, Guardrail-Classifier |
| Agenten | `.claude/agents/`: intake, eligibility, process-navigator, document-prep, compliance-guardrail, eskalation, research |
| Wissens-Layer | `knowledge/`: temporaler Normgraph (SQLite) + BM25-Index, gebaut aus QuantLaw-Snapshots |

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

## OpenFisca-Pattern in TypeScript

`data/parameters/*.yaml` = datierte Zeiträume mit Quelle je Wert; Engines fragen
immer mit Stichtag ab (`parameterWert(id, datum)`). Invariante: bestehende
Zeiträume werden nie editiert, Änderungen hängen neue Zeiträume an
(`validate:data` prüft Lückenlosigkeit/Überlappung). Das ist OpenFiscas
`formula_YYYY()`-Idee ohne Python-Runtime.

## Catala-Rolle

`rules/*.catala_de` sind formale Spezifikationen (literate programming am
Gesetzestext, prioritized default logic für Ausnahme-von-der-Ausnahme).
Ausführbare Runtime ist v0.1 der TS-Spiegel in `src/rules/` — die Catala-Dateien
sind Referenz + CI-Kompilierziel, sobald die Toolchain eingebunden ist
(Roadmap). Divergenz zwischen Spezifikation und TS-Engine ist ein Bug.

## Guardrails (RDG/StBerG)

Zweistufig: (1) deterministischer Classifier (`data/guardrails/policy.yaml`,
Muster-Matching, < 100 ms) im UserPromptSubmit-Hook — Rot erzwingt Ersatztext +
Eskalation, (2) Compliance-Agent für Gelb (Formulierungs-Prüfung:
Kategorie-Ebene, Unsicherheits-Kennzeichnung, Quellenpflicht). Begründungen je
Kategorie stehen in der Policy (BGH I ZR 113/20 Smartlaw; § 2 RDG; StBerG).

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
