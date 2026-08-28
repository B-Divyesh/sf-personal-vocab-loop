import { createServer, type Server } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { expect, test } from 'playwright/test';

const oldIndex = '<!doctype html><html lang="en"><head><title>Previous Vocab Loop</title></head><body><h1>Previous release shell</h1><script type="module" src="/assets/legacy.js"></script></body></html>';
const oldWorker = `const CACHE='vocab-loop-v2';const SHELL=['/','/index.html','/assets/legacy.js'];self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;if(event.request.mode==='navigate'){event.respondWith(caches.match('/index.html').then(cached=>cached||fetch(event.request)));return}event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)))})`;

let server: Server;
let origin = '';
let upgraded = false;

test.beforeAll(async () => {
  server = createServer((request, response) => {
    if (request.url === '/__upgrade' && request.method === 'POST') {
      upgraded = true;
      response.writeHead(204).end();
      return;
    }
    const pathname = new URL(request.url || '/', 'http://local').pathname;
    if (!upgraded) {
      response.setHeader('Cache-Control', 'no-store');
      if (pathname === '/sw.js') { response.setHeader('Content-Type', 'text/javascript'); response.end(oldWorker); }
      else if (pathname === '/assets/legacy.js') { response.setHeader('Content-Type', 'text/javascript'); response.end('document.documentElement.dataset.release="old"'); }
      else { response.setHeader('Content-Type', 'text/html'); response.end(oldIndex); }
      return;
    }
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '').replace(/\/$/, '/index.html');
    const file = normalize(join(process.cwd(), 'dist', relative));
    try {
      if (!file.startsWith(join(process.cwd(), 'dist')) || !statSync(file).isFile()) throw new Error('not found');
      const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
      response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
      response.setHeader('Cache-Control', pathname === '/sw.js' ? 'no-store' : 'no-cache');
      response.end(readFileSync(file));
    } catch {
      response.writeHead(404).end('not found');
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('upgrade server did not bind');
  origin = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

test('an installed previous release discovers and activates the new offline shell', async ({ page }) => {
  await page.goto(origin);
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Previous release shell' })).toBeVisible();

  await page.evaluate(() => fetch('/__upgrade', { method: 'POST' }));
  const outcome = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) throw new Error('old worker was not registered');
    const installed = new Promise<string>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('no service-worker update event')), 10_000);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'activated') { window.clearTimeout(timeout); resolve(worker.state); }
        });
      });
    });
    await registration.update();
    return installed;
  });
  expect(outcome).toBe('activated');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Make the words you want to say come back.' })).toBeVisible();
});
