/* fink app — Dashboard (portfolio overview) — calm, minimal */

function Dashboard({ onNav, onOpenAsset }) {
  const D = window.FINK_DATA;
  const { Button, Badge } = window.FinkDesignSystem_4f2014;
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  const needAction = D.assets.filter((a) => a.status === 'overdue' || a.status === 'pending');

  return (
    <AppShell active="dashboard" onNav={onNav} title="Übersicht" subtitle="Klima Energie GmbH · 48 Anlagen">
      <div className="fk-screen">
        <div className="fk-screen__inner fk-screen__inner--calm">

          {/* overdue callout — white on blue, stands out without red */}
          <div className="fk-alert">
            <div className="fk-alert__txt">
              <span className="fk-alert__title">2 Fristen überfällig</span>
              <span className="fk-alert__sub">Windpark Nordsee II benötigt eine MaStR-Aktualisierung (§ 71 EEG) und einen Direktvermarktungs-Nachweis.</span>
            </div>
            <button className="fk-alert__action" onClick={() => onNav('deadlines')}>Fristen ansehen</button>
          </div>

          {/* quiet KPI strip — flat, no cards */}
          <div className="fk-kpis">
            <div className="fk-kpi"><span className="fk-kpi__v">{D.kpis.conformity}<i>%</i></span><span className="fk-kpi__l">Konformität</span></div>
            <div className="fk-kpi"><span className="fk-kpi__v">{D.kpis.openDeadlines}</span><span className="fk-kpi__l">Offene Fristen</span></div>
            <div className="fk-kpi"><span className="fk-kpi__v">{D.kpis.assets}</span><span className="fk-kpi__l">Anlagen</span></div>
            <div className="fk-kpi"><span className="fk-kpi__v">{D.kpis.capacity}<i>MW</i></span><span className="fk-kpi__l">Leistung</span></div>
          </div>

          {/* one focused list — only what needs attention */}
          <section className="fk-block">
            <div className="fk-block__head">
              <h2>Handlungsbedarf</h2>
              <Button size="sm" variant="ghost" iconRight={<i data-lucide="arrow-right"></i>} onClick={() => onNav('deadlines')}>Alle Fristen</Button>
            </div>
            <div className="fk-list">
              {needAction.map((a) => (
                <button className="fk-listrow" key={a.id} onClick={() => onOpenAsset(a)}>
                  <span className="fk-asset__ic"><i data-lucide={window.TECH_ICON[a.tech]}></i></span>
                  <span className="fk-listrow__main">
                    <span className="fk-asset__name">{a.name}</span>
                    <span className="fk-listrow__next">{a.next}</span>
                  </span>
                  <Badge tone={window.STATUS_TONE[a.status]}>{window.STATUS_LABEL[a.status]}</Badge>
                </button>
              ))}
            </div>
          </section>

        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { Dashboard });
