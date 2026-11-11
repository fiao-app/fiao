/* Fiao · service worker: guarda la app en el celular para que abra sin internet.
   No guarda datos de la libreta (esos viven en IndexedDB) ni toca internet por su cuenta. */
'use strict';

const VERSION = 'fiao-v3.5.2';
/* La voz vive en su propio cajón: no se vuelve a bajar con cada versión de la app.
   Si cambia una grabación, se sube este número. */
const VOZ_CACHE = 'fiao-voz-4';
const ARCHIVOS = [
  './', './index.html', './manifest.webmanifest', './css/fiao.css',
  './fonts/figtree-400.woff2', './fonts/figtree-600.woff2', './fonts/jakarta-700.woff2', './fonts/jakarta-800.woff2',
  './vendor/lz-string.min.js',
  './js/util.js', './js/calendario.js', './js/db.js', './js/modelo.js', './js/mensajes.js', './js/demo.js',
  './js/ui.js', './js/movimiento.js', './js/guia.js', './js/voz.js', './js/ilustraciones.js', './js/vistas-inicio.js', './js/vistas-fiado.js', './js/vistas-cobro.js', './js/vistas-mas.js', './js/app.js', './js/vecino.js',
  './c/', './c/index.html',
  // Voz de Fiao: solo las frases de todos los días; las demás se guardan la primera vez que suenan.
  './audio/anotado.mp3', './audio/pago.mp3', './audio/al-dia.mp3', './audio/deshecho.mp3', './audio/no-deshacer.mp3', './audio/cliente-nuevo.mp3', './audio/cambios.mp3', './audio/cupo.mp3', './audio/e-nombre.mp3', './audio/e-celular.mp3', './audio/e-monto.mp3', './audio/e-mas.mp3', './audio/no-guardo.mp3', './audio/monto-alto.mp3', './audio/nombre-repetido.mp3', './audio/cliente-borrado.mp3', './audio/borrar-debe.mp3', './audio/aviso-pago.mp3',
  './audio/fecha-pedida.mp3', './audio/revisar.mp3', './audio/fecha-nueva.mp3', './audio/wa-no-abrio.mp3', './audio/copiado.mp3', './audio/importados.mp3', './audio/recibo-imagen.mp3', './audio/cuadre.mp3',
  './icons/icono.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', ev => {
  // cache: 'reload' pide cada archivo al servidor, sin pasar por la memoria del navegador:
  // así una versión nueva nunca guarda copias viejas de los archivos.
  ev.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== VOZ_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  /* Voz: primero lo guardado; si no está, se baja una vez y queda para siempre. */
  if (new URL(req.url).pathname.includes('/audio/')) {
    ev.respondWith(caches.open(VOZ_CACHE).then(c => c.match(req, { ignoreSearch: true }).then(g => g || caches.match(req, { ignoreSearch: true }).then(g2 => g2 || fetch(req).then(resp => { if (resp && resp.ok) c.put(req, resp.clone()); return resp; })))));
    return;
  }
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
