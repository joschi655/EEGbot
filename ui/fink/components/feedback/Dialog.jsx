import React from 'react';

const CSS = `
.fink-dialog__backdrop{
  position:fixed; inset:0; z-index:100; background:var(--backdrop);
  backdrop-filter:blur(var(--blur-backdrop)); -webkit-backdrop-filter:blur(var(--blur-backdrop));
  display:flex; align-items:center; justify-content:center; padding:24px;
  animation:fink-fade var(--dur-base) var(--ease-standard);
}
.fink-dialog{
  background:var(--surface-card); border:1px solid var(--border-default);
  border-radius:var(--radius-xl); box-shadow:var(--shadow-xl);
  width:100%; max-width:var(--_w,480px); max-height:calc(100vh - 48px);
  display:flex; flex-direction:column; overflow:hidden;
  animation:fink-pop var(--dur-base) var(--ease-entrance);
}
@keyframes fink-fade{ from{opacity:0} to{opacity:1} }
@keyframes fink-pop{ from{opacity:0; transform:translateY(8px) scale(.985)} to{opacity:1; transform:none} }
.fink-dialog__header{ display:flex; align-items:flex-start; justify-content:space-between; gap:14px; padding:var(--space-6) var(--space-6) var(--space-4); }
.fink-dialog__heading{ display:flex; flex-direction:column; gap:3px; }
.fink-dialog__title{ font:var(--font-h3); color:var(--text-primary); }
.fink-dialog__desc{ font:var(--font-caption); color:var(--text-muted); }
.fink-dialog__close{ flex:0 0 auto; cursor:pointer; color:var(--text-muted); display:inline-flex; padding:4px; border-radius:var(--radius-sm); margin:-4px -4px 0 0; }
.fink-dialog__close:hover{ color:var(--text-primary); background:var(--gray-100); }
.fink-dialog__close svg{ width:18px; height:18px; stroke-width:2; }
.fink-dialog__body{ padding:0 var(--space-6) var(--space-6); font:var(--font-body); color:var(--text-secondary); overflow:auto; }
.fink-dialog__footer{ display:flex; align-items:center; justify-content:flex-end; gap:10px; padding:var(--space-4) var(--space-6); border-top:1px solid var(--border-subtle); background:var(--gray-25); }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-dialog-css')) {
  const s = document.createElement('style'); s.id = 'fink-dialog-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Dialog({ open, onClose, title, description, footer, width, className = '', children, ...rest }) {
  if (!open) return null;
  return (
    <div className="fink-dialog__backdrop" onClick={onClose}>
      <div
        className={`fink-dialog ${className}`}
        style={width ? { ['--_w']: typeof width === 'number' ? `${width}px` : width } : undefined}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        {...rest}
      >
        {(title || description) && (
          <div className="fink-dialog__header">
            <div className="fink-dialog__heading">
              {title && <div className="fink-dialog__title">{title}</div>}
              {description && <div className="fink-dialog__desc">{description}</div>}
            </div>
            {onClose && (
              <span className="fink-dialog__close" role="button" aria-label="Schließen" onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </span>
            )}
          </div>
        )}
        <div className="fink-dialog__body">{children}</div>
        {footer && <div className="fink-dialog__footer">{footer}</div>}
      </div>
    </div>
  );
}
