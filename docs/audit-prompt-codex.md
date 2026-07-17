# Codex-Audit-Prompt — EEGbot

So benutzt du ihn:

```bash
cd ~/Development/EEGbot
codex exec -m gpt-5.6 --sandbox read-only -c model_reasoning_effort=high "$(cat docs/audit-prompt-codex.md)"
```

(Fällt `gpt-5.6` mit HTTP 400 aus, nimm `gpt-5.5`. `--sandbox read-only` = codex darf lesen/greppen, aber nichts ändern.)

Alles ab der Trennlinie ist der eigentliche Prompt — codex liest die Dateien selbst, du musst keinen Code hineinkopieren.

---

Du bist ein strenger, unabhängiger Cross-Vendor-Code-Auditor. Read-only. Du prüfst das Repository EEGbot (ein Legal-AI-Framework für deutsches Energierecht / EEG). Working directory ist das Repo-Root — **öffne und lies die Dateien selbst** (grep, cat, Imports folgen). Kopiere nichts, rate nichts: wenn du eine Zahl oder ein Verhalten behauptest, belege es mit `datei:zeile`.

## Was das Projekt ist

EEGbot beantwortet Fragen zum EEG (Erneuerbare-Energien-Gesetz) deterministisch: Strafzahlungen, Einspeisevergütung, Fristen, Schwellenwerte, Förderprogramme. **Leitprinzip: Die KI rechnet nie selbst — jede Zahl kommt aus einer deterministischen TypeScript-Engine mit Quellenangabe.** Zwei Nutzungsebenen: (1) eine Web-UI mit strukturierten Formularen, (2) Claude Code als agentische Ebene obendrauf. Beide rufen dieselben Engines.

## Wie die Ordner zusammenhängen (die Landkarte)

- **`src/rules/`** — die deterministischen Engines, das Herz. Reine TS-Funktionen, je eine Datei pro Domäne: `sanktion52.ts` (§ 52 Strafzahlung, 10 €/kW/Monat, Verjährung, Heilung), `verguetung.ts` (Einspeisevergütung § 48), `fristen.ts` (Meldefristen), `schwellen.ts` (Leistungsschwellen), `ausgefoerderte.ts` (Ü20-Optionen), `anlagenzusammenfassung.ts` (§ 24), `fahrplan.ts` (Förderprogramm-Matcher), plus Guardrail-Classifier. **Hier liegt die Wahrheit** — jede andere Schicht ist nur ein dünner Adapter darauf.
- **`src/graph/`** — temporaler Normgraph: `query.ts` (normAtDate/crossRefs/diffFassungen/fassungen), `uebergangsrecht.ts` (§-100-Resolver „welche Gesetzesfassung gilt für Anlage X"). Liest aus `knowledge/normgraph.sqlite`.
- **`src/rag/`** — BM25-Normsuche (`suche.ts`) und KI-Intake (`intake.ts`, ruft Anthropic-API, braucht Key).
- **`src/apis/`, `src/lib/`, `src/schemas/`** — Netzbetreiber-Lookup, Hilfsfunktionen, Zod/TS-Typen.
- **`mcp/`** — MCP-Server (Model Context Protocol), die die Engines für Claude Code exponieren: `mcp/rechner/server.ts` (Rechner-Engines), `mcp/wissen/` (Normgraph/Suche), `mcp/daten/`, `mcp/foerder/`, `mcp/dokumente/`. **Die Zod-`inputSchema` in `mcp/rechner/server.ts` sind der verbindliche Input-Contract jeder Engine** — Feldnamen, Typen, enums, required/optional. Alles andere muss dazu passen.
- **`ui/server.ts`** — Bun.serve-HTTP-Server (Port 3475). Serviert die Web-App aus `ui/fink/ui_kits/app/` und stellt REST-Endpunkte `/api/*` bereit, die DIESELBEN Engine-Funktionen wie die MCP-Server aufrufen. React/Babel/d3 werden lokal über `/vendor/*` ausgeliefert (kein CDN, offline-fest).
- **`ui/fink/ui_kits/app/`** — die Web-UI. **No-Build-SPA:** `.jsx`-Dateien werden im Browser von Babel-Standalone transpiliert, es gibt KEINEN Bundler und KEINE import/export-Statements — alle Komponenten teilen sich `window.*`. `index.html` lädt die Scripts in fester Reihenfolge; jede Datei endet mit `Object.assign(window, {...})`. `profil.js` hält ein Anlagenprofil in `localStorage`. `_ds_bundle.js` (nicht in der Liste unten, aber im Ordner) ist das Design-System unter `window.FinkDesignSystem_4f2014` und definiert nebenbei auch ein altes `window.FINK_DATA` (B2B-Mockdaten — sollte von keinem aktiven Screen mehr gelesen werden).
- **`pipelines/`** — Build-Skripte. `ingest-gesetze.ts` holt Gesetzesfassungen (QuantLaw-Snapshots), `build-normgraph.ts` baut `knowledge/normgraph.sqlite`, `build-index.ts` die BM25-Indizes, `ingest-clearingstelle.ts`/`ingest-rechtsprechung.ts` die Zusatzkorpora, `build-eeg2027-entwurf.ts` den Gesetzes-Entwurf, `validate-data.ts` das Daten-Gate. Zusammengefasst in package.json unter `build:knowledge`, `build:eeg2027`, `setup`.
- **`data/`** — committete Quelldaten: `parameters/` (Vergütungssätze, Marktwerte als YAML mit Gültigkeitszeiträumen, append-only), `programs/` (Förderprogramme), `workflows/` (State-Machines), `forms/`, `guardrails/`, `entwuerfe/` (EEG-2027-Entwurf).
- **`knowledge/`** und **`dokumente/`** — **gitignored, NICHT im Repo.** `knowledge/` wird per `build:knowledge` aus `data/` + QuantLaw neu gebaut; `dokumente/` sind private Nutzer-Unterlagen. Wichtig fürs Audit: CI und ein frischer Clone haben diese Ordner NICHT und müssen sie rebuilden — Tests, die von spezifischen gebauten Daten abhängen, sind ein Risiko.
- **`evals/`** — EEG-Benchmark (`run.ts`, 16 deterministische + interpretative Fragen) und Catala-Cross-Check.
- **`.claude/`** — `agents/` (Sub-Agent-Personas: intake, eligibility, compliance-guardrail, eskalation …), `skills/`, `hooks/`. `rules/*.catala_en` (oberste Ebene) sind formale Catala-Spezifikationen als zweite Wahrheit neben `src/rules/`.
- **`docs/`** — Architektur, Deploy-Runbooks, Demo-Drehbuch, Worklog, `ISA.md` (Projekt-Log mit Kriterienliste).

Prüfschema für Contracts: UI-Formular (`.jsx`) → `fetch('/api/...')` → Route in `ui/server.ts` → Engine in `src/rules/*.ts`. Der POST-Body im JSX MUSS zum Zod-Schema in `mcp/rechner/server.ts` passen (das ist derselbe Engine-Input). Weicht er ab, ist das ein Fund.

## Was zuletzt geändert wurde (Fokus, aber nicht ausschließlich)

Ein „B2C-Umbau": die Web-UI wurde von B2B-Mock-Attrappen auf echte Engines verdrahtet.
- **Server:** 5 neue Endpunkte in `ui/server.ts` (`/api/sanktion52` GET+POST, `/api/verguetung`, `/api/fristen`, `/api/schwellen`, `/api/ue20`) plus ein `engine`-Helper, der Engine-Exceptions als HTTP 400 zurückgibt.
- **UI:** neu/umgebaut `profil.js`, `App.jsx`, `shell.jsx`, `index.html`, `Landing.jsx`, `Dashboard.jsx`, `MeineAnlage.jsx`, `Deadlines.jsx`, `Sanktion52.jsx`, `Verguetung.jsx`, `Ue20.jsx`, `Recherche.jsx`. Alte Dateien `Login.jsx`, `Assets.jsx`, `AssetDetail.jsx`, `Reports.jsx`, `data.js` liegen noch im Ordner, werden aber von `index.html` NICHT mehr geladen.
- Referenz-Muster für neue Screens ist `Fahrplan.jsx` (Form links, Ergebnis rechts, `Number()`-Cast vor POST).

Prüfe primär diese Dateien, aber melde auch echte Defekte, die dir anderswo auffallen.

## Prüf-Schwerpunkte (finde echte Defekte, keine Stil-Nörgelei)

1. **Zahlen-Korrektheit:** Werden Engine-Outputs im UI korrekt durchgereicht und formatiert? Achte auf Differenzrechnungen (z. B. geforderte minus berechnete Summe), das Muster `String(x).replace('.', ',')` (bricht das bei Ganzzahlen, mehreren Punkten, negativen oder undefined-Werten?), `toLocaleString('de-DE')`-Annahmen, Rundung, `Number("")` → `NaN`.
2. **Input-Contracts:** Passen die aus den `.jsx`-Formularen gesendeten POST-Bodies exakt zu den Zod-Schemas in `mcp/rechner/server.ts`? Feldnamen, Typen, enum-Werte, required vs. optional. Werden leere optionale Felder WEGGELASSEN statt als `""` gesendet (Zod `.optional()` akzeptiert kein `""` für ein Datum/Number)?
3. **`engine`-Helper (`ui/server.ts`):** Fängt er ausnahmslos alles als HTTP 400 — auch echte Programmierfehler oder kaputtes JSON? Passiert `await req.json()` innerhalb oder außerhalb des try? Verschleiert das 500er? Vertretbar oder Fund?
4. **localStorage-Profil (`profil.js` + Leser):** Schema-Drift (altes gespeichertes Profil nach Feldänderung), `JSON.parse` ohne try, Screens die `profil.FELD` ohne Guard lesen, NaN aus leeren Zahlenfeldern.
5. **React ohne Build:** Effect-Dependencies (Screens, die on-mount mit `[]` lesen, aber nach Profilwechsel stale sein könnten; `[profil]`-Effekte), Races bei schnellem Screen-Wechsel (wird ein `aktiv`/`cancelled`-Flag konsequent genutzt?), doppelte Top-Level-`const`/`function`-Namen zwischen Dateien (die teilen sich `window` — Kollision überschreibt still).
6. **Security:** externe Links mit `target="_blank"` ohne `rel="noreferrer"` (Tabnabbing), versehentliche Secrets im Code, `/api/intake` weiterhin durch `EEGBOT_PUBLIC` gated, KEIN neuer Endpunkt, der ungeschützt die Anthropic-API (Kosten) auslöst.
7. **Demo-/Frischer-Clone-Risiko:** Cache-Buster in `index.html` konsistent (`?v=NN` überall gleich?), Verhalten bei leerem localStorage, Tests/Features die auf gitignorete `knowledge/`-Daten mit einem bestimmten Build-Datum angewiesen sind (Zeitbomben), Konsolenfehler.
8. **Konsistenz Doku vs. Code:** Behauptet `docs/` oder `ISA.md` etwas, das der Code nicht (mehr) hergibt? Sind abgehakte ISA-Kriterien durch die genannten Nachweise wirklich gedeckt?

## Ausgabeformat

Gib am Ende NUR ein JSON-Objekt aus (kein Markdown drumherum):

```json
{
  "findings": [
    {"severity": "CRITICAL|MAJOR|MINOR", "file": "pfad:zeile", "title": "…", "detail": "…", "fix": "…"}
  ],
  "verdict": "SHIP|SHIP_WITH_FIXES|BLOCK",
  "summary": "1-2 Sätze"
}
```

- CRITICAL = bricht Kernfunktion, Security-Loch, oder killt die Demo.
- MAJOR = falsche Zahl oder Contract-Bruch in einem realistischen Randfall.
- MINOR = Robustheit/Politur.

Sei präzise mit `file:zeile`. Wenn du nichts findest, sag es — erfinde keine Funde.
