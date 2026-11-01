import {test, expect, type Page} from '@playwright/test';

async function fits(page:Page) {
  expect(await page.evaluate(() => ({width:innerWidth, content:document.documentElement.scrollWidth}))).toEqual({width:page.viewportSize()!.width,content:page.viewportSize()!.width});
}
async function touchTargets(page:Page, selector:string) {
  const small = await page.locator(selector).evaluateAll(els => els.filter(el => {
    const r=el.getBoundingClientRect(); return r.width>0 && r.height>0 && r.height<44;
  }).map(el=>el.textContent?.trim() || el.getAttribute('aria-label') || el.tagName));
  expect(small).toEqual([]);
}
async function shot(page:Page, name:string) {
  await page.screenshot({path:`/tmp/eegbot-mobile-screenshots/${page.viewportSize()!.width}-${name}.png`,fullPage:true});
}

test('Website: alle Seiten, Formular, Ergebnis und scrollbare Tabelle',async({page})=>{
  const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
  for (const path of ['', 'themen.html','quellen.html','ratgeber/balkonsolar.html','ratgeber/fahrplan.html','ratgeber/orientierung.html']) {
    await page.goto('http://127.0.0.1:4178/EEGbot/'+path); await fits(page);
  }
  await page.goto('http://127.0.0.1:4178/EEGbot/');
  await page.getByRole('button',{name:'Beispielrechnung ansehen'}).tap();
  await page.getByLabel('Strompreis').fill('0.30');
  await page.getByRole('button',{name:'Szenario berechnen'}).tap();
  await expect(page.locator('#summary')).toContainText('98,00');
  await fits(page);
  await touchTargets(page,'button, nav a, summary');
  expect(await page.locator('#handoff').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  const table = page.locator('.table-scroll').first();
  await expect(table).toHaveAttribute('tabindex','0');
  await table.focus(); await page.keyboard.press('ArrowRight');
  await shot(page,'site-result'); expect(errors).toEqual([]);
});

test('App: Landing passt und hat bedienbare Einstiegspunkte',async({page})=>{
  await page.goto('http://127.0.0.1:3479/app/');
  await expect(page.getByRole('button',{name:'App starten',exact:true})).toBeVisible();
  await fits(page); await touchTargets(page,'button, nav a'); await shot(page,'app-landing');
});

test('App: Navigation, Profil, Rechner und Normgraph bleiben mobil bedienbar',async({page})=>{
  const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3479/app/');
  await page.getByRole('button',{name:'App starten',exact:true}).tap();
  await fits(page);
  const nav=async(name:string)=>{
    await page.getByRole('button',{name:'Menü',exact:true}).tap();
    await page.locator('.fk-side__nav').getByRole('button',{name,exact:true}).tap();
    await expect(page.getByRole('button',{name:'Menü',exact:true})).toHaveAttribute('aria-expanded','false');
  };
  await nav('Meine Anlage');
  await page.getByRole('button',{name:'Beispiel-Anlage',exact:true}).tap();
  await page.getByLabel('Bezeichnung',{exact:true}).fill('Mobile Testanlage');
  await page.getByRole('button',{name:'Profil speichern',exact:true}).tap();
  await expect(page.locator('.fink-card__title',{hasText:'Mobile Testanlage'})).toBeVisible();
  await fits(page); await touchTargets(page,'button, select, .fink-input, .fink-switch');
  await shot(page,'app-profile');
  await nav('Vergütung');
  await page.getByRole('button',{name:'Vergütung berechnen'}).tap();
  await expect(page.getByText('Vergütungsstufen',{exact:true})).toBeVisible();
  await fits(page); await shot(page,'app-calculator');
  for(const name of ['Fristen','Rückforderungs-Check','Solarspitzen','Nach der Förderung','Förder-Fahrplan','Recherche','Norm-Graph']) {
    await nav(name); await fits(page);
  }
  await expect(page.getByRole('slider',{name:'Stichtag der Gesetzesfassung'})).toBeVisible();
  expect(await page.locator('canvas').evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThan(250);
  await shot(page,'app-graph'); expect(errors).toEqual([]);
});
