/* fink app — Fristen (deadlines) */

function parseDay(due) {
  const [y, m, d] = due.split('-');
  const MON = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];
  return { day: d, mon: MON[parseInt(m, 10) - 1] };
}

function DeadlineRow({ d, onOpen }) {
  const { Badge, Tag } = window.FinkDesignSystem_4f2014;
  const pd = parseDay(d.due);
  const isOverdue = d.status === 'overdue';
  const whenColor = isOverdue ? '#fff' : d.days <= 7 ? 'var(--klein-600)' : 'var(--text-muted)';
  const whenText = d.days < 0 ? `${Math.abs(d.days)} Tage überfällig` : d.days === 0 ? 'heute fällig' : `in ${d.days} Tagen`;
  return (
    <div className={`fk-dl ${isOverdue ? 'fk-dl--overdue' : ''}`} onClick={onOpen}>
      <div className="fk-dl__date"><span className="fk-dl__day">{pd.day}</span><span className="fk-dl__mon">{pd.mon}</span></div>
      <div className="fk-dl__sep"></div>
      <div className="fk-dl__body">
        <div className="fk-dl__task">{d.task}</div>
        <div className="fk-dl__meta">{d.asset} <Tag>{d.ref}</Tag></div>
      </div>
      <span className="fk-dl__when" style={{ color: whenColor }}>{whenText}</span>
      <Badge tone={window.STATUS_TONE[d.status]}>{window.STATUS_LABEL[d.status]}</Badge>
    </div>
  );
}

function Deadlines({ onNav }) {
  const D = window.FINK_DATA;
  const { Button } = window.FinkDesignSystem_4f2014;
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  const overdue = D.deadlines.filter((d) => d.status === 'overdue');
  const soon = D.deadlines.filter((d) => d.status === 'pending');
  const later = D.deadlines.filter((d) => d.status === 'upcoming');

  const Group = ({ title, color, items }) => items.length === 0 ? null : (
    <div className="fk-dl-group">
      <div className="fk-dl-group__h"><span className="dot" style={{ background: color }}></span>{title} · {items.length}</div>
      {items.map((d) => <DeadlineRow key={d.id} d={d} onOpen={() => onNav('assets')} />)}
    </div>
  );

  return (
    <AppShell active="deadlines" onNav={onNav} title="Fristen" subtitle="Alle Meldepflichten nach Fälligkeit"
      actions={<Button variant="secondary" iconLeft={<i data-lucide="calendar"></i>}>Kalender</Button>}>
      <div className="fk-screen">
        <div className="fk-screen__inner" style={{ maxWidth: '860px' }}>
          <Group title="Überfällig" color="var(--klein-600)" items={overdue} />
          <Group title="Diese Woche" color="var(--klein-500)" items={soon} />
          <Group title="Demnächst" color="var(--gray-300)" items={later} />
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { Deadlines });
