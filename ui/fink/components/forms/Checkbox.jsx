import React from 'react';

const CSS = `
.fink-check{ display:inline-flex; align-items:flex-start; gap:10px; cursor:pointer; font:var(--font-body); color:var(--text-primary); }
.fink-check[aria-disabled="true"]{ opacity:.5; cursor:not-allowed; }
.fink-check__box{
  flex:0 0 auto; width:18px; height:18px; margin-top:1px;
  border:1.5px solid var(--border-strong); border-radius:var(--radius-xs);
  background:var(--surface-card); display:inline-flex; align-items:center; justify-content:center;
  transition:background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
}
.fink-check:hover .fink-check__box{ border-color:var(--klein-400); }
.fink-check__box svg{ width:13px; height:13px; color:#fff; stroke-width:3; opacity:0; transform:scale(.6); transition:opacity var(--dur-fast), transform var(--dur-fast) var(--ease-entrance); }
.fink-check input{ position:absolute; opacity:0; width:0; height:0; }
.fink-check input:checked + .fink-check__box{ background:var(--klein-600); border-color:var(--klein-600); }
.fink-check input:checked + .fink-check__box svg{ opacity:1; transform:scale(1); }
.fink-check input:indeterminate + .fink-check__box{ background:var(--klein-600); border-color:var(--klein-600); }
.fink-check input:focus-visible + .fink-check__box{ box-shadow:var(--ring-accent); }
.fink-check__text{ display:flex; flex-direction:column; gap:2px; line-height:var(--leading-snug); }
.fink-check__desc{ font:var(--font-caption); color:var(--text-muted); }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-check-css')) {
  const s = document.createElement('style'); s.id = 'fink-check-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Checkbox({ label, description, disabled = false, className = '', ...rest }) {
  return (
    <label className={`fink-check ${className}`} aria-disabled={disabled || undefined}>
      <input type="checkbox" disabled={disabled} {...rest} />
      <span className="fink-check__box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6 9 17l-5-5"/></svg>
      </span>
      {(label || description) && (
        <span className="fink-check__text">
          {label && <span>{label}</span>}
          {description && <span className="fink-check__desc">{description}</span>}
        </span>
      )}
    </label>
  );
}
