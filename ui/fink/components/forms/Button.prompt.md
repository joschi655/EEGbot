The primary action control — use for buttons in any fink surface. One `primary` (Klein blue) per view; `secondary`/`ghost` for the rest.

```jsx
<Button variant="primary" size="md" iconLeft={<i data-lucide="check" />}>
  Meldung einreichen
</Button>
<Button variant="secondary">Abbrechen</Button>
<Button variant="ghost" size="sm">Details</Button>
```

Variants: `primary` · `secondary` · `ghost` · `accentSoft` · `danger`.
Sizes: `sm` (30px) · `md` (38px) · `lg` (46px). Props: `fullWidth`, `iconLeft`, `iconRight`, `disabled`, plus native button attributes. Call `lucide.createIcons()` after render if you pass Lucide `<i>` icons.
