An inline notice/alert tied to a compliance tone, with a default Lucide icon.

```jsx
<Banner tone="overdue" title="2 Fristen überfällig"
  actions={<Button size="sm" variant="danger">Jetzt prüfen</Button>}
  onDismiss={() => hide()}>
  Solarpark Lausitz und WP Nordsee benötigen eine MaStR-Meldung.
</Banner>
<Banner tone="info">fink hat 12 neue Pflichten aus dem EEG 2023 erkannt.</Banner>
```

Tones: `info` · `compliant` · `pending` · `overdue` · `neutral`. Props: `title`, `icon`, `actions`, `onDismiss`. Run `lucide.createIcons()` after mount.
