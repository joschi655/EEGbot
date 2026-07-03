A horizontal progress/completion bar; tone can echo a compliance state.

```jsx
<ProgressBar label="Meldung vollständig" value={72} />
<ProgressBar label="Portfolio konform" value={94} tone="compliant" size="lg" />
<ProgressBar value={3} max={7} valueFormat={(v,m) => `${v}/${m} Pflichten`} />
```

Props: `value`, `max`, `label`, `showValue`, `tone` (`accent`/`compliant`/`pending`/`overdue`), `size` (`md`/`lg`), `valueFormat`.
