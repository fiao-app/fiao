/* Fiao · service worker: guarda la app en el celular para que abra sin internet.
   No guarda datos de la libreta (esos viven en IndexedDB) ni toca internet por su cuenta. */
'use strict';

const VERSION = 'fiao-v1.0.1';
const ARCHIVOS = [
  './', './index.html', './manifest.webmanifest', './css/fiao.css',
  './fonts/atkinson-next-400.woff2', './fonts/atkinson-next-700.woff2',
  './vendor/lz-string.min.js',
  './js/util.js', './js/calendario.js', './js/db.js', './js/modelo.js', './js/mensajes.js', './js/demo.js',
  './js/ui.js', './js/vistas-inicio.js', './js/vistas-fiado.js', './js/vistas-cobro.js', './js/app.js', './js/vecino.js',
  './c/', './c/index.html',
  './icons/icono.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  ev.respondWith(
    caches.match(req, { ignoreSearch: true }).then(guardado => {
      const red = fetch(req).then(resp => {
        if (resp && resp.ok) { const copia = resp.clone(); caches.open(VERSION).then(c => c.put(req, copia)); }
        return resp;
      }).catch(() => guardado || (req.mode === 'navigate' ? caches.match(new URL(req.url).pathname.includes('/c/') ? './c/index.html' : './index.html') : undefined));
      return guardado || red;
    })
  );
});
