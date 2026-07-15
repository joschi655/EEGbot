/* fink app — Norm-Graph: live gegen GET /api/graph (Normgraph-SQLite, nichts
   gemockt). Das echte Querverweis-Netz des EEG als force-directed Canvas-Graph
   mit Stichtags-Zeitreise (inkl. EEG-2027-ENTWURF) und Fall-Modus (markiert die
   Normenkette des Rueckforderungs-Demofalls). Farbregel: Klein-Blau als Akzent;
   Amber ausschliesslich als Warn-Akzent fuer ENTWURFS-Normen. */

const NG_HEUTE = new Date().toISOString().slice(0, 10);
const NG_STICHTAGE = [
  ['2020-06-01', 'EEG 2017'],
  ['2021-01-02', 'EEG 2021'],
  ['2023-01-01', 'EEG 2023'],
  ['2024-06-01', 'Solarpaket I'],
  ['2025-04-01', 'Solarspitzen-G.'],
  [NG_HEUTE, 'Heute'],
  ['2027-01-15', 'EEG 2027-E'],
];
/* Seeds = Normenkette des 45.540-EUR-Demofalls (Sanktion, Meldepflicht, Anspruch).
   § 100 (Versteinerung) wird nur MARKIERT, nicht expandiert - als Hub wuerde er
   mit Tiefe 1 sonst 68 statt 21 Knoten aufleuchten lassen (buehnenuntauglich). */
const NG_FALL_SEEDS = ['§ 52', '§ 71', '§ 19'];
const NG_FALL_MARKIERE = ['§ 100'];
const NG_BLAU = '#1213BE';
const NG_AMBER = '#D97706';

function NormGraph({ onNav }) {
  const { Button, Tag } = window.FinkDesignSystem_4f2014;
  const canvasRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const simRef = React.useRef(null);
  const rafRef = React.useRef(0);
  const posRef = React.useRef(new Map()); // enbez -> {x,y}, ueberlebt Stichtagswechsel
  const zRef = React.useRef({ nodes: [], links: [], highlight: null, hover: null, sel: null });

  const [idx, setIdx] = React.useState(5); // Default: Heute
  const [fall, setFall] = React.useState(false);
  const [meta, setMeta] = React.useState({ nodes: 0, edges: 0, entwurf: 0 });
  const [delta, setDelta] = React.useState(null);
  const [sel, setSel] = React.useState(null); // {enbez}
  const [norm, setNorm] = React.useState(null); // /api/norm-Antwort
  const [hinweis, setHinweis] = React.useState('');
  const vorherRef = React.useRef(null);

  const radius = (n) => 3.5 + Math.sqrt(n.grad || 0) * 0.95;

  const starteSimulation = React.useCallback((j) => {
    const d3 = window.d3;
    const canvas = canvasRef.current;
    if (!d3 || !canvas) return;
    const W = canvas.clientWidth || 900;
    const H = canvas.clientHeight || 620;
    const nodes = j.nodes.map((n) => {
      const p = posRef.current.get(n.enbez);
      return {
        ...n, id: n.enbez,
        x: p ? p.x : W / 2 + (Math.random() - 0.5) * 120,
        y: p ? p.y : H / 2 + (Math.random() - 0.5) * 120,
      };
    });
    const vorhanden = new Set(nodes.map((n) => n.id));
    const links = j.edges
      .filter((e) => vorhanden.has(e.von) && vorhanden.has(e.nach))
      .map((e) => ({ source: e.von, target: e.nach, n: e.n }));
    zRef.current = { ...zRef.current, nodes, links, highlight: j.highlight ? new Set(j.highlight) : null };
    if (simRef.current) simRef.current.stop();
    simRef.current = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(48).strength(0.12))
      .force('charge', d3.forceManyBody().strength(-46))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collide', d3.forceCollide().radius((d) => radius(d) + 2.5))
      .alpha(0.9).alphaDecay(0.028)
      .on('tick', () => { for (const n of nodes) posRef.current.set(n.id, { x: n.x, y: n.y }); });
  }, []);

  const seqRef = React.useRef(0); // Out-of-order-Schutz: nur die zuletzt angeforderte Antwort gewinnt

  const lade = React.useCallback(async (i, fallAktiv) => {
    const seq = ++seqRef.current;
    const datum = NG_STICHTAGE[i][0];
    const params = new URLSearchParams({ stichtag: datum });
    if (fallAktiv) {
      params.set('fall', NG_FALL_SEEDS.join(','));
      params.set('tiefe', '1');
      params.set('markiere', NG_FALL_MARKIERE.join(','));
    }
    let j;
    try {
      j = await (await fetch('/api/graph?' + params.toString())).json();
    } catch (e) {
      if (seq === seqRef.current) setHinweis('API nicht erreichbar - laeuft `bun ui/server.ts`?');
      return;
    }
    if (seq !== seqRef.current) return; // inzwischen wurde ein neuerer Stand angefordert
    if (j.fehler) { setHinweis(j.fehler); return; }
    if (!window.d3) { setHinweis('d3 nicht geladen - bun install ausfuehren und /vendor/d3.js pruefen.'); return; }
    const entwurfN = j.nodes.filter((n) => n.entwurf).length;
    setMeta({ nodes: j.nodes.length, edges: j.edges.length, entwurf: entwurfN });
    setHinweis(datum >= '2027-01-01' && entwurfN === 0
      ? 'EEG-2027-Entwurf ist nicht im Graphen. Einmal ausfuehren: bun run build:eeg2027'
      : '');
    if (vorherRef.current && vorherRef.current.datum !== datum) {
      const alt = new Set(vorherRef.current.enbez);
      const jetzt = new Set(j.nodes.map((n) => n.enbez));
      const neu = j.nodes.map((n) => n.enbez).filter((e) => !alt.has(e));
      const weg = vorherRef.current.enbez.filter((e) => !jetzt.has(e));
      setDelta(neu.length || weg.length ? { neu, weg, seit: vorherRef.current.label } : null);
    }
    vorherRef.current = { datum, label: NG_STICHTAGE[i][1], enbez: j.nodes.map((n) => n.enbez) };
    starteSimulation(j);
  }, [starteSimulation]);

  React.useEffect(() => { lade(idx, fall); }, [idx, fall, lade]);

  /* Norm-Panel bei Auswahl nachladen (mit Out-of-order-Schutz) */
  const normSeqRef = React.useRef(0);
  React.useEffect(() => {
    if (!sel) { setNorm(null); return; }
    const seq = ++normSeqRef.current;
    const datum = NG_STICHTAGE[idx][0];
    fetch(`/api/norm?enbez=${encodeURIComponent(sel)}&datum=${datum}`)
      .then((r) => r.json())
      .then((j) => { if (seq === normSeqRef.current) setNorm(j); })
      .catch(() => { if (seq === normSeqRef.current) setNorm({ fehler: `${sel} nicht ladbar - API erreichbar?` }); });
  }, [sel, idx]);

  /* Render-Loop (Canvas) + Interaktion */
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const zeichne = (t) => {
      const { nodes, links, highlight, hover } = zRef.current;
      const selId = zRef.current.sel;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      for (const l of links) {
        const dim = highlight && !(highlight.has(l.source.id) && highlight.has(l.target.id));
        ctx.strokeStyle = dim ? 'rgba(15,23,42,0.04)' : `rgba(18,19,190,${Math.min(0.07 + l.n * 0.03, 0.32)})`;
        ctx.lineWidth = dim ? 0.5 : Math.min(0.6 + l.n * 0.25, 2.2);
        ctx.beginPath(); ctx.moveTo(l.source.x, l.source.y); ctx.lineTo(l.target.x, l.target.y); ctx.stroke();
      }

      const puls = 1 + 0.22 * Math.sin(t / 320); // ENTWURF-Knoten atmen
      for (const n of nodes) {
        const dim = highlight && !highlight.has(n.id);
        const r = radius(n) * (n.entwurf ? puls : 1);
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = dim ? 'rgba(15,23,42,0.10)' : n.entwurf ? NG_AMBER : NG_BLAU;
        ctx.globalAlpha = dim ? 1 : 0.9; ctx.fill(); ctx.globalAlpha = 1;
        if (n.entwurf && !dim) { // Warn-Ring; aufgehobene Normen gestrichelt (Wegfall, kein Neuzugang)
          const aufgehoben = (n.titel || '').startsWith('(aufgehoben)');
          if (aufgehoben) ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.arc(n.x, n.y, r + 3.5 * puls, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(217,119,6,0.45)'; ctx.lineWidth = 1.4; ctx.stroke();
          if (aufgehoben) ctx.setLineDash([]);
        }
        if (n.id === hover || n.id === selId) {
          ctx.beginPath(); ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
          ctx.strokeStyle = NG_BLAU; ctx.lineWidth = 2; ctx.stroke();
        }
        const label = n.grad >= 40 || n.entwurf || n.id === hover || n.id === selId || (highlight && highlight.has(n.id) && n.grad >= 8);
        if (label && !dim) {
          ctx.font = '600 11px Inter, system-ui, sans-serif';
          ctx.fillStyle = n.entwurf ? NG_AMBER : 'rgba(15,23,42,0.78)';
          ctx.fillText(n.id, n.x + r + 4, n.y + 3.5);
        }
      }
      rafRef.current = requestAnimationFrame(zeichne);
    };
    rafRef.current = requestAnimationFrame(zeichne);

    const finde = (ev) => {
      const rect = canvas.getBoundingClientRect();
      const sim = simRef.current;
      if (!sim) return null;
      const n = sim.find(ev.clientX - rect.left, ev.clientY - rect.top, 16);
      return n ? n.id : null;
    };
    const move = (ev) => {
      const id = finde(ev);
      zRef.current.hover = id;
      canvas.style.cursor = id ? 'pointer' : 'default';
    };
    const klick = (ev) => {
      const id = finde(ev);
      zRef.current.sel = id;
      setSel(id);
    };
    const leave = () => { zRef.current.hover = null; canvas.style.cursor = 'default'; };
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseleave', leave);
    canvas.addEventListener('click', klick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mouseleave', leave);
      canvas.removeEventListener('click', klick);
      if (simRef.current) simRef.current.stop();
    };
  }, []);

  const [datum, label] = NG_STICHTAGE[idx];
  const istEntwurf = datum >= '2027-01-01';
  const normIstEntwurf = norm && (norm.titel || '').startsWith('[ENTWURF');

  return (
    <AppShell active="normgraph" onNav={onNav} title="Norm-Graph" search={false}
      subtitle="Das EEG als Netz: jede Kante ist ein echter Querverweis aus dem Gesetzestext - deterministisch aus dem Normgraphen"
      actions={<Button variant={fall ? 'primary' : 'secondary'} iconLeft={<i data-lucide="waypoints"></i>}
        onClick={() => setFall(!fall)}>{fall ? 'Fall ausblenden' : '45.540-EUR-Fall zeigen'}</Button>}>
      <div style={{ display: 'flex', gap: 16, padding: '16px 24px 24px', height: 'calc(100% - 8px)', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          {/* Zeitreise-Slider */}
          <div style={{ background: '#fff', border: '1px solid rgba(15,23,42,0.08)', borderRadius: 14, padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: istEntwurf ? NG_AMBER : NG_BLAU }}>
                {label}{istEntwurf ? ' (ENTWURF, RefE 21.04.2026 - kein geltendes Recht)' : ''}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(15,23,42,0.55)' }}>
                Stichtag {datum} · {meta.nodes} Normen · {meta.edges} Querverweis-Kanten{meta.entwurf ? ` · ${meta.entwurf} ENTWURF` : ''}
              </span>
            </div>
            <input type="range" min={0} max={NG_STICHTAGE.length - 1} step={1} value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              style={{ width: '100%', accentColor: istEntwurf ? NG_AMBER : NG_BLAU }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'rgba(15,23,42,0.5)', marginTop: 2 }}>
              {NG_STICHTAGE.map(([d, l], i) => (
                <span key={d} style={{ fontWeight: i === idx ? 700 : 400, color: i === idx ? (d >= '2027-01-01' ? NG_AMBER : NG_BLAU) : undefined, cursor: 'pointer' }}
                  onClick={() => setIdx(i)}>{l}</span>
              ))}
            </div>
            {delta && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, fontSize: 12 }}>
                {delta.neu.length > 0 && <span style={{ color: NG_AMBER, fontWeight: 600 }}>Neu gegenueber {delta.seit}: {delta.neu.slice(0, 8).join(', ')}{delta.neu.length > 8 ? ' u.a.' : ''}</span>}
                {delta.weg.length > 0 && <span style={{ color: 'rgba(15,23,42,0.55)' }}>Entfaellt: {delta.weg.slice(0, 8).join(', ')}{delta.weg.length > 8 ? ' u.a.' : ''}</span>}
              </div>
            )}
            {hinweis && <div style={{ marginTop: 8, fontSize: 12.5, color: NG_AMBER, fontWeight: 600 }}>{hinweis}</div>}
          </div>
          {/* Graph-Canvas */}
          <div ref={wrapRef} style={{ flex: 1, background: '#fff', border: '1px solid rgba(15,23,42,0.08)', borderRadius: 14, position: 'relative', minHeight: 420, overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', left: 14, bottom: 12, display: 'flex', gap: 14, fontSize: 11.5, color: 'rgba(15,23,42,0.6)', background: 'rgba(255,255,255,0.85)', padding: '4px 10px', borderRadius: 8 }}>
              <span><span style={{ color: NG_BLAU }}>&#9679;</span> geltende Norm (Groesse = Vernetzungsgrad)</span>
              <span><span style={{ color: NG_AMBER }}>&#9679;</span> ENTWURF EEG 2027</span>
              {fall && <span>gedimmt = nicht Teil des Falls (Seeds: {NG_FALL_SEEDS.join(', ')}, Tiefe 1; {NG_FALL_MARKIERE.join(', ')} markiert)</span>}
            </div>
          </div>
        </div>
        {/* Norm-Panel */}
        <div style={{ width: 330, flexShrink: 0, background: '#fff', border: '1px solid rgba(15,23,42,0.08)', borderRadius: 14, padding: 18, overflowY: 'auto' }}>
          {!sel && (
            <div style={{ fontSize: 13, color: 'rgba(15,23,42,0.6)', lineHeight: 1.55 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'rgba(15,23,42,0.85)', marginBottom: 8 }}>So liest du den Graphen</div>
              Jeder Punkt ist ein Paragraf des EEG, jede Linie ein Querverweis im Gesetzestext.
              Grosse Knoten sind stark vernetzt (Paragraf 100 ist das Uebergangsrecht-Zentrum).
              Zieh den Regler nach rechts: Das Gesetz verdrahtet sich um - im EEG-2027-Entwurf
              leuchten neue Normen wie Paragraf 20a (Refinanzierungsbeitrag) amber auf.
              Klick auf einen Knoten zeigt hier die Fassung zum eingestellten Stichtag.
            </div>
          )}
          {sel && !norm && <div style={{ fontSize: 13 }}>Lade {sel} ...</div>}
          {sel && norm && norm.fehler && <div style={{ fontSize: 13, color: NG_AMBER }}>{norm.fehler}</div>}
          {sel && norm && !norm.fehler && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 17 }}>{norm.enbez}</span>
                {normIstEntwurf && <Tag tone="warning">ENTWURF</Tag>}
              </div>
              <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 8 }}>{(norm.titel || '').replace(/^\[ENTWURF EEG 2027\]\s*/, '')}</div>
              <div style={{ fontSize: 11.5, color: 'rgba(15,23,42,0.55)', marginBottom: 10 }}>
                {norm.jurabk} · Fassung ab {norm.fassung_von}{norm.fassung_bis ? ` (bis ${norm.fassung_bis})` : ' (geltend)'}
                {(() => { const k = zRef.current.nodes.find((n) => n.id === sel); return k && k.extern > 0 ? ` · verweist ${k.extern}x in andere Gesetze` : ''; })()}
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'rgba(15,23,42,0.8)' }}>
                {(norm.text || '').slice(0, 900)}{(norm.text || '').length > 900 ? ' ...' : ''}
              </div>
              <div style={{ marginTop: 12 }}>
                <Button variant="secondary" onClick={() => { zRef.current.sel = null; setSel(null); }}>Schliessen</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
