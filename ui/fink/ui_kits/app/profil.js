/* EEGbot B2C — Anlagenprofil in localStorage (Vor-Supabase-Persistenz).
   Nur MeineAnlage.jsx schreibt; alle anderen Screens lesen on-mount.
   Schema deckt ALLE Engine-Inputs ab (fristen, schwellen, verguetung, ue20). */

(function () {
  const KEY = 'eegbot.anlage.v1';

  /* Engine-Status (pruefeFristen) → Design-System-Badge-Tone */
  const FRIST_STATUS = {
    ueberschritten: 'overdue',
    offen: 'pending',
    erledigt: 'compliant',
  };
  const FRIST_LABEL = {
    ueberschritten: 'Überschritten',
    offen: 'Offen',
    erledigt: 'Erledigt',
  };

  const lade = () => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const speichere = (profil) => {
    localStorage.setItem(KEY, JSON.stringify(profil));
    return profil;
  };

  const loesche = () => localStorage.removeItem(KEY);

  /* Minimalanforderung, damit fristen/schwellen/verguetung rechnen können */
  const vollstaendig = (p) =>
    !!(p && p.ibn_datum && p.leistung_kwp && p.einspeiseart &&
       typeof p.mastr_registriert === 'boolean' && typeof p.veraeusserungsform_gemeldet === 'boolean');

  /* Typische private Dachanlage — konform, zeigt den Gutzustand. */
  const beispiel = () => ({
    name: 'PV-Dachanlage Musterweg 12',
    energietraeger: 'solar',
    anlagentyp: 'dach',
    leistung_kwp: 9.8,
    ibn_datum: '2023-05-10',
    einspeiseart: 'teileinspeisung',
    plz: '80331',
    mastr_registriert: true,
    mastr_registrierung_datum: '2023-05-20',
    veraeusserungsform_gemeldet: true,
    imsys_vorhanden: false,
    jahresertrag_kwh: 9300,
    eigenverbrauchsanteil_prozent: 35,
    strompreis_ct_kwh: 35,
  });

  /* Nachbau des BGH-Falls XIII ZR 1/21 (Demo-Star): 103,5 kWp, Meldeverstoß
     geheilt — Rückforderungs-Check zeigt 6.417 € statt geforderter 45.540 €. */
  const bghZwilling = () => ({
    name: 'BGH-Zwilling (XIII ZR 1/21)',
    energietraeger: 'solar',
    anlagentyp: 'dach',
    leistung_kwp: 103.5,
    ibn_datum: '2022-10-20',
    einspeiseart: 'volleinspeisung',
    plz: '',
    mastr_registriert: true,
    mastr_registrierung_datum: '2026-07-05',
    veraeusserungsform_gemeldet: true,
    imsys_vorhanden: false,
    jahresertrag_kwh: 98000,
    eigenverbrauchsanteil_prozent: 0,
    strompreis_ct_kwh: 35,
  });

  window.EEGBOT_PROFIL = { lade, speichere, loesche, vollstaendig, beispiel, bghZwilling, FRIST_STATUS, FRIST_LABEL };
})();
