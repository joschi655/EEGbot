import { describe, expect, test } from "bun:test";

async function ladeProfilApi(initial: Record<string, string> = {}) {
  const daten = new Map(Object.entries(initial));
  const localStorage = {
    getItem: (key: string) => daten.get(key) ?? null,
    setItem: (key: string, value: string) => daten.set(key, value),
    removeItem: (key: string) => daten.delete(key),
  };
  const windowObj: Record<string, unknown> = {};
  const source = await Bun.file(new URL("./profil.js", import.meta.url)).text();
  new Function("window", "localStorage", source)(windowObj, localStorage);
  return { api: windowObj.EEGBOT_PROFIL as any, daten };
}

const gueltig = {
  name: "Altprofil",
  energietraeger: "solar",
  anlagentyp: "dach",
  leistung_kwp: 9.8,
  ibn_datum: "2024-01-31",
  einspeiseart: "teileinspeisung",
  mastr_registriert: true,
  veraeusserungsform_gemeldet: true,
};

describe("versioniertes Browserprofil", () => {
  test("migriert ein valides v1-Profil nach v3 und ergänzt Solarspitzen-Felder", async () => {
    const { api, daten } = await ladeProfilApi({ "eegbot.anlage.v1": JSON.stringify(gueltig) });
    const profil = api.lade();
    expect(profil.schema_version).toBe(3);
    expect(profil.vermarktungsform).toBe("einspeiseverguetung");
    expect(profil.steuerungseinrichtung_vorhanden).toBe(false);
    expect(profil.ansteuerbarkeit_getestet).toBe(false);
    expect(daten.has("eegbot.anlage.v1")).toBe(false);
    expect(daten.has("eegbot.anlage.v3")).toBe(true);
  });

  test("verwirft ungültige Altwerte statt sie an Rechner zu senden", async () => {
    const { api, daten } = await ladeProfilApi({ "eegbot.anlage.v1": JSON.stringify({ ...gueltig, leistung_kwp: -5 }) });
    expect(api.lade()).toBeNull();
    expect(daten.has("eegbot.anlage.v1")).toBe(false);
  });

  test("entfernt auch syntaktisch kaputte Altprofile", async () => {
    const { api, daten } = await ladeProfilApi({ "eegbot.anlage.v1": "{" });
    expect(api.lade()).toBeNull();
    expect(daten.has("eegbot.anlage.v1")).toBe(false);
  });

  test("weist Nullleistung und ungültige Enums beim Speichern zurück", async () => {
    const { api } = await ladeProfilApi();
    expect(() => api.speichere({ ...gueltig, leistung_kwp: 0 })).toThrow(/größer als 0/);
    expect(() => api.speichere({ ...gueltig, einspeiseart: "falsch" })).toThrow(/Einspeiseart/);
    expect(() => api.speichere({ ...gueltig, vermarktungsform: "falsch" })).toThrow(/Vermarktungsform/);
  });

  test("weist widersprüchlichen Solarspitzen-Technikstatus zurück", async () => {
    const { api } = await ladeProfilApi();
    expect(() => api.speichere({ ...gueltig, imsys_vorhanden: false, imsys_einbau_datum: "2026-01-10" })).toThrow(/vorhandenes iMSys/);
    expect(() => api.speichere({ ...gueltig, imsys_vorhanden: true, steuerungseinrichtung_vorhanden: false, ansteuerbarkeit_getestet: true })).toThrow(/Testung/);
  });
});
