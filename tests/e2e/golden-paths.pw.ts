import { expect, test, type Page } from "@playwright/test";

async function starteApp(page: Page) {
  await page.goto("/app/");
  await page.getByRole("button", { name: "App starten", exact: true }).click();
  // Auf schmalen Ansichten ist der Navigationspunkt "Übersicht" eingeklappt;
  // sichtbar bleibt die Titelzeile der Übersicht.
  await expect(page.locator(".fk-top__title", { hasText: "Übersicht" })).toBeVisible();
}

/** Navigation liegt auf schmalen Ansichten hinter dem Menü-Umschalter. */
async function klickNav(page: Page, name: string) {
  const menue = page.getByRole("button", { name: "Menü", exact: true });
  const nav = page.locator(".fk-side__nav").getByRole("button", { name });
  if ((await menue.count()) && (await menue.isVisible()) && !(await nav.first().isVisible())) {
    await menue.click();
    await expect(menue).toHaveAttribute("aria-expanded", "true");
  }
  await nav.first().click();
  if ((await menue.count()) && (await menue.isVisible())) await expect(menue).toHaveAttribute("aria-expanded", "false");
}

test("45.540-Euro-Forderung wird auf 6.417 Euro mit Monatsbelegen gerechnet", async ({ page }) => {
  await starteApp(page);
  await klickNav(page, "Rückforderungs-Check");
  await page.getByRole("button", { name: /Beispielfall laden/ }).click();

  await expect(page.getByText("6.417 €", { exact: true })).toBeVisible();
  await expect(page.getByText("45.540 €", { exact: true })).toBeVisible();
  await expect(page.getByText(/Monatsaufstellung/)).toBeVisible();
  await expect(page.getByText("So wurde gerechnet", { exact: true })).toBeVisible();
});

test("9,8-kWp-Profil speist Vergütung und Fristen konsistent", async ({ page }) => {
  await starteApp(page);
  await klickNav(page, "Meine Anlage");
  await page.getByRole("button", { name: "Beispiel-Anlage" }).click();

  await klickNav(page, "Vergütung");
  await page.getByRole("button", { name: "Vergütung berechnen" }).click();
  await expect(page.getByText(/8,2/).first()).toBeVisible();
  await expect(page.getByText("So wurde gerechnet", { exact: true })).toBeVisible();

  await klickNav(page, "Fristen");
  await expect(page.getByText("MaStR-Registrierung der Anlage", { exact: true })).toBeVisible();
  await expect(page.getByText("Erledigt", { exact: true }).first()).toBeVisible();

  await klickNav(page, "Förder-Fahrplan");
  await page.getByPlaceholder(/Wir tauschen die Gasheizung/).fill("Privater Testtext für die Vorschau");
  await page.getByRole("button", { name: "Übertragung prüfen" }).click();
  await expect(page.getByText(/Empfänger:/)).toContainText("Anthropic API");
  const senden = page.getByRole("button", { name: "Mit KI vorbefüllen" });
  await expect(senden).toBeDisabled();
  await page.getByLabel(/Ich habe die Vorschau geprüft/).check();
  await expect(senden).toBeEnabled();
});

test("Ü20 zeigt echte Optionen und strukturierte Quellen nur nach Förderende", async ({ page }) => {
  await starteApp(page);
  await klickNav(page, "Nach der Förderung");
  await page.getByLabel("Inbetriebnahmedatum").fill("2005-06-01");
  await page.getByLabel("Leistung").fill("5");
  await page.getByRole("button", { name: "Optionen vergleichen" }).click();

  await expect(page.getByText(/Ausgefördert seit/)).toBeVisible();
  await expect(page.getByText("Anschlussvergütung (Volleinspeisung weiterlaufen lassen)", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /§ 25 EEG \(Vergütungsdauer\)/ }).first()).toBeVisible();
  await expect(page.getByText("So wurde gerechnet", { exact: true })).toBeVisible();
});

test("Solarspitzen-Check zeigt für eine 2025er 9,8-kWp-Anlage die exakte 60-%-Grenze", async ({ page }) => {
  await starteApp(page);
  await klickNav(page, "Meine Anlage");
  await page.getByRole("textbox", { name: "Bezeichnung" }).fill("Solarspitzen-Demo");
  await page.getByRole("spinbutton", { name: "Leistung", exact: true }).fill("9.8");
  await page.getByRole("textbox", { name: "Inbetriebnahme" }).fill("2025-03-01");
  await page.getByRole("button", { name: "Profil speichern" }).click();

  await klickNav(page, "Solarspitzen");
  await expect(page.getByText("60 % Begrenzung", { exact: true })).toBeVisible();
  await expect(page.getByTestId("solarspitzen-max")).toContainText("5,88");
  await expect(page.getByTestId("solarspitzen-negative")).toContainText("Noch ausgenommen");
  await expect(page.getByText("So wurde gerechnet", { exact: true })).toBeVisible();
});
