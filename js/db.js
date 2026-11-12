/* Fiao · almacenamiento local.
   La libreta vive solo en este celular (IndexedDB). No hay servidor ni cuentas.
   Al abrir, todo se carga en memoria (una tienda tiene cientos de registros, no millones)
   y cada cambio se escribe de inmediato. Si IndexedDB no está disponible (navegación
   privada), se usa localStorage y, en último caso, solo memoria. */
'use strict';

const BD_NOMBRE = 'fiao';
const BD_VERSION = 1;
const ALMACENES = ['ajustes', 'clientes', 'movimientos', 'contactos'];

const Datos = {
  tienda: null,          // ajustes de la tienda (un solo registro)
  clientes: new Map(),   // id → cliente
  movs: new Map(),       // id → movimiento (fiado, pago, saldo inicial)
  contactos: new Map(),  // id → contacto por WhatsApp (recibo, recordatorio, permiso…)
  modo: 'memoria'        // 'indexeddb' | 'localstorage' | 'memoria'
};

let _bd = null;
/* Si Fiao está abierta en dos ventanas (la app instalada y el navegador), cada cambio avisa a la otra. */
const _canal = 'BroadcastChannel' in window ? new BroadcastChannel('fiao') : null;
function _avisarCambio() { try { _canal && _canal.postMessage('cambio'); } catch (e) { /* nada */ } }
/** Vuelve a leer la libreta (cuando otra ventana la cambió). */
async function recargarDatos() {
  if (!_bd) return cargarDatos();
  const [aj, cl, mv, co] = await Promise.all(ALMACENES.map(_todos));
  Datos.tienda = aj.find(r => r.id === 'tienda') || null;
  Datos.clientes = new Map(cl.map(r => [r.id, r]));
  Datos.movs = new Map(mv.map(r => [r.id, r]));
  Datos.contactos = new Map(co.map(r => [r.id, r]));
  if (typeof invalidarIndice === 'function') invalidarIndice();
}

function _abrirBD() {
  return new Promise((ok, mal) => {
    if (!('indexedDB' in window)) return mal(new Error('sin indexedDB'));
    const pet = indexedDB.open(BD_NOMBRE, BD_VERSION);
    pet.onupgradeneeded = () => {
      const bd = pet.result;
      for (const a of ALMACENES) if (!bd.objectStoreNames.contains(a)) bd.createObjectStore(a, { keyPath: 'id' });
    };
    pet.onsuccess = () => ok(pet.result);
    pet.onerror = () => mal(pet.error);
    pet.onblocked = () => mal(new Error('bloqueada'));
  });
}
function _todos(almacen) {
  return new Promise((ok, mal) => {
    const t = _bd.transaction(almacen, 'readonly').objectStore(almacen).getAll();
    t.onsuccess = () => ok(t.result || []);
    t.onerror = () => mal(t.error);
  });
}

/** Carga toda la libreta en memoria. */
async function cargarDatos() {
  try {
    _bd = await _abrirBD();
    const [aj, cl, mv, co] = await Promise.all(ALMACENES.map(_todos));
    Datos.tienda = aj.find(r => r.id === 'tienda') || null;
    Datos.clientes = new Map(cl.map(r => [r.id, r]));
    Datos.movs = new Map(mv.map(r => [r.id, r]));
    Datos.contactos = new Map(co.map(r => [r.id, r]));
    Datos.modo = 'indexeddb';
    if (typeof invalidarIndice === 'function') invalidarIndice();
    return;
  } catch (e) { _bd = null; }
  try {
    const crudo = localStorage.getItem('fiao-libreta');
    const j = crudo ? JSON.parse(crudo) : {};
    Datos.tienda = j.tienda || null;
    Datos.clientes = new Map((j.clientes || []).map(r => [r.id, r]));
    Datos.movs = new Map((j.movimientos || []).map(r => [r.id, r]));
    Datos.contactos = new Map((j.contactos || []).map(r => [r.id, r]));
    Datos.modo = 'localstorage';
  } catch (e) { Datos.modo = 'memoria'; }
  if (typeof invalidarIndice === 'function') invalidarIndice();
}

/** Si el celular no deja guardar (sin espacio, error del navegador), la app lo dice de inmediato:
    lo anotado sigue en pantalla, y una copia de respaldo lo rescata. Nunca se finge que se guardó. */
function _falloAlGuardar() {
  Datos.falloGuardado = Date.now();
  document.dispatchEvent(new CustomEvent('fiao', { detail: { paso: 'guardado-fallo' } }));
}
function _respaldoLocal() {
  if (Datos.modo === 'memoria') return false;
  if (Datos.modo !== 'localstorage') return true;
  try { localStorage.setItem('fiao-libreta', JSON.stringify(exportarLibreta())); return true; } catch (e) { _falloAlGuardar(); return false; }
}
function _escribir(almacen, registro, borrar = false) {
  if (typeof invalidarIndice === 'function') invalidarIndice();
  if (!_bd) return Promise.resolve(_respaldoLocal());
  return new Promise(ok => {
    let fallo = false;
    const mal = () => { if (!fallo) { fallo = true; _falloAlGuardar(); } ok(false); };
    try {
      const tx = _bd.transaction(almacen, 'readwrite');
      const st = tx.objectStore(almacen);
      borrar ? st.delete(registro) : st.put(registro);
      tx.oncomplete = () => { _avisarCambio(); ok(true); };
      tx.onerror = mal;
      tx.onabort = mal;
    } catch (e) { mal(); }
  });
}

function guardarTienda(t) { t.id = 'tienda'; Datos.tienda = t; return _escribir('ajustes', t); }
function guardarCliente(c) { Datos.clientes.set(c.id, c); return _escribir('clientes', c); }
function guardarMov(m) { Datos.movs.set(m.id, m); return _escribir('movimientos', m); }
function guardarContacto(c) { Datos.contactos.set(c.id, c); return _escribir('contactos', c); }
/** Solo para "Deshacer" en los segundos siguientes a anotar: lo demás se corrige o se anula. */
function borrarMov(id) { Datos.movs.delete(id); return _escribir('movimientos', id, true); }

/** Varias escrituras en una sola operación: o quedan todas o ninguna. ops: [almacén, registro o id, ¿borrar?] */
function _escribirVarios(ops) {
  if (typeof invalidarIndice === 'function') invalidarIndice();
  if (!_bd) return Promise.resolve(_respaldoLocal());
  return new Promise(ok => {
    let fallo = false;
    const mal = () => { if (!fallo) { fallo = true; _falloAlGuardar(); } ok(false); };
    try {
      const tx = _bd.transaction([...new Set(ops.map(o => o[0]))], 'readwrite');
      for (const [a, r, borrar] of ops) borrar ? tx.objectStore(a).delete(r) : tx.objectStore(a).put(r);
      tx.oncomplete = () => { _avisarCambio(); ok(true); };
      tx.onerror = mal;
      tx.onabort = mal;
    } catch (e) { mal(); }
  });
}
/** Borra un cliente con todo lo suyo (fiados, pagos y recordatorios), de una sola vez.
    Devuelve lo borrado para poder deshacerlo; si no se pudo guardar, todo queda como estaba. */
async function borrarCliente(id) {
  const c = Datos.clientes.get(id); if (!c) return null;
  const movs = [...Datos.movs.values()].filter(m => m.clienteId === id);
  const contactos = [...Datos.contactos.values()].filter(r => r.clienteId === id);
  Datos.clientes.delete(id); movs.forEach(m => Datos.movs.delete(m.id)); contactos.forEach(r => Datos.contactos.delete(r.id));
  const ok = await _escribirVarios([['clientes', id, true], ...movs.map(m => ['movimientos', m.id, true]), ...contactos.map(r => ['contactos', r.id, true])]);
  const borrado = { c, movs, contactos };
  if (!ok && Datos.modo !== 'memoria') { _ponerDeVuelta(borrado); return null; }
  return borrado;
}
function _ponerDeVuelta({ c, movs, contactos }) {
  Datos.clientes.set(c.id, c); movs.forEach(m => Datos.movs.set(m.id, m)); contactos.forEach(r => Datos.contactos.set(r.id, r));
  if (typeof invalidarIndice === 'function') invalidarIndice();
}
/** «Deshacer» de borrar un cliente: vuelve todo, tal cual. */
function restaurarCliente(b) {
  _ponerDeVuelta(b);
  return _escribirVarios([['clientes', b.c], ...b.movs.map(m => ['movimientos', m]), ...b.contactos.map(r => ['contactos', r])]);
}

/** 1.4.0 · Varios clientes de una vez (al traerlos de los contactos). */
function guardarClientes(lista) { lista.forEach(c => Datos.clientes.set(c.id, c)); return _escribirVarios(lista.map(c => ['clientes', c])); }
function quitarClientes(ids) { ids.forEach(id => Datos.clientes.delete(id)); return _escribirVarios(ids.map(id => ['clientes', id, true])); }
/** Todo en un objeto, para la copia de respaldo. */
function exportarLibreta() {
  return {
    app: 'fiao', version: 1, guardada: new Date().toISOString(),
    tienda: Datos.tienda,
    clientes: [...Datos.clientes.values()],
    movimientos: [...Datos.movs.values()],
    contactos: [...Datos.contactos.values()]
  };
}

/** Reemplaza toda la libreta (al recuperar una copia o cargar el ejemplo). */
async function reemplazarLibreta(j) {
  Datos.tienda = j.tienda || null;
  Datos.clientes = new Map((j.clientes || []).map(r => [r.id, r]));
  Datos.movs = new Map((j.movimientos || []).map(r => [r.id, r]));
  Datos.contactos = new Map((j.contactos || []).map(r => [r.id, r]));
  if (typeof invalidarIndice === 'function') invalidarIndice();
  if (_bd) {
    await new Promise(ok => {
      const tx = _bd.transaction(ALMACENES, 'readwrite');
      for (const a of ALMACENES) tx.objectStore(a).clear();
      if (Datos.tienda) tx.objectStore('ajustes').put({ ...Datos.tienda, id: 'tienda' });
      for (const r of Datos.clientes.values()) tx.objectStore('clientes').put(r);
      for (const r of Datos.movs.values()) tx.objectStore('movimientos').put(r);
      for (const r of Datos.contactos.values()) tx.objectStore('contactos').put(r);
      tx.oncomplete = () => { _avisarCambio(); ok(); };
      tx.onerror = tx.onabort = () => { _falloAlGuardar(); ok(); };
    });
  } else _respaldoLocal();
}
function borrarLibreta() { return reemplazarLibreta({}); }
