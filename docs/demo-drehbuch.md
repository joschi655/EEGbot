# Demo-Drehbuch — „Der 45.538-€-Moment" (Legal Loves Tech, ≤ 5 min)

Rollen: **Sophia pitcht** (Recht), **Johannes fährt die Demo** (Terminal + fink-App),
Jan/Carolin Q&A-Backup. Alle erwarteten Ausgaben unten sind real gegen die
Engines verifiziert (Stand 10.07.2026) — wenn eine Zahl abweicht, zuerst prüfen,
ob sich Parameter-Dateien geändert haben.

## 0 · Vorbereitung (am Vortag + 30 min vor dem Slot)

- [ ] Frischer Clone auf dem Demo-Rechner: `git clone … && cd EEGbot && bun run setup`
- [ ] Zeitmaschine aktivieren: `bun run build:eeg2027`
- [ ] Zwillings-Unterlagen einspielen:
      `cp docs/beispiel-unterlagen-rueckforderung/* dokumente/ && bun run ingest:dokumente`
- [ ] UI starten: `bun ui/server.ts` → http://localhost:3475/app/
- [ ] **WLAN AUS und einmal komplett durchspielen** (UI lädt React/Babel lokal
      über `/vendor/*` — keine CDN-Abhängigkeit mehr; Claude Code selbst braucht
      Netz, also für Akt 2 Hotspot als Fallback bereithalten)
- [ ] Screen-Recording des kompletten Durchlaufs als Backup auf dem Desktop
- [ ] `bun test` (113) + `bun run evals` (16/16) müssen grün sein

## Akt 1 — Problem (60 s, Sophia, Slide)

> „2012 baut ein Landwirt eine PV-Anlage. Er vergisst eine Meldung. 2017
> bestätigt der BGH: Er muss **45.538,55 €** zurückzahlen — VIII ZR 147/16.
> Das Gesetz war öffentlich. Zugang zum Recht scheitert nicht an Geheimwissen,
> sondern an Komplexität: 8 EEG-Fassungen, 175 Paragrafen, über 10.000
> Querverweise. Genau dieselbe Falle existiert heute — sie heißt jetzt § 52."

## Akt 2 — Live: Rückforderungs-Check (120 s, Johannes im Claude-Code-Terminal)

**Setup-Satz (Sophia):** „Das hier sind die Unterlagen eines Betreibers, wie sie
echte Mandanten mitbringen: eine Zahlungsaufforderung des Netzbetreibers über
45.540 €, ein Inbetriebnahmeprotokoll, eine nachgeholte MaStR-Registrierung.
Alles synthetisch, dem BGH-Fall nachgebaut."

**Prompt 1 (tippen):**

```
Prüf die Unterlagen in dokumente/. Der Netzbetreiber fordert 45.540 € nach
§ 52 EEG. Stimmt die Forderung? Rechne nach und zitiere jede Norm.
```

**Erwartete Kernpunkte der Antwort (gegen Engines verifiziert):**

| Punkt | Erwarteter Wert | Quelle im Tool |
|---|---|---|
| Anwendbares Vergütungsregime (IBN 20.10.2022) | **EEG 2021** (Normenkette über § 100 EEG 2023) | `uebergangsrecht`-Tool |
| Verstoß | § 52 Abs. 1 S. 1 Nr. 11 (MaStR), 103,5 kW | Dokumente-Extrakt |
| Zeitraum vor 2023 | **nicht im § 52-Zahlungsregime** (altes Sanktionsrecht, Hinweis) | §52-Radar Hinweis |
| Verjährt (2023er-Monate) | **2.484,00 €** — nur mit Einrede § 52 Abs. 6 S. 3 | §52-Radar |
| Tatsächliches Exposure (geheilt 05.07.2026, rückwirkend 2 €/kW, Nr. 11) | **6.417,00 €** | §52-Radar |
| Differenz zur Forderung | **≈ 39.123 €** zu viel gefordert | Rechnung |

**Punchline (Sophia):** „Der Netzbetreiber hat weder die rückwirkende Heilung
noch die Verjährung gerechnet. Das Tool schon — jede Zahl mit Paragraf und
Fassung. Und wo es etwas nicht weiß, sagt es das: Sachverhaltsfragen bleiben
beim Menschen. Dafür brauchte es 2017 einen BGH-Prozess. Heute: 10 Minuten,
open source, im 20-€-Claude-Abo."

**Fallback:** Screen-Recording; alternativ deterministisch ohne Claude:
`bun -e`-Snippet aus `docs/worklog.md` (Session 2026-07-10) bzw. fink-App
`/api/uebergangsrecht?ibn=2022-10-20`.

## Akt 3 — Wow: EEG-2027-Zeitmaschine (90 s, Johannes im Terminal)

**Überleitung (Sophia):** „Im September liest der Bundestag das EEG 2027 — der
größte Systemwechsel seit 2000. Kommentare dazu gibt es noch nicht. Unser
Normgraph hat den Entwurf schon drin — als Entwurf gekennzeichnet, versteht sich."

**Kommando (tippen):**

```
bun run demo:zeitmaschine
```

**Erwartete Ausgabe (verifiziert):**

- § 21-Fassungshistorie mit 4 Fassungen, letzte `2027-01-01 ⚠️ ENTWURF`
- Diff geltend ↔ Entwurf: „Netzbetreiberabnahme … keine feste Einspeisevergütung mehr"
- IBN 15.12.2026: 12,34 ct/kWh (BNetzA, verifiziert 10.07.2026) → **24.433,20 € über 20 Jahre**
- IBN 15.01.2027 (ENTWURF): ~3,5 ct, ~30 Monate → **866,25 €**
- **„Δ EIN MONAT INBETRIEBNAHME ≈ 23.566,95 € über 20 Jahre"**

**Punchline (Sophia):** „Ein Monat Unterschied beim Inbetriebnahmedatum —
rund 23.500 €. Diese Frage wird ab Herbst millionenfach gestellt. Es gibt keinen
offiziellen Übergangsprüfer dafür. Unserer ist open source."

**Vision-Slide (30 s):** B2C gratis = Zugang zum Recht; B2B auf denselben
Daten-Schemas (Kanzleien, Stadtwerke, Syndizi). QR-Code zum Repo:
„Bringt euren eigenen Claude mit."

## Q&A-Munition

- **„Warum nicht einfach ChatGPT?"** → Split-Screen-Clip: ChatGPT rät einen
  Vergütungssatz, EEGbot rechnet ihn mit BNetzA-Quelle und Fassung. Plus:
  LG Kiel 6 O 151/23 — wer KI-Antworten betreibt, haftet; deshalb rechnen bei
  uns deterministische Engines, nicht das Sprachmodell.
- **„Ist der EEG-2027-Teil nicht spekulativ?"** → Ja, und das Tool sagt es in
  jeder Zeile (ENTWURF-Marker in Titel, Text und Output). Genau so gehen
  Kanzleien heute mit Referentenentwürfen um — nur langsamer.
- **„Woher kommen die Daten?"** → 100 % offen: gesetze-im-internet (QuantLaw),
  Clearingstelle-FAQ, Open Legal Data, MaStR, netztransparenz/SMARD. Kein
  kommerzieller Kommentar-Content.
- **„Was kann es nicht?"** → Subsumtion und Sachverhaltswürdigung — dafür gibt
  es `LLM_SUBSUMTION_ERFORDERLICH`, offene-Fragen-Listen und die RDG-Ampel.
  Ehrlichkeit ist ein Feature, siehe Akt 2.

## Zeitbudget

| Akt | Soll |
|---|---|
| 1 Problem | 0:00–1:00 |
| 2 Rückforderungs-Check | 1:00–3:00 |
| 3 Zeitmaschine + Vision | 3:00–4:30 |
| Puffer | 4:30–5:00 |

Kompletter Durchlauf mit Stoppuhr proben; wenn Akt 2 live > 2:30 läuft →
Recording einspielen, live nur das Ergebnis zeigen.
