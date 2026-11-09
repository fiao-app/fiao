/* Fiao · arranque, rutas y acciones generales.
   Las rutas van en el hash (#inicio, #cliente-abc123, #anotar-abc123-lista):
   así la app funciona en GitHub Pages sin configurar el servidor. */
'use strict';

Vista.limpiar = [];
Vista.despues = null;
Vista.prefill = '';

const RUTAS_SIN_TIENDA = ['bienvenida', 'restaurar', 'tienda'];

function ir(ruta) {
  if (location.hash.slice(1) === ruta) mostrarRuta();
  else location.hash = ruta;
}
function aplicarPreferencias() {
  const t = Datos.tienda || {};
  document.documentElement.dataset.letra = t.letra || 'normal';
}

let _primeraVez = true;
function mostrarRuta() {
  Vista.limpiar.forEach(f => { try { f(); } catch (e) { /* nada */ } });
  Vista.limpiar = [];
  const [nombre = '', p1 = '', p2 = ''] = location.hash.slice(1).split('-');
  let ruta = nombre;
  if (!Datos.tienda && !RUTAS_SIN_TIENDA.includes(ruta)) ruta = 'bienvenida';
  if (Datos.tienda && ruta === 'bienvenida') ruta = 'inicio';
  let vista = V[ruta] ? V[ruta](p1, p2) : null;
  if (!vista) { ruta = Datos.tienda ? 'inicio' : 'bienvenida'; vista = V[ruta](); if (location.hash.slice(1) !== ruta) history.replaceState(null, '', '#' + ruta); }
  const app = document.getElementById('app');
  app.innerHTML = vista.html;
  document.title = `${vista.titulo.replace(/<[^>]+>/g, '')} · Fiao`;
  try { vista.montar && vista.montar(app); } catch (e) { console.error(e); }
  if (!_primeraVez && vista.enfoque !== false) app.querySelector('h1')?.focus({ preventScroll: true });
  window.scrollTo(0, 0);
  _primeraVez = false;
}

/* Acciones presentes en varias pantallas */
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-accion]'); if (!b) return;
  if (b.dataset.accion === 'ocultar') {
    Vista.oculto = !Vista.oculto;
    avisar(Vista.oculto ? 'Montos ocultos' : 'Montos visibles');
    mostrarRuta();
  } else if (b.dataset.accion === 'atiende') {
    const t = tienda();
    abrirHoja(`<h2>¿Quién atiende ahora?</h2><p class="ayuda">Cada fiado y cada pago guardan quién atendió.</p>
      <div class="chips" role="radiogroup" aria-label="Quién atiende" data-grupo="atiende">${(t.atienden || []).map(a => chip(esc(a), a === t.atiendeAhora, `data-valor="${esc(a)}"`, 'radio')).join('')}</div>
      <a class="btn-link izq" href="#tienda" data-cerrar>Agregar a alguien</a><button type="button" class="btn" data-cerrar>Listo</button>`, d => {
      activarGrupos(d, async (g, v) => { t.atiendeAhora = v; await guardarTienda(t); avisar(`Ahora atiende ${v}`); });
      d.addEventListener('close', () => mostrarRuta(), { once: true });
    });
  }
});

window.addEventListener('hashchange', () => { cerrarHoja(); mostrarRuta(); });
window.addEventListener('beforeinstallprompt', ev => {
  ev.preventDefault(); Instalacion.evento = ev;
  const r = location.hash.slice(1).split('-')[0];
  if (r === 'inicio' || r === 'ajustes') mostrarRuta();
});

async function arrancar() {
  await cargarDatos();
  aplicarPreferencias();
  Vista.oculto = !!(Datos.tienda && Datos.tienda.ocultarAlAbrir);
  mostrarRuta();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* sin modo sin internet, la app igual funciona */ });
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
arrancar();
