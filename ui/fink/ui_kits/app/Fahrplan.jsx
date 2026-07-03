/* fink app — Förder-Fahrplan: live gegen POST /api/fahrplan (deterministische
   Engine src/rules/fahrplan.ts — nichts ist gemockt, FINK_DATA wird hier NICHT
   verwendet). Farbregel: weiß + Klein-Blau; Rot ausschließlich für Warnungen. */

const FP_MASSNAHMEN = [
  ['waermepumpe', 'Wärmepumpe'],
  ['daemmung', 'Dämmung (Gebäudehülle)'],
  ['fenster', 'Fenster'],
  ['solarthermie', 'Solarthermie'],
  ['biomasseheizung', 'Biomasseheizung'],
  ['fernwaermeanschluss', 'Fernwärmeanschluss'],
  ['heizungsoptimierung', 'Heizungsoptimierung'],
];

const FP_EIGENTUM = [
  ['eigentum', 'Eigentum'],
  ['weg', 'Wohnungseigentümergemeinschaft (WEG)'],
  ['miete', 'Miete'],
];

const FP_BUNDESLAENDER = [
  ['', 'Keine Angabe'],
  ['BW', 'Baden-Württemberg'], ['BY', 'Bayern'], ['BE', 'Berlin'], ['BB', 'Brandenburg'],
  ['HB', 'Bremen'], ['HH', 'Hamburg'], ['HE', 'Hessen'], ['MV', 'Mecklenburg-Vorpommern'],
  ['NI', 'Niedersachsen'], ['NW', 'Nordrhein-Westfalen'], ['RP', 'Rheinland-Pfalz'], ['SL', 'Saarland'],
  ['SN', 'Sachsen'], ['ST', 'Sachsen-Anhalt'], ['SH', 'Schleswig-Holstein'], ['TH', 'Thüringen'],
];

/* Pfad der KI-Vorschläge (/api/intake) → Formular-Feld */
const FP_INTAKE_MAP = {
  'massnahme.typ': ['typ', String],
  'massnahme.kosten_eur': ['kosten', String],
  'massnahme.begonnen': ['begonnen', Boolean],
  'massnahme.ersetzt_fossile_heizung': ['ersetztFossil', Boolean],
  'massnahme.wp_effizienzbonus_qualifiziert': ['effizienz', Boolean],
  'gebaeude.bestandsgebaeude': ['bestand', Boolean],
  'gebaeude.alter_jahre': ['alter', String],
  'antragsteller.selbstnutzend': ['selbst', Boolean],
  'antragsteller.haushaltseinkommen_eur': ['einkommen', String],
  'antragsteller.isfp_vorhanden': ['isfp', Boolean],
  'eigentumsform': ['eigentum', String],
  'standort.bundesland': ['bundesland', String],
  'standort.kommune': ['kommune', String],
  'standort.plz': ['plz', String],
};

const fpEur = (n) => `${Number(n).toLocaleString('de-DE')} €`;

function FpQuellen({ quellen }) {
  if (!quellen || quellen.length === 0) return null;
  return (
    <div className="fk-cites" style={{ marginTop: 6 }}>
      {quellen.map((q, i) =>
        q.url ? (
          <a key={i} href={q.url} target="_blank" rel="noreferrer" style={{ color: 'var(--klein-600)', font: 'var(--font-caption)', marginRight: 10 }}>
            {q.bezeichnung}
          </a>
        ) : (
          <span key={i} style={{ color: 'var(--text-muted)', font: 'var(--font-caption)', marginRight: 10 }}>
            {q.bezeichnung}{q.fundstelle ? ` (${q.fundstelle})` : ''}
          </span>
        ),
      )}
    </div>
  );
}

function FpWarnung({ text }) {
  const { Badge } = window.FinkDesignSystem_4f2014;
  return (
    <div className="fk-row" style={{ gap: 10, alignItems: 'flex-start', padding: '10px 14px', border: '1px solid var(--border-subtle)', borderLeft: '3px solid #C6291F', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
      <Badge tone="overdue">Achtung</Badge>
      <span style={{ font: 'var(--font-body)', color: 'var(--text-primary)' }}>{text}</span>
    </div>
  );
}

function FpSchritt({ s }) {
  const { Tag } = window.FinkDesignSystem_4f2014;
  return (
    <div className="fk-obl">
      <div className="fk-obl__check" style={{ background: 'var(--klein-600)', color: '#fff', font: 'var(--weight-bold) 13px/1 var(--font-sans)' }}>{s.nr}</div>
      <div className="fk-obl__body">
        <span className="fk-obl__title">{s.titel}</span>
        <span className="fk-obl__detail">{s.beschreibung}</span>
        {s.warnung && (
          <span className="fk-obl__detail" style={{ color: '#C6291F', fontWeight: 600 }}>⚠ {s.warnung}</span>
        )}
        {s.dokumente.map((d) => (
          <span key={d.id} className="fk-obl__detail">
            📄 {d.name} — Aussteller: {d.aussteller}
            {d.human_only_felder.length > 0 && (
              <span> · <Tag>Nur durch Experten: {d.human_only_felder.join(', ')}</Tag></span>
            )}
          </span>
        ))}
        <FpQuellen quellen={s.quellen} />
      </div>
    </div>
  );
}

function FpErgebnis({ f, netzbetreiber }) {
  const { Card, Badge } = window.FinkDesignSystem_4f2014;
  const e = f.empfehlung;
  const nb = netzbetreiber && !netzbetreiber.fehler && netzbetreiber.netzbetreiber?.length ? netzbetreiber : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {f.warnungen.map((w, i) => <FpWarnung key={i} text={w} />)}

      {nb && (
        <div style={{ padding: '10px 16px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', font: 'var(--font-body)' }}>
          <span style={{ color: 'var(--text-primary)' }}>
            ⚡ Vermutlich zuständiger Netzbetreiber (PLZ {nb.plz}): <strong style={{ color: 'var(--klein-600)' }}>{nb.netzbetreiber[0].name}</strong>
            {nb.netzbetreiber[0].anteil_prozent < 100 ? ` (${nb.netzbetreiber[0].anteil_prozent} % von ${nb.stichprobe} registrierten Anlagen)` : ''}
          </span>
          <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', margin: '4px 0 0' }}>{nb.hinweis} Quelle: {nb.quelle}.</p>
        </div>
      )}

      {e ? (
        <Card title={`Passendes Programm: ${e.name}`} subtitle={`${e.traeger} · ${e.foerderart}`}>
          {e.foerdersatz_prozent !== undefined && (
            <div className="fk-row" style={{ gap: 14, alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ font: 'var(--weight-bold) 34px/1 var(--font-sans)', color: 'var(--klein-600)' }}>{e.foerdersatz_prozent} %</span>
              {e.betrag_eur_geschaetzt !== undefined && (
                <span style={{ font: 'var(--font-body)', color: 'var(--text-primary)' }}>
                  ≈ <strong>{fpEur(e.betrag_eur_geschaetzt)}</strong> bei angesetzten Kosten von {fpEur(e.kosten_angesetzt_eur)}
                  {e.hoechstkosten_eur ? ` (förderfähig bis ${fpEur(e.hoechstkosten_eur)})` : ''}
                </span>
              )}
            </div>
          )}
          <div className="fk-facts">
            {e.saetze.map((s, i) => (
              <div key={i} className="fk-fact">
                <span className="fk-fact__k">{s.bezeichnung}</span>
                <span className="fk-fact__v">
                  {s.satz_prozent !== undefined ? `${s.satz_prozent} % ` : ''}
                  {s.zutreffend === true ? <Badge tone="compliant">erfüllt</Badge> : s.zutreffend === 'unbekannt' ? <Badge tone="pending">Angabe fehlt</Badge> : <Badge tone="neutral">nicht erfüllt</Badge>}
                </span>
              </div>
            ))}
          </div>
          {e.hinweis && <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', marginTop: 10 }}>{e.hinweis}</p>}
        </Card>
      ) : (
        <Card title="Kein passendes Programm gefunden" subtitle="Auf Basis der bisherigen Angaben passt kein erfasstes Programm">
          <p style={{ font: 'var(--font-body)', color: 'var(--text-muted)' }}>Beantworten Sie die offenen Fragen unten — oder prüfen Sie die Ausschlussgründe.</p>
        </Card>
      )}

      {f.entweder_oder.map((eo, i) => (
        <div key={i} className="fk-alert" style={{ padding: '14px 20px' }}>
          <div className="fk-alert__txt">
            <span className="fk-alert__title" style={{ font: 'var(--weight-bold) var(--text-md)/1.2 var(--font-sans)' }}>Entweder-oder: {eo.programme[0]} vs. {eo.programme[1]}</span>
            <span className="fk-alert__sub">{eo.hinweis}</span>
          </div>
        </div>
      ))}

      {f.kombinationen.map((k, i) => (
        <div key={i} style={{ padding: '12px 16px', border: '1px solid var(--klein-600)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ font: 'var(--weight-bold) var(--text-sm)/1.4 var(--font-sans)', color: 'var(--klein-600)' }}>
            Kombinierbar: {k.programme[0]} + {k.programme[1]} — zusammen {k.kombinierte_quote_prozent} %
            {k.kombinierte_quote_prozent < k.quote_summe_prozent ? ` statt ${k.quote_summe_prozent} %` : ''}
          </span>
          {k.hinweis && <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', margin: '4px 0 0' }}>{k.hinweis}</p>}
        </div>
      ))}

      {f.isfp_weiche && (
        <div style={{ padding: '12px 16px', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--klein-600)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ font: 'var(--weight-bold) var(--text-sm)/1.4 var(--font-sans)', color: 'var(--klein-600)' }}>iSFP-Weiche</span>
          <p style={{ font: 'var(--font-body)', color: 'var(--text-primary)', margin: '4px 0 0' }}>{f.isfp_weiche.hinweis}</p>
          <FpQuellen quellen={f.isfp_weiche.quellen} />
        </div>
      )}

      {f.schritte.length > 0 && (
        <Card title="Ihr Fahrplan" subtitle="Reihenfolge ist förderentscheidend">
          <div className="fk-obls">
            {f.schritte.map((s) => <FpSchritt key={s.nr} s={s} />)}
          </div>
        </Card>
      )}

      {f.offene_fragen.length > 0 && (
        <Card title="Offene Fragen" subtitle="Für ein vollständiges Ergebnis noch beantworten">
          {f.offene_fragen.map((o) => (
            <div key={o.feld} className="fk-fact">
              <span className="fk-fact__k">{o.frage}</span>
              <span className="fk-fact__v" style={{ color: 'var(--text-muted)' }}><code>{o.feld}</code></span>
            </div>
          ))}
        </Card>
      )}

      {f.nicht_passend.length > 0 && (
        <Card title="Nicht passend — mit Grund" tight>
          {f.nicht_passend.map((n) => (
            <div key={n.programm_id} className="fk-fact">
              <span className="fk-fact__k">{n.name}</span>
              <span className="fk-fact__v" style={{ color: 'var(--text-muted)', textAlign: 'right', maxWidth: 420 }}>{n.gruende.join('; ')}</span>
            </div>
          ))}
        </Card>
      )}

      <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
        Stand der Programmdaten: {f.stand}. {f.disclaimer}
      </p>
    </div>
  );
}

function Fahrplan({ onNav }) {
  const { Card, Button, Input, Select, Switch } = window.FinkDesignSystem_4f2014;
  const [form, setForm] = React.useState({
    typ: 'waermepumpe', kosten: '42000', einkommen: '38000', alter: '30', eigentum: 'eigentum',
    bestand: true, selbst: true, ersetztFossil: true, effizienz: true, isfp: false, begonnen: false,
    bundesland: '', plz: '', kommune: '', freitext: '',
  });
  const [ergebnis, setErgebnis] = React.useState(null);
  const [netzbetreiber, setNetzbetreiber] = React.useState(null);
  const [laden, setLaden] = React.useState(false);
  const [fehler, setFehler] = React.useState(null);
  const [kiLaden, setKiLaden] = React.useState(false);
  const [kiErgebnis, setKiErgebnis] = React.useState(null);
  const [kiFehler, setKiFehler] = React.useState(null);
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  const set = (k) => (ev) => setForm({ ...form, [k]: ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value });

  const baueFall = () => {
    const fall = {
      massnahme: {
        typ: form.typ,
        begonnen: form.begonnen,
        ersetzt_fossile_heizung: form.ersetztFossil,
        wp_effizienzbonus_qualifiziert: form.effizienz,
        bereits_gefoerdert: false,
      },
      gebaeude: { bestandsgebaeude: form.bestand },
      antragsteller: { selbstnutzend: form.selbst, isfp_vorhanden: form.isfp },
      eigentumsform: form.eigentum,
    };
    if (form.kosten !== '') fall.massnahme.kosten_eur = Number(form.kosten);
    if (form.einkommen !== '') fall.antragsteller.haushaltseinkommen_eur = Number(form.einkommen);
    if (form.alter !== '') fall.gebaeude.alter_jahre = Number(form.alter);
    if (form.bundesland || form.plz || form.kommune) {
      fall.standort = {};
      if (form.bundesland) fall.standort.bundesland = form.bundesland;
      if (form.plz) fall.standort.plz = form.plz;
      if (form.kommune) fall.standort.kommune = form.kommune;
    }
    return fall;
  };

  const kiVorbefuellen = async () => {
    setKiLaden(true); setKiFehler(null); setKiErgebnis(null);
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freitext: form.freitext }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.fehler || `HTTP ${res.status}`);
      const neu = {};
      for (const v of data.felder) {
        const ziel = FP_INTAKE_MAP[v.feld];
        if (!ziel) continue;
        neu[ziel[0]] = ziel[1] === Boolean ? v.wert === true : String(v.wert);
      }
      setForm((f) => ({ ...f, ...neu }));
      setKiErgebnis(data);
    } catch (e) {
      setKiFehler(String(e.message || e));
    } finally {
      setKiLaden(false);
    }
  };

  const berechnen = async () => {
    setLaden(true); setFehler(null);
    try {
      const res = await fetch('/api/fahrplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fall: baueFall() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.fehler || `HTTP ${res.status}`);
      setErgebnis(data.fahrplan);
      setNetzbetreiber(data.netzbetreiber ?? null);
    } catch (e) {
      setFehler(String(e.message || e));
    } finally {
      setLaden(false);
    }
  };

  return (
    <AppShell active="fahrplan" onNav={onNav} title="Förder-Fahrplan" subtitle="Deterministische Engine — jede Zahl aus bequellten Programmdaten" search={false}>
      <div className="fk-screen">
        <div className="fk-screen__inner" style={{ display: 'grid', gridTemplateColumns: '380px minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
          <Card title="Ihr Vorhaben" subtitle="Angaben bestimmen Programme, Boni und Reihenfolge">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '12px 14px', border: '1px dashed var(--klein-600)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ font: 'var(--weight-bold) var(--text-sm)/1.3 var(--font-sans)', color: 'var(--klein-600)' }}>
                  Weniger tippen: KI-Vorbefüllung
                </span>
                <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                  Legen Sie Angebote, Bescheide, Datenblätter in <code>dokumente/</code> ab (<code>bun run ingest:dokumente</code>) und/oder
                  beschreiben Sie Ihr Vorhaben — die KI schlägt Feldwerte mit Beleg vor, Sie prüfen, die Engine rechnet.
                </span>
                <textarea
                  value={form.freitext}
                  onChange={set('freitext')}
                  placeholder="z. B.: Wir tauschen die Gasheizung von 1998 gegen eine Wärmepumpe, Angebot 38.000 €, Haus in München, wir wohnen selbst darin…"
                  rows={3}
                  style={{ width: '100%', resize: 'vertical', font: 'var(--font-body)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', background: 'transparent' }}
                />
                <Button variant="secondary" fullWidth onClick={kiVorbefuellen} disabled={kiLaden} iconLeft={<i data-lucide="sparkles"></i>}>
                  {kiLaden ? 'KI liest…' : 'Felder automatisch vorbefüllen'}
                </Button>
                {kiFehler && <FpWarnung text={kiFehler} />}
                {kiErgebnis && (
                  <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: 'var(--klein-600)', fontWeight: 600 }}>
                      {kiErgebnis.felder.length} Feld(er) vorbefüllt{kiErgebnis.dokumente_verwendet.length ? ` aus ${kiErgebnis.dokumente_verwendet.length} Dokument(en)` : ''} — bitte prüfen:
                    </span>
                    {kiErgebnis.felder.map((v) => (
                      <span key={v.feld}>• {v.feld} = <strong>{String(v.wert)}</strong> <em>({v.beleg.quelle}: „{v.beleg.zitat.slice(0, 60)}…“)</em></span>
                    ))}
                    {kiErgebnis.hinweis && <span>{kiErgebnis.hinweis}</span>}
                  </div>
                )}
              </div>
              <Select label="Maßnahme" value={form.typ} onChange={set('typ')}>
                {FP_MASSNAHMEN.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
              <Input label="Voraussichtliche Kosten" suffix="€" type="number" value={form.kosten} onChange={set('kosten')} />
              <Input label="Zu versteuerndes Haushaltseinkommen" suffix="€" type="number" value={form.einkommen} onChange={set('einkommen')} hint="≤ 40.000 € → Einkommensbonus" />
              <Input label="Gebäudealter" suffix="Jahre" type="number" value={form.alter} onChange={set('alter')} />
              <Select label="Eigentumsform" value={form.eigentum} onChange={set('eigentum')}>
                {FP_EIGENTUM.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
              <Select label="Bundesland (für regionale Programme)" value={form.bundesland} onChange={set('bundesland')}>
                {FP_BUNDESLAENDER.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
              <div className="fk-row" style={{ gap: 10 }}>
                <Input label="PLZ" type="text" value={form.plz} onChange={set('plz')} />
                <Input label="Stadt/Gemeinde" type="text" value={form.kommune} onChange={set('kommune')} />
              </div>
              <Switch label="Bestandsgebäude (kein Neubau)" checked={form.bestand} onChange={set('bestand')} />
              <Switch label="Ich wohne selbst im Gebäude" checked={form.selbst} onChange={set('selbst')} />
              <Switch label="Ersetzt funktionstüchtige fossile Heizung" checked={form.ersetztFossil} onChange={set('ersetztFossil')} />
              {form.typ === 'waermepumpe' && (
                <Switch label="Natürliches Kältemittel oder Erd-/Wasserquelle" checked={form.effizienz} onChange={set('effizienz')} />
              )}
              <Switch label="iSFP (Sanierungsfahrplan) liegt vor" checked={form.isfp} onChange={set('isfp')} />
              <Switch label="Schon beauftragt / begonnen" checked={form.begonnen} onChange={set('begonnen')} />
              <Button fullWidth onClick={berechnen} disabled={laden} iconLeft={<i data-lucide="route"></i>}>
                {laden ? 'Berechne…' : 'Fahrplan berechnen'}
              </Button>
              {fehler && <FpWarnung text={`Fehler: ${fehler}`} />}
            </div>
          </Card>

          <div>
            {ergebnis ? (
              <FpErgebnis f={ergebnis} netzbetreiber={netzbetreiber} />
            ) : (
              <Card title="Noch kein Fahrplan berechnet" subtitle="Links den Fall erfassen und berechnen">
                <p style={{ font: 'var(--font-body)', color: 'var(--text-muted)' }}>
                  Die Antwort kommt live aus der deterministischen Engine (<code>src/rules/fahrplan.ts</code>) —
                  Fördersätze, Reihenfolge und Dokumente stammen aus den bequellten Programmdaten, nicht aus Beispieldaten.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { Fahrplan });
