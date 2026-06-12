# EEG-Kompass — Betriebsregeln

Open-Source-Framework für deutsches EEG-/Energierecht. Claude Code ist hier die Runtime:
Skills führen Workflows, MCP-Server liefern Wissen und deterministische Berechnungen,
Hooks erzwingen Guardrails.

## Leitprinzip

> **Deterministisch, wo Recht oder Prozess eindeutig sind; agentisch, wo Synthese,
> Auslegung oder Nutzerführung gebraucht wird.**

Niemals einen Wert schätzen oder „aus dem Kopf" berechnen, den ein deterministisches
Tool liefern kann. Vergütungssätze, §52-Sanktionen, Fristen, Schwellenwerte und
Fördersätze kommen IMMER aus dem `eeg-rechner`- bzw. `eeg-foerder`-MCP, nie aus dem
Modellwissen. Gesetzestexte kommen IMMER versionsgenau aus dem `eeg-wissen`-MCP
(`norm_at_date`), nie aus dem Trainingswissen — das EEG ändert sich mehrmals pro Jahr.

## Harte Regeln (Guardrails)

1. **RDG-Grenze:** Dieses Tool liefert Rechtsinformation auf Kategorie-Ebene, keine
   individuelle Rechtsberatung. Der Guardrail-Hook klassifiziert jeden nutzergerichteten
   Output (grün/gelb/rot, `data/guardrails/policy.yaml`). Rot wird blockiert und durch
   eine Eskalationsempfehlung (Anwalt, Clearingstelle, Energieberater, Steuerberater)
   ersetzt. Gelb erfordert den Compliance-Agenten.
2. **Keine Steuerberatung** (StBerG): §35a/§35c-EStG-Themen nur als Programminformation,
   Einzelfallbewertung → Steuerberater.
3. **Subsumtions-Transparenz:** Wenn ein Rechner `LLM_SUBSUMTION_ERFORDERLICH`
   zurückgibt (z. B. „unmittelbare räumliche Nähe", § 24 EEG), wird die LLM-Einschätzung
   ausdrücklich als unsichere Auslegung gekennzeichnet, mit Verweis auf die maßgebliche
   Rechtsprechung (BGH XIII ZR 12/19) und Eskalationsoption.
4. **Quellenpflicht:** Jede materielle Rechtsaussage trägt Norm + Fassung
   (z. B. „§ 24 Abs. 1 EEG 2023 i.d.F. 16.05.2024") oder Fundstelle
   (Clearingstelle-FAQ-Nr., Aktenzeichen).
5. **Freshness:** Wenn `knowledge/` älter als 30 Tage ist, warnt der Freshness-Hook.
   Antworten zu kürzlich geänderten Normen dann nur mit Aktualitätsvorbehalt.

## Workflow-Routing

Nutzeranliegen → `Intake`-Skill (strukturierter Fall) → passende State-Machine aus
`data/workflows/*.yaml` → generischer `Workflow`-Runner. Die Workflows sind Daten,
kein Code: neue Fälle = neue YAML-Datei. Kein Workflow passt → Recherche-Skill,
dann ggf. Workflow-Entwurf vorschlagen.

## Stack-Regeln

- bun/bunx, TypeScript. Keine zusätzlichen Runtimes für Endnutzer.
- Geschäftslogik lebt in `data/`-Schemas (zod-validiert) und `src/rules/` bzw.
  `rules/*.catala_de` — nie in Prompt-Prosa. (Agent-SDK-Portierbarkeit.)
- Datierte Parameter (`data/parameters/*.yaml`): Jede Änderung braucht `gueltig_von`
  und Quelle. Bestehende Zeiträume nie überschreiben — neuen Zeitraum anhängen
  (OpenFisca-Pattern).
- `bun run validate:data` muss nach jeder Daten-Änderung grün sein.

## Session-Governance

- Nach jeder materiellen Session: `docs/worklog.md` ergänzen.
- Architekturänderungen: `docs/architektur.md` aktualisieren (Spiegel-Regel beachten).
- Vor längeren Läufen: `docs/claude-session-registry.md` prüfen.
- Neue Quellen: `docs/source-inventory.md` ergänzen.
