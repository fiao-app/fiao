/* Fiao · arranque, rutas, transiciones y acciones generales.
   Las rutas van en el hash (#inicio, #cliente-abc123): así la app funciona en GitHub Pages
   sin configurar el servidor. Las hojas (anotar, pagó, permiso…) no cambian la ruta,
   pero sí dejan una entrada en el historial para que el botón Atrás las cierre. */
'use strict';

Vista.limpiar = [];
Vista.despues = null;
Vista.prefill = '';

const RUTAS_SIN_TIENDA = ['bienvenida', 'restaurar', 'guia', 'tienda', 'pago', 'fecha', 'revisar'];
const PROFUNDIDAD = { inicio: 0, cobros: 0, resumen: 0, ajustes: 0, cliente: 1, nuevo: 1, tienda: 1, mensajes: 1, resumenes: 1, restaurar: 1, guia: 1, editar: 2, mostrar: 2, cuenta: 2, corregir: 2, pago: 1, fecha: 1, revisar: 1 };
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
  const raiz = document.documentElement;
  /* Apariencia: lo que eligió en Ajustes; si nunca eligió, Tinta cuando el celular pide más contraste. */
  const tema = t.tema || (t.contraste ? 'tinta' : matchMedia('(prefers-contrast: more)').matches ? 'tinta' : 'color');
  raiz.dataset.tema = tema;
  /* Movimiento: lo que eligió; si nunca eligió, lo que pide el celular. */
  raiz.dataset.movimiento = t.movimiento || (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reducido' : 'completo');
  const color = tema === 'tinta' ? '#1D3BA8' : '#3346E0';
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', color));
}
/* Si cambia el ajuste del celular y usted no ha elegido en Fiao, Fiao lo sigue. */
['(prefers-contrast: more)', '(prefers-reduced-motion: reduce)'].forEach(q => { try { matchMedia(q).addEventListener('change', () => aplicarPreferencias()); } catch (e) { /* navegador viejo */ } });

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
    try { Mov.trasPintar(app, ruta, antes, animar && !_primeraVez); } catch (e) { /* el movimiento nunca frena la app */ }
    if (!_primeraVez && vista.enfoque !== false && animar) app.querySelector('h1')?.focus({ preventScroll: true });
    if (animar) window.scrollTo(0, 0);
    _primeraVez = false;
    document.dispatchEvent(new CustomEvent('fiao', { detail: { paso: 'vista', nombre: ruta } }));
  };
  const antes = _rutaAnterior; _rutaAnterior = hash;
  if (animar && !_primeraVez && antes !== hash && document.startViewTransition && !reducido()) {
    const a = profundidad(antes), b = profundidad(hash);
    document.documentElement.dataset.dir = b > a ? 'adelante' : b < a ? 'atras' : 'lado';
    Mov.antesDeTransicion(antes, hash);
    const vt = document.startViewTransition(pintar);
    vt.ready.catch(() => {}); vt.updateCallbackDone.catch(() => {});
    vt.finished.then(() => Mov.limpiar(), () => Mov.limpiar());
  } else { pintar(); Mov.desdeFila = false; Mov.limpiar(); }
}

/* Otra ventana de Fiao cambió la libreta: se vuelve a leer y se repinta (después de cerrar la hoja, si hay una abierta). */
let _repintarAlCerrar = false;
if (_canal) _canal.onmessage = async () => {
  await recargarDatos(); aplicarPreferencias();
  if (hojaAbierta()) _repintarAlCerrar = true; else mostrarRuta({ animar: false });
};
document.addEventListener('fiao', ev => { if (ev.detail && ev.detail.paso === 'hoja-cerrada' && _repintarAlCerrar) { _repintarAlCerrar = false; setTimeout(() => { if (!hojaAbierta()) mostrarRuta({ animar: false }); }, 50); } });

/* Si el celular no deja guardar: una banda fija arriba, que no se va sola, con la salida a la mano. */
function mostrarFalloGuardado() {
  let b = document.getElementById('falla-guardado');
  if (!b) {
    b = document.createElement('div'); b.id = 'falla-guardado'; b.className = 'falla-guardado'; b.setAttribute('role', 'alert');
    b.innerHTML = `${ic('atencion', 24, 2.2)}<p><b>No se pudo guardar en este celular.</b> Lo último que anotó todavía se ve, pero puede perderse al cerrar Fiao. Guarde una copia ahora.</p>
      <div class="acciones"><button type="button" class="btn-mini" data-falla="copia">${ic('descargar', 18, 2.2)}Guardar copia</button><button type="button" class="btn-mini sec" data-falla="cerrar">Cerrar</button></div>`;
    b.addEventListener('click', async ev => {
      const x = ev.target.closest('[data-falla]'); if (!x) return;
      if (x.dataset.falla === 'copia') { if (await guardarCopia()) b.remove(); } else b.remove();
    });
    document.body.appendChild(b);
  }
  if (typeof Voz !== 'undefined') Voz.decir('no-guardo');
  vibrar([60, 80, 60]);
}
document.addEventListener('fiao', ev => { if (ev.detail && ev.detail.paso === 'guardado-fallo') mostrarFalloGuardado(); });

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

/* 3.4 · Volvió de WhatsApp y el celular había cerrado Fiao: se abre la misma cuenta, si fue hace menos de 10 minutos. */
function volverDondeEstaba() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem('fiao-salida') || 'null'); localStorage.removeItem('fiao-salida'); } catch (e) { return; }
  const h = location.hash.slice(1);
  if (!s || !Datos.tienda || (h && h !== 'inicio') || !(Date.now() - s.t < 10 * 60 * 1000)) return;
  const [r, id] = String(s.ruta || '').split('-');
  if (!(/^(cliente-[A-Za-z0-9]+(-todo)?|cobros)$/.test(s.ruta) && (r === 'cobros' || cliente(id)))) return;
  history.replaceState(null, '', '#inicio');
  history.pushState(null, '', '#' + s.ruta);
}
async function arrancar() {
  await cargarDatos();
  if (history.state && history.state.hoja) history.replaceState(null, '', location.href);
  aplicarPreferencias();
  Vista.oculto = !!(Datos.tienda && Datos.tienda.ocultarAlAbrir);
  volverDondeEstaba();
  _rutaAnterior = location.hash.slice(1);
  mostrarRuta();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    // Si ya había una versión guardada y llega otra, se ofrece actualizar en vez de esperar a la próxima apertura.
    const habia = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!habia || Vista.avisoVersion) return;
      Vista.avisoVersion = true;
      avisar('Hay una versión nueva de Fiao.', { icono: 'girar', ms: 15000, acciones: [{ texto: 'Actualizar', fuerte: true, fn: () => location.reload() }] });
    });
    navigator.serviceWorker.register('sw.js').catch(() => { /* sin modo sin internet, la app igual funciona */ });
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
arrancar();
