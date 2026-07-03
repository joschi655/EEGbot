A horizontal tab bar (underline or pill), controlled or uncontrolled.

```jsx
const [tab, setTab] = React.useState('open');
<Tabs value={tab} onChange={setTab} items={[
  { value: 'all', label: 'Alle', count: 48 },
  { value: 'open', label: 'Offen', count: 7 },
  { value: 'done', label: 'Eingereicht' },
]} />
```

Props: `items` ({value,label,icon?,count?}), `value`/`defaultValue`, `onChange`, `variant` (`underline`/`pill`).
