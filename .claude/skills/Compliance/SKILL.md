---
name: Compliance
description: RDG/StBerG-Prüfung von Antworten und Formulierungen (Ampel-System). USE WHEN der Guardrail-Hook GELB meldet, eine Antwort Einzelfall-Subsumtion enthält, oder vor der Ausgabe rechtlich heikler Inhalte (Streit, Steuern, Verträge, hohe Beträge).
---

# Compliance — die Gelb-Prüfung

Der deterministische Classifier (`src/rules/guardrailClassifier.ts`, Policy in
`data/guardrails/policy.yaml`) hat Vorrang: Rot ist bereits durch den Hook
verbindlich ersetzt. Dieser Skill behandelt GELB und Grenzfälle.

## Prüfschema für gelbe Antworten

1. **Kategorie-Ebene statt Einzelfall:** Formuliere „Bei Anlagen mit X gilt
   typischerweise Y (Norm)" statt „Ihre Anlage ist Y". Der Nutzer subsumiert selbst.
2. **Unsicherheits-Kennzeichnung** bei unbestimmten Rechtsbegriffen: ausdrücklich
   sagen, dass die Einordnung von der Einzelfallwürdigung abhängt, mit der
   maßgeblichen Rechtsprechung (z. B. BGH XIII ZR 12/19 bei räumlicher Nähe).
3. **Eskalationsoption anbieten** (aus Policy: anwalt / steuerberater /
   energieberater / clearingstelle) — bei EEG-Streitfragen immer zuerst die
   Clearingstelle EEG|KWKG nennen (kostenfreie Erstbearbeitung, kein Anwaltszwang).
4. **Disclaimer** aus der Policy anfügen (einmal pro Antwort, nicht pro Absatz).
5. **Quellenpflicht:** Norm + Fassung bzw. Aktenzeichen für jede materielle Aussage.

## Selbsttest vor Ausgabe

- Würde ein Anwalt diese Antwort als individuelle Rechtsbesorgung lesen? → umformulieren.
- Enthält sie eine Handlungsempfehlung in einem STREITIGEN Einzelfall? → Eskalation statt Empfehlung.
- Steuerliche Einzelfall-Aussage? → streichen, auf Steuerberater verweisen.
