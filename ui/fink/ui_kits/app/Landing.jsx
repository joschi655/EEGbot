/* EEGbot app — Landing: B2C-Hero für private Anlagenbetreiber.
   Text-Wordmark (kein --font-outline: Gilmer liegt nicht auf dem Server). */

function Landing({ onStart }) {
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  const feature = (icon, titel, text) => (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <span style={{ width: 40, height: 40, flex: '0 0 40px', display: 'grid', placeItems: 'center', borderRadius: 10, background: 'var(--klein-600)', color: '#fff' }}>
        <i data-lucide={icon} style={{ width: 20, height: 20 }}></i>
      </span>
      <span>
        <span style={{ display: 'block', font: 'var(--weight-bold) var(--text-md)/1.3 var(--font-sans)', color: 'var(--text-primary)' }}>{titel}</span>
        <span style={{ display: 'block', font: 'var(--font-body)', color: 'var(--text-muted)', marginTop: 2 }}>{text}</span>
      </span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '26px 48px' }}>
        <span style={{ font: 'var(--weight-bold) 30px/1 var(--font-sans)', letterSpacing: '-0.03em', color: 'var(--klein-600)' }}>
          EEG<span style={{ fontWeight: 400 }}>bot</span>
        </span>
        <nav style={{ display: 'flex', gap: 26, alignItems: 'center' }}>
          <a href="https://github.com/joschi655/EEGbot" target="_blank" rel="noreferrer" style={{ font: 'var(--font-body)', color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', gap: 6, alignItems: 'center' }}>
            <i data-lucide="github" style={{ width: 17, height: 17 }}></i> Open Source
          </a>
          <button onClick={onStart} style={{ font: 'var(--weight-bold) var(--text-sm)/1 var(--font-sans)', color: '#fff', background: 'var(--klein-600)', border: 'none', borderRadius: 'var(--radius-md)', padding: '11px 22px', cursor: 'pointer' }}>
            App starten
          </button>
        </nav>
      </header>

      <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '20px 48px 60px' }}>
        <div style={{ maxWidth: 1040, width: '100%' }}>
          <h1 style={{ font: 'var(--weight-bold) clamp(38px, 5vw, 58px)/1.08 var(--font-sans)', letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: 0, maxWidth: 780 }}>
            Ihr Recht als <span style={{ color: 'var(--klein-600)' }}>Anlagenbetreiber</span> — berechnet statt gegoogelt.
          </h1>
          <p style={{ font: 'var(--font-body-lg, var(--font-body))', color: 'var(--text-muted)', margin: '18px 0 0', maxWidth: 640, fontSize: 18, lineHeight: 1.55 }}>
            EEGbot kennt das EEG mit allen Fassungen, Fristen und Fallstricken. Jede Zahl kommt aus
            deterministischen Rechen-Engines mit Quellenangabe — keine KI-Schätzungen bei Geldbeträgen.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px 34px', margin: '44px 0 0' }}>
            {feature('shield-alert', 'Rückforderungs-Check', 'Netzbetreiber fordert zurück? Exposure, Verjährung und Heilung nach § 52 EEG nachrechnen — im BGH-Beispielfall werden aus 45.540 € geforderten nur 6.417 € berechtigte Euro.')}
            {feature('calendar-clock', 'Fristen im Blick', 'MaStR-Registrierung, Veräußerungsform, Volleinspeisungs-Meldung: Deadlines und Verstoßfolgen für Ihre konkrete Anlage.')}
            {feature('calculator', 'Vergütung & Ü20', 'Einspeisevergütung nach § 48 EEG, Mischvergütung, Förderende — und die Optionen, wenn die 20 Jahre vorbei sind.')}
            {feature('scale', 'Recht zum Nachlesen', 'Volltext-Recherche über Normen, Clearingstelle und Rechtsprechung; Norm-Graph mit Zeitreise bis zum EEG-2027-Entwurf.')}
          </div>

          <div style={{ display: 'flex', gap: 18, alignItems: 'center', margin: '46px 0 0', flexWrap: 'wrap' }}>
            <button onClick={onStart} style={{ font: 'var(--weight-bold) var(--text-md)/1 var(--font-sans)', color: '#fff', background: 'var(--klein-600)', border: 'none', borderRadius: 'var(--radius-md)', padding: '15px 30px', cursor: 'pointer' }}>
              App starten — ohne Anmeldung
            </button>
            <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', maxWidth: 420 }}>
              Open Source zum Selbst-Hosten (<code>bun ui/server.ts</code>) — oder gehostet nutzen: null Setup, immer aktueller Rechtsstand.
            </span>
          </div>
        </div>
      </main>

      <footer style={{ padding: '18px 48px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 20, alignItems: 'center' }}>
        <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
          Keine Rechtsberatung im Einzelfall (§ 2 RDG) — EEGbot rechnet, erklärt und verweist auf Quellen.
        </span>
        <a href="https://github.com/joschi655/EEGbot" target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', font: 'var(--font-caption)', color: 'var(--klein-600)', textDecoration: 'none' }}>
          github.com/joschi655/EEGbot
        </a>
      </footer>
    </div>
  );
}

Object.assign(window, { Landing });
