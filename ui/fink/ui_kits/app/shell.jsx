/* fink app — shared chrome: logo, sidebar, topbar, AppShell */

/* The fink logo is the lowercase OUTLINE wordmark (Gilmer Outline) —
   used consistently, including in small UI chrome, so the letterforms
   (dotless i, etc.) match the hero lockup. */
function FinkMark({ size = 26, color = 'var(--klein-600)' }) {
  return (
    <span style={{ fontFamily: 'var(--font-outline)', fontSize: size, letterSpacing: '-0.01em', lineHeight: 1, color }} aria-label="fink">fink</span>
  );
}

const TECH_ICON = { pv: 'sun', wind: 'wind', bio: 'leaf' };
const STATUS_LABEL = { compliant: 'Konform', pending: 'Frist offen', overdue: 'Überfällig', upcoming: 'Geplant', neutral: 'Entwurf' };
const STATUS_TONE = { compliant: 'compliant', pending: 'pending', overdue: 'overdue', upcoming: 'neutral', neutral: 'neutral' };

function NavItem({ icon, label, count, active, onClick }) {
  return (
    <button className={`fk-nav ${active ? 'fk-nav--active' : ''}`} onClick={onClick}>
      <span className="fk-nav__label">{label}</span>
      {count != null && <span className="fk-nav__count">{count}</span>}
    </button>
  );
}

function AppShell({ active, onNav, title, subtitle, actions, search = true, children }) {
  const { Avatar, IconButton, Button } = window.FinkDesignSystem_4f2014;
  const D = window.FINK_DATA;
  const overdue = D.deadlines.filter((d) => d.status === 'overdue').length;
  const open = D.deadlines.filter((d) => d.status === 'overdue' || d.status === 'pending').length;
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  return (
    <div className="fk-app">
      <aside className="fk-side">
        <div className="fk-side__brand">
          <span className="fk-side__logo">fink</span>
        </div>
        <nav className="fk-side__nav">
          <NavItem icon="layout-dashboard" label="Übersicht" active={active === 'dashboard'} onClick={() => onNav('dashboard')} />
          <NavItem icon="panels-top-left" label="Anlagen" count={D.assets.length} active={active === 'assets' || active === 'asset'} onClick={() => onNav('assets')} />
          <NavItem icon="calendar-clock" label="Fristen" count={open} active={active === 'deadlines'} onClick={() => onNav('deadlines')} />
          <NavItem icon="file-text" label="Berichte" active={active === 'reports'} onClick={() => onNav('reports')} />
          <div className="fk-side__section">Recht</div>
          <NavItem icon="route" label="Förder-Fahrplan" active={active === 'fahrplan'} onClick={() => onNav('fahrplan')} />
          <NavItem icon="waypoints" label="Norm-Graph" active={active === 'normgraph'} onClick={() => onNav('normgraph')} />
          <NavItem icon="scale" label="EEG-Bibliothek" onClick={() => onNav('reports')} />
          <NavItem icon="sparkles" label="fink Assistent" active={active === 'reports'} onClick={() => onNav('reports')} />
        </nav>
        <div className="fk-side__cta">
          <Button fullWidth iconLeft={<i data-lucide="sparkles"></i>} onClick={() => onNav('reports')}>fink fragen</Button>
        </div>
        <div className="fk-side__foot">
          <Avatar name={D.user.name} size="sm" accent />
          <div className="fk-side__user">
            <span className="fk-side__uname">{D.user.name}</span>
            <span className="fk-side__urole">{D.user.org}</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <IconButton label="Einstellungen" icon={<i data-lucide="settings"></i>} />
          </div>
        </div>
      </aside>

      <div className="fk-main">
        <header className="fk-top">
          <div>
            <div className="fk-top__title">{title}</div>
            {subtitle && <div className="fk-top__sub">{subtitle}</div>}
          </div>
          {search && (
            <div className="fk-top__search">
              <i data-lucide="search"></i>
              <input placeholder="Anlage, MaStR-Nr. oder § suchen…" />
            </div>
          )}
          <div className="fk-row" style={{ marginLeft: search ? 0 : 'auto', gap: '20px' }}>
            {actions}
            <button className="fk-top__logout" onClick={() => onNav('logout')}>Abmelden</button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { FinkMark, NavItem, AppShell, TECH_ICON, STATUS_LABEL, STATUS_TONE });
