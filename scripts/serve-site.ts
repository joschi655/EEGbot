// Entwicklungs-/Testserver: ausschließlich site/, auf Loopback, ohne API.
import {resolve, sep} from 'node:path';
const root = resolve(import.meta.dir, '../site');
Bun.serve({hostname:'127.0.0.1', port:4178, async fetch(req) {
  let path: string;
  try { path = decodeURIComponent(new URL(req.url).pathname); } catch {return new Response('Bad request', {status:400});}
  if (!path.startsWith('/EEGbot/')) return new Response('Not found', {status:404});
  const relative = path.slice('/EEGbot/'.length);
  const filePath = resolve(root, relative.endsWith('/') || !relative ? relative + 'index.html' : relative);
  if (!filePath.startsWith(root + sep)) return new Response('Forbidden', {status:403});
  const file = Bun.file(filePath);
  return await file.exists() ? new Response(file) : new Response('Not found', {status:404});
}});
console.log('Static preview: http://127.0.0.1:4178/EEGbot/');
