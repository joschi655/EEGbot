/* EEGbot B2C — Ü20 / „Nach der Förderung": Optionen nach Ablauf der 20-jährigen
   EEG-Vergütung im Vergleich. Live gegen POST /api/ue20 (deterministische Engine
   — nichts gemockt, FINK_DATA wird hier NICHT gelesen). Farbregel: weiß +
   Klein-Blau; Rot NUR für Warnungen. */

/* ISO-Datum (YYYY-MM-DD) → TT.MM.JJJJ; unbekanntes Format 1:1 zurück. */
const ue20Datum = (iso) => {
  if (!iso || typeof iso !== 'string') return '—';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
};

/* €/Jahr deutsch (2 Nachkommastellen). Fehlender Wert → null (Anzeige „—"). */
const ue20Eur = (n) =>
  typeof n === 'number' && Number.isFinite(n)
    ? n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : null;

/* Rot NUR hier. */
function Ue20Warnung({ text }) {
  const { Badge } = window.FinkDesignSystem_4f2014;
  return (
    <div className="fk-row" style={{ gap: 10, alignItems: 'flex-start', padding: '10px 14px', border: '1px solid var(--border-subtle)', borderLeft: '3px solid #C6291F', borderRadius: 'var(--radius-md)' }}>
      <Badge tone="overdue">Achtung</Badge>
      <span style={{ font: 'var(--font-body)', color: 'var(--text-primary)' }}>{text}</span>
    </div>
  );
}

function Ue20Quellen({ quellen }) {
  if (!Array.isArray(quellen) || quellen.length === 0) return null;
  return (
    <div className="fk-cites" style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', fontWeight: 600 }}>Quellen</span>
      {quellen.map((q, i) => {
        const label = `${q.bezeichnung || 'Quelle'}${q.fundstelle ? ` — ${q.fundstelle}` : ''}`;
        return q.url ? (
          <a key={i} href={q.url} target="_blank" rel="noreferrer" style={{ color: 'var(--klein-600)', font: 'var(--font-caption)' }}>{label}</a>
        ) : (
          <span key={i} style={{ color: 'var(--text-muted)', font: 'var(--font-caption)' }}>{label}</span>
        );
      })}
    </div>
  );
}

function Ue20Liste({ titel, eintraege, farbe }) {
  if (!Array.isArray(eintraege) || eintraege.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', fontWeight: 600 }}>{titel}</span>
      {eintraege.map((t, i) => (
        <span key={i} style={{ font: 'var(--font-caption)', color: farbe || 'var(--text-muted)' }}>• {t}</span>
      ))}
    </div>
  );
}

function Ue20Ergebnis({ d, input }) {
  const { Card, Badge } = window.FinkDesignSystem_4f2014;
  const optionen = Array.isArray(d.optionen) ? d.optionen : [];
  const warnungen = Array.isArray(d.warnungen) ? d.warnungen : [];

  // Beste Option = höchster jahresertrag_eur unter den Optionen mit Zahlwert.
  let besteIdx = -1; let besterWert = -Infinity;
  optionen.forEach((o, i) => {
    const w = o.jahresertrag_eur;
    if (typeof w === 'number' && Number.isFinite(w) && w > besterWert) { besterWert = w; besteIdx = i; }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="fk-row" style={{ gap: 10, alignItems: 'center' }}>
        {d.ist_ausgefoerdert
          ? <Badge tone="overdue" size="lg">Ausgefördert seit {ue20Datum(d.foerderende)}</Badge>
          : <Badge tone="neutral" size="lg">Vorschau · Förderung läuft bis {ue20Datum(d.foerderende)}</Badge>}
      </div>

      {warnungen.map((w, i) => <Ue20Warnung key={i} text={w} />)}

      {optionen.length === 0 && (
        <Card title={d.modus === 'vorschau' ? 'Noch kein Ü20-Vergleich' : 'Keine Optionen ermittelt'} subtitle={d.modus === 'vorschau' ? 'Heutige Marktwerte werden nicht auf das Förderende fortgeschrieben' : 'Auf Basis der Angaben liefert die Engine keine Handlungsoption'}>
          <p style={{ font: 'var(--font-body)', color: 'var(--text-muted)' }}>
            {d.modus === 'vorschau'
              ? 'Die Engine zeigt den Förderhorizont, erzeugt aber bewusst keine scheinpräzisen Ertragsoptionen für einen zukünftigen Markt- und Rechtsstand.'
              : 'Ergänzen Sie Jahresertrag, Eigenverbrauchsanteil und Strompreis für eine belastbare Ertragsschätzung — oder prüfen Sie das Inbetriebnahmedatum.'}
          </p>
        </Card>
      )}

      {optionen.map((o, i) => {
        const eur = ue20Eur(o.jahresertrag_eur);
        const beste = i === besteIdx;
        return (
          <Card
            key={i}
            title={o.option || `Option ${i + 1}`}
            variant={beste ? 'accent' : 'default'}
            headerAction={beste ? <Badge tone="compliant">beste Option</Badge> : null}
          >
            <div className="fk-row" style={{ gap: 8, alignItems: 'baseline' }}>
              <span style={{ font: 'var(--weight-bold) 34px/1 var(--font-sans)', color: 'var(--klein-600)' }}>{eur != null ? eur : '—'}</span>
              {eur != null && <span style={{ font: 'var(--font-body)', color: 'var(--text-muted)' }}>€/Jahr</span>}
            </div>
            <Ue20Liste titel="Annahmen" eintraege={o.annahmen} />
            <Ue20Liste titel="Hinweise" eintraege={o.hinweise} farbe="var(--text-secondary)" />
          </Card>
        );
      })}

      <Ue20Quellen quellen={d.quellen} />
      <Rechenweg
        inputs={{ Inbetriebnahme: input.ibn_datum, Leistung_kWp: input.leistung_kwp, Jahresertrag_kWh: input.jahresertrag_kwh || 'Engine-Standard', Eigenverbrauch_Prozent: input.eigenverbrauchsanteil_prozent || 'Engine-Standard', Strompreis_ct_kWh: input.strompreis_ct_kwh || 'Engine-Standard' }}
        schritte={optionen.flatMap((o) => o.annahmen || [])}
        parameterstand={d.modus === 'vorschau'
          ? 'Keine Zukunftsfortschreibung; nur Förderhorizont'
          : d.parameterstand ? `${d.parameterstand.id}: ${d.parameterstand.gueltig_von} bis ${d.parameterstand.gueltig_bis || 'bis zur nächsten Veröffentlichung'} (${d.parameterstand.quelle})` : 'Jahresmarktwert zum gewählten Stichtag'}
        normen={['§ 25 EEG', '§ 21 Abs. 1 Nr. 3 EEG', 'Anlage 1 EEG']}
        quellen={d.quellen}
      />
    </div>
  );
}

function Ue20({ onNav }) {
  const { Card, Button, Input } = window.FinkDesignSystem_4f2014;
  const [profil] = React.useState(() => (window.EEGBOT_PROFIL && EEGBOT_PROFIL.lade()) || null);
  const zahlOderLeer = (v) => (v != null ? String(v) : '');
  const [form, setForm] = React.useState(() => ({
    ibn_datum: (profil && profil.ibn_datum) || '',
    leistung_kwp: zahlOderLeer(profil && profil.leistung_kwp),
    jahresertrag_kwh: zahlOderLeer(profil && profil.jahresertrag_kwh),
    eigenverbrauchsanteil_prozent: zahlOderLeer(profil && profil.eigenverbrauchsanteil_prozent),
    strompreis_ct_kwh: zahlOderLeer(profil && profil.strompreis_ct_kwh),
  }));
  const [ergebnis, setErgebnis] = React.useState(null);
  const [fehler, setFehler] = React.useState(null);
  const [laden, setLaden] = React.useState(false);
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  const set = (k) => (ev) => setForm({ ...form, [k]: ev.target.value });
  const kannBerechnen = !!form.ibn_datum && form.leistung_kwp !== '' && Number.isFinite(Number(form.leistung_kwp));

  const berechnen = async () => {
    if (!kannBerechnen) return;
    setLaden(true); setFehler(null);
    try {
      const body = { ibn_datum: form.ibn_datum, leistung_kwp: Number(form.leistung_kwp) };
      // Optionale Felder nur mitsenden, wenn befüllt und numerisch.
      if (form.jahresertrag_kwh !== '' && Number.isFinite(Number(form.jahresertrag_kwh))) body.jahresertrag_kwh = Number(form.jahresertrag_kwh);
      if (form.eigenverbrauchsanteil_prozent !== '' && Number.isFinite(Number(form.eigenverbrauchsanteil_prozent))) body.eigenverbrauchsanteil_prozent = Number(form.eigenverbrauchsanteil_prozent);
      if (form.strompreis_ct_kwh !== '' && Number.isFinite(Number(form.strompreis_ct_kwh))) body.strompreis_ct_kwh = Number(form.strompreis_ct_kwh);

      const res = await fetch('/api/ue20', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data && data.fehler) || `HTTP ${res.status}`);
      setErgebnis(data);
    } catch (e) {
      setErgebnis(null);
      setFehler(String((e && e.message) || e));
    } finally {
      setLaden(false);
    }
  };

  return (
    <AppShell active="ue20" onNav={onNav} title="Nach der Förderung" subtitle="Was tun, wenn die 20 Jahre EEG-Vergütung enden? Optionen im Vergleich" search={false}>
      <div className="fk-screen">
        <div className="fk-screen__inner fk-calculator-layout">
          <Card title="Ihre Anlage" subtitle="Ertragsdaten schärfen die Schätzung, sind aber optional">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {profil && (
                <span style={{ font: 'var(--font-caption)', color: 'var(--klein-600)' }}>✓ Aus Ihrem Anlagenprofil vorbefüllt</span>
              )}
              <Input label="Inbetriebnahmedatum" type="date" value={form.ibn_datum} onChange={set('ibn_datum')} hint="Bestimmt, wann die 20 Jahre enden" />
              <Input label="Leistung" suffix="kWp" type="number" min={0} step="0.01" value={form.leistung_kwp} onChange={set('leistung_kwp')} />
              <Input label="Jahresertrag (optional)" suffix="kWh" type="number" min={0} value={form.jahresertrag_kwh} onChange={set('jahresertrag_kwh')} hint="Leer lassen → Engine schätzt aus der Leistung" />
              <Input label="Eigenverbrauchsanteil (optional)" suffix="%" type="number" min={0} max={100} value={form.eigenverbrauchsanteil_prozent} onChange={set('eigenverbrauchsanteil_prozent')} hint="0–100" />
              <Input label="Ihr Strompreis (optional)" suffix="ct/kWh" type="number" min={0} step="0.1" value={form.strompreis_ct_kwh} onChange={set('strompreis_ct_kwh')} hint="Für den Wert des Eigenverbrauchs" />
              <Button fullWidth onClick={berechnen} disabled={laden || !kannBerechnen} iconLeft={<i data-lucide="sun"></i>}>
                {laden ? 'Berechne…' : 'Optionen vergleichen'}
              </Button>
              {fehler && <Ue20Warnung text={`Fehler: ${fehler}`} />}
            </div>
          </Card>

          <div>
            {ergebnis ? (
              <Ue20Ergebnis d={ergebnis} input={form} />
            ) : (
              <Card title="Noch nichts berechnet" subtitle="Links die Anlage erfassen und Optionen vergleichen">
                <p style={{ font: 'var(--font-body)', color: 'var(--text-muted)' }}>
                  Wenn die 20-jährige EEG-Vergütung endet, bleibt Ihre Anlage wertvoll. Die Engine
                  (POST <code>/api/ue20</code>) vergleicht die Optionen — von der Anschlussvergütung bis zur
                  Optimierung des Eigenverbrauchs — und schätzt den Jahresertrag je Weg. Jahresertrag,
                  Eigenverbrauchsanteil und Strompreis verfeinern die Schätzung, sind aber nicht zwingend.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { Ue20 });
