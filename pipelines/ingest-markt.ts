#!/usr/bin/env bun
/**
 * Markt-Pipeline: prüft die lokal gepflegten Marktwerte
 * (`data/parameters/markt.jahresmarktwert_solar.yaml`) gegen Live-Quellen.
 *
 * Quellenlage (ehrlich):
 * - Jahres-/Monatsmarktwert Solar publizieren die ÜNB auf netztransparenz.de.
 *   Die maschinenlesbare API (api.netztransparenz.de) erfordert kostenlose
 *   Registrierung → Client-Credentials. Mit NT_CLIENT_ID/NT_CLIENT_SECRET
 *   in der Umgebung zieht diese Pipeline die Werte automatisch.
 * - Ohne Credentials: SMARD-Großhandelspreise (frei, BNetzA) als
 *   Plausibilitäts-Signal + klare Anleitung, welche Werte manuell zu
 *   verifizieren sind.
 *
 * WICHTIG: Parameter-Perioden sind append-only. Diese Pipeline ÄNDERT nie
 * selbst Werte — sie meldet Abweichungen, der Mensch committet.
 */
import { parse } from "yaml";

const REPO = new URL("..", import.meta.url).pathname;
const PARAM_PFAD = `${REPO}data/parameters/markt.jahresmarktwert_solar.yaml`;

async function smardMonatsdurchschnitt(): Promise<{ monat: string; eur_mwh: number }[]> {
  // SMARD Filter 4169 = Großhandelspreis DE/LU, Auflösung Monat
  const idx = (await (await fetch("https://www.smard.de/app/chart_data/4169/DE/index_month.json")).json()) as { timestamps: number[] };
  const letzter = idx.timestamps[idx.timestamps.length - 1];
  const data = (await (
    await fetch(`https://www.smard.de/app/chart_data/4169/DE/4169_DE_month_${letzter}.json`)
  ).json()) as { series: [number, number | null][] };
  return data.series
    .filter(([, v]) => v !== null)
    .slice(-12)
    .map(([ts, v]) => ({ monat: new Date(ts).toISOString().slice(0, 7), eur_mwh: Math.round((v as number) * 100) / 100 }));
}

async function netztransparenzJahresmarktwerte(clientId: string, clientSecret: string): Promise<Record<string, number> | null> {
  const tokenRes = await fetch("https://identity.netztransparenz.de/users/connect/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret, scope: "webapi" }),
  });
  if (!tokenRes.ok) throw new Error(`netztransparenz OAuth HTTP ${tokenRes.status}`);
  const { access_token } = (await tokenRes.json()) as { access_token: string };
  // Jahresmarktwerte: Datenprodukt "Jahresmarktwerte" der NT-Web-API
  const res = await fetch("https://ds.netztransparenz.de/api/v1/data/Jahresmarktwerte", {
    headers: { authorization: `Bearer ${access_token}` },
  });
  if (!res.ok) {
    console.error(`netztransparenz Daten-API HTTP ${res.status} — Endpunktname ggf. gegen API-Doku prüfen (https://api-portal.netztransparenz.de)`);
    return null;
  }
  const csv = await res.text();
  // CSV: Zeilen mit Jahr;…;MW Solar;… — defensiv parsen
  const werte: Record<string, number> = {};
  for (const zeile of csv.split("\n")) {
    const m = zeile.match(/(20\d\d)[;,].*?[Ss]olar[^0-9-]*([0-9]+[.,][0-9]+)/);
    if (m?.[1] && m[2]) werte[m[1]] = Number(m[2].replace(",", "."));
  }
  return Object.keys(werte).length ? werte : null;
}

async function main() {
  const yamlText = await Bun.file(PARAM_PFAD).text();
  const param = parse(yamlText) as { zeitraeume: { gueltig_von: string; gueltig_bis?: string; wert: number; hinweis?: string }[] };
  console.log("Lokale Jahresmarktwerte Solar (ct/kWh):");
  for (const p of param.zeitraeume)
    console.log(`  ${p.gueltig_von} – ${p.gueltig_bis ?? "offen"}: ${p.wert} ct/kWh${p.hinweis?.includes("ZU VERIFIZIEREN") ? "  ⚠ ZU VERIFIZIEREN" : ""}`);
  const zuVerifizieren = yamlText.split("\n").filter((z) => z.includes("ZU VERIFIZIEREN"));
  if (zuVerifizieren.length) {
    console.log(`\n⚠ ${zuVerifizieren.length} Zeile(n) mit ZU VERIFIZIEREN-Marker:`);
    for (const z of zuVerifizieren) console.log(`  ${z.trim()}`);
  }

  const ntId = process.env.NT_CLIENT_ID;
  const ntSecret = process.env.NT_CLIENT_SECRET;
  if (ntId && ntSecret) {
    try {
      const werte = await netztransparenzJahresmarktwerte(ntId, ntSecret);
      if (werte) {
        console.log("\nnetztransparenz.de Jahresmarktwerte Solar (€/MWh → ct/kWh = /10):");
        for (const [jahr, w] of Object.entries(werte)) console.log(`  ${jahr}: ${w} → ${(w / 10).toFixed(2)} ct/kWh`);
        console.log("Abweichungen gegen data/parameters/ manuell prüfen und per neuem Perioden-Eintrag committen (append-only).");
      }
    } catch (e) {
      console.error(`netztransparenz nicht erreichbar: ${e instanceof Error ? e.message : e}`);
    }
  } else {
    console.log("\nHinweis: NT_CLIENT_ID/NT_CLIENT_SECRET nicht gesetzt — kostenlose Registrierung unter");
    console.log("https://api-portal.netztransparenz.de für den automatischen Jahresmarktwert-Abgleich.");
  }

  try {
    const monate = await smardMonatsdurchschnitt();
    console.log("\nSMARD-Großhandelspreis DE/LU, letzte 12 Monate (€/MWh, Plausibilitäts-Signal — NICHT der Marktwert Solar):");
    for (const m of monate) console.log(`  ${m.monat}: ${m.eur_mwh}`);
  } catch (e) {
    console.error(`SMARD nicht erreichbar: ${e instanceof Error ? e.message : e}`);
  }
}

await main();
