import type { Foerderprogramm } from "../schemas/program.ts";

/** Source retrieval is NOT semantic verification. Never refresh the review date automatically. */
export function programmWarnungen(p: Foerderprogramm, heute = new Date().toISOString().slice(0, 10)): string[] {
 const warnungen: string[] = [];
 const wechsel = p.richtlinie?.naechste_fassung_gueltig_ab;
 if (wechsel && wechsel <= heute && p.zuletzt_geprueft < wechsel) {
  warnungen.push(`Aktualität: ${p.name} ist für Anträge ab ${wechsel} nicht vollständig verifiziert. Keine aktuelle Förderquote oder Zuschuss-Schätzung verfügbar. ${p.richtlinie?.hinweis ?? "Aktuelles Merkblatt beim Träger prüfen."}`);
 } else if (!p.zuletzt_geprueft || p.zuletzt_geprueft > heute || Date.parse(heute) - Date.parse(p.zuletzt_geprueft) > 30 * 86400000) {
  warnungen.push(`Aktualität: ${p.name} — letzter Gesamtprüfstand ${p.zuletzt_geprueft || "fehlt"}; Aktualität nicht bestätigt. Vor Antragstellung aktuelle Trägerquelle prüfen.`);
 }
 return warnungen;
}

export function programmBerechnungOffen(p: Foerderprogramm, heute = new Date().toISOString().slice(0, 10)): boolean {
 const wechsel = p.richtlinie?.naechste_fassung_gueltig_ab;
 return Boolean(wechsel && wechsel <= heute && p.zuletzt_geprueft < wechsel);
}
