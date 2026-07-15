/* EEGbot B2C — Anlagenprofil in localStorage (Vor-Supabase-Persistenz).
   Nur MeineAnlage.jsx schreibt; alle anderen Screens lesen on-mount.
   Schema deckt ALLE Engine-Inputs ab (fristen, schwellen, verguetung, ue20). */

(function () {
  const VERSION = 2;
  const KEY = 'eegbot.anlage.v2';
  const LEGACY_KEYS = ['eegbot.anlage.v1'];
  const DATUM = /^\d{4}-\d{2}-\d{2}$/;
  const EINSPEISEART = new Set(['teileinspeisung', 'volleinspeisung']);
  const ANLAGENTYP = new Set(['dach', 'freiflaeche', 'steckersolar', 'fassade', 'sonstig']);

  const istDatum = (wert) => {
    if (typeof wert !== 'string' || !DATUM.test(wert)) return false;
    const datum = new Date(`${wert}T00:00:00Z`);
    return !Number.isNaN(datum.getTime()) && datum.toISOString().slice(0, 10) === wert;
  };
  const positiveZahl = (wert) => typeof wert === 'number' && Number.isFinite(wert) && wert > 0;

  const validiere = (roh) => {
    if (!roh || typeof roh !== 'object' || Array.isArray(roh)) return { erfolg: false, fehler: 'Profil ist kein Objekt.' };
    const p = { ...roh, schema_version: VERSION };
    if (!positiveZahl(p.leistung_kwp)) return { erfolg: false, fehler: 'Leistung muss größer als 0 kWp sein.' };
    if (!istDatum(p.ibn_datum)) return { erfolg: false, fehler: 'Inbetriebnahme ist kein gültiges Datum.' };
    if (!EINSPEISEART.has(p.einspeiseart)) return { erfolg: false, fehler: 'Einspeiseart ist ungültig.' };
    if (p.anlagentyp != null && !ANLAGENTYP.has(p.anlagentyp)) return { erfolg: false, fehler: 'Anlagentyp ist ungültig.' };
    if (typeof p.mastr_registriert !== 'boolean' || typeof p.veraeusserungsform_gemeldet !== 'boolean')
      return { erfolg: false, fehler: 'Meldestatus fehlt.' };
    if (p.mastr_registrierung_datum != null && !istDatum(p.mastr_registrierung_datum))
      return { erfolg: false, fehler: 'MaStR-Registrierungsdatum ist ungültig.' };
    for (const feld of ['wechselrichter_va', 'jahresertrag_kwh', 'strompreis_ct_kwh'])
      if (p[feld] != null && !positiveZahl(p[feld])) return { erfolg: false, fehler: `${feld} muss größer als 0 sein.` };
    if (p.eigenverbrauchsanteil_prozent != null &&
        (typeof p.eigenverbrauchsanteil_prozent !== 'number' || !Number.isFinite(p.eigenverbrauchsanteil_prozent) || p.eigenverbrauchsanteil_prozent < 0 || p.eigenverbrauchsanteil_prozent > 100))
      return { erfolg: false, fehler: 'Eigenverbrauch muss zwischen 0 und 100 % liegen.' };
    if (p.volleinspeisung_gemeldet_fuer_jahr == null) p.volleinspeisung_gemeldet_fuer_jahr = [];
    if (!Array.isArray(p.volleinspeisung_gemeldet_fuer_jahr) ||
        !p.volleinspeisung_gemeldet_fuer_jahr.every((j) => Number.isInteger(j) && j >= 2000 && j <= 2200))
      return { erfolg: false, fehler: 'Bestätigte Volleinspeisungs-Jahre sind ungültig.' };
    return { erfolg: true, profil: p };
  };

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
    let gelesenerKey = KEY;
    try {
      let raw = localStorage.getItem(KEY);
      let legacyKey = null;
      if (!raw) {
        legacyKey = LEGACY_KEYS.find((key) => localStorage.getItem(key));
        gelesenerKey = legacyKey || KEY;
        raw = legacyKey ? localStorage.getItem(legacyKey) : null;
      }
      if (!raw) return null;
      const ergebnis = validiere(JSON.parse(raw));
      if (!ergebnis.erfolg) {
        localStorage.removeItem(legacyKey || KEY);
        return null;
      }
      // Valide v1-Profile werden einmalig nach v2 migriert.
      localStorage.setItem(KEY, JSON.stringify(ergebnis.profil));
      if (legacyKey) localStorage.removeItem(legacyKey);
      return ergebnis.profil;
    } catch {
      localStorage.removeItem(gelesenerKey);
      return null;
    }
  };

  const speichere = (profil) => {
    const ergebnis = validiere(profil);
    if (!ergebnis.erfolg) throw new Error(ergebnis.fehler);
    localStorage.setItem(KEY, JSON.stringify(ergebnis.profil));
    return ergebnis.profil;
  };

  const loesche = () => {
    localStorage.removeItem(KEY);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  };

  /* Minimalanforderung, damit fristen/schwellen/verguetung rechnen können */
  const vollstaendig = (p) =>
    validiere(p).erfolg;

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

  window.EEGBOT_PROFIL = { VERSION, KEY, lade, speichere, loesche, validiere, vollstaendig, beispiel, bghZwilling, FRIST_STATUS, FRIST_LABEL };
})();
