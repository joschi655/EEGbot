import React from 'react';

const CSS = `
.fink-tabs{ display:flex; gap:2px; border-bottom:1px solid var(--border-default); }
.fink-tabs--pill{ gap:4px; border-bottom:none; background:var(--surface-sunken); padding:3px; border-radius:var(--radius-md); display:inline-flex; }
.fink-tab{
  appearance:none; border:none; background:none; cursor:pointer;
  font:var(--font-label); color:var(--text-secondary); padding:10px 14px;
  display:inline-flex; align-items:center; gap:7px; position:relative;
  transition:color var(--dur-fast) var(--ease-standard);
}
.fink-tab:hover{ color:var(--text-primary); }
.fink-tab svg{ width:16px; height:16px; stroke-width:2; }
.fink-tab__count{ font:var(--font-data); font-size:11px; background:var(--gray-100); color:var(--text-muted); padding:1px 6px; border-radius:var(--radius-full); }
.fink-tabs:not(.fink-tabs--pill) .fink-tab::after{
  content:""; position:absolute; left:8px; right:8px; bottom:-1px; height:2px; border-radius:2px 2px 0 0;
  background:var(--klein-600); transform:scaleX(0); transition:transform var(--dur-base) var(--ease-entrance);
}
.fink-tab[aria-selected="true"]{ color:var(--klein-700); }
.fink-tabs:not(.fink-tabs--pill) .fink-tab[aria-selected="true"]::after{ transform:scaleX(1); }
.fink-tab[aria-selected="true"] .fink-tab__count{ background:var(--klein-100); color:var(--klein-700); }
.fink-tabs--pill .fink-tab{ padding:6px 14px; border-radius:var(--radius-sm); }
.fink-tabs--pill .fink-tab[aria-selected="true"]{ background:var(--surface-card); color:var(--text-primary); box-shadow:var(--shadow-xs); }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-tabs-css')) {
  const s = document.createElement('style'); s.id = 'fink-tabs-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Tabs({ items = [], value, defaultValue, onChange, variant = 'underline', className = '', ...rest }) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? (items[0] && items[0].value));
  const active = isControlled ? value : internal;
  const select = (v) => { if (!isControlled) setInternal(v); onChange && onChange(v); };
  return (
    <div className={`fink-tabs ${variant === 'pill' ? 'fink-tabs--pill' : ''} ${className}`} role="tablist" {...rest}>
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          aria-selected={active === it.value}
          className="fink-tab"
          onClick={() => select(it.value)}
        >
          {it.icon}
          {it.label}
          {it.count != null && <span className="fink-tab__count">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}
