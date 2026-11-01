import { expect, test } from "bun:test";
import { matcheProgramme } from "./foerderMatcher.ts";
import { erstelleFahrplan, renderFahrplanMarkdown } from "./fahrplan.ts";
import { programmauskunft } from "./programmauskunft.ts";
import { programmWarnungen, programmBerechnungOffen } from "./freshness.ts";
import { ladeProgramme } from "./foerderMatcher.ts";
import { handleRequest } from "../../ui/server.ts";
import { berechneVerguetung } from "./verguetung.ts";

test("fehlender, alter und zukünftiger Prüfstand werden nicht als frisch ausgegeben", async () => {
 const p = (await ladeProgramme()).find(p => p.id === "kfw-458")!;
 for (const stand of ["", "2026-06-01", "2027-01-01"]) {
  expect(programmWarnungen({ ...p, richtlinie: undefined, zuletzt_geprueft: stand }, "2026-11-01").join(" ")).toMatch(/Aktualität/);
 }
 expect(programmWarnungen({ ...p, richtlinie: undefined, zuletzt_geprueft: "2026-11-01" }, "2026-11-01")).toEqual([]);
 expect(programmBerechnungOffen(p, "2026-07-20")).toBe(false);
 expect(programmBerechnungOffen(p, "2026-07-21")).toBe(true);
});
test("REST-Fahrplan transportiert Warnung an Nutzer und BAFA unterdrückt alte Quote", async () => {
 const res = await handleRequest(new Request("http://localhost/api/fahrplan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fall }) }));
 expect(res.status).toBe(200);
 expect(JSON.stringify(await res.json())).toMatch(/Aktualität/);
 const m = (await matcheProgramme({ ...fall, massnahme: { typ: "daemmung", begonnen: false } })).find(m => m.programm_id === "bafa-beg-em")!;
 expect(m.foerdersatz_prozent).toBeUndefined();
 expect(m.hinweise.join(" ")).toMatch(/nicht vollständig verifiziert/);
});

const fall = { massnahme: { typ: "waermepumpe", begonnen: false, ersetzt_fossile_heizung: true, kosten_eur: 42000 }, gebaeude: { bestandsgebaeude: true }, antragsteller: { selbstnutzend: true, haushaltseinkommen_eur: 25000 } };
test("unvollständig migrierte BEG-Novelle liefert Warnung statt alter Förderquote", async () => {
 const m = (await matcheProgramme(fall)).find(x => x.programm_id === "kfw-458")!;
 expect(m.hinweise.join(" ")).toMatch(/Aktualität.*nicht.*verifiziert/);
 expect(m.foerdersatz_prozent).toBeUndefined();
 expect(m.saetze).toEqual([]);
});
test("Fahrplan und Markdown zeigen Aktualitätswarnung, keine alte Euro-Schätzung", async () => {
 const f = await erstelleFahrplan(fall);
 expect(f.warnungen.join(" ")).toMatch(/Aktualität/);
 expect(f.empfehlung?.betrag_eur_geschaetzt).toBeUndefined();
 expect(f.empfehlung?.hoechstkosten_eur).toBeUndefined();
 expect(f.empfehlung?.kosten_angesetzt_eur).toBeUndefined();
 expect(renderFahrplanMarkdown(f)).toMatch(/Aktualität/);
});
test("Programmauskunft zeigt fehlende Gesamtverifikation ausdrücklich", async () => {
 const r = await programmauskunft({ programm_ids: ["kfw-458", "bafa-beg-em"] });
 for (const p of Object.values(r)) expect(p.warnungen.join(" ")).toMatch(/Aktualität/);
});
test("amtliche Augustwerte und begrenztes Zeitfenster für beide Einspeisearten", async () => {
 for (const [art, werte] of [["teileinspeisung", [7.70,6.66,5.44]], ["volleinspeisung", [12.22,10.24,10.24]]] as const) {
  for (const datum of ["2026-08-01", "2026-11-01", "2026-12-31"]) {
   const r = await berechneVerguetung({ ibn_datum: datum, leistung_kwp: 100, einspeiseart: art });
   expect(r.stufen.map(s => s.satz_ct_kwh)).toEqual([...werte]);
   expect(r.parameterstand.gueltig_bis).toBe("2026-12-31");
  }
  await expect(berechneVerguetung({ ibn_datum: "2027-01-01", leistung_kwp: 10, einspeiseart: art })).rejects.toThrow(/Parameterstand/);
 }
});
