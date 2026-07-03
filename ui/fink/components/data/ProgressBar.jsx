import React from 'react';

const CSS = `
.fink-progress{ display:flex; flex-direction:column; gap:6px; }
.fink-progress__top{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; }
.fink-progress__label{ font:var(--font-label); color:var(--text-primary); }
.fink-progress__val{ font:var(--font-data); font-size:12px; color:var(--text-secondary); }
.fink-progress__track{ height:8px; border-radius:var(--radius-full); background:var(--gray-200); overflow:hidden; }
.fink-progress__track--lg{ height:12px; }
.fink-progress__fill{ height:100%; border-radius:var(--radius-full); background:var(--klein-600); transition:width var(--dur-slow) var(--ease-entrance); }
.fink-progress__fill--compliant{ background:var(--klein-600); }
.fink-progress__fill--pending{ background:var(--gray-400); }
.fink-progress__fill--overdue{ background:var(--red-600); }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-progress-css')) {
  const s = document.createElement('style'); s.id = 'fink-progress-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function ProgressBar({ value = 0, max = 100, label, showValue = true, tone = 'accent', size = 'md', valueFormat, className = '', ...rest }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const toneCls = tone !== 'accent' ? `fink-progress__fill--${tone}` : '';
  const display = valueFormat ? valueFormat(value, max) : `${Math.round(pct)}%`;
  return (
    <div className={`fink-progress ${className}`} {...rest}>
      {(label || showValue) && (
        <div className="fink-progress__top">
          {label && <span className="fink-progress__label">{label}</span>}
          {showValue && <span className="fink-progress__val">{display}</span>}
        </div>
      )}
      <div className={`fink-progress__track ${size === 'lg' ? 'fink-progress__track--lg' : ''}`} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
        <div className={`fink-progress__fill ${toneCls}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
