/* Fiao · service worker: guarda la app en el celular para que abra sin internet.
   No guarda datos de la libreta (esos viven en IndexedDB) ni toca internet por su cuenta. */
'use strict';

const VERSION = 'fiao-v3.1.1';
const ARCHIVOS = [
  './', './index.html', './manifest.webmanifest', './css/fiao.css',
  './fonts/figtree-400.woff2', './fonts/figtree-600.woff2', './fonts/jakarta-700.woff2', './fonts/jakarta-800.woff2',
  './vendor/lz-string.min.js',
  './js/util.js', './js/calendario.js', './js/db.js', './js/modelo.js', './js/mensajes.js', './js/demo.js',
  './js/ui.js', './js/movimiento.js', './js/guia.js', './js/voz.js', './js/ilustraciones.js', './js/vistas-inicio.js', './js/vistas-fiado.js', './js/vistas-cobro.js', './js/app.js', './js/vecino.js',
  './c/', './c/index.html',
  // Voz de Fiao: una frase por archivo (ver js/voz.js)
  './audio/anotado.mp3', './audio/pago.mp3', './audio/al-dia.mp3', './audio/deshecho.mp3', './audio/no-deshacer.mp3', './audio/cliente-nuevo.mp3', './audio/cambios.mp3', './audio/correccion.mp3', './audio/anulada.mp3', './audio/visto.mp3', './audio/cupo.mp3', './audio/recibo-wa.mp3', './audio/recordatorio-wa.mp3', './audio/cuenta-wa.mp3', './audio/resumen-wa.mp3', './audio/permiso-si.mp3', './audio/permiso-no.mp3', './audio/ya-recordado.mp3', './audio/no-recordar.mp3', './audio/copia.mp3', './audio/tienda.mp3', './audio/recuperada.mp3', './audio/mensajes.mp3', './audio/original.mp3', './audio/ocultos.mp3', './audio/visibles.mp3', './audio/pasos-ocultos.mp3', './audio/instalada.mp3', './audio/version.mp3', './audio/sin-contactos.mp3', './audio/e-nombre.mp3', './audio/e-celular.mp3', './audio/e-mas.mp3', './audio/e-tienda.mp3', './audio/e-su-nombre.mp3', './audio/e-dia.mp3', './audio/e-monto.mp3', './audio/e-mismo.mp3', './audio/e-archivo.mp3', './audio/g-anotar.mp3', './audio/g-nuevo.mp3', './audio/g-monto.mp3', './audio/practica.mp3', './audio/r-total.mp3', './audio/r-lista.mp3', './audio/r-anotar.mp3', './audio/r-cobros.mp3', './audio/ayuda-inicio.mp3', './audio/ayuda-cliente.mp3', './audio/ayuda-cobros.mp3', './audio/ayuda-resumen.mp3', './audio/ayuda-ajustes.mp3', './audio/ayuda-mostrar.mp3', './audio/ayuda-corregir.mp3', './audio/porque-horario.mp3', './audio/porque-permiso.mp3', './audio/porque-borrar.mp3', './audio/porque-celular.mp3', './audio/porque-cupo.mp3', './audio/porque-enlace.mp3',
  './icons/icono.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', ev => {
  // cache: 'reload' pide cada archivo al servidor, sin pasar por la memoria del navegador:
  // así una versión nueva nunca guarda copias viejas de los archivos.
  ev.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
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
