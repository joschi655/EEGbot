# Source-Inventory

Alle Quellen des Frameworks mit Nutzungsart und Status. Neue Quellen hier eintragen.

## Maschinell genutzt (Pipelines)

| Quelle | Pipeline | Nutzung | Lizenz/Status |
|---|---|---|---|
| QuantLaw gesetze-im-internet-Archiv (GitHub, Branch `data`) | `ingest-gesetze` | Normtexte EEG/EnWG/MsbG/KWKG/WindBG/RDG, Versionshistorie via Commit-Snapshots | amtliche Werke § 5 UrhG; API-Limit: Commits < ~2020-05 nicht per `until` erreichbar |
| recht.bund.de BGBl-RSS | `changefeed` | Neue Verkündungen (Frühwarnung) | offen |
| DIP Bundestag API | `changefeed`, `eeg-daten` MCP | Laufende Gesetzesvorhaben | offen (Demo-Key; eigener Key via DIP_API_KEY) |
| MaStR Web-Such-API | `eeg-daten` MCP | Öffentliche Anlagendaten (Registrierungs-Check) | DL-DE-BY-2.0, Namensnennung BNetzA |
| BNetzA anzulegende Werte | `data/parameters/verguetung.*` | Vergütungssätze je IBN-Fenster (manuell kuratiert) | amtlich; `ZU VERIFIZIEREN`-Marker für fortgeschriebene Werte |
| netztransparenz.de Marktwerte | `data/parameters/markt.*` | Jahresmarktwert Solar | offen; Ingestion-Automatisierung = Roadmap (`ingest-markt`) |

## Referenziert (nicht redistribuiert)

| Quelle | Nutzung |
|---|---|
| Clearingstelle EEG\|KWKG (260+ FAQ, Voten, Arbeitsausgaben) | Zitate/Verweise in Engines und Workflows (FAQ 150/172/175/202/236, Voten 2022/14-II, 2023/5-III); Scraper + lokaler Index = Roadmap |
| BGH-Rechtsprechung (XIII ZR 12/19, 3/24, 4/21, 1/21; I ZR 113/20; EnVR 83/20) | Fixtures, Subsumtions-Pflichtkontext, Guardrail-Begründungen |
| KfW-/BAFA-Merkblätter | Quelle der Programm-Schemas (`data/programs/`) |
| BDEW-Anwendungshilfe Solarpaket I, BSW-Leitfäden, dena Energy-Sharing | Recherche-Skill-Quellenhierarchie |
| Stiftung Umweltenergierecht (Synopsen) | Validierung Normgraph-Diffs |

## Beobachtet (noch nicht eingebaut)

| Quelle | Trigger für Einbau |
|---|---|
| NeuRIS API (testphase.rechtsinformationen.bund.de) | Produktionsreife; ELI-kompatible IDs vorbereitet |
| LegalDocML.de | Tooling-Reife; löst Snapshot-Raster durch echte Inkrafttretensdaten ab |
| Open Legal Data / openJur | Rechtsprechungs-Korpus (`ingest-rechtsprechung`, Roadmap) |
| SMARD API | Monatsmarktwerte live (`ingest-markt`, Roadmap) |
| BNetzA Ausschreibungs-XLSX | Höchstwerte/Volumina je Runde (Roadmap) |
