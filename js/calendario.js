/* Fiao · calendario colombiano y reglas de la Ley 2300 de 2023 ("Dejen de fregar").
   Art. 3: contactar al deudor solo de lunes a viernes de 7:00 a. m. a 7:00 p. m.
   y sábados de 8:00 a. m. a 3:00 p. m.; nunca domingos ni festivos; no más de una
   vez al día ni por varios canales en la misma semana. Fiao usa un solo canal (WhatsApp).
   Festivos según la Ley 51 de 1983 (Ley Emiliani) y las fechas que dependen de la Pascua. */
'use strict';

const _festivosCache = {};

/** Domingo de Pascua (algoritmo anónimo gregoriano). */
function domingoDePascua(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, mes - 1, dia, 12);
}
/** Traslada al lunes siguiente si no cae en lunes (Ley Emiliani). */
function alLunes(d) { const x = new Date(d); const w = x.getDay(); if (w !== 1) x.setDate(x.getDate() + ((8 - w) % 7)); return x; }

/** Mapa AAAA-MM-DD → nombre del festivo, para un año. */
function festivosDelAno(y) {
  if (_festivosCache[y]) return _festivosCache[y];
  const F = {};
  const pon = (d, n) => { F[isoDia(d)] = n; };
  const fijo = (m, d) => new Date(y, m - 1, d, 12);
  pon(fijo(1, 1), 'Año Nuevo');
  pon(fijo(5, 1), 'Día del Trabajo');
  pon(fijo(7, 20), 'Independencia');
  pon(fijo(8, 7), 'Batalla de Boyacá');
  pon(fijo(12, 8), 'Inmaculada Concepción');
  pon(fijo(12, 25), 'Navidad');
  pon(alLunes(fijo(1, 6)), 'Reyes Magos');
  pon(alLunes(fijo(3, 19)), 'San José');
  pon(alLunes(fijo(6, 29)), 'San Pedro y San Pablo');
  pon(alLunes(fijo(8, 15)), 'Asunción de la Virgen');
  pon(alLunes(fijo(10, 12)), 'Día de la Raza');
  pon(alLunes(fijo(11, 1)), 'Todos los Santos');
  pon(alLunes(fijo(11, 11)), 'Independencia de Cartagena');
  const p = domingoDePascua(y);
  pon(sumarDias(p, -3), 'Jueves Santo');
  pon(sumarDias(p, -2), 'Viernes Santo');
  pon(sumarDias(p, 43), 'Ascensión del Señor');
  pon(sumarDias(p, 64), 'Corpus Christi');
  pon(sumarDias(p, 71), 'Sagrado Corazón');
  return (_festivosCache[y] = F);
}
function nombreFestivo(d) { const x = new Date(d); return festivosDelAno(x.getFullYear())[isoDia(x)] || null; }
function esFestivo(d) { return !!nombreFestivo(d); }

/** Horario legal de un día: {desde, hasta} en horas, o null si ese día no se puede recordar. */
function horarioLegal(d) {
  const x = new Date(d);
  if (x.getDay() === 0 || esFestivo(x)) return null;
  if (x.getDay() === 6) return { desde: 8, hasta: 15 };
  return { desde: 7, hasta: 19 };
}
/** ¿Se puede enviar un recordatorio en este momento? */
function puedeRecordarAhora(ahora = new Date()) {
  const h = horarioLegal(ahora);
  if (!h) return false;
  const t = ahora.getHours() + ahora.getMinutes() / 60;
  return t >= h.desde && t < h.hasta;
}
/** Por qué hoy no se puede (para explicarlo en pantalla). */
function motivoNoRecordar(ahora = new Date()) {
  if (ahora.getDay() === 0) return 'Hoy es domingo: la ley no permite recordar.';
  const f = nombreFestivo(ahora);
  if (f) return `Hoy es festivo (${f}): la ley no permite recordar.`;
  const h = horarioLegal(ahora);
  const t = ahora.getHours() + ahora.getMinutes() / 60;
  if (t < h.desde) return `Se puede recordar desde las ${h.desde}:00 a. m.`;
  return `El horario para recordar terminó a las ${h.hasta > 12 ? h.hasta - 12 : h.hasta}:00 p. m.`;
}
/** Texto corto del horario de hoy: "recordar hasta las 7:00 p. m." */
function horarioDeHoy(ahora = new Date()) {
  if (puedeRecordarAhora(ahora)) {
    const h = horarioLegal(ahora).hasta;
    return `recordar hasta las ${h - 12}:00 p. m.`;
  }
  const h = horarioLegal(ahora);
  if (h && ahora.getHours() < h.desde) return `recordar desde las ${h.desde}:00 a. m.`;
  return 'hoy ya no se puede recordar';
}
/** Próximo día (desde mañana o desde la fecha dada) en que sí se puede recordar. */
function proximoDiaLegal(desde, incluirEseDia = false) {
  let d = new Date(desde);
  if (!incluirEseDia) d = sumarDias(d, 1);
  for (let i = 0; i < 20; i++) { if (horarioLegal(d)) return d; d = sumarDias(d, 1); }
  return d;
}
/** Último día legal antes de una fecha. */
function diaLegalAnterior(fecha) {
  let d = sumarDias(fecha, -1);
  for (let i = 0; i < 20; i++) { if (horarioLegal(d)) return d; d = sumarDias(d, -1); }
  return d;
}
/** Día en que se recordaría un pago acordado para esa fecha: ese mismo día o el siguiente legal. */
function diaParaRecordar(fecha) { return horarioLegal(fecha) ? new Date(fecha) : proximoDiaLegal(fecha); }
