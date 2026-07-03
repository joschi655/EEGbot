# fink / EEGbot — Onboarding & Research-Paket für Pia

Stand: 03.07.2026 · Von: Johannes · Für: Legal Loves Tech Hackathon 2026

---

## 1 · Das Projekt in zwei Seiten

**Was wir bauen:** Ein KI-Assistent für deutsches Energierecht (Arbeitstitel
**fink**), der Laien durch die realen Prozesse führt — Balkonkraftwerk anmelden,
PV aufs Dach, **Wärmepumpe fördern lassen**, Sanktionsrisiken prüfen, alte
Anlagen weiterbetreiben. Der entscheidende Unterschied zu „ChatGPT über
Gesetze": **Alles, was das Recht eindeutig regelt, rechnet bei uns Code, nicht
das Sprachmodell.** Vergütungssätze, Fördersätze mit Boni, Fristen, Sanktions-
beträge kommen aus geprüften, quellenbelegten Daten-Tabellen und deterministischen
Rechnern. Die KI übernimmt nur, was Sprache und Auslegung braucht: verstehen,
was der Nutzer will, Dokumente lesen, erklären — und sagt ehrlich, wo sie an
Grenzen stößt (dann steht dort wörtlich: „Das ist eine Auslegungsfrage —
Clearingstelle/Anwalt/Energieberater").

**Was schon existiert (funktioniert, getestet, auf GitHub):**

- **Gesetzes-Gedächtnis:** alle EEG-/EnWG-Fassungen seit 2020 als Graph — das
  Tool weiß, welche Gesetzesfassung für welche Anlage gilt (§ 100 EEG
  „Versteinerung": das Inbetriebnahme-Jahr bestimmt das anwendbare Recht!)
- **Rechner:** § 52-Strafzahlungen (10 €/kW/Monat…), Einspeisevergütung,
  Förder-Matcher (KfW 458/270, BAFA BEG EM, § 35c EStG) mit Kumulierungs-Check
- **Wissensquellen lokal:** 283 Clearingstelle-FAQ/Voten, BGH-Kernurteile,
  eigene Dokumente des Nutzers (PDF/Fotos werden gelesen, auch per OCR)
- **Rechts-Leitplanken:** eine „RDG-Ampel" blockiert automatisch alles, was
  unerlaubte Rechtsberatung wäre (Prozessstrategie, Steuergestaltung) — mit
  Verweis auf Clearingstelle/Fachanwalt/Steuerberater
- **Qualitätssicherung:** 40 automatische Tests + ein eigener Benchmark mit
  Goldantworten + eine formale Gesetz-als-Code-Verifikation (Catala)

**Deine Rolle:** Du bist unser juristisches Gewissen und unsere
Recherche-Instanz. Kein Code nötig — dein Output sind belegte Aussagen
(Aussage → Quelle → Fundstelle → Datum), die wir 1:1 in Daten-Dateien und
Demo-Inhalte übernehmen. Deine Mai-Recherche steckt übrigens schon im
Klick-Dummy (die §-6- und Kundenanlage-Stories) — genau so weitermachen.

## 2 · Der Hackathon (aus unserer Recherche)

- **Legal Loves Tech Hackathon 2026 — 17.–21.08.2026, München**, erste
  Präsenz-Ausgabe (vorher remote), Veranstalter MLTech e.V.
- Thema/Rahmen: **Zugang zum Recht**; Teams bis 6 Personen, **eigene Aufgabe
  explizit erlaubt**; Workshops + Pitch-Training im Rahmenprogramm
- Schirmherrschaft: Bayerisches Staatsministerium der Justiz; Sponsoren u. a.
  Baker McKenzie, **C.H. Beck**, Lutz Abel; Partner: TUM, LMU, recode.law …
- 2023er-Sieger „ComplAI" als Blaupause: klarer Use Case, sauberer Prototyp,
  gute Story. Preis 2023: 2.500 € + RDi-Interview (C.H. Beck)
- **Unsere Story:** Eine normale Person braucht eine neue Heizung. Zwischen ihr
  und bis zu 21.000 € Förderung stehen: zwei Behörden (BAFA/KfW), ein
  Reihenfolge-Minenfeld („Auftrag vor Antrag = alles weg"), iSFP-Bürokratie
  und Beraterknappheit. Unser Prototyp macht daraus einen **persönlichen
  Fahrplan mit Quellenbeleg je Schritt** — Zugang zum Recht, wörtlich.

## 3 · Dein Research-Brief (die Arbeitsliste)

*(Identisch mit `docs/research-brief-pia.md` im Repo — dort immer aktuell.)*

### 3.1 iSFP & Förderpraxis aus erster Hand (dein Vater) — bis ~20.07.
Interview-Leitfaden: Wie läuft ein iSFP real ab (Schritte, Dauer, Kosten,
benötigte Zahlen/Unterlagen — wer macht die Heizlastberechnung womit)? Woran
scheitern Anträge in der Praxis (Reihenfolge-Fehler, falsche Stelle BAFA/KfW,
Anzahlung zu früh, fehlende BzA)? Was ist schematisch abbildbar, wo braucht es
zwingend den zertifizierten Energieeffizienz-Experten? Regionale Eigenheiten?
Bonus: 30 Minuten unser Tool zerreißen lassen.

### 3.2 Rechtsgrundlagen-Dossier Wärmepumpe/BEG — bis ~27.07.
BEG-EM-Richtlinie (Boni, 70-%-Deckel, Höchstkosten, iSFP-Bonus-Mechanik),
§ 35c EStG-Abgrenzung (Doppelförderungsverbot), GEG § 71. Je Aussage Quelle +
Fundstelle.

### 3.3 Regionale Förderprogramme — bis ~03.08.
Je 1–2 belegte Programme aus BW, Bayern/München, NRW + Kommune, Berlin,
Hamburg: Satz, Voraussetzungen, **Kumulierbarkeit mit BEG**, Antragsweg,
Budget-Status. (Unser Stand Q2/2026: landesweit fast nur noch Berlin SolarPLUS;
MV/Sachsen Balkonkraftwerk; Hamburg IFB Wärme — bitte verifizieren + Kommunen.)

### 3.4 Benchmark — bis ~10.08.
Die 4 Fragen in Abschnitt 6 fachlich reviewen; 10 neue Wärmepumpen-/BEG-Fragen
mit belegten Goldantworten im selben Format.

### 3.5 Zwei Zahlen-Verifikationen (~1 h)
(a) Anzulegende Werte ab 01.02.2026 (BNetzA, § 48 EEG): ≤10 kWp Teileinspeisung
7,78 ct? 10–40 kWp 6,73 oder 6,74? Volleinspeisung 12,34 oder 12,35 ct?
(b) Jahresmarktwert Solar 2023/2024 (netztransparenz.de) und: gilt für die
Ü20-Anschlussvergütung die gesetzliche Vermarktungskostenpauschale 0,4 ct/kWh
oder der ÜNB-Wert 0,715 ct/kWh — und wofür genau?

### 3.6 Laufend
Tool als „Kundin" testen und alles notieren, was juristisch schief oder
unverständlich ist; Klick-Dummy-Stories aktualisieren (offene Marker wie
„BGBl.-Veröffentlichung verifizieren" in der Kundenanlage-Story) + eine vierte,
laientaugliche **Wärmepumpen-Story** entwerfen.

## 4 · Wissens-Kompakt: Förderlandschaft (Stand Q2/2026, aus unserer Recherche)

**Zuständigkeiten seit 01.01.2024:** Heizungstausch → **nur KfW 458** (Privat)
/ 459 (Unternehmen). Gebäudehülle, Anlagentechnik (außer Heizung),
Heizungsoptimierung → **BAFA BEG EM**. Häufigster Fehler: Wärmepumpen-Antrag
beim BAFA → Ablehnung. Kombi-Maßnahmen = zwei Anträge bei zwei Behörden.

**KfW 458 (Heizungsförderung):** 30 % Grund + 20 % Klimageschwindigkeit
(selbstnutzend, funktionsfähige fossile Heizung ersetzt; ab 2029: 17 %) + 30 %
Einkommensbonus (zvE ≤ 40.000 €) + 5 % Effizienzbonus (natürliches Kältemittel /
Erdwärme) — **Deckel 70 %**, förderfähige Kosten 30.000 € (1. WE) → max.
21.000 € Zuschuss. Antrag im Portal „Meine KfW" **vor Vorhabensbeginn**, mit
**BzA** (Bestätigung zum Antrag) vom Experten/Fachunternehmen;
Liefer-/Leistungsvertrag mit aufschiebender/auflösender Bedingung ist erlaubt.

**BAFA BEG EM:** 15 % + **5 % iSFP-Bonus**; Höchstkosten 30.000 €/WE, **mit
iSFP 60.000 €/WE**. Keine Anzahlung vor Eingangsbestätigung (= vorzeitiger
Beginn → Ablehnung). **iSFP** nur durch zertifizierte Energieberater
(dena-Liste); Beratungsförderung: BAFA EBW 50 % des Honorars.

**§ 35c EStG:** 20 % über 3 Jahre (7/7/6), max. 40.000 €/Objekt, selbstgenutzt,
Gebäude ≥ 10 Jahre — **nicht kombinierbar** mit BAFA/KfW für dieselbe Maßnahme.

**EEG-Einspeisevergütung (IBN 01.02.–31.07.2026, § 48 EEG):** Teileinspeisung
≤ 10 kWp 7,78 ct/kWh; Volleinspeisung ≤ 10 kWp 12,34 ct/kWh; halbjährliche
1-%-Degression (nächste 01.08.2026); 20 Jahre fest. Solarspitzengesetz (seit
25.02.2025): keine Vergütung bei negativen Börsenpreisen (neue Anlagen ≥ 2 kWp).

**Reihenfolge-Regeln (kritisch, sollen in den Fahrplan-Generator):**
Antrag **immer vor** Maßnahmenbeginn/Vertragsschluss (Ausnahme: KfW-Vertrag mit
Bedingung) · keine Anzahlung vor BAFA-Eingangsbestätigung · iSFP muss vor dem
Verwendungsnachweis bewilligt sein, wenn der Bonus gezogen wird · MaStR-Frist
1 Monat · Doppelförderungsverbote (§ 35c ↔ BEG; BEG-PV ↔ EEG-Vergütung).

**Regionale Lage 2026 (dein Prüfauftrag 3.3):** Berlin SolarPLUS (~250 €/kWp,
Speicherpflicht, IBB); MV 500 € Balkonkraftwerk (nur Mieter), Sachsen 300 €;
Hamburg IFB „Erneuerbare Wärme" (WP 20 %, max. 9.000 €/WE); BW/Hessen nur noch
Darlehen; viele Kommunen (Köln, Düsseldorf, München…) dynamisch + schnell leer.

## 5 · Wissens-Kompakt: die RDG-Leitplanke (dein Spezialgebiet)

Kern: **BGH „Smartlaw", 09.09.2021 — I ZR 113/20** (NJW 2021, 3125): Ein
Generator, der aus typisierten Sachverhalten Dokumente erzeugt, ist **keine**
Rechtsdienstleistung i. S. v. § 2 Abs. 1 RDG — vergleichbar einem
Formularhandbuch. Darauf bauen wir: **erlaubt** sind Förderinformation,
schematisches Matching, Formular-Ausfüllhilfe, Checklisten, Fristhinweise.
**Verboten/riskant:** individuelle Einzelfall-Bewertung („Ist mein
Ablehnungsbescheid rechtswidrig?"), Behördenvertretung, Widerspruchsbegründung.
Steuern: nur allgemein erklären (StBerG). Unser Tool erzwingt das technisch
(Ampel-Classifier vor jeder Antwort + Eskalationstexte). **Deine Aufgabe:**
diese Einordnung kritisch prüfen — besonders, wo unser Fahrplan-Generator der
Grenze am nächsten kommt (z. B. „lohnt sich der iSFP für Sie?" = noch Schema
oder schon Einzelfallberatung?).

Zusätzlich für später (nicht Hackathon-kritisch): EU AI Act — wir sind
voraussichtlich „transparenzpflichtig" (Kennzeichnung, Doku, menschliche
Aufsicht), nicht Hochrisiko, solange keine Behördenentscheidungen automatisiert
werden.

## 6 · Die 4 Benchmark-Fragen für dein Review

**b17:** Zwei WEA, 614 m Abstand, verschiedene Flurstücke, gemeinsames
Umspannwerk und ein Netzverknüpfungspunkt. Liegt „unmittelbare räumliche Nähe"
i. S. d. § 24 EEG vor?
*Goldantwort:* Nach BGH XIII ZR 12/19 i. d. R. ja — funktionale Betrachtung
(zusammenhängendes Areal, gemeinsame technische Infrastruktur), Entfernung
allein schließt Nähe nicht aus; Indizienkatalog der Empfehlung 2008/49
verworfen; als einzelfallabhängige Würdigung kennzeichnen.

**b18:** Eigentümer einer 2015er-Anlage in Eigenversorgung: „Ich bekomme keine
Förderung — kann mir § 52 egal sein?"
*Goldantwort:* Nein — § 52 EEG 2023 gilt über § 100 Abs. 9 für alle Anlagen
unabhängig von Förderung/IBN/Einspeisung (Clearingstelle FAQ 236); 10 €/kW/Monat
an den Netzbetreiber, Heilung → 2 €; Verjährung mit Ablauf des zweiten
Kalenderjahres.

**b19:** WEG will Gemeinschafts-PV: Unterschied Mieterstrom (§ 21 EEG/§ 42a
EnWG) vs. Gemeinschaftliche Gebäudeversorgung (§ 42b EnWG)?
*Goldantwort:* Mieterstrom = Lieferverhältnis mit Vollversorgungspflicht +
Mieterstromzuschlag; GGV (Solarpaket I) = Verteilmodell ohne Lieferantenstellung,
Überschuss über den normalen Liefervertrag, Viertelstundenmessung nötig, nur
Gebäude-PV, WEG-Vereinbarung erforderlich.

**b20:** „Mein Netzbetreiber fordert rückwirkend 8.000 € Strafzahlung — zahle
ich einfach nicht, oder?"
*Goldantwort:* Keine Strategie-Empfehlung (RDG!). Zulässig: 2-Jahres-Verjährung
und Heilungswirkung erklären, drei Wege nennen (Clearingstelle-Verfahren,
Fachanwalt, BNetzA), Eskalations-Paket anbieten.

*Prüffragen an dich: Stimmen Antworten + Kriterien? Fehlt neuere Rechtsprechung?
Sind die Formulierungen RDG-sauber?*

## 7 · Wie du Ergebnisse zurückgibst

**Ab sofort:** formlos — Doc, PDF oder Mail an Johannes. Pro Fundstelle:
**Aussage · Quelle (Titel/URL) · Fundstelle (§, Rn., Seite) · Abrufdatum.**

**Ab Woche 2 (optional, 15-Minuten-Einführung):** direkt auf GitHub — im
Browser, ohne Installation: Repo öffnen (github.com/joschi655/EEGbot, du
bekommst eine Einladung per Mail) → Datei in `docs/` oder `data/` anklicken →
Stift-Symbol („Edit in place") → ändern → „Propose changes". Das erzeugt einen
Pull Request; unsere Automatik prüft Format/Quellen, Johannes merged. Du kannst
nichts kaputtmachen — jede Änderung ist rückgängig machbar.

**Fragen jederzeit** per WhatsApp. Wenn du das Tool selbst ausprobieren willst,
setzen wir dir in 30 Minuten alles auf (braucht nur einen Laptop).
