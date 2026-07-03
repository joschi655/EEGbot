A labelled text input with hint, error, leading icon and unit suffix. Native `<input>` props pass through.

```jsx
<Input label="Anlagenname" placeholder="z. B. Solarpark Lausitz" required />
<Input label="Leistung" suffix="kWp" defaultValue="12.480" iconLeft={<i data-lucide="zap" />} />
<Input label="MaStR-Nr." error="Pflichtfeld" />
```

Props: `label`, `hint`, `error`, `required`, `size` (`sm`/`md`/`lg`), `iconLeft`, `suffix`, `disabled`.
