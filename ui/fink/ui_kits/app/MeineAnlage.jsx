/* EEGbot app — Meine Anlage: das eine Formular, das alle Screens füttert.
   Einziger Schreiber von window.EEGBOT_PROFIL (localStorage). Rechts:
   Zusammenfassung, Schwellen-Befunde (/api/schwellen) und Rechtsregime-
   Karte (/api/uebergangsrecht — § 100 Versteinerung). */

const MA_EINSPEISEART = [
  ['teileinspeisung', 'Überschusseinspeisung (Eigenverbrauch + Rest ins Netz)'],
  ['volleinspeisung', 'Volleinspeisung'],
];
const MA_ANLAGENTYP = [
  ['dach', 'Dachanlage'], ['freiflaeche', 'Freifläche'], ['steckersolar', 'Steckersolar (Balkonkraftwerk)'],
  ['fassade', 'Fassade'], ['sonstig', 'Sonstige'],
];

function MaProfilForm(p) {
  return {
    name: p?.name || '',
    leistung_kwp: p?.leistung_kwp != null ? String(p.leistung_kwp) : '',
    ibn_datum: p?.ibn_datum || '',
    einspeiseart: p?.einspeiseart || 'teileinspeisung',
    anlagentyp: p?.anlagentyp || 'dach',
    plz: p?.plz || '',
    mastr_registriert: !!p?.mastr_registriert,
    mastr_registrierung_datum: p?.mastr_registrierung_datum || '',
    veraeusserungsform_gemeldet: !!p?.veraeusserungsform_gemeldet,
    imsys_vorhanden: !!p?.imsys_vorhanden,
    wechselrichter_va: p?.wechselrichter_va != null ? String(p.wechselrichter_va) : '',
    jahresertrag_kwh: p?.jahresertrag_kwh != null ? String(p.jahresertrag_kwh) : '',
    eigenverbrauchsanteil_prozent: p?.eigenverbrauchsanteil_prozent != null ? String(p.eigenverbrauchsanteil_prozent) : '',
    strompreis_ct_kwh: p?.strompreis_ct_kwh != null ? String(p.strompreis_ct_kwh) : '',
  };
}

function MeineAnlage({ onNav }) {
  const { Card, Button, Input, Select, Switch, Badge, Tag } = window.FinkDesignSystem_4f2014;
  const [form, setForm] = React.useState(() => MaProfilForm(window.EEGBOT_PROFIL.lade()));
  const [gespeichert, setGespeichert] = React.useState(() => window.EEGBOT_PROFIL.lade());
  const [schwellen, setSchwellen] = React.useState(null);
  const [regime, setRegime] = React.useState(null);
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  const set = (k) => (ev) => setForm({ ...form, [k]: ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value });

  React.useEffect(() => {
    if (!gespeichert) { setSchwellen(null); setRegime(null); return; }
    let aktiv = true;
    fetch('/api/schwellen', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leistung_kwp: Number(gespeichert.leistung_kwp),
        ...(gespeichert.anlagentyp ? { anlagentyp: gespeichert.anlagentyp } : {}),
        ...(typeof gespeichert.imsys_vorhanden === 'boolean' ? { imsys_vorhanden: gespeichert.imsys_vorhanden } : {}),
        ...(gespeichert.ibn_datum ? { ibn_datum: gespeichert.ibn_datum } : {}),
        ...(gespeichert.wechselrichter_va ? { wechselrichter_va: Number(gespeichert.wechselrichter_va) } : {}),
      }),
    }).then((r) => r.json()).then((d) => aktiv && setSchwellen(Array.isArray(d) ? d : [])).catch(() => aktiv && setSchwellen([]));

    fetch(`/api/uebergangsrecht?ibn=${encodeURIComponent(gespeichert.ibn_datum)}`)
      .then((r) => r.json()).then((d) => aktiv && setRegime(d.fehler ? null : d)).catch(() => aktiv && setRegime(null));
    return () => { aktiv = false; };
  }, [gespeichert]);

  const speichern = () => {
    const p = {
      name: form.name || 'Meine Anlage',
      energietraeger: 'solar',
      anlagentyp: form.anlagentyp,
      leistung_kwp: Number(form.leistung_kwp),
      ibn_datum: form.ibn_datum,
      einspeiseart: form.einspeiseart,
      plz: form.plz,
      mastr_registriert: form.mastr_registriert,
      ...(form.mastr_registriert && form.mastr_registrierung_datum ? { mastr_registrierung_datum: form.mastr_registrierung_datum } : {}),
      veraeusserungsform_gemeldet: form.veraeusserungsform_gemeldet,
      imsys_vorhanden: form.imsys_vorhanden,
      ...(form.wechselrichter_va !== '' ? { wechselrichter_va: Number(form.wechselrichter_va) } : {}),
      ...(form.jahresertrag_kwh !== '' ? { jahresertrag_kwh: Number(form.jahresertrag_kwh) } : {}),
      ...(form.eigenverbrauchsanteil_prozent !== '' ? { eigenverbrauchsanteil_prozent: Number(form.eigenverbrauchsanteil_prozent) } : {}),
      ...(form.strompreis_ct_kwh !== '' ? { strompreis_ct_kwh: Number(form.strompreis_ct_kwh) } : {}),
    };
    window.EEGBOT_PROFIL.speichere(p);
    setGespeichert(p);
  };

  const vorlage = (p) => { setForm(MaProfilForm(p)); window.EEGBOT_PROFIL.speichere(p); setGespeichert(p); };
  const kannSpeichern = form.leistung_kwp !== '' && form.ibn_datum !== '';

  return (
    <AppShell active="anlage" onNav={onNav} title="Meine Anlage" subtitle="Einmal erfassen — Fristen, Vergütung und Checks rechnen damit">
      <div className="fk-screen">
        <div className="fk-screen__inner" style={{ display: 'grid', gridTemplateColumns: '380px minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
          <Card title="Anlagenprofil" subtitle="Bleibt lokal in diesem Browser (localStorage)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="fk-row" style={{ gap: 10 }}>
                <Button size="sm" variant="secondary" onClick={() => vorlage(window.EEGBOT_PROFIL.beispiel())}>Beispiel-Anlage</Button>
                <Button size="sm" variant="secondary" onClick={() => vorlage(window.EEGBOT_PROFIL.bghZwilling())}>BGH-Zwilling laden</Button>
              </div>
              <Input label="Bezeichnung" type="text" value={form.name} onChange={set('name')} hint="frei wählbar, z. B. „PV Dach Süd“" />
              <Input label="Leistung" suffix="kWp" type="number" value={form.leistung_kwp} onChange={set('leistung_kwp')} />
              <Input label="Inbetriebnahme" type="date" value={form.ibn_datum} onChange={set('ibn_datum')} hint="erstmalige Stromerzeugung, nicht Zählersetzung" />
              <Select label="Einspeiseart" value={form.einspeiseart} onChange={set('einspeiseart')}>
                {MA_EINSPEISEART.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
              <Select label="Anlagentyp" value={form.anlagentyp} onChange={set('anlagentyp')}>
                {MA_ANLAGENTYP.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
              <Input label="PLZ" type="text" value={form.plz} onChange={set('plz')} />
              <Switch label="Im Marktstammdatenregister registriert" checked={form.mastr_registriert} onChange={set('mastr_registriert')} />
              {form.mastr_registriert && (
                <Input label="MaStR-Registrierung am" type="date" value={form.mastr_registrierung_datum} onChange={set('mastr_registrierung_datum')} />
              )}
              <Switch label="Veräußerungsform an Netzbetreiber gemeldet" checked={form.veraeusserungsform_gemeldet} onChange={set('veraeusserungsform_gemeldet')} />
              <Switch label="Intelligentes Messsystem (Smart Meter) vorhanden" checked={form.imsys_vorhanden} onChange={set('imsys_vorhanden')} />
              <Input label="Wechselrichter-Scheinleistung" suffix="VA" type="number" value={form.wechselrichter_va} onChange={set('wechselrichter_va')} hint="nur für Steckersolar relevant" />
              <Input label="Jahresertrag" suffix="kWh" type="number" value={form.jahresertrag_kwh} onChange={set('jahresertrag_kwh')} />
              <div className="fk-row" style={{ gap: 10 }}>
                <Input label="Eigenverbrauch" suffix="%" type="number" value={form.eigenverbrauchsanteil_prozent} onChange={set('eigenverbrauchsanteil_prozent')} />
                <Input label="Strompreis" suffix="ct/kWh" type="number" value={form.strompreis_ct_kwh} onChange={set('strompreis_ct_kwh')} />
              </div>
              <Button fullWidth onClick={speichern} disabled={!kannSpeichern} iconLeft={<i data-lucide="save"></i>}>Profil speichern</Button>
              {gespeichert && (
                <Button fullWidth variant="ghost" onClick={() => { window.EEGBOT_PROFIL.loesche(); setGespeichert(null); setForm(MaProfilForm(null)); }}>
                  Profil löschen
                </Button>
              )}
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {!gespeichert && (
              <Card title="Noch kein Profil gespeichert" subtitle="Links ausfüllen oder eine Vorlage laden">
                <p style={{ font: 'var(--font-body)', color: 'var(--text-muted)', margin: 0 }}>
                  Sobald das Profil gespeichert ist, erscheinen hier Schwellen-Befunde und das für Ihre
                  Anlage geltende Rechtsregime (§ 100 EEG — „Versteinerung“ zum Inbetriebnahme-Datum).
                </p>
              </Card>
            )}

            {gespeichert && (
              <Card title={gespeichert.name} subtitle={`${Number(gespeichert.leistung_kwp).toLocaleString('de-DE')} kWp · IBN ${gespeichert.ibn_datum} · ${gespeichert.einspeiseart === 'volleinspeisung' ? 'Volleinspeisung' : 'Überschusseinspeisung'}`} tight>
                <div className="fk-facts">
                  <div className="fk-fact"><span className="fk-fact__k">MaStR-Registrierung</span><span className="fk-fact__v">{gespeichert.mastr_registriert ? <Badge tone="compliant">registriert{gespeichert.mastr_registrierung_datum ? ` am ${gespeichert.mastr_registrierung_datum}` : ''}</Badge> : <Badge tone="overdue">fehlt</Badge>}</span></div>
                  <div className="fk-fact"><span className="fk-fact__k">Veräußerungsform gemeldet</span><span className="fk-fact__v">{gespeichert.veraeusserungsform_gemeldet ? <Badge tone="compliant">gemeldet</Badge> : <Badge tone="overdue">fehlt</Badge>}</span></div>
                  {gespeichert.jahresertrag_kwh != null && <div className="fk-fact"><span className="fk-fact__k">Jahresertrag</span><span className="fk-fact__v">{Number(gespeichert.jahresertrag_kwh).toLocaleString('de-DE')} kWh</span></div>}
                </div>
              </Card>
            )}

            {regime && (
              <Card title={`Rechtsregime: ${regime.verguetungsregime?.bezeichnung || '—'}`} subtitle="§ 100 EEG — welche Gesetzesfassung für Ihre Anlage gilt">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(regime.normenkette || []).map((n, i) => (
                    <span key={i} style={{ font: 'var(--font-body)', color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{n}</span>
                  ))}
                  {(regime.durchbrechungen || []).length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ font: 'var(--weight-bold) var(--text-sm)/1.4 var(--font-sans)', color: 'var(--klein-600)' }}>Gilt trotzdem in aktueller Fassung:</span>
                      {(regime.durchbrechungen || []).map((d, i) => (
                        <div key={i} style={{ margin: '6px 0 0' }}>
                          <span style={{ font: 'var(--weight-bold) var(--font-body)', color: 'var(--text-primary)' }}>{d.norm}</span>
                          <Tag>{d.thema}</Tag>
                          <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', margin: '2px 0 0' }}>{d.hinweis}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {schwellen && schwellen.length > 0 && (
              <Card title="Schwellen-Befunde" subtitle="Welche Leistungsgrenzen für Ihre Anlage greifen">
                <div className="fk-facts">
                  {schwellen.map((s, i) => (
                    <div key={i} className="fk-fact" style={{ alignItems: 'flex-start' }}>
                      <span className="fk-fact__k" style={{ minWidth: 200 }}>{s.thema}</span>
                      <span className="fk-fact__v" style={{ textAlign: 'right', maxWidth: 460 }}>
                        {s.zutreffend === true ? <Badge tone="pending">trifft zu</Badge> : <Badge tone="neutral">nicht relevant</Badge>}
                        <span style={{ display: 'block', font: 'var(--font-caption)', color: 'var(--text-muted)', marginTop: 3 }}>{s.aussage} <em>({s.norm})</em></span>
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { MeineAnlage });
