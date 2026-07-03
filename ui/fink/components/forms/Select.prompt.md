A styled native select with custom chevron. Give it `options` or `<option>` children.

```jsx
<Select label="Technologie" options={["Photovoltaik", "Windkraft", "Biomasse"]} />
<Select label="Status" placeholder="Alle" options={[
  { value: 'ok', label: 'Konform' },
  { value: 'due', label: 'Frist offen' },
]} />
```

Props: `label`, `options`, `placeholder`, `size` (`sm`/`md`), plus native select attributes.
