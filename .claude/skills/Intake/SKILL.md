---
name: Intake
description: Macht aus einer Freitext-Anfrage einen strukturierten Energierechts-Fall und routet ihn in den passenden Workflow. USE WHEN Nutzer beschreibt ein Anliegen zu PV-Anlage, Balkonkraftwerk, Wärmepumpe, Förderung, Einspeisevergütung, MaStR, ausgeförderter Anlage, Strafzahlung, Netzanschluss — oder wenn unklar ist, welcher Workflow zuständig ist.
---

# Intake — Freitext → strukturierter Fall → Workflow-Routing

## Vorgehen (Docassemble-Pattern: nur fehlende Felder fragen, abhängigkeitsgetrieben)

1. **Extrahiere** aus der Nutzeranfrage alles, was schon dasteht, in die Fall-Struktur
   (`src/schemas/common.ts` → `Fall`): `fall_typ`, `eigentumsform`, `anlage.*`
   (energietraeger, leistung_kwp, ibn_datum, anlagentyp, veraeusserungsform,
   mastr_registriert, speicher_vorhanden, imsys_vorhanden), bei Förderfällen
   `massnahme.*`, `gebaeude.*`, `antragsteller.*`.
2. **Bestimme den Fall-Typ-Kandidaten** und lies die `zustaendig_wenn`-Bedingung der
   Workflows in `data/workflows/*.yaml`. Prüfe Bedingungen deterministisch:
   `bun run pipelines/eval-bedingung.ts '<bedingung>' '<fall>'`.
3. **Frage NUR die Felder nach**, die der Ziel-Workflow für seine ersten Schritte
   braucht (stehen je Schritt unter `benoetigte_felder`). Maximal 3–4 Fragen pro
   Runde, mit kurzer Begründung, wofür die Angabe gebraucht wird.
4. **Kritische Klarstellungen immer aktiv prüfen:**
   - IBN-Datum = erstmalige Stromerzeugung, NICHT Zählersetzung — nachfragen, wenn
     der Nutzer „Anmeldung" oder „Zähler" sagt.
   - kWp (Modulleistung) vs. VA (Wechselrichter) bei Steckersolar auseinanderhalten.
5. **Übergib** an den `Workflow`-Skill mit dem strukturierten Fall (JSON-Block) und
   dem Workflow-Namen. Passt kein Workflow → `Recherche`-Skill und dem Nutzer sagen,
   was das System (noch) nicht abdeckt.

## Regeln

- Keine inhaltliche Antwort vor abgeschlossenem Intake — erst Fall, dann Workflow.
- Mehrdeutige Eingaben nie raten: nachfragen (Disambiguierung ist der Kern dieses Skills).
- Der strukturierte Fall wird dem Nutzer am Ende des Intakes als kompakte Tabelle
  gespiegelt („Habe ich das richtig erfasst?").
