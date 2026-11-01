# Aktualitätsaudit: gezielter Teilabgleich November 2026

## Umfang und Datum

Systemdatum mit `date -Iseconds` geprüft: `2026-11-01T00:55:37+01:00` (Europe/Berlin). Abrufe dieser Prüfung am **01.11.2026**. Dies ist **keine vollständige historische Corpusreview und keine Garantie eines insgesamt aktuellen Rechtsstands**. Geprüft wurden die aktuelle BNetzA-Solartariftabelle, die auffälligen BEG-EM-Programmstände und deren sichtbare Laufzeitbehandlung. Andere Programme, Marktwerte, Normgraph-Snapshots und Solarspitzen-Regeln wurden nicht materiell neu verifiziert.

## Amtliche Quellen und Befunde

Alle folgenden Abrufe lieferten HTTP 200 (HTML per Python `requests`, PDFs mit `pdftotext -layout` ausgewertet):

1. [BNetzA: EEG-Förderung und Fördersätze](https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/ErneuerbareEnergien/EEG_Foerderung/start.html), Abschnitt **Einspeisevergütung für Solaranlagen bis 100 kW**, Tabelle für IBN **01.08.–31.12.2026**. Gebäude/Lärmschutzwände: Teileinspeisung bis 10/40/100 kW: **7,70 / 6,66 / 5,44 ct/kWh**; Volleinspeisung: **12,22 / 10,24 / 10,24 ct/kWh**. Das sind feste Einspeisevergütungen, nicht die höheren anzulegenden Werte der Marktprämie. Die Seite beschränkt die veröffentlichte Periode ausdrücklich auf Dezember 2026; deshalb **keine automatische Verlängerung bis Januar 2027**. Aussagen zu Nachfolgeregelungen werden nicht als geltendes Recht implementiert.
2. [§ 49 EEG, gesetze-im-internet](https://www.gesetze-im-internet.de/eeg_2014/__49.html): halbjährliche Absenkung, Rundung und Nutzung ungerundeter Vorwerte bestätigt. Neue Tabellenwerte wurden trotzdem **direkt** der BNetzA entnommen, nicht aus bereits gerundeten Altwerten extrapoliert.
3. [BAFA: Förderprogramm im Überblick](https://www.bafa.de/DE/Energie/Effiziente_Gebaeude/Foerderprogramm_im_Ueberblick/foerderprogramm_im_ueberblick_node.html): geänderte Konditionen seit **21.07.2026**, neue TPB-IDs, geänderte Höchstgrenzen/Boni/iSFP-Bedingungen. Verweist auf die Richtlinie vom 17.08.2026 und Merkblatt Oktober 2026. WPB-/Wertschöpfungsbonus für 2027 sind **nicht** als bereits nutzbare aktuelle Boni übernommen.
4. [BAFA Förderübersicht, Stand 28.07.2026](https://www.bafa.de/SharedDocs/Downloads/DE/Energie/beg_em_foerderuebersicht_neu.pdf?__blob=publicationFile&v=3): weiterhin 15 % für Hülle/Anlagentechnik/Anlageneffizienz und 5 % iSFP, aber neue Voraussetzungen/Mindestinvestition und weitere Differenzierungen. Eine unveränderte Zahl allein beweist **nicht**, dass die bisherige Eligibility/Bonuslogik weiterhin vollständig ist.
5. [KfW 458 Programmseite](https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestehende-Immobilie/F%C3%B6rderprodukte/Heizungsf%C3%B6rderung-f%C3%BCr-Privatpersonen-Wohngeb%C3%A4ude-(458)/) und [Merkblatt 458, gültig ab 24.09.2026](https://www.kfw.de/PDF/Download-Center/Förderprogramme-(Inlandsförderung)/PDF-Dokumente/6000005131_M_458.pdf): Seiten 3–4 nennen Grundförderung 30 %, Klimageschwindigkeitsbonus **16 %**, Einkommensbonus **40/30/10 %** mit gestaffelten Einkommensgrenzen und Familienzuschlag. Obergrenze **70 bzw. 80 %**, erste Wohneinheit **28.000 Euro**; spätere zeitliche Absenkungen sind an den Antragstermin gebunden. Die bisherige Engine mit 20-%-Klimabonus, pauschalem 70-%-Deckel, 30.000-Euro-Kostenbasis und zusätzlichem 5-%-Effizienzbonus bildet diesen Stand **nicht** korrekt ab. Seite 2 bestätigt weiterhin Eigentümerberechtigung und Ausschluss von Nießbrauchberechtigten; keine pauschale Gesamtverifikation daraus abgeleitet.
6. [BEG EM vom 17.08.2026, BAnz AT 27.08.2026 B1](https://www.bundesanzeiger.de/pub/publication/jLXvW09kHTQoDINAdoC/content/jLXvW09kHTQoDINAdoC/BAnz%20AT%2027.08.2026%20B1.pdf?inline), 34 Seiten: amtliche Richtlinie abgerufen. KfW-Merkblatt ordnet die Richtlinie dem Inkrafttreten 21.07.2026 zu. **Keine vollständige Feld-für-Feld-Implementierung oder vollständige Prüfung aller technischen Mindestanforderungen** in diesem Audit.

### Abrufprobleme

`web_extract` war mit dem konfigurierten Such-Backend nicht verfügbar; direkter HTTP-Abruf war erfolgreich. Die bisher gespeicherte KfW-URL mit `/Bestandsimmobilie/` lieferte **404**. Die aktuelle URL mit `/Bestehende-Immobilie/` wurde gesucht, erfolgreich abgerufen und korrigiert. Ein erfolgreicher HTTP-Abruf wird ausdrücklich nicht mit fachlicher Gesamtverifikation gleichgesetzt.

## Implementierte Änderungen

- Solarparameter: ausschließlich neuen Zeitraum **01.08.–31.12.2026** mit amtlichen Werten, URL, Fundstelle und Abrufdatum angehängt. Historische Zeiträume unverändert. Vorher gab es **keine stille Extrapolation**: die Engine lieferte wegen des Enddatums 31.07.2026 bereits eine Datenlücke. Jetzt bleibt diese Schutzwirkung für IBN ab 01.01.2027 erhalten.
- BEG-Programme: aktuelle Primärquellen und konkrete Unterschiede dokumentiert. `zuletzt_geprueft` bleibt bewusst **17.07.2026**, denn die komplette Engine ist nicht auf die Novelle migriert. Die bestehenden Validator-Warnungen bleiben ehrlich bestehen.
- Runtime: eine erreichte, noch nicht verifizierte Richtlinienumstellung erzeugt in Matcher, Programmauskunft und Fahrplan einen ausdrücklichen Aktualitätsvorbehalt. Für diese Programme werden **keine alten Förderquoten, Einzelbonus-Sätze, Höchstkosten oder Euro-Schätzungen** mehr als aktuelles Rechenergebnis ausgegeben. Die iSFP-Weiche verspricht keinen ungeprüften Bonus. Warnungen gelangen über REST und Markdown zum Nutzer.
- Auch fehlender, zukünftiger oder über 30 Tage alter Gesamtprüfstand wird sichtbar gewarnt. Ein nur alter Prüfstand ohne bekannten Richtlinienwechsel ist eine Warnung, nicht automatisch eine fachliche Aussage über eine Änderung.
- Die deterministische Engine und ihre Orientierung/Reihenfolge bleiben bestehen. `passt`/Empfehlung sind bei offener Migration **nur vorläufige Zuordnungen nach dem gespeicherten Modell, keine bestätigte aktuelle Förderfähigkeit**; der angehängte Warnhinweis ist mitzulesen. Keine neue KI-Förderberechnung.
- Unbelegte pauschale Behauptung zum EE-Erzeuger-Ausschluss in einem KfW-Auslegungshinweis als **nicht verifizierte Praxishypothese** korrigiert. Das Merkblatt nennt insbesondere kommunale Wärmenetzentscheidungen, keinen hier bestätigten pauschalen Ausschluss allein wegen irgendeines EE-Erzeugers.
- Landing-Claim „immer aktueller Rechtsstand“ durch expliziten Quellen-/Prüfstandsvorbehalt ersetzt. Keine anderen UI-Bereiche oder neue `site/` verändert.

## Grenzen und offene Arbeiten

1. **BEG-Förderberechnung nach Novelle noch nicht freigegeben.** Vollständige Migration benötigt zeitlich versionierte Antragsstände, Familien-/Einkommensstaffeln, Wohneinheiten-/Kostenmechanik, konkrete Altanlagenbedingungen, geänderte iSFP-Voraussetzungen, technische Mindestanforderungen und Kumulierungsprüfung. Ein bloßer Austausch einzelner Zahlen wäre irreführend; deshalb jetzt Warnung und Unterdrückung der veralteten Beträge.
2. Historische Programmwerte sind als Altstand erhalten, aber keine umfassend amtlich revalidierten historischen Snapshots. Ein explizites internes `pruefdatum` dient reproduzierbaren Altstand-Regressionstests; REST/MCP verwenden standardmäßig die aktuelle Uhr und eröffnen dadurch keinen neuen historischen Förderrechner.
3. Programmauskunft liefert bestehende Praxis-/Auslegungshinweise mit Warnung weiter. Vollmacht, Nebenkosten-Abgrenzung, Bearbeitungszeiten und Sonderfälle benötigen weiterhin Feld-für-Feld-Abgleich. Ein Hinweis ist keine Förderzusage.
4. 2027-Tarife und zukünftige BEG-Boni nicht implementiert. Keine Entwurfsregel wurde als geltendes Recht eingeführt.
5. Kein kompletter Review der alten Solarperioden, anderer Förderprogramme, des gesamten Rechtskorpus oder der Paralleländerungen anderer Arbeiter. E2E-Browser-/Deployment-Prüfungen sind nicht Teil dieses Teilauftrags.

## Tatsächlich ausgeführte Tests

Arbeitsverzeichnis `/home/ubuntu/projects/EEGbot`:

- **RED:** `bun test src/rules/freshness.test.ts` vor Implementierung: **0 pass, 4 fail**, 2 Assertions. Fehlende Warnungen, fehlende Programmauskunft-Warnliste und fehlende Augusttarife reproduziert.
- **GREEN:** `bun test src/rules/freshness.test.ts`: **6 pass, 0 fail, 34 expect() calls**, 1 Datei. Prüft Prüfstandslücken, Umstellungsgrenze 20./21.07., REST-Warntransport, BAFA/KfW-Betragsunterdrückung, Markdown, amtliche Tarifstaffeln und Ende 31.12.2026.
- `bun test`: **176 pass, 4 skip, 0 fail, 584 expect() calls**, 180 Tests in 17 Dateien. Gemeinsamer Arbeitsbaum einschließlich paralleler Tests; die vier vorhandenen EEG-2027-Entwurfs-Tests bleiben übersprungen.
- `bun run typecheck`: **Exit 0**, Ausgabe `$ tsc --noEmit`.
- `bun run validate:data`: **Exit 0**, „Alle data/-Artefakte valide.“; die **zwei fachlichen Verifikationswarnungen** für BAFA/KfW bleiben absichtlich sichtbar (nicht durch Hochsetzen des Prüfdatums kaschiert).
- `git diff --check`: **Exit 0**, keine Ausgabe.

Bestehende Förder-Rechenfixtures wurden ausdrücklich auf den gespeicherten **Altstand 17.07.2026** datiert, statt diese alten Zahlen als heutige Erwartungen stehenzulassen. Der REST-Datenlückentest wurde auf **01.01.2027** verschoben. Das ist keine Aufhebung der Schutzprüfung.

## Abrufbelege (SHA-256)

Temporäre Rohdownloads nicht in das Repository aufgenommen:

| Quelle | SHA-256 |
|---|---|
| BNetzA HTML | `812952c44cf28ef14ea6e36a3f3a99e47ed5e71940cc56a530435c52bf37998d` |
| BAFA Überblick HTML | `ac6d915a26ef72b2dec8ac3b0b4429b09de0fefb110d2a7f6ed23dce53fc1635` |
| KfW-Merkblatt PDF | `7e8d0dee124a02c30ebe2f35859f283a18a49490273e6a7f169207ca4da4d293` |
| BAFA Förderübersicht PDF | `28694a8306687fde6bd5eba8a80ca87b9c4249332b56ac35cd5ddfa832013956` |
| BAnz-Richtlinie PDF | `84813cde17411dfb32edc5686b821e15a558f1e030eb56a65b584826526c7a0e` |
| § 49 EEG HTML | `62ba08c6606da2e8502fd3a357fbfbda854e031511e24b7ae952af98337c8d0b` |
