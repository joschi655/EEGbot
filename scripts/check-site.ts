import {readdir, readFile, lstat} from 'node:fs/promises';
import {join, resolve, dirname, relative} from 'node:path';
const PUBLIC_FILES = new Set(['.nojekyll','index.html','themen.html','quellen.html','ratgeber/orientierung.html','ratgeber/balkonsolar.html','ratgeber/fahrplan.html','assets/site.css','assets/app.js','assets/calculator.js']);
/** Fail closed: only reviewed public files, no symlinks or remote embedded assets. */
export async function auditSite(root: string): Promise<string[]> {
  root = resolve(root);
  const errors: string[] = [], seen = new Set<string>();
  async function walk(dir: string) {
    for (const entry of await readdir(dir,{withFileTypes:true})) {
      const path = join(dir,entry.name), name = relative(root,path).replaceAll('\\','/');
      if ((await lstat(path)).isSymbolicLink()) {errors.push(`Symlink: ${name}`);continue;}
      if (entry.isDirectory()) {await walk(path);continue;}
      seen.add(name);
      if (!PUBLIC_FILES.has(name)) {errors.push(`Nicht freigegeben: ${name}`);continue;}
      const text = await readFile(path,'utf8');
      if (/-----BEGIN .*PRIVATE KEY-----|sk-ant-[a-zA-Z0-9-]+|github_pat_[a-zA-Z0-9_]+/.test(text)) errors.push(`Secret-Muster: ${name}`);
      if (name.endsWith('.html')) {
        for (const match of text.matchAll(/(?:href|src)="([^"]+)"/g)) {
          const value = match[1]!;
          if (/^(https?:|mailto:)/.test(value)) continue;
          const [file,fragment] = value.split('#');
          const target = resolve(dirname(path), file || name.split('/').at(-1)!);
          if (!PUBLIC_FILES.has(relative(root,target).replaceAll('\\','/'))) {errors.push(`Unzulässiger Link: ${name} → ${value}`);continue;}
          try {
            const content = await readFile(target,'utf8');
            if (fragment && !content.includes(`id="${fragment}"`)) errors.push(`Fehlender Anker: ${name} → ${value}`);
          } catch {errors.push(`Fehlendes Ziel: ${name} → ${value}`);}
        }
        if (/<(?:script|iframe|img)[^>]+src="https?:|<link[^>]+href="https?:/i.test(text)) errors.push(`Extern eingebettete Ressource: ${name}`);
      }
      if (name.endsWith('.css') && /@import|url\(\s*['"]?https?:/i.test(text)) errors.push(`Externe CSS-Ressource: ${name}`);
    }
  }
  await walk(root);
  for (const name of PUBLIC_FILES) if (!seen.has(name)) errors.push(`Fehlende öffentliche Datei: ${name}`);
  return errors;
}
if (import.meta.main) {
  const errors = await auditSite(new URL('../site',import.meta.url).pathname);
  if (errors.length) {console.error(errors.join('\n'));process.exitCode=1;}
  else console.log(`Site audit OK: ${PUBLIC_FILES.size} freigegebene Dateien; relative Links/Anker geprüft. Kein Ersatz für manuelle Inhalts-/Secret-Prüfung.`);
}
