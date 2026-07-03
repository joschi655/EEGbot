import React from 'react';

const CSS = `
.fink-switch{ display:inline-flex; align-items:center; gap:10px; cursor:pointer; font:var(--font-body); color:var(--text-primary); }
.fink-switch[aria-disabled="true"]{ opacity:.5; cursor:not-allowed; }
.fink-switch__track{
  position:relative; flex:0 0 auto; width:38px; height:22px; border-radius:var(--radius-full);
  background:var(--gray-300); transition:background var(--dur-base) var(--ease-standard);
}
.fink-switch__thumb{
  position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:var(--radius-full);
  background:#fff; box-shadow:var(--shadow-sm); transition:transform var(--dur-base) var(--ease-entrance);
}
.fink-switch input{ position:absolute; opacity:0; width:0; height:0; }
.fink-switch input:checked + .fink-switch__track{ background:var(--klein-600); }
.fink-switch input:checked + .fink-switch__track .fink-switch__thumb{ transform:translateX(16px); }
.fink-switch input:focus-visible + .fink-switch__track{ box-shadow:var(--ring-accent); }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-switch-css')) {
  const s = document.createElement('style'); s.id = 'fink-switch-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Switch({ label, disabled = false, className = '', ...rest }) {
  return (
    <label className={`fink-switch ${className}`} aria-disabled={disabled || undefined}>
      <input type="checkbox" role="switch" disabled={disabled} {...rest} />
      <span className="fink-switch__track"><span className="fink-switch__thumb" /></span>
      {label && <span>{label}</span>}
    </label>
  );
}
