/* @ds-bundle: {"format":3,"namespace":"FinkDesignSystem_4f2014","components":[{"name":"Avatar","sourcePath":"components/data/Avatar.jsx"},{"name":"Badge","sourcePath":"components/data/Badge.jsx"},{"name":"Card","sourcePath":"components/data/Card.jsx"},{"name":"ProgressBar","sourcePath":"components/data/ProgressBar.jsx"},{"name":"Stat","sourcePath":"components/data/Stat.jsx"},{"name":"Tag","sourcePath":"components/data/Tag.jsx"},{"name":"Banner","sourcePath":"components/feedback/Banner.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"IconButton","sourcePath":"components/forms/IconButton.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/data/Avatar.jsx":"b8414df5c3ae","components/data/Badge.jsx":"a4d1da6b0eaf","components/data/Card.jsx":"2347de84bb5f","components/data/ProgressBar.jsx":"778303784955","components/data/Stat.jsx":"14d7deea0dd1","components/data/Tag.jsx":"c0a23759401f","components/feedback/Banner.jsx":"0e2afa4989b5","components/feedback/Dialog.jsx":"969f91ccab80","components/feedback/Tooltip.jsx":"5f2f885a4aa1","components/forms/Button.jsx":"e7b315dde8ae","components/forms/Checkbox.jsx":"e0d541e6dd08","components/forms/IconButton.jsx":"6c08ed6c874b","components/forms/Input.jsx":"303a9478dbb9","components/forms/Select.jsx":"87d8a501c015","components/forms/Switch.jsx":"c1827f9e7473","components/navigation/Tabs.jsx":"c082fae6b46f","ui_kits/app/App.jsx":"4258b8704b41","ui_kits/app/AssetDetail.jsx":"0133c9f1aa71","ui_kits/app/Assets.jsx":"cf17f696a613","ui_kits/app/Dashboard.jsx":"51677019fa24","ui_kits/app/Deadlines.jsx":"6e425d60acfc","ui_kits/app/Landing.jsx":"05dc7272160b","ui_kits/app/Login.jsx":"cf426c6a5298","ui_kits/app/Reports.jsx":"656b74cfa35e","ui_kits/app/data.js":"0962fd2b514f","ui_kits/app/shell.jsx":"b7aca03d1a7b"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FinkDesignSystem_4f2014 = window.FinkDesignSystem_4f2014 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/data/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'fink-avatar-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
}
function Avatar({
  name = '',
  src,
  size = 'md',
  accent = false,
  className = '',
  ...rest
}) {
  const cls = ['fink-avatar', `fink-avatar--${size}`, accent ? 'fink-avatar--accent' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    title: name || undefined
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.fink-badge{
  display:inline-flex; align-items:center; gap:6px; white-space:nowrap;
  font:var(--weight-medium) var(--text-xs)/1 var(--font-sans); letter-spacing:.01em;
  padding:4px 9px; border-radius:var(--radius-full); border:1px solid transparent;
}
.fink-badge--lg{ font-size:var(--text-sm); padding:5px 11px; }
.fink-badge__dot{ width:6px; height:6px; border-radius:var(--radius-full); background:currentColor; flex:0 0 auto; }
.fink-badge svg{ width:13px; height:13px; stroke-width:2.2; }
.fink-badge--compliant{ background:var(--status-compliant-bg); color:var(--status-compliant-fg); border-color:var(--status-compliant-bd); }
.fink-badge--pending{ background:var(--status-pending-bg); color:var(--status-pending-fg); border-color:var(--status-pending-bd); }
.fink-badge--overdue{ background:var(--status-overdue-bg); color:var(--status-overdue-fg); border-color:var(--status-overdue-bd); }
.fink-badge--neutral{ background:var(--status-neutral-bg); color:var(--status-neutral-fg); border-color:var(--status-neutral-bd); }
.fink-badge--info{ background:var(--klein-50); color:var(--klein-700); border-color:var(--klein-100); }
.fink-badge--solid{ background:var(--klein-600); color:#fff; border-color:transparent; }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-badge-css')) {
  const s = document.createElement('style');
  s.id = 'fink-badge-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Badge({
  tone = 'neutral',
  size = 'sm',
  dot = false,
  icon = null,
  className = '',
  children,
  ...rest
}) {
  const cls = ['fink-badge', `fink-badge--${tone}`, size === 'lg' ? 'fink-badge--lg' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "fink-badge__dot"
  }), icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.fink-card{
  background:var(--surface-card); border:1px solid var(--border-default);
  border-radius:var(--radius-lg); box-shadow:var(--shadow-sm);
  display:flex; flex-direction:column; overflow:hidden;
}
.fink-card--flat{ box-shadow:none; }
.fink-card--raised{ box-shadow:var(--shadow-md); }
.fink-card--interactive{ cursor:pointer; transition:box-shadow var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard); }
.fink-card--interactive:hover{ box-shadow:var(--shadow-md); border-color:var(--border-strong); }
.fink-card--interactive:active{ transform:translateY(0.5px); }
.fink-card--accent{ border-top:3px solid var(--klein-600); }
.fink-card__header{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:var(--space-5) var(--space-6); border-bottom:1px solid var(--border-subtle); }
.fink-card__title{ font:var(--font-h3); color:var(--text-primary); }
.fink-card__subtitle{ font:var(--font-caption); color:var(--text-muted); margin-top:2px; }
.fink-card__body{ padding:var(--space-6); display:flex; flex-direction:column; gap:var(--space-4); }
.fink-card__body--tight{ padding:var(--space-4) var(--space-5); }
.fink-card__footer{ padding:var(--space-4) var(--space-6); border-top:1px solid var(--border-subtle); background:var(--gray-25); display:flex; align-items:center; gap:10px; }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-card-css')) {
  const s = document.createElement('style');
  s.id = 'fink-card-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Card({
  variant = 'default',
  title,
  subtitle,
  headerAction = null,
  footer = null,
  tight = false,
  noBody = false,
  className = '',
  children,
  ...rest
}) {
  const cls = ['fink-card', variant !== 'default' ? `fink-card--${variant}` : '', className].filter(Boolean).join(' ');
  const hasHeader = title || subtitle || headerAction;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), hasHeader && /*#__PURE__*/React.createElement("div", {
    className: "fink-card__header"
  }, /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("div", {
    className: "fink-card__title"
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    className: "fink-card__subtitle"
  }, subtitle)), headerAction), noBody ? children : /*#__PURE__*/React.createElement("div", {
    className: `fink-card__body ${tight ? 'fink-card__body--tight' : ''}`
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "fink-card__footer"
  }, footer));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Card.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'fink-progress-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = true,
  tone = 'accent',
  size = 'md',
  valueFormat,
  className = '',
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const toneCls = tone !== 'accent' ? `fink-progress__fill--${tone}` : '';
  const display = valueFormat ? valueFormat(value, max) : `${Math.round(pct)}%`;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `fink-progress ${className}`
  }, rest), (label || showValue) && /*#__PURE__*/React.createElement("div", {
    className: "fink-progress__top"
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "fink-progress__label"
  }, label), showValue && /*#__PURE__*/React.createElement("span", {
    className: "fink-progress__val"
  }, display)), /*#__PURE__*/React.createElement("div", {
    className: `fink-progress__track ${size === 'lg' ? 'fink-progress__track--lg' : ''}`,
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemax": max
  }, /*#__PURE__*/React.createElement("div", {
    className: `fink-progress__fill ${toneCls}`,
    style: {
      width: `${pct}%`
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'fink-stat-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
const ARROWS = {
  up: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 17 17 7M9 7h8v8"
  })),
  down: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 7 17 17M17 9v8H9"
  })),
  flat: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  }))
};
function Stat({
  label,
  value,
  unit,
  delta,
  trend = 'flat',
  foot,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `fink-stat ${className}`
  }, rest), label && /*#__PURE__*/React.createElement("span", {
    className: "fink-stat__label"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "fink-stat__value"
  }, value, unit && /*#__PURE__*/React.createElement("span", {
    className: "fink-stat__unit"
  }, unit)), (delta || foot) && /*#__PURE__*/React.createElement("span", {
    className: "fink-stat__foot"
  }, delta && /*#__PURE__*/React.createElement("span", {
    className: `fink-stat__delta fink-stat__delta--${trend}`
  }, ARROWS[trend], delta), foot));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Stat.jsx", error: String((e && e.message) || e) }); }

// components/data/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.fink-tag{
  display:inline-flex; align-items:center; gap:6px; white-space:nowrap;
  font:var(--font-data); font-size:12px; color:var(--text-secondary);
  background:var(--gray-100); border:1px solid var(--border-default);
  padding:3px 8px; border-radius:var(--radius-sm);
}
.fink-tag--accent{ background:var(--klein-50); color:var(--klein-700); border-color:var(--klein-100); }
.fink-tag__remove{ display:inline-flex; cursor:pointer; color:var(--text-muted); margin:-1px -3px -1px 1px; border-radius:var(--radius-xs); }
.fink-tag__remove:hover{ color:var(--text-primary); background:var(--gray-200); }
.fink-tag__remove svg{ width:13px; height:13px; stroke-width:2.4; }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-tag-css')) {
  const s = document.createElement('style');
  s.id = 'fink-tag-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Tag({
  accent = false,
  onRemove,
  className = '',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `fink-tag ${accent ? 'fink-tag--accent' : ''} ${className}`
  }, rest), children, onRemove && /*#__PURE__*/React.createElement("span", {
    className: "fink-tag__remove",
    role: "button",
    "aria-label": "Entfernen",
    onClick: onRemove
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Banner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.fink-banner{
  display:flex; align-items:flex-start; gap:12px;
  border:1px solid var(--border-default); border-radius:var(--radius-md);
  background:var(--surface-card); padding:var(--space-4) var(--space-5);
}
.fink-banner__icon{ flex:0 0 auto; display:inline-flex; margin-top:1px; }
.fink-banner__icon svg{ width:18px; height:18px; stroke-width:2; }
.fink-banner__body{ flex:1; min-width:0; display:flex; flex-direction:column; gap:3px; }
.fink-banner__title{ font:var(--weight-semibold) var(--text-base)/1.3 var(--font-sans); color:var(--text-primary); }
.fink-banner__text{ font:var(--font-body); color:var(--text-secondary); }
.fink-banner__actions{ display:flex; gap:8px; margin-top:8px; }
.fink-banner__close{ flex:0 0 auto; cursor:pointer; color:var(--text-muted); display:inline-flex; border-radius:var(--radius-xs); margin:-2px -4px 0 0; }
.fink-banner__close:hover{ color:var(--text-primary); }
.fink-banner__close svg{ width:16px; height:16px; stroke-width:2.2; }
.fink-banner--info{ background:var(--klein-50); border-color:var(--klein-100); }
.fink-banner--info .fink-banner__icon{ color:var(--klein-600); }
.fink-banner--compliant{ background:var(--status-compliant-bg); border-color:var(--status-compliant-bd); }
.fink-banner--compliant .fink-banner__icon{ color:var(--green-600); }
.fink-banner--pending{ background:var(--status-pending-bg); border-color:var(--status-pending-bd); }
.fink-banner--pending .fink-banner__icon{ color:var(--amber-600); }
.fink-banner--overdue{ background:var(--status-overdue-bg); border-color:var(--status-overdue-bd); }
.fink-banner--overdue .fink-banner__icon{ color:var(--red-600); }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-banner-css')) {
  const s = document.createElement('style');
  s.id = 'fink-banner-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
const DEFAULT_ICONS = {
  info: 'info',
  compliant: 'circle-check',
  pending: 'clock',
  overdue: 'triangle-alert',
  neutral: 'info'
};
function Banner({
  tone = 'info',
  title,
  icon,
  actions,
  onDismiss,
  className = '',
  children,
  ...rest
}) {
  const iconName = DEFAULT_ICONS[tone] || 'info';
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `fink-banner fink-banner--${tone} ${className}`,
    role: "status"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "fink-banner__icon"
  }, icon || /*#__PURE__*/React.createElement("i", {
    "data-lucide": iconName
  })), /*#__PURE__*/React.createElement("div", {
    className: "fink-banner__body"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "fink-banner__title"
  }, title), children && /*#__PURE__*/React.createElement("div", {
    className: "fink-banner__text"
  }, children), actions && /*#__PURE__*/React.createElement("div", {
    className: "fink-banner__actions"
  }, actions)), onDismiss && /*#__PURE__*/React.createElement("span", {
    className: "fink-banner__close",
    role: "button",
    "aria-label": "Schlie\xDFen",
    onClick: onDismiss
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Banner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.fink-dialog__backdrop{
  position:fixed; inset:0; z-index:100; background:var(--backdrop);
  backdrop-filter:blur(var(--blur-backdrop)); -webkit-backdrop-filter:blur(var(--blur-backdrop));
  display:flex; align-items:center; justify-content:center; padding:24px;
  animation:fink-fade var(--dur-base) var(--ease-standard);
}
.fink-dialog{
  background:var(--surface-card); border:1px solid var(--border-default);
  border-radius:var(--radius-xl); box-shadow:var(--shadow-xl);
  width:100%; max-width:var(--_w,480px); max-height:calc(100vh - 48px);
  display:flex; flex-direction:column; overflow:hidden;
  animation:fink-pop var(--dur-base) var(--ease-entrance);
}
@keyframes fink-fade{ from{opacity:0} to{opacity:1} }
@keyframes fink-pop{ from{opacity:0; transform:translateY(8px) scale(.985)} to{opacity:1; transform:none} }
.fink-dialog__header{ display:flex; align-items:flex-start; justify-content:space-between; gap:14px; padding:var(--space-6) var(--space-6) var(--space-4); }
.fink-dialog__heading{ display:flex; flex-direction:column; gap:3px; }
.fink-dialog__title{ font:var(--font-h3); color:var(--text-primary); }
.fink-dialog__desc{ font:var(--font-caption); color:var(--text-muted); }
.fink-dialog__close{ flex:0 0 auto; cursor:pointer; color:var(--text-muted); display:inline-flex; padding:4px; border-radius:var(--radius-sm); margin:-4px -4px 0 0; }
.fink-dialog__close:hover{ color:var(--text-primary); background:var(--gray-100); }
.fink-dialog__close svg{ width:18px; height:18px; stroke-width:2; }
.fink-dialog__body{ padding:0 var(--space-6) var(--space-6); font:var(--font-body); color:var(--text-secondary); overflow:auto; }
.fink-dialog__footer{ display:flex; align-items:center; justify-content:flex-end; gap:10px; padding:var(--space-4) var(--space-6); border-top:1px solid var(--border-subtle); background:var(--gray-25); }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-dialog-css')) {
  const s = document.createElement('style');
  s.id = 'fink-dialog-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  width,
  className = '',
  children,
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "fink-dialog__backdrop",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", _extends({
    className: `fink-dialog ${className}`,
    style: width ? {
      ['--_w']: typeof width === 'number' ? `${width}px` : width
    } : undefined,
    role: "dialog",
    "aria-modal": "true",
    onClick: e => e.stopPropagation()
  }, rest), (title || description) && /*#__PURE__*/React.createElement("div", {
    className: "fink-dialog__header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fink-dialog__heading"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "fink-dialog__title"
  }, title), description && /*#__PURE__*/React.createElement("div", {
    className: "fink-dialog__desc"
  }, description)), onClose && /*#__PURE__*/React.createElement("span", {
    className: "fink-dialog__close",
    role: "button",
    "aria-label": "Schlie\xDFen",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "fink-dialog__body"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "fink-dialog__footer"
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'fink-tip-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Tooltip({
  label,
  side = 'top',
  className = '',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `fink-tip fink-tip--${side} ${className}`
  }, rest), children, /*#__PURE__*/React.createElement("span", {
    className: "fink-tip__pop",
    role: "tooltip"
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'fink-btn-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Button({
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
  const cls = ['fink-btn', `fink-btn--${size}`, variant !== 'primary' ? `fink-btn--${variant}` : '', fullWidth ? 'fink-btn--full' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls
  }, rest), iconLeft, children != null && /*#__PURE__*/React.createElement("span", null, children), iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.fink-check{ display:inline-flex; align-items:flex-start; gap:10px; cursor:pointer; font:var(--font-body); color:var(--text-primary); }
.fink-check[aria-disabled="true"]{ opacity:.5; cursor:not-allowed; }
.fink-check__box{
  flex:0 0 auto; width:18px; height:18px; margin-top:1px;
  border:1.5px solid var(--border-strong); border-radius:var(--radius-xs);
  background:var(--surface-card); display:inline-flex; align-items:center; justify-content:center;
  transition:background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
}
.fink-check:hover .fink-check__box{ border-color:var(--klein-400); }
.fink-check__box svg{ width:13px; height:13px; color:#fff; stroke-width:3; opacity:0; transform:scale(.6); transition:opacity var(--dur-fast), transform var(--dur-fast) var(--ease-entrance); }
.fink-check input{ position:absolute; opacity:0; width:0; height:0; }
.fink-check input:checked + .fink-check__box{ background:var(--klein-600); border-color:var(--klein-600); }
.fink-check input:checked + .fink-check__box svg{ opacity:1; transform:scale(1); }
.fink-check input:indeterminate + .fink-check__box{ background:var(--klein-600); border-color:var(--klein-600); }
.fink-check input:focus-visible + .fink-check__box{ box-shadow:var(--ring-accent); }
.fink-check__text{ display:flex; flex-direction:column; gap:2px; line-height:var(--leading-snug); }
.fink-check__desc{ font:var(--font-caption); color:var(--text-muted); }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-check-css')) {
  const s = document.createElement('style');
  s.id = 'fink-check-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Checkbox({
  label,
  description,
  disabled = false,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: `fink-check ${className}`,
    "aria-disabled": disabled || undefined
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "fink-check__box"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }))), (label || description) && /*#__PURE__*/React.createElement("span", {
    className: "fink-check__text"
  }, label && /*#__PURE__*/React.createElement("span", null, label), description && /*#__PURE__*/React.createElement("span", {
    className: "fink-check__desc"
  }, description)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'fink-iconbtn-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function IconButton({
  variant = 'ghost',
  size = 'md',
  icon = null,
  label,
  className = '',
  children,
  ...rest
}) {
  const cls = ['fink-iconbtn', `fink-iconbtn--${size}`, variant !== 'ghost' ? `fink-iconbtn--${variant}` : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls,
    "aria-label": label,
    title: label
  }, rest), icon || children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'fink-input-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Input({
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
  const boxCls = ['fink-input', size !== 'md' ? `fink-input--${size}` : '', error ? 'fink-input--error' : '', disabled ? 'fink-input--disabled' : ''].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", {
    className: `fink-field ${className}`
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "fink-field__label",
    htmlFor: fieldId
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: boxCls
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    className: "fink-input__icon"
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    disabled: disabled,
    "aria-invalid": !!error
  }, rest)), suffix && /*#__PURE__*/React.createElement("span", {
    className: "fink-input__suffix"
  }, suffix)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    className: `fink-field__hint ${error ? 'fink-field__hint--error' : ''}`
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'fink-select-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Select({
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
  return /*#__PURE__*/React.createElement("div", {
    className: `fink-select ${size !== 'md' ? `fink-select--${size}` : ''} ${className}`
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "fink-select__label",
    htmlFor: fieldId
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "fink-select__box"
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), children || options.map(o => {
    const opt = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement("span", {
    className: "fink-select__chev"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  })))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'fink-switch-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Switch({
  label,
  disabled = false,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: `fink-switch ${className}`,
    "aria-disabled": disabled || undefined
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch",
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "fink-switch__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fink-switch__thumb"
  })), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.fink-tabs{ display:flex; gap:2px; border-bottom:1px solid var(--border-default); }
.fink-tabs--pill{ gap:4px; border-bottom:none; background:var(--surface-sunken); padding:3px; border-radius:var(--radius-md); display:inline-flex; }
.fink-tab{
  appearance:none; border:none; background:none; cursor:pointer;
  font:var(--font-label); color:var(--text-secondary); padding:10px 14px;
  display:inline-flex; align-items:center; gap:7px; position:relative;
  transition:color var(--dur-fast) var(--ease-standard);
}
.fink-tab:hover{ color:var(--text-primary); }
.fink-tab svg{ width:16px; height:16px; stroke-width:2; }
.fink-tab__count{ font:var(--font-data); font-size:11px; background:var(--gray-100); color:var(--text-muted); padding:1px 6px; border-radius:var(--radius-full); }
.fink-tabs:not(.fink-tabs--pill) .fink-tab::after{
  content:""; position:absolute; left:8px; right:8px; bottom:-1px; height:2px; border-radius:2px 2px 0 0;
  background:var(--klein-600); transform:scaleX(0); transition:transform var(--dur-base) var(--ease-entrance);
}
.fink-tab[aria-selected="true"]{ color:var(--klein-700); }
.fink-tabs:not(.fink-tabs--pill) .fink-tab[aria-selected="true"]::after{ transform:scaleX(1); }
.fink-tab[aria-selected="true"] .fink-tab__count{ background:var(--klein-100); color:var(--klein-700); }
.fink-tabs--pill .fink-tab{ padding:6px 14px; border-radius:var(--radius-sm); }
.fink-tabs--pill .fink-tab[aria-selected="true"]{ background:var(--surface-card); color:var(--text-primary); box-shadow:var(--shadow-xs); }
`;
if (typeof document !== 'undefined' && !document.getElementById('fink-tabs-css')) {
  const s = document.createElement('style');
  s.id = 'fink-tabs-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Tabs({
  items = [],
  value,
  defaultValue,
  onChange,
  variant = 'underline',
  className = '',
  ...rest
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? (items[0] && items[0].value));
  const active = isControlled ? value : internal;
  const select = v => {
    if (!isControlled) setInternal(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `fink-tabs ${variant === 'pill' ? 'fink-tabs--pill' : ''} ${className}`,
    role: "tablist"
  }, rest), items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.value,
    role: "tab",
    "aria-selected": active === it.value,
    className: "fink-tab",
    onClick: () => select(it.value)
  }, it.icon, it.label, it.count != null && /*#__PURE__*/React.createElement("span", {
    className: "fink-tab__count"
  }, it.count))));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/App.jsx
try { (() => {
/* fink app — root flow: landing → login → app */

function App() {
  const [stage, setStage] = React.useState('landing'); // 'landing' | 'login' | 'app'
  const [screen, setScreen] = React.useState('dashboard');
  const [asset, setAsset] = React.useState(null);
  const openAsset = a => {
    setAsset(a);
    setScreen('asset');
  };
  const nav = s => {
    if (s === 'logout') {
      setStage('landing');
      return;
    }
    setScreen(s);
  };
  if (stage === 'landing') return /*#__PURE__*/React.createElement(Landing, {
    onLogin: () => setStage('login')
  });
  if (stage === 'login') return /*#__PURE__*/React.createElement(Login, {
    onSignIn: () => {
      setStage('app');
      setScreen('dashboard');
    },
    onBack: () => setStage('landing')
  });
  switch (screen) {
    case 'assets':
      return /*#__PURE__*/React.createElement(Assets, {
        onNav: nav,
        onOpenAsset: openAsset
      });
    case 'asset':
      return /*#__PURE__*/React.createElement(AssetDetail, {
        asset: asset,
        onNav: nav,
        onBack: () => setScreen('assets'),
        onDraft: () => setScreen('reports')
      });
    case 'deadlines':
      return /*#__PURE__*/React.createElement(Deadlines, {
        onNav: nav
      });
    case 'reports':
      return /*#__PURE__*/React.createElement(Reports, {
        onNav: nav
      });
    case 'dashboard':
    default:
      return /*#__PURE__*/React.createElement(Dashboard, {
        onNav: nav,
        onOpenAsset: openAsset
      });
  }
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
setTimeout(() => window.lucide && lucide.createIcons(), 40);
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AssetDetail.jsx
try { (() => {
/* fink app — Anlagen-Detail (single asset) */

function ObligationItem({
  o,
  onDraft
}) {
  const {
    Badge,
    Button,
    Tag
  } = window.FinkDesignSystem_4f2014;
  return /*#__PURE__*/React.createElement("div", {
    className: "fk-obl"
  }, /*#__PURE__*/React.createElement("span", {
    className: `fk-obl__check ${o.done ? 'is-done' : ''}`
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": o.done ? 'check' : 'clock'
  })), /*#__PURE__*/React.createElement("div", {
    className: "fk-obl__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-row",
    style: {
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-obl__title"
  }, o.title), /*#__PURE__*/React.createElement(Tag, null, o.ref)), /*#__PURE__*/React.createElement("div", {
    className: "fk-obl__detail"
  }, o.detail)), /*#__PURE__*/React.createElement("div", {
    className: "fk-obl__action"
  }, o.done ? /*#__PURE__*/React.createElement(Badge, {
    tone: "compliant",
    dot: true
  }, "Erf\xFCllt") : /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "accentSoft",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "sparkles"
    }),
    onClick: onDraft
  }, "Entwurf pr\xFCfen")));
}
function Fact({
  k,
  v
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "fk-fact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-fact__k"
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "fk-fact__v"
  }, v));
}
function AssetDetail({
  asset,
  onNav,
  onBack,
  onDraft
}) {
  const a = asset || window.FINK_DATA.assets[0];
  const D = window.FINK_DATA;
  const {
    Card,
    Badge,
    Button,
    ProgressBar,
    IconButton
  } = window.FinkDesignSystem_4f2014;
  React.useEffect(() => {
    setTimeout(() => window.lucide && lucide.createIcons(), 10);
  });
  const doneCount = D.obligations.filter(o => o.done).length;
  return /*#__PURE__*/React.createElement(AppShell, {
    active: "asset",
    onNav: onNav,
    title: "Anlagen-Detail",
    subtitle: a.name,
    actions: /*#__PURE__*/React.createElement(Button, {
      iconLeft: /*#__PURE__*/React.createElement("i", {
        "data-lucide": "file-text"
      }),
      onClick: () => onNav('reports')
    }, "Bericht erstellen")
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-screen__inner"
  }, /*#__PURE__*/React.createElement("button", {
    className: "fk-back",
    onClick: onBack
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "arrow-left"
  }), " Zur\xFCck zu Anlagen"), /*#__PURE__*/React.createElement("div", {
    className: "fk-detail-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-row",
    style: {
      gap: '14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-detail-ic"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": window.TECH_ICON[a.tech]
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, a.name), /*#__PURE__*/React.createElement("div", {
    className: "fk-muted",
    style: {
      fontSize: '13px',
      marginTop: '2px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "fink-mono"
  }, a.id), " \xB7 ", a.power, " \xB7 ", a.region))), /*#__PURE__*/React.createElement(Badge, {
    tone: window.STATUS_TONE[a.status],
    size: "lg",
    dot: true
  }, window.STATUS_LABEL[a.status])), /*#__PURE__*/React.createElement("div", {
    className: "fk-grid fk-grid--2"
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Meldepflichten",
    subtitle: `${doneCount} von ${D.obligations.length} erfüllt · von fink geprüft`,
    headerAction: /*#__PURE__*/React.createElement(ProgressBar, {
      value: doneCount,
      max: D.obligations.length,
      showValue: false,
      tone: "compliant",
      style: {
        width: '120px'
      }
    })
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-obls"
  }, D.obligations.map((o, i) => /*#__PURE__*/React.createElement(ObligationItem, {
    key: i,
    o: o,
    onDraft: onDraft
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Stammdaten"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-facts"
  }, /*#__PURE__*/React.createElement(Fact, {
    k: "MaStR-Nummer",
    v: /*#__PURE__*/React.createElement("span", {
      className: "fink-mono"
    }, a.id)
  }), /*#__PURE__*/React.createElement(Fact, {
    k: "Technologie",
    v: a.tech === 'pv' ? 'Photovoltaik' : a.tech === 'wind' ? 'Windkraft' : 'Biogas'
  }), /*#__PURE__*/React.createElement(Fact, {
    k: "Leistung",
    v: a.power
  }), /*#__PURE__*/React.createElement(Fact, {
    k: "Standort",
    v: a.region
  }), /*#__PURE__*/React.createElement(Fact, {
    k: "Inbetriebnahme",
    v: "14.03.2022"
  }), /*#__PURE__*/React.createElement(Fact, {
    k: "Verg\xFCtungsart",
    v: "Direktvermarktung"
  }))), /*#__PURE__*/React.createElement(Card, {
    title: "Dokumente",
    headerAction: /*#__PURE__*/React.createElement(IconButton, {
      label: "Hochladen",
      icon: /*#__PURE__*/React.createElement("i", {
        "data-lucide": "upload"
      })
    })
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-docs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-doc"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "file-text"
  }), /*#__PURE__*/React.createElement("span", null, "Quartalsmeldung_Q1_2026.pdf"), /*#__PURE__*/React.createElement("span", {
    className: "fk-muted"
  }, "2,1 MB")), /*#__PURE__*/React.createElement("div", {
    className: "fk-doc"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "file-text"
  }), /*#__PURE__*/React.createElement("span", null, "EEG-Umlage_Nachweis_2025.pdf"), /*#__PURE__*/React.createElement("span", {
    className: "fk-muted"
  }, "880 KB")), /*#__PURE__*/React.createElement("div", {
    className: "fk-doc"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "file-spreadsheet"
  }), /*#__PURE__*/React.createElement("span", null, "Einspeisemengen_2025.xlsx"), /*#__PURE__*/React.createElement("span", {
    className: "fk-muted"
  }, "340 KB")))))))));
}
Object.assign(window, {
  AssetDetail
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AssetDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Assets.jsx
try { (() => {
/* fink app — Anlagen (assets list) */

function Assets({
  onNav,
  onOpenAsset
}) {
  const D = window.FINK_DATA;
  const {
    Card,
    Tabs,
    Button,
    Tag,
    IconButton
  } = window.FinkDesignSystem_4f2014;
  const [filter, setFilter] = React.useState('all');
  React.useEffect(() => {
    setTimeout(() => window.lucide && lucide.createIcons(), 10);
  });
  const counts = {
    all: D.assets.length,
    open: D.assets.filter(a => a.status === 'pending' || a.status === 'overdue').length,
    compliant: D.assets.filter(a => a.status === 'compliant').length
  };
  const rows = D.assets.filter(a => filter === 'all' ? true : filter === 'compliant' ? a.status === 'compliant' : a.status === 'pending' || a.status === 'overdue');
  return /*#__PURE__*/React.createElement(AppShell, {
    active: "assets",
    onNav: onNav,
    title: "Anlagen",
    subtitle: `${D.assets.length} Anlagen · 186,4 MW`
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-screen__inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-spread"
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: filter,
    onChange: setFilter,
    items: [{
      value: 'all',
      label: 'Alle',
      count: counts.all
    }, {
      value: 'open',
      label: 'Handlungsbedarf',
      count: counts.open
    }, {
      value: 'compliant',
      label: 'Konform',
      count: counts.compliant
    }]
  }), /*#__PURE__*/React.createElement("div", {
    className: "fk-row"
  }, /*#__PURE__*/React.createElement(Tag, {
    accent: true
  }, "Technologie: alle"), /*#__PURE__*/React.createElement(IconButton, {
    variant: "outline",
    label: "Filter",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "sliders-horizontal"
    })
  }), /*#__PURE__*/React.createElement(IconButton, {
    variant: "outline",
    label: "Export",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "download"
    })
  }))), /*#__PURE__*/React.createElement("div", {
    className: "fk-add"
  }, /*#__PURE__*/React.createElement(Button, {
    iconLeft: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "plus"
    })
  }, "Anlage hinzuf\xFCgen")), /*#__PURE__*/React.createElement(Card, {
    noBody: true
  }, /*#__PURE__*/React.createElement("table", {
    className: "fk-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Anlage"), /*#__PURE__*/React.createElement("th", null, "Leistung"), /*#__PURE__*/React.createElement("th", null, "Pflichten"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "N\xE4chste Frist"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(a => /*#__PURE__*/React.createElement("tr", {
    key: a.id,
    onClick: () => onOpenAsset(a)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "fk-asset"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-asset__ic"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": window.TECH_ICON[a.tech]
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "fk-asset__name"
  }, a.name), /*#__PURE__*/React.createElement("div", {
    className: "fk-asset__id"
  }, a.id, " \xB7 ", a.region)))), /*#__PURE__*/React.createElement("td", {
    className: "fk-cap"
  }, a.power), /*#__PURE__*/React.createElement("td", {
    className: "fk-cap"
  }, a.open === 0 ? /*#__PURE__*/React.createElement("span", {
    className: "fk-muted"
  }, "\u2014") : a.open), /*#__PURE__*/React.createElement("td", null, (() => {
    const {
      Badge
    } = window.FinkDesignSystem_4f2014;
    return /*#__PURE__*/React.createElement(Badge, {
      tone: window.STATUS_TONE[a.status],
      dot: true
    }, window.STATUS_LABEL[a.status]);
  })()), /*#__PURE__*/React.createElement("td", {
    className: "fk-muted",
    style: {
      fontSize: '13px'
    }
  }, a.next)))))))));
}
Object.assign(window, {
  Assets
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Assets.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Dashboard.jsx
try { (() => {
/* fink app — Dashboard (portfolio overview) — calm, minimal */

function Dashboard({
  onNav,
  onOpenAsset
}) {
  const D = window.FINK_DATA;
  const {
    Button,
    Badge
  } = window.FinkDesignSystem_4f2014;
  React.useEffect(() => {
    setTimeout(() => window.lucide && lucide.createIcons(), 10);
  });
  const needAction = D.assets.filter(a => a.status === 'overdue' || a.status === 'pending');
  return /*#__PURE__*/React.createElement(AppShell, {
    active: "dashboard",
    onNav: onNav,
    title: "\xDCbersicht",
    subtitle: "Klima Energie GmbH \xB7 48 Anlagen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-screen__inner fk-screen__inner--calm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-alert"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-alert__txt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-alert__title"
  }, "2 Fristen \xFCberf\xE4llig"), /*#__PURE__*/React.createElement("span", {
    className: "fk-alert__sub"
  }, "Windpark Nordsee II ben\xF6tigt eine MaStR-Aktualisierung (\xA7 71 EEG) und einen Direktvermarktungs-Nachweis.")), /*#__PURE__*/React.createElement("button", {
    className: "fk-alert__action",
    onClick: () => onNav('deadlines')
  }, "Fristen ansehen")), /*#__PURE__*/React.createElement("div", {
    className: "fk-kpis"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-kpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-kpi__v"
  }, D.kpis.conformity, /*#__PURE__*/React.createElement("i", null, "%")), /*#__PURE__*/React.createElement("span", {
    className: "fk-kpi__l"
  }, "Konformit\xE4t")), /*#__PURE__*/React.createElement("div", {
    className: "fk-kpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-kpi__v"
  }, D.kpis.openDeadlines), /*#__PURE__*/React.createElement("span", {
    className: "fk-kpi__l"
  }, "Offene Fristen")), /*#__PURE__*/React.createElement("div", {
    className: "fk-kpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-kpi__v"
  }, D.kpis.assets), /*#__PURE__*/React.createElement("span", {
    className: "fk-kpi__l"
  }, "Anlagen")), /*#__PURE__*/React.createElement("div", {
    className: "fk-kpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-kpi__v"
  }, D.kpis.capacity, /*#__PURE__*/React.createElement("i", null, "MW")), /*#__PURE__*/React.createElement("span", {
    className: "fk-kpi__l"
  }, "Leistung"))), /*#__PURE__*/React.createElement("section", {
    className: "fk-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-block__head"
  }, /*#__PURE__*/React.createElement("h2", null, "Handlungsbedarf"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    iconRight: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "arrow-right"
    }),
    onClick: () => onNav('deadlines')
  }, "Alle Fristen")), /*#__PURE__*/React.createElement("div", {
    className: "fk-list"
  }, needAction.map(a => /*#__PURE__*/React.createElement("button", {
    className: "fk-listrow",
    key: a.id,
    onClick: () => onOpenAsset(a)
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-asset__ic"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": window.TECH_ICON[a.tech]
  })), /*#__PURE__*/React.createElement("span", {
    className: "fk-listrow__main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-asset__name"
  }, a.name), /*#__PURE__*/React.createElement("span", {
    className: "fk-listrow__next"
  }, a.next)), /*#__PURE__*/React.createElement(Badge, {
    tone: window.STATUS_TONE[a.status],
    dot: true
  }, window.STATUS_LABEL[a.status]))))))));
}
Object.assign(window, {
  Dashboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Deadlines.jsx
try { (() => {
/* fink app — Fristen (deadlines) */

function parseDay(due) {
  const [y, m, d] = due.split('-');
  const MON = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];
  return {
    day: d,
    mon: MON[parseInt(m, 10) - 1]
  };
}
function DeadlineRow({
  d,
  onOpen
}) {
  const {
    Badge,
    Tag
  } = window.FinkDesignSystem_4f2014;
  const pd = parseDay(d.due);
  const isOverdue = d.status === 'overdue';
  const whenColor = isOverdue ? '#fff' : d.days <= 7 ? 'var(--klein-600)' : 'var(--text-muted)';
  const whenText = d.days < 0 ? `${Math.abs(d.days)} Tage überfällig` : d.days === 0 ? 'heute fällig' : `in ${d.days} Tagen`;
  return /*#__PURE__*/React.createElement("div", {
    className: `fk-dl ${isOverdue ? 'fk-dl--overdue' : ''}`,
    onClick: onOpen
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-dl__date"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-dl__day"
  }, pd.day), /*#__PURE__*/React.createElement("span", {
    className: "fk-dl__mon"
  }, pd.mon)), /*#__PURE__*/React.createElement("div", {
    className: "fk-dl__sep"
  }), /*#__PURE__*/React.createElement("div", {
    className: "fk-dl__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-dl__task"
  }, d.task), /*#__PURE__*/React.createElement("div", {
    className: "fk-dl__meta"
  }, d.asset, " ", /*#__PURE__*/React.createElement(Tag, null, d.ref))), /*#__PURE__*/React.createElement("span", {
    className: "fk-dl__when",
    style: {
      color: whenColor
    }
  }, whenText), /*#__PURE__*/React.createElement(Badge, {
    tone: window.STATUS_TONE[d.status],
    dot: true
  }, window.STATUS_LABEL[d.status]));
}
function Deadlines({
  onNav
}) {
  const D = window.FINK_DATA;
  const {
    Button
  } = window.FinkDesignSystem_4f2014;
  React.useEffect(() => {
    setTimeout(() => window.lucide && lucide.createIcons(), 10);
  });
  const overdue = D.deadlines.filter(d => d.status === 'overdue');
  const soon = D.deadlines.filter(d => d.status === 'pending');
  const later = D.deadlines.filter(d => d.status === 'upcoming');
  const Group = ({
    title,
    color,
    items
  }) => items.length === 0 ? null : /*#__PURE__*/React.createElement("div", {
    className: "fk-dl-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-dl-group__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: color
    }
  }), title, " \xB7 ", items.length), items.map(d => /*#__PURE__*/React.createElement(DeadlineRow, {
    key: d.id,
    d: d,
    onOpen: () => onNav('assets')
  })));
  return /*#__PURE__*/React.createElement(AppShell, {
    active: "deadlines",
    onNav: onNav,
    title: "Fristen",
    subtitle: "Alle Meldepflichten nach F\xE4lligkeit",
    actions: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement("i", {
        "data-lucide": "calendar"
      })
    }, "Kalender")
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-screen__inner",
    style: {
      maxWidth: '860px'
    }
  }, /*#__PURE__*/React.createElement(Group, {
    title: "\xDCberf\xE4llig",
    color: "var(--red-600)",
    items: overdue
  }), /*#__PURE__*/React.createElement(Group, {
    title: "Diese Woche",
    color: "var(--klein-500)",
    items: soon
  }), /*#__PURE__*/React.createElement(Group, {
    title: "Demn\xE4chst",
    color: "var(--gray-300)",
    items: later
  }))));
}
Object.assign(window, {
  Deadlines
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Deadlines.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Landing.jsx
try { (() => {
/* fink app — Landing / marketing hero (pre-login)
   Logo top-left, menu top-right, page-filling sketch below. */

function Landing({
  onLogin
}) {
  React.useEffect(() => {
    setTimeout(() => window.lucide && lucide.createIcons(), 10);
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "lp"
  }, /*#__PURE__*/React.createElement("header", {
    className: "lp-head"
  }, /*#__PURE__*/React.createElement("button", {
    className: "lp-logo",
    onClick: () => window.scrollTo(0, 0),
    "aria-label": "fink"
  }, "fink"), /*#__PURE__*/React.createElement("nav", {
    className: "lp-menu"
  }, /*#__PURE__*/React.createElement("a", null, "\xDCber uns"), /*#__PURE__*/React.createElement("a", null, "Produkt"), /*#__PURE__*/React.createElement("a", null, "F\xFCr Kanzleien"), /*#__PURE__*/React.createElement("a", null, "Preise"), /*#__PURE__*/React.createElement("a", {
    className: "lp-menu__login",
    onClick: onLogin
  }, "Anmelden"))), /*#__PURE__*/React.createElement("section", {
    className: "lp-stage"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/media/fink-sketch-ikb.png?v=4",
    alt: "Zwei Juristen pr\xFCfen Unterlagen"
  })));
}
Object.assign(window, {
  Landing
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Landing.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Login.jsx
try { (() => {
/* fink app — Login / landing (hero video) */

function Login({
  onSignIn,
  onBack
}) {
  const {
    Input,
    Button,
    Checkbox
  } = window.FinkDesignSystem_4f2014;
  React.useEffect(() => {
    setTimeout(() => window.lucide && lucide.createIcons(), 10);
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "fk-login"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-hero__mark"
  }, "fink"), /*#__PURE__*/React.createElement("img", {
    className: "fk-hero__papers",
    src: "../../assets/media/fink-papers-white.png?v=1",
    alt: ""
  }), /*#__PURE__*/React.createElement("div", {
    className: "fk-hero__content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-hero__eyebrow"
  }, "F\xFCr Kanzleien & Compliance-Teams"), /*#__PURE__*/React.createElement("div", {
    className: "fk-hero__quote"
  }, "Die Regulierung \xE4ndert sich. Ihre Nachweise bleiben l\xFCckenlos."))), /*#__PURE__*/React.createElement("div", {
    className: "fk-login__form"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "fk-login__back",
    onClick: onBack
  }, "Zur\xFCck"), /*#__PURE__*/React.createElement("form", {
    className: "fk-login__fields",
    onSubmit: e => {
      e.preventDefault();
      onSignIn();
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "E-Mail",
    type: "email",
    defaultValue: "lena.brandt@klima-energie.de",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "mail"
    })
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Passwort",
    type: "password",
    defaultValue: "............",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "lock"
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "fk-spread",
    style: {
      marginTop: '2px'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Angemeldet bleiben",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "loop-link",
    onClick: e => e.preventDefault()
  }, "Passwort vergessen?")), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    fullWidth: true,
    type: "submit",
    className: "login-cta",
    iconRight: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "arrow-right"
    })
  }, "Anmelden"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "secondary",
    type: "button",
    className: "login-sso",
    onClick: onSignIn
  }, "Mit SSO anmelden")), /*#__PURE__*/React.createElement("p", {
    className: "fk-login__meta"
  }, "Gesch\xFCtzter Bereich \xB7 DSGVO-konform \xB7 Hosting in der EU")));
}
Object.assign(window, {
  Login
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Login.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Reports.jsx
try { (() => {
/* fink app — Berichte / fink Assistent (AI report drafting) */

function Msg({
  m
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "fk-msg"
  }, /*#__PURE__*/React.createElement("span", {
    className: `fk-msg__av fk-msg__av--${m.from}`
  }, m.from === 'fink' ? /*#__PURE__*/React.createElement("i", {
    "data-lucide": "sparkles"
  }) : 'LB'), /*#__PURE__*/React.createElement("div", {
    className: "fk-msg__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-msg__who"
  }, m.from === 'fink' ? 'fink' : 'Lena Brandt'), /*#__PURE__*/React.createElement("div", {
    className: "fk-msg__text"
  }, m.text.map((p, i) => /*#__PURE__*/React.createElement("p", {
    key: i
  }, p)), m.draft && /*#__PURE__*/React.createElement("div", {
    className: "fk-draft"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-draft__h"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "file-text"
  }), " ", m.draft.title), /*#__PURE__*/React.createElement("div", {
    className: "fk-draft__b"
  }, /*#__PURE__*/React.createElement("h4", null, m.draft.heading), m.draft.body, /*#__PURE__*/React.createElement("div", {
    className: "fk-cites"
  }, m.draft.cites.map((c, i) => /*#__PURE__*/React.createElement("span", {
    className: "cite",
    key: i
  }, c))))), m.cites && /*#__PURE__*/React.createElement("div", {
    className: "fk-cites"
  }, m.cites.map((c, i) => /*#__PURE__*/React.createElement("span", {
    className: "cite",
    key: i
  }, c))))));
}
const SEED = [{
  from: 'fink',
  text: ['Guten Morgen, Lena. Ich habe das Portfolio über Nacht gegen das EEG 2023 geprüft.', 'Für Windpark Nordsee II sind zwei Meldungen überfällig. Soll ich die MaStR-Aktualisierung als Entwurf vorbereiten?']
}, {
  from: 'user',
  text: ['Ja, bitte. Erstelle den Entwurf für die Quartalsmeldung von Solarpark Lausitz.']
}, {
  from: 'fink',
  text: ['Entwurf erstellt. Grundlage sind die Einspeisemengen aus dem Netzbetreiber-Export Q2 2026.'],
  draft: {
    title: 'Quartalsmeldung Q2 2026 — Solarpark Lausitz',
    heading: 'Eingespeiste Strommenge nach § 71 EEG 2023',
    body: 'Im Zeitraum 01.04.–30.06.2026 wurden 3.184 MWh eingespeist. Die Mengen sind viertelstundenscharf belegt und stimmen mit den Zählerständen des Netzbetreibers überein. Die Meldung ist fristgerecht zum 31.07.2026 an das Marktstammdatenregister zu übermitteln.',
    cites: ['§ 71 EEG 2023', 'MaStR-Nr. SEE901134', 'Netzbetreiber-Export Q2']
  }
}];
function Reports({
  onNav
}) {
  const {
    Button,
    IconButton,
    Badge
  } = window.FinkDesignSystem_4f2014;
  const [msgs, setMsgs] = React.useState(SEED);
  const [draft, setDraft] = React.useState('');
  const streamRef = React.useRef(null);
  React.useEffect(() => {
    setTimeout(() => window.lucide && lucide.createIcons(), 10);
  });
  React.useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [msgs]);
  const send = text => {
    const t = (text || draft).trim();
    if (!t) return;
    setMsgs(m => [...m, {
      from: 'user',
      text: [t]
    }]);
    setDraft('');
    setTimeout(() => {
      setMsgs(m => [...m, {
        from: 'fink',
        text: ['Ich habe die relevanten Pflichten geprüft und eine Antwort mit Belegstellen zusammengestellt.'],
        cites: ['§ 19 EEG 2023', '§ 21c EEG 2023', 'Clearingstelle EEG']
      }]);
    }, 650);
  };
  return /*#__PURE__*/React.createElement(AppShell, {
    active: "reports",
    onNav: onNav,
    search: false,
    title: "fink Assistent",
    subtitle: "EEG-Recherche & Berichtsentw\xFCrfe",
    actions: /*#__PURE__*/React.createElement(Badge, {
      tone: "info",
      icon: /*#__PURE__*/React.createElement("i", {
        "data-lucide": "shield-check"
      })
    }, "Quellen belegt")
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-main",
    style: {
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-ai__stream",
    ref: streamRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-ai__wrap"
  }, msgs.map((m, i) => /*#__PURE__*/React.createElement(Msg, {
    key: i,
    m: m
  })))), /*#__PURE__*/React.createElement("div", {
    className: "fk-ai__composer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-ai__inputwrap"
  }, /*#__PURE__*/React.createElement("textarea", {
    rows: 1,
    value: draft,
    placeholder: "fink nach einer Pflicht, Frist oder einem \xA7 fragen\u2026",
    onChange: e => setDraft(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    }
  }), /*#__PURE__*/React.createElement(Button, {
    iconLeft: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "arrow-up"
    }),
    onClick: () => send()
  }, "Senden")), /*#__PURE__*/React.createElement("div", {
    className: "fk-ai__suggest"
  }, ['Welche Fristen laufen diese Woche ab?', 'Erkläre § 21c EEG', 'Entwurf für MaStR-Aktualisierung'].map(s => /*#__PURE__*/React.createElement("button", {
    className: "fk-chip",
    key: s,
    onClick: () => send(s)
  }, s))))));
}
Object.assign(window, {
  Reports
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Reports.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/data.js
try { (() => {
/* fink app — demo data (fictional, German EEG compliance domain) */
window.FINK_DATA = {
  user: {
    name: 'Lena Brandt',
    role: 'Compliance Lead',
    org: 'Klima Energie GmbH'
  },
  kpis: {
    conformity: 94,
    conformityDelta: '+2,1 %',
    openDeadlines: 7,
    openDelta: '3 neu',
    assets: 48,
    capacity: '186,4'
  },
  // Anlagen (plants)
  assets: [{
    id: 'SEE901134',
    name: 'Solarpark Lausitz',
    tech: 'pv',
    power: '12.480 kWp',
    region: 'Brandenburg',
    status: 'compliant',
    open: 0,
    next: 'Quartalsmeldung · 31.07.2026'
  }, {
    id: 'WEE774220',
    name: 'Windpark Nordsee II',
    tech: 'wind',
    power: '24.000 kW',
    region: 'Niedersachsen',
    status: 'overdue',
    open: 2,
    next: 'MaStR-Aktualisierung · überfällig'
  }, {
    id: 'SEE552310',
    name: 'Solarpark Hochfranken',
    tech: 'pv',
    power: '8.900 kWp',
    region: 'Bayern',
    status: 'pending',
    open: 1,
    next: 'EEG-Umlage Nachweis · 18.06.2026'
  }, {
    id: 'WEE118903',
    name: 'Windpark Eifel',
    tech: 'wind',
    power: '15.600 kW',
    region: 'Rheinland-Pfalz',
    status: 'compliant',
    open: 0,
    next: 'Jahresmeldung · 28.02.2027'
  }, {
    id: 'SEE889201',
    name: 'Agri-PV Uckermark',
    tech: 'pv',
    power: '5.200 kWp',
    region: 'Brandenburg',
    status: 'pending',
    open: 1,
    next: 'Inbetriebnahme-Meldung · 21.06.2026'
  }, {
    id: 'WEE330145',
    name: 'Windpark Ostsee',
    tech: 'wind',
    power: '30.200 kW',
    region: 'Mecklenburg-Vorp.',
    status: 'compliant',
    open: 0,
    next: 'Quartalsmeldung · 31.07.2026'
  }, {
    id: 'SEE640772',
    name: 'Solarpark Rheinaue',
    tech: 'pv',
    power: '11.100 kWp',
    region: 'Nordrhein-Westf.',
    status: 'compliant',
    open: 0,
    next: 'Redispatch-Nachweis · 15.08.2026'
  }, {
    id: 'BEE201554',
    name: 'Biogas Wendland',
    tech: 'bio',
    power: '2.400 kW',
    region: 'Niedersachsen',
    status: 'pending',
    open: 1,
    next: 'Einsatzstoff-Tagebuch · 30.06.2026'
  }],
  // Fristen (deadlines)
  deadlines: [{
    id: 'd1',
    asset: 'Windpark Nordsee II',
    ref: '§ 71 EEG',
    task: 'MaStR-Stammdaten aktualisieren',
    due: '2026-06-08',
    status: 'overdue',
    days: -4
  }, {
    id: 'd2',
    asset: 'Windpark Nordsee II',
    ref: '§ 21c EEG',
    task: 'Direktvermarktung Nachweis',
    due: '2026-06-09',
    status: 'overdue',
    days: -3
  }, {
    id: 'd3',
    asset: 'Solarpark Hochfranken',
    ref: '§ 19 EEG',
    task: 'EEG-Umlage Nachweis einreichen',
    due: '2026-06-18',
    status: 'pending',
    days: 6
  }, {
    id: 'd4',
    asset: 'Agri-PV Uckermark',
    ref: '§ 5 EEG',
    task: 'Inbetriebnahme-Meldung',
    due: '2026-06-21',
    status: 'pending',
    days: 9
  }, {
    id: 'd5',
    asset: 'Biogas Wendland',
    ref: '§ 44b EEG',
    task: 'Einsatzstoff-Tagebuch übermitteln',
    due: '2026-06-30',
    status: 'pending',
    days: 18
  }, {
    id: 'd6',
    asset: 'Solarpark Lausitz',
    ref: '§ 71 EEG',
    task: 'Quartalsmeldung Q2',
    due: '2026-07-31',
    status: 'upcoming',
    days: 49
  }, {
    id: 'd7',
    asset: 'Solarpark Rheinaue',
    ref: '§ 13a EnWG',
    task: 'Redispatch 2.0 Nachweis',
    due: '2026-08-15',
    status: 'upcoming',
    days: 64
  }],
  // AI-detected obligations for the asset-detail screen (Solarpark Lausitz)
  obligations: [{
    ref: '§ 71 EEG 2023',
    title: 'Quartalsweise Mengenmeldung',
    detail: 'Eingespeiste Strommengen quartalsweise an den Netzbetreiber melden.',
    done: true
  }, {
    ref: '§ 19 EEG 2023',
    title: 'Nachweis EEG-Umlage Eigenversorgung',
    detail: 'Jährlicher Nachweis der eigenverbrauchten Mengen.',
    done: true
  }, {
    ref: '§ 9 EEG 2023',
    title: 'Technische Vorgaben Einspeisemanagement',
    detail: 'Fernsteuerbarkeit der Anlage nachweisen.',
    done: true
  }, {
    ref: '§ 71 EEG 2023',
    title: 'Quartalsmeldung Q2 2026',
    detail: 'Fällig zum 31.07.2026 — Entwurf von fink vorbereitet.',
    done: false
  }],
  activity: [{
    who: 'fink',
    icon: 'sparkles',
    text: 'hat 12 neue Pflichten aus dem EEG 2023 erkannt',
    when: 'vor 2 Std.'
  }, {
    who: 'Lena Brandt',
    icon: 'check',
    text: 'Quartalsmeldung Q1 für Solarpark Lausitz eingereicht',
    when: 'gestern'
  }, {
    who: 'fink',
    icon: 'file-text',
    text: 'Entwurf für MaStR-Aktualisierung erstellt',
    when: 'gestern'
  }, {
    who: 'System',
    icon: 'bell',
    text: 'Frist „EEG-Umlage Nachweis" in 6 Tagen',
    when: 'vor 2 Tagen'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/data.js", error: String((e && e.message) || e) }); }

// ui_kits/app/shell.jsx
try { (() => {
/* fink app — shared chrome: logo, sidebar, topbar, AppShell */

/* The fink logo is the lowercase OUTLINE wordmark (Gilmer Outline) —
   used consistently, including in small UI chrome, so the letterforms
   (dotless i, etc.) match the hero lockup. */
function FinkMark({
  size = 26,
  color = 'var(--klein-600)'
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-outline)',
      fontSize: size,
      letterSpacing: '-0.01em',
      lineHeight: 1,
      color
    },
    "aria-label": "fink"
  }, "fink");
}
const TECH_ICON = {
  pv: 'sun',
  wind: 'wind',
  bio: 'leaf'
};
const STATUS_LABEL = {
  compliant: 'Konform',
  pending: 'Frist offen',
  overdue: 'Überfällig',
  upcoming: 'Geplant',
  neutral: 'Entwurf'
};
const STATUS_TONE = {
  compliant: 'compliant',
  pending: 'pending',
  overdue: 'overdue',
  upcoming: 'neutral',
  neutral: 'neutral'
};
function NavItem({
  icon,
  label,
  count,
  active,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: `fk-nav ${active ? 'fk-nav--active' : ''}`,
    onClick: onClick
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-nav__label"
  }, label), count != null && /*#__PURE__*/React.createElement("span", {
    className: "fk-nav__count"
  }, count));
}
function AppShell({
  active,
  onNav,
  title,
  subtitle,
  actions,
  search = true,
  children
}) {
  const {
    Avatar,
    IconButton,
    Button
  } = window.FinkDesignSystem_4f2014;
  const D = window.FINK_DATA;
  const overdue = D.deadlines.filter(d => d.status === 'overdue').length;
  const open = D.deadlines.filter(d => d.status === 'overdue' || d.status === 'pending').length;
  React.useEffect(() => {
    setTimeout(() => window.lucide && lucide.createIcons(), 10);
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "fk-app"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "fk-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fk-side__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-side__logo"
  }, "fink")), /*#__PURE__*/React.createElement("nav", {
    className: "fk-side__nav"
  }, /*#__PURE__*/React.createElement(NavItem, {
    icon: "layout-dashboard",
    label: "\xDCbersicht",
    active: active === 'dashboard',
    onClick: () => onNav('dashboard')
  }), /*#__PURE__*/React.createElement(NavItem, {
    icon: "panels-top-left",
    label: "Anlagen",
    count: D.assets.length,
    active: active === 'assets' || active === 'asset',
    onClick: () => onNav('assets')
  }), /*#__PURE__*/React.createElement(NavItem, {
    icon: "calendar-clock",
    label: "Fristen",
    count: open,
    active: active === 'deadlines',
    onClick: () => onNav('deadlines')
  }), /*#__PURE__*/React.createElement(NavItem, {
    icon: "file-text",
    label: "Berichte",
    active: active === 'reports',
    onClick: () => onNav('reports')
  }), /*#__PURE__*/React.createElement("div", {
    className: "fk-side__section"
  }, "Recht"), /*#__PURE__*/React.createElement(NavItem, {
    icon: "scale",
    label: "EEG-Bibliothek",
    onClick: () => onNav('reports')
  }), /*#__PURE__*/React.createElement(NavItem, {
    icon: "sparkles",
    label: "fink Assistent",
    active: active === 'reports',
    onClick: () => onNav('reports')
  })), /*#__PURE__*/React.createElement("div", {
    className: "fk-side__cta"
  }, /*#__PURE__*/React.createElement(Button, {
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "sparkles"
    }),
    onClick: () => onNav('reports')
  }, "fink fragen")), /*#__PURE__*/React.createElement("div", {
    className: "fk-side__foot"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: D.user.name,
    size: "sm",
    accent: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "fk-side__user"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fk-side__uname"
  }, D.user.name), /*#__PURE__*/React.createElement("span", {
    className: "fk-side__urole"
  }, D.user.org)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Einstellungen",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "settings"
    })
  })))), /*#__PURE__*/React.createElement("div", {
    className: "fk-main"
  }, /*#__PURE__*/React.createElement("header", {
    className: "fk-top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "fk-top__title"
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    className: "fk-top__sub"
  }, subtitle)), search && /*#__PURE__*/React.createElement("div", {
    className: "fk-top__search"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "search"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Anlage, MaStR-Nr. oder \xA7 suchen\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fk-row",
    style: {
      marginLeft: search ? 0 : 'auto',
      gap: '20px'
    }
  }, actions, /*#__PURE__*/React.createElement("button", {
    className: "fk-top__logout",
    onClick: () => onNav('logout')
  }, "Abmelden"))), children));
}
Object.assign(window, {
  FinkMark,
  NavItem,
  AppShell,
  TECH_ICON,
  STATUS_LABEL,
  STATUS_TONE
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/shell.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
