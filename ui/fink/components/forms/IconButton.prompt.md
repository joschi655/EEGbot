A square, icon-only button — toolbars, row actions, dialog close buttons. Always give it a `label`.

```jsx
<IconButton label="Schließen" icon={<i data-lucide="x" />} />
<IconButton variant="outline" label="Filter" icon={<i data-lucide="sliders-horizontal" />} />
<IconButton variant="solid" size="sm" label="Neu" icon={<i data-lucide="plus" />} />
```

Variants: `ghost` (default) · `outline` · `solid` (Klein). Sizes `sm`/`md`/`lg`.
