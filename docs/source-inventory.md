# Source-Inventory

Alle Quellen des Frameworks mit Nutzungsart und Status. Neue Quellen hier eintragen.

## Maschinell genutzt (Pipelines)

| Quelle | Pipeline | Nutzung | Lizenz/Status |
|---|---|---|---|
| QuantLaw gesetze-im-internet-Archiv (GitHub, Branch `data`) | `ingest-gesetze` | Normtexte EEG/EnWG/MsbG/KWKG/WindBG/RDG, Versionshistorie via Commit-Snapshots | amtliche Werke § 5 UrhG; API-Limit: Commits < ~2020-05 nicht per `until` erreichbar |
| recht.bund.de BGBl-RSS | `changefeed` | Neue Verkündungen (Frühwarnung) | GEBAUT (v0.2.0) |
| DIP Bundestag API | `changefeed`, `eeg-daten` MCP | Laufende Gesetzesvorhaben | GEBAUT (Demo-Key; eigener Key via DIP_API_KEY) |
| Open Legal Data | `ingest-rechtsprechung` | 8 BGH-Kernurteile + EEG-Breitensuche (38 lokal) | GEBAUT (v0.2.0); Listen-Endpunkt ohne Volltext → Detail-Fetch |
| Clearingstelle EEG\|KWKG FAQ | `ingest-clearingstelle` | 283 FAQ lokal indexiert (Rest ~198–330 per Resume-Lauf) | GEBAUT (v0.2.0); Drosselung nach ~200 Requests |
| SMARD API | `ingest-markt` | Monatsmarktwerte live | GEBAUT (v0.2.0) |
| MaStR Web-Such-API | `eeg-daten` MCP, `netzbetreiber_fuer_plz` | Öffentliche Anlagendaten (Registrierungs-Check, PLZ→VNB) | DL-DE-BY-2.0, Namensnennung BNetzA |
| BNetzA anzulegende Werte | `data/parameters/verguetung.*` | Vergütungssätze je IBN-Fenster (manuell kuratiert) | amtlich; Stand 02/2026 verifiziert 10.07.2026 |
| netztransparenz.de Marktwerte | `data/parameters/markt.*`, optional `ingest-markt` | Jahresmarktwert Solar | Werte 2023/2024 verifiziert; API-Automatisierung offen (NT_CLIENT_*-Credentials) |
| EEG-2027-RefE (Sekundärquellen: SUER-Synopse, Kanzlei-Analysen) | `build-eeg2027-entwurf` | Kuratierte Entwurfs-Normen als ENTWURF-Snapshot 2027-01-01 | GEBAUT 10.07.2026; kein amtlicher Wortlaut, Review Sophia |

## Referenziert (nicht redistribuiert)

| Quelle | Nutzung |
|---|---|
| Clearingstelle EEG\|KWKG (Voten, Arbeitsausgaben) | Zitate/Verweise in Engines und Workflows (FAQ 150/172/175/202/236, Voten 2022/14-II, 2023/5-III); FAQ-Index lokal GEBAUT (siehe oben), Voten/Arbeitsausgaben weiter nur referenziert |
| BGH-Rechtsprechung (XIII ZR 12/19, 3/24, 4/21, 1/21; I ZR 113/20; EnVR 83/20) | Fixtures, Subsumtions-Pflichtkontext, Guardrail-Begründungen |
| KfW-/BAFA-Merkblätter | Quelle der Programm-Schemas (`data/programs/`) |
| BDEW-Anwendungshilfe Solarpaket I, BSW-Leitfäden, dena Energy-Sharing | Recherche-Skill-Quellenhierarchie |
| Stiftung Umweltenergierecht (Synopsen) | Validierung Normgraph-Diffs |

## Beobachtet (noch nicht eingebaut)

| Quelle | Trigger für Einbau |
|---|---|
| NeuRIS API (testphase.rechtsinformationen.bund.de) | Produktionsreife; ELI-kompatible IDs vorbereitet |
| LegalDocML.de | Tooling-Reife; löst Snapshot-Raster durch echte Inkrafttretensdaten ab |
| netztransparenz.de API | NT_CLIENT_*-Credentials vorhanden → Jahresmarktwerte automatisiert statt manuell kuratiert |
| BNetzA Ausschreibungs-XLSX | Höchstwerte/Volumina je Runde (defensiver Scrape existiert in `ingest-ausschreibungen`; XLSX-Parsing offen) |
