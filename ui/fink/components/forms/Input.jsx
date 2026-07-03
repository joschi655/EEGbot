import React from 'react';

const CSS = `
.fink-field{ display:flex; flex-direction:column; gap:6px; }
.fink-field__label{ font:var(--font-label); color:var(--text-primary); }
.fink-field__label .req{ color:var(--red-600); margin-left:2px; }
.fink-field__hint{ font:var(--font-caption); color:var(--text-muted); }
.fink-field__hint--error{ color:var(--red-600); }
.fink-input{
  display:flex; align-items:center; gap:8px;
  background:var(--surface-card); border:1px solid var(--border-default);
  border-radius:var(--radius-md); padding:0 12px; height:var(--control-h-md);
  transition:border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard);
}
.fink-input:focus-within{ border-color:var(--border-focus); box-shadow:var(--ring-accent); }
.fink-input--sm{ height:var(--control-h-sm); }
.fink-input--lg{ height:var(--control-h-lg); }
.fink-input--error{ border-color:var(--red-500); }
.fink-input--error:focus-within{ box-shadow:0 0 0 3px color-mix(in srgb, var(--red-500) 24%, transparent); }
.fink-input--disabled{ background:var(--gray-50); opacity:.7; cursor:not-allowed; }
.fink-input input{
  flex:1; min-width:0; border:none; outline:none; background:transparent;
  font:var(--font-body); color:var(--text-primary); padding:0;
}
.fink-input input::placeholder{ color:var(--text-disabled); }
.fink-input__icon{ display:inline-flex; color:var(--text-muted); }
.fink-input__icon svg{ width:18px; height:18px; stroke-width:1.9; }
.fink-input__suffix{ font:var(--font-data); font-size:12px; color:var(--text-muted); white-space:nowrap; }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-input-css')) {
  const s = document.createElement('style'); s.id = 'fink-input-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Input({
  label,
  hint,
  error,
  required = false,
  size = 'md',
  iconLeft = null,
  suffix = null,
  disabled = false,
  id,
  className = '',
  ...rest
}) {
  const fieldId = id || (label ? `fink-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const boxCls = [
    'fink-input',
    size !== 'md' ? `fink-input--${size}` : '',
    error ? 'fink-input--error' : '',
    disabled ? 'fink-input--disabled' : '',
  ].filter(Boolean).join(' ');
  return (
    <div className={`fink-field ${className}`}>
      {label && (
        <label className="fink-field__label" htmlFor={fieldId}>
          {label}{required && <span className="req">*</span>}
        </label>
      )}
      <div className={boxCls}>
        {iconLeft && <span className="fink-input__icon">{iconLeft}</span>}
        <input id={fieldId} disabled={disabled} aria-invalid={!!error} {...rest} />
        {suffix && <span className="fink-input__suffix">{suffix}</span>}
      </div>
      {(error || hint) && (
        <span className={`fink-field__hint ${error ? 'fink-field__hint--error' : ''}`}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
