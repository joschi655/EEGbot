/* fink app — Anlagen (assets list) */

function Assets({ onNav, onOpenAsset }) {
  const D = window.FINK_DATA;
  const { Card, Tabs, Button, Tag, IconButton } = window.FinkDesignSystem_4f2014;
  const [filter, setFilter] = React.useState('all');
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  const counts = {
    all: D.assets.length,
    open: D.assets.filter((a) => a.status === 'pending' || a.status === 'overdue').length,
    compliant: D.assets.filter((a) => a.status === 'compliant').length,
  };
  const rows = D.assets.filter((a) =>
    filter === 'all' ? true : filter === 'compliant' ? a.status === 'compliant' : (a.status === 'pending' || a.status === 'overdue'));

  return (
    <AppShell active="assets" onNav={onNav} title="Anlagen" subtitle={`${D.assets.length} Anlagen · 186,4 MW`}>
      <div className="fk-screen">
        <div className="fk-screen__inner">
          <div className="fk-spread">
            <Tabs value={filter} onChange={setFilter} items={[
              { value: 'all', label: 'Alle', count: counts.all },
              { value: 'open', label: 'Handlungsbedarf', count: counts.open },
              { value: 'compliant', label: 'Konform', count: counts.compliant },
            ]} />
            <div className="fk-row">
              <Tag accent>Technologie: alle</Tag>
              <IconButton variant="outline" label="Filter" icon={<i data-lucide="sliders-horizontal"></i>} />
              <IconButton variant="outline" label="Export" icon={<i data-lucide="download"></i>} />
            </div>
          </div>

          <div className="fk-add">
            <Button iconLeft={<i data-lucide="plus"></i>}>Anlage hinzufügen</Button>
          </div>

          <Card noBody>
            <table className="fk-table">
              <thead><tr><th>Anlage</th><th>Leistung</th><th>Pflichten</th><th>Status</th><th>Nächste Frist</th></tr></thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} onClick={() => onOpenAsset(a)}>
                    <td>
                      <div className="fk-asset">
                        <span className="fk-asset__ic"><i data-lucide={window.TECH_ICON[a.tech]}></i></span>
                        <div>
                          <div className="fk-asset__name">{a.name}</div>
                          <div className="fk-asset__id">{a.id} · {a.region}</div>
                        </div>
                      </div>
                    </td>
                    <td className="fk-cap">{a.power}</td>
                    <td className="fk-cap">{a.open === 0 ? <span className="fk-muted">—</span> : a.open}</td>
                    <td>{(() => { const { Badge } = window.FinkDesignSystem_4f2014; return <Badge tone={window.STATUS_TONE[a.status]}>{window.STATUS_LABEL[a.status]}</Badge>; })()}</td>
                    <td className="fk-muted" style={{ fontSize: '13px' }}>{a.next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { Assets });
