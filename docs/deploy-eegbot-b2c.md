# Deploy — eegbot.aiwerke.de (B2C-Instanz)

Zweite gehostete Instanz der EEGbot-Web-App auf dem Ubuntu-Server, nach dem
gleichen Muster wie fink (siehe `docs/deploy-fink.md`): Dienst auf localhost-Port
→ cloudflared-Tunnel-Ingress, TLS terminiert Cloudflare, kein nginx. Idempotent —
jeder Schritt ist wiederholbar. Diese Instanz läuft **parallel und unabhängig**
von fink; fink (`/opt/eegbot`, Port 3475) bleibt unangetastet und auf altem
Commit gepinnt.

## Architektur

| Baustein | Wert | Unterschied zu fink |
|---|---|---|
| Code | `/opt/eegbot-b2c` (git clone von github.com/joschi655/EEGbot) | fink: `/opt/eegbot` |
| Dienst | systemd `eegbot-b2c.service`, `bun ui/server.ts`, Port **3476**, User ubuntu | fink: Port 3475 |
| Env / Key | `EnvironmentFile=-/etc/eegbot-b2c.env` (root:root, 600) | fink: kein EnvironmentFile |
| Zugriffsschutz | **Cloudflare Access** (geplant, Dashboard) — solange nicht aktiv: `EEGBOT_PUBLIC=1` im Env | fink: dauerhaft `EEGBOT_PUBLIC=1` als `Environment=` |
| Recherche-Quellen | zusätzlich `ingest:clearingstelle` + `ingest:rechtsprechung` gebaut | fink: nur `build:knowledge` |
| Bind | `HOST=127.0.0.1` (nur Tunnel spricht mit dem Prozess) | gleich |
| Ingress | `/etc/cloudflared/config.yml`: `eegbot.aiwerke.de → http://localhost:3476` (VOR dem `http_status:404`-Catch-all) | eigener Eintrag, fink-Eintrag daneben |
| DNS | `cloudflared tunnel route dns 3982ac7e-ef9f-4918-b302-c35cb8bef95f eegbot.aiwerke.de` (nutzt `~/.cloudflared/cert.pem`, als User ubuntu) | eigener CNAME |

Der Cloudflare-Tunnel ist **derselbe** wie für fink und alle anderen
`*.aiwerke.de`-Dienste (Tunnel-ID `3982ac7e-ef9f-4918-b302-c35cb8bef95f`). Es
wird nur ein Ingress-Eintrag ergänzt, kein neuer Tunnel angelegt.

## Zugriffsschutz — Access vs. EEGBOT_PUBLIC

Der Intake-Endpunkt (`POST /api/intake`) ruft die Anthropic-API und verursacht
damit Kosten. Er muss geschützt sein. Zwei sich gegenseitig ausschließende Modi:

- **Cloudflare Access aktiv** (Zielzustand): Access schützt die ganze Domain
  (302 auf `*.cloudflareaccess.com` für Unauthentifizierte). Dann läuft der
  Bot mit echtem Key: `/etc/eegbot-b2c.env` enthält `ANTHROPIC_API_KEY=…`
  (KEINE `EEGBOT_PUBLIC`-Zeile), Intake ist voll funktionsfähig.
- **Access noch nicht aktiv** (aktueller Stand, „Fall B"): Domain ist öffentlich
  (`/app/` liefert 200 ohne Redirect). Dann **kein Key** deployen; stattdessen
  `EEGBOT_PUBLIC=1` in `/etc/eegbot-b2c.env` → `/api/intake` liefert 403 und der
  offene Kosten-Endpunkt ist zu.

**Umschalten auf Access (sobald im Dashboard eingerichtet):** die
`EEGBOT_PUBLIC=1`-Zeile in `/etc/eegbot-b2c.env` durch `ANTHROPIC_API_KEY=…`
ersetzen (Key aus dem lokalen `.env`, nie im Klartext loggen — via stdin an
`sudo tee`, nicht als echo-Argument), dann `sudo systemctl restart eegbot-b2c`.
Umgekehrt gilt: solange Access fehlt, NIE den Key ohne `EEGBOT_PUBLIC` deployen.

## Schritte

```bash
# 1 · Code + Wissensbasis (auf dem Server, User ubuntu)
export PATH="/home/ubuntu/.bun/bin:$PATH"
sudo mkdir -p /opt/eegbot-b2c && sudo chown ubuntu:ubuntu /opt/eegbot-b2c
git clone https://github.com/joschi655/EEGbot /opt/eegbot-b2c 2>/dev/null || git -C /opt/eegbot-b2c pull
cd /opt/eegbot-b2c && bun install \
  && bun run validate:data && bun run build:knowledge && bun run build:eeg2027
# Recherche-Screen-Quellen (degradieren sauber, falls eine Quelle 403t):
bun run ingest:clearingstelle
bun run ingest:rechtsprechung

# 2 · Env-Datei anlegen (Inhalt siehe Zugriffsschutz — im Fall B: EEGBOT_PUBLIC=1)
sudo touch /etc/eegbot-b2c.env && sudo chmod 600 /etc/eegbot-b2c.env && sudo chown root:root /etc/eegbot-b2c.env
printf 'EEGBOT_PUBLIC=1\n' | sudo tee /etc/eegbot-b2c.env >/dev/null   # Fall B (kein Access)

# 3 · systemd (Vorlage unten) → enable + start
sudo systemctl daemon-reload && sudo systemctl enable --now eegbot-b2c
curl -s localhost:3476/api/status          # alle Indizes „vorhanden" (dokumente „fehlt" ist normal)
curl -s localhost:3476/app/ | head -2

# 4 · cloudflared: Ingress-Eintrag ergänzen (VOR Catch-all), Backup, ZWINGEND validieren, DNS, dann restart
cp /etc/cloudflared/config.yml /home/ubuntu/cloudflared-config-backup-$(date +%s).yml
#   eegbot.aiwerke.de → http://localhost:3476 vor der Zeile `- service: http_status:404` einfügen
cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate    # MUSS OK sein
cloudflared tunnel route dns 3982ac7e-ef9f-4918-b302-c35cb8bef95f eegbot.aiwerke.de
UNIT=cf-restart-$(date +%s); sudo systemd-run --unit=$UNIT systemctl restart cloudflared   # überlebt SSH-Abbruch
# → neu verbinden, dann prüfen:
systemctl is-active cloudflared eegbot-fink eegbot-b2c

# 5 · Proben (extern, vom lokalen Rechner)
curl -sI https://eegbot.aiwerke.de/app/ | head -5     # 200 (Fall B) oder 302 cloudflareaccess.com (Access aktiv)
curl -s  -o /dev/null -w '%{http_code}\n' -X POST https://eegbot.aiwerke.de/api/intake -d '{}'   # 403 unter EEGBOT_PUBLIC
curl -sI https://fink.aiwerke.de/app/ | head -3       # Gegenprobe: fink weiter 200
```

## systemd-Vorlage (`/etc/systemd/system/eegbot-b2c.service`)

```ini
[Unit]
Description=EEGbot B2C Web (eegbot.aiwerke.de)
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/eegbot-b2c
ExecStart=/home/ubuntu/.bun/bin/bun ui/server.ts
Environment=PORT=3476
Environment=HOST=127.0.0.1
EnvironmentFile=-/etc/eegbot-b2c.env
Restart=always
RestartSec=3
NoNewPrivileges=true
ProtectSystem=full
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Das `-` vor `EnvironmentFile=-/etc/eegbot-b2c.env` macht die Datei optional —
der Dienst startet auch, wenn sie (noch) leer ist oder fehlt.

## Update-Prozess

```bash
export PATH="/home/ubuntu/.bun/bin:$PATH"
git -C /opt/eegbot-b2c pull && cd /opt/eegbot-b2c && bun install \
  && bun run build:knowledge && bun run build:eeg2027 \
  && sudo systemctl restart eegbot-b2c
# Bei Bedarf Recherche-Quellen neu ziehen:
#   bun run ingest:clearingstelle && bun run ingest:rechtsprechung
```

## Gefahren / Gelerntes

- **Key-Fenster (wichtigste Gefahr):** Solange Cloudflare Access NICHT aktiv ist,
  darf `/etc/eegbot-b2c.env` KEINEN `ANTHROPIC_API_KEY` enthalten — sonst ist der
  Intake-Endpunkt offen und jeder kann Anthropic-Kosten auslösen. Erst Access
  aktivieren (302-Redirect verifizieren), DANN Key rein und `EEGBOT_PUBLIC`
  entfernen. Prüf-Reihenfolge nie umdrehen.
- **cloudflared-Restart bricht die eigene SSH-Session** (SSH läuft selbst über den
  Tunnel). Vor jedem Restart: Backup der Config + `ingress validate` (MUSS OK).
  Restart detached via `sudo systemd-run --unit=… systemctl restart cloudflared`,
  damit er den SSH-Abbruch überlebt. Ungültige Config = ausgesperrt bis zum
  physischen Zugriff.
- **`/opt/eegbot` (fink) niemals anfassen** — eigener Dienst (Port 3475), auf
  altem Commit gepinnt. Diese Instanz ist strikt `/opt/eegbot-b2c`.
- **Access-Policy-Pflege:** Wer Zugriff bekommt, wird im Cloudflare-Zero-Trust-
  Dashboard gepflegt (Access-Application + Policy für `eegbot.aiwerke.de`). Ohne
  gepflegte Policy ist die Instanz entweder ganz offen (Fall B) oder für alle
  gesperrt — beides bewusst prüfen.
- **`dokumente: "fehlt"` in `/api/status` ist normal** für eine frische Instanz
  ohne eigene Nutzer-Unterlagen (`ingest:dokumente` wurde nicht ausgeführt). Die
  vier Wissens-Indizes (normgraph, normen_index, clearingstelle, rechtsprechung)
  müssen „vorhanden" sein.
- **Ingest-Quellen degradieren sauber:** `ingest:clearingstelle` kann bei
  automatisiertem Zugriff einzelne 403 kassieren und lädt dann nur einen Teil —
  der Recherche-Screen funktioniert trotzdem mit dem Teilindex. Bei Bedarf später
  erneut ziehen.
