/* EEGbot app — Fristen: POST /api/fristen mit dem Anlagenprofil.
   Engine: src/rules/fristen.ts (MaStR, Veräußerungsform, Volleinspeisung). */

function DlDatum(deadline) {
  const [y, m, d] = deadline.split('-');
  const MON = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];
  return { day: d, mon: `${MON[parseInt(m, 10) - 1]} ${y.slice(2)}` };
}

function DlRow({ f }) {
  const { Badge, Tag } = window.FinkDesignSystem_4f2014;
  const pd = DlDatum(f.deadline);
  const isOverdue = f.status === 'ueberschritten';
  const t = f.tage_verbleibend;
  const whenText = t == null ? '' : t < 0 ? `${Math.abs(t).toLocaleString('de-DE')} Tage überschritten` : t === 0 ? 'heute fällig' : `in ${t} Tagen`;
  return (
    <div className={`fk-dl ${isOverdue ? 'fk-dl--overdue' : ''}`}>
      <div className="fk-dl__date"><span className="fk-dl__day">{pd.day}</span><span className="fk-dl__mon">{pd.mon}</span></div>
      <div className="fk-dl__sep"></div>
      <div className="fk-dl__body">
        <div className="fk-dl__task">{f.bezeichnung}</div>
        <div className="fk-dl__meta"><Tag>{f.norm}</Tag></div>
        <div style={{ font: 'var(--font-caption)', color: isOverdue ? '#fff' : 'var(--text-muted)', marginTop: 6, maxWidth: 640, opacity: isOverdue ? 0.92 : 1 }}>
          {f.folge_bei_verstoss}
        </div>
      </div>
      <span className="fk-dl__when" style={{ color: isOverdue ? '#fff' : 'var(--text-muted)' }}>{whenText}</span>
      <Badge tone={window.EEGBOT_PROFIL.FRIST_STATUS[f.status] || 'neutral'}>{window.EEGBOT_PROFIL.FRIST_LABEL[f.status] || f.status}</Badge>
    </div>
  );
}

function Deadlines({ onNav }) {
  const { Card, Button } = window.FinkDesignSystem_4f2014;
  const profil = window.EEGBOT_PROFIL.lade();
  const [fristen, setFristen] = React.useState(null);
  const [fehler, setFehler] = React.useState(null);
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  React.useEffect(() => {
    if (!profil) return;
    fetch('/api/fristen', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ibn_datum: profil.ibn_datum,
        mastr_registriert: !!profil.mastr_registriert,
        ...(profil.mastr_registrierung_datum ? { mastr_registrierung_datum: profil.mastr_registrierung_datum } : {}),
        veraeusserungsform_gemeldet: !!profil.veraeusserungsform_gemeldet,
        ...(profil.einspeiseart ? { einspeiseart: profil.einspeiseart } : {}),
        ...(Array.isArray(profil.volleinspeisung_gemeldet_fuer_jahr) ? { volleinspeisung_gemeldet_fuer_jahr: profil.volleinspeisung_gemeldet_fuer_jahr } : {}),
      }),
    })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.fehler || `HTTP ${r.status}`); return d; })
      .then(setFristen)
      .catch((e) => setFehler(String(e.message || e)));
  }, []);

  const Group = ({ title, color, items }) => items.length === 0 ? null : (
    <div className="fk-dl-group">
      <div className="fk-dl-group__h"><span className="dot" style={{ background: color }}></span>{title} · {items.length}</div>
      {items.map((f, i) => <DlRow key={i} f={f} />)}
    </div>
  );

  return (
    <AppShell active="deadlines" onNav={onNav} title="Fristen" subtitle={profil ? `Meldepflichten für ${profil.name || 'Ihre Anlage'} — live berechnet` : 'Meldepflichten Ihrer Anlage'}>
      <div className="fk-screen">
        <div className="fk-screen__inner" style={{ maxWidth: '900px' }}>
          {!profil && (
            <Card title="Keine Anlage erfasst" subtitle="Fristen brauchen Ihr Anlagenprofil">
              <Button onClick={() => onNav('anlage')} iconLeft={<i data-lucide="plus"></i>}>Anlage erfassen</Button>
            </Card>
          )}
          {fehler && <Card title="Fehler" tight><p style={{ font: 'var(--font-body)', color: '#C6291F', margin: 0 }}>{fehler}</p></Card>}
          {fristen && (
            <React.Fragment>
              <Group title="Überschritten" color="var(--klein-600)" items={fristen.filter((f) => f.status === 'ueberschritten')} />
              <Group title="Offen" color="var(--klein-500)" items={fristen.filter((f) => f.status === 'offen')} />
              <Group title="Erledigt" color="var(--gray-300)" items={fristen.filter((f) => f.status === 'erledigt')} />
              <Rechenweg
                inputs={{ Inbetriebnahme: profil.ibn_datum, MaStR_registriert: profil.mastr_registriert, Veräußerungsform_gemeldet: profil.veraeusserungsform_gemeldet, Einspeiseart: profil.einspeiseart, Volleinspeisung_gemeldet_für: profil.volleinspeisung_gemeldet_fuer_jahr || [] }}
                schritte={fristen.map((f) => `${f.bezeichnung}: ${f.deadline} → ${f.status}`)}
                parameterstand="Kalenderarithmetik zum heutigen Stichtag"
                normen={[...new Set(fristen.map((f) => f.norm))]}
                quellen={[
                  { bezeichnung: 'MaStRV', fundstelle: '§ 5', url: 'https://www.gesetze-im-internet.de/mastrv/__5.html' },
                  { bezeichnung: 'BGB', fundstelle: '§ 188 Abs. 3', url: 'https://www.gesetze-im-internet.de/bgb/__188.html' },
                ]}
              />
              <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', marginTop: 18, maxWidth: 720 }}>
                Hinweis: Die Meldung der <strong>Veräußerungsform</strong> (§ 21b, § 21c EEG) ist eine separate Meldung
                an den Netzbetreiber — sie passiert NICHT automatisch mit der MaStR-Registrierung und ist nicht
                rückwirkend heilbar. Wenn sie hier als überschritten erscheint, unter „Meine Anlage" prüfen,
                ob sie tatsächlich gemeldet wurde.
              </p>
            </React.Fragment>
          )}
          {profil && !fristen && !fehler && <p style={{ font: 'var(--font-body)', color: 'var(--text-muted)' }}>Berechne Fristen…</p>}
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { Deadlines });
