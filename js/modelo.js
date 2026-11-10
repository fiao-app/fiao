/* Fiao · reglas de la libreta: saldos, fechas de pago, estados, cupos y registros.
   Principio: nada se borra. Corregir o anular deja rastro visible para los dos. */
'use strict';

const PREF_PAGO = { tarde: 'En la tarde', manana: 'Mañana', viernes: 'Viernes', quincena: 'Quincena', otro: 'Otro día' };
const PREF_RECIBOS = { whatsapp: 'por WhatsApp', mostrar: 'se los muestro aquí', semanal: 'resumen semanal por WhatsApp' };
const PREF_RECORDAR = { dia: 'el día de pago', atraso: 'solo si se atrasa', nunca: 'nunca' };
const MEDIOS = { efectivo: 'en efectivo', nequi: 'por Nequi', breb: 'por Bre-B', otro: '' };

function tienda() { return Datos.tienda || {}; }
function clientes() { return [...Datos.clientes.values()]; }
function cliente(id) { return Datos.clientes.get(id); }
/** Otro cliente con el mismo nombre (sin importar tildes ni mayúsculas), para no fiarle al equivocado. */
function clienteLlamado(nombre, exceptoId = null) {
  const k = normalizar(nombre).replace(/\s+/g, ' ').trim();
  return clientes().find(c => c.id !== exceptoId && normalizar(c.nombre).replace(/\s+/g, ' ').trim() === k) || null;
}
function textoRepetido(c) { return `Ya tiene un cliente que se llama ${c.nombre}${c.detalle ? ` (${c.detalle})` : ''}. ¿Es otra persona? Agréguele algo que la distinga.`; }
/** ¿Un monto fuera de lo normal? (un cero de más). Más de $500.000, o 5 veces su fiado más alto. */
function montoInusual(c, monto) {
  if (monto > 500000) return true;
  let max = 0; for (const m of movsDe(c.id)) if (m.tipo === 'fiado' && !m.anulado && m.monto > max) max = m.monto;
  return max > 0 && monto >= 50000 && monto > max * 5;
}
function mov(id) { return Datos.movs.get(id); }

/* Índice por cliente: las anotaciones de cada uno, ordenadas, y su saldo.
   Se arma una vez y se descarta cuando algo cambia (db.js llama a invalidarIndice).
   Así una libreta de 300 clientes con 2 años de historial se dibuja en milisegundos. */
let _indice = null;
function invalidarIndice() { _indice = null; }
function _idx() {
  if (_indice) return _indice;
  const movs = new Map(), saldos = new Map(), contactos = new Map();
  for (const m of Datos.movs.values()) { const a = movs.get(m.clienteId); if (a) a.push(m); else movs.set(m.clienteId, [m]); }
  for (const [id, a] of movs) { a.sort((x, y) => y.fecha.localeCompare(x.fecha)); saldos.set(id, a.reduce((s, m) => s + efecto(m), 0)); }
  for (const r of Datos.contactos.values()) { const a = contactos.get(r.clienteId); if (a) a.push(r); else contactos.set(r.clienteId, [r]); }
  for (const a of contactos.values()) a.sort((x, y) => y.fecha.localeCompare(x.fecha));
  return (_indice = { movs, saldos, contactos });
}
/** Movimientos de un cliente, del más reciente al más antiguo. */
function movsDe(clienteId) { return (_idx().movs.get(clienteId) || []).slice(); }
function efecto(m) { if (m.anulado) return 0; return m.tipo === 'pago' ? -m.monto : m.monto; }
function saldoDe(clienteId) { return _idx().saldos.get(clienteId) || 0; }

/** Fecha de pago según la costumbre del cliente. */
function fechaPorPreferencia(pref, desde = new Date()) {
  const d = new Date(desde); d.setHours(12, 0, 0, 0);
  switch (pref) {
    case 'tarde': return d;
    case 'manana': return sumarDias(d, 1);
    case 'viernes': return sumarDias(d, (5 - d.getDay() + 7) % 7);
    case 'quincena': {
      if (d.getDate() <= 15) return new Date(d.getFullYear(), d.getMonth(), 15, 12);
      return new Date(d.getFullYear(), d.getMonth() + 1, 0, 12);
    }
    default: return sumarDias(d, 7);
  }
}

/** Estado de la cuenta: nada · atrasado · hoy · futuro · sinFecha. */
function estadoDe(c, hoy = new Date()) {
  const saldo = saldoDe(c.id);
  if (saldo <= 0) return { tipo: 'nada', saldo };
  if (!c.proximaFecha) return { tipo: 'sinFecha', saldo };
  const n = diasEntre(hoy, diaDe(c.proximaFecha));
  if (n < 0) return { tipo: 'atrasado', saldo, dias: -n, fecha: diaDe(c.proximaFecha) };
  if (n === 0) return { tipo: 'hoy', saldo, fecha: diaDe(c.proximaFecha) };
  return { tipo: 'futuro', saldo, dias: n, fecha: diaDe(c.proximaFecha) };
}
function textoEstado(c, e) {
  switch (e.tipo) {
    case 'nada': return 'No debe nada';
    case 'atrasado': return `Atrasado ${e.dias} ${e.dias === 1 ? 'día' : 'días'}`;
    case 'hoy': return c.pago === 'tarde' ? 'Paga hoy en la tarde' : 'Paga hoy';
    case 'futuro': return e.dias === 1 ? 'Paga mañana' : `Paga ${elDia(e.fecha)}`;
    default: return 'Sin fecha de pago';
  }
}
const _ORDEN = { atrasado: 0, hoy: 1, futuro: 2, sinFecha: 3, nada: 4 };
/** Primero lo urgente: atrasados, pagos de hoy, próximas fechas; al final, quienes no deben. */
function clientesOrdenados(hoy = new Date()) {
  return clientes().map(c => ({ c, e: estadoDe(c, hoy) })).sort((a, b) => {
    const o = _ORDEN[a.e.tipo] - _ORDEN[b.e.tipo];
    if (o) return o;
    if (a.e.tipo === 'atrasado') return b.e.dias - a.e.dias;
    if (a.e.tipo === 'futuro') return a.e.dias - b.e.dias || b.e.saldo - a.e.saldo;
    if (a.e.tipo === 'nada') return a.c.nombre.localeCompare(b.c.nombre, 'es');
    return b.e.saldo - a.e.saldo;
  });
}

function totalEnLaCalle() { return clientes().reduce((s, c) => s + Math.max(0, saldoDe(c.id)), 0); }
function totalesDelDia(hoy = new Date()) {
  const d = isoDia(hoy); let fiado = 0, pagos = 0;
  for (const m of Datos.movs.values()) {
    if (m.anulado || m.fecha.slice(0, 10) !== d) continue;
    if (m.tipo === 'fiado') fiado += m.monto; else if (m.tipo === 'pago') pagos += m.monto;
  }
  return { fiado, pagos };
}
function usoCupo(c, saldo = saldoDe(c.id)) { return c.cupo ? saldo / c.cupo : 0; }
/** Puntualidad: pagos hechos a más tardar en la fecha acordada. */
function puntualidad(c) {
  const p = movsDe(c.id).filter(m => m.tipo === 'pago' && !m.anulado && typeof m.aTiempo === 'boolean');
  return { a: p.filter(m => m.aTiempo).length, de: p.length };
}
function ultimoMov(c) { return movsDe(c.id)[0] || null; }

/* ───── Registrar ───── */
function _ahoraISO() { return new Date().toISOString(); }

async function registrarFiado({ c, monto, que = '', llevo = '', tipo = 'fiado', fecha = _ahoraISO() }) {
  const antes = saldoDe(c.id);
  const m = { id: uid(), clienteId: c.id, tipo, monto, que: que.trim(), llevo: llevo.trim(), atendio: tienda().atiendeAhora || '', fecha, correcciones: [], anulado: null, _fechaAntes: c.proximaFecha || null };
  await guardarMov(m);
  if (antes <= 0 || !c.proximaFecha) { c.proximaFecha = isoDia(fechaPorPreferencia(c.pago, new Date(fecha))); await guardarCliente(c); }
  return m;
}

async function registrarPago({ c, monto, medio = 'efectivo', recibio = '', nuevaFecha = null }) {
  const hoy = new Date();
  const aTiempo = c.proximaFecha ? diasEntre(hoy, diaDe(c.proximaFecha)) >= 0 : true;
  const m = { id: uid(), clienteId: c.id, tipo: 'pago', monto, medio, atendio: recibio || tienda().atiendeAhora || '', fecha: _ahoraISO(), aTiempo, correcciones: [], anulado: null, _fechaAntes: c.proximaFecha || null };
  await guardarMov(m);
  const saldo = saldoDe(c.id);
  c.proximaFecha = saldo > 0 ? (nuevaFecha ? isoDia(nuevaFecha) : c.proximaFecha) : null;
  await guardarCliente(c);
  return m;
}

/** Deshacer de verdad, solo en los segundos siguientes y si no se ha enviado ni mostrado. */
function sePuedeDeshacer(m) { return !!m && !m.enviado && !m.visto && !m.anulado && !(m.correcciones || []).length && (Date.now() - new Date(m.fecha)) < 60000; }
async function deshacerMov(m) {
  if (!sePuedeDeshacer(m)) return false;
  const c = cliente(m.clienteId);
  await borrarMov(m.id);
  if (c) { c.proximaFecha = m._fechaAntes || null; await _ajustarFecha(c); }
  return true;
}
async function _ajustarFecha(c) {
  const s = saldoDe(c.id);
  if (s <= 0 && c.proximaFecha) c.proximaFecha = null;
  else if (s > 0 && !c.proximaFecha) c.proximaFecha = isoDia(fechaPorPreferencia(c.pago));
  await guardarCliente(c);
}
async function corregirMov(m, nuevoMonto, motivo) {
  m.correcciones = m.correcciones || [];
  m.correcciones.push({ de: m.monto, a: nuevoMonto, motivo, fecha: _ahoraISO() });
  m.monto = nuevoMonto;
  await guardarMov(m);
  await _ajustarFecha(cliente(m.clienteId));
}
async function anularMov(m, motivo) {
  m.anulado = { motivo, fecha: _ahoraISO() };
  await guardarMov(m);
  await _ajustarFecha(cliente(m.clienteId));
}

/* ───── Contactos por WhatsApp (para respetar la Ley 2300) ───── */
async function registrarContacto(clienteId, tipo, movId = null) {
  const r = { id: uid(), clienteId, tipo, movId, fecha: _ahoraISO() };
  await guardarContacto(r);
  return r;
}
function contactosDe(clienteId, tipo) {
  return (_idx().contactos.get(clienteId) || []).filter(r => !tipo || r.tipo === tipo);
}
/** Recordatorio ya enviado hoy (la ley permite uno al día). */
function recordadoHoy(clienteId, hoy = new Date()) {
  return contactosDe(clienteId, 'recordatorio').find(r => r.fecha.slice(0, 10) === isoDia(hoy)) || null;
}
function permisoOk(c) { return !!(c.cel && c.permiso && c.permiso.estado === 'si'); }
/** ¿Le toca recordatorio? Solo si se atrasó, o si pidió que le recordaran el día de pago. */
function necesitaRecordatorio(c, e) {
  if (e.saldo <= 0 || c.recordar === 'nunca' || !c.cel) return false;
  return e.tipo === 'atrasado' || (e.tipo === 'hoy' && c.recordar === 'dia');
}
/** Clientes con resumen semanal pendiente. */
function resumenesPendientes() {
  return clientes().filter(c => c.recibos === 'semanal' && permisoOk(c)).map(c => {
    const ultimo = contactosDe(c.id, 'resumen')[0];
    const desde = ultimo ? ultimo.fecha : '';
    const nuevos = movsDe(c.id).filter(m => m.fecha > desde && m.tipo !== 'saldo');
    return { c, nuevos };
  }).filter(x => x.nuevos.length > 0);
}

/* ───── Resumen y control ───── */
function resumenDelMes(y, mes) {
  let recuperado = 0, fiado = 0;
  for (const m of Datos.movs.values()) {
    if (m.anulado) continue;
    const d = new Date(m.fecha);
    if (d.getFullYear() !== y || d.getMonth() !== mes) continue;
    if (m.tipo === 'pago') recuperado += m.monto; else if (m.tipo === 'fiado') fiado += m.monto;
  }
  return { recuperado, fiado };
}
function mesesConDatos() {
  const set = new Set([...Datos.movs.values()].map(m => m.fecha.slice(0, 7)));
  set.add(isoDia().slice(0, 7));
  return [...set].sort().reverse();
}
function quienesDebenMas(n = 4) {
  return clientes().map(c => ({ c, s: saldoDe(c.id) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, n);
}
/** A quién revisar: atrasados, cerca del cupo y quien dejó de venir debiendo. */
function aQuienRevisar(hoy = new Date()) {
  const out = [];
  for (const c of clientes()) {
    const e = estadoDe(c, hoy);
    if (e.saldo <= 0) continue;
    if (e.tipo === 'atrasado') { out.push({ c, tipo: 'atrasado', peso: 100 + e.dias, titulo: `${c.nombre}: atrasado ${e.dias} ${e.dias === 1 ? 'día' : 'días'}`, detalle: `Debe ${pesos(e.saldo)} desde ${elDia(e.fecha)}` }); continue; }
    if (c.cupo && usoCupo(c, e.saldo) >= 0.9) { out.push({ c, tipo: 'cupo', peso: 50, titulo: `${c.nombre}: va en el ${Math.round(usoCupo(c, e.saldo) * 100)} % del cupo`, detalle: `Debe ${pesos(e.saldo)} de ${pesos(c.cupo)}` }); continue; }
    const u = ultimoMov(c);
    if (u && diasEntre(new Date(u.fecha), hoy) >= 21) { const sem = Math.floor(diasEntre(new Date(u.fecha), hoy) / 7); out.push({ c, tipo: 'ausente', peso: 10, titulo: `${c.nombre}: no viene hace ${sem} semanas`, detalle: `Debe ${pesos(e.saldo)}` }); }
  }
  return out.sort((a, b) => b.peso - a.peso);
}
/** Los que más fían (últimos 30 días), para tenerlos a la mano. */
function losQueMasFian(n = 4) {
  const desde = sumarDias(new Date(), -30).toISOString(); const cuenta = new Map();
  for (const m of Datos.movs.values()) if (m.tipo === 'fiado' && m.fecha >= desde) cuenta.set(m.clienteId, (cuenta.get(m.clienteId) || 0) + 1);
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([id]) => cliente(id)).filter(Boolean);
}
/** Para el paso "¿A quién le fía?": los que más fían y, después, los más recientes. */
function frecuentes(n = 6) {
  const out = [...losQueMasFian(n)];
  const recientes = [...Datos.movs.values()].sort((a, b) => b.fecha.localeCompare(a.fecha));
  for (const m of recientes) { if (out.length >= n) break; const c = cliente(m.clienteId); if (c && !out.includes(c)) out.push(c); }
  for (const c of clientes()) { if (out.length >= n) break; if (!out.includes(c)) out.push(c); }
  return out.slice(0, n);
}
function diasDesdeCopia() {
  const t = tienda(); if (!t.ultimaCopia) return null;
  return diasEntre(new Date(t.ultimaCopia), new Date());
}

/* ───── La cuenta que viaja en el enlace del vecino ─────
   Va después del # (el navegador nunca envía esa parte al servidor),
   comprimida con lz-string. Es una foto de la cuenta con fecha y hora. */
function cuentaParaEnlace(c) {
  const t = tienda();
  const todos = movsDe(c.id).reverse(); // del más antiguo al más reciente
  const ult = todos.slice(-14);
  const anteriores = todos.slice(0, todos.length - ult.length);
  const ant = anteriores.reduce((s, m) => s + efecto(m), 0);
  return {
    v: 1, t: t.nombre || 'La tienda', n: nombreCorto(c.nombre), s: saldoDe(c.id), g: new Date().toISOString(), a: c.proximaFecha || null,
    ant,
    m: ult.map(m => [m.fecha, m.tipo === 'pago' ? 'p' : m.tipo === 'saldo' ? 's' : 'f', m.monto, m.tipo === 'pago' ? (MEDIOS[m.medio] || '') : (m.que || ''),
      m.correcciones && m.correcciones.length ? m.correcciones[0].de : null, m.anulado ? 1 : 0]),
    b: t.llave || '', q: t.nequi || '', w: t.whatsapp || '', e: t.demo ? 1 : 0,
    i: c.id // para que el aviso de pago del vecino abra esta cuenta en Fiao
  };
}
function urlBase() { return location.href.replace(/#.*$/, '').replace(/[^/]*$/, ''); }
function enlaceCuenta(c) {
  const datos = LZString.compressToEncodedURIComponent(JSON.stringify(cuentaParaEnlace(c)));
  return `${urlBase()}c/#${datos}`;
}
