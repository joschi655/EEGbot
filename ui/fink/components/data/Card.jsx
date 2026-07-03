import React from 'react';

const CSS = `
.fink-card{
  background:var(--surface-card); border:1px solid var(--border-default);
  border-radius:var(--radius-lg); box-shadow:var(--shadow-sm);
  display:flex; flex-direction:column; overflow:hidden;
}
.fink-card--flat{ box-shadow:none; }
.fink-card--raised{ box-shadow:var(--shadow-md); }
.fink-card--interactive{ cursor:pointer; transition:box-shadow var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard); }
.fink-card--interactive:hover{ box-shadow:var(--shadow-md); border-color:var(--border-strong); }
.fink-card--interactive:active{ transform:translateY(0.5px); }
.fink-card--accent{ border-top:3px solid var(--klein-600); }
.fink-card__header{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:var(--space-5) var(--space-6); border-bottom:1px solid var(--border-subtle); }
.fink-card__title{ font:var(--font-h3); color:var(--text-primary); }
.fink-card__subtitle{ font:var(--font-caption); color:var(--text-muted); margin-top:2px; }
.fink-card__body{ padding:var(--space-6); display:flex; flex-direction:column; gap:var(--space-4); }
.fink-card__body--tight{ padding:var(--space-4) var(--space-5); }
.fink-card__footer{ padding:var(--space-4) var(--space-6); border-top:1px solid var(--border-subtle); background:var(--gray-25); display:flex; align-items:center; gap:10px; }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-card-css')) {
  const s = document.createElement('style'); s.id = 'fink-card-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Card({
  variant = 'default',
  title,
  subtitle,
  headerAction = null,
  footer = null,
  tight = false,
  noBody = false,
  className = '',
  children,
  ...rest
}) {
  const cls = [
    'fink-card',
    variant !== 'default' ? `fink-card--${variant}` : '',
    className,
  ].filter(Boolean).join(' ');
  const hasHeader = title || subtitle || headerAction;
  return (
    <div className={cls} {...rest}>
      {hasHeader && (
        <div className="fink-card__header">
          <div>
            {title && <div className="fink-card__title">{title}</div>}
            {subtitle && <div className="fink-card__subtitle">{subtitle}</div>}
          </div>
          {headerAction}
        </div>
      )}
      {noBody ? children : <div className={`fink-card__body ${tight ? 'fink-card__body--tight' : ''}`}>{children}</div>}
      {footer && <div className="fink-card__footer">{footer}</div>}
    </div>
  );
}
