# Demo-Guide fürs Team — EEGbot zeigen (Stand 15.07.2026)

Für die Team-Runde (Jan, Pia, Carolin): drei Stationen, aufsteigend nach
„wie viel Setup braucht der Zuschauer". Gesamtdauer ~15 min plus Fragen.
Der Pitch-Text fürs Hackathon-Finale steht separat in `docs/demo-drehbuch.md` —
dieses Dokument ist der interne Rundgang: was existiert, wie zeigt man es.

## Das Produktmodell in einem Absatz (vorab sagen!)

EEGbot ist EIN Produkt mit zwei Ebenen. **Web-UI** = strukturierte
Anwendungsfälle (Anlage erfassen, Fristen, Rechner) — läuft auf denselben
deterministischen Engines, braucht keinen API-Key. **Claude Code** = agentische
Ebene obendrauf (eigene PDFs verstehen, Freitext, Workflows, RDG-Guardrail) —
nur lokal. Open Core: der gesamte Code ist öffentlich
(github.com/joschi655/EEGbot), lokal kostenlos selbst hostbar; die bezahlte
Version ist dieselbe App gehostet — null Setup, immer aktueller Rechtsstand,
später Accounts (Supabase läuft schon auf unserem Server).

**Wann welche Ebene?** Web-UI, wenn die Frage in ein Formular passt („was darf
der Netzbetreiber fordern?"). Claude Code, wenn Dokumente oder offene Fragen im
Spiel sind („hier ist der Brief vom Netzbetreiber — was mache ich jetzt?").

## Vorbereitung (am Vorabend, ~10 min)

```bash
cd ~/Development/EEGbot
git pull && bun install
bun run validate:data && bun run build:knowledge && bun run build:eeg2027
bun test                      # muss 118 grün zeigen
ls dokumente/                 # BGH-Akte da? sonst: cp docs/beispiel-unterlagen-rueckforderung/* dokumente/
bun run ingest:dokumente      # braucht ANTHROPIC_API_KEY in .env
```

- [ ] `.env` mit `ANTHROPIC_API_KEY` vorhanden (nur für Intake/Claude-Code-Station)
- [ ] `bun ui/server.ts` einmal starten und http://localhost:3475/app/ durchklicken
- [ ] eegbot.aiwerke.de im Browser öffnen, Access-PIN-Login einmal durchspielen
- [ ] WLAN-Fallback: Screen-Recording des Durchlaufs auf dem Desktop

## Station 1 — Claude Code lokal (die agentische Ebene, ~5 min)

Terminal im Repo öffnen, `claude` starten. Zeigen:

1. **Rückforderungs-Check auf echten Unterlagen** (der BGH-Moment):
   ```
   Prüf die Unterlagen in dokumente/. Der Netzbetreiber fordert 45.540 € nach
   § 52 EEG. Stimmt die Forderung? Rechne nach und zitiere jede Norm.
   ```
   Erwartung: Claude liest die synthetische BGH-Akte, ruft den `eeg-rechner`
   MCP auf und landet bei **6.417 €** berechtigter Forderung — mit Verjährung,
   Heilung und Normzitaten. Kernsatz: „Die KI liest, die Engine rechnet."
2. **Zeitmaschine** (ohne Claude, pures Skript):
   ```bash
   bun run demo:zeitmaschine
   ```
   Erwartung: derselbe Fall unter EEG 2023 vs. EEG-2027-Entwurf, Δ ≈ 23.567 € —
   Gesetzesänderungen werden als Geldbetrag sichtbar.
3. Kurz erwähnen, nicht vorführen: RDG-Guardrail (Ampel-Klassifikation jeder
   Antwort), Skills/Agents für Intake, Eskalation, Dokumenten-Checklisten.

## Station 2 — Lokale Web-UI (dieselben Engines, klickbar, ~5 min)

```bash
bun ui/server.ts    # → http://localhost:3475/app/
```

Klickpfad (so aufgebaut, dass jede Zahl live berechnet wird):

1. Landing → **App starten** (kein Login — Accounts kommen mit Supabase)
2. Übersicht → **„Beispiel-Anlage laden (9,8 kWp)"** → KPIs erscheinen live:
   8,2 ct/kWh, Förderende 2043, Schwellen-Befunde als Handlungsbedarf
3. **Meine Anlage** → zeigen: ein Profil (localStorage) füttert alle Screens;
   rechts Rechtsregime-Karte (§ 100 „Versteinerung") + Schwellen-Befunde
4. **Rückforderungs-Check** → **„Beispielfall laden (Forderung 45.540 €)"** →
   **6.417 €** groß, Forderung durchgestrichen, Differenz 39.123 €,
   Monatsaufstellung mit verjährt-Badges — gleiche Engine wie Station 1!
5. **Meine Anlage** → **„BGH-Zwilling laden"** → Übersicht: Vergütung zeigt
   ehrlich „—" mit Erklärung (103,5 kWp > 100 → Direktvermarktung) statt einer
   erfundenen Zahl. Ehrlichkeit ist ein Feature.
6. Je nach Zeit: Vergütung, Nach der Förderung (Ü20), Recherche (Volltext über
   Normen/Clearingstelle/Rechtsprechung — bewusst KEIN Chat), Norm-Graph
   (Zeitreise-Slider bis EEG 2027-E, „45.540-EUR-Fall zeigen")

## Station 3 — eegbot.aiwerke.de (gehostet, ~3 min)

1. https://eegbot.aiwerke.de öffnen → Cloudflare-Access-Login (One-time-PIN an
   Team-E-Mail) — der Schutzwall, solange wir keinen eigenen Login haben
2. Denselben Klickpfad wie Station 2 kurz anreißen — Punchline: **identische
   App, identische Engines, nur gehostet.** Das IST das Geschäftsmodell:
   lokal kostenlos für Selbst-Hoster, gehostet als Produkt.
3. KI-Vorbefüllung im Förder-Fahrplan funktioniert hier mit Server-Key
   (hinter Access ungefährlich); auf fink.aiwerke.de ist sie öffentlich
   deshalb deaktiviert.

## Was ist echt, was ist Roadmap (ehrlich bleiben)

| Echt heute | Roadmap |
|---|---|
| Alle 6 Rechen-Engines deterministisch + bequellt (118 Tests) | Supabase-Login + Profile serverseitig (statt localStorage) |
| Web-UI komplett auf Engines verdrahtet, kein Mock mehr | Mehr Energieträger (Wind/Biomasse-Vergütung vor 2023) |
| Norm-Graph mit 8 Fassungen + EEG-2027-Entwurf | Automatische Gesetzes-Updates als Pipeline |
| Claude-Code-Ebene: Dokumente, Skills, Guardrail | Web-Intake mit eigenem Account-Kontingent |
| Gehostet hinter Cloudflare Access | Öffentlicher Launch (nach Login + Rate-Limits) |

## Troubleshooting

| Symptom | Fix |
|---|---|
| UI-Screens leer / „fehlt"-Meldungen | `bun run build:knowledge && bun run build:eeg2027` |
| Intake-Fehler „ANTHROPIC_API_KEY" | `.env` im Repo-Root anlegen; auf eegbot.aiwerke.de nicht nötig |
| Port 3475 belegt | `lsof -ti :3475 \| xargs kill` |
| Access-PIN kommt nicht | Spam prüfen; E-Mail muss in der Access-Policy stehen |
| Kein WLAN | Screen-Recording; lokale UI + `demo:zeitmaschine` laufen offline |
| Browser zeigt alte UI | Hard-Reload (Cmd+Shift+R) — Cache-Buster steht auf v=74 |
