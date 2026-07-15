/* EEGbot B2C — Vergütung: fester Einspeisevergütungssatz nach § 48 EEG.
   Live gegen POST /api/verguetung (deterministische Engine — nichts gemockt,
   FINK_DATA wird hier NICHT gelesen). Farbregel: weiß + Klein-Blau; Rot NUR
   für Warnungen. HTTP 400 ist FACHLICHER NORMALFALL (IBN vor 30.07.2022 oder
   > 100 kWp) — data.fehler wird 1:1 als Hinweis gezeigt, nicht als Systemfehler. */

const VG_EINSPEISEART = [
  ['teileinspeisung', 'Überschusseinspeisung (Eigenverbrauch + Rest ins Netz)'],
  ['volleinspeisung', 'Volleinspeisung'],
];

/* Deutsche Zahl mit bis zu `dec` Nachkommastellen, ohne erzwungene Nullen. */
const vgNum = (n, dec = 2) =>
  Number.isFinite(Number(n))
    ? Number(n).toLocaleString('de-DE', { maximumFractionDigits: dec })
    : '—';

/* ISO-Datum (YYYY-MM-DD) → TT.MM.JJJJ; unbekanntes Format wird 1:1 zurückgegeben. */
const vgDatum = (iso) => {
  if (!iso || typeof iso !== 'string') return '—';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
};

const VG_TH = { textAlign: 'left', font: 'var(--font-caption)', color: 'var(--text-muted)', fontWeight: 600, padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)' };
const VG_TD = { padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' };

/* Rot NUR hier: nutzerlesbare Warnung / fachlicher Ablehnungsgrund. */
function VgWarnung({ text, titel = 'Achtung' }) {
  const { Badge } = window.FinkDesignSystem_4f2014;
  return (
    <div className="fk-row" style={{ gap: 10, alignItems: 'flex-start', padding: '10px 14px', border: '1px solid var(--border-subtle)', borderLeft: '3px solid #C6291F', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
      <Badge tone="overdue">{titel}</Badge>
      <span style={{ font: 'var(--font-body)', color: 'var(--text-primary)' }}>{text}</span>
    </div>
  );
}

function VgErgebnis({ d }) {
  const { Card } = window.FinkDesignSystem_4f2014;
  const stufen = Array.isArray(d.stufen) ? d.stufen : [];
  const hinweise = Array.isArray(d.hinweise) ? d.hinweise : [];
  const misch = stufen.length > 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card title="Ihr Vergütungssatz" subtitle="Fest für die gesamte Förderdauer">
        <div className="fk-row" style={{ gap: 28, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{ font: 'var(--weight-bold) 34px/1 var(--font-sans)', color: 'var(--klein-600)' }}>
            {vgNum(d.satz_ct_kwh)}{' '}
            <span style={{ font: 'var(--font-body)', color: 'var(--text-muted)' }}>ct/kWh</span>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>Förderende</span>
            <span style={{ font: 'var(--weight-semibold) var(--text-md)/1.2 var(--font-sans)', color: 'var(--text-primary)' }}>{vgDatum(d.foerderende)}</span>
          </div>
        </div>
      </Card>

      {stufen.length > 0 && (
        <Card title="Vergütungsstufen" subtitle={misch ? 'Mischvergütung — der Satz gilt anteilig je Leistungsband' : 'Einheitlicher Satz für die gesamte Leistung'} tight>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', font: 'var(--font-body)' }}>
              <thead>
                <tr>
                  <th style={VG_TH}>Leistungsband</th>
                  <th style={{ ...VG_TH, textAlign: 'right' }}>Satz</th>
                  <th style={{ ...VG_TH, textAlign: 'right' }}>Anteil</th>
                </tr>
              </thead>
              <tbody>
                {stufen.map((s, i) => (
                  <tr key={i}>
                    <td style={VG_TD}>{vgNum(s.von_kwp)}–{vgNum(s.bis_kwp)} kWp</td>
                    <td style={{ ...VG_TD, textAlign: 'right', color: 'var(--klein-600)', fontWeight: 600 }}>{vgNum(s.satz_ct_kwh)} ct/kWh</td>
                    <td style={{ ...VG_TD, textAlign: 'right' }}>{vgNum(s.anteil_kwp)} kWp</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {hinweise.length > 0 && (
        <Card title="Hinweise" tight>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {hinweise.map((h, i) => (
              <li key={i} style={{ font: 'var(--font-body)', color: 'var(--text-primary)' }}>{h}</li>
            ))}
          </ul>
        </Card>
      )}

      {d.quelle && (
        <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>Rechtsgrundlage: {d.quelle}</p>
      )}
    </div>
  );
}

function Verguetung({ onNav }) {
  const { Card, Button, Input, Select } = window.FinkDesignSystem_4f2014;
  const [profil] = React.useState(() => (window.EEGBOT_PROFIL && EEGBOT_PROFIL.lade()) || null);
  const [form, setForm] = React.useState(() => ({
    ibn_datum: (profil && profil.ibn_datum) || '',
    leistung_kwp: profil && profil.leistung_kwp != null ? String(profil.leistung_kwp) : '',
    einspeiseart: (profil && profil.einspeiseart) || 'teileinspeisung',
  }));
  const [ergebnis, setErgebnis] = React.useState(null);
  const [hinweis, setHinweis] = React.useState(null);   // fachlicher 400-Fall (nutzerlesbar)
  const [fehler, setFehler] = React.useState(null);     // technischer Fehler (Netz/Parse)
  const [laden, setLaden] = React.useState(false);
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  const set = (k) => (ev) => setForm({ ...form, [k]: ev.target.value });
  const kannBerechnen = !!form.ibn_datum && form.leistung_kwp !== '' && Number.isFinite(Number(form.leistung_kwp));

  const berechnen = async () => {
    if (!kannBerechnen) return;
    setLaden(true); setFehler(null); setHinweis(null);
    try {
      const res = await fetch('/api/verguetung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ibn_datum: form.ibn_datum,
          leistung_kwp: Number(form.leistung_kwp),
          einspeiseart: form.einspeiseart,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // 400 = fachlicher NORMALFALL: data.fehler ist nutzerlesbar, 1:1 als Hinweis.
        setErgebnis(null);
        setHinweis(data && data.fehler ? data.fehler : `Für diese Angaben gibt es keinen festen Vergütungssatz (HTTP ${res.status}).`);
        return;
      }
      setErgebnis(data);
    } catch (e) {
      setErgebnis(null);
      setFehler(`Verbindungsfehler: ${String((e && e.message) || e)}`);
    } finally {
      setLaden(false);
    }
  };

  return (
    <AppShell active="verguetung" onNav={onNav} title="Vergütung" subtitle="Fester Einspeisevergütungssatz nach § 48 EEG — deterministisch berechnet" search={false}>
      <div className="fk-screen">
        <div className="fk-screen__inner" style={{ display: 'grid', gridTemplateColumns: '380px minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
          <Card title="Ihre Anlage" subtitle="Angaben bestimmen den festen Vergütungssatz">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {profil && (
                <span style={{ font: 'var(--font-caption)', color: 'var(--klein-600)' }}>✓ Aus Ihrem Anlagenprofil vorbefüllt</span>
              )}
              <Input label="Inbetriebnahmedatum" type="date" value={form.ibn_datum} onChange={set('ibn_datum')} />
              <Input label="Leistung" suffix="kWp" type="number" min={0} step="0.01" value={form.leistung_kwp} onChange={set('leistung_kwp')} hint="Feste Vergütung gilt bis 100 kWp" />
              <Select label="Einspeiseart" value={form.einspeiseart} onChange={set('einspeiseart')}>
                {VG_EINSPEISEART.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
              <Button fullWidth onClick={berechnen} disabled={laden || !kannBerechnen} iconLeft={<i data-lucide="calculator"></i>}>
                {laden ? 'Berechne…' : 'Vergütung berechnen'}
              </Button>
              {fehler && <VgWarnung text={fehler} />}
            </div>
          </Card>

          <div>
            {hinweis && <VgWarnung text={hinweis} titel="Kein fester Satz" />}
            {ergebnis ? (
              <VgErgebnis d={ergebnis} />
            ) : !hinweis ? (
              <Card title="Noch nichts berechnet" subtitle="Links die Anlage erfassen und berechnen">
                <p style={{ font: 'var(--font-body)', color: 'var(--text-muted)' }}>
                  Der Satz kommt live aus der deterministischen Engine (POST <code>/api/verguetung</code>) — fest
                  für 20 Jahre zzgl. Rest des Inbetriebnahmejahres (§ 25 EEG). Der feste Satz gilt für Anlagen mit
                  Inbetriebnahme ab dem 30.07.2022 bis 100 kWp. Liegt Ihre Anlage außerhalb dieses Rahmens, erscheint
                  hier ein Hinweis statt eines Satzes.
                </p>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { Verguetung });
