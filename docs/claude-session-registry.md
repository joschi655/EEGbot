# Claude-Session-Registry

Working Set der letzten nützlichen Sessions (max. 5, älteste fliegt raus).
Vor längeren Läufen prüfen, ob eine bestehende Session fortgesetzt werden kann.

| Datum | Thema | Ergebnis | Wiederverwendbar für |
|---|---|---|---|
| 2026-06-12 | v0.1.0 Initial Build (Phasen 0–5) | Komplettes Framework, 40 Tests grün, Benchmark 16/16 | Folge-Phasen, Bugfixes, Daten-Kuratierung |

## Session 2026-06-12-b — EEGbot-Migration + Dokumente-Layer
- Repo nach github.com/joschi655/EEGbot migriert (History erhalten)
- Nutzer-Dokumenten-Ingestion (PDF/OCR/Vision) + eeg-dokumente MCP + Unterlagen-Skill
- Pipelines clearingstelle/rechtsprechung/markt/ausschreibungen gebaut + real verprobt
- docs/user-guide.md neu; architektur.md RAG-Topologie; setup-Skript

## Session 2026-06-12-c — Catala-CI
- Befund: kein catala_de — Spezifikationen auf catala_en portiert (§52 neu, §24 ersetzt)
- Cross-Check evals/catala-crosscheck.ts: 24/24 im arm64-Container verifiziert (clerk run)
- CI-Job catala (setup-ocaml@v3, opam catala.1.2.0); clerk-Artefakte gitignored
