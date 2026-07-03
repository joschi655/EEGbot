import React from 'react';

const CSS = `
.fink-avatar{
  display:inline-flex; align-items:center; justify-content:center; flex:0 0 auto;
  border-radius:var(--radius-full); background:var(--klein-100); color:var(--klein-700);
  font-family:var(--font-sans); font-weight:600; overflow:hidden; user-select:none;
  border:1px solid color-mix(in srgb, var(--klein-600) 12%, transparent);
}
.fink-avatar img{ width:100%; height:100%; object-fit:cover; }
.fink-avatar--xs{ width:24px; height:24px; font-size:10px; }
.fink-avatar--sm{ width:30px; height:30px; font-size:12px; }
.fink-avatar--md{ width:38px; height:38px; font-size:14px; }
.fink-avatar--lg{ width:48px; height:48px; font-size:17px; }
.fink-avatar--accent{ background:var(--klein-600); color:#fff; border-color:transparent; }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-avatar-css')) {
  const s = document.createElement('style'); s.id = 'fink-avatar-css'; s.textContent = CSS; document.head.appendChild(s);
}

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase();
}

export function Avatar({ name = '', src, size = 'md', accent = false, className = '', ...rest }) {
  const cls = ['fink-avatar', `fink-avatar--${size}`, accent ? 'fink-avatar--accent' : '', className].filter(Boolean).join(' ');
  return (
    <span className={cls} title={name || undefined} {...rest}>
      {src ? <img src={src} alt={name} /> : initials(name)}
    </span>
  );
}
