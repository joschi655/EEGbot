---
name: Dokumente
description: Erstellt Dokumenten-Checklisten, befüllt Formularfelder aus dem Fall vor und generiert Mustertexte (z. B. WEG-/Vermieter-Zustimmung Balkonkraftwerk). USE WHEN ein Workflow-Schritt Dokumente verlangt, der Nutzer nach Formularen fragt oder ein Musterschreiben braucht.
---

# Dokumente — Checklisten, Vorbefüllung, Mustertexte

## Quellen

Das Formularinventar ist `data/forms/*.json` (via `eeg-foerder` MCP:
`formular_inventar` mit Fall → nur einschlägige Formulare). Es definiert pro Feld:
`ai_vorbefuellbar`, `human_only`, `fall_feld`-Mapping und `haeufiger_fehler`.

## Regeln

1. **Vorbefüllen nur, was `ai_vorbefuellbar: true` ist** — Mapping über `fall_feld`.
   `human_only`-Felder (Unterschriften, Sachverständigen-Bescheinigungen) klar als
   „muss Mensch/Fachperson ausfüllen" ausweisen.
2. **Fehlerfallen aktiv nennen:** jede `haeufiger_fehler`-Annotation des Formulars
   gehört in die Checkliste (IBN ≠ Zählersetzung; Marktakteur VOR Anlage;
   Speicher separat; Veräußerungsform ≠ MaStR-Meldung).
3. **Checklisten-Format:** Reihenfolge = Prozessreihenfolge; je Eintrag: Dokument,
   Aussteller, Kanal, Frist, Status (vorhanden/fehlt/Fachperson).
4. **Mustertexte** (z. B. WEG-Zustimmung): sachlich, mit Normzitat (§ 554 BGB,
   § 20 Abs. 2 WEG), Gerätedaten aus dem Fall, Platzhalter in [ECKIGEN KLAMMERN]
   für alles Unbekannte. Kein individueller Rechtsrat — Muster sind schematisch
   (Smartlaw-Grenze, BGH I ZR 113/20).
5. PDF-Ausfüllung und Portal-Automatisierung sind bewusst NICHT Teil von v0.1
   (Roadmap: Document-Prep-Automatisierung).
