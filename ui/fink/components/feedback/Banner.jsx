import React from 'react';

const CSS = `
.fink-banner{
  display:flex; align-items:flex-start; gap:12px;
  border:1px solid var(--border-default); border-radius:var(--radius-md);
  background:var(--surface-card); padding:var(--space-4) var(--space-5);
}
.fink-banner__icon{ flex:0 0 auto; display:inline-flex; margin-top:1px; }
.fink-banner__icon svg{ width:18px; height:18px; stroke-width:2; }
.fink-banner__body{ flex:1; min-width:0; display:flex; flex-direction:column; gap:3px; }
.fink-banner__title{ font:var(--weight-semibold) var(--text-base)/1.3 var(--font-sans); color:var(--text-primary); }
.fink-banner__text{ font:var(--font-body); color:var(--text-secondary); }
.fink-banner__actions{ display:flex; gap:8px; margin-top:8px; }
.fink-banner__close{ flex:0 0 auto; cursor:pointer; color:var(--text-muted); display:inline-flex; border-radius:var(--radius-xs); margin:-2px -4px 0 0; }
.fink-banner__close:hover{ color:var(--text-primary); }
.fink-banner__close svg{ width:16px; height:16px; stroke-width:2.2; }
.fink-banner--info{ background:var(--klein-50); border-color:var(--klein-100); }
.fink-banner--info .fink-banner__icon{ color:var(--klein-600); }
.fink-banner--compliant{ background:var(--status-compliant-bg); border-color:var(--status-compliant-bd); }
.fink-banner--compliant .fink-banner__icon{ color:var(--green-600); }
.fink-banner--pending{ background:var(--status-pending-bg); border-color:var(--status-pending-bd); }
.fink-banner--pending .fink-banner__icon{ color:var(--amber-600); }
.fink-banner--overdue{ background:var(--status-overdue-bg); border-color:var(--status-overdue-bd); }
.fink-banner--overdue .fink-banner__icon{ color:var(--red-600); }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-banner-css')) {
  const s = document.createElement('style'); s.id = 'fink-banner-css'; s.textContent = CSS; document.head.appendChild(s);
}

const DEFAULT_ICONS = {
  info: 'info', compliant: 'circle-check', pending: 'clock', overdue: 'triangle-alert', neutral: 'info',
};

export function Banner({ tone = 'info', title, icon, actions, onDismiss, className = '', children, ...rest }) {
  const iconName = DEFAULT_ICONS[tone] || 'info';
  return (
    <div className={`fink-banner fink-banner--${tone} ${className}`} role="status" {...rest}>
      <span className="fink-banner__icon">{icon || <i data-lucide={iconName} />}</span>
      <div className="fink-banner__body">
        {title && <div className="fink-banner__title">{title}</div>}
        {children && <div className="fink-banner__text">{children}</div>}
        {actions && <div className="fink-banner__actions">{actions}</div>}
      </div>
      {onDismiss && (
        <span className="fink-banner__close" role="button" aria-label="Schließen" onClick={onDismiss}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </span>
      )}
    </div>
  );
}
