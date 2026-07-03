The primary surface container — bordered panel with optional header/footer.

```jsx
<Card title="Solarpark Lausitz" subtitle="12.480 kWp · Brandenburg"
  headerAction={<Badge tone="compliant">Konform</Badge>}
  footer={<Button size="sm" variant="ghost">Details öffnen</Button>}>
  <p>3 Pflichten erfüllt, 1 Frist offen.</p>
</Card>
```

Variants: `default` · `flat` (no shadow) · `raised` · `interactive` (hover lift) · `accent` (Klein top-rule). Props: `title`, `subtitle`, `headerAction`, `footer`, `tight`, `noBody`.
