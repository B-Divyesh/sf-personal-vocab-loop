import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

const publicShell = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png', '/voice-orbit.webp', '/legal.css', '/privacy/', '/terms/'];

function previewRoutes(): Plugin {
  const pageRoutes = new Set(['/', '/demo', '/privacy', '/privacy/', '/terms', '/terms/', '/404', '/404/']);
  return {
    name: 'preview-routes',
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url || '/', 'http://local').pathname;
        if (pageRoutes.has(pathname) || pathname.includes('.')) return next();
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(readFileSync('dist/404/index.html'));
      });
    }
  };
}

function serviceWorker(version: string, generatedShell: string[]): string {
  const shell = [...new Set([...publicShell, ...generatedShell])];
  return `const CACHE = 'vocab-loop-${version}';
const CACHE_PREFIX = 'vocab-loop-';
const SHELL = ${JSON.stringify(shell)};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request)
      .then(async (response) => {
        if (response.ok) await caches.open(CACHE).then((cache) => cache.put('/index.html', response.clone()));
        return response;
      })
      .catch(() => caches.match('/index.html', { ignoreVary: true })));
    return;
  }
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then(async (response) => {
    if (response.ok) await caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
`;
}

function versionedServiceWorker(): Plugin {
  return {
    name: 'versioned-service-worker',
    generateBundle(_options, bundle) {
      const generatedShell = Object.keys(bundle)
        .filter((name) => name === 'index.html' || name.startsWith('assets/'))
        .map((name) => `/${name}`);
      const fingerprint = createHash('sha256');
      for (const name of generatedShell.sort()) {
        const item = bundle[name.slice(1)];
        fingerprint.update(name);
        if (item) fingerprint.update(item.type === 'asset' ? item.source : item.code);
      }
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: serviceWorker(fingerprint.digest('hex').slice(0, 16), generatedShell) });
    }
  };
}

export default defineConfig({
  plugins: [previewRoutes(), versionedServiceWorker()],
  build: {
    target: 'es2022',
    rollupOptions: { output: { entryFileNames: 'assets/app-[hash].js', chunkFileNames: 'assets/[name]-[hash].js', assetFileNames: 'assets/[name]-[hash][extname]' } }
  },
  server: { host: '0.0.0.0' },
  test: { exclude: ['e2e/**', 'node_modules/**'] }
});
