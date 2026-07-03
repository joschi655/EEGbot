# Research-Brief — Sophia (Stand 03.07.2026)

Ziel: Legal Loves Tech Hackathon, **17.–21.08.2026, München**. Alles hier ist
ohne Programmierkenntnisse machbar. Format je Fundstelle: **Aussage → Quelle
(Dokument/URL) → Fundstelle (§/Seite) → Abrufdatum.** Rückgabe anfangs formlos
(Doc/PDF/Mail), später direkt ins Repo (GitHub-Web-Editor, Anleitung folgt).

**Kein Zeitdruck und keine feste Reihenfolge** — nimm dir die Punkte vor, die
dich interessieren oder wo du am schnellsten drankommst; du kannst so viel oder
wenig recherchieren, wie du magst. Alles, was du findest, hilft uns.

## 1. iSFP & Förderpraxis aus erster Hand (dein Vater)

Unser unfairer Vorteil. Interview-Leitfaden:

- Wie läuft ein **individueller Sanierungsfahrplan (iSFP)** real ab — Schritte,
  Dauer, Kosten, und welche Zahlen/Unterlagen braucht der Berater vom Kunden
  (Verbrauchsdaten? Pläne? Fotos? Heizlastberechnung — wer macht die womit)?
- Woran **scheitern Förderanträge in der Praxis**? (Ablehnungsgründe,
  Reihenfolge-Fehler wie „Auftrag vor Antrag", falsche Stelle BAFA/KfW,
  Anzahlung vor Eingangsbestätigung, fehlende BzA …)
- Was davon ist **schematisch/regelbasiert** abbildbar — und wo braucht es
  **zwingend** den zertifizierten Energieeffizienz-Experten (dena-Liste)?
- Gibt es **regionale Unterschiede** in seiner Beratungspraxis (Länder-/
  Kommunalprogramme, Netzbetreiber-Eigenheiten)?
- Bonus: Würde er unser Tool 30 Minuten testen und zerreißen?

## 2. Rechtsgrundlagen-Dossier Wärmepumpe/BEG

- **BEG-EM-Richtlinie** (aktuelle Fassung, Fundstelle BAnz): Grundförderung,
  Klimageschwindigkeits-/Einkommens-/Effizienzbonus, 70-%-Deckel, förderfähige
  Höchstkosten, iSFP-Bonus-Mechanik (wann genau +5 %? 30.000 € vs. 60.000 €?)
- **§ 35c EStG**: Abgrenzung/Doppelförderungsverbot zur BEG (dieselbe Maßnahme)
- **GEG § 71** (65-%-EE-Pflicht): was gilt beim Heizungstausch ab wann, welche
  Übergangsfristen kommunale Wärmeplanung
- Je Aussage bitte Quelle + Fundstelle — die Werte landen wortwörtlich in
  unseren Daten-Dateien (`data/programs/*.json`, Feld `quellen`).

## 3. Regionale Förderprogramme

Je 1–2 belegte Programme aus BW, Bayern (+ Stadt München), NRW (+ eine
Kommune), Berlin, Hamburg: Fördergegenstand, Satz/Betrag, Voraussetzungen,
**Kumulierbarkeit mit BEG**, Antragsweg, Budget-Status, Quelle + Datum.

Bitte je Programm zusätzlich (unser Datenformat kann das seit 03.07. direkt):

- **Geltungsbereich exakt:** Bundesland / Kommune(n) / ggf. PLZ-Bereiche —
  „gilt nur für Gebäude in …" wortwörtlich aus der Richtlinie.
- **Gesamtquoten-Deckel:** Steht in der Richtlinie ein Satz wie „die Summe
  aller Fördermittel darf X % der förderfähigen Kosten nicht übersteigen"?
  Dann X + Fundstelle notieren (Feld `kumulierung_gesamtquote_max_prozent`) —
  daraus rechnet das Tool automatisch „Bund + Land zusammen maximal X %".
  Manche Richtlinien deckeln stattdessen in **Euro** („Gesamtförderung max.
  X €") — dann bitte den Betrag notieren (`kumulierung_gesamtbetrag_max_eur`).
  Und falls beides fehlt: explizit „kein Deckel genannt" vermerken.

Vorsicht: Landesprogramme sind volatil — Stand unserer Recherche (Q2/2026):
landesweite PV-Zuschüsse fast nur noch Berlin SolarPLUS; MV/Sachsen
Balkonkraftwerk; Hamburg IFB Wärme. Bitte verifizieren und Kommunen ergänzen.

## 4. Benchmark: Jura-Review + neue Goldantworten

- Die 4 interpretativen Fragen **b17–b20** (Volltext im Onboarding-PDF)
  fachlich prüfen: Stimmen Goldantwort + Bewertungskriterien? Fehlt Rechtsprechung?
- **10 neue Wärmepumpen-/BEG-Fragen** mit belegten Goldantworten formulieren
  (gleiches Format) — daraus wird der öffentliche Benchmark erweitert.

## 5. Zwei Zahlen-Verifikationen (schnell)

- Anzulegende Werte ab 01.02.2026 (BNetzA-Tabelle, § 48 EEG): Teileinspeisung
  ≤10 kWp 7,78 ct? 10–40 kWp 6,73 oder 6,74? Volleinspeisung 12,34 oder 12,35?
- Jahresmarktwert Solar 2023 und 2024 (netztransparenz.de) + **Höhe der
  Vermarktungskostenpauschale für Ü20-Anlagen** (0,4 ct fix laut Gesetz vs.
  0,715 ct laut ÜNB-Veröffentlichung — welche gilt wofür?)

## 6. Selbst anschauen & zerreißen — laufend

- README + `docs/user-guide.md` lesen; einmal als „Kundin" den
  Balkonkraftwerk-Flow durchspielen (Johannes zeigt dir das Setup) und ALLES
  notieren, was juristisch schief, unbelegt oder unverständlich ist.
- Die Demo-Stories im Klick-Dummy basieren auf deiner Mai-Recherche (§ 6
  kommunale Beteiligung, EuGH C-293/23 Kundenanlage, …). Bitte **aktualisieren
  und offene Marker schließen** — z. B. steht in der Kundenanlage-Story
  „Bestandsschutz bis 31.12.2028 (Quellen teils 2029 — verifizieren, sobald
  BGBl. veröffentlicht)". Zusätzlich brauchen wir eine **vierte, laientaugliche
  Story: Wärmepumpe/Förder-Fahrplan** (unsere Hackathon-Hauptstory).

## 7. Kommentar-Fundstellen sammeln (Beck-Online & Co.)

Wenn du über Beck-Online, juris oder eine andere Datenbank Zugang hast: sammle
**so viele einschlägige Kommentarstellen wie möglich**, die für unsere Themen
relevant sein könnten. Lieber zu viele als zu wenige — wir sichten und
priorisieren dann gemeinsam. Interessant sind Kommentierungen zu:

- **EEG** §§ 24 (Zusammenfassung von Anlagen), 52 (Sanktion/Verringerung),
  100 (Übergangsrecht/Versteinerung), 48 (anzulegende Werte)
- **EnWG** — Kundenanlage, § 42b (Gemeinschaftliche Gebäudeversorgung),
  Mieterstrom
- **RDG** § 2 (Begriff der Rechtsdienstleistung; „Smartlaw"-Linie)
- **BEG / § 35c EStG** — Förderrecht, Doppelförderungsverbot

Je Fundstelle bitte: **Werk** (z. B. BeckOK EEG, Säcker EnergieR, …) →
**Bearbeiter** → **§ / Randnummer** → **Kernaussage in 1–2 Sätzen** →
**Abrufdatum**. Auch Aufsätze/Urteilsanmerkungen (RdE, EnWZ, NVwZ, NJW) sind
willkommen, wenn sie zu einem unserer §§ etwas Belastbares sagen.
