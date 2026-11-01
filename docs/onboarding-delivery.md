# Übergabe: praktischer Einstieg

## Erstellt und geprüft

- `site/`: statischer Browser-Vorabcheck, Montage-Gate, synthetische Beispielrechnung, Sensitivität, Kopier-/Druckansicht, drei Ratgeber, Themenchecklisten, Quellen und Datenhinweise.
- README: neuer Einstieg, echte vorhandene öffentliche Demo, kopierbarer Ein-Satz-Auftrag für Codex/Claude Code mit Kompatibilitätsgrenze.
- CONTRIBUTING und anonymisierte Issue-Vorlage; Fünf-Nutzer-Testplan; Recherche und Erstnutzungsaudit.
- Vergütungstabellen August–Dezember 2026 ergänzt. Nicht vollständig migrierte BEG-Novelle warnt jetzt im Ergebnis und gibt keine alten Förderbeträge als aktuell aus. Siehe freshness-audit-2026-11.md.

## Verifikation durch Hermes

Frisches dokumentiertes Setup erfolgreich. Bestehende öffentliche App in Chromium geöffnet und integrierten 9,8-kWp-Beispielfall tatsächlich geladen. Neue Seite: alle sechs HTML-Seiten bei 390 und 1365 Pixel Breite HTTP200, keine horizontalen Überläufe oder Seiten-JavaScriptfehler. Browserchecks für Stop, fiktive Demo, eigenen Szenariopfad, Ratgeber und Installationssatz-Kopie: 8 bestanden (Desktop/Mobile). Bun-Suite: 176 bestanden, 4 bestehende Entwurfstests übersprungen, 0 fehlgeschlagen. Typecheck, site allowlist/link audit und git diff --check bestanden. 6 gezielte Freshness-Tests separat bestanden.

Hypothetisches Rechenbeispiel: 600 kWh/Jahr, 60 % zeitgleicher Eigenverbrauch, 0,30 Euro/kWh, 600 Euro Investition, 10 Euro jährliche Betriebskosten ergibt 360 kWh Eigenverbrauch, 108 Euro vermiedenen Bezug, 98 Euro Nettoersparnis und rund 6,1 Jahre einfache Amortisation. Keine Prognose für die Nutzerwohnung oder Aussage zur tatsächlichen Lebensdauer.

## Noch nicht abgeschlossen

- Keine Veröffentlichung, kein Push, keine Änderung an Cloudflared/Produktionsdiensten. Lokaler Branch `feat/practical-onboarding`.
- Kein öffentlicher KI-/Uploadpilot: Schlüsselmodell (Betreiberzugang vs BYOK) offen; Mandantentrennung und Herkunftsprüfung fehlen im alten Intake. Audit und begrenzter Vorschlag liegen in pilot-security-audit.md / pilot-release-decisions.md.
- BEG-Novelle nicht vollständig in Rechenregeln migriert; Datenvalidierung nennt deshalb weiter zwei fachliche Warnungen. Kein Anspruch, der gesamte Rechtsbestand sei aktuell verifiziert.
- Keine realen Nutzerinterviews oder Praxistests durchgeführt. Research ist Quellen-/Forenrecherche, kein Produktfit-Nachweis.

Vorschauanhänge: `/tmp/eegbot-preview-final.png`, `/tmp/eegbot-website-preview.zip` (nur statische Website + Startanleitung). Lokaler Vorschauweg: `bun run preview:site` → http://127.0.0.1:4178/EEGbot/ .
