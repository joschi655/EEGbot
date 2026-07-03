import React from 'react';

/* Inject component CSS once (uses design-system custom properties). */
const CSS = `
.fink-btn{
  --_bg: var(--klein-600); --_fg: var(--color-on-accent); --_bd: transparent; --_bgh: var(--klein-700); --_bga: var(--klein-800);
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  font-family:var(--font-sans); font-weight:600; line-height:1; white-space:nowrap;
  border:1px solid var(--_bd); background:var(--_bg); color:var(--_fg);
  border-radius:var(--radius-md); cursor:pointer; user-select:none;
  transition:background var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
}
.fink-btn:hover{ background:var(--_bgh); }
.fink-btn:active{ background:var(--_bga); transform:translateY(0.5px); }
.fink-btn:focus-visible{ outline:none; box-shadow:var(--ring-accent); }
.fink-btn[disabled]{ opacity:.5; cursor:not-allowed; transform:none; }
.fink-btn--sm{ height:var(--control-h-sm); padding:0 12px; font-size:var(--text-sm); }
.fink-btn--md{ height:var(--control-h-md); padding:0 16px; font-size:var(--text-base); }
.fink-btn--lg{ height:var(--control-h-lg); padding:0 22px; font-size:var(--text-md); }
.fink-btn--full{ width:100%; }
.fink-btn--secondary{ --_bg:var(--surface-card); --_fg:var(--text-primary); --_bd:var(--border-strong); --_bgh:var(--gray-50); --_bga:var(--gray-100); }
.fink-btn--ghost{ --_bg:transparent; --_fg:var(--text-secondary); --_bd:transparent; --_bgh:var(--gray-100); --_bga:var(--gray-200); }
.fink-btn--accentSoft{ --_bg:var(--color-accent-subtle); --_fg:var(--klein-700); --_bd:transparent; --_bgh:var(--klein-100); --_bga:var(--klein-200); }
.fink-btn--danger{ --_bg:var(--red-600); --_fg:#fff; --_bd:transparent; --_bgh:var(--red-700); --_bga:var(--red-700); }
.fink-btn svg{ width:1.05em; height:1.05em; stroke-width:2; flex:0 0 auto; }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-btn-css')) {
  const s = document.createElement('style'); s.id = 'fink-btn-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconLeft = null,
  iconRight = null,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const cls = [
    'fink-btn',
    `fink-btn--${size}`,
    variant !== 'primary' ? `fink-btn--${variant}` : '',
    fullWidth ? 'fink-btn--full' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button type={type} className={cls} {...rest}>
      {iconLeft}
      {children != null && <span>{children}</span>}
      {iconRight}
    </button>
  );
}
