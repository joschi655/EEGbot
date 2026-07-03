/* fink app — demo data (fictional, German EEG compliance domain) */
window.FINK_DATA = {
  user: { name: 'Lena Brandt', role: 'Compliance Lead', org: 'Klima Energie GmbH' },

  kpis: {
    conformity: 94,
    conformityDelta: '+2,1 %',
    openDeadlines: 7,
    openDelta: '3 neu',
    assets: 48,
    capacity: '186,4',
  },

  // Anlagen (plants)
  assets: [
    { id: 'SEE901134', name: 'Solarpark Lausitz',     tech: 'pv',   power: '12.480 kWp', region: 'Brandenburg',        status: 'compliant', open: 0, next: 'Quartalsmeldung · 31.07.2026' },
    { id: 'WEE774220', name: 'Windpark Nordsee II',    tech: 'wind', power: '24.000 kW',  region: 'Niedersachsen',      status: 'overdue',   open: 2, next: 'MaStR-Aktualisierung · überfällig' },
    { id: 'SEE552310', name: 'Solarpark Hochfranken',  tech: 'pv',   power: '8.900 kWp',  region: 'Bayern',             status: 'pending',   open: 1, next: 'EEG-Umlage Nachweis · 18.06.2026' },
    { id: 'WEE118903', name: 'Windpark Eifel',         tech: 'wind', power: '15.600 kW',  region: 'Rheinland-Pfalz',    status: 'compliant', open: 0, next: 'Jahresmeldung · 28.02.2027' },
    { id: 'SEE889201', name: 'Agri-PV Uckermark',      tech: 'pv',   power: '5.200 kWp',  region: 'Brandenburg',        status: 'pending',   open: 1, next: 'Inbetriebnahme-Meldung · 21.06.2026' },
    { id: 'WEE330145', name: 'Windpark Ostsee',        tech: 'wind', power: '30.200 kW',  region: 'Mecklenburg-Vorp.',  status: 'compliant', open: 0, next: 'Quartalsmeldung · 31.07.2026' },
    { id: 'SEE640772', name: 'Solarpark Rheinaue',     tech: 'pv',   power: '11.100 kWp', region: 'Nordrhein-Westf.',   status: 'compliant', open: 0, next: 'Redispatch-Nachweis · 15.08.2026' },
    { id: 'BEE201554', name: 'Biogas Wendland',        tech: 'bio',  power: '2.400 kW',   region: 'Niedersachsen',      status: 'pending',   open: 1, next: 'Einsatzstoff-Tagebuch · 30.06.2026' },
  ],

  // Fristen (deadlines)
  deadlines: [
    { id: 'd1', asset: 'Windpark Nordsee II',   ref: '§ 71 EEG',  task: 'MaStR-Stammdaten aktualisieren',      due: '2026-06-08', status: 'overdue',  days: -4 },
    { id: 'd2', asset: 'Windpark Nordsee II',   ref: '§ 21c EEG', task: 'Direktvermarktung Nachweis',          due: '2026-06-09', status: 'overdue',  days: -3 },
    { id: 'd3', asset: 'Solarpark Hochfranken', ref: '§ 19 EEG',  task: 'EEG-Umlage Nachweis einreichen',      due: '2026-06-18', status: 'pending',  days: 6 },
    { id: 'd4', asset: 'Agri-PV Uckermark',     ref: '§ 5 EEG',   task: 'Inbetriebnahme-Meldung',              due: '2026-06-21', status: 'pending',  days: 9 },
    { id: 'd5', asset: 'Biogas Wendland',       ref: '§ 44b EEG', task: 'Einsatzstoff-Tagebuch übermitteln',   due: '2026-06-30', status: 'pending',  days: 18 },
    { id: 'd6', asset: 'Solarpark Lausitz',     ref: '§ 71 EEG',  task: 'Quartalsmeldung Q2',                  due: '2026-07-31', status: 'upcoming', days: 49 },
    { id: 'd7', asset: 'Solarpark Rheinaue',    ref: '§ 13a EnWG',task: 'Redispatch 2.0 Nachweis',             due: '2026-08-15', status: 'upcoming', days: 64 },
  ],

  // AI-detected obligations for the asset-detail screen (Solarpark Lausitz)
  obligations: [
    { ref: '§ 71 EEG 2023', title: 'Quartalsweise Mengenmeldung', detail: 'Eingespeiste Strommengen quartalsweise an den Netzbetreiber melden.', done: true },
    { ref: '§ 19 EEG 2023', title: 'Nachweis EEG-Umlage Eigenversorgung', detail: 'Jährlicher Nachweis der eigenverbrauchten Mengen.', done: true },
    { ref: '§ 9 EEG 2023',  title: 'Technische Vorgaben Einspeisemanagement', detail: 'Fernsteuerbarkeit der Anlage nachweisen.', done: true },
    { ref: '§ 71 EEG 2023', title: 'Quartalsmeldung Q2 2026', detail: 'Fällig zum 31.07.2026 — Entwurf von fink vorbereitet.', done: false },
  ],

  activity: [
    { who: 'fink', icon: 'sparkles', text: 'hat 12 neue Pflichten aus dem EEG 2023 erkannt', when: 'vor 2 Std.' },
    { who: 'Lena Brandt', icon: 'check', text: 'Quartalsmeldung Q1 für Solarpark Lausitz eingereicht', when: 'gestern' },
    { who: 'fink', icon: 'file-text', text: 'Entwurf für MaStR-Aktualisierung erstellt', when: 'gestern' },
    { who: 'System', icon: 'bell', text: 'Frist „EEG-Umlage Nachweis" in 6 Tagen', when: 'vor 2 Tagen' },
  ],
};
