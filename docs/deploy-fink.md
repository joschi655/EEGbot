# Deploy — fink.aiwerke.de (öffentliche Demo-Instanz)

Gehostete Instanz der fink-App auf dem Ubuntu-Server, nach dem Server-Muster:
Dienst auf localhost-Port → cloudflared-Tunnel-Ingress. Kein nginx nötig
(TLS terminiert Cloudflare). Idempotent — jeder Schritt ist wiederholbar.

## Architektur

| Baustein | Wert |
|---|---|
| Code | `/opt/eegbot` (git clone von github.com/joschi655/EEGbot) |
| Dienst | systemd `eegbot-fink.service`, `bun ui/server.ts`, Port **3475**, User ubuntu |
| Public-Härtung | `EEGBOT_PUBLIC=1` → `/api/intake` liefert 403 (sonst offener Anthropic-Kosten-Endpunkt) |
| Ingress | `/etc/cloudflared/config.yml`: `fink.aiwerke.de → http://localhost:3475` (VOR dem `http_status:404`-Catch-all) |
| DNS | `cloudflared tunnel route dns <tunnel-id> fink.aiwerke.de` (nutzt ~/.cloudflared/cert.pem) |

## Schritte

```bash
# 1 · bun (falls fehlt)
command -v bun >/dev/null || curl -fsSL https://bun.sh/install | bash

# 2 · Code
sudo mkdir -p /opt/eegbot && sudo chown ubuntu:ubuntu /opt/eegbot
git clone https://github.com/joschi655/EEGbot /opt/eegbot 2>/dev/null || git -C /opt/eegbot pull

# 3 · Wissensbasis (einmalig ~2–5 min; bei Gesetzes-Updates wiederholen)
cd /opt/eegbot && bun install && bun run validate:data && bun run build:knowledge && bun run build:eeg2027

# 4 · systemd (Vorlage unten) → enable + start
sudo systemctl daemon-reload && sudo systemctl enable --now eegbot-fink

# 5 · cloudflared: Ingress-Eintrag ergänzen, dann ZWINGEND validieren, dann erst restart
cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate
cloudflared tunnel route dns <tunnel-id> fink.aiwerke.de
sudo systemctl restart cloudflared   # trennt kurz ALLE Tunnel-Dienste inkl. SSH!

# 6 · Proben
curl -s localhost:3475/api/status
curl -sI https://fink.aiwerke.de/app/ | head -3
```

## systemd-Vorlage (`/etc/systemd/system/eegbot-fink.service`)

```ini
[Unit]
Description=EEGbot fink Web-Demo (fink.aiwerke.de)
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/eegbot
ExecStart=/home/ubuntu/.bun/bin/bun ui/server.ts
Environment=PORT=3475
Environment=EEGBOT_PUBLIC=1
Restart=always
RestartSec=3
NoNewPrivileges=true
ProtectSystem=full
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

## Update-Prozess

```bash
git -C /opt/eegbot pull && cd /opt/eegbot && bun install \
  && bun run build:knowledge && bun run build:eeg2027 \
  && sudo systemctl restart eegbot-fink
```

## Gefahren / Gelerntes

- **cloudflared-Restart bricht die eigene SSH-Session** (läuft selbst über den
  Tunnel). Vor jedem Restart: `ingress validate`. Ungültige Config = ausgesperrt
  bis zum physischen Zugriff.
- `.env` (ANTHROPIC_API_KEY) wird NICHT deployed — die öffentliche Instanz
  braucht keinen Key, `EEGBOT_PUBLIC=1` deaktiviert den Intake-Endpunkt.
- Ports 8000/5432 sind auf dem Server belegt (kookoo-rag, Postgres) — deshalb
  läuft die parallel gehostete Supabase auf 8100/5433 (eigenes Setup, nicht
  Teil dieses Repos).
