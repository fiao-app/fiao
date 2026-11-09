/* Fiao · arranque, rutas, transiciones y acciones generales.
   Las rutas van en el hash (#inicio, #cliente-abc123): así la app funciona en GitHub Pages
   sin configurar el servidor. Las hojas (anotar, pagó, permiso…) no cambian la ruta,
   pero sí dejan una entrada en el historial para que el botón Atrás las cierre. */
'use strict';

Vista.limpiar = [];
Vista.despues = null;
Vista.prefill = '';

const RUTAS_SIN_TIENDA = ['bienvenida', 'restaurar', 'guia', 'tienda'];
const PROFUNDIDAD = { inicio: 0, cobros: 0, resumen: 0, ajustes: 0, cliente: 1, nuevo: 1, tienda: 1, mensajes: 1, resumenes: 1, restaurar: 1, guia: 1, editar: 2, mostrar: 2, corregir: 2 };
const PASOS_BIENVENIDA = ['', 'letra', 'como', 'camino', 'tienda', 'nombre'];
function profundidad(hash) {
  const [n, p = ''] = hash.split('-');
  if (n === 'bienvenida') return PASOS_BIENVENIDA.indexOf(p);
  return PROFUNDIDAD[n] ?? 0;
}

function ir(ruta) {
  const d = hojaAbierta();
  if (d) {
    d._sinHistoria = true; d.close();
    if (history.state && history.state.hoja) {
      if (location.hash.slice(1) === ruta) { history.back(); mostrarRuta({ animar: false }); }
      else { history.replaceState(null, '', '#' + ruta); mostrarRuta(); }
      return;
    }
  }
  if (location.hash.slice(1) === ruta) mostrarRuta({ animar: false });
  else location.hash = ruta;
}
function aplicarPreferencias() {
  const t = Datos.tienda || {};
  document.documentElement.dataset.letra = t.letra || document.documentElement.dataset.letra || 'normal';
  if (!Datos.tienda && !Borrador.letra) document.documentElement.dataset.letra = 'normal';
  document.documentElement.dataset.contraste = t.contraste ? 'alto' : '';
}

let _primeraVez = true, _rutaAnterior = '';
function mostrarRuta({ animar = true } = {}) {
  const hash = location.hash.slice(1);
  const pintar = () => {
    Vista.limpiar.forEach(f => { try { f(); } catch (e) { /* nada */ } });
    Vista.limpiar = [];
    Foco.quitar();
    const [nombre = '', p1 = '', p2 = ''] = hash.split('-');
    let ruta = nombre;
    if (!Datos.tienda && !RUTAS_SIN_TIENDA.includes(ruta)) ruta = 'bienvenida';
    if (Datos.tienda && ruta === 'bienvenida') ruta = 'inicio';
    let vista = V[ruta] ? V[ruta](p1, p2) : null;
    if (!vista) { ruta = Datos.tienda ? 'inicio' : 'bienvenida'; vista = V[ruta](); if (hash !== ruta) history.replaceState(history.state, '', '#' + ruta); }
    const app = document.getElementById('app');
    app.innerHTML = vista.html;
    document.title = `${vista.titulo.replace(/<[^>]+>/g, '')} · Fiao`;
    try { vista.montar && vista.montar(app); } catch (e) { console.error(e); }
    if (!_primeraVez && vista.enfoque !== false && animar) app.querySelector('h1')?.focus({ preventScroll: true });
    if (animar) window.scrollTo(0, 0);
    _primeraVez = false;
    document.dispatchEvent(new CustomEvent('fiao', { detail: { paso: 'vista', nombre: ruta } }));
  };
  const antes = _rutaAnterior; _rutaAnterior = hash;
  if (animar && !_primeraVez && antes !== hash && document.startViewTransition && !reducido()) {
    const a = profundidad(antes), b = profundidad(hash);
    document.documentElement.dataset.dir = b > a ? 'adelante' : b < a ? 'atras' : 'lado';
    document.startViewTransition(pintar);
  } else pintar();
}

/* Acciones presentes en varias pantallas */
document.addEventListener('click', ev => {
  const pq = ev.target.closest('[data-porque]'); if (pq) { abrirPorQue(pq.dataset.porque); return; }
  const b = ev.target.closest('[data-accion]'); if (!b) return;
  const accion = b.dataset.accion;
  if (accion === 'ocultar') {
    Vista.oculto = !Vista.oculto;
    mostrarRuta({ animar: false });
    avisar(Vista.oculto ? 'Montos ocultos.' : 'Montos visibles.', { icono: Vista.oculto ? 'ojoNo' : 'ojo' });
  } else if (accion === 'ayuda') {
    abrirAyuda();
  } else if (accion === 'consejo-ok') {
    const caja = b.closest('.consejo'); if (caja) { marcarVisto(caja.dataset.consejo); caja.remove(); }
  } else if (accion === 'atiende') {
    const t = tienda();
    abrirHoja(`${cabHoja('¿Quién atiende ahora?')}<p class="ayuda">Cada fiado y cada pago guardan quién atendió.</p>
      <div class="chips" role="radiogroup" aria-label="Quién atiende" data-grupo="atiende">${(t.atienden || []).map(a => chip(esc(a), a === t.atiendeAhora, `data-valor="${esc(a)}"`, 'radio')).join('')}</div>
      <a class="btn-link izq" href="#tienda">${ic('mas', 20, 2.4)}Agregar a alguien</a><button type="button" class="btn" data-cerrar>Listo</button>`, d => {
      activarGrupos(d, async (g, v) => { t.atiendeAhora = v; await guardarTienda(t); vibrar(10); });
      d.addEventListener('close', () => { if (location.hash.slice(1).split('-')[0] !== 'tienda') mostrarRuta({ animar: false }); }, { once: true });
    });
  }
});

window.addEventListener('hashchange', () => { const d = hojaAbierta(); if (d) { d._sinHistoria = true; d.close(); } mostrarRuta(); });
window.addEventListener('popstate', ev => { const d = hojaAbierta(); if (d && !(ev.state && ev.state.hoja)) { d._sinHistoria = true; d.close(); } });
window.addEventListener('beforeinstallprompt', ev => {
  ev.preventDefault(); Instalacion.evento = ev;
  const r = location.hash.slice(1).split('-')[0];
  if ((r === 'inicio' || r === 'ajustes') && !hojaAbierta()) mostrarRuta({ animar: false });
});

async function arrancar() {
  await cargarDatos();
  if (history.state && history.state.hoja) history.replaceState(null, '', location.href);
  aplicarPreferencias();
  Vista.oculto = !!(Datos.tienda && Datos.tienda.ocultarAlAbrir);
  _rutaAnterior = location.hash.slice(1);
  mostrarRuta();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* sin modo sin internet, la app igual funciona */ });
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
arrancar();
