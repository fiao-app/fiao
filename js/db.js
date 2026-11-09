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
}

function _respaldoLocal() {
  if (Datos.modo !== 'localstorage') return;
  try { localStorage.setItem('fiao-libreta', JSON.stringify(exportarLibreta())); } catch (e) { /* sin espacio: queda en memoria */ }
}
function _escribir(almacen, registro, borrar = false) {
  if (!_bd) { _respaldoLocal(); return Promise.resolve(); }
  return new Promise(ok => {
    try {
      const tx = _bd.transaction(almacen, 'readwrite');
      const st = tx.objectStore(almacen);
      borrar ? st.delete(registro) : st.put(registro);
      tx.oncomplete = () => ok();
      tx.onerror = () => ok();
    } catch (e) { ok(); }
  });
}

function guardarTienda(t) { t.id = 'tienda'; Datos.tienda = t; return _escribir('ajustes', t); }
function guardarCliente(c) { Datos.clientes.set(c.id, c); return _escribir('clientes', c); }
function guardarMov(m) { Datos.movs.set(m.id, m); return _escribir('movimientos', m); }
function guardarContacto(c) { Datos.contactos.set(c.id, c); return _escribir('contactos', c); }

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
  if (_bd) {
    await new Promise(ok => {
      const tx = _bd.transaction(ALMACENES, 'readwrite');
      for (const a of ALMACENES) tx.objectStore(a).clear();
      if (Datos.tienda) tx.objectStore('ajustes').put({ ...Datos.tienda, id: 'tienda' });
      for (const r of Datos.clientes.values()) tx.objectStore('clientes').put(r);
      for (const r of Datos.movs.values()) tx.objectStore('movimientos').put(r);
      for (const r of Datos.contactos.values()) tx.objectStore('contactos').put(r);
      tx.oncomplete = () => ok();
      tx.onerror = () => ok();
    });
  } else _respaldoLocal();
}
function borrarLibreta() { return reemplazarLibreta({}); }
