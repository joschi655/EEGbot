/* EEGbot B2C — Recherche: Volltextsuche über Normen, Clearingstelle und
   Rechtsprechung. Live gegen POST /api/frage — KEINE KI-Antworten, echte
   Fundstellen. Kein Chat-UI: Suchleiste oben, Treffer darunter. FINK_DATA wird
   hier NICHT gelesen. Farbregel: weiß + Klein-Blau. */

const RE_BEISPIELE = [
  'Rückforderung Strafzahlung Meldepflicht',
  'Anlagenzusammenfassung § 24',
  'Volleinspeisung Meldung Netzbetreiber',
  'ausgeförderte Anlagen Anschlussvergütung',
];

const RE_CHIP = {
  font: 'var(--font-caption)', color: 'var(--klein-700)', background: 'var(--klein-50)',
  border: '1px solid var(--klein-100)', borderRadius: 'var(--radius-full)',
  padding: '5px 12px', cursor: 'pointer', whiteSpace: 'nowrap',
};

const RE_TITEL = { font: 'var(--weight-bold) var(--text-md)/1.3 var(--font-sans)', color: 'var(--text-primary)' };

/* ISO-Datum (YYYY-MM-DD) → TT.MM.JJJJ; unbekanntes Format 1:1 zurück. */
const reDatum = (iso) => {
  if (!iso || typeof iso !== 'string') return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
};

/* Textauszug auf ~max Zeichen kürzen, möglichst an Wortgrenze, mit Ellipse. */
const reKurz = (text, max = 300) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= max) return text;
  const schnitt = text.slice(0, max);
  const grenze = schnitt.lastIndexOf(' ');
  const basis = grenze > max * 0.6 ? schnitt.slice(0, grenze) : schnitt;
  return `${basis.replace(/\s+$/, '')} …`;
};

function ReLeer({ block }) {
  return <p style={{ font: 'var(--font-body)', color: 'var(--text-muted)', margin: 0 }}>Keine Treffer in {block}.</p>;
}

function ReAuszug({ text }) {
  if (!text) return null;
  return <p style={{ font: 'var(--font-body)', color: 'var(--text-muted)', margin: 0 }}>{reKurz(text)}</p>;
}

function ReTreffer({ children, letzter }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingBottom: letzter ? 0 : 12, borderBottom: letzter ? 'none' : '1px solid var(--border-subtle)' }}>
      {children}
    </div>
  );
}

function ReNormen({ treffer }) {
  const { Tag } = window.FinkDesignSystem_4f2014;
  if (treffer.length === 0) return <ReLeer block="Normen" />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {treffer.map((n, i) => (
        <ReTreffer key={i} letzter={i === treffer.length - 1}>
          <div className="fk-row" style={{ gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
            <span style={RE_TITEL}>{[n.jurabk, n.enbez].filter(Boolean).join(' ') || '(ohne Fundstelle)'}</span>
            {n.titel && <span style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>{n.titel}</span>}
            {n.absatz_nr != null && n.absatz_nr !== '' && <Tag>Abs. {n.absatz_nr}</Tag>}
          </div>
          <ReAuszug text={n.text} />
        </ReTreffer>
      ))}
    </div>
  );
}

function ReClearing({ treffer }) {
  const { Tag } = window.FinkDesignSystem_4f2014;
  if (treffer.length === 0) return <ReLeer block="Clearingstelle" />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {treffer.map((c, i) => (
        <ReTreffer key={i} letzter={i === treffer.length - 1}>
          <div className="fk-row" style={{ gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
            {c.url
              ? <a href={c.url} target="_blank" rel="noreferrer" style={{ ...RE_TITEL, color: 'var(--klein-600)' }}>{c.titel || c.url}</a>
              : <span style={RE_TITEL}>{c.titel || '(ohne Titel)'}</span>}
            {c.typ && <Tag>{c.typ}</Tag>}
          </div>
          <ReAuszug text={c.text} />
        </ReTreffer>
      ))}
    </div>
  );
}

function ReRechtsprechung({ treffer }) {
  if (treffer.length === 0) return <ReLeer block="Rechtsprechung" />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {treffer.map((r, i) => (
        <ReTreffer key={i} letzter={i === treffer.length - 1}>
          <div className="fk-row" style={{ gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
            <span style={RE_TITEL}>{[r.gericht, r.az].filter(Boolean).join(', ') || '(Gericht unbekannt)'}</span>
            {r.datum && <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>{reDatum(r.datum)}</span>}
          </div>
          {r.warum && <span style={{ font: 'var(--font-body)', color: 'var(--klein-600)' }}>{r.warum}</span>}
          <ReAuszug text={r.text} />
          {r.quelle_url && <a href={r.quelle_url} target="_blank" rel="noreferrer" style={{ font: 'var(--font-caption)', color: 'var(--klein-600)' }}>Quelle öffnen</a>}
        </ReTreffer>
      ))}
    </div>
  );
}

function Recherche({ onNav }) {
  const { Card, Button, Input } = window.FinkDesignSystem_4f2014;
  const [frage, setFrage] = React.useState('');
  const [stichtag, setStichtag] = React.useState('');
  const [ergebnis, setErgebnis] = React.useState(null);
  const [fehler, setFehler] = React.useState(null);
  const [laden, setLaden] = React.useState(false);
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  const suchen = async (override) => {
    const q = String(override != null ? override : frage).trim();
    if (!q) { setFehler('Bitte geben Sie einen Suchbegriff ein.'); return; }
    setLaden(true); setFehler(null);
    try {
      const body = { frage: q };
      if (stichtag) body.stichtag = stichtag;   // Stichtag nur mitsenden, wenn gesetzt.
      const res = await fetch('/api/frage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data && data.fehler) || `HTTP ${res.status}`);
      setErgebnis(data);
    } catch (e) {
      setErgebnis(null);
      setFehler(`Suche fehlgeschlagen: ${String((e && e.message) || e)}`);
    } finally {
      setLaden(false);
    }
  };

  const beispielKlick = (b) => { setFrage(b); suchen(b); };
  const aufEnter = (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); suchen(); } };

  const normen = ergebnis && Array.isArray(ergebnis.normen) ? ergebnis.normen : [];
  const clearing = ergebnis && Array.isArray(ergebnis.clearingstelle) ? ergebnis.clearingstelle : [];
  const rechtsprechung = ergebnis && Array.isArray(ergebnis.rechtsprechung) ? ergebnis.rechtsprechung : [];
  const gesamt = normen.length + clearing.length + rechtsprechung.length;

  return (
    <AppShell active="recherche" onNav={onNav} title="Recherche" subtitle="Volltextsuche über Normen, Clearingstelle und Rechtsprechung — keine KI-Antworten, echte Fundstellen" search={false}>
      <div className="fk-screen">
        <div className="fk-screen__inner" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card title="Suche" subtitle="Freitext über den gesamten EEG-Normbestand, die Clearingstelle und die Rechtsprechung">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="fk-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {RE_BEISPIELE.map((b) => (
                  <button key={b} type="button" onClick={() => beispielKlick(b)} disabled={laden} style={RE_CHIP}>{b}</button>
                ))}
              </div>
              <div className="fk-row" style={{ gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 320px' }}>
                  <Input label="Suchbegriff" type="text" value={frage} onChange={(e) => setFrage(e.target.value)} onKeyDown={aufEnter} placeholder="z. B. Rückforderung bei verspäteter MaStR-Meldung" iconLeft={<i data-lucide="search"></i>} />
                </div>
                <div style={{ flex: '0 1 200px' }}>
                  <Input label="Stichtag (optional)" type="date" value={stichtag} onChange={(e) => setStichtag(e.target.value)} hint="Rechtsstand zu diesem Datum" />
                </div>
                <Button onClick={() => suchen()} disabled={laden || !frage.trim()} iconLeft={<i data-lucide="search"></i>}>
                  {laden ? 'Suche…' : 'Suchen'}
                </Button>
              </div>
              {fehler && (
                <div className="fk-row" style={{ gap: 10, alignItems: 'center', padding: '10px 14px', border: '1px solid var(--border-subtle)', borderLeft: '3px solid #C6291F', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ font: 'var(--font-body)', color: 'var(--text-primary)' }}>{fehler}</span>
                </div>
              )}
            </div>
          </Card>

          {ergebnis ? (
            <React.Fragment>
              <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', margin: 0 }}>
                {gesamt} Treffer für „{ergebnis.frage || frage}“ · Rechtsstand: {ergebnis.stichtag || 'aktuell'}
              </p>
              <Card title="Normen" subtitle={`${normen.length} Treffer im Gesetzestext`}>
                <ReNormen treffer={normen} />
              </Card>
              <Card title="Clearingstelle" subtitle={`${clearing.length} Treffer (Empfehlungen, Hinweise, häufige Rechtsfragen)`}>
                <ReClearing treffer={clearing} />
              </Card>
              <Card title="Rechtsprechung" subtitle={`${rechtsprechung.length} Treffer (Urteile & Beschlüsse)`}>
                <ReRechtsprechung treffer={rechtsprechung} />
              </Card>
            </React.Fragment>
          ) : (
            <Card title="Echte Fundstellen statt KI-Antworten" subtitle="So funktioniert die Recherche">
              <p style={{ font: 'var(--font-body)', color: 'var(--text-muted)' }}>
                Die Suche geht per Volltext (POST <code>/api/frage</code>) über drei Quellen: den <strong>Normbestand</strong>
                {' '}(EEG, KWKG u. a.), die <strong>Clearingstelle EEG/KWKG</strong> und die <strong>Rechtsprechung</strong>.
                Sie erhalten die Original-Fundstellen mit Textauszug und Link — keine generierte Antwort, nichts Erfundenes.
                Mit dem optionalen Stichtag prüfen Sie den Rechtsstand zu einem bestimmten Datum. Ein Beispiel oben genügt
                zum Start.
              </p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { Recherche });
