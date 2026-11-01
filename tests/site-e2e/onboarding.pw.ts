import { test, expect } from '@playwright/test';

test('Montage-STOP, separater Demo-Modus, Ergebnis und Rückkehr', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/EEGbot/');
  await page.getByRole('link', {name: 'Balkonsolar-Vorabcheck starten'}).click();
  await page.getByLabel('Nein, keine geeignete Fläche').check();
  await page.getByRole('button', {name: 'Antwort prüfen'}).click();
  await expect(page.getByRole('heading', {name: 'STOP: Erst den Montageort klären'})).toBeVisible();
  await expect(page.locator('#scenario')).toBeHidden();
  await page.getByLabel('Unklar, noch nicht geprüft').check();
  await page.getByRole('button', {name: 'Antwort prüfen'}).click();
  await expect(page.locator('#scenario')).toBeHidden();
  await page.getByRole('button', {name: 'Beispielrechnung ansehen'}).click();
  await expect(page.locator('#mode')).toContainText('Synthetische Demo');
  await page.getByRole('button', {name: 'Szenario berechnen'}).click();
  await expect(page.locator('#summary')).toContainText('98,00');
  await expect(page.locator('#handoff')).toHaveValue(/Synthetische Demo/);
  await page.getByLabel('Strompreis').fill('0');
  await expect(page.locator('#result')).toBeHidden();
  await page.getByRole('button', {name: 'Szenario berechnen'}).click();
  await expect(page.locator('#summary')).toContainText('Keine einfache Amortisation');
  await page.getByRole('button', {name: 'Zurück zur Montagefrage'}).click();
  await expect(page.locator('#result')).toBeHidden();
  await expect(page.locator('#scenario')).toBeHidden();
  expect(errors).toEqual([]);
});

test('persönlicher Pfad ohne vorbelegte Annahmen und ohne Datenverkehr', async ({page}) => {
  const outside: string[] = [];
  page.on('request', r => {if (!r.url().startsWith('http://127.0.0.1:4178/')) outside.push(r.url());});
  await page.goto('/EEGbot/');
  await page.getByLabel('Ja, eine geeignete und gesicherte Fläche ist geklärt').check();
  await page.getByRole('button', {name: 'Antwort prüfen'}).click();
  await expect(page.getByLabel('Jahresertrag')).toHaveValue('');
  for (const [id,value] of Object.entries({annualYield:'600',selfConsumption:'60',electricityPrice:'0.30',investment:'600',annualCosts:'10'})) await page.locator('#'+id).fill(value);
  await page.getByRole('button', {name: 'Szenario berechnen'}).click();
  await expect(page.locator('#summary')).toContainText('98,00');
  await expect(page.locator('#handoff')).toHaveValue(/Eigene Szenarioannahmen/);
  await page.emulateMedia({media:'print'});
  await expect(page.locator('#result')).toBeVisible();
  await page.emulateMedia({media:'screen'});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(outside).toEqual([]);
});

test('Installationsauftrag lässt sich kopieren', async ({page, context}) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/EEGbot/');
  await page.getByRole('button', {name:'Installationssatz kopieren'}).click();
  await expect(page.locator('#install-status')).toHaveText('Installationssatz kopiert.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('https://github.com/joschi655/EEGbot');
});

test('Ratgeber und Themen-Checklisten sind erreichbar', async ({page}) => {
  await page.goto('/EEGbot/');
  await page.getByRole('link', {name:'PV-Dach: Fragen sortieren'}).click();
  await expect(page.locator('#pv')).toBeVisible();
  await page.goto('/EEGbot/ratgeber/balkonsolar.html');
  await expect(page.getByRole('heading', {level:1})).toContainText('Balkon');
  await page.getByRole('link', {name:'Zum Vorabcheck'}).click();
  await expect(page.locator('#check')).toBeVisible();
});
