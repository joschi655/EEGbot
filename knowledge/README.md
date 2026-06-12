# knowledge/ — generierte Wissensbasis

Dieser Ordner wird lokal gebaut und nicht eingecheckt:

```bash
bun run build:knowledge
```

Erzeugt:
- `gesetze/<slug>/<datum>.json` — normalisierte Gesetzes-Fassungen (QuantLaw-Snapshots)
- `normgraph.sqlite` — temporaler Normgraph (Expressions + Querverweise)
- `index/normen.json` — BM25-Suchindex (Absatz-Chunks)

Warum nicht eingecheckt? Gesetze/Urteile sind amtliche Werke (§ 5 UrhG) und dürften
ins Repo — aber die Basis veraltet schnell, und künftige Korpora (Clearingstelle,
Verbands-PDFs) dürfen NICHT redistribuiert werden. Einheitliche Regel: Wissensbasis
ist lokal, das Repo shipped die Pipelines.
