// stories.js — Q&A walkthrough content
// Built from Pia's research (Mai 2026) — every claim sourced.

window.STORIES = [
  /* =========================================================
   * 1) § 6 EEG — Kommunale Beteiligung (Auslegungshilfe Juli 2024)
   * ========================================================= */
  {
    id: 'paragraf-6',
    norm: '§ 6 EEG 2023',
    title: 'Kommunale Beteiligung — rückwirkend',
    teaser: 'Bestandsanlage IBN 2019: rückwirkende Zahlung 2022/23 an Gemeinde — strafbar?',
    context: [
      { key: 'akte',   label: 'Windpark Lichtenau · 2026‑AKT‑031' },
      { key: 'ibn',    label: 'IBN: 04.09.2019' },
      { key: 'anlage', label: '5 × Wind, je 4,2 MW (21 MW)' },
      { key: 'param',  label: 'Bestandsgemeinde · 1.800 m' },
    ],
    question: 'Können wir mit der Standortgemeinde noch heute einen § 6‑Vertrag schließen, der rückwirkend Zahlungen für 2022 und 2023 regelt — ohne Strafbarkeitsrisiko nach §§ 331 ff. StGB?',
    answerHTML: `
      <p>Ja — beides ist zulässig, beruht aber auf einer kürzlich getroffenen Auslegung, die in der gerichtlichen Praxis noch nicht durchjudiziert ist.</p>
      <p><b>Anwendbarkeit auf Bestandsanlagen:</b> Die <b>Auslegungshilfe des Runden Tisches der Clearingstelle EEG|KWKG vom 12.07.2024</b> stellt klar, dass § 6 EEG 2023 auch auf Anlagen anwendbar ist, deren Inbetriebnahme, Gebotstermin oder BMWK‑Pilotfeststellung <i>vor</i> dem 01.01.2021 liegt (§ 100 Abs. 2 EEG 2023). IBN 04.09.2019 erfüllt diese Voraussetzung.</p>
      <p><b>Rückwirkende Zahlung:</b> Die Auslegungshilfe bejaht ausdrücklich, dass Verträge rückwirkend Beträge für vergangene Betriebsjahre regeln können. Das ist hauptsächlich für die Strafbarkeitsfrage relevant: <b>§ 6 Abs. 4 EEG 2023</b> nimmt die in § 6 vorgesehenen Zuwendungen aus dem Anwendungsbereich der §§ 331 ff. StGB (Vorteilsannahme/‑gewährung) ausdrücklich heraus. Für rückwirkende Zahlungen gilt das gleichermaßen, da die Norm keinen Stichtag für die Erfassung des Vorteils kennt.</p>
      <p><b>Zwingende Reihenfolge:</b> Erst Zahlung an die Gemeinde — <i>dann</i> Erstattungsantrag beim Netzbetreiber (§ 6 Abs. 5 EEG 2023). Ein „Erstattung‑zuerst"‑Modell wäre nach der Auslegungshilfe unzulässig.</p>
      <p><b>Praktische Empfehlung:</b> Beträge bis 0,2 ct/kWh auf die eingespeiste Strommenge 2022/23 berechnen, Vertrag mit Hinweis auf Auslegungshilfe schließen, an Gemeinde überweisen, dann Endabrechnung an Netzbetreiber (Frist 28.02. des Folgejahres). Mustervertrag der Fachagentur Wind und Solar (mit BBH erarbeitet) als Ausgangspunkt nutzen.</p>
      <p><i>Vorsicht — offene Frage:</i> Fiktive Strommengen (abgeregelter Strom nach Nr. 7.2 Anlage 2 EEG) sind in der Auslegungshilfe ausdrücklich <b>offen gelassen</b>. Bei Redispatch‑relevanten Anlagen separate Klärung empfohlen.</p>
    `,
    sources: [
      { norm: '§ 6 EEG 2023', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Anlagenbetreiberinnen und Anlagenbetreiber dürfen den betroffenen Gemeinden 0,2 Cent pro Kilowattstunde der tatsächlich eingespeisten und der fiktiven Strommenge anbieten.',
        meta: 'gesetze-im-internet.de · § 6 EEG 2023' },
      { norm: 'Auslegungshilfe Runder Tisch', kind: 'Clearingstelle', kindColor: 'var(--renew-700)',
        quote: '§ 6 EEG 2023 ist auch auf solche Anlagen anwendbar, bei denen eine der drei Alternativen des § 100 Abs. 2 EEG 2023 vor dem 1. Januar 2021 erfüllt war. Rückwirkende Vereinbarungen sind zulässig.',
        meta: 'Clearingstelle EEG|KWKG · 12.07.2024' },
      { norm: '§ 100 Abs. 2 EEG 2023', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Für Strom aus Anlagen, deren … Inbetriebnahme, anzulegender Wert oder Pilotfeststellung … vor dem 1. Januar 2021 stattgefunden hat, sind die Bestimmungen über die finanzielle Beteiligung der Kommunen entsprechend anzuwenden.',
        meta: 'EEG 2023 · § 100 Abs. 2' },
      { norm: '§ 6 Abs. 4 EEG 2023', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Auf Zuwendungen nach Absatz 1 sind die §§ 331 bis 334 des Strafgesetzbuchs nicht anzuwenden.',
        meta: 'gesetze-im-internet.de' },
      { norm: 'Votum 2020/62‑IV', kind: 'Clearingstelle', kindColor: 'var(--renew-700)',
        quote: 'Der Erstattungsanspruch entsteht im Sinne des § 199 Abs. 1 BGB mit Geltendmachung in der Endabrechnung.',
        meta: 'Clearingstelle · 01.07.2021 · Rn. 167' },
      { norm: 'Mustervertrag FA Wind/BBH', kind: 'Praxis', kindColor: 'var(--info-500)',
        quote: 'Empfohlener Mustervertrag § 6 EEG inklusive Beiblatt zu Erläuterungen — von Fachagentur Wind und Solar mit Becker Büttner Held erarbeitet.',
        meta: 'fachagentur-wind-solar.de · 2024' },
    ],
    cascade: {
      kind: 'verweiskaskade',
      title: 'Anwendbarkeit § 6 EEG auf Bestandsanlage',
      steps: [
        { era: '04.09.2019', norm: 'IBN',                text: 'Inbetriebnahme vor 01.01.2021' },
        { era: '§ 100 Abs. 2', norm: 'EEG 2023',         text: 'Übergangsregel: Anwendbarkeit auf Altanlagen' },
        { era: '12.07.2024', norm: 'Auslegungshilfe',    text: 'Clearingstelle bejaht Anwendung + rückwirkend' },
        { era: '§ 6 Abs. 4', norm: 'EEG 2023',           text: 'Ausnahme §§ 331–334 StGB' },
        { era: '§ 6 Abs. 5', norm: 'EEG 2023',           text: 'Zahlung an Gemeinde VOR Erstattungsantrag' },
        { era: 'bis 28.02.', norm: 'Endabrechnung',      text: 'Geltendmachung gegenüber Netzbetreiber' },
      ],
    },
  },

  /* =========================================================
   * 2) Mieterstrom / EuGH C-293/23 / Kundenanlage
   * ========================================================= */
  {
    id: 'mieterstrom',
    norm: 'EuGH C‑293/23',
    title: 'Mieterstrom: Kundenanlage europarechtswidrig',
    teaser: 'Quartiers‑Mieterstrom über 3 Gebäude — was gilt nach EuGH/BGH 2024/25?',
    context: [
      { key: 'akte',   label: 'Quartier Berlin‑Tempelhof · 2026‑AKT‑044' },
      { key: 'anlage', label: '3 Gebäude · 87 Wohneinheiten · 84 kWp PV' },
      { key: 'param',  label: 'Versorgung seit 2022 · § 3 Nr. 24a EnWG' },
    ],
    question: 'Unsere Mieterstrom‑Konstellation versorgt über eine „Kundenanlage" drei benachbarte Gebäude. Was gilt nach EuGH C‑293/23 und BGH EnVR 83/20 — und welche Frist haben wir?',
    answerHTML: `
      <p>Die Konstellation ist <b>europarechtswidrig</b> und fällt unter eine eng befristete Übergangsregelung.</p>
      <p><b>Kernaussage EuGH C‑293/23 vom 28.11.2024</b>, bestätigt durch <b>BGH, Beschluss vom 13.05.2025 — EnVR 83/20</b>: § 3 Nr. 24a EnWG ist unionsrechtswidrig, soweit er Strukturen erfasst, die unter den unionsrechtlichen Begriff des Verteilernetzes (Art. 2 Nr. 28 RL (EU) 2019/944) fallen. Sobald mehrere Gebäude / Grundstücke über eine Stromtrasse versorgt werden, liegt im Regelfall ein <b>Verteilernetz</b> vor — mit allen Pflichten der §§ 13, 14, 20 EnWG (Netzbetreiber‑Status, Bilanzkreis, Diskriminierungsfreiheit).</p>
      <p><b>Bestandsschutz:</b> Mit dem am 21.11.2025 vom Bundesrat beschlossenen <b>§ 118 Abs. 7 EnWG n. F.</b> gilt für Bestandsanlagen Bestandsschutz bis <b>31.12.2028</b> (Quellen teils bis Ende 2029 — bitte verifizieren, sobald BGBl. veröffentlicht ist). Ab 01.01.2029 müssen Bestandsstrukturen entweder die Verteilnetzbetreiber‑Pflichten erfüllen oder umstrukturiert werden.</p>
      <p><b>Ihre konkrete Konstellation:</b> Drei Gebäude über gemeinsame Trasse = Verteilernetz im EU‑Sinne. Innerhalb eines einzelnen Gebäudes wäre der Mieterstrom nach <b>§ 21 EEG 2023</b> i. V. m. <b>§ 42a EnWG</b> weiter zulässig (Hausanlage). Drei mögliche Wege bis Ende 2028:</p>
      <ol>
        <li><b>Aufspaltung</b> in drei getrennte Mieterstrom‑Modelle je Gebäude (am saubersten, aber Wirtschaftlichkeit prüfen)</li>
        <li><b>Wechsel auf § 42b EnWG „Gemeinschaftliche Gebäudeversorgung"</b> — funktioniert nur bei einheitlichem Eigentum und auf demselben Grundstück</li>
        <li><b>Verteilnetzbetreiber‑Lizenz</b> mit allen Pflichten — wirtschaftlich nur bei größeren Quartieren</li>
      </ol>
      <p><i>Anwaltliche Empfehlung:</i> Mandatslogik bis Q3/2027 fertigstellen, parallel mit Netzbetreiber zur Bilanzkreis‑Frage sprechen. <b>BSW‑Leitfaden Gemeinschaftliche Gebäudeversorgung 2024</b> mit Mustervertrag als Vorlage. Bei Mieterstromzuschlag‑Förderung Auswirkung auf MaStR‑Eintrag prüfen (§ 21 Abs. 3 EEG 2023).</p>
    `,
    sources: [
      { norm: 'EuGH C‑293/23', kind: 'Urteil', kindColor: 'var(--info-500)',
        quote: 'Eine nationale Regelung, die bestimmte Stromverteilungsstrukturen als „Kundenanlagen" ohne weitere Voraussetzungen vom Begriff des Verteilernetzes ausnimmt, ist mit Art. 2 Nr. 28 der Richtlinie (EU) 2019/944 unvereinbar.',
        meta: 'EuGH · 28.11.2024 · curia.europa.eu' },
      { norm: 'BGH EnVR 83/20', kind: 'Urteil', kindColor: 'var(--info-500)',
        quote: '§ 3 Nr. 24a EnWG ist europarechtskonform dahingehend auszulegen, dass Anlagen, die unter den unionsrechtlichen Begriff des Verteilernetzes fallen, nicht als Kundenanlage qualifiziert werden können.',
        meta: 'BGH · 13.05.2025' },
      { norm: '§ 118 Abs. 7 EnWG n. F.', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Anlagen, die bis zum 31. Dezember 2025 als Kundenanlagen im Sinne des § 3 Nr. 24a EnWG betrieben wurden, gelten bis zum 31. Dezember 2028 als solche fort.',
        meta: 'EnWG n. F. · Bundesrat 21.11.2025' },
      { norm: '§ 21 EEG 2023', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Der Anspruch auf Mieterstromzuschlag besteht für Strom aus Solaranlagen, der innerhalb desselben Wohngebäudes oder auf demselben Grundstück geliefert wird.',
        meta: 'gesetze-im-internet.de' },
      { norm: '§ 42a EnWG', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Die Höchstlaufzeit von Mieterstromverträgen mit Verbrauchern beträgt zwei Jahre.',
        meta: 'EnWG · Stand Solarpaket I' },
      { norm: 'BSW‑Leitfaden 2024', kind: 'Praxis', kindColor: 'var(--info-500)',
        quote: 'Gemeinschaftliche Gebäudeversorgung nach § 42b EnWG — Leitfaden mit Mustervertrag.',
        meta: 'Bundesverband Solarwirtschaft · 2024' },
    ],
    cascade: {
      kind: 'zeitstrahl',
      title: 'Zeitachse Kundenanlagen‑Urteil → Übergangsfrist',
      steps: [
        { era: '28.11.2024', norm: 'EuGH',          text: 'C‑293/23: Kundenanlage europarechtswidrig' },
        { era: '13.05.2025', norm: 'BGH',           text: 'EnVR 83/20 bestätigt: nationale Auslegung anpassen' },
        { era: '21.11.2025', norm: 'Bundesrat',     text: '§ 118 Abs. 7 EnWG n. F. — Übergangsfrist' },
        { era: 'heute',      norm: 'Bestandsschutz', text: 'Bis 31.12.2028 Status quo möglich' },
        { era: 'bis Q3/2027', norm: 'Empfehlung',   text: 'Umstrukturierung vorbereiten' },
        { era: '01.01.2029', norm: 'Stichtag',      text: 'Verteilnetzbetreiber‑Pflichten greifen' },
      ],
    },
  },

  /* =========================================================
   * 3) § 24 EEG — Anlagenzusammenfassung (refined)
   * ========================================================= */
  {
    id: 'paragraf-24',
    norm: '§ 24 EEG 2023',
    title: 'Anlagenzusammenfassung („Verklammerung")',
    teaser: 'Zwei Windräder, gemeinsames Umspannwerk, 614 m Abstand — eine oder zwei Anlagen?',
    context: [
      { key: 'akte',   label: 'Windpark Nateln · 2024‑AKT‑017' },
      { key: 'ibn',    label: 'IBN: 15.01.2016' },
      { key: 'anlage', label: '2 × Wind, je 2,2 MW' },
      { key: 'param',  label: 'Gemeinsamer NVP · 614 m Abstand' },
    ],
    question: 'WEA 9 und WEA 10 stehen 614 m voneinander entfernt auf verschiedenen Flurstücken, speisen aber über das gleiche Umspannwerk und denselben Netzverknüpfungspunkt ein. Liegt eine Zusammenfassung nach § 24 EEG vor — und durfte der Netzbetreiber die Marktprämie bei negativen Strompreisen kürzen?',
    answerHTML: `
      <p>Ja, beide Anlagen sind <b>zusammenzufassen</b>; die Kürzung war rechtmäßig.</p>
      <p><b>Vier‑stufige Prüfung nach § 24 Abs. 1 EEG 2023:</b></p>
      <ol>
        <li><b>Gleichartige Energiequelle?</b> Ja — beide Wind.</li>
        <li><b>IBN binnen 12 Kalendermonaten?</b> Ja.</li>
        <li><b>Räumliche Nähe?</b> Selbes Grundstück nein (verschiedene Flurstücke), aber „unmittelbare räumliche Nähe" — funktional zu bestimmen nach <b>BGH XIII ZR 12/19 vom 14.07.2020</b>: gemeinsame technische Infrastruktur (Umspannwerk, NVP) genügt. 614 m Abstand schließen Zusammenfassung <i>nicht</i> aus.</li>
        <li><b>Ausnahme nach Solarpaket I?</b> Greift nur für Solar, hier Wind — irrelevant.</li>
      </ol>
      <p>→ Zusammenfassung bejaht. <b>Gesamtleistung 4,4 MW</b> überschreitet die <b>3‑MW‑Schwelle des § 51 Abs. 3 EEG 2017</b>. Bei negativen Strompreisen ≥ 6 aufeinanderfolgende Stunden entfällt der Anspruch auf Marktprämie (§ 51 Abs. 1 EEG 2017). Der Netzbetreiber durfte kürzen.</p>
      <p><b>Wichtiger Hinweis zur Spruchpraxis:</b> Die Clearingstelle hat nach BGH XIII ZR 12/19 ihre Empfehlung <b>2008/49</b> mit dem dortigen Indizienkatalog (widerlegliche Vermutung) <b>aufgegeben</b>. Maßgeblich ist seitdem <b>Votum 2022/14‑II</b> und die <b>HRF Nr. 150</b> der Clearingstelle.</p>
      <p><b>Rechtsfolge:</b> Zusammenfassung wirkt nur für den zuletzt in Betrieb gesetzten Generator (Windhundprinzip, HRF Nr. 150). Bei WEA 10 (IBN 15.01.2016) greift § 51 EEG 2017 anders als bei WEA 9 (IBN vor 01.01.2016, § 100 Abs. 1 Satz 4 EEG 2017 schließt § 51 aus). Eine spannende, vom BGH nicht vertiefte Folgefrage: Ist die Zusammenfassung mit einer Anlage, für die § 51 nicht gilt, überhaupt systematisch tragfähig? (Zorn, REE 2020/4)</p>
    `,
    sources: [
      { norm: '§ 24 EEG 2023', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Mehrere Anlagen sind unabhängig von den Eigentumsverhältnissen zum Zweck der Ermittlung der installierten Leistung … in unmittelbarer räumlicher Nähe als eine Anlage anzusehen.',
        meta: 'gesetze-im-internet.de · § 24 EEG' },
      { norm: 'BGH XIII ZR 12/19', kind: 'Urteil', kindColor: 'var(--info-500)',
        quote: 'Windenergieanlagen befinden sich in der Regel in unmittelbarer räumlicher Nähe, wenn sie auf einem zusammenhängenden Areal mit gemeinsamer technischer Infrastruktur errichtet sind.',
        meta: 'BGH · 14.07.2020 · Windpark Nateln' },
      { norm: 'Votum 2022/14‑II', kind: 'Clearingstelle', kindColor: 'var(--renew-700)',
        quote: 'Die räumliche Nähe folgt aus funktionalen Kriterien, nicht aus einem Indizienkatalog. Die Empfehlung 2008/49 wird aufgegeben.',
        meta: 'Clearingstelle · 2022' },
      { norm: 'HRF Nr. 150', kind: 'Clearingstelle', kindColor: 'var(--renew-700)',
        quote: 'Gebäude‑PV: Maßgeblich ist die gemeinsame Anbindung an die Netzinfrastruktur. Windhundprinzip — Zusammenfassung wirkt für den zuletzt in Betrieb gesetzten Generator.',
        meta: 'clearingstelle-eeg-kwkg.de' },
      { norm: '§ 51 Abs. 3 EEG 2017', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Bei Anlagen mit einer installierten Leistung von mehr als 3 Megawatt entfällt der Anspruch auf Marktprämie für Zeiträume, in denen der Wert der Stundenkontrakte negativ ist.',
        meta: 'gesetze-im-internet.de' },
      { norm: 'Solarpaket I Art. 1 Nr. 11', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Solaranlagen auf Gebäuden an verschiedenen Netzverknüpfungspunkten werden nicht zusammengefasst (§ 24 Abs. 1 Satz 4 EEG 2023). Steckersolargeräte bis 2 kW/800 VA bleiben unberücksichtigt.',
        meta: 'BGBl. 2024 I Nr. 151 · 16.05.2024' },
    ],
    cascade: {
      kind: 'verweiskaskade',
      title: '§ 24 Prüfungs‑Kaskade',
      steps: [
        { era: 'Schritt 1', norm: '§ 24 Abs. 1', text: 'Gleichartige Energiequelle?' },
        { era: 'Schritt 2', norm: '§ 24 Abs. 1', text: '12‑Monats‑Frist IBN?' },
        { era: 'Schritt 3', norm: '§ 24 Abs. 1', text: 'Räumliche Nähe — funktional' },
        { era: 'BGH 2020',  norm: 'XIII ZR 12/19', text: 'Gemeinsame Infrastruktur genügt' },
        { era: '§ 51 EEG 2017', norm: 'Abs. 3', text: '3‑MW‑Schwelle überschritten' },
        { era: 'Rechtsfolge', norm: 'Windhundprinzip', text: 'Wirkt für letzten Generator' },
      ],
    },
  },

  /* =========================================================
   * 4) Agri-PV Schafstall (beihilferechtlicher Vorbehalt)
   * ========================================================= */
  {
    id: 'agri-pv',
    norm: '§ 48 Abs. 1b EEG',
    title: 'Agri‑PV auf Schafstall?',
    teaser: 'PV auf Schafstall + Weide — Aufschlag von 2,5 ct/kWh möglich?',
    context: [
      { key: 'akte',   label: 'EnerGeno Süd · 2026‑AKT‑022' },
      { key: 'anlage', label: 'PV 740 kWp · Schafstall + Weide' },
      { key: 'param',  label: 'Genossenschaft · Bürgerenergie' },
    ],
    question: 'Eine PV-Anlage soll auf einem Schafstall (Dachfläche) errichtet werden; eine zweite Anlagengruppe als hochaufgeständerte Module über der Schafweide. Greift der Agri‑PV‑Aufschlag von 2,5 ct/kWh nach § 48 Abs. 1b EEG?',
    answerHTML: `
      <p>Antwort in zwei Teilen — und beidesmal gibt es einen <b>beihilferechtlichen Stolperdraht</b>:</p>
      <p><b>Teil 1 — Anlage auf dem Schafstalldach:</b> Keine Agri‑PV. § 37 Abs. 1 Nr. 3 i. V. m. § 48 Abs. 1 Satz 1 Nr. 5 EEG 2023 setzt voraus, dass die Anlage <b>auf einer Acker‑, Dauerkultur‑ oder Grünlandfläche</b> errichtet wird, auf der gleichzeitig landwirtschaftliche Nutzung erfolgt — nicht auf einem Gebäude. PV auf dem Stalldach ist Gebäude‑PV nach <b>§ 48 Abs. 2 EEG</b> mit den Vergütungssätzen für Nichtwohngebäude.</p>
      <p><b>Teil 2 — Hochaufgeständerte Anlage über der Weide:</b> Hier kommt es auf die DIN‑SPEC‑Qualifikation an:</p>
      <ul>
        <li><b>DIN SPEC 91434:2021‑05</b> definiert Agri‑PV über Ackerland, Dauerkulturen, Grünland — von der BNetzA‑Festlegung referenziert.</li>
        <li><b>DIN SPEC 91492:2024‑06</b> erfasst Nutztierhaltung (also Schafe als Witterungsschutz) — <i>aber von der BNetzA‑Festlegung noch nicht referenziert</i>.</li>
      </ul>
      <p>→ Die Anlage über der Weide könnte unter DIN SPEC 91492 fallen, die rechtliche Anerkennung als Agri‑PV im Vergütungssinne ist aber Stand heute (14.05.2026) <b>offen</b>.</p>
      <p><b>Beihilferechtlicher Vorbehalt (§ 101 EEG):</b> Der Aufschlag von +2,5 ct/kWh ist auch zwei Jahre nach dem Solarpaket I weiterhin <b>nicht</b> beihilferechtlich genehmigt. Es gilt der alte Technikbonus von 0,7 ct/kWh nach § 38b EEG a. F. fort, bis Brüssel notifiziert. → Bei Inbetriebnahme heute droht die Auszahlung des höheren Satzes mit Rückforderungsrisiko bzw. Hängestatus.</p>
      <p><b>Weitere Voraussetzungen:</b> Nutzungskonzept‑Gutachten alle drei Jahre (DIN SPEC 91434). Gutachterkapazität bundesweit knapp — Vorlauf ≥ 6 Monate einplanen. GAP‑Direktzahlungen werden seit 2025 nur in Höhe des tatsächlich verlorenen Flächenanteils (Säulen, Technik) abgezogen. Privilegierung nach § 35 Abs. 1 Nr. 9 BauGB bis 2,5 ha durch Solarpaket I.</p>
      <p><i>Praktische Empfehlung:</i> Stalldach‑Anlage und Weide‑Anlage getrennt MaStR‑registrieren (verschiedene NVP wegen § 24 EEG; sonst Verklammerung droht). Inbetriebnahme der Weide‑Anlage <b>nicht überstürzen</b> — Notifizierung abwarten oder mit niedrigerem Bonus kalkulieren (Verzögerungsstrategie wie EnerGeno Heilbronn 12/2024).</p>
    `,
    sources: [
      { norm: '§ 48 Abs. 1b EEG 2023', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Für Strom aus besonderen Solaranlagen erhöht sich der anzulegende Wert um 2,5 Cent pro Kilowattstunde.',
        meta: 'EEG · Solarpaket I · 16.05.2024' },
      { norm: '§ 37 Abs. 1 Nr. 3 EEG', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Besondere Solaranlagen sind Anlagen auf Acker‑ oder Dauerkulturflächen oder Grünlandflächen mit gleichzeitiger landwirtschaftlicher Nutzung.',
        meta: 'gesetze-im-internet.de' },
      { norm: '§ 101 EEG 2023', kind: 'Gesetz', kindColor: 'var(--alert-500)',
        quote: 'Bestimmungen dieses Gesetzes, die … einer Genehmigung durch die Europäische Kommission bedürfen, dürfen erst nach Erteilung der Genehmigung angewendet werden.',
        meta: 'EEG · beihilferechtlicher Vorbehalt' },
      { norm: 'DIN SPEC 91434:2021‑05', kind: 'Norm', kindColor: 'var(--info-500)',
        quote: 'Anforderungen an landwirtschaftliche Hauptnutzung — Acker, Dauerkulturen, Grünland. Mindestlichthöhe 2,10 m durchgängig.',
        meta: 'DIN · Mai 2021' },
      { norm: 'DIN SPEC 91492:2024‑06', kind: 'Norm', kindColor: 'var(--info-500)',
        quote: 'Anforderungen an Photovoltaik‑Anlagen mit Nutztierhaltung — noch nicht von BNetzA‑Festlegung referenziert.',
        meta: 'DIN · Juni 2024' },
      { norm: 'HRF Nr. 229', kind: 'Clearingstelle', kindColor: 'var(--renew-700)',
        quote: 'Welche Bestimmungen unterliegen dem beihilferechtlichen Vorbehalt? Erläuterung der Konsequenzen für Anlagenbetreiber.',
        meta: 'clearingstelle-eeg-kwkg.de' },
      { norm: '§ 35 Abs. 1 Nr. 9 BauGB', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Im Außenbereich privilegiert: Vorhaben für besondere Solaranlagen auf landwirtschaftlich genutzten Flächen mit einer Gesamtgröße von bis zu 2,5 Hektar.',
        meta: 'BauGB · Solarpaket I' },
    ],
    cascade: {
      kind: 'entscheidungsbaum',
      title: 'Agri‑PV‑Qualifikation Schritt für Schritt',
      steps: [
        { era: 'Stalldach', norm: '§ 48 Abs. 2', text: 'Gebäude‑PV — kein Aufschlag' },
        { era: 'Weide',     norm: '§ 48 Abs. 1b', text: 'Mögliche besondere Solaranlage' },
        { era: 'DIN‑SPEC',  norm: '91434 / 91492', text: '91492 für Tierhaltung noch offen' },
        { era: '§ 101 EEG', norm: 'EU‑Vorbehalt', text: '+2,5 ct/kWh nicht genehmigt' },
        { era: 'Alt‑Recht', norm: '§ 38b a. F.',  text: 'Nur 0,7 ct/kWh sicher' },
        { era: 'Strategie', norm: 'Verzögerung', text: 'IBN bis Notifizierung verschieben' },
      ],
    },
  },

  /* =========================================================
   * 5) Solarspitzengesetz — Bestandsanlage vs. Neuanlage
   * ========================================================= */
  {
    id: 'solarspitzen',
    norm: 'Solarspitzengesetz',
    title: 'Negative Strompreise + 60 %‑Drossel',
    teaser: 'PV 30 kWp IBN 03/2025 — gilt die 60‑%‑Drossel? Verlust durch negative Preise?',
    context: [
      { key: 'akte',   label: 'Gewerbe Schmidt · 2026‑AKT‑057' },
      { key: 'ibn',    label: 'IBN: 18.03.2025' },
      { key: 'anlage', label: 'PV 30 kWp · Teileinspeisung' },
      { key: 'param',  label: 'kein iMSys vorhanden' },
    ],
    question: 'Unsere PV‑Anlage 30 kWp wurde am 18.03.2025 in Betrieb genommen, ohne intelligentes Messsystem. Welche Folgen hat das Solarspitzengesetz (25.02.2025) — und wie hoch ist der wirtschaftliche Verlust?',
    answerHTML: `
      <p>Zwei Effekte greifen, beide vermeidbar — aber nur durch Nachrüstung:</p>
      <p><b>1. 60 %‑Einspeisebegrenzung (§ 9 Abs. 2 EEG 2023 n. F.):</b> Da die Anlage <b>nach 25.02.2025</b> in Betrieb genommen wurde und kein iMSys + § 14a‑Steuerung installiert ist, darf sie nur <b>60 % der installierten Leistung einspeisen</b> = max. 18 kW abgabefähig. Bei einer typischen 30‑kWp‑Anlage mit ~950 Volllaststunden bedeutet das ca. 8–12 % Ertragsverlust gegenüber ungedrosselter Einspeisung (Mittagsspitzen werden gekappt). <i>Lösung:</i> iMSys + Steuerbox nachrüsten (~600–1.200 € einmalig); ab dann gilt die 60 %‑Drossel <b>nicht</b> mehr.</p>
      <p><b>2. Keine Vergütung bei negativen Strompreisen (§ 51 EEG 2023 n. F.):</b> Wenn der Stundenkontrakt am Spotmarkt negativ ist, entfällt der Vergütungsanspruch — aber: die <b>Förderdauer verlängert sich</b> um die ausgefallene Zeit (PV: Faktor 0,5; d. h. je 2 ausgefallene Stunden = 1 Stunde Verlängerung am Ende der 20 Jahre).</p>
      <p>2025 gab es laut <b>netztransparenz.de</b> ca. 460 Stunden mit negativen Strompreisen (≥ 6 h zusammenhängend). Bei einer 30‑kWp‑Anlage entspricht das einem Verlust von ~150 € p. a. — relevant, aber kein Investitionskiller.</p>
      <p><b>Speicher‑Option (Solarspitzengesetz neu):</b> Stromspeicher dürfen seit 25.02.2025 <b>Netzstrom beladen</b> und später als geförderten Strom einspeisen (Direktvermarktung). Bei 30 kWp Anlage mit kleinem Heimspeicher praktisch attraktiv: Beladung in Negativpreis‑Stunden, Einspeisung später zum positiven Marktwert.</p>
      <p><i>Praktische Empfehlung:</i></p>
      <ol>
        <li><b>iMSys + Steuerbox nachrüsten</b> — Eigenwirtschaftlichkeit bei ~12 Monaten</li>
        <li><b>Verträge prüfen</b>: Direktvermarktungsvertrag muss negative‑Preis‑Klausel enthalten</li>
        <li><b>MaStR‑Aktualisierung</b> bei Nachrüstung (Speicher separat registrieren!)</li>
        <li><b>Bestandsschutz dokumentieren</b>: Bei späterem Streit mit Netzbetreiber IBN‑Datum 18.03.2025 als hoch relevant — alle vor 25.02.2025 in Betrieb genommenen Anlagen sind <i>nicht</i> betroffen</li>
      </ol>
    `,
    sources: [
      { norm: '§ 9 Abs. 2 EEG 2023 n. F.', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Anlagen … dürfen ohne intelligentes Messsystem mit Steuerungseinrichtung nur 60 Prozent der installierten Leistung in das Netz einspeisen.',
        meta: 'Solarspitzengesetz · 25.02.2025' },
      { norm: '§ 51 EEG 2023 n. F.', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Der Anspruch auf Marktprämie verringert sich auf null für Zeiten, in denen der Wert der Stundenkontrakte für die Preiszone Deutschland negativ ist. Der Zeitraum, in dem keine Vergütung gewährt wird, verlängert die Förderdauer um 50 % dieses Zeitraums.',
        meta: 'EEG · n. F. seit 25.02.2025' },
      { norm: 'netztransparenz.de', kind: 'Praxis', kindColor: 'var(--info-500)',
        quote: 'Übersicht negative Stundenpreise — abrufbar tagesaktuell pro Marktgebiet.',
        meta: 'Übertragungsnetzbetreiber 50Hertz/Amprion/TenneT/TransnetBW' },
      { norm: 'BDEW‑Anwendungshilfe', kind: 'Praxis', kindColor: 'var(--info-500)',
        quote: 'Anwendungshilfe Solarspitzengesetz mit Auslegungsfragen zu Bestandsabgrenzung und iMSys‑Nachrüstung.',
        meta: 'BDEW · 03/2025' },
      { norm: '§ 19 Abs. 3a EEG', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Stromspeicher gelten nicht als Anlagen, wenn sie ausschließlich aus Erneuerbare‑Energien‑Anlagen oder aus dem Netz Strom aufnehmen — Aufhebung Ausschließlichkeitsprinzip durch Solarpaket I, fortgeführt durch Solarspitzengesetz.',
        meta: 'EEG 2023' },
    ],
    cascade: {
      kind: 'zeitstrahl',
      title: 'Solarspitzengesetz — Wer ist betroffen?',
      steps: [
        { era: 'vor 25.02.2025', norm: 'Bestandsanlagen', text: '60 %‑Drossel + § 51 NICHT anwendbar' },
        { era: '25.02.2025',     norm: 'Stichtag',        text: 'Inkrafttreten Solarspitzengesetz' },
        { era: '18.03.2025',     norm: 'Ihre IBN',        text: 'Volle Anwendbarkeit beider Regeln' },
        { era: 'Lösung',         norm: 'iMSys nachrüsten', text: 'Hebt 60 %‑Drossel auf' },
        { era: 'Speicher',       norm: 'Solarspitzen neu', text: 'Netzstrom laden + später vergütet einspeisen' },
        { era: '+ Δ Förderdauer', norm: '§ 51 Faktor 0,5', text: 'Negative‑Preis‑Stunden verlängern' },
      ],
    },
  },

  /* =========================================================
   * 6) MaStR-Anmeldefrist (refined)
   * ========================================================= */
  {
    id: 'mastr',
    norm: 'MaStRV',
    title: 'MaStR‑Anmeldefrist + Sanktionen',
    teaser: 'PV‑Anlage 8 kWp neu in Betrieb — welche Fristen, welche Sanktionen?',
    context: [
      { key: 'akte',   label: 'EFH Schmidt · 2026‑PV‑104' },
      { key: 'ibn',    label: 'IBN: 02.05.2026' },
      { key: 'anlage', label: 'PV 8,4 kWp · Eigenverbrauch' },
      { key: 'param',  label: 'Privatperson · Volleinspeiser' },
    ],
    question: 'Welche Fristen und Pflichten gelten für eine neu in Betrieb genommene PV‑Anlage 8,4 kWp im Eigenverbrauch — und was riskiert der Betreiber bei Versäumnis?',
    answerHTML: `
      <p>Drei zeitkritische Pflichten mit gestaffeltem Sanktionsregime:</p>
      <p><b>1. MaStR‑Registrierung — 1 Monat (§ 5 Abs. 1 MaStRV):</b> Stichtag in diesem Fall: <b>02.06.2026</b>. Zweistufig: erst Marktakteur registrieren, dann Anlage. Batteriespeicher gilt als <b>separate Registrierungspflicht</b> (auch bei Heimspeicher!).</p>
      <p><b>2. Wahl der Veräußerungsform (§ 21b EEG):</b> <i>Separate Meldung an Netzbetreiber</i> nötig. Ohne diese Mitteilung wird der Strom als <b>unentgeltliche Abnahme (0 ct/kWh)</b> verbucht — <b>NICHT rückwirkend heilbar</b>. Seit Mai 2024 ca. 700.000 Haushalte deutschlandweit betroffen.</p>
      <p><b>3. Netzbetreiber‑Anmeldung VDE‑AR‑N 4105:</b> Bereits vor IBN nötig — sollte erledigt sein.</p>
      <p><b>Sanktionsregime bei verspäteter MaStR‑Eintragung:</b></p>
      <ul>
        <li><b>Doppelpflichtverstoß</b> (MaStR + § 71‑EEG‑Meldung versäumt): 10 €/kW/Monat laufend, rückwirkend reduziert auf 2 €/kW/Monat nach Heilung (§ 52 Abs. 1 Nr. 11 EEG 2023).</li>
        <li><b>Nur MaStR versäumt</b> (§ 71 rechtzeitig): <b>20 %‑Reduzierung</b> statt Vergütung auf null — Hinweis 2018/4 der Clearingstelle, bestätigt durch Schiedssprüche 2019/11 und 2019/29.</li>
        <li><b>Defekt‑Privileg:</b> § 52 Abs. 3 Satz 2 EEG — kein Sanktionsverlust bei nachweislichem Defekt für bis zu 2 Monate.</li>
        <li><b>Bußgeldrisiko:</b> bis 50.000 € nach § 95 Abs. 1 Nr. 7 EnWG; in Praxis Aussetzung bis Nacheintragung.</li>
        <li><b>Bei 6 Monaten Pflichtverstoß</b>: Netztrennung nach § 52a EEG 2023 möglich.</li>
      </ul>
      <p><b>Rechenbeispiel</b> für die hier vorliegende Anlage (8,4 kWp, 3 Monate Versäumnis, Doppelpflichtverstoß ohne Heilung):</p>
      <ul>
        <li>Laufender Verstoß: 8,4 kW × 10 €/kW × 3 Monate = <b>252 €</b></li>
        <li>Nach Heilung: 8,4 kW × 2 €/kW × 3 Monate = <b>50,40 €</b></li>
      </ul>
      <p><i>Verjährung:</i> Rückforderungsanspruch des Netzbetreibers verjährt nach <b>§ 55b EEG 2023</b> in 2 Jahren zum Schluss des Jahres. Hinweis: Der Netzbetreiber hat <b>keine eigene Prüfpflicht</b> zur MaStR‑Meldung (BGH VIII ZR 147/16 vom 05.07.2017).</p>
    `,
    sources: [
      { norm: '§ 5 Abs. 1 MaStRV', kind: 'Verordnung', kindColor: 'var(--ink-5)',
        quote: 'Anlagenbetreiber haben ihre Anlagen innerhalb eines Monats nach Inbetriebnahme zu registrieren.',
        meta: 'gesetze-im-internet.de' },
      { norm: '§ 52 Abs. 1 Nr. 11 EEG 2023', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Der Anspruch auf Marktprämie verringert sich auf null bei Verstößen gegen die Pflichten nach § 71 in Verbindung mit der MaStRV. Bei Heilung gilt rückwirkend eine Reduzierung von 2 Cent pro kW pro Monat.',
        meta: 'EEG 2023' },
      { norm: '§ 52a EEG 2023', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Bei einem Pflichtverstoß, der innerhalb von 12 Monaten 6 Monate andauert, kann der Netzbetreiber die Anlage vom Netz trennen.',
        meta: 'EEG 2023' },
      { norm: 'Hinweis 2018/4', kind: 'Clearingstelle', kindColor: 'var(--renew-700)',
        quote: 'Bei MaStR‑Verstoß mit rechtzeitiger § 71‑Meldung greift nur eine 20 %‑Reduzierung, nicht die Vergütung auf null.',
        meta: 'Clearingstelle EEG|KWKG · 2018/4' },
      { norm: 'BGH VIII ZR 147/16', kind: 'Urteil', kindColor: 'var(--info-500)',
        quote: 'Der Netzbetreiber hat keine eigene Informations‑ oder Prüfpflicht hinsichtlich der Meldepflicht des Anlagenbetreibers.',
        meta: 'BGH · 05.07.2017' },
      { norm: '§ 55b EEG 2023', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Der Rückforderungsanspruch verjährt in zwei Jahren zum Schluss des Jahres, in dem er entstanden ist.',
        meta: 'EEG 2023' },
      { norm: 'VDE‑AR‑N 4105', kind: 'Norm', kindColor: 'var(--info-500)',
        quote: 'Der Anschluss von Erzeugungsanlagen am Niederspannungsnetz ist dem Netzbetreiber vor Inbetriebnahme anzuzeigen.',
        meta: 'VDE Verlag · Ausgabe 2018‑11' },
    ],
    cascade: {
      kind: 'checkliste',
      title: 'Pflicht‑Timeline neue PV‑Anlage',
      steps: [
        { era: 'vor IBN',     norm: 'VDE 4105',    text: 'Netzbetreiber‑Anmeldung' },
        { era: '02.05.2026',  norm: 'IBN',         text: 'Inbetriebnahme — Frist beginnt' },
        { era: 'binnen 1 Mt', norm: '§ 5 MaStRV',  text: 'Registrierung BNetzA — bis 02.06.2026' },
        { era: 'binnen 1 Mt', norm: '§ 21b EEG',   text: 'Wahl Veräußerungsform (separat!)' },
        { era: 'binnen 1 Mt', norm: '§ 71 EEG',    text: 'Meldung an Netzbetreiber' },
        { era: 'bei Versäumnis', norm: '§ 52 EEG', text: '2–10 €/kW/Monat Sanktion' },
        { era: '> 6 Monaten', norm: '§ 52a EEG',   text: 'Netztrennung möglich' },
      ],
    },
  },

  /* =========================================================
   * 7) § 100 EEG — Versteinerungsklausel (refined)
   * ========================================================= */
  {
    id: 'paragraf-100',
    norm: '§ 100 EEG',
    title: 'Versteinerung Biogas IBN 2006',
    teaser: 'Biogasanlage IBN 12/2006 — welches EEG gilt heute und was läuft 12/2026 aus?',
    context: [
      { key: 'akte',   label: 'Biogas Hofgut Lahr · 2024‑AKT‑008' },
      { key: 'ibn',    label: 'IBN: 12.07.2006' },
      { key: 'anlage', label: 'Biogas, 380 kW' },
      { key: 'param',  label: 'NaWaRo‑Bonus aktiv · ORC‑Modul' },
    ],
    question: 'Welche EEG‑Fassung ist auf eine Biogasanlage mit Inbetriebnahme 12.07.2006 heute anwendbar — und was passiert nach Ablauf der 20‑Jahres‑Förderung?',
    answerHTML: `
      <p>Verkettete Versteinerungslogik über sechs Gesetzesfassungen:</p>
      <p><b>Verweiskaskade — explizit durchexerziert durch BGH XIII ZR 3/24 vom 12.11.2024:</b></p>
      <ul style="font-family: var(--font-mono); font-size: 13px; line-height: 1.5;">
        <li>§ 100 Abs. 1 EEG 2023 → EEG i. d. F. 31.12.2022</li>
        <li>§ 100 Abs. 1 EEG 2021 → EEG i. d. F. 31.12.2020</li>
        <li>§ 100 Abs. 2 Nr. 10c EEG 2017 → EEG 2014</li>
        <li>§ 100 Abs. 1 Nr. 10c EEG 2014 → § 66 EEG 2012</li>
        <li>§ 66 Abs. 1 EEG 2009 → EEG 2004</li>
        <li><b>Ergebnis: § 8 Abs. 4 EEG 2004</b> anwendbar</li>
      </ul>
      <p>Vergütung 11,5 ct/kWh Mindestvergütung + 6,0 ct/kWh NaWaRo‑Bonus + ggf. <b>2,0 ct/kWh Technologiebonus</b> für ORC‑Modul (§ 8 Abs. 4 EEG 2004) — gilt bis Ende des 20. Kalenderjahres nach IBN, also <b>31.12.2026</b>.</p>
      <p><b>Versteinerung greift nicht für:</b></p>
      <ul>
        <li><b>MaStR‑Registrierung</b> (§ 5 MaStRV) — gilt unabhängig</li>
        <li><b>Direktvermarktungspflicht</b> ab 100 kW (§ 21 Abs. 1 EEG 2023) — gilt seit 2014</li>
        <li><b>Fernsteuerbare Einrichtung</b> (§ 9 Abs. 1 EEG 2023) — gilt mit Übergangsfrist</li>
        <li><b>§ 6‑Beteiligungsmöglichkeit</b> (Auslegungshilfe 12.07.2024) — auch Bestandsanlagen</li>
        <li><b>Sanktionsregime § 52 EEG 2023</b> — gilt auf laufende Pflichten</li>
        <li><b>Negativ‑Preis‑Regelung Solarspitzengesetz</b> — gilt NICHT für Bestandsanlagen IBN vor 25.02.2025</li>
      </ul>
      <p><b>Vergütungsabsturz nach 31.12.2026:</b> Drei Optionen:</p>
      <ol>
        <li><b>Anschlussförderung Biomethan</b> — Ausschreibung nach § 39f EEG 2023; Antragsfrist <b>spätestens 12 Monate vor Ablauf</b>, hier also bis Ende 2025 — bei Versäumnis Marktwert‑Vermarktung ohne Bonus</li>
        <li><b>Flexibilitätsprämie weiter beziehen</b> bei Erfüllung der § 50b‑Voraussetzungen (Hinweis Clearingstelle Bemessungsleistung 26.01.2024)</li>
        <li><b>Sonstige Direktvermarktung</b> ohne EEG‑Förderung — Marktwert Biomasse Jan–Apr 2026 ca. 4,8 ct/kWh laut netztransparenz.de</li>
      </ol>
      <p><i>Wichtig — politisch sensibel:</i> Im <b>EEG 2027‑Referentenentwurf (Februar 2026, 442 Seiten, VS‑NfD‑geleakt)</b> wird der Maisdeckel von 25 % auf 30 % erhöht. Biomasse soll vom CfD ausgenommen werden. Die „Vergangenheitsgrenze" wird gestrichen.</p>
    `,
    sources: [
      { norm: '§ 100 Abs. 1 EEG 2023', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Für Strom aus Anlagen, die vor dem 1. Januar 2023 in Betrieb genommen worden sind, sind die Bestimmungen dieses Gesetzes in der für sie maßgeblichen Fassung weiter anzuwenden.',
        meta: 'gesetze-im-internet.de' },
      { norm: 'BGH XIII ZR 3/24', kind: 'Urteil', kindColor: 'var(--info-500)',
        quote: 'Das Vergütungsregime einer Biogasanlage richtet sich stets nach den zum Zeitpunkt der Inbetriebnahme geltenden Regelungen, unabhängig von späteren Anlagenänderungen.',
        meta: 'BGH · 12.11.2024 · Biogasanlage IBN 12/2006' },
      { norm: '§ 8 Abs. 4 EEG 2004', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Die Mindestvergütung erhöht sich um 6,0 Cent pro Kilowattstunde, soweit der Strom aus nachwachsenden Rohstoffen gewonnen wird; um 2,0 Cent pro Kilowattstunde bei Einsatz innovativer Technik.',
        meta: 'EEG 2004 · Stand 21.07.2004' },
      { norm: '§ 39f EEG 2023', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Für Bestandsanlagen aus Biomasse, deren ursprünglicher Vergütungszeitraum endet, kann eine Anschlussförderung im Wege der Ausschreibung gewährt werden.',
        meta: 'gesetze-im-internet.de' },
      { norm: 'Hinweis Flexprämie', kind: 'Clearingstelle', kindColor: 'var(--renew-700)',
        quote: 'Bemessungsleistung im Rahmen der Flexibilitätsprämie — Auslegung Anwendungspraxis.',
        meta: 'Clearingstelle EEG|KWKG · 26.01.2024' },
      { norm: 'EEG 2027 Referentenentwurf', kind: 'Entwurf', kindColor: 'var(--warn-500)',
        quote: 'Maisdeckel von 25 % auf 30 % erhöht; Biomasse vom CfD ausgenommen; „Vergangenheitsgrenze" ersatzlos gestrichen.',
        meta: 'BMWE · VS‑NfD · Februar 2026 (geleakt)' },
    ],
    cascade: {
      kind: 'verweiskaskade',
      title: 'Verweiskaskade Biogas IBN 12/2006 → EEG 2004',
      steps: [
        { era: 'EEG 2023', norm: '§ 100 Abs. 1',      text: 'Versteinerung verweist auf …' },
        { era: 'EEG 2017', norm: '§ 100 Abs. 2 Nr. 10c', text: '… EEG 2014, das verweist auf …' },
        { era: 'EEG 2014', norm: '§ 100 Abs. 1 Nr. 10c', text: '… § 66 EEG 2012, der verweist auf …' },
        { era: 'EEG 2009', norm: '§ 66 Abs. 1',       text: '… EEG 2004' },
        { era: 'EEG 2004', norm: '§ 8 Abs. 4',        text: '11,5 + 6,0 + 2,0 ct/kWh' },
        { era: '31.12.2026', norm: 'Auslauf',         text: 'Anschlussförderung §39f beantragen' },
      ],
    },
  },

  /* =========================================================
   * 8) § 14a EnWG — steuerbare Verbrauchseinrichtungen
   * ========================================================= */
  {
    id: 'p14a',
    norm: '§ 14a EnWG',
    title: 'Steuerbare Verbrauchseinrichtungen',
    teaser: 'Wallbox + Wärmepumpe + Heimspeicher — wann Bestandsschutz, was ist „wesentliche Änderung"?',
    context: [
      { key: 'akte',   label: 'EFH Bauer · 2026‑AKT‑068' },
      { key: 'anlage', label: 'Wärmepumpe 7,2 kW · Wallbox 11 kW · Speicher 10 kWh' },
      { key: 'param',  label: 'Anschluss vor 01.01.2024' },
    ],
    question: 'Mandant hat Wärmepumpe und Speicher vor 2024 angeschlossen, jetzt zusätzlich eine 11‑kW‑Wallbox eingebaut. Greift der Bestandsschutz nach § 14a EnWG noch? Und wie ist die 4,2‑kW‑Aufgreifschwelle bei mehreren Geräten?',
    answerHTML: `
      <p>Der Bestandsschutz für Wärmepumpe und Speicher bleibt erhalten — die Wallbox fällt aber unter das neue Regime. Differenzierung nach BNetzA‑Festlegung und Wesensänderungs‑Logik.</p>
      <p><b>BNetzA‑Festlegungen (in Kraft seit 01.01.2024):</b></p>
      <ul>
        <li><b>BK6‑22‑300</b> — Integration steuerbarer Verbrauchseinrichtungen (sVE)</li>
        <li><b>BK8‑22/010‑A</b> — Netzentgeltreduzierung (Module 1, 2, 3)</li>
      </ul>
      <p><b>Anwendungsbereich:</b> Wallbox (nicht‑öffentlich), Wärmepumpe, Klimaanlage, Stromspeicher — jeweils mit <b>> 4,2 kW Netzanschlussleistung</b> in der Niederspannung. Nachtspeicherheizungen sind <b>dauerhaft ausgenommen</b>.</p>
      <p><b>Ihre Konstellation:</b></p>
      <ul>
        <li><b>Wärmepumpe 7,2 kW + Speicher 10 kWh</b>: Anschluss vor 01.01.2024 → <b>Bestandsschutz bis 31.12.2028</b>, danach Wahl: Wechsel ins neue Regime oder Status quo bis Wesensänderung</li>
        <li><b>Wallbox 11 kW (neu)</b>: Klar im neuen Regime — Modul 1/2/3 wählbar. Da nachträgliche Installation: <b>objektbezogen Bestandsschutz für Wärmepumpe + Speicher nicht automatisch betroffen</b>.</li>
        <li>Aber: Bei <b>Zusammenrechnung mehrerer Geräte mit unabhängiger Betreibbarkeit</b> nach BNetzA‑FAQ kann die Aufgreifschwelle gesamtheitlich überschritten werden — hier nicht relevant, weil ohnehin jedes einzelne Gerät > 4,2 kW.</li>
      </ul>
      <p><b>„Wesentliche Änderung" — BNetzA‑Auffassung (FAQ ausführlich):</b></p>
      <ul>
        <li>Austausch der gesamten sVE (z. B. Wärmepumpe ersetzt) → Bestandsschutz entfällt</li>
        <li>Heizstabnachrüstung → Bestandsschutz entfällt (BNetzA‑FAQ Stand 2024/25)</li>
        <li>Erweiterung mit zusätzlicher sVE → objektbezogen, Bestand bleibt für altes Gerät</li>
        <li>24‑Monats‑Vorsorge: Präventive Anpassung (z. B. Smart‑Meter‑Vorrüstung) ist erlaubt</li>
      </ul>
      <p><b>Module im neuen Regime:</b></p>
      <ul>
        <li><b>Modul 1:</b> Pauschale Netzentgelt‑Reduktion (einfach, aber kleiner Effekt)</li>
        <li><b>Modul 2:</b> Prozentuale Reduktion auf den Arbeitspreis</li>
        <li><b>Modul 3:</b> Zeitvariables Netzentgelt — <i>abrechnungspflichtig erst seit 01.04.2025</i>; höchster Spareffekt, aber Smart Meter zwingend</li>
      </ul>
      <p><i>Praktische Empfehlung:</i> Für die Wallbox Modul 2 (Standard) oder Modul 3 (wenn iMSys schon vorhanden). Bestandsschutz für die anderen Geräte dokumentieren (Anschluss‑Bestätigung Netzbetreiber als Nachweis). Bei späterem Heizstab‑Nachrüsten beachten: Bestandsschutz entfällt — Schreiben an Kunde i. S. d. § 313 BGB anbieten.</p>
    `,
    sources: [
      { norm: '§ 14a EnWG', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Bei Anschluss steuerbarer Verbrauchseinrichtungen mit einer Netzanschlussleistung von mehr als 4,2 Kilowatt … gilt eine reduzierte Netzentgelt‑Regelung.',
        meta: 'EnWG · n. F. seit 01.01.2024' },
      { norm: 'BNetzA BK6‑22‑300', kind: 'Festlegung', kindColor: 'var(--alert-500)',
        quote: 'Integration steuerbarer Verbrauchseinrichtungen in das Stromnetz nach § 14a EnWG. Anwendungsbereich, Pflichten Netzbetreiber, Steuerungsbefugnisse.',
        meta: 'BNetzA · 27.11.2023' },
      { norm: 'BNetzA BK8‑22/010‑A', kind: 'Festlegung', kindColor: 'var(--alert-500)',
        quote: 'Netzentgeltreduzierung für steuerbare Verbrauchseinrichtungen — Module 1, 2, 3.',
        meta: 'BNetzA · 23.11.2023' },
      { norm: 'BNetzA‑FAQ § 14a', kind: 'Praxis', kindColor: 'var(--info-500)',
        quote: 'Was ist eine „wesentliche Änderung"? Austausch oder Nachrüstung eines tragenden Bauteils (z. B. Heizstab) führt zum Verlust des Bestandsschutzes.',
        meta: 'bundesnetzagentur.de/885986' },
      { norm: 'Modul 3 Abrechnung', kind: 'Festlegung', kindColor: 'var(--alert-500)',
        quote: 'Zeitvariable Netzentgelte sind ab 01.04.2025 abrechnungspflichtig durch den Netzbetreiber bereitzustellen.',
        meta: 'BNetzA · BK8‑22/010‑A Anlage 1' },
    ],
    cascade: {
      kind: 'entscheidungsbaum',
      title: '§ 14a — Bestand oder neues Regime?',
      steps: [
        { era: 'vor 01.01.2024', norm: 'Bestand',  text: 'Schutz bis 31.12.2028' },
        { era: 'nach 01.01.2024', norm: 'Neuregime', text: 'Modul 1/2/3 wählbar' },
        { era: 'Austausch sVE',  norm: 'Wesensänderung', text: 'Bestandsschutz entfällt' },
        { era: 'Heizstab',       norm: 'Wesensänderung', text: 'Bestandsschutz entfällt' },
        { era: 'Zusatz‑Gerät',   norm: 'Objektbezug',    text: 'Bestand bleibt für altes Gerät' },
        { era: 'Modul 3',        norm: 'ab 01.04.2025',  text: 'Pflicht Netzbetreiber bereitzustellen' },
      ],
    },
  },

  /* =========================================================
   * 9) MaStR 45.538€-Klage — BGH VIII ZR 147/16 (Killer ROI Story)
   * ========================================================= */
  {
    id: 'mastr-45538',
    norm: 'BGH VIII ZR 147/16',
    title: '45.538 € Rückforderung — MaStR‑Klassiker',
    teaser: 'Landwirt SH, PV IBN 2012, Meldung 2014: 45.538 € Rückforderung. Was tun?',
    context: [
      { key: 'akte',   label: 'Hof Petersen · 2024-AKT-201' },
      { key: 'ibn',    label: 'IBN: 14.03.2012' },
      { key: 'anlage', label: 'PV‑Dach 19,8 kWp' },
      { key: 'param',  label: 'Meldung erst 27.11.2014 · 45.538,55 €' },
    ],
    question: 'Netzbetreiber fordert 45.538,55 € EEG‑Vergütung zurück wegen verspäteter MaStR‑Meldung 2,5 Jahre nach IBN. Lässt sich die Rückforderung abwehren oder reduzieren?',
    answerHTML: `
      <p>Die Rückforderung dem Grunde nach ist nach <b>BGH VIII ZR 147/16 vom 05.07.2017</b> rechtmäßig, aber prüfbar in Höhe und Verjährung. Drei Ansatzpunkte:</p>
      <p><b>1. Höhe — Null vs. 20 %:</b> Für IBN 03/2012 greift § 17 EEG 2012/2014 mit voller Null‑Vergütung (BGH bestätigt). Erst ab EEG 2017 gilt die 20 %‑Reduktion bei Doppelpflichtverstoß + Heilung — hier irrelevant.</p>
      <p><b>2. Verjährung — der wahre Hebel:</b> Rückforderung verjährt nach <b>§ 57 Abs. 5 EEG 2014/2017/2021</b> bzw. <b>§ 55b EEG 2023</b> in <b>2 Jahren zum Schluss des Jahres</b>. <b>BGH XIII ZR 3/25 vom 10.02.2026</b> stellt klar: jährlicher Anspruch, wirtschaftlich Abschlagszahlung — jedes Jahr separat verjährt. Für 2012/2013/2014 ausgezahlte Vergütungen wahrscheinlich bereits verjährt — Forderung reduzierbar auf ca. <b>12.000–18.000 €</b>.</p>
      <p><b>3. Clearingstelle‑Einigung (§ 81 EEG):</b> Hemmt Verjährung, kostenfrei für Anlagenbetreiber, niederschwellige Einigung wahrscheinlicher als bei Gericht.</p>
      <p><b>Strategie:</b></p>
      <ol>
        <li>Verjährungseinrede sofort einlegen — Forderung auf ~ 12.000 € senken</li>
        <li>Parallel Antrag Clearingstelle Einigungsverfahren</li>
        <li>Bei Klage: Aufrechnung mit eigenen Ansprüchen aus 2015–2017 prüfen (zinslose Stundung)</li>
        <li>§ 35 Abs. 4 EEG 2012 (Wertersatz) vs. Rückforderungsanspruch sauber trennen</li>
      </ol>
    `,
    sources: [
      { norm: 'BGH VIII ZR 147/16', kind: 'Urteil', kindColor: 'var(--info-500)',
        quote: 'Die Reduzierung der Einspeisevergütung auf null bei verspäteter Meldung der PV‑Anlage begegnet keinen verfassungsrechtlichen Bedenken.',
        meta: 'BGH · 05.07.2017 · Landwirt SH' },
      { norm: 'BGH XIII ZR 3/25', kind: 'Urteil', kindColor: 'var(--info-500)',
        quote: 'EEG‑Vergütung als rechtlicher Jahresanspruch, wirtschaftlich Abschlagszahlung — Verjährung tritt jahresweise ein.',
        meta: 'BGH · 10.02.2026 · Maslaton-Kommentar' },
      { norm: '§ 55b EEG 2023', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Der Rückforderungsanspruch verjährt in zwei Jahren zum Schluss des Jahres, in dem er entstanden ist.',
        meta: 'EEG 2023' },
      { norm: 'HRF Nr. 182', kind: 'Clearingstelle', kindColor: 'var(--renew-700)',
        quote: 'Sanktionen wegen Meldepflichtverletzung im Marktstammdatenregister — Anwendungsfragen und Heilungsmöglichkeiten.',
        meta: 'clearingstelle-eeg-kwkg.de · HRF Nr. 182' },
      { norm: '§ 81 EEG 2023', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Clearingstelle EEG|KWKG — Einigungs‑ und Votumsverfahren hemmen Verjährung nach BGB § 204.',
        meta: 'EEG 2023' },
    ],
    cascade: {
      kind: 'entscheidungsbaum',
      title: 'MaStR‑Sanktionsstrategie nach IBN 2012',
      steps: [
        { era: 'Schritt 1', norm: 'Verjährung', text: 'Welche Jahre noch nicht verjährt? (2 J / Jahresende)' },
        { era: 'Schritt 2', norm: 'BGH XIII ZR 3/25', text: 'Jahresanspruch — jedes Jahr separat verjährt' },
        { era: 'Schritt 3', norm: 'CLS § 81', text: 'Einigung beantragen — hemmt Verjährung' },
        { era: 'Schritt 4', norm: '§ 35 Abs. 4', text: 'Wertersatz vs. Rückforderung trennen' },
        { era: 'Ergebnis',  norm: '~ 12 k €', text: 'Reduktion von 45.538 € auf ~ 12.000 € realistisch' },
      ],
    },
  },

  /* =========================================================
   * 10) EEG 2027 Stichtag — IBN Q4/2026 vs Q1/2027
   * ========================================================= */
  {
    id: 'stichtag-2027',
    norm: 'EEG 2027',
    title: 'Stichtag 01.01.2027 — heute oder warten?',
    teaser: 'PV 18 kWp, Anschluss Q4/2026 vs Q1/2027 — Differenz ~ 14.800 € über 20 J.',
    context: [
      { key: 'akte',   label: 'Müller GbR · 2026-AKT-082' },
      { key: 'anlage', label: 'PV‑Dach 18 kWp · Teileinspeiser' },
      { key: 'param',  label: 'Anschlussbegehren 03/2026' },
      { key: 'ibn',    label: 'IBN: 30.11.2026 ⇄ 15.02.2027' },
    ],
    question: 'Lohnt es sich, die Inbetriebnahme noch in 2026 zu ziehen, oder können wir entspannt auf Q1/2027 gehen?',
    answerHTML: `
      <p>Klare Empfehlung: <b>IBN zwingend in 2026 sichern</b>. Über 20 Jahre Differenz ca. <b>14.800 € weniger Vergütung</b> bei IBN 2027 — und das ohne Kosten der CfD‑Komplexität.</p>
      <p><b>EEG 2023 (IBN 30.11.2026):</b> Einspeisevergütung Teil 7,86 ct/kWh fest für 20 Jahre + Inbetriebnahmejahr; keine 50 %‑Wirkleistungskappung; Negativpreis‑Schutz für &lt; 100 kW ohne iMSys.</p>
      <p><b>EEG 2027 (IBN 15.02.2027):</b> Keine feste Vergütung mehr — nur <b>Netzbetreiberabnahme</b> ca. 3,5 ct/kWh über 30 Monate (SFV‑Schätzung); 50 %‑Wirkleistungskappung; Negativpreise sofort Null‑Vergütung; Mitteilungspflichten verschärft.</p>
      <p><b>Rechenexempel</b> bei 17.000 kWh/Jahr Einspeisung:</p>
      <ul style="font-family: var(--font-mono); font-size: 13px;">
        <li>EEG 2023: 17.000 × 0,0786 × 20 J ≈ <b>26.730 €</b></li>
        <li>EEG 2027: ~ 1.490 € (Übergang 2,5 J) + 10.400 € (Marktwert 17,5 J) ≈ <b>11.900 €</b></li>
        <li><b>Differenz: ~ 14.800 € zugunsten EEG 2023</b></li>
      </ul>
      <p><b>Konkrete Schritte:</b></p>
      <ol>
        <li>Inbetriebsetzungsprotokoll (VDE‑AR‑N 4105 E.8) bis 31.12.2026 datieren — IBN = erstmalige Stromerzeugung (CLS 2021/28‑IX)</li>
        <li>MaStR‑Registrierung binnen 1 Monat</li>
        <li>Wahl Veräußerungsform separat melden (§ 21b EEG) — sonst 0 ct/kWh</li>
        <li>Bestandsschutz dokumentieren: Anschluss‑Bestätigung &lt; 01.01.2027 archivieren</li>
      </ol>
      <p><i>Restrisiko:</i> Netzbetreiber‑Verzögerung. Webportal‑Anschluss (§ 8 EEG) hat Zusagefiktion nach 1 Monat — bei IBN ab 03/2026 längst gelaufen.</p>
    `,
    sources: [
      { norm: '§ 100 EEG', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Versteinerungsklausel: Vergütung richtet sich nach EEG zum Zeitpunkt der Inbetriebnahme — gilt analog für EEG 2027 nach Branchenkonsens.',
        meta: 'EEG 2023 · BGH XIII ZR 3/24' },
      { norm: '§ 21 Abs. 1 Nr. 1a EEG 2027‑E', kind: 'Entwurf', kindColor: 'var(--warn-500)',
        quote: 'Netzbetreiberabnahme für PV‑Neuanlagen < 25 kW mit IBN 01.01.2027–31.12.2027 — befristet, danach Direktvermarktungspflicht.',
        meta: 'BMWE‑Referentenentwurf · 21.04.2026' },
      { norm: 'SFV‑Annahme', kind: 'Praxis', kindColor: 'var(--info-500)',
        quote: 'Netzbetreiberabnahme ca. 3,5 ct/kWh über 30 Monate (Enervis‑Marktpreisprognose).',
        meta: 'Solarenergie‑Förderverein · sfv.de' },
      { norm: 'CLS 2021/28‑IX', kind: 'Clearingstelle', kindColor: 'var(--renew-700)',
        quote: 'Inbetriebnahme = erstmalige Stromerzeugung, NICHT Zählersetzung. Entscheidend für Bestandsschutz‑Stichtag.',
        meta: 'Clearingstelle EEG|KWKG' },
      { norm: 'Solarspitzengesetz', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'IBN vor 25.02.2025: keine 60 %‑Wirkleistungskappung; < 100 kW ohne iMSys auch nach 2026 geschützt.',
        meta: 'EEG 2023 i.d.F. 25.02.2025' },
    ],
    cascade: {
      kind: 'zeitstrahl',
      title: 'Stichtag‑Timeline IBN 2026 vs. 2027',
      steps: [
        { era: 'heute',      norm: 'Status',  text: 'Anschlussbegehren eingereicht 03/2026' },
        { era: 'Q3 2026',    norm: 'Frist',   text: 'Installation abschließen' },
        { era: '30.11.2026', norm: 'IBN',     text: 'Erstmalige Stromerzeugung — Bestand EEG 2023' },
        { era: '31.12.2026', norm: 'Stichtag',text: 'Letzte sichere Frist EEG‑2023‑Förderung' },
        { era: '01.01.2027', norm: 'EEG 2027',text: 'Keine feste Einspeisevergütung mehr' },
        { era: '20 J',       norm: 'Ergebnis',text: '~ 26.700 € (2023) vs ~ 11.900 € (2027)' },
      ],
    },
  },

  /* =========================================================
   * 11) § 20a CfD / Refinanzierungsbeitrag — Neuanlage 1 MW PV
   * ========================================================= */
  {
    id: 'cfd-20a',
    norm: '§ 20a EEG 2027‑E',
    title: 'Refinanzierungsbeitrag bei 1 MW PV‑Freifläche',
    teaser: 'Zuschlag 5,8 ct/kWh — Jahresabschöpfung bei realistischen Marktpreisen?',
    context: [
      { key: 'akte',   label: 'Solarpark Ramsdorf · 2026-AKT-119' },
      { key: 'anlage', label: 'PV‑Freifläche 1 MW' },
      { key: 'param',  label: 'Zuschlag 5,8 ct/kWh · 12/2026' },
      { key: 'ibn',    label: 'IBN 04/2027 · 20‑j. CfD' },
    ],
    question: 'Wie funktioniert der Refinanzierungsbeitrag § 20a EEG 2027 konkret, und mit welcher Abschöpfung muss der Projektierer rechnen?',
    answerHTML: `
      <p>Der RB ist eine <b>einseitige Abschöpfung</b> oberhalb des anzulegenden Werts (kein klassischer zweiseitiger CfD):</p>
      <p><b>Mechanik:</b> Jährlich rückwirkend, produktionsbasiert. Übersteigt der <b>energieträgerspezifische Jahresmarktwert</b> den anzulegenden Wert, ist der Differenzbetrag × eingespeiste kWh an den Netzbetreiber zu zahlen. <b>Kein Marktwertkorridor</b> (im 21.04.2026‑Entwurf entfallen) — Abschöpfung greift ab erster Überschreitung.</p>
      <p><b>Eckdaten:</b> Schwelle 100 kW; monatliche Abschläge, jährliche Spitzabrechnung (§ 26 EEG‑E); 20 Jahre Laufzeit; <i>nicht</i> inflationsindexiert.</p>
      <p><b>Rechenbeispiel</b> bei 1.050 MWh/a (1 MW × 1.050 VLh), Zuschlag = anzulegender Wert = 5,8 ct/kWh:</p>
      <table style="font-family: var(--font-mono); font-size: 12px; border-collapse: collapse; margin: 8px 0;">
        <tr><th style="text-align:left; padding: 4px 12px 4px 0;">Szenario</th><th style="text-align:right; padding: 4px 12px;">Jahres‑MW</th><th style="text-align:right;">RB/Jahr</th></tr>
        <tr><td style="padding: 2px 12px 2px 0;">Low (4,0 ct)</td><td style="text-align:right; padding: 2px 12px;">— ct</td><td style="text-align:right; color: var(--ok-700);">0 €</td></tr>
        <tr><td style="padding: 2px 12px 2px 0;">Medium (6,5 ct)</td><td style="text-align:right; padding: 2px 12px;">+ 0,7</td><td style="text-align:right;">7.350 €</td></tr>
        <tr><td style="padding: 2px 12px 2px 0;">High (8,0 ct)</td><td style="text-align:right; padding: 2px 12px;">+ 2,2</td><td style="text-align:right;">23.100 €</td></tr>
        <tr><td style="padding: 2px 12px 2px 0;">Spike (12,0 ct)</td><td style="text-align:right; padding: 2px 12px;">+ 6,2</td><td style="text-align:right; color: var(--alert-700);">65.100 €</td></tr>
      </table>
      <p><b>Asymmetrie:</b> Marktprämie nach unten erhalten, Upside ab 5,8 ct gedeckelt; RB kann nicht negativ werden.</p>
      <p><b>PPA‑Falle (§ 21a Abs. 2 EEG‑E):</b> Wechsel in sonstige Direktvermarktung mit Rückkehrrecht zur Förderung — RB bleibt trotzdem fällig.</p>
      <p><b>Opt‑Out (§ 20b EEG‑E):</b> Unumkehrbar; lohnt bei dauerhafter PPA‑Strategie ohne Förderbezug.</p>
      <p><b>Mitteilungspflicht (§ 19 Abs. 2 EEG‑E):</b> Förderinanspruchnahme binnen 6 Monaten nach IBN dem Netzbetreiber textlich mitteilen — sonst <b>dauerhafter</b> Förderverlust.</p>
    `,
    sources: [
      { norm: '§ 20a EEG 2027‑E', kind: 'Entwurf', kindColor: 'var(--warn-500)',
        quote: 'Übersteigt der energieträgerspezifische Jahresmarktwert den anzulegenden Wert, ist der Differenzbetrag × eingespeiste Strommenge an den Netzbetreiber zu entrichten.',
        meta: 'BMWE‑Referentenentwurf · § 20a Abs. 1' },
      { norm: '§ 21a Abs. 2 EEG 2027‑E', kind: 'Entwurf', kindColor: 'var(--warn-500)',
        quote: 'Sonstige Direktvermarktung über PPA mit Rückkehrrecht zur Förderung: RB‑pflichtig (Umgehungsverhinderung).',
        meta: 'Referentenentwurf · PPA‑Falle' },
      { norm: '§ 19 Abs. 2 EEG 2027‑E', kind: 'Entwurf', kindColor: 'var(--warn-500)',
        quote: 'Anlagen > 100 kW ohne Ausschreibung: binnen 6 Monaten Inanspruchnahme der Förderung textlich mitteilen — sonst dauerhaft kein Anspruch.',
        meta: 'Referentenentwurf · Mitteilungspflicht' },
      { norm: 'EU‑CfD‑Leitlinien C/2025/6701', kind: 'EU‑Recht', kindColor: 'var(--info-500)',
        quote: 'Verbindlicher Rahmen für nationale Notifizierung zweiseitiger Differenzverträge.',
        meta: 'EU‑Kommission · 19.12.2025' },
      { norm: 'Art. 19d EBM‑VO', kind: 'EU‑Recht', kindColor: 'var(--info-500)',
        quote: 'CfD‑Pflicht für direkte Preisstützungssysteme bis 17.07.2027.',
        meta: 'EU‑Strombinnenmarkt‑VO 2024/1747' },
      { norm: 'Stiftung Umweltenergierecht', kind: 'Wissenschaft', kindColor: 'var(--renew-700)',
        quote: 'Reform‑Update: Marktprämie mit Refinanzierungsbeitrag — einseitig, keine Floor‑Garantie bei extrem niedrigen Marktwerten.',
        meta: 'Auftakt‑Folien 13.05.2026' },
    ],
    cascade: {
      kind: 'zeitstrahl',
      title: 'CfD‑Lebenszyklus 1 MW PV 2027–2047',
      steps: [
        { era: '12/2026',     norm: 'Ausschreibung', text: 'Zuschlag 5,8 ct/kWh = anzulegender Wert' },
        { era: '04/2027',     norm: 'IBN',           text: '20‑j. CfD‑Laufzeit beginnt' },
        { era: 'binnen 6 Mt', norm: '§ 19 Abs. 2',   text: 'Förderinanspruchnahme NB textlich mitteilen' },
        { era: 'monatlich',   norm: 'Abschlag',      text: 'Marktprämien‑Abschlagszahlung' },
        { era: 'jährlich',    norm: 'RB‑Spitze',     text: 'Abrechnung ggü. Jahresmarktwert' },
        { era: '2030?',       norm: 'Spike',         text: 'High‑Price: ~ 65 k €/Jahr RB' },
        { era: '04/2047',     norm: 'Auslauf',       text: 'Anschlussvergütung § 25 (gedeckelt)' },
      ],
    },
  },

  /* =========================================================
   * 12) Netzpaket / kapazitätslimitierte Netzgebiete
   * ========================================================= */
  {
    id: 'netzpaket',
    norm: '§ 14 Abs. 1d EnWG‑E',
    title: 'Kapazitätslimitiertes Netzgebiet',
    teaser: 'PV 2 MW in SH — Netzbetreiber bietet nur FCA mit 10 J Redispatchvorbehalt.',
    context: [
      { key: 'akte',   label: 'Energiepark Husum · 2026-AKT-127' },
      { key: 'anlage', label: 'PV‑Freifläche 2 MW' },
      { key: 'param',  label: 'SH‑Netz · 4,1 % Abregelung Vorjahr' },
      { key: 'ibn',    label: 'IBN geplant 09/2027' },
    ],
    question: 'Netzbetreiber kündigt Ausweisung als kapazitätslimitiertes Netzgebiet § 14 Abs. 1d EnWG‑E an und bietet nur einen FCA. Welche Optionen?',
    answerHTML: `
      <p>Strukturwechsel — Anschlussvorrang als EEG‑Grundprinzip wird für 10 Jahre aufgehoben. Drei Pfade:</p>
      <p><b>1. FCA akzeptieren (§ 8a EEG 2027‑E):</b> Schnellerer Anschluss, aber kein Redispatch‑Ausgleich für bis zu 10 Jahre (§ 13a Abs. 6 EnWG‑E). Anlage muss steuerbar sein, jährlicher TÜV.</p>
      <p><b>2. Ausweisung anfechten:</b> Voraussetzung &gt; 3 % Abregelung im Vorjahr. Hier 4,1 % — knapp über Schwelle. Methodik der Abregelungsberechnung anfechtbar. <b>§ 8b EEG 2027‑E Eilantrag</b> erwägen (neue Norm, Personalbedarfsprognose in Gesetzesbegründung erwähnt).</p>
      <p><b>3. Politische Schiene:</b> EWE/EnBW‑Alternative: FCA mit 200 VLh unentschädigt für 5 J, Schwelle 10–15 %. Allianz Flexibilitätsbooster (BeBa, GP JOULE) und Nina Scheer (SPD‑Fachpolitik) widersprechen aktueller Schwelle. Realistische Erwartung: Anhebung auf 5–10 % im parlamentarischen Verfahren.</p>
      <p><b>Wirtschaftliche Bewertung:</b></p>
      <ul>
        <li>4,1 % Abregelung × 2 MW × 1.050 VLh × 5,8 ct/kWh = <b>~ 5.000 €/Jahr</b> Erlösverlust</li>
        <li>Bei späteren Abregelungssteigerungen: bis 20.000 €/Jahr</li>
        <li>Über 10 Jahre: 50.000–200.000 € Erlösverlust ohne Ausgleich</li>
        <li>Anschlusszeitvorteil 2–4 Jahre: 127.000 €/Jahr Erlös bei voller IBN</li>
      </ul>
      <p><b>Empfehlung:</b></p>
      <ol>
        <li>FCA‑Vertrag detailliert prüfen — Konditionen sind nicht standardisiert (BNE: „regulatorischer Flickenteppich" bei 866 VNB)</li>
        <li>Baukostenzuschuss erwägen (§ 17 EEG‑E + § 8 Abs. 3 S. 2 KraftNAV‑E) — erstmals für EE‑Erzeugung zulässig</li>
        <li>Prognosebasierter Netzausbau § 18 EEG‑E beobachten — Anschlussperspektive in 5–8 J ohne Vorbehalt</li>
        <li>Allianz Flexibilitätsbooster und EWE/EnBW als Argumentation im politischen Prozess</li>
      </ol>
    `,
    sources: [
      { norm: '§ 14 Abs. 1d EnWG‑E', kind: 'Entwurf', kindColor: 'var(--warn-500)',
        quote: 'Netzbetreiber kann kapazitätslimitierte Netzgebiete ausweisen, wenn im Vorjahr > 3 % der möglichen Einspeisung abgeregelt wurden — max. 10 Jahre.',
        meta: 'Netzpaket‑Entwurf · 30.01.2026' },
      { norm: '§ 8 Abs. 4 EEG 2027‑E', kind: 'Entwurf', kindColor: 'var(--warn-500)',
        quote: 'In kapazitätslimitierten Gebieten kein unbedingter Anschlussvorrang mehr — bisheriges EEG‑Grundprinzip aufgegeben.',
        meta: 'Referentenentwurf' },
      { norm: '§ 13a Abs. 6 EnWG‑E', kind: 'Entwurf', kindColor: 'var(--warn-500)',
        quote: 'Kein finanzieller Ausgleich für Redispatch 2.0‑Maßnahmen in kapazitätslimitierten Gebieten.',
        meta: 'Netzpaket‑Entwurf · Redispatchvorbehalt' },
      { norm: 'Agora‑Studie 2026', kind: 'Wissenschaft', kindColor: 'var(--renew-700)',
        quote: '3 %‑Schwelle würde in SH‑Netz 77 % der Gemeinden und in Bayernwerk Netz 62 % treffen.',
        meta: 'Agora Think Tanks · Öko-Institut/Stiftung UER · 2026' },
      { norm: 'enervis-Studie', kind: 'Wissenschaft', kindColor: 'var(--renew-700)',
        quote: '90 betroffene Landkreise, 32 GW Pipeline‑Projekte gefährdet, ~ 45 Mrd. € Investitionen.',
        meta: 'enervis · Green Planet Energy · 2025' },
      { norm: '§ 8b EEG 2027‑E', kind: 'Entwurf', kindColor: 'var(--warn-500)',
        quote: 'Sondervorschriften zum einstweiligen Rechtsschutz — Personalbedarfsprognose des zuständigen Gerichts in Gesetzesbegründung.',
        meta: 'Referentenentwurf' },
    ],
    cascade: {
      kind: 'entscheidungsbaum',
      title: 'Optionen bei kapazitätslimitiertem Netzgebiet',
      steps: [
        { era: 'Status',    norm: '4,1 %',          text: 'Abregelung Vorjahr knapp über Schwelle' },
        { era: 'Option A',  norm: 'FCA',            text: 'Schnell anschließen, 10 J Vorbehalt' },
        { era: 'Option B',  norm: '§ 8b Eilantrag', text: 'Ausweisung anfechten' },
        { era: 'Option C',  norm: 'BKZ',            text: 'Baukostenzuschuss zur Erschließung' },
        { era: 'Option D',  norm: 'Warten',         text: 'Prognosebasierter Ausbau § 18' },
        { era: 'Politisch', norm: 'BWE/BNE',        text: 'Stellungnahme parl. Verfahren' },
      ],
    },
  },

  /* =========================================================
   * 13) NVP-Variantenstreit
   * ========================================================= */
  {
    id: 'nvp-variantenstreit',
    norm: 'BGH VIII ZR 362/11',
    title: 'NVP‑Variantenstreit — 32 % Mehrkosten',
    teaser: 'Netzbetreiber benennt NVP 3,2 km entfernt — Alternative wäre 32 % günstiger.',
    context: [
      { key: 'akte',   label: 'PV Hofgut Krautheim · 2026-AKT-091' },
      { key: 'anlage', label: 'PV‑Freifläche 4,8 MW' },
      { key: 'param',  label: 'NB‑NVP: Umspannwerk Krautheim (3,2 km)' },
      { key: 'ibn',    label: 'Anschlussbegehren 02/2026' },
    ],
    question: 'Netzbetreiber benennt NVP 3,2 km entfernt. Alternative 1,1 km wäre 32 % günstiger. Rechtsmissbrauch?',
    answerHTML: `
      <p>32 % Mehrkosten überschreiten die Erheblichkeitsschwelle deutlich — Wahl ist mit hoher Wahrscheinlichkeit anfechtbar.</p>
      <p><b>Maßstab BGH VIII ZR 362/11 vom 10.10.2012:</b> Netzbetreiber muss „technisch und wirtschaftlich günstigsten" NVP wählen (§ 8 Abs. 1 EEG); rechtsmissbräuchlich, wenn zumutbare Alternative wesentlich günstiger.</p>
      <p><b>Erheblichkeitsschwelle in der Rechtsprechung:</b></p>
      <ul>
        <li><b>LG Verden 23.02.2015 (10 O 57/12):</b> 23,06 % — kein Missbrauch</li>
        <li><b>Konsensschwelle ca. 25 %</b></li>
        <li><b>32 % (Ihre Akte):</b> klare Missbrauchsindikation</li>
        <li><b>LG Paderborn 04.02.2015 (3 O 439/11):</b> &gt; 40 % — Missbrauch bejaht</li>
        <li><b>BGH 2012:</b> 60 % „nicht unerheblich"</li>
      </ul>
      <p><b>Prüfungspfad:</b></p>
      <ol>
        <li>Auskunftsanspruch § 16 EEG — NVP‑Kostenkalkulation anfordern</li>
        <li>Eigene Kalkulation mit Ingenieurbüro, Zumutbarkeit Alternative belegen</li>
        <li>Clearingstelle § 81 — kostenfrei für Anlagenbetreiber, hemmt Verjährung</li>
        <li>EEG 2027‑Vorausschau: § 18 prognosebasierter Ausbau + § 17 BKZ ändern Landschaft</li>
      </ol>
      <p><b>Kostenfolge:</b> 4,8 MW × ca. 60 €/kW NVP‑Kosten ≈ 288.000 € — 32 % = <b>~ 92.000 € einsparbar</b>, plus 4–8 Monate Bauzeit.</p>
      <p><i>Neue Option im EEG 2027‑E:</i> Baukostenzuschuss (§ 17 EEG‑E) erlaubt erstmals, durch Beitrag günstigeren NVP zu erschließen — strategische Alternative zum Variantenstreit.</p>
    `,
    sources: [
      { norm: 'BGH VIII ZR 362/11', kind: 'Urteil', kindColor: 'var(--info-500)',
        quote: 'Variantenvergleich beim NVP — Kostendifferenz 60 % ist nicht unerheblich; Wahl rechtsmissbräuchlich.',
        meta: 'BGH · 10.10.2012' },
      { norm: 'LG Paderborn 3 O 439/11', kind: 'Urteil', kindColor: 'var(--info-500)',
        quote: 'Mehrkosten > 40 % begründen Missbrauch der NVP‑Wahl.',
        meta: 'LG Paderborn · 04.02.2015' },
      { norm: 'LG Verden 10 O 57/12', kind: 'Urteil', kindColor: 'var(--info-500)',
        quote: '23,06 % Mehrkosten — noch kein Missbrauch; Schwelle bei ca. 25 %.',
        meta: 'LG Verden · 23.02.2015' },
      { norm: '§ 8 Abs. 1 EEG', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Netzbetreiber haben den technisch und wirtschaftlich günstigsten Netzverknüpfungspunkt zuzuweisen.',
        meta: 'EEG 2023' },
      { norm: '§ 16 EEG', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Auskunftspflicht des Netzbetreibers über NVP‑Wahl und Kostenkalkulation.',
        meta: 'EEG 2023' },
      { norm: 'BGH 2024 Reservierung', kind: 'Urteil', kindColor: 'var(--info-500)',
        quote: 'Erstmals Wirksamkeit von Kapazitätsreservierungen gegenüber konkurrierenden Anschlussbegehrenden bejaht.',
        meta: 'BGH 2024 · EEG' },
    ],
    cascade: {
      kind: 'entscheidungsbaum',
      title: 'NVP‑Erheblichkeitsschwelle',
      steps: [
        { era: '≤ 23 %', norm: 'LG Verden',    text: 'Kein Missbrauch' },
        { era: '~ 25 %', norm: 'Schwelle',     text: 'Konsensbereich' },
        { era: '32 %',   norm: 'Ihre Akte',    text: 'Missbrauch wahrscheinlich' },
        { era: '> 40 %', norm: 'LG Paderborn', text: 'Klarer Missbrauch' },
        { era: '60 %',   norm: 'BGH',          text: 'Nicht unerheblich' },
      ],
    },
  },

  /* =========================================================
   * 14) Mieterstrom EuGH/BGH — Umstrukturierungs-Fahrplan
   * ========================================================= */
  {
    id: 'mieterstrom-update',
    norm: '§ 118 Abs. 7 EnWG',
    title: 'Kundenanlage — Umstrukturierungs‑Fahrplan',
    teaser: 'Quartiers‑Mieterstrom 3 Gebäude / 87 WE — Bis 31.12.2028 umstrukturieren. Wie?',
    context: [
      { key: 'akte',   label: 'WBG Tempelhof eG · 2026-AKT-044' },
      { key: 'anlage', label: 'PV 84 kWp · 3 Gebäude · 87 WE' },
      { key: 'param',  label: 'ähnlich BGH Zwickau-Fall' },
      { key: 'ibn',    label: 'IBN 06/2022' },
    ],
    question: 'Quartiers‑Mieterstrom über 3 Gebäude. Wie nutzen wir die Übergangsfrist bis 31.12.2028 und welche Strukturalternative ist optimal?',
    answerHTML: `
      <p>Übergangsfrist großzügig, Restrukturierungsaufwand erheblich. Konstellation entspricht weitgehend BGH EnVR 83/20 (Zwickau).</p>
      <p><b>Vier Optionen — Bewertung:</b></p>
      <p><b>1. Aufspaltung in 3 separate Mieterstrom‑Modelle pro Gebäude (empfohlen)</b></p>
      <ul>
        <li>Pro: § 21 EEG Mieterstromzuschlag bleibt; klare § 42a EnWG‑Konstruktion</li>
        <li>Contra: 3 separate Messsysteme, Skaleneffekte verloren</li>
        <li>Aufwand: 18–24 Monate</li>
      </ul>
      <p><b>2. Geschlossenes Verteilernetz § 110 EnWG</b> — BNetzA‑Antrag, bei Wohnnutzung restriktiv (eher gewerblich/industriell)</p>
      <p><b>3. Gemeinschaftliche Gebäudeversorgung § 42b EnWG</b> — nur bei einheitlichem Eigentum auf demselben Grundstück; kein Mieterstromzuschlag</p>
      <p><b>4. Energy Sharing § 42c EnWG‑E (EEG 2027)</b> — verfügbar ab 01.01.2027; „Stromproduzenten als Hauptgeschäft grundsätzlich ausgeschlossen" (BWE‑Kritik) — WBG als Mieterversorger sollte aber qualifizieren</p>
      <p><b>Empfehlung — gestaffelter Fahrplan:</b></p>
      <ol>
        <li><b>Q3 2026:</b> Strukturanalyse — Grundstücksgrenzen, Trennbarkeit Stromtrassen</li>
        <li><b>Q1 2027:</b> Entscheidung für Variante 1 (Aufspaltung) oder 4 (Energy Sharing); Bauantrag</li>
        <li><b>Q3 2027:</b> Mieter‑Information, Vertragsneufassung (Mieterstrom‑Höchstlaufzeit 2 J § 42a EnWG hilft)</li>
        <li><b>Q1–Q3 2028:</b> Technische Umrüstung, Messkonzepte, neue § 21 Abs. 3‑Anmeldungen</li>
        <li><b>31.12.2028:</b> Frist Ende — neue Struktur muss laufen</li>
      </ol>
      <p><i>Wirtschaftlich:</i> EEG 2027 streicht Einspeisevergütung — Eigenverbrauch/Mieterstrom wird relativ wertvoller. Direktvermarktungspflicht &gt; 25 kW erhöht Aufwand — Aufspaltung &lt; 25 kW je Gebäude leichter.</p>
    `,
    sources: [
      { norm: 'EuGH C‑293/23', kind: 'Urteil', kindColor: 'var(--info-500)',
        quote: '§ 3 Nr. 24a EnWG europarechtswidrig — Mehrgebäude‑Strukturen fallen unter Verteilernetz Art. 2 Nr. 28 RL (EU) 2019/944.',
        meta: 'EuGH · 28.11.2024' },
      { norm: 'BGH EnVR 83/20', kind: 'Urteil', kindColor: 'var(--info-500)',
        quote: 'Versorgungsinfrastruktur Wohnanlage Zwickau (96 + 160 WE, 288 + 480 MWh/a) als Verteilernetz eingestuft.',
        meta: 'BGH · 13.05.2025' },
      { norm: '§ 118 Abs. 7 EnWG n. F.', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Bestandsanlagen bis 31.12.2025 gelten bis 31.12.2028 als Kundenanlage fort.',
        meta: 'EnWG · Bundesrat 21.11.2025' },
      { norm: '§ 42b EnWG', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Gemeinschaftliche Gebäudeversorgung — nur bei einheitlichem Eigentum auf demselben Grundstück.',
        meta: 'EnWG · Solarpaket I' },
      { norm: '§ 42c EnWG‑E', kind: 'Entwurf', kindColor: 'var(--warn-500)',
        quote: 'Energy Sharing über öffentliches Netz — Stromproduzenten als Hauptgeschäft grundsätzlich ausgeschlossen.',
        meta: 'EEG 2027‑E' },
      { norm: 'BSW‑Leitfaden', kind: 'Praxis', kindColor: 'var(--info-500)',
        quote: 'Gemeinschaftliche Gebäudeversorgung — Leitfaden + Mustervertrag.',
        meta: 'Bundesverband Solarwirtschaft · 2024' },
    ],
    cascade: {
      kind: 'zeitstrahl',
      title: 'Mieterstrom‑Umstrukturierungs‑Fahrplan',
      steps: [
        { era: '11/2024',    norm: 'EuGH',      text: 'Kundenanlage europarechtswidrig' },
        { era: '05/2025',    norm: 'BGH',       text: 'Zwickau‑Fall bestätigt' },
        { era: '11/2025',    norm: 'Bundesrat', text: '§ 118 Abs. 7 Übergangsregel' },
        { era: 'Q3/2026',    norm: 'Analyse',   text: 'Strukturanalyse + Modellvergleich' },
        { era: '01/2027',    norm: 'EEG 2027',  text: '§ 42c Energy Sharing verfügbar' },
        { era: '2028',       norm: 'Umrüstung', text: 'Umsetzung neue Struktur' },
        { era: '31.12.2028', norm: 'Stichtag',  text: 'Übergangsfrist endet' },
      ],
    },
  },

  /* =========================================================
   * 15) Pachtvertrag Freiflächen-PV — Heimfall & Rückbau
   * ========================================================= */
  {
    id: 'pachtvertrag',
    norm: '§ 35 BauGB / BGB',
    title: 'Pachtvertrag Freiflächen‑PV',
    teaser: 'Landwirt verpachtet 8 ha für Solarpark — welche Klauseln sind kritisch?',
    context: [
      { key: 'akte',   label: 'Hof Brandt ↔ SolarInvest · 2026-AKT-138' },
      { key: 'anlage', label: 'PV‑Freifläche 7,2 MW · 8,4 ha' },
      { key: 'param',  label: 'Pachtdauer 30 J · 3.800 €/ha/Jahr' },
      { key: 'ibn',    label: 'geplante IBN 2028' },
    ],
    question: 'Ein Landwirt will 8,4 ha Ackerfläche für 30 Jahre an einen Projektierer für einen Solarpark verpachten. Welche Vertragsklauseln muss ich für den Verpächter besonders prüfen?',
    answerHTML: `
      <p>Sieben Klauselgruppen entscheiden über das Risiko des Verpächters — die meisten Streitigkeiten entstehen am Vertragsende, nicht am Anfang.</p>
      <p><b>1. Rückbau & Sicherheit (kritisch):</b> Rückbauverpflichtung des Pächters muss durch <b>insolvenzfeste Sicherheit</b> abgesichert sein — Bankbürgschaft oder Rückbaubürgschaft, <i>nicht</i> nur Patronatserklärung der Muttergesellschaft. Höhe: aktuelle Rückbaukostenschätzung mit Indexierung (Baukostenindex). Ohne Sicherheit trägt bei Projektierer‑Insolvenz der Verpächter das Rückbaurisiko (oft 80.000–150.000 €/MW). Bezug: § 35 Abs. 5 S. 2 BauGB (Rückbauverpflichtung im Außenbereich) + Rückbaubürgschaft als übliche Genehmigungsauflage.</p>
      <p><b>2. Heimfall & Eigentum an Komponenten:</b> Klarstellen, dass Module/Trafostationen <b>Scheinbestandteile</b> nach § 95 BGB bleiben (kein Eigentumsübergang auf Grundstückseigentümer). Sonst Haftungs‑ und Steuerrisiko für Verpächter.</p>
      <p><b>3. Dingliche Sicherung:</b> Pächter verlangt i. d. R. <b>beschränkte persönliche Dienstbarkeit</b> (§ 1090 BGB) im Grundbuch — für Bankfinanzierung nötig. Verpächter sollte auf <b>Rangrücktritts‑ und Rückgewähransprüche</b> bei Vertragsende achten und Löschungsbewilligung absichern (Notaranderkonto‑Hinterlegung).</p>
      <p><b>4. Pachtzins‑Anpassung:</b> Indexierung (VPI) + Beteiligung an Mehrerlös bei Repowering. Wertsicherungsklausel muss Preisklauselgesetz § 1 entsprechen (sonst unwirksam).</p>
      <p><b>5. § 6 EEG‑Beteiligung der Gemeinde:</b> Klären, wer die 0,2 ct/kWh trägt — i. d. R. Projektierer, aber Vertrag sollte das ausdrücklich dem Pächter zuweisen, damit der Verpächter nicht in Regress gerät.</p>
      <p><b>6. Bauleitplanung & Bedingung:</b> Pachtvertrag unter aufschiebender Bedingung des wirksamen B‑Plans (Freiflächen‑PV i. d. R. nicht nach § 35 Abs. 1 BauGB privilegiert, außer 200‑m‑Streifen Autobahn/Schiene oder ≤ 2,5 ha besondere Solaranlage). Ohne B‑Plan kein Bau.</p>
      <p><b>7. GAP / steuerliche Folgen:</b> Flächenentzug beendet GAP‑Direktzahlungen für die Fläche; gewerbliche Verpachtung kann Hofeigenschaft und § 13a EStG‑Pauschalierung berühren — Steuerberater hinzuziehen.</p>
      <p><i>Empfehlung:</i> Rückbausicherheit + Scheinbestandteil‑Klausel + B‑Plan‑Bedingung sind die drei „Dealbreaker", an denen der Verpächter nicht nachgeben sollte. Mustervertrag des Bauernverbands / Fachverband Biogas als Ausgangspunkt, aber individuell anpassen.</p>
    `,
    sources: [
      { norm: '§ 35 Abs. 5 S. 2 BauGB', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Für Vorhaben nach Absatz 1 Nr. 2 bis 6 ist als weitere Zulässigkeitsvoraussetzung eine Verpflichtungserklärung zum Rückbau abzugeben.',
        meta: 'BauGB' },
      { norm: '§ 95 BGB', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Zu den Bestandteilen eines Grundstücks gehören solche Sachen nicht, die nur zu einem vorübergehenden Zweck mit dem Grund und Boden verbunden sind (Scheinbestandteile).',
        meta: 'BGB · Scheinbestandteil' },
      { norm: '§ 1090 BGB', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Ein Grundstück kann in der Weise belastet werden, dass derjenige, zu dessen Gunsten die Belastung erfolgt, berechtigt ist, das Grundstück in einzelnen Beziehungen zu benutzen (beschränkte persönliche Dienstbarkeit).',
        meta: 'BGB · dingliche Sicherung' },
      { norm: '§ 1 PrKG', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: 'Der Betrag von Geldschulden darf nicht unmittelbar und selbsttätig durch den Preis von Gütern bestimmt werden — Wertsicherungsklauseln nur unter engen Voraussetzungen.',
        meta: 'Preisklauselgesetz' },
      { norm: '§ 6 EEG 2023', kind: 'Gesetz', kindColor: 'var(--ink-5)',
        quote: '0,2 ct/kWh an Standortgemeinden — vertragliche Zuweisung der Kostentragung an den Anlagenbetreiber/Pächter empfohlen.',
        meta: 'EEG 2023' },
      { norm: 'Mustervertrag DBV', kind: 'Praxis', kindColor: 'var(--info-500)',
        quote: 'Mustervertrag Flächennutzung für Photovoltaik‑Freiflächenanlagen — Deutscher Bauernverband, mit Hinweisen zu Rückbausicherheit und Pachtzinsindexierung.',
        meta: 'DBV / Fachverband · 2024' },
    ],
    cascade: {
      kind: 'checkliste',
      title: 'Pachtvertrag‑Prüfpunkte für den Verpächter',
      steps: [
        { era: 'Klausel 1', norm: 'Rückbau',        text: 'Insolvenzfeste Bürgschaft, indexiert' },
        { era: 'Klausel 2', norm: '§ 95 BGB',       text: 'Module bleiben Scheinbestandteil' },
        { era: 'Klausel 3', norm: '§ 1090 BGB',     text: 'Dienstbarkeit + Rückgewähr absichern' },
        { era: 'Klausel 4', norm: 'Pachtzins',      text: 'VPI‑Index + Repowering‑Beteiligung' },
        { era: 'Klausel 5', norm: '§ 6 EEG',        text: 'Gemeindebeteiligung dem Pächter zuweisen' },
        { era: 'Klausel 6', norm: 'B‑Plan',         text: 'Aufschiebende Bedingung wirksamer B‑Plan' },
        { era: 'Klausel 7', norm: 'GAP/Steuer',     text: 'Direktzahlungen + § 13a EStG prüfen' },
      ],
    },
  },

  /* =========================================================
   * 16) PPA-Klauselcheck — Corporate PPA Risikoprüfung
   * ========================================================= */
  {
    id: 'ppa-check',
    norm: 'Corporate PPA',
    title: 'PPA‑Klauselcheck Industrieabnehmer',
    teaser: '10‑j. Corporate‑PPA 7,2 ct/kWh — welche Klauseln bergen Risiken im EEG‑2027‑Umfeld?',
    context: [
      { key: 'akte',   label: 'Solarpark ↔ Industrie AG · 2026-AKT-144' },
      { key: 'anlage', label: 'PV‑Freifläche 12 MW' },
      { key: 'param',  label: 'Pay‑as‑produced · 7,2 ct/kWh · 10 J' },
      { key: 'ibn',    label: 'IBN 2027 · CfD-pflichtig' },
    ],
    question: 'Ein 12‑MW‑Solarpark schließt einen 10‑jährigen Corporate‑PPA (pay‑as‑produced, 7,2 ct/kWh) mit einem Industrieabnehmer. IBN 2027. Welche Klauseln sind im neuen EEG‑2027‑Umfeld besonders riskant?',
    answerHTML: `
      <p>Der PPA selbst ist Standard — die Risiken entstehen aus der <b>Wechselwirkung mit dem Refinanzierungsbeitrag § 20a</b> und neuen Marktmechanismen. Sechs Prüfpunkte:</p>
      <p><b>1. CfD/PPA‑Falle (§ 21a Abs. 2 EEG 2027‑E) — kritisch:</b> Behält der Solarpark das Rückkehrrecht zur Förderung, ist trotz PPA‑Vermarktung der <b>Refinanzierungsbeitrag fällig</b>, sobald der Jahresmarktwert den anzulegenden Wert übersteigt. Bei 7,2 ct/kWh PPA und z. B. 5,8 ct/kWh CfD‑Wert: in Hochpreisjahren zahlt der Park RB an den Netzbetreiber, obwohl er nur 7,2 ct vom Abnehmer bekommt → Doppelbelastung. <b>Lösung prüfen:</b> Opt‑Out § 20b (unumkehrbar) vor PPA‑Abschluss, wenn dauerhaft auf PPA gesetzt wird.</p>
      <p><b>2. Negative‑Preis‑Klausel:</b> Wer trägt das Risiko bei negativen Spotpreisen? Im EEG 2027 entfällt die Vergütung sofort. PPA muss regeln, ob „pay‑as‑produced" auch in Negativstunden zahlt (Abnehmervorteil) oder aussetzt (Erzeugervorteil). Marktstandard 2026: Aussetzung + Verlängerungsmechanismus.</p>
      <p><b>3. Profil‑ & Mengenrisiko:</b> Pay‑as‑produced wälzt Volumenrisiko auf den Abnehmer. Bei Mengenabweichung &gt; ±10 % sollte Anpassungsmechanismus greifen. Bilanzkreis‑Zuordnung und Ausgleichsenergiekosten klar zuweisen.</p>
      <p><b>4. Herkunftsnachweise (HKN):</b> Ausdrücklich regeln, wer die Grünstrom‑Zertifikate (HKN‑Register UBA) erhält. Bei gefördertem Strom war HKN‑Ausstellung lange ausgeschlossen — im EEG 2027 teilweise geöffnet. Doppelvermarktungsverbot beachten.</p>
      <p><b>5. Change‑in‑Law‑Klausel:</b> Bei 10 J Laufzeit über die EEG‑2027‑Einführung hinweg zwingend. Wer trägt Mehrkosten aus § 20a, neuen Netzentgelten, Redispatch‑2.0‑Vorbehalt? Symmetrische Anpassungsklausel mit Neuverhandlungspflicht.</p>
      <p><b>6. Bonität & Sicherheiten:</b> Bei 10 J Industrieabnehmer — Patronatserklärung / Parent Company Guarantee, Step‑in‑Rights der finanzierenden Bank, Kündigungsrechte bei Rating‑Verschlechterung. Insolvenz des Abnehmers ist Hauptrisiko des Erzeugers (keine EEG‑Ausfallvergütung mehr im EEG 2027).</p>
      <p><i>Empfehlung:</i> Die § 21a‑Abs.‑2‑Falle ist der teuerste blinde Fleck — vor PPA‑Unterschrift zwingend modellieren (siehe CfD‑Simulator). Change‑in‑Law + Negativpreis‑Mechanik sind die zweitwichtigsten Verhandlungspunkte. EFET‑Musterrahmenvertrag (Corporate PPA) als Basis, deutsche EEG‑Spezifika ergänzen.</p>
    `,
    sources: [
      { norm: '§ 21a Abs. 2 EEG 2027‑E', kind: 'Entwurf', kindColor: 'var(--warn-500)',
        quote: 'Sonstige Direktvermarktung über PPA mit Rückkehrrecht zur Förderung: Refinanzierungsbeitrag bleibt fällig (Umgehungsverhinderung).',
        meta: 'BMWE‑Referentenentwurf' },
      { norm: '§ 20b EEG 2027‑E', kind: 'Entwurf', kindColor: 'var(--warn-500)',
        quote: 'Unumkehrbarer Ausstieg aus Förderung und Refinanzierungsbeitrag durch einmalige Erklärung in Textform.',
        meta: 'Referentenentwurf · Opt‑Out' },
      { norm: '§ 51 EEG 2027‑E', kind: 'Entwurf', kindColor: 'var(--warn-500)',
        quote: 'Sofortige Null‑Vergütung bei negativem Spotmarktpreis — Negativpreis‑Risikoverteilung im PPA explizit regeln.',
        meta: 'Referentenentwurf' },
      { norm: 'HKN‑Register UBA', kind: 'Praxis', kindColor: 'var(--info-500)',
        quote: 'Herkunftsnachweisregister des Umweltbundesamts — Doppelvermarktungsverbot zwischen Förderung und Grünstromzertifikaten beachten.',
        meta: 'Umweltbundesamt' },
      { norm: 'EFET Corporate PPA', kind: 'Praxis', kindColor: 'var(--info-500)',
        quote: 'European Federation of Energy Traders — Musterrahmenvertrag für Corporate Power Purchase Agreements, an deutsche EEG‑Spezifika anzupassen.',
        meta: 'EFET · efet.org' },
      { norm: 'Art. 19d EBM‑VO', kind: 'EU‑Recht', kindColor: 'var(--info-500)',
        quote: 'Verpflichtung zu zweiseitigen Differenzverträgen für direkte Preisstützung — treibt die CfD/PPA‑Wechselwirkung.',
        meta: 'EU‑Strombinnenmarkt‑VO 2024/1747' },
    ],
    cascade: {
      kind: 'entscheidungsbaum',
      title: 'PPA‑Klauselrisiken im EEG‑2027‑Umfeld',
      steps: [
        { era: 'Risiko 1', norm: '§ 21a Abs. 2', text: 'CfD/PPA‑Falle — RB trotz PPA' },
        { era: 'Risiko 2', norm: '§ 51',         text: 'Negativpreis‑Risikoverteilung' },
        { era: 'Risiko 3', norm: 'Profil',       text: 'Mengen‑/Bilanzkreisrisiko' },
        { era: 'Risiko 4', norm: 'HKN',          text: 'Doppelvermarktungsverbot' },
        { era: 'Risiko 5', norm: 'Change‑in‑Law', text: 'Symmetrische Anpassung' },
        { era: 'Risiko 6', norm: 'Bonität',      text: 'Step‑in + Insolvenzschutz' },
      ],
    },
  },
];

// Suggested questions for empty state (in walkthrough order)
window.SUGGESTIONS = window.STORIES.map(s => ({
  id: s.id,
  norm: s.norm,
  title: s.title,
  teaser: s.teaser,
}));

// Pinned set for the launcher empty-state grid (most impressive demos first)
window.PINNED = ['mastr-45538', 'stichtag-2027', 'cfd-20a', 'netzpaket', 'mieterstrom-update', 'paragraf-6'];
