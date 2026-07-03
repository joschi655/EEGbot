# NormaGraph — Klick‑Dummy

Vier interaktive Demo‑Modi für Sales‑Calls mit Kanzleien, Energieversorgern, Soloanwälten und Privatkund:innen.

| Modus | URL | Wann nutzen? |
|---|---|---|
| **Walkthrough** | `demo.html?mode=walkthrough` | 15‑min Sales‑Call: drei vorbereitete Stories, garantiert beeindruckende Antworten. Empfohlener Default. |
| **Free‑Text Demo** | `demo.html?mode=freetext` | „Tippt mal selbst" — KI‑Antwort live über `claude.complete`, mit Demo‑Banner. |
| **Wizard‑of‑Oz** | `demo.html?mode=freetext&wizard=1` | Du beantwortest Anfragen manuell im Hintergrund. Zwei Browser‑Tabs: Kunde + Operator. |
| **Compare‑Mode** | `demo.html?mode=walkthrough&compare=1` | Side‑by‑Side: Beck‑Online vs. NormaGraph. Killer‑Folie. |

`index.html` ist der **Launcher** — von dort aus kannst du die Modi mit einem Klick öffnen.

---

## Inszenierte Stories (für Walkthrough)

1. **§ 24 EEG — Anlagenzusammenfassung**
   *„Drei Windräder am gleichen Umspannwerk — eine oder drei Anlagen?"* Zeigt Verweiskaskade durch sechs EEG‑Fassungen + BGH XIII ZR 12/19 + Clearingstelle FAQ 150.

2. **§ 100 EEG — Versteinerungsklausel**
   *„Biogasanlage IBN 2006 — welches EEG gilt heute?"* Zeigt Geltungs‑Zeitstrahl + Versteinerung der EEG‑2004‑Vergütung.

3. **MaStR — Anmeldefristen**
   *„PV‑Anlage 8 kWp neu in Betrieb — was bis wann?"* Generiert Checkliste mit Fristen, Formularen, Bußgeld‑Risiko.

Story‑Texte sind **Platzhalter** — bitte in `lib/stories.js` durch reale Inhalte ersetzen, sobald Pia die Quellenrecherche fertig hat.

---

## Sales‑Funnel im Dummy

```
Empty State
  → Story Pick
  → Antwort mit Quellenbeleg
  → Verweiskaskade (Wow‑Effekt)
  → Export‑PDF (mit Demo‑Wasserzeichen)
  → Lead‑Form: „Pilotzugang anfordern"
```

Der Lead‑Formular‑Submit wird im Demo nicht versendet — nur in `localStorage` gespeichert. Vor Live‑Demos: Endpoint austauschen oder Webhook (Zapier, n8n, eigene API) anschließen.

---

## Wizard‑of‑Oz‑Setup

1. Tab A (Kunde): `demo.html?mode=freetext`
2. Tab B (Operator, an dich): `demo.html?mode=freetext&wizard=1`
3. Kunde tippt Frage → erscheint sofort in Operator‑Panel
4. Du tippst Antwort + Quellen → erscheint im Kundentab als „KI‑Antwort"
5. Kommunikation läuft über `localStorage` mit `storage`‑Event (Same‑Origin)

Für **echte Verkaufsgespräche per Bildschirmfreigabe**: zwei Geräte, beide auf demselben Origin, oder lokal mit zwei Tabs vom selben Server.
