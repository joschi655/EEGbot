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
Modellwissen. **Förderfälle (Wärmepumpe & Co.) laufen über das
`foerderfahrplan`-Tool** (eeg-foerder) — es liefert das komplette Artefakt
(Empfehlung, Reihenfolge-Schritte, Dokumente, Entweder-oder, offene Fragen,
Disclaimer); erkläre dessen Output, statt eigene Fahrpläne zu dichten.
Gesetzestexte kommen IMMER versionsgenau aus dem `eeg-wissen`-MCP
(`norm_at_date`), nie aus dem Trainingswissen — das EEG ändert sich mehrmals pro Jahr.

## KI-Intake in Claude Code (ohne API-Key)

Claude Code IST hier die KI — es braucht keinen zusätzlichen `ANTHROPIC_API_KEY`
(der ist nur für die Web-App-Vorbefüllung, `/api/intake`). Der Weg:

1. Nutzer legt Unterlagen in `dokumente/` → `bun run ingest:dokumente`.
2. DU liest sie über den `eeg-dokumente`-MCP (Suche + Volltext-Extrakt; Pläne/
   Fotos zusätzlich im Original per Read/Vision).
3. DU füllst den strukturierten Fall NUR mit belegbaren Werten aus den
   Unterlagen (je Feld: Quelle + Textstelle nennen); was fehlt, bleibt weg.
4. `foerderfahrplan` (eeg-foerder) rechnet deterministisch; `offene_fragen`
   sagt dir, was du den Nutzer noch fragen musst (nicht mehr!).
5. Bei PLZ: `netzbetreiber_fuer_plz` (eeg-daten) — als Heuristik ausweisen.

Zum Ausprobieren ohne eigene Unterlagen:
`cp docs/beispiel-unterlagen/*.md dokumente/ && bun run ingest:dokumente`
(synthetisches Wärmepumpen-Angebot + Typenschild).

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
  `rules/*.catala_en` (Catala kennt nur en/fr/pl-Syntax) — nie in Prompt-Prosa. (Agent-SDK-Portierbarkeit.)
- Datierte Parameter (`data/parameters/*.yaml`): Jede Änderung braucht `gueltig_von`
  und Quelle. Bestehende Zeiträume nie überschreiben — neuen Zeitraum anhängen
  (OpenFisca-Pattern).
- `bun run validate:data` muss nach jeder Daten-Änderung grün sein.

## Session-Governance

- Nach jeder materiellen Session: `docs/worklog.md` ergänzen.
- Architekturänderungen: `docs/architektur.md` aktualisieren (Spiegel-Regel beachten).
- Vor längeren Läufen: `docs/claude-session-registry.md` prüfen.
- Neue Quellen: `docs/source-inventory.md` ergänzen.
