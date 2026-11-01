# Pilotfreigabe: offene Entscheidung

Nutzerwunsch: Browser-Test ohne Installation, OpenAI-kompatibler codex-lb-Zugang, Telegram-Nutzungsalarme, eventuell Uploads. Die bestehende Demo ist unter https://eegbot.aiwerke.de/app/ erreichbar; KI-Endpunkt absichtlich gesperrt.

## Betreiberentscheidung

Der Nutzer hat begrenzte Mitnutzung seines Betreiberzugangs freigegeben. Ein eigener dedizierter Codex-LB-API-Key für EEGbot soll dessen Verbrauch von normalen Codex-Sessions trennen. Tester bringen keinen eigenen Provider-Key mit. Schlüssel ausschließlich serverseitig; keine Schlüssel im Chat abfragen.

Gewünschtes Standardmodell: 6.1 Terra; optional wenige Aufrufe 6.1 Sol. Die tatsächlichen verfügbaren Modell-IDs müssen vor Konfiguration am Proxy geprüft werden; keine Aliasnamen erfinden.

Maximal 20 Modellanfragen pro Nutzer. Konservative Auslegung für den Pilot: insgesamt je persönlicher Einladung, nicht täglich neu. Sol-Aufrufe zählen mit; vorgeschlagene Untergrenze maximal 2 Sol-Aufrufe innerhalb derselben 20. Diese Sol-Obergrenze ist Betreiber-unbestätigter Implementierungsdefault, keine zusätzliche Nutzerquote. Quoten atomar und dauerhaft serverseitig zählen, auch über Neustarts hinweg. Keine automatischen Retries, die unbemerkt weitere Anfragen verbrauchen. Browser-Cookie allein ist keine belastbare Nutzeridentität.

## Noch vor Freischaltung zu prüfen

- Separates globales Pilotbudget, Proxy-Key-Zuordnung und unterstützte Verbrauchsmetriken prüfen. Ein eigener Key trennt Zuordnung, nicht notwendigerweise das zugrundeliegende Abo-Kontingent.
- Geschützter Pilotzugang für wenige persönlich eingeladene Tester, zunächst Freitext ohne Dokumentuploads. Telegram nur technische Nutzungsmetadaten. Modell-ID, Auth, Quoten und Verbrauchszuordnung erst real verifizieren, dann Freischaltung melden.
- Tatsächlicher Modellanbieter hinter dem Proxy, dessen Datenverarbeitung und Weitergabe vor Einwilligung nennen. OpenAI-kompatibles Protokoll ist nicht gleich OpenAI als tatsächlicher Empfänger.
- Telegram nur Metadaten übermittelt; Bot/Ziel aus vorhandener Alerts-Integration ermitteln, keine neuen Bot-Accounts oder globalen Änderungen ohne Bedarf.

## Sicherheitsbefunde

Siehe `practical-pilot-notes.md` und `/tmp/eegbot-pilot-audit.md`: globaler Dokumentkontext und unzureichende Herkunftsprüfung schließen eine einfache Freischaltung für mehrere Personen aus. Kein Uploadpilot bis isolierter Speicher, Consent-Snapshot, Herkunftsprüfung, Limits und verifizierte Löschung implementiert sind.

## Keine Vermischung mit der statischen Website

Die neue site/ kann auf GitHub Pages laufen, aber kein Backend oder geheime API-Schlüssel enthalten. Bestehender Server kann nach gesonderter Implementierung einen geschützten Pilot anbieten. Cloudflared und die bestehenden Produktionsdienste wurden hier nicht verändert.
