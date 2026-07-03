import React from 'react';

const CSS = `
.fink-iconbtn{
  --_bg:transparent; --_fg:var(--text-secondary); --_bgh:var(--gray-100); --_bga:var(--gray-200); --_bd:transparent;
  display:inline-flex; align-items:center; justify-content:center;
  background:var(--_bg); color:var(--_fg); border:1px solid var(--_bd);
  border-radius:var(--radius-md); cursor:pointer; padding:0;
  transition:background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard);
}
.fink-iconbtn:hover{ background:var(--_bgh); color:var(--text-primary); }
.fink-iconbtn:active{ background:var(--_bga); }
.fink-iconbtn:focus-visible{ outline:none; box-shadow:var(--ring-accent); }
.fink-iconbtn[disabled]{ opacity:.45; cursor:not-allowed; }
.fink-iconbtn--sm{ width:30px; height:30px; }
.fink-iconbtn--md{ width:38px; height:38px; }
.fink-iconbtn--lg{ width:46px; height:46px; }
.fink-iconbtn--solid{ --_bg:var(--klein-600); --_fg:#fff; --_bgh:var(--klein-700); --_bga:var(--klein-800); }
.fink-iconbtn--outline{ --_bd:var(--border-strong); --_bgh:var(--gray-50); }
.fink-iconbtn svg{ width:1.05em; height:1.05em; stroke-width:2; }
.fink-iconbtn--sm svg{ font-size:16px; } .fink-iconbtn--md svg{ font-size:18px; } .fink-iconbtn--lg svg{ font-size:20px; }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-iconbtn-css')) {
  const s = document.createElement('style'); s.id = 'fink-iconbtn-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  icon = null,
  label,
  className = '',
  children,
  ...rest
}) {
  const cls = [
    'fink-iconbtn',
    `fink-iconbtn--${size}`,
    variant !== 'ghost' ? `fink-iconbtn--${variant}` : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} aria-label={label} title={label} {...rest}>
      {icon || children}
    </button>
  );
}
