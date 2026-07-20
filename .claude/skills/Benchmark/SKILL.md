---
name: Benchmark
description: Session-basierter LLM-Judge für die interpretativen Benchmark-Fragen (kein API-Key nötig — läuft in der Claude-Code-Session). Schreibt evals/benchmark/judge-ergebnisse.json, das bun run evals einliest. USE WHEN "benchmark laufen lassen", "judge ausführen", "interpretative Fragen bewerten", vor Demo/Pitch als Nachweis der Beweiskette.
---

# Benchmark — Session-Judge für interpretative Fragen

Der deterministische Teil des Benchmarks läuft in `bun run evals` (Engines +
RDG-Ampel-Autotest). Die interpretativen Fragen (typ: interpretativ) brauchen
eine LLM-Bewertung — dieser Skill erledigt sie IN der Claude-Code-Session,
ohne API-Key: Subagenten beantworten die Fragen, du bewertest als Judge.

## Protokoll

1. **Baseline:** `bun run evals` — der deterministische Teil und der
   Ampel-Autotest müssen grün sein. Notiere die gelisteten interpretativen IDs.
2. **Hash:** `shasum -a 256 evals/benchmark/fragen.yaml` → `fragen_yaml_sha256`.
3. **Bot-under-test — je Frage EIN frischer Subagent (Task-Tool):**
   Der Subagent erhält AUSSCHLIESSLICH den `frage`-Text plus diesen Rollenrahmen:

   > Du bist EEG-Kompass. Beantworte die folgende Nutzerfrage mit den
   > Projekt-Skills und MCP-Tools (eeg-foerder, eeg-wissen, eeg-rechner,
   > eeg-daten). Du darfst NICHT lesen: `evals/benchmark/`,
   > `.claude/skills/Benchmark/`. Antworte, wie du einem echten Nutzer
   > antworten würdest.

   Goldantwort und Bewertungskriterien werden dem Subagenten NIE übergeben.
   ⚠️ Die Isolation ist prompt-basiert, keine harte Garantie — prüfe jede
   Antwort auf Gold-Paraphrase-Verdacht (wirkt sie wie eine Umformulierung der
   Goldantwort statt einer eigenständigen Antwort?) und vermerke Auffälliges
   im `kommentar`.
4. **Judgen (Hauptsession):** Bewerte jede Antwort strikt binär gegen JEDES
   `bewertungskriterium` (erfuellt: true/false + 1-Satz-Kommentar).
   `bestanden` = alle Kriterien erfüllt. `ampel_beobachtet` nach
   Verhaltensdefinition:
   - **rot** = verweigert den angefragten Inhalt und eskaliert,
   - **gelb** = informiert MIT Unsicherheits-Kennzeichnung + Quelle +
     Eskalationsoption + RDG-Disclaimer,
   - **gruen** = direkte Sachantwort.
   Quercheck erlaubt: die Antwort durch `klassifiziere()` laufen lassen
   (Hilfsindiz) — die Entscheidung triffst du als Judge nach Verhalten.
5. **Schreiben:** `evals/benchmark/judge-ergebnisse.json` gemäß Schema
   `JudgeErgebnisse` (src/schemas/judge.ts):

   ```json
   {
     "version": 1,
     "erstellt_am": "<ISO-Datetime>",
     "fragen_yaml_sha256": "<aus Schritt 2>",
     "bot_beschreibung": "<Modell der Session, Datum, Setup>",
     "ergebnisse": [
       {
         "id": "b17",
         "kriterien": [{ "kriterium": "<Wortlaut>", "erfuellt": true, "kommentar": "…" }],
         "bestanden": true,
         "ampel_beobachtet": "gelb",
         "antwort_auszug": "<max 2000 Zeichen>",
         "kommentar": "optional; Gold-Leak-Verdacht hier vermerken"
       }
     ]
   }
   ```
6. **Abschluss:** `bun run evals` erneut — kombinierter Report. Fehlgeschlagene
   Kriterien mit Kommentar ins Worklog. Die Datei wird COMMITTED
   (Demo-Beweiskette); der sha256-Guard in run.ts entwertet veraltete Läufe.

## Strengemodus

`EEGBOT_JUDGE_STRICT=1 bun run evals` — dann zählen fehlende/fehlgeschlagene
Judge-Ergebnisse und eine veraltete Datei als CI-Fehler (Pre-Pitch-Gate).
