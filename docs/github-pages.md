# Statische Einstiegsseite sicher veröffentlichen (Vorbereitung)

**Status: nur vorbereitet. Kein Deployment durchgeführt, keine Repository-Settings geändert.**
`site/` ist bereits die vollständige, von Hand gepflegte Build-Ausgabe: keine Bundler, kein API-Backend und kein Kopieren aus `data/`, `knowledge/`, `docs/` oder `dokumente/`. Nutzer benötigen nur einen Browser mit JavaScript für den Rechner. ES-Module bitte über HTTP nutzen, nicht per `file://` öffnen.

## Lokal prüfen
```bash
bun install
bun run check:site
bun test
bun run typecheck
bunx playwright install chromium
bun run test:site:e2e
bun run preview:site  # nur 127.0.0.1:4178/EEGbot/, mit Ctrl+C beenden
```
Der Testserver ist ausschließlich lokal und hat keine API. Nicht als Produktionsserver verwenden. Die Browsertests prüfen ausdrücklich den Projekt-Unterpfad `/EEGbot/`, nicht nur `/`.

## Erst nach separater Veröffentlichungsfreigabe
GitHub Pages kann beim Branch-Deployment nicht beliebige Unterordner wie `site/` wählen (nur Root oder `/docs`). Deshalb **nicht** das Repository-Root veröffentlichen und **nicht** Forschungsdokumentation nach `/docs` als Website ausliefern.

Empfohlener Weg: GitHub-Actions-Pages mit einem ausdrücklich freigegebenen Workflow. Hier ist nur ein Muster dokumentiert, kein aktiver Workflow angelegt:

```yaml
name: Publish public site
on: workflow_dispatch
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run check:site && bun test && bun run typecheck
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site
      - id: deployment
        uses: actions/deploy-pages@v4
```
Vor Aktivierung aktuelle Action-Versionen prüfen und für reproduzierbare Supply-Chain-Policies auf verifizierte Commit-SHAs pinnen. Dann erst die Pages-Quelle in den Settings auf GitHub Actions setzen und manuell auslösen. Beide Schritte brauchen ausdrückliche Freigabe. Kein Secret, kein API-Key und kein LLM-Backend werden benötigt.

## Vor der Veröffentlichung
- Allowlist und `git diff` ansehen; exakt nur `site/` hochladen, nie `.`. Keine Symlinks, privaten Dokumente, Forschungsdaten, Source-Maps, Umgebungsdateien oder Wissensindizes.
- Montage-STOP und Demo-Kennzeichnung, mobile Ansicht, Tastatur, Druck/Kopie und interne Links prüfen.
- Aktuelle Quellen, Angaben zu Betreiber/Datenschutz und ggf. erforderliche rechtliche Anbieterkennzeichnung durch Verantwortliche prüfen. Die vorbereitete Datenschutzbeschreibung ist keine Rechtsprüfung.
- Fünf echte Nutzertests durchführen (`docs/five-user-test.md`); hier sind keine Ergebnisse vorweggenommen.
- Erst nach Deployment URL `/EEGbot/` und alle Artikelseiten auf HTTP 200 prüfen, Pfade und Browserkonsole kontrollieren. Die Ziel-URL ist vor erfolgreichem Deployment kein vorhandenes Angebot.

## Grenzen
GitHub erhält beim Abruf technisch notwendige Zugriffsdaten. EEGbot selbst lädt keine externen Fonts/Tracker und sendet keine Recheneingaben. Der Server kann weder die lokale App noch MCP/Claude Code ausführen. Bei Fehlern einen geprüften früheren Site-Stand erneut deployen; keine persönlichen Eingaben sichern.
