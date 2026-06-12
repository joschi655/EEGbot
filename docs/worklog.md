# Worklog

## 2026-06-12 — v0.1.0 Initial Build (Phasen 0–5)

- **Phase 0:** Repo-Scaffold — bun/TS, zod-Schemas für programs/workflows/forms/
  guardrails/parameters, Bedingungs-Evaluator, Parameter-Lookup (OpenFisca-Pattern), CI.
- **Phase 1:** Wissens-Layer — QuantLaw-Ingestion (EEG/EnWG in 6 Ständen ab
  2020-06 + MsbG/KWKG/WindBG/RDG aktuell), temporaler Normgraph (1.344 Expressions,
  10.135 Querverweise), §100-Resolver (BGH-XIII-ZR-3/24-Fixture grün), BM25-Index
  (5.390 Chunks), eeg-wissen MCP. Erkenntnis: QuantLaw-Commits sind per API nur bis
  ~2020-06 erreichbar (History vor Mai 2020 nicht über `until`-Queries adressierbar);
  EEG-2017-Volltext via Snapshot 2020-06-01 gesichert.
- **Phase 2:** Engines — §52-Radar (Heilung rückwirkend Nr. 1/3/4/11, Pauschal-2€
  Nr. 9a/10, Zusatzmonate Abs. 4, Kappung Abs. 5, Verjährung Abs. 6 — Mechanik aus
  dem aktuellen Normtext im Graphen verifiziert), Vergütungsrechner (deterministische
  Ablehnung für IBN < 30.07.2022 statt Falschwert), §24-Baum mit
  LLM_SUBSUMTION_ERFORDERLICH-Schnittstelle, Fristen, Schwellen, Ü20-Optionen,
  Guardrail-Classifier. Catala-Spezifikation §24.
- **Phase 3:** Förder-Layer — 4 Programme, 6 Formulare (MaStR-Feldinventar mit
  Fehlerfallen), Matcher + Kumulierungs-Matrix, eeg-foerder/eeg-daten MCPs.
- **Phase 4:** Agentik — 6 Skills, 7 Agenten, Guardrail-/Freshness-Hooks,
  4 Workflow-YAMLs, 5 E2E-Personas.
- **Phase 5:** Changefeed, EEG-Benchmark (16 deterministisch grün + 4 interpretativ),
  README, Docs.

**Offene Verifikationen (`ZU VERIFIZIEREN` in data/parameters/):**
- Vergütungssätze ab 01.02.2026 (rechnerisch fortgeschrieben) gegen BNetzA-Tabelle
- Jahresmarktwerte Solar 2023/2024 gegen netztransparenz.de
- E2E-Personas P1–P5 in frischer Session durchspielen (evals/personas.md)
