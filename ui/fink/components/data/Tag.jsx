import React from 'react';

const CSS = `
.fink-tag{
  display:inline-flex; align-items:center; gap:6px; white-space:nowrap;
  font:var(--font-data); font-size:12px; color:var(--text-secondary);
  background:var(--gray-100); border:1px solid var(--border-default);
  padding:3px 8px; border-radius:var(--radius-sm);
}
.fink-tag--accent{ background:var(--klein-50); color:var(--klein-700); border-color:var(--klein-100); }
.fink-tag__remove{ display:inline-flex; cursor:pointer; color:var(--text-muted); margin:-1px -3px -1px 1px; border-radius:var(--radius-xs); }
.fink-tag__remove:hover{ color:var(--text-primary); background:var(--gray-200); }
.fink-tag__remove svg{ width:13px; height:13px; stroke-width:2.4; }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-tag-css')) {
  const s = document.createElement('style'); s.id = 'fink-tag-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Tag({ accent = false, onRemove, className = '', children, ...rest }) {
  return (
    <span className={`fink-tag ${accent ? 'fink-tag--accent' : ''} ${className}`} {...rest}>
      {children}
      {onRemove && (
        <span className="fink-tag__remove" role="button" aria-label="Entfernen" onClick={onRemove}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </span>
      )}
    </span>
  );
}
