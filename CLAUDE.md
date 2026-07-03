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

## Offene Hausberatung (kein vorgegebener Maßnahmen-Typ)

Der Nutzer muss NICHT wissen, dass er „eine Wärmepumpe" oder „§ 52" braucht.
Wenn er nur allgemein fragt (*„Was kann ich an meinem Haus machen / fördern
lassen / verbessern?"*), führe eine **entdeckende Beratung**:

1. **Nicht nach einem Maßnahmen-Typ fragen, sondern das Haus erfassen** —
   Baujahr, Heizung (Typ/Alter), Dämmstand, Dach/Ausrichtung, Eigentum/
   selbstgenutzt, ungefähres Einkommen, PLZ. So viel wie möglich aus den
   Unterlagen (siehe unten), den Rest gezielt erfragen.
2. **Breit matchen statt eng:** `foerderfahrplan` bzw. `programme_matchen`
   über die plausiblen Maßnahmen (Heizungstausch, Dämmung, PV, Balkonkraftwerk,
   Ü20-Weiterbetrieb …) laufen lassen und dem Nutzer die **Palette** zeigen —
   „das kommt für dich in Frage, das lohnt sich vermutlich, das ist ausgeschlossen
   weil …", jeweils mit Fördersatz und Quelle. Erst danach in den Detail-Fahrplan
   der gewählten Maßnahme wechseln.
3. Reihenfolge/Kumulierung über Maßnahmen hinweg mitdenken (z. B. Hülle vor
   Heizung? iSFP zuerst?) — deterministisch aus den Programm-/Kumulierungsdaten.

Die Beratung endet NICHT bei „was passt" — sie deckt drei weitere Achsen ab:

**a) Was kostet das ungefähr?** Zu jeder Maßnahme eine grobe Kostenspanne
nennen — Investitionskosten (nicht nur den Fördersatz), Förderung abziehen,
Eigenanteil zeigen, und wo sinnvoll die Amortisation über eingesparte
Energiekosten. **Kosten sind kein Recht:** Sie kommen aus einer
quellenbelegten Kostenspannen-Tabelle (typische €/kW, €/m², €/Anlage — bei
Bedarf als `data/parameters/kostenspannen.*.yaml` anlegen, mit Quelle + Datum),
nie aus dem Modellwissen geschätzt. Immer als **unverbindliche Orientierung**
kennzeichnen und auf ein echtes Fachbetrieb-Angebot verweisen (das ist ohnehin
ein Nutzer-Auftrag, siehe unten). Steuerliche Wirkung nur allgemein (StBerG).

**b) Effizienter & autarker werden — der Gesamtpfad.** Der Nutzer will oft
nicht eine Einzelmaßnahme, sondern „mein Haus besser/unabhängiger machen".
Denke den sinnvollen Pfad mit: Verbrauch senken (Dämmung, Fenster,
Heizungsoptimierung, hydraulischer Abgleich) → effizient erzeugen (Wärmepumpe,
PV) → speichern/steuern (Batteriespeicher, Warmwasser-/Wärmespeicher, HEMS/
Energiemanagement, Wallbox mit Überschussladen) → Autarkiegrad/Eigenverbrauch
grob einordnen. Reihenfolge-Logik gilt auch hier (erst Hülle, dann Heizung
dimensionieren). Alles Deterministische (Fördersätze, Fristen) bleibt Engine;
Dimensionierung/Auslegung ist Fachplaner-Sache → als Nutzer-Auftrag ausweisen.

**c) Gemeinsam nutzen — Strom-Sharing mit Nachbarn.** Aktiv als Option
einbringen, wenn Mehrparteienhaus/WEG/Quartier im Spiel ist: **Mieterstrom**
(§ 21 EEG / § 42a EnWG), **Gemeinschaftliche Gebäudeversorgung** (§ 42b EnWG,
Solarpaket I) und das kommende **Energy Sharing / gemeinschaftliche
Eigenversorgung** (EU RED II Art. 21/22 — Umsetzungsstand prüfen, nicht als
geltend behaupten). Je Modell: wer darf teilen, welche Messung/Zähler, welche
Verträge, Zuschläge/Vergütung — versionsgenau aus `eeg-wissen`, mit Fassung.
Das ist ein starker „Zugang zum Recht"-Baustein und deckt sich mit Sophias
Benchmark-Frage b19 (Mieterstrom vs. GGV).

## Dokumente sind der Hebel — aktiv einfordern und Aufträge vergeben

Gute Beratung braucht gute Unterlagen. Das Tool wartet nicht passiv, sondern
**sagt dem Nutzer, was ihm noch fehlt und was helfen würde:**

1. **Zuerst die vorhandenen Unterlagen ausschöpfen** (`eeg-dokumente`-MCP,
   Skill `Unterlagen`): Fall-Felder daraus belegen, bevor du fragst.
2. **Fehlende, aber entscheidungsrelevante Dokumente benennen** — konkret und
   begründet: *„Für den Effizienzbonus brauche ich das Datenblatt der Wärmepumpe
   (Kältemittel/Wärmequelle). Für den Einkommensbonus den Steuerbescheid (zvE).
   Für die anwendbare EEG-Fassung die Inbetriebnahme-Bestätigung."* Nutze die
   `offene_fragen` des Fahrplans + die `benoetigte_formulare`/`human_only`-Felder
   als Grundlage — nichts erfinden.
3. **Nutzer-Aufträge vergeben für alles, was das Tool NICHT selbst kann**, aber
   die Beratung verbessern würde — als klare To-do-Liste: Angebot vom
   Fachbetrieb einholen, iSFP beim gelisteten Energieberater beauftragen
   (dena-Liste), Verbrauchsdaten der letzten Jahre heraussuchen, Netzbetreiber
   der letzten Stromrechnung entnehmen, MaStR-Registrierung prüfen. Je Auftrag:
   **warum** es gebraucht wird und **was es freischaltet** (welcher Bonus, welche
   Frist, welche Fassung). Die RDG-/StBerG-Grenze bleibt: Aufträge sind
   Besorgungs-/Beratungs-Hinweise, keine Rechts-/Steuerstrategie.

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
