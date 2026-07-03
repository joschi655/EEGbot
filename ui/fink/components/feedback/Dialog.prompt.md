A centered modal with blurred backdrop. Controlled via `open`.

```jsx
const [open, setOpen] = React.useState(false);
<Dialog open={open} onClose={() => setOpen(false)}
  title="Meldung einreichen?"
  description="Die Meldung wird an das Marktstammdatenregister übermittelt."
  footer={<>
    <Button variant="secondary" onClick={() => setOpen(false)}>Abbrechen</Button>
    <Button onClick={submit}>Einreichen</Button>
  </>}>
  Bitte prüfen Sie die Angaben für Solarpark Lausitz.
</Dialog>
```

Props: `open`, `onClose`, `title`, `description`, `footer`, `width`.
