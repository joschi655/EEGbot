/* EEGbot app — Übersicht: rechnet live gegen /api/fristen, /api/verguetung,
   /api/schwellen mit dem Anlagenprofil (localStorage). Jeder Aufruf hat einen
   EIGENEN catch: ein Vergütungs-400 (z. B. > 100 kWp → Direktvermarktung)
   ist Normalfall und darf Fristen/Schwellen nicht mitreißen. */

function DbEmpty({ onNav, onLaden }) {
  const { Card, Button } = window.FinkDesignSystem_4f2014;
  return (
    <div style={{ maxWidth: 620, margin: '40px auto' }}>
      <Card title="Willkommen bei EEGbot" subtitle="Einmal die Anlage erfassen — alles Weitere rechnet sich von selbst">
        <p style={{ font: 'var(--font-body)', color: 'var(--text-muted)', margin: '0 0 16px' }}>
          Fristen, Vergütung, Solarspitzen-Regeln, Schwellenwerte und der Rückforderungs-Check nutzen Ihr Anlagenprofil.
          Es bleibt lokal in diesem Browser gespeichert.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button onClick={() => onNav('anlage')} iconLeft={<i data-lucide="plus"></i>}>Anlage erfassen</Button>
          <Button variant="secondary" onClick={() => onLaden(window.EEGBOT_PROFIL.beispiel())}>Beispiel-Anlage laden (9,8 kWp)</Button>
          <Button variant="secondary" onClick={() => onLaden(window.EEGBOT_PROFIL.bghZwilling())}>BGH-Zwilling laden (103,5 kWp)</Button>
        </div>
      </Card>
    </div>
  );
}

function Dashboard({ onNav }) {
  const { Button, Badge, Card } = window.FinkDesignSystem_4f2014;
  const [profil, setProfil] = React.useState(() => window.EEGBOT_PROFIL.lade());
  const [fristen, setFristen] = React.useState(null);
  const [verguetung, setVerguetung] = React.useState(null);
  const [verguetungFehler, setVerguetungFehler] = React.useState(null);
  const [schwellen, setSchwellen] = React.useState(null);
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  const laden = (p) => { window.EEGBOT_PROFIL.speichere(p); setProfil(p); };

  React.useEffect(() => {
    if (!profil) return;
    let aktiv = true;
    setFristen(null); setVerguetung(null); setVerguetungFehler(null); setSchwellen(null);
    const post = (pfad, body) =>
      fetch(pfad, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.fehler || `HTTP ${r.status}`); return d; });

    post('/api/fristen', {
      ibn_datum: profil.ibn_datum,
      mastr_registriert: !!profil.mastr_registriert,
      ...(profil.mastr_registrierung_datum ? { mastr_registrierung_datum: profil.mastr_registrierung_datum } : {}),
      veraeusserungsform_gemeldet: !!profil.veraeusserungsform_gemeldet,
      ...(profil.einspeiseart ? { einspeiseart: profil.einspeiseart } : {}),
      ...(Array.isArray(profil.volleinspeisung_gemeldet_fuer_jahr) ? { volleinspeisung_gemeldet_fuer_jahr: profil.volleinspeisung_gemeldet_fuer_jahr } : {}),
    }).then((d) => aktiv && setFristen(d)).catch(() => aktiv && setFristen([]));

    post('/api/verguetung', { ibn_datum: profil.ibn_datum, leistung_kwp: Number(profil.leistung_kwp), einspeiseart: profil.einspeiseart })
      .then((d) => aktiv && setVerguetung(d))
      .catch((e) => aktiv && setVerguetungFehler(String(e.message || e)));

    post('/api/schwellen', {
      leistung_kwp: Number(profil.leistung_kwp),
      ...(profil.anlagentyp ? { anlagentyp: profil.anlagentyp } : {}),
      ...(typeof profil.imsys_vorhanden === 'boolean' ? { imsys_vorhanden: profil.imsys_vorhanden } : {}),
      ...(profil.vermarktungsform ? { vermarktungsform: profil.vermarktungsform } : {}),
      steuerungseinrichtung_vorhanden: !!profil.steuerungseinrichtung_vorhanden,
      ansteuerbarkeit_getestet: !!profil.ansteuerbarkeit_getestet,
      ...(profil.ibn_datum ? { ibn_datum: profil.ibn_datum } : {}),
      ...(profil.wechselrichter_va ? { wechselrichter_va: Number(profil.wechselrichter_va) } : {}),
    }).then((d) => aktiv && setSchwellen(d)).catch(() => aktiv && setSchwellen([]));

    return () => { aktiv = false; };
  }, [profil]);

  const inhalt = () => {
    if (!profil) return <DbEmpty onNav={onNav} onLaden={laden} />;

    const ueberschritten = (fristen || []).filter((f) => f.status === 'ueberschritten');
    const offen = (fristen || []).filter((f) => f.status === 'ueberschritten' || f.status === 'offen');
    const schlimmste = ueberschritten[0] || (fristen || []).find((f) => f.status === 'offen');
    const zutreffend = (schwellen || []).filter((s) => s.zutreffend === true);

    return (
      <div className="fk-screen__inner fk-screen__inner--calm">
        {schlimmste && (
          <div className="fk-alert">
            <div className="fk-alert__txt">
              <span className="fk-alert__title">
                {ueberschritten.length > 0 ? `${ueberschritten.length} Frist${ueberschritten.length > 1 ? 'en' : ''} überschritten` : 'Nächste Frist offen'}
              </span>
              <span className="fk-alert__sub">{schlimmste.bezeichnung} — fällig {schlimmste.deadline} ({schlimmste.norm})</span>
            </div>
            <button className="fk-alert__action" onClick={() => onNav('deadlines')}>Fristen ansehen</button>
          </div>
        )}

        <div className="fk-kpis">
          <div className="fk-kpi">
            <span className="fk-kpi__v">{verguetung ? String(verguetung.satz_ct_kwh).replace('.', ',') : '—'}{verguetung && <i>ct/kWh</i>}</span>
            <span className="fk-kpi__l">Vergütungssatz</span>
          </div>
          <div className="fk-kpi"><span className="fk-kpi__v">{fristen ? offen.length : '…'}</span><span className="fk-kpi__l">Offene Fristen</span></div>
          <div className="fk-kpi"><span className="fk-kpi__v">{Number(profil.leistung_kwp).toLocaleString('de-DE')}<i>kWp</i></span><span className="fk-kpi__l">Leistung</span></div>
          <div className="fk-kpi"><span className="fk-kpi__v">{verguetung ? verguetung.foerderende.slice(0, 4) : '—'}</span><span className="fk-kpi__l">Förderende</span></div>
        </div>

        {verguetungFehler && (
          <Card title="Kein fester Vergütungssatz berechenbar" tight>
            <p style={{ font: 'var(--font-body)', color: 'var(--text-muted)', margin: 0 }}>
              {verguetungFehler}
              {Number(profil.leistung_kwp) > 100 ? ' Anlagen über 100 kWp sind direktvermarktungspflichtig — der Erlös kommt vom Direktvermarkter, nicht als fester Satz.' : ''}
            </p>
          </Card>
        )}

        <section className="fk-block">
          <div className="fk-block__head">
            <h2>Handlungsbedarf</h2>
            <Button size="sm" variant="ghost" iconRight={<i data-lucide="arrow-right"></i>} onClick={() => onNav('deadlines')}>Alle Fristen</Button>
          </div>
          <div className="fk-list">
            {offen.map((f, i) => (
              <button className="fk-listrow" key={`f${i}`} onClick={() => onNav('deadlines')}>
                <span className="fk-asset__ic"><i data-lucide="calendar-clock"></i></span>
                <span className="fk-listrow__main">
                  <span className="fk-asset__name">{f.bezeichnung}</span>
                  <span className="fk-listrow__next">fällig {f.deadline} · {f.norm}</span>
                </span>
                <Badge tone={window.EEGBOT_PROFIL.FRIST_STATUS[f.status] || 'neutral'}>{window.EEGBOT_PROFIL.FRIST_LABEL[f.status] || f.status}</Badge>
              </button>
            ))}
            {zutreffend.map((s, i) => (
              <button className="fk-listrow" key={`s${i}`} onClick={() => onNav('anlage')}>
                <span className="fk-asset__ic"><i data-lucide="gauge"></i></span>
                <span className="fk-listrow__main">
                  <span className="fk-asset__name">{s.thema}</span>
                  <span className="fk-listrow__next">{s.aussage.length > 110 ? s.aussage.slice(0, 110) + '…' : s.aussage} · {s.norm}</span>
                </span>
                <Badge tone="pending">Trifft zu</Badge>
              </button>
            ))}
            {fristen && offen.length === 0 && zutreffend.length === 0 && (
              <div style={{ padding: '18px 4px', font: 'var(--font-body)', color: 'var(--text-muted)' }}>
                ✓ Keine offenen Fristen, keine greifenden Schwellen — Ihre Anlage ist auf Stand.
              </div>
            )}
          </div>
        </section>

        <section className="fk-block">
          <div className="fk-block__head"><h2>Prüfen &amp; Rechnen</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <Card title="Rückforderungs-Check" subtitle="§ 52: Exposure, Verjährung, Heilung" tight>
              <Button size="sm" variant="secondary" onClick={() => onNav('sanktion52')} iconRight={<i data-lucide="arrow-right"></i>}>Nachrechnen</Button>
            </Card>
            <Card title="Vergütung" subtitle="§ 48: Satz, Mischvergütung, Förderende" tight>
              <Button size="sm" variant="secondary" onClick={() => onNav('verguetung')} iconRight={<i data-lucide="arrow-right"></i>}>Berechnen</Button>
            </Card>
            <Card title="Solarspitzen" subtitle="§§ 9, 51: 60 %, Steuerung, Negativpreise" tight>
              <Button size="sm" variant="secondary" onClick={() => onNav('solarspitzen')} iconRight={<i data-lucide="arrow-right"></i>}>Prüfen</Button>
            </Card>
            <Card title="Nach der Förderung" subtitle="Ü20-Optionen im Vergleich" tight>
              <Button size="sm" variant="secondary" onClick={() => onNav('ue20')} iconRight={<i data-lucide="arrow-right"></i>}>Vergleichen</Button>
            </Card>
          </div>
        </section>
      </div>
    );
  };

  return (
    <AppShell active="dashboard" onNav={onNav} title="Übersicht" subtitle={profil ? `${profil.name || 'Meine Anlage'} · live berechnet aus Ihrem Profil` : 'Noch keine Anlage erfasst'}>
      <div className="fk-screen">{inhalt()}</div>
    </AppShell>
  );
}

Object.assign(window, { Dashboard });
