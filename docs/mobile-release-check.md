# Mobile Releaseprüfung

## Öffentlicher Iststand vor Änderungen

Mit echtem Chromium/Playwright gegen `https://eegbot.aiwerke.de/app/` geprüft; nur synthetische Browserprofile, keine persönlichen Daten und keine Modellaufrufe.

- Bei konfigurierten 360 und 390 CSS-Pixeln verbreitert sich die Landingpage auf 405 Pixel.
- Bei konfigurierten 390 Pixeln verbreitert sich das Dashboard auf 510 Pixel.
- Der Klick auf die synthetische Beispielanlage scheitert auf schmalem Bildschirm: Seitenleiste und andere überlagernde Elemente fangen Pointer-Events ab.
- Keine JavaScript-Seitenfehler auf den ersten Landing-Aufrufen.

Wichtig: `scrollWidth <= innerWidth` alleine wäre ein falsch positiver Test, weil mobile Chromium den Layout-Viewport verbreitert. Beide Werte müssen gegen die konfigurierte Displaybreite verglichen werden. Klicks dürfen nicht mit `force:true` erzwungen werden, weil dies reale Überlagerungsfehler verdeckt.

## Releasekriterien

- Landing, Dashboard und Beispielanlage bei 360/390/768 Pixeln ohne verbreiterten Viewport.
- Navigation ohne Überlagerung bedienbar, nach Auswahl geschlossen; Tastatur/Escape nutzbar.
- Formulare, Fehlermeldungen und Rechenergebnisse lesbar; Tabellen bei Bedarf in eigenem horizontalen Scrollbereich.
- Keine ungeprüften Förderquoten durch neue UI; bestehende fachliche Aktualitätswarnungen bleiben sichtbar.
- Pilot: persönliche Einladung, Zustimmung, Restkontingent, Fehlerzustand und deaktivierter Senden-Button während laufender Anfrage auch mobil bedienbar.
- Kein echter Nutzer-Key oder personenbezogener Inhalt in Screenshots.

Unabhängiges Parent-Prüfskript: `/tmp/eegbot-mobile-release-check.ts`. Ausgangsbefunde: `/tmp/eegbot-mobile-baseline-results.json`. Finale Freigabe erfolgt erst anhand der tatsächlich veröffentlichten Version.
