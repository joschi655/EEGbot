import {expect, test} from 'bun:test';
import {auditSite} from '../scripts/check-site.ts';
import {mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('öffentlicher Ausgabeordner besteht Allowlist und interne Links', async () => {
  expect(await auditSite(new URL('../site', import.meta.url).pathname)).toEqual([]);
});
test('zusätzliche private Dateien werden abgelehnt', async () => {
  const root = await mkdtemp(join(tmpdir(),'eegbot-site-'));
  try {
    await mkdir(join(root,'dokumente'));
    await writeFile(join(root,'dokumente','rechnung.pdf'),'synthetic test');
    expect((await auditSite(root)).some(e => e.includes('rechnung.pdf'))).toBe(true);
  } finally {await rm(root,{recursive:true,force:true});}
});
