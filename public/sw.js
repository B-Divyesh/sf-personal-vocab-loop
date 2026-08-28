const VERSION = 'vocab-loop-v2';
const SHELL = ['/', '/index.html', '/assets/app.js', '/assets/index.css', '/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png', '/voice-orbit.webp'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') { event.respondWith(caches.match('/index.html').then((cached) => cached || fetch(event.request))); return; }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => { const copy = response.clone(); caches.open(VERSION).then((cache) => cache.put(event.request, copy)); return response; }).catch(() => caches.match('/index.html'))));
});
