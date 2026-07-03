import React from 'react';

const CSS = `
.fink-select{ position:relative; display:flex; flex-direction:column; gap:6px; }
.fink-select__label{ font:var(--font-label); color:var(--text-primary); }
.fink-select__box{ position:relative; display:flex; align-items:center; }
.fink-select select{
  appearance:none; -webkit-appearance:none; width:100%;
  height:var(--control-h-md); padding:0 36px 0 12px;
  background:var(--surface-card); border:1px solid var(--border-default);
  border-radius:var(--radius-md); font:var(--font-body); color:var(--text-primary);
  cursor:pointer; outline:none;
  transition:border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard);
}
.fink-select select:focus-visible{ border-color:var(--border-focus); box-shadow:var(--ring-accent); }
.fink-select select:disabled{ background:var(--gray-50); opacity:.7; cursor:not-allowed; }
.fink-select--sm select{ height:var(--control-h-sm); font-size:var(--text-sm); }
.fink-select__chev{ position:absolute; right:11px; pointer-events:none; color:var(--text-muted); display:inline-flex; }
.fink-select__chev svg{ width:16px; height:16px; stroke-width:2; }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-select-css')) {
  const s = document.createElement('style'); s.id = 'fink-select-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Select({
  label,
  options = [],
  size = 'md',
  placeholder,
  id,
  className = '',
  children,
  ...rest
}) {
  const fieldId = id || (label ? `fink-sel-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div className={`fink-select ${size !== 'md' ? `fink-select--${size}` : ''} ${className}`}>
      {label && <label className="fink-select__label" htmlFor={fieldId}>{label}</label>}
      <div className="fink-select__box">
        <select id={fieldId} {...rest}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {children ||
            options.map((o) => {
              const opt = typeof o === 'string' ? { value: o, label: o } : o;
              return <option key={opt.value} value={opt.value}>{opt.label}</option>;
            })}
        </select>
        <span className="fink-select__chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m6 9 6 6 6-6"/></svg></span>
      </div>
    </div>
  );
}
