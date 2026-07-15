/* EEGbot app — shared chrome: wordmark, sidebar, topbar, AppShell.
   Liest NIE window.FINK_DATA (B2B-Mock im _ds_bundle) — Zustand kommt
   ausschließlich aus window.EEGBOT_PROFIL (localStorage). */

/* Text-Wordmark statt Gilmer-Outline-Logo: die lizenzierten Fonts sind
   gitignored und liegen NICHT auf dem Server — kein --font-outline hier. */
function EegbotMark({ size = 26, color = 'var(--klein-600)' }) {
  return (
    <span style={{ font: `var(--weight-bold) ${size}px/1 var(--font-sans)`, letterSpacing: '-0.03em', color }} aria-label="EEGbot">
      EEG<span style={{ fontWeight: 400 }}>bot</span>
    </span>
  );
}

const STATUS_LABEL = { compliant: 'Erledigt', pending: 'Offen', overdue: 'Überschritten', upcoming: 'Geplant', neutral: 'Entwurf' };
const STATUS_TONE = { compliant: 'compliant', pending: 'pending', overdue: 'overdue', upcoming: 'neutral', neutral: 'neutral' };

function NavItem({ label, count, active, onClick }) {
  return (
    <button className={`fk-nav ${active ? 'fk-nav--active' : ''}`} onClick={onClick}>
      <span className="fk-nav__label">{label}</span>
      {count != null && <span className="fk-nav__count">{count}</span>}
    </button>
  );
}

function Rechenweg({ inputs = {}, schritte = [], parameterstand, normen = [], quellen = [] }) {
  const quellenListe = Array.isArray(quellen) ? quellen : [];
  return (
    <details className="fk-calculation" data-testid="calculation-details">
      <summary>So wurde gerechnet</summary>
      <div className="fk-calculation__body">
        <div>
          <strong>Eingaben</strong>
          <dl>
            {Object.entries(inputs).map(([k, v]) => (
              <React.Fragment key={k}><dt>{k}</dt><dd>{Array.isArray(v) ? v.join(', ') : String(v ?? '—')}</dd></React.Fragment>
            ))}
          </dl>
        </div>
        {schritte.length > 0 && <div><strong>Rechenschritte</strong><ol>{schritte.map((s, i) => <li key={i}>{s}</li>)}</ol></div>}
        {parameterstand && <p><strong>Parameterstand:</strong> {parameterstand}</p>}
        {normen.length > 0 && <p><strong>Normfassung:</strong> {normen.join(' · ')}</p>}
        {quellenListe.length > 0 && (
          <div><strong>Fundstellen und Quellen</strong><ul>{quellenListe.map((q, i) => {
            const quelle = typeof q === 'string' ? { bezeichnung: q } : q;
            const label = [quelle.bezeichnung, quelle.fundstelle].filter(Boolean).join(' — ');
            return <li key={i}>{quelle.url ? <a href={quelle.url} target="_blank" rel="noreferrer">{label}</a> : label}</li>;
          })}</ul></div>
        )}
      </div>
    </details>
  );
}

function AppShell({ active, onNav, title, subtitle, actions, search = false, children }) {
  const { Avatar, IconButton } = window.FinkDesignSystem_4f2014;
  const profil = window.EEGBOT_PROFIL.lade();
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  return (
    <div className="fk-app">
      <aside className="fk-side">
        <div className="fk-side__brand">
          <EegbotMark size={30} />
        </div>
        <nav className="fk-side__nav">
          <NavItem label="Übersicht" active={active === 'dashboard'} onClick={() => onNav('dashboard')} />
          <NavItem label="Meine Anlage" active={active === 'anlage'} onClick={() => onNav('anlage')} />
          <NavItem label="Fristen" active={active === 'deadlines'} onClick={() => onNav('deadlines')} />
          <div className="fk-side__section">Prüfen &amp; Rechnen</div>
          <NavItem label="Rückforderungs-Check" active={active === 'sanktion52'} onClick={() => onNav('sanktion52')} />
          <NavItem label="Vergütung" active={active === 'verguetung'} onClick={() => onNav('verguetung')} />
          <NavItem label="Solarspitzen" active={active === 'solarspitzen'} onClick={() => onNav('solarspitzen')} />
          <NavItem label="Nach der Förderung" active={active === 'ue20'} onClick={() => onNav('ue20')} />
          <div className="fk-side__section">Recht</div>
          <NavItem label="Förder-Fahrplan" active={active === 'fahrplan'} onClick={() => onNav('fahrplan')} />
          <NavItem label="Recherche" active={active === 'recherche'} onClick={() => onNav('recherche')} />
          <NavItem label="Norm-Graph" active={active === 'normgraph'} onClick={() => onNav('normgraph')} />
        </nav>
        <div className="fk-side__foot">
          <Avatar name={profil?.name || 'Keine Anlage'} size="sm" accent />
          <div className="fk-side__user">
            <span className="fk-side__uname">{profil?.name || 'Keine Anlage erfasst'}</span>
            <span className="fk-side__urole">{profil ? `${Number(profil.leistung_kwp).toLocaleString('de-DE')} kWp · IBN ${profil.ibn_datum}` : 'Unter „Meine Anlage" anlegen'}</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <IconButton label="Meine Anlage" icon={<i data-lucide="settings"></i>} onClick={() => onNav('anlage')} />
          </div>
        </div>
      </aside>

      <div className="fk-main">
        <header className="fk-top">
          <div>
            <div className="fk-top__title">{title}</div>
            {subtitle && <div className="fk-top__sub">{subtitle}</div>}
          </div>
          <div className="fk-row" style={{ marginLeft: 'auto', gap: '20px' }}>
            {actions}
            <button className="fk-top__logout" onClick={() => onNav('logout')}>Startseite</button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { EegbotMark, NavItem, Rechenweg, AppShell, STATUS_LABEL, STATUS_TONE });
