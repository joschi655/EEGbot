# Praktischer Pilot: Übergabe an Build und Review

Nur Planung und geprüfte Befunde; keine Proxy-, Key-, Upload- oder Deployment-Freigabe. Bestehende öffentliche Demo nicht als fertigen KI-Pilot darstellen. Gestaltung: zurückhaltend, konkret, verständliches Deutsch. Andere Worker besitzen site/, README und Tests; diese wurden von diesem Audit nicht geändert.


## Parent-Befunde (übernommen)

# Important verified parent findings
Public app EXISTS and responds unauthenticated: https://eegbot.aiwerke.de/app/ -> HTTP200, no redirect. GET /api/status -> normgraph,normen_index,clearingstelle,rechtsprechung vorhanden; dokumente fehlt. README hides this! docs/deploy-eegbot-b2c.md describes /opt/eegbot-b2c port3476. fink separately live. Do NOT modify deployments or Cloudflared. Landing should link existing app as existing demo, with accuracy/freshness and KI availability limits, not assert only local app exists. Need browser verify full use before endorsing. Repo docs/source-inventory.md still says verification July15 and solar tariffs only through July31; cannot market as up-to-date for November2026. Parent running fresh bun run setup log /tmp/eegbot-clean-setup.log. Agent browser timed out; will try Playwright directly. Research /tmp/eegbot-user-journeys.md forthcoming. Please read these findings before final implementation.


## Nutzer-Steuerung (übernommen)

USER STEERING MID-TURN: 'Schauen dass es nicht zu KI generiert wirkt bitte. Vielleicht sogar eine Test Version wo man gar nichts installieren muss, sondern über claudex-lb proxy das OpenAI abp angesprochen wird (eigener API Key) aus und solange ich irgendwie benachrichtigt werde über meinen Telegram alert bot oder so ob das überhaupt benutzt wird und dann können Leute da ihr ihre Daten eingeben und das mal testen vielleicht sogar Dateien hochladen'. Parent asked whose key (central owner vs BYOK), do NOT wire proxy/upload production yet. Keep design understated editorial, honest concrete plain German no AI promotional generic text. New finding public existing app https://eegbot.aiwerke.de/app/ works HTTP200, keys disabled likely; /tmp/eegbot-parent-findings.md has evidence. Parent tested via Playwright executablePath /home/ubuntu/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome because default downloaded executable missing. Read parent findings before finalizing.


## Eigenständiger Pilot-Audit

# EEGbot: begrenzter, installationsfreier Pilot — Audit

## Urteil und verifizierter Iststand

**Vorhandene öffentliche Demo ja; öffentlicher KI-/Upload-Pilot noch nicht freigabefähig.** Keine Änderungen an Diensten, Proxy, Deployment, Geheimnissen oder App-Code vorgenommen. Keine echten Unterlagen, kein Modellaufruf, keine Telegram-Nachricht. Arbeitskopie und gehostete Instanz können unterschiedliche Commits haben; Deployment-Konfiguration nicht gelesen.

Live mit Playwright/Chromium geprüft: `https://eegbot.aiwerke.de/app/` liefert ohne Anmeldung 200, Titel „EEGbot — Ihr Recht als Anlagenbetreiber“, ohne JS-Seitenfehler. „App starten — ohne Anmeldung“ öffnet wirklich das Dashboard mit Anlagenprofil, Fristen, Rückforderungs-Check, Vergütung, Ü20, Förder-Fahrplan, Recherche und Norm-Graph. Keine fachliche End-to-End-Freigabe daraus ableiten. GET `/api/status`: normgraph/normen_index/clearingstelle/rechtsprechung vorhanden, dokumente fehlt. Synthetisches POST `/api/intake` mit `{}` liefert **403**, „KI-Intake ist auf der öffentlichen Demo deaktiviert“. Das ist eine bestehende installationsfreie Rechner-/Recherche-Demo, kein funktionierender KI-Pilot.

Live steht weiterhin „immer aktueller Rechtsstand“. Das ist nicht belastbar: `docs/source-inventory.md:13–20` nennt Prüfstand 15.07.2026 und Tarife nur bis 31.07.2026. Neu gebaute Normindizes allein aktualisieren weder sämtliche Programmdaten noch das gehostete Deployment. Quellenstand, Gültigkeitsintervall und Datenlücken pro Ergebnis anzeigen; keine pauschale Aktualitätszusage.

## Sicherheitsrelevante Quellbefunde

- `ui/server.ts:107–112,160–173`: striktes Intake-Schema, maximal 20.000 Freitextzeichen, ausdrückliches `einwilligung_externe_uebertragung:true`; `EEGBOT_PUBLIC=1` sperrt Intake **und Vorschau**. Dieser Schalter ist kein Login. Ohne exakt diesen Wert ist der Pfad offen; Anwendung prüft derzeit keine Identität, keine Quoten, kein Budget. `Bun.serve` setzt keine expliziten anwendungsspezifischen Body-/Zeitlimits. Andere APIs bleiben öffentlich.
- `src/rag/intake.ts:127–148`: ausschließlich Anthropic `/v1/messages`, serverseitiger Key, 2.000 Ausgabetokens; kein OpenAI-kompatibler Adapter, kein expliziter Abort/Deadline. Fehlertext enthält bis zu 300 Zeichen Providerantwort; `engineResponse` gibt generische Fehler aus, protokolliert aber die Exception (`ui/server.ts:102`). Auch ungültiges Modell-JSON wird mit Antwortausschnitt in Exceptions geschrieben (`intake.ts:227`). Personenbezogene Inhalte können so in Serverlogs landen.
- **Mandantentrennung fehlt:** `intake.ts:81–97,193` lädt standardmäßig das gesamte lokale Manifest; `src/rag/dokumente.ts:10–13` verwendet repo-globale Pfade. Eine bloß freigeschaltete Vorschau könnte vorhandene Unterlagen eines anderen Nutzers offenlegen; Intake könnte sie übertragen. Nicht als Upload-Backend wiederverwenden.
- Vorschau + Checkbox sind bereits vorhanden (`Fahrplan.jsx:298–310,362–380`), aber Empfänger ist fest „Anthropic API“. Vorschau und Intake sammeln den Kontext getrennt; keine Bindung an denselben unveränderten Inhalt. Injizierte `anfrage` umgeht den internen Consent-Check (`intake.ts:205–206`): Ein neuer Provideradapter muss die Prüfung providerunabhängig erhalten. REST prüft derzeit immerhin weiterhin die boolesche Einwilligung.
- **Belegprüfung ist schwächer als beworben:** Katalog/Typen und Ziffern im Zitat werden geprüft, nicht die Existenz von Quelle oder Zitat im übergebenen Dokument. Rein lokaler synthetischer Test mit injizierter Inferenz akzeptierte `massnahme.kosten_eur=38000`, Quelle `nicht-vorhanden.pdf`, Zitat „Kosten 38000 Euro“, obwohl Eingabe keinerlei Kosten enthielt. Kein Modellkontakt. Duplikate bleiben bestehen; echte Herkunftsprüfung und Konfliktbehandlung fehlen.
- Kein Upload-Endpunkt in `ui/server.ts`. `pipelines/ingest-dokumente.ts` ist eine lokale Stapelverarbeitung: Voll-Datei in RAM, Erweiterungsrouting, PDF/OCR/DOCX ohne pilotgerechte Größen-/Seiten-/Laufzeitlimits, globale Indizes, OCR-Tempverzeichnisse ohne sichtbare Löschung im Extraktionspfad. Nicht öffentlich exponieren.
- Claude-Hooks sind keine automatische Web-API-Sicherheitsgrenze. Webserver importiert weder den Prompt- noch den Output-Guardrail. Pilot zunächst auf belegte Feldextraktion + Bestätigung + deterministischen Fahrplan begrenzen, nicht auf offene individuelle Rechtsberatung erweitern.
- Deployment-Dokument `docs/deploy-eegbot-b2c.md:14–45,84–109`: `/opt/eegbot-b2c`, Port 3476, eigener Dienst; Cloudflare Access nur geplant, optionales EnvironmentFile. fink `/opt/eegbot` bleibt separat. Dokumentierter Schalterwechsel allein ist kein hinreichender Pilot-Schutz.

## Kleinstes sinnvolles Pilotpaket (Vorschlag, noch nicht implementieren)

### 1. Entscheidung und Zugang

Zuerst klären: **Betreiber-Key oder BYOK?** Für wenige eingeladene Tester ist ein separat widerrufbarer Betreiber-Key mit hartem Pilotbudget der einfachste Weg. Key ausschließlich serverseitig über geschützte Credentials; nie ins Bundle, HTML, localStorage, URL oder Logs. BYOK ist ein anderes Vertrauens-/Speicherungsmodell: Transport zum eigenen Backend offenlegen, nur kurzzeitig serverseitig je Sitzung halten, keine automatische dauerhafte Speicherung. Keine frei wählbare Proxy-URL im Browser.

Neue explizite Betriebsart `public-demo | invited-pilot`, Default Demo/deny. Bei Pilotstart müssen Auth, Providerziel und Budget gültig sein, sonst fail closed. Invite-only über Cloudflare Access mit enger Allowlist und serverseitiger JWT-Prüfung (Signatur, Issuer, Audience, Ablauf), oder eigene kurzlebige, widerrufbare Einladungssitzungen. Für Cookies Secure/HttpOnly/SameSite, CSRF-/Origin-Prüfung und Logout. Zugang vor Body-Parsing, Dokumentzugriff und Modellaufruf prüfen; Originalserver nicht direkt erreichbar machen. Kein Vertrauen in frei gesetzte Identity-Header. Public-Demo-Modus unverändert lassen, Pilotbereich getrennt schützen.

### 2. Anbieteradapter und Grenzen

Begrenzte Änderungen an `src/rag/intake.ts`, neuem serverseitigen Provideradapter und `ui/server.ts`: fest konfigurierter codex-lb-Endpunkt/Modell, Bearer-Auth, streng validierte OpenAI-Antwort, kein Tool-/URL-Zugriff. Tatsächliche Proxy-Kompatibilität (z. B. `/v1/chat/completions`, unterstützte Parameter und Usage) zunächst gegen lokalen Mock testen; kein unbelegtes Kompatibilitätsversprechen.

Vorgeschlagene Startwerte, vom Betreiber zu bestätigen: 32 KiB JSON-Body, 20.000 Freitextzeichen, insgesamt 24.000 Dokumentzeichen, 2.000 Outputtokens, 45 s Gesamtdeadline, 1 laufender KI-Auftrag je Nutzer/2 global, 10 Aufträge je Nutzer/Tag. Harte globale Tagesgrenze in Requests/Tokens plus ausdrücklich festgelegtes Kostenbudget; ohne verlässliche Preis-/Usage-Daten keine exakten Kosten versprechen. Budget vor Start reservieren, atomar und restartfest zählen; keine automatischen kostenpflichtigen Retries. 413/429/Timeout sauber anzeigen, Abbruch bis zum Upstream weiterreichen, Kill-Switch jederzeit. Alle Routen einschließlich Vorschau und Recherche angemessen begrenzen.

### 3. Vorschau, Consent und Extraktion

Erster Pilot **nur Freitext, keine Uploads**: session-eigenen Kontext explizit übergeben, niemals still das globale Dokumentenmanifest laden. Empfänger korrekt als eigener Proxy und dessen tatsächlich genutzter nachgelagerter Anbieter benennen; Speicher-/Verarbeitungsbedingungen vorher klären. Vorschau als unveränderlichen, kurzlebigen Snapshot mit ID/Digest an Sitzung, Empfänger, Zweck und Consent-Version binden; geänderter Text erfordert neue Zustimmung. Ablehnung bleibt ohne Modellaufruf nutzbar. Kein globales Fallenlassen der Einwilligung bei Providerwechsel.

Dokument-/Freitextinhalte als untrusted data behandeln, Anweisungen daraus nicht ausführen; nur Schema-Felder extrahieren, keine Agent-Tools. Quellen-ID muss zum autorisierten Snapshot gehören, Zitat muss dort wortgetreu vorkommen. Typen, Wertebereiche, Duplikate/Konflikte und Ausgabelänge prüfen. Herkunftsnachweis beweist noch keine sachlich richtige Deutung; Nutzer bestätigt jeden Vorschlag vor Berechnung. Keine Rohantworten oder Belege in Fehlerlogs.

### 4. Uploads erst als getrennte zweite Freigabe

Eigener sitzungs-/nutzergebundener Uploadspeicher außerhalb Webroot, zufällige IDs statt Originalnamen, Eigentumsprüfung bei jedem Lesen/Löschen. Kein Eintrag im repo-globalen `dokumente/` oder Wissensindex. Start eng: TXT und Text-PDF; maximal 3 Dateien, je 5 MiB, gesamt 10 MiB und 20 PDF-Seiten; Limits sowohl am Eingang als auch während des Streams und nach Parsing erzwingen. Extension + MIME + Magic + tatsächlicher Parser, verschlüsselte/kaputte PDFs und Archive/DOCX/Bilder zunächst ablehnen. Keine Remote-URL-Imports, keine aktiven Inhalte. Parser in isoliertem Worker ohne Netzwerk, mit CPU-/RAM-/Zeitgrenzen, max. extrahiertem Text und Prozessbaum-Abbruch. Scan-PDF verständlich ablehnen statt unbegrenzt OCR nachzuladen.

Rohdateien nach Extraktion löschen, Extrakte nur bis Sitzungsende/maximal 24 h; Nutzer-Löschen, Fehler-/Abbruch-Cleanup und Neustart-Sweeper; Löschkonzept schließt Temporärdateien/Backups ein. Grenzen und Frist sichtbar kommunizieren; produktive Umsetzung muss Löschung tatsächlich testen. Modell erhält nur gewählte, in der Vorschau bestätigte Auszüge. Kein öffentliches Download-/Inline-Rendering der Originaldateien.

### 5. Telegram nur Betriebsmetadaten

Neue kleine serverseitige Ereignis-Schnittstelle mit festem Zielchat und separatem Bot-Secret. Ereignisse: Pilot gestartet, Intake erfolgreich/fehlgeschlagen, Budgetschwelle; optional tägliche Zusammenfassung. Zulässig: zufällige Request-ID, Workflow, Zeitpunkt, Dauer, Tokenzahl soweit verfügbar, grobe Fehlerklasse und aggregierte Aufrufzahl. **Keine Namen, IPs, Mailadressen, PLZ, Dateinamen, Texte, Antworten, Quotes oder Schlüssel.** Keine dauerhaft verfolgbare Nutzer-ID nötig. Bounded queue, kurzer Timeout, deduplizierte/rate-limitierte Meldungen; Telegram-Ausfall darf Nutzungsfluss nicht blockieren. Nutzer vorab auf pseudonyme Betriebszählung und Telegram-Metadatenübermittlung hinweisen.

## Freigabenachweise / Zuordnung

Neue Tests müssen ohne echte Keys/Netzaufrufe beweisen: anonym 401/403 ohne Providerkontakt; widerrufene/abgelaufene Einladung; fehlender/geänderter Consent; fremde Dokument-ID; kein globaler Kontext; erfundene Belege verworfen; Body-/Quota-/Concurrency-Limits; Provider-Timeout/Fehler und Log-Redaktion; Telegram-Ausfall; Upload-Typ/Size/Page-/Parser-Limits und Cleanup inklusive Neustart. Bestehende Intake-/REST-Tests decken diese Pilotgrenzen nicht ab.

Erst nach separater Freigabe: Deployment in isoliertem Pilotprozess, Origin/Auth-Prüfung von außen, begrenzter synthetischer Modell-Smoke-Test mit bestätigtem Budget, Kill-Switch/Rollback. Keine Änderung am gemeinsamen Tunnel oder an fink im Rahmen dieses Audits. Dateien für spätere Umsetzung: `ui/server.ts`, `src/rag/intake.ts`, neue Provider/Auth/Quota/Telemetry-Module, `Fahrplan.jsx`, später isoliertes Upload-Modul und Tests; Deployment-/Datenschutzhinweise aktualisieren.
