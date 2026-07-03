// templates/fink-app/ds-base.js — load the fink design system for this template
(() => {
  const base = '../..';
  for (const p of ['styles.css']) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base + '/' + p;
    document.head.appendChild(l);
  }
  const s = document.createElement('script');
  s.src = base + '/_ds_bundle.js';
  s.onerror = () => console.error('ds-base.js: failed to load ' + s.src +
    ' — in a consuming project point the base line at the bound _ds/<folder> tree relative to this page; in this source project it means the bundle is not compiled yet');
  document.head.appendChild(s);
})();
