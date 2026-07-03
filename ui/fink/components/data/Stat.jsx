import React from 'react';

const CSS = `
.fink-stat{ display:flex; flex-direction:column; gap:6px; }
.fink-stat__label{ font:var(--weight-medium) var(--text-2xs)/1 var(--font-sans); letter-spacing:.06em; text-transform:uppercase; color:var(--text-muted); }
.fink-stat__value{ font:var(--weight-bold) var(--text-3xl)/1 var(--font-sans); letter-spacing:-0.02em; color:var(--text-primary); font-variant-numeric:tabular-nums; display:flex; align-items:baseline; gap:6px; }
.fink-stat__unit{ font:var(--weight-medium) var(--text-base)/1 var(--font-sans); color:var(--text-muted); letter-spacing:0; }
.fink-stat__foot{ display:flex; align-items:center; flex-wrap:wrap; gap:4px 7px; font:var(--font-caption); color:var(--text-muted); }
.fink-stat__delta{ display:inline-flex; align-items:center; gap:3px; font-weight:600; }
.fink-stat__delta svg{ width:13px; height:13px; stroke-width:2.4; }
.fink-stat__delta--up{ color:var(--klein-600); }
.fink-stat__delta--down{ color:var(--gray-500); }
.fink-stat__delta--flat{ color:var(--text-muted); }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-stat-css')) {
  const s = document.createElement('style'); s.id = 'fink-stat-css'; s.textContent = CSS; document.head.appendChild(s);
}

const ARROWS = {
  up: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 17 17 7M9 7h8v8"/></svg>,
  down: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 7 17 17M17 9v8H9"/></svg>,
  flat: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14"/></svg>,
};

export function Stat({ label, value, unit, delta, trend = 'flat', foot, className = '', ...rest }) {
  return (
    <div className={`fink-stat ${className}`} {...rest}>
      {label && <span className="fink-stat__label">{label}</span>}
      <span className="fink-stat__value">{value}{unit && <span className="fink-stat__unit">{unit}</span>}</span>
      {(delta || foot) && (
        <span className="fink-stat__foot">
          {delta && <span className={`fink-stat__delta fink-stat__delta--${trend}`}>{ARROWS[trend]}{delta}</span>}
          {foot}
        </span>
      )}
    </div>
  );
}
