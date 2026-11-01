# Erstnutzungsprüfung: EEGbot

Geprüft aus einem frischen Checkout am 31.10./01.11.2026. Technischer Test mit synthetischen Daten, keine reale Anlagen- oder Rechtsprüfung.

## Tatsächlich ausprobiert

- Öffentliches Repo `joschi655/EEGbot`, nicht das private Forschungsrepo EEG-Jura.
- `https://eegbot.aiwerke.de/app/`: HTTP 200 ohne Anmeldung; im Chromium tatsächlich geöffnet. Kein Seiten-JavaScriptfehler im getesteten Einstieg.
- „App starten — ohne Anmeldung“ angeklickt: Dashboard verlangt Anlage oder bietet zwei Beispiele.
- „Beispiel-Anlage laden (9,8 kWp)“ angeklickt: Profil Musterweg 12, IBN 2023-05-10; Dashboard liefert 8,2 ct/kWh, 0 offene Fristen und Förderende 2043. Das ist beobachteter Softwareoutput, keine unabhängige fachliche Bestätigung.
- `/api/status`: Normgraph, Normindex, Clearingstelle und Rechtsprechung vorhanden; Dokumentindex fehlt.
- Frisches `bun run setup` erfolgreich: Datenvalidierung, Download, Normgraph und Suchindex erstellt. Ausgabe: 1345 Expressions, 10139 Querverweise, 5393 Absatz-Chunks.
- Nicht getestet: individuelle echte Fälle, Modellzugriff, Dateiuploads, Antragstellung, Elektrosicherheit oder die Vollständigkeit aller Rechtsparameter.

## Befunde

### Hoch: Aktualitätsversprechen nicht gedeckt
Die bestehende öffentliche Landing behauptet „immer aktueller Rechtsstand“. Gleichzeitig meldet die tatsächliche Datenvalidierung für `bafa-beg-em.json` und `kfw-458.json`: Richtlinien-Novelle seit 2026-07-21, Verifikations-Marker noch offen. `docs/source-inventory.md` führt Juli-Prüfstände. Ein neu gebauter Normgraph ist kein Nachweis, dass sämtliche kuratierten Programmregeln aktualisiert wurden.

Vor breitem Bewerben: Versprechen entfernen; Prüfstand, offene Verifikation und fachliche Grenzen im konkreten Ergebnis anzeigen. Für Geldentscheidungen offene Parameter prüfen lassen. Kein Disclaimer allein ersetzt korrekte Daten.

### Hoch: Erstnutzer ohne Anlage findet keinen passenden Start
Die reale App startet bei „Anlage erfassen“, nicht bei „Lohnt sich mein Vorhaben überhaupt?“. Ein Mieter ohne Balkon soll nicht zuerst Leistung und Inbetriebnahmedatum erfinden müssen. Benötigt: Planungsmodus mit geeigneter Montagefläche als frühem Gate und gesondertem synthetischem Beispiel.

### Mittel: Öffentliche Demo im README schlecht auffindbar
Die README führt zuerst durch Bun, Git und Claude Code. Die bereits gehostete App sollte als Demo mit klarer Funktions-/Kostenabgrenzung verlinkt werden. Nicht behaupten, dass erst ein Hosting gebaut werden muss.

### Mittel: Fachsprache verdrängt Alltagsfragen
Die Live-Landing startet mit Rückforderung, Exposure, Verjährung, §52 und BGH-Zwilling. Für konkrete Konfliktfälle relevant; für neue Haushaltsprojekte kein guter primärer Einstieg. Ratgeber sollte Fragen wie Platz, Tagesverbrauch, Kosten, nächster Ansprechpartner beantworten.

## Messdaten richtig einordnen
GitHub API lieferte 0 Sterne, 0 Forks, 0 Seitenaufrufe und 13 Klonvorgänge (12 eindeutige Clients) im gelieferten Trafficfenster 17.–30.10.2026. Kein Lebenszeit-Nutzungsnachweis. Klone können automatisiert sein; Website-Nutzung wird dadurch nicht gemessen.

## Pilot vor öffentlicher KI-Freigabe
Der gewünschte Modell-/Uploadpilot ist eine separate Sicherheits- und Kostenentscheidung. Zugangsschlüssel nur serverseitig; vor Übertragung Einwilligung und Empfänger nennen; Sitzungen und Dokumente voneinander isolieren; Limits und Löschung; Telegram nur technische Ereignisse ohne Inhalte. Eigentümerfinanzierter Zugang versus BYOK ist noch zu klären. Bestehende Produktionsdienste und Cloudflared wurden bei diesem Audit nicht verändert.
