/* EEGbot app — Rückforderungs-Check (§ 52 Liability Radar).
   POST /api/sanktion52, Kategorien via GET. Demo-Star: der BGH-Beispielfall
   (XIII ZR 1/21) zeigt 6.417 € berechnete Exposure statt 45.540 € Forderung. */

const S52_BEISPIEL = {
  leistung_kw: '103.5',
  stichtag: '2026-07-05',
  verstoesse: [{ kategorie: '11', beginn: '2022-11-21', ende: '2026-07-05', geheilt: true }],
  gefordert_eur: 45540,
};

const s52Eur = (n) => `${Number(n).toLocaleString('de-DE')} €`;

function S52Warnung({ text }) {
  const { Badge } = window.FinkDesignSystem_4f2014;
  return (
    <div className="fk-row" style={{ gap: 10, alignItems: 'flex-start', padding: '10px 14px', border: '1px solid var(--border-subtle)', borderLeft: '3px solid #C6291F', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
      <Badge tone="overdue">Achtung</Badge>
      <span style={{ font: 'var(--font-body)', color: 'var(--text-primary)' }}>{text}</span>
    </div>
  );
}

function Sanktion52({ onNav }) {
  const { Card, Button, Input, Select, Switch, Badge, Tag } = window.FinkDesignSystem_4f2014;
  const profil = window.EEGBOT_PROFIL.lade();
  const [kategorien, setKategorien] = React.useState({});
  const [leistung, setLeistung] = React.useState(profil ? String(profil.leistung_kwp) : '');
  const [stichtag, setStichtag] = React.useState('');
  const [verstoesse, setVerstoesse] = React.useState([{ kategorie: '11', beginn: '', ende: '', geheilt: false }]);
  const [gefordert, setGefordert] = React.useState('');
  const [ergebnis, setErgebnis] = React.useState(null);
  const [rechenInput, setRechenInput] = React.useState(null);
  const [laden, setLaden] = React.useState(false);
  const [fehler, setFehler] = React.useState(null);
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  React.useEffect(() => {
    fetch('/api/sanktion52').then((r) => r.json()).then((d) => setKategorien(d.kategorien || {})).catch(() => {});
  }, []);

  const setV = (i, k) => (ev) => {
    const wert = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
    setVerstoesse(verstoesse.map((v, j) => (j === i ? { ...v, [k]: wert } : v)));
  };

  const berechnen = async (payload) => {
    setLaden(true); setFehler(null);
    setRechenInput(payload);
    try {
      const res = await fetch('/api/sanktion52', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.fehler || `HTTP ${res.status}`);
      setErgebnis(data);
    } catch (e) {
      setFehler(String(e.message || e));
    } finally {
      setLaden(false);
    }
  };

  const absenden = () => {
    const payload = {
      leistung_kw: Number(leistung),
      verstoesse: verstoesse
        .filter((v) => v.beginn)
        .map((v) => ({ kategorie: v.kategorie, beginn: v.beginn, ...(v.ende ? { ende: v.ende } : {}), ...(v.geheilt ? { geheilt: true } : {}) })),
      ...(stichtag ? { stichtag } : {}),
    };
    berechnen(payload);
  };

  const beispielLaden = () => {
    setLeistung(S52_BEISPIEL.leistung_kw);
    setStichtag(S52_BEISPIEL.stichtag);
    setVerstoesse(S52_BEISPIEL.verstoesse.map((v) => ({ ...v })));
    setGefordert(String(S52_BEISPIEL.gefordert_eur));
    berechnen({
      leistung_kw: Number(S52_BEISPIEL.leistung_kw),
      verstoesse: S52_BEISPIEL.verstoesse,
      stichtag: S52_BEISPIEL.stichtag,
    });
  };

  const geforderteSumme = gefordert !== '' ? Number(gefordert) : null;

  return (
    <AppShell active="sanktion52" onNav={onNav} title="Rückforderungs-Check" subtitle="§ 52 EEG: Was darf der Netzbetreiber wirklich fordern? Exposure, Verjährung, Heilung">
      <div className="fk-screen">
        <div className="fk-screen__inner fk-calculator-layout fk-calculator-layout--wide">
          <Card title="Ihr Fall" subtitle="Verstoß-Zeiträume erfassen — die Engine rechnet Monat für Monat">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Button variant="secondary" fullWidth onClick={beispielLaden} iconLeft={<i data-lucide="gavel"></i>}>
                Beispielfall laden (Forderung 45.540 €)
              </Button>
              <Input label="Installierte Leistung" suffix="kW" type="number" value={leistung} onChange={(ev) => setLeistung(ev.target.value)} />
              <Input label="Stichtag (optional)" type="date" value={stichtag} onChange={(ev) => setStichtag(ev.target.value)} hint="leer = heute" />

              {verstoesse.map((v, i) => (
                <div key={i} style={{ padding: '12px 14px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="fk-row" style={{ justifyContent: 'space-between' }}>
                    <span style={{ font: 'var(--weight-bold) var(--text-sm)/1.3 var(--font-sans)', color: 'var(--text-primary)' }}>Verstoß {i + 1}</span>
                    {verstoesse.length > 1 && (
                      <button onClick={() => setVerstoesse(verstoesse.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', font: 'var(--font-caption)' }}>entfernen</button>
                    )}
                  </div>
                  <Select label="Kategorie" value={v.kategorie} onChange={setV(i, 'kategorie')}>
                    {Object.entries(kategorien).map(([k, l]) => <option key={k} value={k}>{k} — {l.length > 60 ? l.slice(0, 60) + '…' : l}</option>)}
                  </Select>
                  <div className="fk-row" style={{ gap: 10 }}>
                    <Input label="Beginn" type="date" value={v.beginn} onChange={setV(i, 'beginn')} />
                    <Input label="Ende (optional)" type="date" value={v.ende} onChange={setV(i, 'ende')} />
                  </div>
                  <Switch label="Verstoß behoben (geheilt)" checked={v.geheilt} onChange={setV(i, 'geheilt')} />
                </div>
              ))}
              <Button variant="ghost" onClick={() => setVerstoesse([...verstoesse, { kategorie: '11', beginn: '', ende: '', geheilt: false }])} iconLeft={<i data-lucide="plus"></i>}>
                Weiteren Verstoß hinzufügen
              </Button>
              <Input label="Vom Netzbetreiber gefordert (optional)" suffix="€" type="number" value={gefordert} onChange={(ev) => setGefordert(ev.target.value)} hint="zum Vergleich mit der berechneten Exposure" />
              <Button fullWidth onClick={absenden} disabled={laden || !leistung || !verstoesse.some((v) => v.beginn)} iconLeft={<i data-lucide="shield-alert"></i>}>
                {laden ? 'Berechne…' : 'Exposure berechnen'}
              </Button>
              {fehler && <S52Warnung text={fehler} />}
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {!ergebnis && !fehler && (
              <Card title="Noch nichts berechnet" subtitle="Links den Fall erfassen — oder den BGH-Beispielfall laden">
                <p style={{ font: 'var(--font-body)', color: 'var(--text-muted)', margin: 0 }}>
                  Die Engine (<code>src/rules/sanktion52.ts</code>) rechnet die Strafzahlung nach § 52 EEG
                  Monat für Monat: 10 €/kW, nach Heilung rückwirkend 2 €/kW, inklusive Verjährung
                  (§ 52 Abs. 6) und Kappung. Im BGH-Fall XIII ZR 1/21 forderte der Netzbetreiber
                  45.540 € — berechnet berechtigt sind 6.417 €.
                </p>
              </Card>
            )}

            {ergebnis && (
              <React.Fragment>
                <Card title="Berechnete Exposure" subtitle="deterministisch, Monat für Monat, mit Quellen">
                  <div className="fk-row" style={{ gap: 26, alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ font: 'var(--weight-bold) 44px/1 var(--font-sans)', color: 'var(--klein-600)' }}>{s52Eur(ergebnis.exposure_gesamt_eur)}</span>
                    {geforderteSumme != null && geforderteSumme > 0 && (
                      <span style={{ font: 'var(--font-body)', color: 'var(--text-primary)' }}>
                        Gefordert: <strong style={{ textDecoration: 'line-through', textDecorationColor: '#C6291F' }}>{s52Eur(geforderteSumme)}</strong>
                        {' '}— Differenz <strong style={{ color: 'var(--klein-600)' }}>{s52Eur(geforderteSumme - ergebnis.exposure_gesamt_eur)}</strong>
                      </span>
                    )}
                  </div>
                  <div className="fk-facts" style={{ marginTop: 14 }}>
                    <div className="fk-fact"><span className="fk-fact__k">davon verjährt (Einrede erforderlich)</span><span className="fk-fact__v">{s52Eur(ergebnis.exposure_verjaehrt_eur)}</span></div>
                    <div className="fk-fact"><span className="fk-fact__k">monatlich weiter auflaufend</span><span className="fk-fact__v">{s52Eur(ergebnis.monatlich_laufend_eur)}</span></div>
                    <div className="fk-fact"><span className="fk-fact__k">Ersparnis durch Heilung</span><span className="fk-fact__v">{s52Eur(ergebnis.heilungsersparnis_eur)}</span></div>
                  </div>
                </Card>

                {(ergebnis.hinweise || []).map((h, i) => <S52Warnung key={i} text={h} />)}

                <Card title={`Monatsaufstellung · ${ergebnis.monate.length} Monate`} subtitle="Jeder Monat einzeln — verjährte Monate sind markiert" tight>
                  <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                    <div className="fk-facts">
                      {ergebnis.monate.map((m, i) => (
                        <div key={i} className="fk-fact">
                          <span className="fk-fact__k">{m.monat} <span style={{ color: 'var(--text-muted)' }}>(Kat. {m.kategorien.join(', ')})</span></span>
                          <span className="fk-fact__v">
                            {s52Eur(m.betrag_eur)}{' '}
                            {m.verjaehrt && <Badge tone="neutral">verjährt</Badge>}
                            {m.gekappt && <Badge tone="pending">gekappt</Badge>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <div className="fk-cites">
                  {(ergebnis.quellen || []).map((q, i) => (
                    <span key={i} style={{ color: 'var(--text-muted)', font: 'var(--font-caption)', marginRight: 12 }}>{q}</span>
                  ))}
                </div>
                <Rechenweg
                  inputs={{ Leistung_kW: rechenInput?.leistung_kw, Stichtag: rechenInput?.stichtag || 'heute', Verstöße: (rechenInput?.verstoesse || []).map((v) => `${v.kategorie}: ${v.beginn}–${v.ende || 'offen'}${v.geheilt ? ' (geheilt)' : ''}`) }}
                  schritte={[
                    'Jeden berührten Kalendermonat je Verstoß bestimmen.',
                    'Regelsatz 10 €/kW/Monat bzw. nach anwendbarer Heilung 2 €/kW/Monat anwenden.',
                    'Monatliche Kappung und Verjährung nach § 52 Abs. 5 und 6 berücksichtigen.',
                    `${ergebnis.monate.filter((m) => !m.verjaehrt).length} nicht verjährte Monatspositionen zu ${s52Eur(ergebnis.exposure_gesamt_eur)} summieren.`,
                  ]}
                  parameterstand={ergebnis.parameterstand
                    ? `${ergebnis.parameterstand.gueltig_von} bis ${ergebnis.parameterstand.gueltig_bis || 'offen'}: ${ergebnis.parameterstand.regelsatz_eur_kw_monat} €/kW/Monat, Heilung ${ergebnis.parameterstand.heilungssatz_eur_kw_monat} €/kW/Monat`
                    : `§-52-Parameter zum Stichtag ${rechenInput?.stichtag || 'heute'}`}
                  normen={['§ 52 Abs. 2–6 EEG 2023']}
                  quellen={ergebnis.quellen || []}
                />
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { Sanktion52 });
