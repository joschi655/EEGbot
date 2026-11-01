# Mitmachen

Hilfreich sind echte Verständnisprobleme, nachvollziehbare Fehler und belegte Korrekturen. Ein GitHub-Star ist nett; ein Bericht darüber, wo du nicht weiterkamst, hilft mehr.

## Ohne Programmieren

Öffne einen Erfahrungsbericht unter Issues. Beschreibe das Vorhaben allgemein, deinen erwarteten nächsten Schritt und wo du hängen geblieben bist. Issues sind öffentlich: keine Namen, Adressen, Rechnungen, Steuerbescheide, API-Schlüssel oder persönlichen Unterlagen hochladen. Bei Sicherheitsproblemen keinen ausnutzbaren Fehler samt echten Daten öffentlich posten; nutze GitHubs private Sicherheitsmeldung, sofern aktiviert, sonst kontaktiere den Maintainer ohne sensible Einzelheiten.

## Texte, Quellen und Code

Kleine Pull Requests sind willkommen. Fachliche Korrekturen brauchen Aussage, amtliche Quelle, konkrete Fundstelle, Gültigkeitszeitraum und Abrufdatum. Entwürfe dürfen nicht als geltendes Recht erscheinen. Fehlende Daten bleiben unbekannt. Quellenaktualität ist nicht allein durch einen neuen Zeitstempel belegt.

Vor dem PR:

```sh
bun run setup
bun test
bun run typecheck
bun run validate:data
bun run check:site
bun run test:site:e2e
```

Für Browsertests einmal `bunx playwright install chromium` ausführen. Die statische Website liegt ausschließlich in `site/`. Keine Dokumente oder Schlüssel dort ablegen. Änderungen an Rechnern benötigen Grenzfalltests; Sicherheitsschranken nicht zugunsten eines bequemeren Demos umgehen.
