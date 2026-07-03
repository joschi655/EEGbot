import React from 'react';

const CSS = `
.fink-tip{ position:relative; display:inline-flex; }
.fink-tip__pop{
  position:absolute; z-index:50; pointer-events:none; white-space:nowrap;
  background:var(--gray-900); color:#fff; font:var(--font-caption);
  padding:5px 9px; border-radius:var(--radius-sm); box-shadow:var(--shadow-md);
  opacity:0; transform:translateY(2px); transition:opacity var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard);
}
.fink-tip:hover .fink-tip__pop, .fink-tip:focus-within .fink-tip__pop{ opacity:1; transform:translateY(0); }
.fink-tip__pop::after{ content:""; position:absolute; width:7px; height:7px; background:var(--gray-900); transform:rotate(45deg); }
.fink-tip--top .fink-tip__pop{ bottom:calc(100% + 7px); left:50%; translate:-50% 0; }
.fink-tip--top .fink-tip__pop::after{ bottom:-3px; left:50%; margin-left:-3px; }
.fink-tip--bottom .fink-tip__pop{ top:calc(100% + 7px); left:50%; translate:-50% 0; }
.fink-tip--bottom .fink-tip__pop::after{ top:-3px; left:50%; margin-left:-3px; }
.fink-tip--right .fink-tip__pop{ left:calc(100% + 7px); top:50%; translate:0 -50%; }
.fink-tip--right .fink-tip__pop::after{ left:-3px; top:50%; margin-top:-3px; }
.fink-tip--left .fink-tip__pop{ right:calc(100% + 7px); top:50%; translate:0 -50%; }
.fink-tip--left .fink-tip__pop::after{ right:-3px; top:50%; margin-top:-3px; }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-tip-css')) {
  const s = document.createElement('style'); s.id = 'fink-tip-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Tooltip({ label, side = 'top', className = '', children, ...rest }) {
  return (
    <span className={`fink-tip fink-tip--${side} ${className}`} {...rest}>
      {children}
      <span className="fink-tip__pop" role="tooltip">{label}</span>
    </span>
  );
}
