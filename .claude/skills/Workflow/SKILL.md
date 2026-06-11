---
name: Workflow
description: Generischer Runner für die State-Machines in data/workflows/*.yaml (Balkonkraftwerk, PV-Dach, Ausgeförderte/§52-Check, Wärmepumpen-Förderung, …). USE WHEN ein strukturierter Fall vorliegt (vom Intake-Skill) und ein Workflow ausgeführt werden soll.
---

# Workflow-Runner — interpretiert data/workflows/*.yaml

Workflows sind DATEN. Dieser Skill führt jede State-Machine aus, die dem Schema
`src/schemas/workflow.ts` entspricht. Neuer Fall-Typ = neue YAML-Datei, kein neuer Skill.

## Ausführungsregeln

1. Lies die Workflow-YAML. Beginne bei `start`. Führe Schritte strikt in
   Transition-Reihenfolge aus; `zu: ende` beendet den Workflow.
2. **Schritt-Typen:**
   - `tool` → rufe das angegebene MCP-Tool auf (`server` + `name`); mappe Argumente
     gemäß `args_aus_fall` aus dem Fall; schreibe das Ergebnis unter `ergebnis_feld`
     in den Fall. NIEMALS Werte schätzen, die das Tool liefert — bei Tool-Fehler:
     Fehler transparent nennen und Schritt als blockiert markieren.
   - `nutzer_input` → frage GENAU die `benoetigte_felder` (bereits bekannte
     überspringen), aktualisiere den Fall.
   - `agent` → erfülle `agent_aufgabe.beschreibung`; lade `pflicht_quellen` ZUERST
     über das `eeg-wissen`-MCP (suche_norm / norm_at_date). Bei `subsumtion: true`:
     Einschätzung ausdrücklich als unsichere Auslegung kennzeichnen + Eskalationsoption.
   - `hinweis` → gib `hinweis_text` wieder (Platzhalter `{fall.x}` ersetzen) — Text
     nicht inhaltlich verändern, er ist RDG-geprüft.
   - `eskalation` → Eskalations-Agent (`.claude/agents/eskalation.md`) erstellt das
     Übergabe-Paket an `eskalation_an`.
3. **Transitions** mit `wenn`-Bedingung deterministisch auswerten:
   `bun run pipelines/eval-bedingung.ts '<wenn-json>' '<fall-json>'`.
   Erste zutreffende Transition gewinnt; ohne `wenn` = sonst-Zweig.
4. **Quellenpflicht:** Jede Rechtsaussage im Output trägt Norm + Fassung (aus den
   Tool-Antworten: `fassung_von`/`fassung_bis`, `quellen`, `norm`).
5. **Abschluss:** Ergebnis-Zusammenfassung mit (a) was festgestellt wurde,
   (b) was der Nutzer als Nächstes tut (konkrete Schritte + Formulare),
   (c) was Fachpersonen klären müssen, (d) Disclaimer aus
   `data/guardrails/policy.yaml`.

## Verfügbare MCP-Server

`eeg-wissen` (Normen, Übergangsrecht, Suche) · `eeg-rechner` (§52, Vergütung, §24,
Fristen, Schwellen, Ü20) · `eeg-foerder` (Programme, Kumulierung, Formulare) ·
`eeg-daten` (MaStR-Suche, Marktwerte, DIP, Gebotstermine)
