# Statische Seite vorbereiten und veröffentlichen

Status: lokal vorbereitet und geprüft, nicht automatisch veröffentlicht. Die bestehende App https://eegbot.aiwerke.de/app/ läuft unabhängig davon. GitHub Pages hostet keine KI-API.

## Lokal

```sh
bun install
bun run check:site
bun run preview:site
# http://127.0.0.1:4178/EEGbot/
bun run test:site:e2e
```

Die Links sind auf den Projekt-Unterpfad `/EEGbot/` getestet. Ausschließlich `site/` veröffentlichen, niemals das gesamte Repo: es enthält Backend, Entwicklungsdokumentation und gegebenenfalls lokal generierte Wissensdaten.

## GitHub Pages nach Freigabe

1. Änderungen als geprüften PR ins öffentliche Repo bringen.
2. Unter Settings → Pages die Quelle GitHub Actions wählen.
3. Einen Pages-Workflow verwenden, der nach `bun run check:site` nur `site/` mit `actions/upload-pages-artifact` hochlädt und per `actions/deploy-pages` veröffentlicht. `contents: read`, `pages: write`, `id-token: write`; Environment `github-pages`. Actions-Versionen vor Aktivierung prüfen/pinnen.
4. Zieladresse bei Standardkonfiguration: https://joschi655.github.io/EEGbot/ (noch kein bestätigter Live-Link).
5. Deployment, Unterseiten, mobile Darstellung, Montage-STOP und Beispielrechnung extern prüfen. Erst danach Repo-Homepage und README auf die Live-URL umstellen.

Vor Veröffentlichung: Anbieterkennzeichnung/Impressumspflicht und Datenschutzhinweise für den konkreten Betreiber klären, echte Kontaktdaten nur mit Freigabe ergänzen. Keine Adresse erfinden. Hosting-Zugriffsdaten werden von GitHub verarbeitet; der Rechner selbst sendet keine Eingaben. Keine Analysepixel.

Rollback: vorherigen geprüften Pages-Commit erneut deployen. Keine Änderung an Cloudflared oder an der bestehenden App erforderlich. Zugangsdaten für den späteren KI-Piloten gehören ausschließlich in dessen Backend, nicht in Pages-Repository-Secrets zum Einbetten in Browserdateien.
