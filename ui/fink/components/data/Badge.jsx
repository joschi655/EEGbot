import React from 'react';

const CSS = `
.fink-badge{
  display:inline-flex; align-items:center; gap:6px; white-space:nowrap;
  font:var(--weight-medium) var(--text-xs)/1 var(--font-sans); letter-spacing:.01em;
  padding:4px 9px; border-radius:var(--radius-full); border:1px solid transparent;
}
.fink-badge--lg{ font-size:var(--text-sm); padding:5px 11px; }
.fink-badge__dot{ width:6px; height:6px; border-radius:var(--radius-full); background:currentColor; flex:0 0 auto; }
.fink-badge svg{ width:13px; height:13px; stroke-width:2.2; }
.fink-badge--compliant{ background:var(--status-compliant-bg); color:var(--status-compliant-fg); border-color:var(--status-compliant-bd); }
.fink-badge--pending{ background:var(--status-pending-bg); color:var(--status-pending-fg); border-color:var(--status-pending-bd); }
.fink-badge--overdue{ background:var(--status-overdue-bg); color:var(--status-overdue-fg); border-color:var(--status-overdue-bd); }
.fink-badge--neutral{ background:var(--status-neutral-bg); color:var(--status-neutral-fg); border-color:var(--status-neutral-bd); }
.fink-badge--info{ background:var(--klein-50); color:var(--klein-700); border-color:var(--klein-100); }
.fink-badge--solid{ background:var(--klein-600); color:#fff; border-color:transparent; }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-badge-css')) {
  const s = document.createElement('style'); s.id = 'fink-badge-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Badge({ tone = 'neutral', size = 'sm', dot = false, icon = null, className = '', children, ...rest }) {
  const cls = ['fink-badge', `fink-badge--${tone}`, size === 'lg' ? 'fink-badge--lg' : '', className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {dot && <span className="fink-badge__dot" />}
      {icon}
      {children}
    </span>
  );
}
