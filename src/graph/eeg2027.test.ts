/**
 * Vollständigkeits-Invariante der EEG-2027-Zeitmaschine (Forge-Fund 2026-07-11):
 * Der Entwurfs-Snapshot muss ein Overlay über den letzten Voll-Snapshot sein —
 * geschlossen (fassung_bis = 2027-01-01) werden GENAU die kuratierten
 * ersetzen/aufheben-Normen; alle unveränderten Normen bleiben offen. Ein
 * versehentlicher Teil-Snapshot würde hier sofort auffallen. Läuft nur, wenn
 * build:eeg2027 lokal gelaufen ist.
 */
import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";

const DB_PFAD = new URL("../../knowledge/normgraph.sqlite", import.meta.url).pathname;
const ENTWURF_PFAD = new URL("../../data/entwuerfe/eeg-2027-refe.json", import.meta.url).pathname;

let entwurfImGraph = false;
let db: Database | null = null;
if (await Bun.file(DB_PFAD).exists()) {
  db = new Database(DB_PFAD, { readonly: true });
  const r = db
    .query<{ c: number }, []>("SELECT COUNT(*) c FROM expression WHERE slug = 'eeg_2014' AND fassung_von = '2027-01-01'")
    .get();
  entwurfImGraph = (r?.c ?? 0) > 0;
}

const entwurfPflicht = process.env.REQUIRE_EEG2027 === "1";

(entwurfImGraph || entwurfPflicht ? describe : describe.skip)("EEG-2027-Entwurf: Vollständigkeits-Invariante", () => {
  test("Entwurf ist im Normgraph vorhanden (CI darf nicht still skippen)", () => {
    expect(entwurfImGraph).toBe(true);
    expect(db).not.toBeNull();
  });

  test("geschlossen werden genau die kuratierten ersetzen/aufheben-Normen", async () => {
    const entwurf = (await Bun.file(ENTWURF_PFAD).json()) as { aenderungen: { aktion: string }[] };
    const erwartet = entwurf.aenderungen.filter((a) => a.aktion !== "neu").length;
    const geschlossen = db!
      .query<{ c: number }, []>("SELECT COUNT(*) c FROM expression WHERE slug = 'eeg_2014' AND fassung_bis = '2027-01-01'")
      .get()!.c;
    expect(geschlossen).toBe(erwartet);
  });

  test("alle Entwurfs-Expressions tragen den ENTWURF-Marker im Titel", () => {
    const ohneMarker = db!
      .query<{ c: number }, []>(
        "SELECT COUNT(*) c FROM expression WHERE slug = 'eeg_2014' AND fassung_von = '2027-01-01' AND (titel IS NULL OR titel NOT LIKE '[ENTWURF%')",
      )
      .get()!.c;
    expect(ohneMarker).toBe(0);
  });

  test("unveränderte Kern-Normen bleiben offen (kein Teil-Snapshot-Leak)", () => {
    for (const enbez of ["§ 24", "§ 52", "§ 100"]) {
      const offen = db!
        .query<{ c: number }, [string]>(
          "SELECT COUNT(*) c FROM expression WHERE slug = 'eeg_2014' AND enbez = ? AND fassung_bis IS NULL",
        )
        .get(enbez)!.c;
      expect(offen).toBe(1);
    }
  });
});
