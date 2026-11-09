/* Fiao · utilidades compartidas (app del tendero y página del vecino).
   Formatos colombianos: $50.500, vie. 13 nov., 4:10 p. m. */
'use strict';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];

/** Escapa texto para insertarlo en HTML. */
function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** $50.500 · los pesos no llevan decimales. */
function pesos(n) {
  const v = Math.round(Math.abs(Number(n) || 0));
  const s = String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (n < 0 ? '−' : '') + '$' + s;
}
/** Lee "$35.000", "35000" o "35.000" y devuelve 35000. */
function leerPesos(texto) {
  const d = String(texto ?? '').replace(/\D/g, '');
  return d ? parseInt(d, 10) : 0;
}

/** Identificador corto, solo letras y números. */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Fecha local en formato AAAA-MM-DD (sin zona horaria). */
function isoDia(d = new Date()) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}
/** Convierte AAAA-MM-DD en Date local a mediodía (evita saltos por zona horaria). */
function diaDe(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}
function sumarDias(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
/** Días enteros entre dos fechas (b − a), por calendario. */
function diasEntre(a, b) { return Math.round((diaDe(isoDia(b)) - diaDe(isoDia(a))) / 86400000); }

/** vie. 13 nov. */
function fechaCorta(d) { const x = new Date(d); return `${DIAS_CORTOS[x.getDay()]} ${x.getDate()} ${MESES_CORTOS[x.getMonth()]}`; }
/** viernes 13 de nov. */
function fechaLarga(d) { const x = new Date(d); return `${DIAS[x.getDay()]} ${x.getDate()} de ${MESES_CORTOS[x.getMonth()]}`; }
/** 13 nov. */
function diaMes(d) { const x = new Date(d); return `${x.getDate()} ${MESES_CORTOS[x.getMonth()]}`; }
/** 4:10 p. m. */
function hora(d) {
  const x = new Date(d); let h = x.getHours(); const m = String(x.getMinutes()).padStart(2, '0');
  const pm = h >= 12; h = h % 12 || 12;
  return `${h}:${m} ${pm ? 'p. m.' : 'a. m.'}`;
}
/** "hoy", "ayer", "mañana" o la fecha corta. */
function cuando(d, hoy = new Date()) {
  const n = diasEntre(hoy, d);
  if (n === 0) return 'hoy';
  if (n === -1) return 'ayer';
  if (n === 1) return 'mañana';
  return fechaCorta(d);
}
/** Cierra la frase sin repetir el punto de las abreviaturas ("nov.", "p. m."). */
function punto(s) { s = String(s); return /\.$/.test(s) ? s : s + '.'; }
function mayuscula(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

/** Quita tildes y pasa a minúsculas, para buscar "nubia" y hallar "Doña Nubia". */
function normalizar(s) { return String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
/** Iniciales para el círculo del cliente. */
function iniciales(nombre) {
  const p = String(nombre).replace(/[,(].*$/, '').trim().split(/\s+/).filter(w => !/^(la|el|de|del|las|los)$/i.test(w));
  const base = p.length ? p : String(nombre).trim().split(/\s+/);
  return (base[0]?.[0] || '?').toUpperCase() + (base[1]?.[0] || '').toUpperCase();
}
/** Primer nombre para los mensajes: "Ana María Gómez" → "Ana María"; "Doña Nubia, la de…" → "Doña Nubia". */
function nombreCorto(nombre) {
  const limpio = String(nombre).replace(/[,(].*$/, '').trim();
  const p = limpio.split(/\s+/);
  if (/^(doña|don|la|el|profe|seño)$/i.test(p[0])) return p.slice(0, 2).join(' ');
  return p.slice(0, 2).join(' ');
}
/** Celular colombiano a formato internacional para WhatsApp (57 + 10 dígitos). */
function celInternacional(cel) {
  const d = String(cel ?? '').replace(/\D/g, '');
  if (d.length === 10 && d.startsWith('3')) return '57' + d;
  if (d.length === 12 && d.startsWith('573')) return d;
  return ''; // número no válido (o de ejemplo): WhatsApp deja elegir el chat
}
/** 3XX XXX XXXX */
function celLegible(cel) {
  const d = String(cel ?? '').replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, '');
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : d;
}
/** Enlace de WhatsApp con el mensaje escrito. Sin número, WhatsApp deja elegir el chat. */
function enlaceWhatsApp(cel, texto) {
  const n = (typeof Datos !== 'undefined' && Datos.tienda && Datos.tienda.demo) ? '' : celInternacional(cel);
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}
