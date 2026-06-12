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
