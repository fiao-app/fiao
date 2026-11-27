/* Fiao 2.4.0 · «Dígale a Fiao»: el asistente de voz. 2.5.0 · más capaz: confirmar y corregir hablando, seguidillas
   («¿y Yesid?», «súmale mil más»), varias cosas a la vez, precios aprendidos, preguntas y acciones nuevas, apodos.
   Se abre manteniendo presionado «Fiar» (o desde la Ayuda). La voz solo se vuelve texto (servicio del celular:
   Google o Apple); entender la orden se hace aquí, en el celular, con reglas que se prueban una por una.
   Nada que mueva plata se guarda sin la tarjeta de confirmación. Si la voz del navegador no está, la misma hoja
   ofrece escribir o usar el micrófono del teclado. */
'use strict';

/* ───── 1 · Montos: «5.000», «cinco mil», «veinte mil quinientos», «dos lucas», «media luca» ───── */
const NUM_PALABRAS = {
  cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
  diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
  veinte: 20, veintiun: 21, veintiuno: 21, veintiuna: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
  treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90,
  cien: 100, ciento: 100, doscientos: 200, doscientas: 200, trescientos: 300, trescientas: 300, cuatrocientos: 400, cuatrocientas: 400,
  quinientos: 500, quinientas: 500, seiscientos: 600, seiscientas: 600, setecientos: 700, setecientas: 700, ochocientos: 800, ochocientas: 800, novecientos: 900, novecientas: 900
};
const MULT_PALABRAS = { mil: 1000, luca: 1000, lucas: 1000, millon: 1e6, millones: 1e6, palo: 1e6, palos: 1e6 };
const DECENAS = new Set(['veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']);

/** Parte el texto en palabras normalizadas (sin tildes, minúsculas), dejando juntos los números con puntos o comas. */
function palabrasDe(texto) {
  return normalizar(texto).replace(/\$/g, ' ').replace(/(\d)\s*(mil|lucas?|millones?)\b/g, '$1 $2')
    .replace(/[^\p{L}\p{N}.,\s-]/gu, ' ').replace(/(?<!\d)[.,]|[.,](?!\d)/g, ' ').split(/\s+/).filter(Boolean);
}
/** Lee un número escrito con cifras: «5.000», «5,000», «20000», «2,5». */
function cifra(p) {
  if (!/^\d[\d.,]*$/.test(p)) return null;
  if (/^\d{1,3}([.,]\d{3})+$/.test(p)) return Number(p.replace(/[.,]/g, ''));
  if (/^\d+[.,]\d{1,2}$/.test(p)) return Number(p.replace(',', '.'));
  return Number(p.replace(/[.,]/g, ''));
}
/** Todos los montos de la frase, sin cruzarse: [{ monto, desde, hasta }] (índices de las palabras usadas). */
function montosEn(pal) {
  const out = [];
  for (let i = 0; i < pal.length; i++) {
    let total = 0, actual = 0, usadas = 0, j = i, vio = false;
    if (pal[i] === 'media' && /^lucas?$/.test(pal[i + 1] || '')) { out.push({ monto: 500, desde: i, hasta: i + 1 }); i++; continue; }
    if (/^lucas?$/.test(pal[i]) && pal[i + 1] === 'y' && pal[i + 2] === 'media') { out.push({ monto: 1500, desde: i, hasta: i + 2 }); i += 2; continue; }
    for (; j < pal.length; j++) {
      const p = pal[j], c = cifra(p);
      if (c !== null) { if (vio && actual && c < 1000 && !/^(mil|lucas?)$/.test(pal[j - 1])) break; actual += c; vio = true; usadas = j - i + 1; continue; }
      if (p in NUM_PALABRAS) { if (vio && actual && actual < 10 && NUM_PALABRAS[p] < 1000) break; actual += NUM_PALABRAS[p]; vio = true; usadas = j - i + 1; continue; }
      if (p in MULT_PALABRAS && (vio || /^lucas?$/.test(p))) {
        total += (actual || 1) * MULT_PALABRAS[p]; actual = 0; vio = true; usadas = j - i + 1;
        if (/^lucas?$/.test(p) && pal[j + 1] === 'y' && pal[j + 2] === 'media') { total += 500; j += 2; usadas = j - i + 1; }
        continue;
      }
      if (p === 'mil' && !vio) { total += 1000; vio = true; usadas = j - i + 1; continue; }
      if (p === 'y' && vio && j + 1 < pal.length && (pal[j + 1] in NUM_PALABRAS) && actual % 10 === 0 && actual >= 20 && actual < 100) continue;
      if (p === 'pesos' && vio) { usadas = j - i + 1; continue; }
      break;
    }
    if (vio) {
      const monto = Math.round(total + actual);
      /* Un número suelto menor de 50 casi nunca es plata en la tienda («una gaseosa», «dos panes»): no cuenta. */
      if (monto >= 50) out.push({ monto, desde: i, hasta: i + usadas - 1 });
      i = i + Math.max(usadas, 1) - 1;
    }
  }
  return out;
}
/** El monto principal: el que se dijo con más palabras (y si empatan, el primero). */
function montoEn(pal) {
  let mejor = null;
  for (const m of montosEn(pal)) if (!mejor || m.hasta - m.desde > mejor.hasta - mejor.desde) mejor = m;
  return mejor;
}

/* ───── 2 · Clientes: por nombre, apodo aprendido, detalle o parecido («Yesi» → Yesid, «Yurleidis» con b/v, s/z, ll/y) ───── */
const TRATOS = new Set(['don', 'dona', 'senor', 'senora', 'sr', 'sra', 'la', 'el', 'mi', 'su', 'de', 'del', 'las', 'los']);
function parecido(a, b) {
  if (a === b) return 1;
  const m = a.length, n = b.length; if (!m || !n) return 0;
  let prev = Array.from({ length: n + 1 }, (_, k) => k);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let k = 1; k <= n; k++) cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + (a[i - 1] === b[k - 1] ? 0 : 1));
    prev = cur;
  }
  return 1 - prev[n] / Math.max(m, n);
}
/** Cómo suena una palabra en español de acá: b/v, s/z/c, ll/y, h muda, qu/k, g/j. */
function fon(w) {
  return w.replace(/h/g, '').replace(/v/g, 'b').replace(/z/g, 's').replace(/c(?=[ei])/g, 's').replace(/qu(?=[ei])/g, 'k').replace(/c/g, 'k')
    .replace(/g(?=[ei])/g, 'j').replace(/ll/g, 'y').replace(/x/g, 'ks').replace(/(.)\1+/g, '$1');
}
function parecidoF(a, b) { return Math.max(parecido(a, b), parecido(fon(a), fon(b))); }
/** Puntúa a cada cliente contra las palabras dichas. Devuelve [{ c, p, usadas:Set }] de mayor a menor. */
function clientesEn(pal, ignorar = new Set()) {
  const out = [], alias = (Datos.tienda && tienda().alias) || {};
  for (const c of clientes()) {
    const nom = palabrasDe(c.nombre).filter(w => !TRATOS.has(w) && w.length > 1);
    const det = palabrasDe(c.detalle || '').filter(w => !TRATOS.has(w) && w.length > 2);
    let p = 0; const usadas = new Set();
    nom.forEach((w, k) => {
      let mejor = 0, idx = -1;
      pal.forEach((x, i) => { if (ignorar.has(i) || x.length < 2 || usadas.has(i)) return; const s = parecidoF(x, w); if (s > mejor) { mejor = s; idx = i; } });
      if (mejor >= 0.72) { p += (k === 0 ? 60 : w.length >= 5 ? 45 : 25) * mejor; usadas.add(idx); }
    });
    det.forEach(w => { const i = pal.findIndex((x, i) => !ignorar.has(i) && parecidoF(x, w) >= 0.8); if (i >= 0) { p += 30; usadas.add(i); } });
    pal.forEach((x, i) => { if (!ignorar.has(i) && alias[x] === c.id) { p += 75; usadas.add(i); } });
    if (p >= 40) out.push({ c, p, usadas });
  }
  return out.sort((a, b) => b.p - a.p);
}
/** De los candidatos: uno claro (elegido) o varios parecidos (dudosos). */
function escoger(cands) {
  const elegido = cands.length && (cands.length === 1 || cands[0].p - cands[1].p >= 12) ? cands[0] : null;
  const dudosos = !elegido && cands.length > 1 ? cands.slice(0, 3).map(x => x.c) : null;
  return { elegido, dudosos };
}
/** Cuando el tendero aclara a quién se refería, Fiao se queda con la palabra: la próxima vez «Yesi» ya es Yesid. */
function aprenderApodo(oidos, c) {
  if (!oidos || !oidos.length || !c || !Datos.tienda) return;
  const nom = palabrasDe(c.nombre);
  /* No se aprende una palabra que ya es el nombre de otro cliente: si dijo «Keyla» y era Lucho, fue un error de ese momento */
  const otros = clientes().filter(x => x.id !== c.id).flatMap(x => palabrasDe(`${x.nombre} ${x.detalle || ''}`)).filter(w => w.length > 2 && !TRATOS.has(w));
  const pal = oidos.filter(w => w.length >= 3 && !TRATOS.has(w) && !RELLENO.has(w) && !(w in NUM_PALABRAS) && !VERBO.test(w) && !nom.includes(w) && !otros.some(o => parecidoF(w, o) >= 0.9));
  if (!pal.length) return;
  const t = tienda(); t.alias = t.alias || {};
  pal.forEach(w => { t.alias[w] = c.id; });
  const llaves = Object.keys(t.alias); if (llaves.length > 80) delete t.alias[llaves[0]];
  guardarTienda(t);
}

/* ───── 3 · Fechas: «mañana», «el viernes», «el 15», «en ocho días», «la otra semana», «fin de mes», «la quincena» ───── */
const DIAS_N = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const MESES_N = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function fechaEn(t, hoy = new Date()) {
  const h = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  if (/\bpasado manana\b/.test(t)) return sumarDias(h, 2);
  if (/\bmanana\b/.test(t)) return sumarDias(h, 1);
  let m = t.match(/\ben (\d+|una?|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|quince|veinte|treinta) (dias?|semanas?)\b/);
  if (m) { const n = /^\d+$/.test(m[1]) ? +m[1] : NUM_PALABRAS[m[1]]; return sumarDias(h, n * (/semana/.test(m[2]) ? 7 : 1)); }
  if (/\b(la otra semana|la proxima semana|la semana que viene|la semana entrante)\b/.test(t)) return sumarDias(h, 7);
  if (/\b(fin|final|finales) de(l)? mes\b/.test(t)) { const f = new Date(h.getFullYear(), h.getMonth() + 1, 0); return f > h ? f : new Date(h.getFullYear(), h.getMonth() + 2, 0); }
  if (/\bquincena\b/.test(t)) {
    if (h.getDate() < 15) return new Date(h.getFullYear(), h.getMonth(), 15);
    const fin = new Date(h.getFullYear(), h.getMonth() + 1, 0); return fin > h ? fin : new Date(h.getFullYear(), h.getMonth() + 1, 15);
  }
  m = t.match(/\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/);
  if (m) { let n = (DIAS_N.indexOf(m[1]) - h.getDay() + 7) % 7; if (n === 0) n = 7; if (/\b(el|la) otr[oa] (lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/.test(t) && n < 7) n += 7; return sumarDias(h, n); }
  m = t.match(/\bel (\d{1,2}|primero|[a-z]+(?: y (?:uno|un|dos|tres|cuatro|cinco|seis|siete|ocho|nueve))?)(?: de ([a-z]+))?\b/);
  if (m) {
    let d = /^\d+$/.test(m[1]) ? +m[1] : m[1] === 'primero' ? 1 : m[1].split(' y ').reduce((s, x) => s + (NUM_PALABRAS[x] ?? NaN), 0);
    const mes = m[2] ? MESES_N.indexOf(m[2]) : -1;
    if (d >= 1 && d <= 31) {
      let f = new Date(h.getFullYear(), mes >= 0 ? mes : h.getMonth(), d);
      if (f < h) f = mes >= 0 ? new Date(h.getFullYear() + 1, mes, d) : new Date(h.getFullYear(), h.getMonth() + 1, d);
      return f;
    }
  }
  if (/\bhoy\b/.test(t)) return h;
  return null;
}

/* ───── 4 · Productos y precios aprendidos: «una gaseosa de 2.500» enseña el precio; después basta «fíale una gaseosa» ───── */
function claveProducto(texto) {
  let pal = palabrasDe(texto), cant = 1;
  if (pal.length && ((pal[0] in NUM_PALABRAS && NUM_PALABRAS[pal[0]] >= 1 && NUM_PALABRAS[pal[0]] <= 20) || (/^\d{1,2}$/.test(pal[0]) && +pal[0] >= 1))) { cant = /^\d+$/.test(pal[0]) ? +pal[0] : NUM_PALABRAS[pal[0]]; pal = pal.slice(1); }
  pal = pal.filter(w => !['un', 'una', 'unos', 'unas', 'el', 'la', 'los', 'las', 'de', 'del'].includes(w));
  const clave = pal.map(w => w.length > 4 && /[^aeiou]es$/.test(w) ? w.slice(0, -2) : w.length > 3 && /[aeiou]s$/.test(w) ? w.slice(0, -1) : w).join(' ');
  return { clave, cant };
}
function precioDe(clave) {
  if (!clave) return null;
  const t = tienda(), guardado = t.precios && t.precios[clave];
  if (guardado) return { p: guardado.p, fuente: 'memoria' };
  /* En el historial: un fiado que fue solo ese producto */
  const m = [...Datos.movs.values()].filter(x => x.tipo === 'fiado' && !x.anulado && x.que && !/[,;]|\by\b/.test(x.que) && x.que.split(/\s+/).length <= 4)
    .sort((a, b) => b.fecha.localeCompare(a.fecha)).find(x => { const k = claveProducto(x.que); return k.clave === clave; });
  if (m) { const k = claveProducto(m.que); return { p: Math.round(m.monto / k.cant), fuente: 'memoria' }; }
  return null;
}
function guardarPrecios(lista) {
  if (!lista || !lista.length || !Datos.tienda) return;
  const t = tienda(); t.precios = t.precios || {};
  lista.forEach(x => { if (x.clave && x.unit > 0) t.precios[x.clave] = { p: x.unit, f: isoDia(new Date()) }; });
  const ll = Object.keys(t.precios); if (ll.length > 200) delete t.precios[ll[0]];
  guardarTienda(t);
}

/* ───── 5 · Órdenes ───── */
const RX = {
  deshacer: /\b(deshaz|deshace|deshacer|deshaga|me equivoque|borra lo ultimo|quita lo ultimo|cancela lo ultimo)\b/,
  ocultar: /\b(oculta|ocultar|ocultame|esconde|esconder|tapa|tapar)\b.*\b(montos?|cifras?|plata|numeros)\b/,
  destapar: /\b(muestra|mostrar|muestrame|destapa|destapar|ensena|ver)\b.*\b(los )?(montos|cifras|numeros)\b/,
  ir: /\b(abre|abrir|abreme|ve|vaya|vamos|ir|lleva|llevame|entra|entrar|ensename|pasa|dame|muestrame|quiero ver|ver|pasame)\b.*\b(libreta|inicio|cobros|cobrar|resumen|ajustes|configuracion|cuadre|novedades|accesibilidad)\b/,
  recordar: /\b(recuerdale|recordarle|recuerda|recordar|recordale|cobrale|cobrarle|escribele|recordatorio|mensaje)\b/,
  mostrar: /\b(muestrale|mostrarle|ensenale|muestra la cuenta|mostrar la cuenta)\b/,
  ficha: /\b(abre|abreme|abrir|busca|buscame|buscar|ve a|vaya a|entra a|ver la cuenta|la ficha)\b/,
  pago: /\b(pago|pagaron|abono|abonaron|cancelo|trajo|me dio|dio|me pagaron|pagar(on)? todo|quedo al dia|se puso al dia)\b/,
  fiar: /\b(fiale|fia|fie|fiar|fiado|fiele|fiarle|fiare|anotale|anota|anotar|anotame|apuntale|apunta|apuntar|se llevo|llevo|lleva|le di|dale|ponle|pon|cargale|carga|agregale|sumale|suma|enviale|pidele|fijale|mandale|pial|fiel|file)\b/,
  pregunta: /^(y )?(cuanto|cuantos|cuanta|quien|quienes|como|que|cual|cuando|dime|digame)\b/,
  calle: /\b(en la calle|me deben|deben entre todos|total|cuanto hay)\b/,
  quien: /\b(quien|quienes)\b.*\b(debe|deben|atrasad|mas)\b|\batrasados?\b/,
  hoy: /\b(hoy|el dia|cuadre)\b/,
  debe: /\b(debe|le debe|me debe|va debiendo|cuenta de|lleva)\b/,
  nuevoCliente: /\b(nuevo cliente|nueva cliente|nueva clienta|cliente nuev[oa]|agrega(r)? (a |al |una |un )?(cliente|clienta)|agrega a|agregar a|registra(r)? a|crea(r)? (a |el |un )?cliente|anade a)\b/,
  recibo: /\b(recibo|comprobante)\b/,
  atiende: /\b(atiende|atendiendo|esta atendiendo)\b/,
  fechaVerbo: /\b(paga|pagaria|pagara|va a pagar|viene a pagar|queda de pagar|dice que paga|ponle fecha|ponerle fecha|pongale fecha|cambia(le)? la fecha|nueva fecha|fecha de pago|queda para|para el)\b/,
  cuando: /\b(cuando|que dia)\b/,
  llevo: /\bque\b.*\b(se llevo|llevo|ha fiado|fio|ha llevado|lleva|saco|ha sacado|le fie)\b/,
  ausentes: /\b(no viene|no ha vuelto|no vuelve|perdid[oa]s?|desaparecid[oa]s?|hace rato|hace tiempo|no aparece)\b/,
  pagan: /\bquien(es)?\b.*\bpaga(n)?\b/,
  perfil: /\b(como es|hablame de|cuentame de|cuentame sobre|que sabes de|que me dices de|informacion de|info de|perfil de|como paga|como se porta|como le va a)\b/,
  cierre: /\b(cierre|cerrar|cerremos|cerramos|cierra|cierro)\b( (del|el) dia| (la )?caja| (la )?tienda| por hoy)?\b|\bcomo cerramos\b|\bcomo me fue hoy\b/,
  siempre: /\blo (mismo )?de (siempre|costumbre|todos los dias|cada vez)\b|\blo que siempre lleva\b|\blo usual\b/
};
const VERBO = /^(fiale|fia|fie|fiar|fiado|fiele|fiarle|fiare|anotale|anota|anotar|anotame|apuntale|apunta|apuntar|se|llevo|lleva|llevaron|le|di|dale|ponle|pon|cargale|carga|agregale|sumale|suma|pago|pagaron|abono|abonaron|cancelo|trajo|me|dio|dieron|enviale|pidele|fijale|mandale|pial|fiel|file|vale)$/;
const MEDIOS_VOZ = [[/\bnequi\b/, 'nequi'], [/\b(bre ?b|breb|llave|bre-b)\b/, 'breb'], [/\b(daviplata|transferencia|bancolombia|consignacion)\b/, 'otro'], [/\b(efectivo|billete|cash|en mano)\b/, 'efectivo']];
const MEDIO_P = /^(nequi|breb|bre|b|llave|daviplata|transferencia|bancolombia|consignacion|efectivo|billete|cash|mano)$/;
const RUTAS_VOZ = [[/libreta|inicio/, 'inicio'], [/cobros|cobrar/, 'cobros'], [/cuadre/, 'cuadre'], [/resumen/, 'resumen'], [/ajustes|configuracion/, 'ajustes'], [/novedades/, 'novedades'], [/accesibilidad/, 'accesibilidad']];
const RELLENO = new Set(['a', 'al', 'le', 'les', 'de', 'del', 'para', 'por', 'que', 'se', 'me', 'lo', 'la', 'el', 'los', 'las', 'y', 'en', 'con', 'mas', 'otro', 'otra', 'otros', 'pesos', 'peso', 'fiao', 'oye', 'hola', 'porfa', 'favor', 'gracias', 'ahi', 'ya', 'hoy', 'ahora', 'eso', 'es', 'una', 'un', 'uno']);
const SEGUIR = new Set(['y', 'e', 'a', 'al', 'lo', 'mismo', 'igual', 'tambien', 'que', 'el', 'la', 'ah', 'pues', 'de', 'para', 'le', 'con', 'fiao', 'ahora', 'cuanto', 'debe']);

/** El celular dicho o escrito: «300 123 4567», «3001234567», «+57 300…». */
function celEn(texto) {
  const m = texto.replace(/[()]/g, ' ').match(/(?:\+?57[\s.-]*)?(3\d{2})[\s.-]*(\d{3})[\s.-]*(\d{2})[\s.-]*(\d{2})/) || texto.match(/(?:\+?57)?(3\d{9})/);
  if (!m) return null;
  return { cel: m.slice(1).join('').replace(/\D/g, '').slice(-10), resto: texto.replace(m[0], ' ') };
}
/** Un nombre propio dicho después de «cliente», «agrega a», etc. */
function nombreTras(texto) {
  const m = texto.match(/(?:cliente|clienta|agrega(?:r)?(?: a| al| una| un)?|registra(?:r)? a|crea(?:r)?(?: a| el| un)?(?: cliente)?|añade a|anade a)\s+(?:(?:que se llama|llamad[oa]|de nombre)\s+)?([A-Za-zÁÉÍÓÚÑáéíóúñ]+(?:\s+(?!con\b|celular\b|cel\b|numero\b|número\b|y\b|de\b)[A-Za-zÁÉÍÓÚÑáéíóúñ]+)?)/i);
  if (!m) return '';
  const n = m[1].trim(), k = normalizar(n.split(/\s+/)[0]);
  if (['cliente', 'clienta', 'a', 'al', 'un', 'una', 'nuevo', 'nueva', 'que'].includes(k)) return '';
  return n.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Interpreta una frase. Devuelve un objeto con `tipo`:
 * fiar · pago · lote · deshacer · nuevo · cliente · celular · saldo · calle · quien · hoy · cuando · llevo · cupoq · periodo · pagan · ausentes
 * · recordar · recibo · fecha · cupo · atiende · mostrar · ficha · ir · ocultar · destapar
 * · elegir (varios clientes parecidos) · falta (falta el monto o el cliente) · nada (no entendió).
 * `ctx` es lo último de que se habló (para «¿y Yesid?», «súmale mil más», «¿cuándo paga?»).
 */
function interpretar(texto, ctx = null) {
  const t = normalizar(texto).replace(/[¿?¡!.,;:]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t) return { tipo: 'nada', texto };
  const base = { texto };
  const ctxC = ctx && ctx.c && Date.now() - ctx.cuando < 180000 && cliente(ctx.c.id) ? ctx.c : null;
  if (RX.deshacer.test(t)) return { ...base, tipo: 'deshacer' };
  if (RX.ocultar.test(t)) return { ...base, tipo: 'ocultar' };
  if (RX.destapar.test(t) && !RX.mostrar.test(t)) return { ...base, tipo: 'destapar' };
  const pregunta = RX.pregunta.test(t) || /\?/.test(texto);

  /* Clientes nuevos y celulares (antes de los montos: «300 123 4567» no es plata) */
  const cel = celEn(texto);
  const textoSinCel = cel ? cel.resto : texto;
  const pal = palabrasDe(textoSinCel);
  const monto = montoEn(pal);
  const ignorar = new Set(monto ? Array.from({ length: monto.hasta - monto.desde + 1 }, (_, k) => monto.desde + k) : []);
  const cands = clientesEn(pal, ignorar);
  const { elegido, dudosos } = escoger(cands);
  const oidos = elegido ? [...elegido.usadas].map(i => pal[i]) : cands[0] ? [...cands[0].usadas].map(i => pal[i]) : [];
  const conC = c => ({ ...base, c, oidos });

  if (!pregunta && (cel || (RX.nuevoCliente.test(t) && !monto))) {
    const nombre = nombreTras(textoSinCel);
    const existe = nombre ? clientes().find(c => normalizar(c.nombre) === normalizar(nombre)) : null;
    if (cel && !RX.nuevoCliente.test(t) && elegido) return { ...conC(elegido.c), tipo: 'celular', cel: cel.cel };
    if (existe) return cel ? { ...conC(existe), tipo: 'celular', cel: cel.cel } : { ...conC(existe), tipo: 'yaEsta' };
    if (nombre) return { ...base, tipo: 'cliente', nombre: nombre.slice(0, LIMITES.nombre), cel: cel ? cel.cel : '' };
    if (cel && ctxC) return { ...conC(ctxC), tipo: 'celular', cel: cel.cel };
    return { ...base, tipo: 'falta', que: 'nombre', para: 'cliente', cel: cel ? cel.cel : '' };
  }
  if (!pregunta && RX.atiende.test(t)) {
    const lista = (tienda().atienden || []);
    const quien = lista.map(a => ({ a, s: Math.max(...palabrasDe(a).map(w => Math.max(0, ...pal.map(x => parecidoF(x, w))))) })).sort((x, y) => y.s - x.s)[0];
    return { ...base, tipo: 'atiende', persona: quien && quien.s >= 0.75 ? quien.a : null };
  }
  const cc = elegido ? elegido.c : null;
  const conCliente = (tipo, extra = {}) => {
    if (dudosos) return { ...base, tipo: 'elegir', para: tipo, opciones: dudosos, oidos, ...extra };
    const c = cc || ctxC;
    return c ? { ...conC(c), tipo, ...extra } : { ...base, tipo: 'falta', que: 'cliente', para: tipo, ...extra };
  };
  if (RX.recibo.test(t) && !pregunta) return conCliente('recibo');
  if (/\bcupo\b/.test(t)) {
    if (pregunta) return conCliente('cupoq');
    const quitar = /\b(quita|quitale|quitarle|sin|elimina|borra|borrale)\b/.test(t);
    if (!quitar && !monto) { const x = conCliente('cupo'); return x.tipo === 'cupo' ? { ...x, tipo: 'falta', que: 'monto', para: 'cupo' } : x; }
    return conCliente('cupo', { cupo: quitar ? null : monto.monto });
  }
  if (!pregunta && RX.fechaVerbo.test(t) && !(monto && !/\bpaga\b/.test(t))) { const f = fechaEn(t); if (f && !monto) return conCliente('fecha', { fecha: isoDia(f) }); if (f && monto) return { ...base, tipo: 'nada' }; }

  /* Seguidillas: «¿y Yesid?», «lo mismo a Lucho» → repite lo último con otro cliente */
  if (ctx && Date.now() - ctx.cuando < 180000 && elegido && !monto) {
    const sobra = pal.filter((w, i) => !elegido.usadas.has(i) && !SEGUIR.has(w));
    if (!sobra.length && (/^(y|e)\b/.test(t) || /\b(lo mismo|igual|tambien)\b/.test(t))) {
      if (['fiar', 'pago'].includes(ctx.tipo)) return { ...conC(elegido.c), tipo: ctx.tipo, monto: ctx.tipo === 'pago' ? Math.min(ctx.monto, saldoDe(elegido.c.id)) || ctx.monto : ctx.monto, que: ctx.que || '', medio: ctx.medio || 'efectivo' };
      if (['saldo', 'cuando', 'llevo', 'cupoq', 'recordar', 'recibo', 'ficha', 'mostrar'].includes(ctx.tipo)) return { ...conC(elegido.c), tipo: ctx.tipo };
      return { ...conC(elegido.c), tipo: 'saldo' };
    }
  }

  if (RX.cierre.test(t) && !elegido && !monto) return { ...base, tipo: 'cierre' };
  if (RX.perfil.test(t) && (elegido || dudosos || ctxC)) return conCliente('perfil');
  if (RX.siempre.test(t) && !monto && (elegido || dudosos || ctxC)) {
    const x = conCliente('fiar');
    if (x.tipo !== 'fiar') return x;
    const h = perfilDe(x.c).habitual;
    return h ? { ...x, monto: h.monto, que: h.que, medio: 'efectivo', siempre: true } : { ...x, tipo: 'sinCostumbre' };
  }

  if (pregunta) {
    if (RX.pagan.test(t) && !elegido) return { ...base, tipo: 'pagan', dia: /\bmanana\b/.test(t) ? 'manana' : 'hoy' };
    if (RX.ausentes.test(t) && !elegido) return { ...base, tipo: 'ausentes' };
    if (RX.quien.test(t)) return { ...base, tipo: 'quien', atrasados: /atrasad/.test(t) };
    const rango = /\bayer\b/.test(t) ? 'ayer' : /\bsemana\b/.test(t) ? 'semana' : /\bquincena\b/.test(t) ? 'quincena' : /\bmes\b/.test(t) ? 'mes' : null;
    if (rango && /\b(pag|cobr|recib|entr|recuper|fie\b|fio\b|fiad|fiaron|vendi|abon)/.test(t)) {
      const r = { ...base, tipo: 'periodo', rango, cual: /\b(fie|fio|fiado|fiaron|vendi|le fie|ha fiado)\b/.test(t) ? 'fiado' : 'pagos' };
      if (dudosos) return { ...r, tipo: 'elegir', para: 'periodo', opciones: dudosos, oidos };
      return elegido ? { ...r, c: elegido.c } : r;
    }
    if (RX.cuando.test(t) && (elegido || dudosos || ctxC)) return conCliente('cuando');
    if (RX.llevo.test(t) && (elegido || dudosos || ctxC)) return conCliente('llevo');
    if (elegido || dudosos) return dudosos ? { ...base, tipo: 'elegir', para: 'saldo', opciones: dudosos, oidos } : { ...conC(elegido.c), tipo: 'saldo' };
    if (RX.hoy.test(t) && /\b(fie|fiado|fio|cobre|cobrado|recupere|vendi|pago|pagaron|pagado|voy|va|como|cuanto)\b/.test(t)) return { ...base, tipo: 'hoy' };
    if (RX.calle.test(t) || /\bdeben\b/.test(t)) return { ...base, tipo: 'calle' };
    if (ctxC && (RX.debe.test(t) || /\bcuanto\b/.test(t))) return { ...conC(ctxC), tipo: 'saldo' };
  }
  if (RX.recordar.test(t)) return conCliente('recordar');
  if (RX.mostrar.test(t) && (elegido || dudosos)) return conCliente('mostrar');
  if (RX.ir.test(t)) { const r = RUTAS_VOZ.find(([rx]) => rx.test(t)); if (r) return { ...base, tipo: 'ir', ruta: r[1] }; }
  if (!monto && (elegido || dudosos) && RX.ficha.test(t)) return conCliente('ficha');

  /* Varias cosas a la vez y productos con precio */
  if (!pregunta) { const p = partir(texto, ctxC); if (p) return { ...base, ...p }; }

  const esPago = RX.pago.test(t) && !/\b(fiale|fia|fiar|anotale|apuntale|se llevo)\b/.test(t);
  const esFiar = !esPago && (RX.fiar.test(t) || (monto && (elegido || dudosos || ctxC) && !pregunta));
  if (esPago || esFiar) {
    const tipo = esPago ? 'pago' : 'fiar';
    const medio = (MEDIOS_VOZ.find(([rx]) => rx.test(t)) || [null, 'efectivo'])[1];
    const todo = esPago && /\b(todo|todito|completo|al dia|lo que debe|lo que debia)\b/.test(t);
    let que = tipo === 'fiar' ? queLlevo(texto, pal, monto, elegido) : '';
    if (tipo === 'fiar' && !que) que = productoDicho(pal, ignorar, elegido);
    if (/^para\b/.test(normalizar(que)) && fechaEn(normalizar(que))) que = '';
    const fq = tipo === 'fiar' && /\b(para el|para la|para manana|para pasado|paga el|paga la|paga manana|me paga)\b/.test(t) ? fechaEn(t) : null;
    const r = { ...base, tipo, monto: monto ? monto.monto : null, medio, todo, que, oidos, fecha: fq ? isoDia(fq) : null };
    if (dudosos) return { ...r, tipo: 'elegir', para: tipo, opciones: dudosos };
    let c = elegido ? elegido.c : null;
    if (!c) {
      if (tipo === 'fiar') { const n = nombreNuevo(texto, pal, monto); if (n) return { ...r, tipo: 'nuevo', nombre: n, oidos: palabrasDe(n) }; }
      if (ctxC) c = ctxC;
      else return { ...r, tipo: 'falta', que: 'cliente', para: tipo };
    }
    r.c = c;
    if (tipo === 'pago' && todo) r.monto = saldoDe(c.id);
    if (!r.monto && tipo === 'fiar' && que) {
      const k = claveProducto(que), pr = precioDe(k.clave);
      if (pr) { r.monto = pr.p * k.cant; r.items = [{ que, cant: k.cant, unit: pr.p, total: r.monto, fuente: 'memoria' }]; }
    }
    if (!r.monto) return { ...r, tipo: 'falta', que: 'monto', para: tipo, producto: que };
    return r;
  }
  if (pregunta && RX.calle.test(t)) return { ...base, tipo: 'calle' };
  if (elegido && !monto && RX.debe.test(t)) return { ...conC(elegido.c), tipo: 'saldo' };
  /* Entendió a medias: se queda con el cliente o el monto para ofrecer opciones */
  return { ...base, tipo: 'nada', c: elegido ? elegido.c : null, monto: monto ? monto.monto : null, oidos };
}
/** Lo que se llevó: lo que va después de una coma, o después de «de / en» tras el monto. */
function queLlevo(texto, pal, monto, elegido) {
  let tras = texto.split(/[,;]/).slice(1).join(',').trim();
  if (tras && palabrasDe(tras).every(w => cifra(w) !== null || w in NUM_PALABRAS || w in MULT_PALABRAS || ['pesos', 'y', 'media'].includes(w))) tras = '';
  if (tras && /^para\b/i.test(normalizar(tras)) && fechaEn(normalizar(tras))) tras = '';
  let que = tras;
  if (!que && monto) {
    const resto = pal.slice(monto.hasta + 1);
    const k = resto.findIndex(w => w === 'de' || w === 'en');
    if (k >= 0) que = resto.slice(k + 1).join(' ');
  }
  if (!que && monto && pal[monto.desde - 1] === 'de') {
    /* «Lucho se llevó una cerveza de 3 mil»: lo que va antes del «de» */
    const nom = elegido ? palabrasDe(elegido.c.nombre) : [];
    const antes = pal.slice(0, monto.desde - 1).filter(w => !nom.some(n => parecido(w, n) >= 0.8) && !RX.fiar.test(w) && !['se', 'le', 'a', 'al', 'fiao'].includes(w));
    if (antes.length) que = antes.join(' ');
  }
  if (!que) return '';
  /* Se quita el nombre del cliente y las palabras de relleno del principio */
  let w = que.split(/\s+/);
  if (elegido) { const nom = palabrasDe(elegido.c.nombre); w = w.filter(x => !nom.some(n => parecido(normalizar(x), n) >= 0.8)); }
  while (w.length && RELLENO.has(normalizar(w[0])) && !['una', 'un'].includes(normalizar(w[0]))) w.shift();
  const s = w.join(' ').trim();
  return s.length > 1 ? s.charAt(0).toUpperCase() + s.slice(1, LIMITES.que) : '';
}
/** «Fíale una gaseosa a Keyla» (sin monto): lo que sobra después de quitar verbos, cliente y relleno. */
function productoDicho(pal, ignorar, elegido) {
  const w = pal.filter((x, i) => !ignorar.has(i) && !(elegido && elegido.usadas.has(i)) && !VERBO.test(x) && !MEDIO_P.test(x) && !['a', 'al', 'por', 'pesos', 'fiao', 'que', 'hoy', 'ahora', 'ya', 'porfa', 'favor', 'tambien', 'mas', 'le', 'se', 'me'].includes(x));
  while (w.length && ['de', 'del', 'en', 'con', 'y'].includes(w[0])) w.shift();
  while (w.length && ['de', 'del', 'en', 'con', 'y', 'un', 'una'].includes(w[w.length - 1])) w.pop();
  if (!w.some(x => x.length >= 3 && !(x in NUM_PALABRAS))) return '';
  const s = w.join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1, LIMITES.que);
}
/** Para «Fíale mil a Pedro» cuando Pedro no existe: la palabra con mayúscula o la que va después de «a». */
function nombreNuevo(texto, pal, monto) {
  const sinComa = texto.split(/[,;]/)[0];
  const m = sinComa.match(/\ba\s+((?:don|doña|la|el|profe|seño)\s+)?([A-Za-zÁÉÍÓÚÑáéíóúñ]{2,})(\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?/);
  const cand = m ? `${m[1] || ''}${m[2]}${m[3] || ''}`.trim() : (sinComa.match(/\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})\b/) || [])[1];
  if (!cand) return '';
  const n = normalizar(cand);
  if (RELLENO.has(n) || n in NUM_PALABRAS || n in MULT_PALABRAS || RX.fiar.test(n) || VERBO.test(n)) return '';
  return cand.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Varias cosas en una frase. Parte en trozos por comas y «y»; cada trozo puede traer cliente, monto y producto.
 * Devuelve: un lote (dos o más clientes), un fiado con varios productos con precio, un fiado con precio aprendido,
 * o null para que siga el camino de siempre.
 */
function partir(texto, ctxC) {
  const raw = texto.replace(/[¿?¡!]/g, ' ').split(/\s+/).filter(Boolean);
  const segs = [[]];
  raw.forEach((w, i) => {
    const coma = /[,;]$/.test(w), lim = w.replace(/[,;.:]+$/, ''), n = normalizar(lim);
    if ((n === 'y' || n === 'e') && segs[segs.length - 1].length) {
      const prev = normalizar((raw[i - 1] || '').replace(/[,;.:]+$/, '')), sig = normalizar((raw[i + 1] || '').replace(/[,;.:]+$/, ''));
      if (!(DECENAS.has(prev) && sig in NUM_PALABRAS) && !(/^lucas?$/.test(prev) && sig === 'media')) { segs.push([]); return; }
    }
    if (lim) segs[segs.length - 1].push(lim);
    if (coma) segs.push([]);
  });
  const trozos = segs.filter(s => s.length);
  /* «fíale 3 mil a Keyla para el viernes»: una sola orden con fecha, la resuelve el camino de siempre */
  if (trozos.length < 2 && /\b(para el|para la|para manana|para pasado|paga el|paga la|paga manana|me paga)\b/.test(normalizar(texto))) return null;
  const grupos = []; let cur = null, tipoAnt = null, hayCliente = false;
  for (const s of trozos) {
    const toks = []; s.forEach((r, ri) => palabrasDe(r).forEach(n => toks.push({ n, ri })));
    const pal = toks.map(x => x.n), tx = pal.join(' ');
    const m = montoEn(pal);
    const ign = new Set(m ? Array.from({ length: m.hasta - m.desde + 1 }, (_, k) => m.desde + k) : []);
    const { elegido, dudosos } = escoger(clientesEn(pal, ign));
    if (dudosos) return null;
    const tipoSeg = RX.pago.test(tx) && !/\b(fiale|fia|fiar|anotale|apuntale|se llevo)\b/.test(tx) ? 'pago' : RX.fiar.test(tx) ? 'fiar' : null;
    const medio = (MEDIOS_VOZ.find(([rx]) => rx.test(tx)) || [])[1];
    /* Producto: lo que sobra */
    const sobra = new Set(); toks.forEach((x, i) => {
      if (ign.has(i) || (elegido && elegido.usadas.has(i)) || VERBO.test(x.n) || MEDIO_P.test(x.n) || ['a', 'al', 'por', 'pesos', 'peso', 'fiao', 'que', 'hoy', 'ahora', 'ya', 'porfa', 'favor', 'tambien', 'mas', 'todo'].includes(x.n)) return;
      sobra.add(i);
    });
    let idx = [...sobra].sort((a, b) => a - b);
    while (idx.length && ['de', 'del', 'en', 'con', 'le', 'se', 'me', 'lo'].includes(pal[idx[0]])) idx.shift();
    while (idx.length && ['de', 'del', 'en', 'con'].includes(pal[idx[idx.length - 1]])) idx.pop();
    const crudos = [...new Set(idx.map(i => toks[i].ri))].filter(ri => toks.filter(x => x.ri === ri).every((x, k) => idx.includes(toks.indexOf(x))));
    let item = crudos.map(ri => s[ri]).join(' ').trim();
    if (!idx.some(i => pal[i].length >= 3 && !(pal[i] in NUM_PALABRAS) && !TRATOS.has(pal[i]))) item = '';
    if (elegido) {
      hayCliente = true;
      if (!cur || (cur.c && cur.c.id !== elegido.c.id)) { cur = { c: elegido.c, oidos: [...elegido.usadas].map(i => pal[i]), tipo: tipoSeg || tipoAnt, monto: 0, items: [], medio: medio || 'efectivo' }; grupos.push(cur); }
      else if (!cur.c) { cur.c = elegido.c; cur.oidos = [...elegido.usadas].map(i => pal[i]); }
    } else if (!cur) { cur = { c: null, oidos: [], tipo: tipoSeg || tipoAnt, monto: 0, items: [], medio: medio || 'efectivo' }; grupos.push(cur); }
    if (tipoSeg && !cur.tipo) cur.tipo = tipoSeg;
    if (/\b(todo|todito|al dia|lo que debe)\b/.test(tx) && !m) cur.todo = true;
    if (medio) cur.medio = medio;
    tipoAnt = cur.tipo || tipoAnt;
    if (m && item) {
      const k = claveProducto(item), antes = idx.length && idx[idx.length - 1] < m.desde;
      const total = antes && k.cant > 1 ? m.monto * k.cant : m.monto;
      item = item.charAt(0).toUpperCase() + item.slice(1);
      cur.items.push({ que: item, cant: k.cant, unit: antes ? m.monto : Math.round(m.monto / k.cant), total, fuente: 'dicho', clave: antes ? k.clave : '' });
    } else if (m) cur.monto += m.monto;
    else if (item) cur.items.push({ que: item.charAt(0).toUpperCase() + item.slice(1), cant: claveProducto(item).cant, total: null });
  }
  if (!grupos.length) return null;
  grupos.forEach(g => { g.tipo = g.tipo || 'fiar'; });
  /* Precios aprendidos: solo si no se dijo ningún monto en ese grupo */
  grupos.forEach(g => {
    if (g.tipo !== 'fiar' || g.monto || g.items.some(x => x.total)) return;
    g.items.forEach(x => { const k = claveProducto(x.que), pr = precioDe(k.clave); if (pr) Object.assign(x, { unit: pr.p, total: pr.p * k.cant, fuente: 'memoria' }); });
  });
  const totalDe = g => g.tipo === 'pago' && g.todo && g.c && !g.monto ? Math.max(0, saldoDe(g.c.id)) : g.monto + g.items.reduce((s, x) => s + (x.total || 0), 0);
  const queDe = g => {
    const s = g.items.map((x, i) => { const q = i ? x.que.charAt(0).toLowerCase() + x.que.slice(1) : x.que; return x.total && (g.items.filter(y => y.total).length > 1 || g.monto) ? `${q} (${pesos(x.total)})` : q; }).join(', ');
    return s ? (s.charAt(0).toUpperCase() + s.slice(1)).slice(0, LIMITES.que) : '';
  };
  if (grupos.length >= 2) {
    if (!grupos.every(g => g.c && totalDe(g) > 0)) return null;
    const ordenes = grupos.map(g => ({ tipo: g.tipo, c: g.c, oidos: g.oidos, monto: g.tipo === 'pago' ? Math.min(totalDe(g), Math.max(saldoDe(g.c.id), 0)) || totalDe(g) : totalDe(g), que: g.tipo === 'fiar' ? queDe(g) : '', medio: g.medio, items: g.items.filter(x => x.total), aprender: g.items.filter(x => x.clave) }));
    return { tipo: 'lote', ordenes };
  }
  const g = grupos[0];
  if (g.tipo !== 'fiar') return null;
  const conPrecio = g.items.filter(x => x.total);
  const todosConPrecio = g.items.length && conPrecio.length === g.items.length;
  if (!(conPrecio.length >= 2 || (conPrecio.length >= 1 && g.monto > 0) || (!g.monto && todosConPrecio))) return null;
  const c = g.c;
  if (!c) return null;
  const items = g.monto && conPrecio.length ? [...conPrecio, { que: 'Lo demás', cant: 1, total: g.monto }] : conPrecio;
  return { tipo: 'fiar', c, oidos: g.oidos, monto: totalDe(g), que: queDe(g), medio: 'efectivo', items, aprender: conPrecio.filter(x => x.clave) };
}

/** Respuesta a una tarjeta: «sí», «no», o una corrección («no, cuatro mil», «a Yesid», «por Nequi», «súmale mil más»). */
function entenderConfirmacion(texto, r, ctx) {
  const t = normalizar(texto).replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (!t) return null;
  if (/^(si|sii|claro|dale|listo|ok|okey|okay|de una|correcto|eso|exacto|perfecto|confirmo|confirmar|hagale|bueno|asi es|anotelo|anotalo|guardelo|guardalo|va|sale|vale|si senor|si senora)( (si|eso|dale|listo|por favor|porfa|gracias|senor|senora|mijo|mija|anotelo|anotalo|hagale|es|asi|correcto|esta bien))*$/.test(t) || /^esta bien\b/.test(t)) return 'si';
  if (/^(no|cancela|cancelar|cancelelo|cancelalo|olvidalo|olvidelo|dejalo|dejelo|mejor no|nada|para|detente|no no|no gracias)( (gracias|mejor|eso|nada|deje asi|asi|por ahora|todavia))*$/.test(t)) return 'no';
  if (['fiar', 'pago', 'nuevo'].includes(r.tipo)) {
    const s = t.replace(/^no\s+(es\s+|era\s+|sino\s+|fue\s+)?/, '');
    const pal = palabrasDe(s), m = montoEn(pal);
    const ign = new Set(m ? Array.from({ length: m.hasta - m.desde + 1 }, (_, k) => m.desde + k) : []);
    const { elegido } = escoger(clientesEn(pal, ign));
    const nuevo = { ...r, texto: r.texto }; let cambio = false;
    if (m && !(m.monto === r.monto && !/\b(mas|menos|sumale|agregale|quitale|restale)\b/.test(s))) {
      nuevo.monto = /\b(mas|sumale|agregale)\b/.test(s) ? (r.monto || 0) + m.monto : /\b(menos|quitale|restale)\b/.test(s) ? Math.max(0, (r.monto || 0) - m.monto) : m.monto;
      nuevo.items = null; nuevo.aprender = null; cambio = true;
    }
    if (elegido && (!r.c || elegido.c.id !== r.c.id)) {
      aprenderApodo(r.oidos, elegido.c);
      nuevo.c = elegido.c; nuevo.oidos = [...elegido.usadas].map(i => pal[i]); if (nuevo.tipo === 'nuevo') nuevo.tipo = 'fiar'; cambio = true;
    }
    const medio = (MEDIOS_VOZ.find(([rx]) => rx.test(s)) || [])[1];
    if (medio && nuevo.tipo !== 'nuevo' && (medio !== r.medio || (nuevo.tipo === 'fiar' && /\b(pago|pagando|abono)\b/.test(s)))) { nuevo.medio = medio; if (nuevo.tipo === 'fiar' && /\b(pago|pagando|abono)\b/.test(s)) nuevo.tipo = 'pago'; cambio = true; }
    if (/\b(es|era|fue)( un)? pago\b|^pago\b/.test(s) && r.tipo === 'fiar') { nuevo.tipo = 'pago'; nuevo.que = ''; nuevo.medio = nuevo.medio || 'efectivo'; cambio = true; }
    if (/\b(es|era|fue)( un)? fiado\b|^fiado\b/.test(s) && r.tipo === 'pago') { nuevo.tipo = 'fiar'; cambio = true; }
    const q = s.match(/\b(?:se llevo|llevo|es|era|fue|para)\s+((?:una?|unos|unas|el|la|los|las|dos|tres)\s+.+)$/);
    if (q && nuevo.tipo === 'fiar' && !m) { const v = q[1].trim(); nuevo.que = (v.charAt(0).toUpperCase() + v.slice(1)).slice(0, LIMITES.que); cambio = true; }
    if (cambio) return nuevo;
  }
  const x = interpretar(texto, ctx);
  return ['nada', 'falta'].includes(x.tipo) ? null : x;
}

/* ───── 5b · Conoce a cada cliente: lo aprende solo de su historial ───── */
const DIAS_NOMBRE = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'];
function perfilDe(c) {
  const ms = movsDe(c.id).filter(m => !m.anulado && m.tipo !== 'saldo');
  const pagos = ms.filter(m => m.tipo === 'pago'), fiados = ms.filter(m => m.tipo === 'fiado');
  let diaPago = null;
  if (pagos.length >= 3) {
    const cuenta = [0, 0, 0, 0, 0, 0, 0]; pagos.forEach(m => { cuenta[new Date(m.fecha).getDay()]++; });
    const max = Math.max(...cuenta);
    if (max >= 3 && max / pagos.length >= 0.5) diaPago = cuenta.indexOf(max);
  }
  const conteo = new Map();
  fiados.forEach(m => {
    if (!m.que) return;
    const k = normalizar(m.que).trim(), x = conteo.get(k);
    if (x) x.n++; else conteo.set(k, { que: m.que, n: 1, monto: m.monto });
  });
  const habitual = [...conteo.values()].filter(x => x.n >= 2).sort((a, b) => b.n - a.n)[0] || null;
  const promFiado = fiados.length ? Math.round(fiados.reduce((s, m) => s + m.monto, 0) / fiados.length) : 0;
  const dias = [...new Set(ms.map(m => isoDia(new Date(m.fecha))))].sort();
  const cadaCuanto = dias.length >= 3 ? Math.max(1, Math.round((Date.parse(dias.at(-1)) - Date.parse(dias.at(0))) / 864e5 / (dias.length - 1))) : null;
  const ultimo = ms.length ? new Date(ms.at(0).fecha) : null;
  const sinVenir = ultimo ? diasEntre(new Date(ultimo.getFullYear(), ultimo.getMonth(), ultimo.getDate()), new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) : null;
  const conDato = pagos.filter(m => typeof m.aTiempo === 'boolean');
  const puntual = conDato.length >= 3 ? Math.round(100 * conDato.filter(m => m.aTiempo).length / conDato.length) : null;
  return { diaPago, habitual, promFiado, cadaCuanto, sinVenir, puntual, nFiados: fiados.length, nPagos: pagos.length, ultimoPago: pagos.at(0) || null };
}
/** El próximo día de la semana `d` (si hoy es ese día, el de la otra semana). */
function proximoDia(d, desde = new Date()) {
  const h = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  let n = (d - h.getDay() + 7) % 7; if (n === 0) n = 7;
  return sumarDias(h, n);
}
/** Líneas cortas de lo que Fiao sabe de un cliente (hechos, nunca juicios). */
function lineasPerfil(c) {
  const p = perfilDe(c), s = saldoDe(c.id), e = estadoDe(c), out = [];
  out.push(s > 0 ? `Debe ${pesos(s)}${e.tipo === 'atrasado' ? `, ${e.dias} ${e.dias === 1 ? 'día' : 'días'} de atraso` : ''}.` : 'Está al día.');
  if (p.diaPago !== null) out.push(`Suele pagar los ${DIAS_NOMBRE[p.diaPago]}.`);
  if (p.puntual !== null) out.push(`Ha pagado a tiempo ${p.puntual} de cada 100 veces.`);
  if (p.habitual) out.push(`Lo que más lleva: ${p.habitual.que.toLowerCase()} (${pesos(p.habitual.monto)}).`);
  else if (p.promFiado) out.push(`En promedio le fía ${pesos(p.promFiado)}.`);
  if (p.cadaCuanto) out.push(`Viene cada ${p.cadaCuanto === 1 ? 'día' : `${p.cadaCuanto} días`}${p.sinVenir ? `; la última vez fue hace ${p.sinVenir} ${p.sinVenir === 1 ? 'día' : 'días'}` : '; vino hoy'}.`);
  return out;
}

/* ───── 5c · Propone: el saludo del día y lo que conviene hacer ───── */
function saludoDelDia() {
  const hoy = isoDia(new Date());
  const pagan = clientes().filter(c => c.proximaFecha === hoy && saldoDe(c.id) > 0);
  const atrasados = aQuienRevisar().filter(x => x.tipo === 'atrasado').sort((a, b) => saldoDe(b.c.id) - saldoDe(a.c.id));
  const partes = [];
  if (pagan.length) {
    const nombres = pagan.slice(0, 3).map(c => nombreCorto(c.nombre));
    const lista = nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}` : nombres[0];
    partes.push(`Hoy ${pagan.length === 1 ? 'paga' : 'pagan'} ${lista}${pagan.length > 3 ? ` y ${pagan.length - 3} más` : ''}: ${pesos(pagan.reduce((s, c) => s + saldoDe(c.id), 0))}.`);
  } else partes.push('Hoy nadie tiene fecha de pago.');
  if (atrasados.length) { const a = atrasados[0], e = estadoDe(a.c); partes.push(`${nombreCorto(a.c.nombre)} va ${e.dias} ${e.dias === 1 ? 'día' : 'días'} atrasado${atrasados.length > 1 ? ` y hay ${atrasados.length - 1} más` : ''}.`); }
  return partes.join(' ');
}
/** Hasta tres cosas que conviene hacer ahora, como botones. */
function sugerencias() {
  const out = [], hoy = isoDia(new Date()), hora = new Date().getHours();
  const atr = aQuienRevisar().filter(x => x.tipo === 'atrasado').map(x => x.c).sort((a, b) => saldoDe(b.id) - saldoDe(a.id));
  const recordable = atr.find(c => c.cel && permisoOk(c) && !recordadoHoy(c.id));
  if (recordable && puedeRecordarAhora()) out.push({ texto: `Recordarle a ${nombreCorto(recordable.nombre)}`, frase: `Recuérdale a ${recordable.nombre}` });
  if (clientes().some(c => c.proximaFecha === hoy && saldoDe(c.id) > 0)) out.push({ texto: '¿Quién paga hoy?', frase: '¿Quién paga hoy?' });
  if (hora >= 17) out.push({ texto: 'Cerrar el día', frase: 'cierre del día' });
  if (aQuienRevisar().some(x => x.tipo === 'ausente')) out.push({ texto: '¿Quién no viene?', frase: '¿Quién no viene hace rato?' });
  out.push({ texto: '¿Quién me debe más?', frase: '¿Quién me debe más?' });
  return out.slice(0, 3);
}
function htmlPropone() {
  if (!clientes().length) return '';
  return `<p class="asis-hoy">${esc(saludoDelDia())}</p>
    <div class="asis-sugerencias" role="group" aria-label="Sugerencias">${sugerencias().map((x, i) => `<button type="button" class="chip" data-sug="${i}">${esc(x.texto)}</button>`).join('')}</div>`;
}
/** Freno antes de fiar: hechos, no juicios. */
function frenoAlFiar(c, montoNuevo) {
  const e = estadoDe(c), p = perfilDe(c), s = saldoDe(c.id);
  if (e.tipo === 'atrasado' && e.dias >= 3) return `${nombreCorto(c.nombre)} va ${e.dias} días atrasado y debe ${pesos(s)}.`;
  if (p.nFiados >= 3 && p.promFiado && montoNuevo >= 3 * p.promFiado) return `Es más del triple de lo que suele llevar (${pesos(p.promFiado)}).`;
  if (p.ultimoPago && s > 0 && p.nPagos >= 2) { const d = diasEntre(new Date(p.ultimoPago.fecha), new Date()); if (d >= 30) return `No paga hace ${d} días y debe ${pesos(s)}.`; }
  return '';
}

/* ───── 5d · Varias órdenes distintas en una frase: «fíale 5 mil a Keyla y recuérdale a Yesid» ───── */
const PASO_OK = new Set(['fiar', 'pago', 'nuevo', 'fecha', 'cupo', 'cliente', 'celular', 'recordar', 'recibo', 'saldo', 'cuando', 'calle', 'quien', 'hoy', 'llevo', 'cupoq', 'pagan', 'ausentes', 'perfil', 'periodo', 'cierre', 'atiende']);
const PREGUNTAS = new Set(['saldo', 'cuando', 'calle', 'quien', 'hoy', 'llevo', 'cupoq', 'pagan', 'ausentes', 'perfil', 'periodo', 'cierre']);
function clausulas(texto) {
  const VERB = '(?:recu[eé]rd|env[ií]|p[oó]n|cambi|qu[ií]t|agreg|ab[oó]n|pag[oó]|f[ií]a|f[ií]e|an[oó]t|ap[uú]nt|d[ií]me|d[ií]game|cu[aá]nt|qui[eé]n|cu[aá]nd|mu[eé]str|busc|abr|cobr|esc[rí]ib|m[aá]nd|tamb)';
  const corte = new RegExp(`[.;?](?=\\s|$)|,?\\s+y\\s+(?:luego|despu[eé]s|tambi[eé]n|adem[aá]s)\\s+|,?\\s+(?:luego|despu[eé]s|adem[aá]s)\\s+|,?\\s+y\\s+(?=(?:a\\s+\\S+\\s+)?${VERB})|,\\s*(?=${VERB})`, 'i');
  return texto.split(corte).map(x => (x || '').trim()).filter(x => x && /\p{L}/u.test(x));
}
function interpretarPlan(texto, ctx) {
  const cl = clausulas(texto);
  if (cl.length < 2) return null;
  let c = ctx, pasos = [];
  for (const f of cl) {
    const r = interpretar(f, c);
    if (r.tipo === 'lote') { pasos.push(...r.ordenes.map(o => ({ ...o, texto: f }))); c = { tipo: 'fiar', c: r.ordenes.at(-1).c, cuando: Date.now() }; continue; }
    if (!PASO_OK.has(r.tipo)) return null;
    pasos.push(r);
    if (r.c) c = { tipo: r.tipo, c: r.c, monto: r.monto, que: r.que, medio: r.medio, cuando: Date.now() };
  }
  if (pasos.filter(x => ['recordar', 'recibo'].includes(x.tipo)).length > 1) return null;
  /* Lo que abre WhatsApp va de último */
  pasos.sort((a, b) => (['recordar', 'recibo'].includes(a.tipo) ? 1 : 0) - (['recordar', 'recibo'].includes(b.tipo) ? 1 : 0));
  return { tipo: 'plan', texto, pasos };
}
/** La respuesta de una pregunta en una línea (para el plan y para leer en voz). */
function textoRespuesta(r) {
  const n = r.c ? nombreCorto(r.c.nombre) : '';
  switch (r.tipo) {
    case 'saldo': { const s = saldoDe(r.c.id); return s > 0 ? `${n} le debe ${pesos(s)}.` : `${n} no le debe nada.`; }
    case 'cuando': { const e = estadoDe(r.c); return e.tipo === 'nada' ? `${n} no le debe nada.` : e.tipo === 'sinFecha' ? `${n} no tiene día de pago.` : e.tipo === 'atrasado' ? `${n} va ${e.dias} días atrasado.` : e.tipo === 'hoy' ? `${n} paga hoy.` : `${n} paga ${elDia(e.fecha)}.`; }
    case 'calle': return `Tiene ${pesos(totalEnLaCalle())} en la calle.`;
    case 'quien': { const l = quienesDebenMas(3); return l.length ? `Más deben: ${l.map(x => `${nombreCorto(x.c.nombre)} ${pesos(x.s)}`).join(', ')}.` : 'Nadie le debe.'; }
    case 'hoy': { const x = datosCuadre(); return `Hoy fió ${pesos(x.h.fiado)} y cobró ${pesos(x.h.pagos)}.`; }
    case 'cierre': return textoCierre();
    case 'perfil': return lineasPerfil(r.c).slice(0, 2).join(' ');
    case 'cupoq': { const s = Math.max(0, saldoDe(r.c.id)); return !r.c.cupo ? `${n} no tiene cupo.` : `A ${n} le quedan ${pesos(Math.max(0, r.c.cupo - s))} de cupo.`; }
    case 'llevo': { const m = movsDe(r.c.id).find(x => x.tipo === 'fiado' && !x.anulado); return m ? `Lo último de ${n}: ${m.que || 'sin detalle'}, ${pesos(m.monto)}.` : `${n} no tiene fiados.`; }
    case 'pagan': { const dia = isoDia(sumarDias(new Date(), r.dia === 'manana' ? 1 : 0)); const l = clientes().filter(c => c.proximaFecha === dia && saldoDe(c.id) > 0); return l.length ? `Pagan: ${l.map(c => nombreCorto(c.nombre)).join(', ')}.` : 'Nadie paga ese día.'; }
    case 'ausentes': { const l = aQuienRevisar().filter(x => x.tipo === 'ausente'); return l.length ? `No vienen hace rato: ${l.slice(0, 4).map(x => nombreCorto(x.c.nombre)).join(', ')}.` : 'Nadie se ha perdido.'; }
    default: return resumenOrden(r) + '.';
  }
}
function textoCierre() {
  const x = datosCuadre();
  const man = x.manana.map(c => nombreCorto(c.nombre));
  return `Hoy fió ${pesos(x.h.fiado)} y cobró ${pesos(x.h.pagos)}. En la calle quedan ${pesos(x.calle)}.${man.length ? ` Mañana ${man.length === 1 ? 'paga' : 'pagan'} ${man.slice(0, 3).join(', ')}${man.length > 3 ? ` y ${man.length - 3} más` : ''}.` : ' Mañana nadie tiene fecha.'}`;
}

/* ───── 6 · La voz del navegador (si está) ───── */
const Oido = {
  clase: window.SpeechRecognition || window.webkitSpeechRecognition || null,
  r: null,
  hay() { return !!this.clase; },
  escuchar({ parcial = () => {}, final, error, fin }) {
    if (!this.clase) { error('no-hay'); return; }
    try { this.r?.abort(); } catch (e) { /* nada */ }
    let r;
    try { r = new this.clase(); } catch (e) { error('no-arranca'); return; }
    this.r = r;
    r.lang = 'es-CO'; r.interimResults = true; r.maxAlternatives = 3; r.continuous = false;
    let ultimo = '';
    const vivo = () => this.r === r;
    r.onresult = ev => {
      if (!vivo()) return;
      const res = ev.results[ev.results.length - 1];
      const alts = Array.from(res).map(a => a.transcript.trim());
      ultimo = alts[0];
      if (res.isFinal) final(alts); else parcial(ultimo);
    };
    r.onerror = ev => { if (vivo()) error(ev.error || 'error'); };
    r.onend = () => { if (vivo()) fin(ultimo); };
    try { r.start(); } catch (e) { error('no-arranca'); }
  },
  parar() { try { this.r?.stop(); } catch (e) { /* nada */ } },
  cancelar() { const r = this.r; this.r = null; try { r?.abort(); } catch (e) { /* nada */ } }
};
/** Fiao lee la respuesta con la voz del celular (si el tendero no la apagó). `luego` corre al terminar de hablar. */
function leerEnVoz(texto, luego = null) {
  const t = tienda();
  if (t.asistenteVoz === false || !('speechSynthesis' in window)) { if (luego) setTimeout(luego, 150); return; }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto.replace(/\$/g, '').replace(/(\d)\.(\d{3})/g, '$1$2') + ''); u.lang = 'es-CO'; u.rate = 1;
    const vs = speechSynthesis.getVoices(); const v = vs.find(x => /^es(-|_)CO/i.test(x.lang)) || vs.find(x => /^es(-|_)(US|MX|419)/i.test(x.lang)) || vs.find(x => /^es/i.test(x.lang));
    if (v) u.voice = v;
    if (luego) {
      let hecho = false; const una = () => { if (!hecho) { hecho = true; luego(); } };
      u.onend = () => setTimeout(una, 250); u.onerror = una;
      setTimeout(una, Math.max(2500, texto.length * 85));
    }
    speechSynthesis.speak(u);
  } catch (e) { if (luego) setTimeout(luego, 150); }
}

/* ───── 7 · La hoja «Dígale a Fiao» ───── */
function ejemplosVoz(n = 3) {
  const nn = clientes().slice(0, 2).map(c => nombreCorto(c.nombre));
  const a = nn[0] || 'Keyla', b = nn[1] || 'Yesid';
  const todos = [`«Fíale cinco mil a ${a}»`, `«${b} pagó diez mil por Nequi»`, '«¿Quién me debe más?»', `«Fíale lo de siempre a ${a}»`, `«¿Cómo es ${b}?»`, `«Fíale 2 mil a ${a} y recuérdale a ${b}»`, `«¿Cuándo paga ${b}?»`, `«Fíale 3 mil a ${a} y 2 mil a ${b}»`, `«${a} paga el viernes»`, '«¿Cuánto me pagaron esta semana?»', `«Recuérdale a ${b}»`];
  return todos.slice(0, n);
}
const AVISO_VOZ = 'Su voz la convierte en texto el servicio de su celular (Google o Apple). Lo que dice se entiende y se guarda solo en este celular.';
const MEDIO_TXT = { efectivo: 'En efectivo', nequi: 'Por Nequi', breb: 'Por Bre-B', otro: 'Otro medio' };

function abrirAsistente({ escribir = false } = {}) {
  if (!Datos.tienda) return;
  const usarVoz = Oido.hay() && !escribir && !Asistente.sinVoz;
  abrirHoja(`${cabHoja('Dígale a Fiao')}<div class="asis" aria-live="polite"></div>`, d => {
    Asistente.hoja = d; Asistente.reintentos = 0;
    if (usarVoz) Asistente.pasoEscuchar(); else Asistente.pasoEscribir();
  }, { nombre: 'asistente' });
  const d = document.getElementById('hoja');
  d.addEventListener('close', () => { Oido.cancelar(); Asistente.pend = null; try { speechSynthesis.cancel(); } catch (e) { /* nada */ } }, { once: true });
}

/** Lo que Fiao entendió, dicho en limpio (en vez de lo que oyó el celular, que a veces dice «envíale» por «fíale»). */
function resumenOrden(r) {
  const n = r.c ? nombreCorto(r.c.nombre) : r.nombre || '';
  const RANGO = { ayer: 'ayer', semana: 'esta semana', mes: 'este mes', quincena: 'esta quincena' };
  const s = {
    fiar: () => `fiar ${pesos(r.monto)} a ${n}`, pago: () => `pago de ${pesos(r.monto)} de ${n}`, nuevo: () => `fiar ${pesos(r.monto)} a ${n} (nuevo)`,
    lote: () => `${r.ordenes.length} cosas para anotar`, saldo: () => `cuánto le debe ${n}`, calle: () => 'cuánto hay en la calle',
    quien: () => r.atrasados ? 'quién está atrasado' : 'quién le debe más', hoy: () => 'cómo va hoy', cuando: () => `cuándo paga ${n}`,
    llevo: () => `qué se ha llevado ${n}`, cupoq: () => `el cupo de ${n}`, periodo: () => `cuánto ${r.cual === 'fiado' ? 'fió' : 'le pagaron'}${r.c ? ` a ${n}` : ''} ${RANGO[r.rango]}`,
    pagan: () => `quién paga ${r.dia === 'manana' ? 'mañana' : 'hoy'}`, ausentes: () => 'quién no viene hace rato', recordar: () => `recordarle a ${n}`,
    deshacer: () => 'deshacer lo último', fecha: () => `nueva fecha de pago para ${n}`, cupo: () => `cambiar el cupo de ${n}`,
    falta: () => r.c ? ({ fiar: `fiarle a ${n}`, pago: `pago de ${n}`, cupo: `cambiar el cupo de ${n}` }[r.para] || '') : '',
    perfil: () => `qué sé de ${n}`, cierre: () => 'el cierre del día', plan: () => `${r.pasos.length} cosas en una sola orden`,
    sinCostumbre: () => `fiarle a ${n} lo de siempre`,
    cliente: () => `agregar a ${n}`, celular: () => `guardar el celular de ${n}`, yaEsta: () => `agregar a ${n}`, recibo: () => `enviarle el recibo a ${n}`, atiende: () => 'cambiar quién atiende'
  }[r.tipo];
  return s ? mayuscula(s()) : '';
}

const Asistente = {
  hoja: null, sinVoz: false, pend: null, ctx: null, porVoz: false, reintentos: 0,
  caja() { return this.hoja?.querySelector('.asis'); },
  pintar(html, montar = () => {}) {
    const c = this.caja(); if (!c) return;
    Oido.cancelar();
    c.innerHTML = html; montar(c);
    c.querySelectorAll('[data-asis="otra"]').forEach(b => b.addEventListener('click', () => this.sinVoz || !Oido.hay() ? this.pasoEscribir() : this.pasoEscuchar()));
    c.querySelectorAll('[data-asis="escribir"]').forEach(b => b.addEventListener('click', () => this.pasoEscribir()));
    c.querySelectorAll('[data-asis="cerrar"]').forEach(b => b.addEventListener('click', () => cerrarHoja()));
    const sug = c.querySelector('.asis-sugerencias') ? sugerencias() : [];
    c.querySelectorAll('[data-sug]').forEach(b => b.addEventListener('click', () => { this.porVoz = false; this.entender([sug[+b.dataset.sug].frase]); }));
  },
  recordar(r) { if (r.c) this.ctx = { tipo: r.tipo, c: r.c, monto: r.monto, que: r.que, medio: r.medio, cuando: Date.now() }; },
  pasoEscuchar() {
    this.pend = null;
    this.pintar(`${htmlPropone()}<button type="button" class="asis-mic escucha" data-asis="mic" aria-label="Escuchando. Toque para terminar">${ic('microfono', 40, 2.2)}</button>
      <p class="asis-estado">Le escucho…</p>
      <p class="asis-texto" aria-live="polite"></p>
      <p class="ayuda asis-ejemplos">Por ejemplo: ${ejemplosVoz().join(' · ')}</p>
      <button type="button" class="btn-link" data-asis="escribir">${ic('lapiz', 20, 2.2)}Prefiero escribir</button>
      <p class="ayuda asis-privacidad">${AVISO_VOZ}</p>`, c => {
      const est = c.querySelector('.asis-estado'), tx = c.querySelector('.asis-texto'), mic = c.querySelector('.asis-mic');
      let listo = false;
      mic.addEventListener('click', () => { if (mic.classList.contains('escucha')) Oido.parar(); else this.pasoEscuchar(); });
      Oido.escuchar({
        parcial: s => { tx.textContent = `«${s}»`; },
        final: alts => { listo = true; mic.classList.remove('escucha'); this.porVoz = true; this.entender(alts); },
        error: e => {
          listo = true; mic.classList.remove('escucha');
          if (e === 'no-speech' || e === 'aborted') { est.textContent = 'No le oí. Toque el micrófono y hable otra vez.'; mic.setAttribute('aria-label', 'Hablar otra vez'); return; }
          /* Sin permiso, sin internet o sin servicio (iPhone con la app instalada): se pasa a escribir, sin drama. */
          this.sinVoz = ['not-allowed', 'service-not-allowed', 'no-hay', 'no-arranca', 'audio-capture', 'network'].includes(e);
          this.pasoEscribir(e === 'network' ? 'Sin internet, la voz del navegador no funciona. Escriba la orden o use el micrófono de su teclado.' : 'Escriba la orden o toque el micrófono de su teclado para dictarla.');
        },
        fin: ultimo => {
          if (listo) return;
          mic.classList.remove('escucha');
          if (ultimo) { this.porVoz = true; this.entender([ultimo]); } else { est.textContent = 'No le oí. Toque el micrófono y hable otra vez.'; mic.setAttribute('aria-label', 'Hablar otra vez'); }
        }
      });
    });
  },
  pasoEscribir(nota = '', valor = '') {
    this.pend = null;
    this.pintar(`${nota ? `<p class="asis-nota">${esc(nota)}</p>` : valor ? '' : htmlPropone()}
      <form class="asis-form" novalidate><label class="leyenda" for="asis-orden">¿Qué hago?</label>
        <input class="entrada" id="asis-orden" autocomplete="off" enterkeyhint="go" maxlength="160" placeholder="Ej.: Fíale cinco mil a Keyla" value="${esc(valor)}">
        <p class="ayuda">${Oido.hay() && !this.sinVoz ? '' : 'Puede dictarla con el micrófono de su teclado. '}Por ejemplo: ${ejemplosVoz().join(' · ')}</p>
        <button type="submit" class="btn">${ic('ok', 22, 2.4)}Listo</button></form>
      ${Oido.hay() && !this.sinVoz ? `<button type="button" class="btn-link" data-asis="otra">${ic('microfono', 20, 2.2)}Mejor se lo digo</button>` : ''}
      <p class="ayuda asis-privacidad">${AVISO_VOZ}</p>`, c => {
      const inp = c.querySelector('#asis-orden'); setTimeout(() => inp.focus(), 250);
      c.querySelector('form').addEventListener('submit', ev => {
        ev.preventDefault(); const v = inp.value.trim(); if (!v) return;
        this.porVoz = false;
        if (this.pendAnterior) { const x = entenderConfirmacion(v, this.pendAnterior.r, this.ctx); this.pendAnterior = null; if (x && typeof x === 'object') return this.responder(x); }
        this.entender([v]);
      });
    });
  },
  /** Prueba las alternativas del reconocedor y se queda con la primera que se entiende completa. */
  entender(alts) {
    for (const a of alts.slice(0, 1)) { const plan = interpretarPlan(a, this.ctx); if (plan) return this.responder(plan); }
    let r = null;
    for (const a of alts) { const x = interpretar(a, this.ctx); if (!r || (r.tipo === 'nada' && x.tipo !== 'nada') || (['falta', 'elegir'].includes(r.tipo) && !['falta', 'elegir', 'nada'].includes(x.tipo))) r = x; if (!['nada', 'falta', 'elegir'].includes(x.tipo)) break; }
    this.responder(r);
  },
  dicho(r) {
    const s = resumenOrden(r);
    return s ? `<p class="asis-dicho"><span class="asis-entendi">Entendí:</span> ${esc(s)}</p>` : `<p class="asis-dicho">Oí: «${esc(r.texto)}»</p>`;
  },
  /** Fila para responder hablando bajo una tarjeta. */
  oido() {
    return Oido.hay() && !this.sinVoz ? `<div class="asis-oido"><button type="button" class="asis-mic-chico" data-asis="responder" aria-label="Responder hablando">${ic('microfono', 22, 2.2)}</button><span class="asis-oido-txt">Diga «sí», «no» o corrija: «no, cuatro mil»</span></div>` : '';
  },
  /** Deja la tarjeta esperando: botones siempre; si se habló, Fiao lee la pregunta y escucha la respuesta. */
  esperar(r, ejecutar, voz) {
    this.pend = { r, ejecutar }; this.pendAnterior = null;
    const c = this.caja(); if (!c) return;
    c.querySelector('[data-asis="responder"]')?.addEventListener('click', () => this.escucharRespuesta());
    c.querySelector('[data-asis="corregir"]')?.addEventListener('click', () => { this.pendAnterior = this.pend; this.pasoEscribir('', r.texto); });
    const sigue = () => { if (this.pend && this.pend.r === r && this.porVoz) this.escucharRespuesta(); };
    if (voz && !Vista.oculto) leerEnVoz(voz, sigue); else if (this.porVoz) setTimeout(sigue, 200);
  },
  escucharRespuesta() {
    const c = this.caja(), fila = c?.querySelector('.asis-oido'); if (!fila || !this.pend) return;
    const txt = fila.querySelector('.asis-oido-txt'), b = fila.querySelector('.asis-mic-chico');
    b.classList.add('escucha'); txt.textContent = 'Le escucho…';
    const pend = this.pend;
    const quieto = msg => { b.classList.remove('escucha'); txt.textContent = msg; };
    Oido.escuchar({
      parcial: s => { txt.textContent = `«${s}»`; },
      final: alts => { b.classList.remove('escucha'); this.alResponder(alts, pend); },
      error: e => quieto(e === 'no-speech' ? 'No le oí. Toque el micrófono para responder.' : 'Toque un botón o el micrófono para responder.'),
      fin: u => { if (!u) quieto('Toque el micrófono para responder.'); }
    });
  },
  alResponder(alts, pend) {
    if (this.pend !== pend) return;
    let x = null;
    const t0 = normalizar(alts[0] || '');
    if (pend.r.tipo === 'fiar' && /^(si|dale|listo|ok|claro|bueno|de una)\b/.test(t0)) {
      const f = fechaEn(t0);
      if (f) pend.r.fecha = isoDia(f); else if (/\b(fecha|ese dia|esa fecha|ponsela|ponle)\b/.test(t0) && pend.r.sugFecha) pend.r.fecha = pend.r.sugFecha;
      if (f || pend.r.fecha) return pend.ejecutar();
    }
    for (const a of alts) { x = entenderConfirmacion(a, pend.r, this.ctx); if (x) break; }
    if (x === 'si') return pend.ejecutar();
    if (x === 'no') { this.pend = null; cerrarHoja(); return avisar('Listo, no anoté nada.', { icono: 'ok' }); }
    if (x && typeof x === 'object') {
      const a = pend.r;
      /* Repetir la misma orden es confirmarla */
      if (x.tipo === a.tipo && (x.c?.id || '') === (a.c?.id || '') && (x.monto ?? null) === (a.monto ?? null) && (x.medio || '') === (a.medio || '') && x.tipo !== 'lote') return pend.ejecutar();
      this.reintentos = 0; return this.responder(x);
    }
    const fila = this.caja()?.querySelector('.asis-oido-txt');
    if (this.reintentos++ < 1) { if (fila) fila.textContent = 'No le entendí. Diga «sí», «no» o corrija.'; leerEnVoz('No le entendí. Diga sí, no, o corrija.', () => this.escucharRespuesta()); }
    else if (fila) fila.textContent = 'Toque un botón o el micrófono para responder.';
  },
  responder(r) {
    this.pend = null;
    const n = c => esc(nombreCorto(c.nombre));
    const listo = (titulo, extra = '', botones = `<button type="button" class="btn" data-asis="cerrar">Listo</button>`) => {
      this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>${titulo}</b>${extra}</div>${botones}<button type="button" class="btn-link" data-asis="otra">Decirle otra cosa</button>`);
      this.recordar(r);
    };
    const hablar = s => { if (!Vista.oculto) leerEnVoz(s); };
    switch (r.tipo) {
      case 'fiar': case 'pago': return this.confirmarMov(r);
      case 'lote': return this.confirmarLote(r);
      case 'nuevo': return this.confirmarNuevo(r);
      case 'elegir': return this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>¿A cuál se refiere?</b></div>
          <div class="asis-opciones">${r.opciones.map((c, i) => `<button type="button" class="btn-sec" data-i="${i}">${esc(c.nombre)}</button>`).join('')}</div>
          <button type="button" class="btn-link" data-asis="otra">Decirlo otra vez</button>`, c => {
          c.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => {
            const cl = r.opciones[+b.dataset.i];
            aprenderApodo(r.oidos, cl);
            this.seguirCon(r, cl);
          }));
        });
      case 'falta':
        if (r.que === 'monto' && r.c) return this.preguntarMonto(r);
        if (r.que === 'nombre') return listo('¿Cómo se llama el cliente?', '<span>Dígalo así: «Agrega a Pedro, celular 300 123 4567».</span>', `<button type="button" class="btn" data-asis="otra">${ic('microfono', 22, 2.2)}Decirlo otra vez</button>`);
        return this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>¿A quién?</b><span>No encontré a ese cliente en su libreta.</span></div>
          <div class="asis-opciones">${clientes().slice(0, 6).map((c, i) => `<button type="button" class="btn-sec" data-i="${i}">${esc(nombreCorto(c.nombre))}</button>`).join('')}</div>
          <button type="button" class="btn-link" data-asis="otra">Decirlo otra vez</button>`, c => {
          const lista = clientes().slice(0, 6);
          c.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => { const cl = lista[+b.dataset.i]; aprenderApodo(r.oidos, cl); this.seguirCon(r, cl); }));
        });
      case 'saldo': {
        const s = saldoDe(r.c.id), e = estadoDe(r.c);
        const t = s > 0 ? `${nombreCorto(r.c.nombre)} le debe ${monto(s)}.` : `${nombreCorto(r.c.nombre)} no le debe nada.`;
        const extra = s > 0 && e.tipo === 'atrasado' ? `<span>Está atrasado ${e.dias} ${e.dias === 1 ? 'día' : 'días'}.</span>` : s > 0 && r.c.proximaFecha ? `<span>Acordaron pagar ${elDia(diaDe(r.c.proximaFecha))}.</span>` : '';
        hablar(t + (extra ? ' ' + extra.replace(/<[^>]+>/g, '') : ''));
        return listo(esc(t), extra, `<a class="btn" href="#cliente-${r.c.id}">Ver la cuenta de ${n(r.c)}</a>`);
      }
      case 'cuando': {
        const e = estadoDe(r.c), nn = nombreCorto(r.c.nombre);
        const t = e.tipo === 'nada' ? `${nn} no le debe nada.` : e.tipo === 'sinFecha' ? `${nn} no tiene día de pago acordado.` : e.tipo === 'atrasado' ? `${nn} debía pagar ${elDia(e.fecha)}: va ${e.dias} ${e.dias === 1 ? 'día' : 'días'} atrasado.` : e.tipo === 'hoy' ? `${nn} paga hoy.` : `${nn} paga ${elDia(e.fecha)}.`;
        hablar(t + (e.saldo > 0 ? ` Debe ${pesos(e.saldo)}.` : ''));
        return listo(esc(t), e.saldo > 0 ? `<span>Debe ${monto(e.saldo)}.${e.tipo === 'sinFecha' ? ` Dígame «${esc(nn)} paga el viernes» para ponerle fecha.` : ''}</span>` : '');
      }
      case 'llevo': {
        const lista = movsDe(r.c.id).filter(m => m.tipo === 'fiado' && !m.anulado).slice(0, 4), nn = nombreCorto(r.c.nombre);
        if (!lista.length) { hablar(`${nn} no tiene fiados.`); return listo(`${esc(nn)} no tiene fiados.`); }
        hablar(`Lo último de ${nn}: ` + lista.slice(0, 3).map(m => `${m.que || 'sin detalle'}, ${pesos(m.monto)}`).join('; ') + '.');
        return listo(`Lo último que se llevó ${esc(nn)}:`, `<ul class="asis-lista">${lista.map(m => `<li>${esc(m.que || 'Sin detalle')} <b>${monto(m.monto)}</b> <span class="asis-cuando">${esc(elDia(new Date(m.fecha)))}</span></li>`).join('')}</ul>`, `<a class="btn" href="#cliente-${r.c.id}">Ver la cuenta de ${n(r.c)}</a>`);
      }
      case 'cupoq': {
        const s = Math.max(0, saldoDe(r.c.id)), nn = nombreCorto(r.c.nombre);
        const t = !r.c.cupo ? `${nn} no tiene cupo: se le puede fiar sin límite.` : s >= r.c.cupo ? `${nn} ya llegó al cupo de ${pesos(r.c.cupo)}.` : `A ${nn} le quedan ${pesos(r.c.cupo - s)} de cupo.`;
        hablar(t);
        return listo(esc(t), r.c.cupo ? `<span>Cupo de ${monto(r.c.cupo)}; debe ${monto(s)}.</span>` : `<span>Para ponerlo, dígame «Ponle cupo de 50 mil a ${esc(nn)}».</span>`);
      }
      case 'periodo': {
        const hoy = new Date(), h = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const desde = r.rango === 'ayer' ? sumarDias(h, -1) : r.rango === 'semana' ? sumarDias(h, -6) : r.rango === 'mes' ? new Date(h.getFullYear(), h.getMonth(), 1) : new Date(h.getFullYear(), h.getMonth(), h.getDate() <= 15 ? 1 : 16);
        const hasta = r.rango === 'ayer' ? h : sumarDias(h, 1);
        const movs = [...Datos.movs.values()].filter(m => !m.anulado && m.tipo === (r.cual === 'fiado' ? 'fiado' : 'pago') && (!r.c || m.clienteId === r.c.id) && new Date(m.fecha) >= desde && new Date(m.fecha) < hasta);
        const total = movs.reduce((s, m) => s + m.monto, 0);
        const RANGO = { ayer: 'ayer', semana: 'en los últimos 7 días', mes: 'este mes', quincena: 'esta quincena' };
        const quien = r.c ? (r.cual === 'fiado' ? ` a ${nombreCorto(r.c.nombre)}` : ` ${nombreCorto(r.c.nombre)}`) : '';
        const t = r.cual === 'fiado' ? `Fió ${pesos(total)}${quien} ${RANGO[r.rango]}.` : `${r.c ? `${nombreCorto(r.c.nombre)} le pagó` : 'Le pagaron'} ${pesos(total)} ${RANGO[r.rango]}.`;
        hablar(t);
        return listo(esc(t).replace(pesos(total), monto(total)), `<span>${movs.length} ${r.cual === 'fiado' ? (movs.length === 1 ? 'fiado' : 'fiados') : (movs.length === 1 ? 'pago' : 'pagos')}.</span>`, `<a class="btn" href="#resumen">Ver el resumen</a>`);
      }
      case 'pagan': {
        const dia = isoDia(sumarDias(new Date(), r.dia === 'manana' ? 1 : 0));
        const lista = clientes().filter(c => c.proximaFecha === dia && saldoDe(c.id) > 0);
        const cuando = r.dia === 'manana' ? 'mañana' : 'hoy';
        if (!lista.length) { hablar(`Nadie paga ${cuando}.`); return listo(`Nadie paga ${cuando}.`); }
        hablar(`Pagan ${cuando}: ` + lista.slice(0, 4).map(c => `${nombreCorto(c.nombre)}, ${pesos(saldoDe(c.id))}`).join('; ') + '.');
        return listo(`Pagan ${cuando}:`, `<ol class="asis-lista">${lista.map(c => `<li><a href="#cliente-${c.id}">${esc(nombreCorto(c.nombre))}</a> <b>${monto(saldoDe(c.id))}</b></li>`).join('')}</ol>`);
      }
      case 'ausentes': {
        const lista = aQuienRevisar().filter(x => x.tipo === 'ausente').slice(0, 5);
        if (!lista.length) { hablar('Todos los que deben han venido en las últimas tres semanas.'); return listo('Nadie se ha perdido.', '<span>Todos los que deben han venido en las últimas tres semanas.</span>'); }
        hablar('No vienen hace rato: ' + lista.map(x => nombreCorto(x.c.nombre)).join(', ') + '.');
        return listo('No vienen hace rato:', `<ol class="asis-lista">${lista.map(x => `<li><a href="#cliente-${x.c.id}">${esc(nombreCorto(x.c.nombre))}</a> <b>${monto(saldoDe(x.c.id))}</b></li>`).join('')}</ol>`);
      }
      case 'calle': {
        const total = totalEnLaCalle(), lista = clientes(), alDia = lista.filter(c => estadoDe(c).tipo !== 'atrasado').length;
        const t = `Tiene ${monto(total)} en la calle.`;
        hablar(`Tiene ${pesos(total)} en la calle. ${alDia} de ${lista.length} clientes están al día.`);
        return listo(esc(t), `<span>${alDia} de ${lista.length} clientes están al día.</span>`);
      }
      case 'quien': {
        const lista = r.atrasados ? aQuienRevisar().filter(x => x.tipo === 'atrasado').map(x => ({ c: x.c, s: saldoDe(x.c.id) })).slice(0, 3) : quienesDebenMas(3);
        if (!lista.length) { leerEnVoz(r.atrasados ? 'Nadie está atrasado.' : 'Nadie le debe.'); return listo(r.atrasados ? 'Nadie está atrasado.' : 'Nadie le debe. ¡Libreta al día!'); }
        hablar(`${r.atrasados ? 'Atrasados' : 'Los que más deben'}: ${lista.map(x => `${nombreCorto(x.c.nombre)}, ${pesos(x.s)}`).join('; ')}.`);
        return listo(r.atrasados ? 'Están atrasados:' : 'Los que más le deben:', `<ol class="asis-lista">${lista.map(x => `<li><a href="#cliente-${x.c.id}">${esc(nombreCorto(x.c.nombre))}</a> <b>${monto(x.s)}</b></li>`).join('')}</ol>`);
      }
      case 'hoy': {
        const x = datosCuadre();
        const t = `Hoy fió ${monto(x.h.fiado)} y cobró ${monto(x.h.pagos)}.`;
        hablar(`Hoy fió ${pesos(x.h.fiado)} y cobró ${pesos(x.h.pagos)}.`);
        return listo(esc(t), `<span>${x.h.nFiado} ${x.h.nFiado === 1 ? 'fiado' : 'fiados'} y ${x.h.nPagos} ${x.h.nPagos === 1 ? 'pago' : 'pagos'}.</span>`, `<a class="btn" href="#cuadre">Ver el cuadre de hoy</a>`);
      }
      case 'perfil': {
        const l = lineasPerfil(r.c); hablar(`${nombreCorto(r.c.nombre)}. ` + l.join(' '));
        return listo(`Lo que sé de ${n(r.c)}:`, `<ul class="asis-lista">${l.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`, `<a class="btn" href="#cliente-${r.c.id}">Ver la cuenta de ${n(r.c)}</a>`);
      }
      case 'cierre': {
        const t = textoCierre(); hablar(t);
        return listo('Cierre del día', `<span>${esc(t)}</span>`, `<a class="btn" href="#cuadre">Ver el cuadre de hoy</a>`);
      }
      case 'sinCostumbre': return listo(`${n(r.c)} todavía no tiene un «lo de siempre».`, '<span>Lo aprendo cuando le fíe lo mismo dos veces con su detalle.</span>');
      case 'plan': return this.confirmarPlan(r);
      case 'recordar': return this.confirmarRecordar(r);
      case 'recibo': return this.confirmarRecibo(r);
      case 'fecha': return this.confirmarFecha(r);
      case 'cupo': return this.confirmarCupo(r);
      case 'cliente': case 'celular': return this.confirmarCliente(r);
      case 'yaEsta': return listo(`${n(r.c)} ya está en su libreta.`, '', `<a class="btn" href="#cliente-${r.c.id}">Ver la cuenta de ${n(r.c)}</a>`);
      case 'atiende': {
        if (!r.persona) return listo('¿Quién atiende?', `<span>Las personas que atienden se agregan en Ajustes → Tienda. Ahora están: ${esc((tienda().atienden || []).join(', ') || 'nadie')}.</span>`);
        const t = tienda(); t.atiendeAhora = r.persona; guardarTienda(t); mostrarRuta({ animar: false });
        hablar(`Listo. Ahora atiende ${r.persona}.`);
        return listo(`Ahora atiende ${esc(r.persona)}.`, '<span>Lo que se anote queda a su nombre.</span>');
      }
      case 'mostrar': this.recordar(r); cerrarHoja(); return setTimeout(() => ir(`cuenta-${r.c.id}`), 200);
      case 'ficha': this.recordar(r); cerrarHoja(); return setTimeout(() => ir(`cliente-${r.c.id}`), 200);
      case 'ir': cerrarHoja(); return setTimeout(() => ir(r.ruta), 200);
      case 'ocultar': case 'destapar':
        Vista.oculto = r.tipo === 'ocultar'; cerrarHoja(); mostrarRuta({ animar: false });
        return avisar(Vista.oculto ? 'Montos ocultos.' : 'Montos visibles.', { icono: Vista.oculto ? 'ojoNo' : 'ojo' });
      case 'deshacer': return this.confirmarDeshacer(r);
      default:
        if (r.c || r.monto) return this.aMedias(r);
        return this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>No le entendí bien.</b><span>Sé fiar, anotar pagos, poner fechas y cupos, agregar clientes, recordar y responder preguntas. Pruebe así:</span>
          <ul class="asis-lista">${ejemplosVoz(6).map(e => `<li>${e}</li>`).join('')}</ul></div>
          <button type="button" class="btn" data-asis="otra">${ic('microfono', 22, 2.2)}Intentar otra vez</button>
          <button type="button" class="btn-link" data-asis="escribir">Escribirlo</button>`);
    }
  },
  /** Entendió el cliente o el monto, pero no qué hacer: ofrece las opciones en vez de rendirse. */
  aMedias(r) {
    const c = r.c, n = c ? esc(nombreCorto(c.nombre)) : '', m = r.monto;
    const ops = c ? [
      { t: m ? `Fiarle ${pesos(m)}` : 'Fiarle', r: { ...r, tipo: m ? 'fiar' : 'falta', que: m ? '' : 'monto', para: 'fiar', medio: 'efectivo' } },
      { t: m ? `Anotar pago de ${pesos(m)}` : 'Anotar un pago', r: { ...r, tipo: m ? 'pago' : 'falta', que: m ? '' : 'monto', para: 'pago', medio: 'efectivo' } },
      { t: '¿Cuánto debe?', r: { ...r, tipo: 'saldo' } },
      { t: 'Lo que sé de ' + nombreCorto(c.nombre), r: { ...r, tipo: 'perfil' } }
    ] : [
      { t: `Fiar ${pesos(m)}`, r: { ...r, tipo: 'falta', que: 'cliente', para: 'fiar', monto: m } },
      { t: `Anotar pago de ${pesos(m)}`, r: { ...r, tipo: 'falta', que: 'cliente', para: 'pago', monto: m } }
    ];
    this.pintar(`<p class="asis-dicho">Oí: «${esc(r.texto)}»</p><div class="asis-respuesta"><b>${c ? `¿Qué hago con ${n}?` : `¿Qué hago con ${pesos(m)}?`}</b></div>
      <div class="asis-opciones">${ops.map((o, i) => `<button type="button" class="btn-sec" data-op="${i}">${esc(o.t)}</button>`).join('')}</div>
      <button type="button" class="btn-link" data-asis="otra">Decirlo otra vez</button>`, el => {
      el.querySelectorAll('[data-op]').forEach(b => b.addEventListener('click', () => this.responder(ops[+b.dataset.op].r)));
    });
    if (this.porVoz) leerEnVoz(c ? `¿Qué hago con ${nombreCorto(c.nombre)}?` : `¿Qué hago con ${pesos(m)}?`);
  },
  /** Varias órdenes distintas: una tarjeta con todos los pasos; las preguntas se responden ahí mismo. */
  confirmarPlan(r) {
    const acciones = r.pasos.filter(p => !PREGUNTAS.has(p.tipo));
    const linea = p => {
      if (PREGUNTAS.has(p.tipo)) return `<li><span><span>${esc(textoRespuesta(p))}</span><small>Respuesta</small></span></li>`;
      const det = p.tipo === 'fiar' || p.tipo === 'pago' || p.tipo === 'nuevo' ? pesos(p.monto) : p.tipo === 'fecha' ? fechaCorta(diaDe(p.fecha)) : p.tipo === 'cupo' ? (p.cupo ? pesos(p.cupo) : 'sin cupo') : '';
      return `<li><span><span>${esc(resumenOrden({ ...p, monto: p.monto }))}</span>${p.que ? `<small>${esc(p.que)}</small>` : ''}</span>${det ? `<b>${esc(det)}</b>` : ''}</li>`;
    };
    this.pintar(`${this.dicho(r)}<div class="asis-tarjeta lote"><span class="asis-tipo">${r.pasos.length} pasos</span><ul class="asis-desglose asis-filas">${r.pasos.map(linea).join('')}</ul></div>
      ${acciones.length ? `<button type="button" class="btn fiar" data-asis="si">${ic('ok', 24, 2.6)}${acciones.length === 1 ? 'Sí, hacerlo' : `Sí, hacer los ${acciones.length}`}</button>${this.oido()}` : ''}
      <button type="button" class="btn-sec" data-asis="corregir">Corregir lo que dije</button>
      <button type="button" class="btn-link" data-asis="cerrar">${acciones.length ? 'Cancelar' : 'Listo'}</button>`);
    const preguntas = r.pasos.filter(p => PREGUNTAS.has(p.tipo)).map(textoRespuesta).join(' ');
    if (!acciones.length) { if (!Vista.oculto) leerEnVoz(preguntas); this.caja().querySelector('[data-asis="corregir"]')?.addEventListener('click', () => this.pasoEscribir('', r.texto)); return; }
    const ejecutar = async () => {
      this.pend = null; const b = this.caja()?.querySelector('[data-asis="si"]'); if (b) b.disabled = true;
      let hechos = 0, whats = null, ultimo = null;
      for (const p of acciones) {
        if (p.tipo === 'fiar') { ultimo = await registrarFiado({ c: p.c, monto: p.monto, que: p.que || '' }); guardarPrecios(p.aprender); if (p.fecha) { p.c.proximaFecha = p.fecha; await guardarCliente(p.c); } }
        else if (p.tipo === 'pago') { const s = saldoDe(p.c.id); if (s <= 0) continue; ultimo = await registrarPago({ c: p.c, monto: Math.min(p.monto, s), medio: p.medio || 'efectivo', recibio: tienda().atiendeAhora }); }
        else if (p.tipo === 'nuevo') { const c = clienteNuevo(p.nombre, ''); await guardarCliente(c); ultimo = await registrarFiado({ c, monto: p.monto, que: p.que || '' }); }
        else if (p.tipo === 'fecha') { if (saldoDe(p.c.id) <= 0) continue; p.c.proximaFecha = p.fecha; await guardarCliente(p.c); }
        else if (p.tipo === 'cupo') { p.c.cupo = p.cupo; await guardarCliente(p.c); }
        else if (p.tipo === 'cliente') { await guardarCliente(clienteNuevo(p.nombre, p.cel || '')); }
        else if (p.tipo === 'celular') { p.c.cel = p.cel; await guardarCliente(p.c); }
        else if (p.tipo === 'atiende') { if (!p.persona) continue; const t = tienda(); t.atiendeAhora = p.persona; await guardarTienda(t); }
        else if (p.tipo === 'recordar' || p.tipo === 'recibo') { whats = p; continue; }
        hechos++;
      }
      const ult = [...acciones].reverse().find(p => p.c); if (ult) this.recordar(ult);
      cerrarHoja(); mostrarRuta({ animar: false }); if (ultimo) emitir('anotado');
      if (whats) {
        const c = whats.c, e = estadoDe(c);
        if (whats.tipo === 'recordar' && c.cel && permisoOk(c) && e.saldo > 0 && puedeRecordarAhora() && !recordadoHoy(c.id)) { abrirWhatsApp(c.cel, mensajeRecordatorio(c, e)); await registrarContacto(c.id, 'recordatorio'); hechos++; }
        else if (whats.tipo === 'recibo') { const m = movsDe(c.id).find(x => x.tipo !== 'saldo' && !x.anulado); if (m) { setTimeout(() => enviarRecibo(c, m), 320); hechos++; } }
        else { avisar(`Listo: ${hechos} ${hechos === 1 ? 'cosa hecha' : 'cosas hechas'}. A ${nombreCorto(c.nombre)} no se le puede recordar ahora.`, { icono: 'atencion' }); return; }
      }
      avisar(`Listo: ${hechos} ${hechos === 1 ? 'cosa hecha' : 'cosas hechas'}.`, { icono: 'ok' });
    };
    this.caja().querySelector('[data-asis="si"]').addEventListener('click', ejecutar);
    const voz = (preguntas ? preguntas + ' ' : '') + acciones.map(p => resumenOrden(p)).join('; ') + `. ¿Lo hago?`;
    this.esperar(r, ejecutar, voz);
  },
  /** Después de elegir el cliente en una lista, sigue con lo que se había pedido. */
  seguirCon(r, cl) {
    const sig = { ...r, tipo: r.para, c: cl, oidos: [] };
    if (sig.tipo === 'pago' && sig.todo) sig.monto = saldoDe(cl.id);
    if (['fiar', 'pago'].includes(sig.tipo) && !sig.monto) return this.responder({ ...sig, tipo: 'falta', que: 'monto' });
    if (sig.tipo === 'cupo' && sig.cupo === undefined) return this.responder({ ...sig, tipo: 'falta', que: 'monto', para: 'cupo' });
    this.responder(sig);
  },
  preguntarMonto(r) {
    const n = esc(nombreCorto(r.c.nombre)), prod = r.producto || r.que || '';
    const etiqueta = r.para === 'pago' ? `¿Cuánto pagó ${n}?` : r.para === 'cupo' ? `¿De cuánto es el cupo de ${n}?` : prod ? `¿Cuánto vale ${esc(prod.toLowerCase())}?` : `¿Cuánto le fía a ${n}?`;
    this.pintar(`${this.dicho(r)}<form class="asis-form" novalidate><label class="leyenda" for="asis-monto">${etiqueta}</label>
      <div class="con-prefijo"><span class="prefijo" aria-hidden="true">$</span><input class="entrada" id="asis-monto" inputmode="numeric" autocomplete="off" placeholder="Ej.: 5.000"></div>
      <p class="error" role="alert" hidden></p><button type="submit" class="btn">Seguir</button></form>`, c => {
      const inp = c.querySelector('#asis-monto'); setTimeout(() => inp.focus(), 250);
      c.querySelector('form').addEventListener('submit', ev => {
        ev.preventDefault(); const m = montoEn(palabrasDe(inp.value)) || (cifra(inp.value.replace(/\s/g, '')) ? { monto: cifra(inp.value.replace(/\s/g, '')) } : null);
        if (!m || m.monto <= 0) { const e = c.querySelector('.error'); e.textContent = 'Escriba el monto, por ejemplo 5.000.'; e.hidden = false; return; }
        if (r.para === 'cupo') return this.responder({ ...r, tipo: 'cupo', cupo: m.monto });
        const sig = { ...r, tipo: r.para, monto: m.monto };
        /* «Fíale una gaseosa a Keyla» + «2.500»: Fiao aprende el precio de la gaseosa */
        if (r.para === 'fiar' && prod) { const k = claveProducto(prod); if (k.clave && k.clave.split(' ').length <= 3) sig.aprender = [{ clave: k.clave, unit: Math.round(m.monto / k.cant) }]; }
        this.responder(sig);
      });
    });
    if (this.porVoz) leerEnVoz(etiqueta.replace(/<[^>]+>/g, ''));
  },
  confirmarMov(r) {
    const c = r.c, n = esc(nombreCorto(c.nombre)), pago = r.tipo === 'pago', saldo = saldoDe(c.id);
    if (pago && saldo <= 0) { this.recordar(r); return this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>${n} no le debe nada.</b><span>No hay pago que anotar.</span></div><button type="button" class="btn" data-asis="cerrar">Listo</button>`); }
    const montoReal = pago ? Math.min(r.monto, saldo) : r.monto;
    const queda = pago ? saldo - montoReal : saldo + montoReal;
    const pasa = !pago && c.cupo && queda > c.cupo ? queda - c.cupo : 0;
    const items = !pago && r.items && r.items.length ? r.items : null;
    const freno = !pago ? frenoAlFiar(c, montoReal) : '';
    const perfil = !pago ? perfilDe(c) : null;
    const sugFecha = !pago && !r.fecha && perfil.diaPago !== null ? isoDia(proximoDia(perfil.diaPago)) : null;
    const fechaHoy = sugFecha && c.proximaFecha === sugFecha && saldo > 0;
    this.pintar(`${this.dicho({ ...r, monto: montoReal })}<div class="asis-tarjeta ${pago ? 'pago' : 'fiado'}">
        <span class="asis-tipo">${pago ? 'Pago' : 'Fiado'}</span><b class="asis-monto">${pesos(montoReal)}</b>
        <span class="asis-quien">${pago ? 'de' : 'a'} <b>${n}</b></span>
        ${items ? `<ul class="asis-desglose">${items.map(x => `<li><span>${esc(x.que)}${x.cant > 1 ? ` · ${x.cant} × ${pesos(x.unit)}` : ''}</span><b>${pesos(x.total)}</b></li>`).join('')}</ul>${items.some(x => x.fuente === 'memoria') ? '<span class="asis-detalle">Con el precio de la última vez</span>' : ''}`
          : !pago && r.que ? `<span class="asis-detalle">${esc(r.que)}</span>` : ''}
        ${pago ? `<span class="asis-detalle">${MEDIO_TXT[r.medio] || ''}${r.monto > saldo ? ` · debía ${pesos(saldo)}` : ''}</span>` : ''}
        <span class="asis-queda">${queda > 0 ? `Queda debiendo ${pesos(queda)}` : 'Queda al día'}</span>
        ${!pago && r.fecha ? `<span class="asis-detalle">${ic('calendario', 18, 2.2)} Paga el ${esc(fechaLarga(diaDe(r.fecha)))}</span>` : ''}
        ${pasa ? `<span class="pildora atencion">${ic('atencion', 18, 2.2)}Pasa el cupo por ${pesos(pasa)}</span>` : ''}
        ${freno ? `<span class="pildora atencion asis-freno">${ic('atencion', 18, 2.2)}${esc(freno)}</span>` : ''}</div>
      ${sugFecha && !fechaHoy ? `<button type="button" class="chip asis-sugfecha" aria-pressed="false" data-fecha="${sugFecha}">${ic('calendario', 18, 2.2)}Suele pagar los ${DIAS_NOMBRE[perfil.diaPago]}: poner el ${esc(fechaCorta(diaDe(sugFecha)))}</button>` : ''}
      <button type="button" class="btn ${pago ? 'verde' : 'fiar'}" data-asis="si">${ic('ok', 24, 2.6)}Sí, anótelo</button>
      ${this.oido()}
      <button type="button" class="btn-sec" data-asis="corregir">Corregir lo que dije</button>
      <button type="button" class="btn-link" data-asis="cerrar">Cancelar</button>`, () => {});
    const ejecutar = async () => {
      this.pend = null; const b = this.caja()?.querySelector('[data-asis="si"]'); if (b) b.disabled = true;
      const m = pago ? await registrarPago({ c, monto: montoReal, medio: r.medio, recibio: tienda().atiendeAhora }) : await registrarFiado({ c, monto: montoReal, que: r.que || '' });
      if (!pago) guardarPrecios(r.aprender);
      if (!pago && r.fecha) { c.proximaFecha = r.fecha; await guardarCliente(c); }
      this.recordar({ ...r, monto: montoReal });
      cerrarHoja(); mostrarRuta({ animar: false }); emitir(pago ? 'pagado' : 'anotado'); avisoTrasMov(m);
    };
    this.caja().querySelector('[data-asis="si"]').addEventListener('click', ejecutar);
    const chipF = this.caja().querySelector('.asis-sugfecha');
    chipF?.addEventListener('click', () => { const on = chipF.getAttribute('aria-pressed') !== 'true'; chipF.setAttribute('aria-pressed', on); r.fecha = on ? chipF.dataset.fecha : null; });
    r.sugFecha = sugFecha && !fechaHoy ? sugFecha : null;
    this.esperar(r, ejecutar, `${pago ? 'Pago' : 'Fiado'} de ${pesos(montoReal)} ${pago ? 'de' : 'a'} ${nombreCorto(c.nombre)}.${freno ? ` Ojo: ${freno}` : ''}${r.sugFecha ? ` Suele pagar los ${DIAS_NOMBRE[perfil.diaPago]}.` : ''} ¿Lo anoto?`);
  },
  confirmarLote(r) {
    const k = r.ordenes.length;
    const total = r.ordenes.reduce((s, o) => s + (o.tipo === 'pago' ? -o.monto : o.monto), 0);
    this.pintar(`${this.dicho(r)}<div class="asis-tarjeta lote"><span class="asis-tipo">${k} movimientos</span>
        <ul class="asis-desglose asis-filas">${r.ordenes.map(o => `<li><span><span>${o.tipo === 'pago' ? 'Pago de' : 'Fiado a'} <b>${esc(nombreCorto(o.c.nombre))}</b></span>${o.que ? `<small>${esc(o.que)}</small>` : ''}${o.tipo === 'pago' ? `<small>${MEDIO_TXT[o.medio] || ''}</small>` : ''}</span><b>${pesos(o.monto)}</b></li>`).join('')}</ul></div>
      <button type="button" class="btn fiar" data-asis="si">${ic('ok', 24, 2.6)}Sí, anotar los ${k}</button>
      ${this.oido()}
      <button type="button" class="btn-sec" data-asis="corregir">Corregir lo que dije</button>
      <button type="button" class="btn-link" data-asis="cerrar">Cancelar</button>`);
    const ejecutar = async () => {
      this.pend = null; const b = this.caja()?.querySelector('[data-asis="si"]'); if (b) b.disabled = true;
      let hechos = 0, ultimo = null;
      for (const o of r.ordenes) {
        if (o.tipo === 'pago') { const s = saldoDe(o.c.id); if (s <= 0) continue; ultimo = await registrarPago({ c: o.c, monto: Math.min(o.monto, s), medio: o.medio, recibio: tienda().atiendeAhora }); }
        else { ultimo = await registrarFiado({ c: o.c, monto: o.monto, que: o.que || '' }); guardarPrecios(o.aprender); }
        hechos++;
      }
      const ult = r.ordenes[r.ordenes.length - 1]; this.recordar(ult);
      cerrarHoja(); mostrarRuta({ animar: false }); emitir('anotado');
      avisar(`Listo: ${hechos} ${hechos === 1 ? 'anotado' : 'anotados'}.`, { icono: 'ok' });
    };
    this.caja().querySelector('[data-asis="si"]').addEventListener('click', ejecutar);
    this.esperar(r, ejecutar, r.ordenes.map(o => `${o.tipo === 'pago' ? 'pago de' : 'fiado a'} ${nombreCorto(o.c.nombre)}, ${pesos(o.monto)}`).join('; ') + `. ¿Anoto los ${k}?`);
  },
  confirmarNuevo(r) {
    const n = esc(r.nombre);
    if (!r.monto) return this.pintar(`${this.dicho({ ...r, tipo: 'nada' })}<div class="asis-respuesta"><b>${n} no está en su libreta.</b><span>Dígame cuánto le fía para agregarlo.</span></div><button type="button" class="btn" data-asis="otra">Decirlo otra vez</button>`);
    this.pintar(`${this.dicho(r)}<div class="asis-tarjeta fiado"><span class="asis-tipo">Cliente nuevo y fiado</span><b class="asis-monto">${pesos(r.monto)}</b>
        <span class="asis-quien">a <b>${n}</b></span>${r.que ? `<span class="asis-detalle">${esc(r.que)}</span>` : ''}
        <span class="asis-queda">${n} no estaba en su libreta: lo agrego. Su celular lo puede poner después.</span></div>
      <button type="button" class="btn fiar" data-asis="si">${ic('ok', 24, 2.6)}Agregar y anotar</button>
      ${this.oido()}
      <button type="button" class="btn-sec" data-asis="corregir">Corregir lo que dije</button>
      <button type="button" class="btn-link" data-asis="cerrar">Cancelar</button>`);
    const ejecutar = async () => {
      this.pend = null; const b = this.caja()?.querySelector('[data-asis="si"]'); if (b) b.disabled = true;
      const c = clienteNuevo(r.nombre, '');
      await guardarCliente(c);
      const m = await registrarFiado({ c, monto: r.monto, que: r.que || '' });
      this.recordar({ ...r, tipo: 'fiar', c });
      cerrarHoja(); mostrarRuta({ animar: false }); emitir('anotado'); avisoTrasMov(m, { clienteNuevo: true });
    };
    this.caja().querySelector('[data-asis="si"]').addEventListener('click', ejecutar);
    this.esperar(r, ejecutar, `${r.nombre} no está en su libreta. ¿Lo agrego y le fío ${pesos(r.monto)}?`);
  },
  /** Tarjeta sencilla de confirmar (fecha, cupo, cliente, celular, recibo, recordar, deshacer). */
  confirmarSimple(r, { titulo, detalle = '', boton, icono = 'ok', clase = 'btn', voz, hacer }) {
    this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>${titulo}</b>${detalle}</div>
      <button type="button" class="${clase}" data-asis="si">${ic(icono, 22, 2.4)}${boton}</button>
      ${this.oido()}
      <button type="button" class="btn-link" data-asis="cerrar">Cancelar</button>`);
    const ejecutar = async () => { this.pend = null; const b = this.caja()?.querySelector('[data-asis="si"]'); if (b) b.disabled = true; this.recordar(r); await hacer(); };
    this.caja().querySelector('[data-asis="si"]').addEventListener('click', ejecutar);
    this.esperar(r, ejecutar, voz);
  },
  confirmarFecha(r) {
    const c = r.c, nn = nombreCorto(c.nombre), dia = diaDe(r.fecha), s = saldoDe(c.id);
    if (s <= 0) { this.recordar(r); return this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>${esc(nn)} no le debe nada.</b><span>La fecha de pago se pone cuando le fíe.</span></div><button type="button" class="btn" data-asis="cerrar">Listo</button>`); }
    this.confirmarSimple(r, {
      titulo: `¿${esc(nn)} paga el ${esc(fechaLarga(dia))}?`, detalle: `<span>${c.proximaFecha ? `Tenían acordado ${esc(elDia(diaDe(c.proximaFecha)))}.` : 'No tenían un día acordado.'} Debe ${monto(s)}.</span>`,
      boton: `Sí, el ${esc(fechaCorta(dia))}`, icono: 'calendario', voz: `¿${nn} paga el ${fechaLarga(dia)}?`,
      hacer: async () => {
        c.proximaFecha = r.fecha; await guardarCliente(c); cerrarHoja(); mostrarRuta({ animar: false });
        avisar(`Quedó para el ${fechaLarga(dia)}.`, { icono: 'calendario', acciones: permisoOk(c) ? [{ texto: 'Avisarle', fuerte: true, fn: () => abrirWhatsApp(c.cel, mensajeFechaAceptada(c, r.fecha)) }] : [] });
      }
    });
  },
  confirmarCupo(r) {
    const c = r.c, nn = nombreCorto(c.nombre);
    this.confirmarSimple(r, {
      titulo: r.cupo ? `¿Cupo de ${pesos(r.cupo)} para ${esc(nn)}?` : `¿Le quito el cupo a ${esc(nn)}?`,
      detalle: `<span>${c.cupo ? `Ahora tiene ${monto(c.cupo)}.` : 'Ahora no tiene cupo.'} Debe ${monto(Math.max(0, saldoDe(c.id)))}.</span>`,
      boton: r.cupo ? `Sí, ${pesos(r.cupo)}` : 'Sí, sin cupo', icono: 'mano', voz: r.cupo ? `¿Cupo de ${pesos(r.cupo)} para ${nn}?` : `¿Le quito el cupo a ${nn}?`,
      hacer: async () => { c.cupo = r.cupo; await guardarCliente(c); cerrarHoja(); mostrarRuta({ animar: false }); avisar(r.cupo ? `${nn} quedó con cupo de ${pesos(r.cupo)}.` : `${nn} quedó sin cupo.`, { icono: 'ok' }); }
    });
  },
  confirmarCliente(r) {
    if (r.tipo === 'celular') {
      const c = r.c, nn = nombreCorto(c.nombre), cel = r.cel.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
      return this.confirmarSimple(r, {
        titulo: `¿Guardo el celular de ${esc(nn)}?`, detalle: `<span class="asis-cel">${esc(cel)}</span>${c.cel ? `<span>Reemplaza el que tenía: ${esc(c.cel)}.</span>` : ''}`,
        boton: 'Sí, guardarlo', voz: `¿Guardo el celular de ${nn}?`,
        hacer: async () => { c.cel = r.cel; await guardarCliente(c); cerrarHoja(); mostrarRuta({ animar: false }); avisar(`Listo, guardé el celular de ${nn}.`, { icono: 'ok' }); }
      });
    }
    const cel = r.cel ? r.cel.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3') : '';
    this.confirmarSimple(r, {
      titulo: `¿Agrego a ${esc(r.nombre)}?`, detalle: `<span>${cel ? `Celular ${esc(cel)}.` : 'Sin celular por ahora.'} Paga cada quincena; eso se cambia en su cuenta.</span>`,
      boton: `Sí, agregar a ${esc(r.nombre)}`, icono: 'mas', voz: `¿Agrego a ${r.nombre}?`,
      hacer: async () => {
        const c = clienteNuevo(r.nombre, r.cel || ''); await guardarCliente(c); this.ctx = { tipo: 'cliente', c, cuando: Date.now() };
        cerrarHoja(); mostrarRuta({ animar: false }); avisar(`Listo, ${r.nombre} quedó en su libreta.`, { icono: 'ok', acciones: [{ texto: 'Ver', fn: () => ir(`cliente-${c.id}`) }] });
      }
    });
  },
  confirmarRecibo(r) {
    const c = r.c, nn = nombreCorto(c.nombre);
    const m = movsDe(c.id).find(x => x.tipo !== 'saldo' && !x.anulado);
    if (!m) { this.recordar(r); return this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>${esc(nn)} no tiene movimientos.</b></div><button type="button" class="btn" data-asis="cerrar">Entendido</button>`); }
    const que = `${m.tipo === 'pago' ? 'el pago' : 'el fiado'} de ${pesos(m.monto)} ${elDia(new Date(m.fecha))}`;
    this.confirmarSimple(r, {
      titulo: `¿Le envío a ${esc(nn)} el recibo?`, detalle: `<span>Es ${esc(que)}.</span>`, boton: `Enviar recibo a ${esc(nn)}`, icono: 'whatsapp',
      voz: `¿Le envío a ${nn} el recibo de ${que}?`,
      hacer: async () => { cerrarHoja(); setTimeout(() => enviarRecibo(c, m), 320); }
    });
  },
  confirmarRecordar(r) {
    const c = r.c, n = esc(nombreCorto(c.nombre)), e = estadoDe(c);
    const no = msg => { this.recordar(r); this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>${msg}</b></div><button type="button" class="btn" data-asis="cerrar">Entendido</button>`); if (!Vista.oculto) leerEnVoz(msg.replace(/<[^>]+>/g, '')); };
    if (e.saldo <= 0) return no(`${n} no le debe nada.`);
    if (!c.cel) return no(`${n} no tiene celular anotado. Dígame: «El celular de ${n} es…».`);
    if (!permisoOk(c)) return no(`${n} aún no ha aceptado mensajes por WhatsApp.`);
    if (!puedeRecordarAhora()) return no(esc(motivoNoRecordar()));
    if (recordadoHoy(c.id)) return no('Ya se le recordó hoy. La ley permite uno al día.');
    this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>¿Le recuerdo a ${n} por WhatsApp?</b><span>Debe ${monto(e.saldo)}.</span></div>
      <div class="burbuja" style="font-size:1rem;line-height:1.45">${esc(mensajeRecordatorio(c, e))}</div>
      <button type="button" class="btn" data-asis="si">${ic('whatsapp', 22)}Recordarle a ${n}</button>
      ${this.oido()}
      <button type="button" class="btn-link" data-asis="cerrar">Cancelar</button>`);
    const ejecutar = async () => {
      this.pend = null; this.recordar(r);
      abrirWhatsApp(c.cel, mensajeRecordatorio(c, e)); await registrarContacto(c.id, 'recordatorio');
      cerrarHoja(); mostrarRuta({ animar: false }); avisar(`Abrimos WhatsApp con el recordatorio para ${nombreCorto(c.nombre)}.`);
    };
    this.caja().querySelector('[data-asis="si"]').addEventListener('click', ejecutar);
    this.esperar(r, ejecutar, `¿Le recuerdo a ${nombreCorto(c.nombre)} por WhatsApp? Debe ${pesos(e.saldo)}.`);
  },
  confirmarDeshacer(r) {
    const ult = [...Datos.movs.values()].filter(m => m.tipo !== 'saldo').sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    if (!ult || !sePuedeDeshacer(ult)) return this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>Ya no se puede deshacer.</b><span>Pasó más de un minuto o ya se envió. Puede corregirlo o anularlo en el historial del cliente.</span></div><button type="button" class="btn" data-asis="cerrar">Entendido</button>`);
    const c = cliente(ult.clienteId), n = esc(nombreCorto(c.nombre));
    const que = ult.tipo === 'pago' ? `el pago de ${pesos(ult.monto)} de ${nombreCorto(c.nombre)}` : `el fiado de ${pesos(ult.monto)} a ${nombreCorto(c.nombre)}`;
    this.confirmarSimple(r, {
      titulo: `¿Deshago ${esc(que)}?`, boton: 'Sí, deshacerlo', icono: 'girar', clase: 'btn-sec', voz: `¿Deshago ${que}?`,
      hacer: async () => {
        const ok = await deshacerMov(ult); cerrarHoja(); mostrarRuta({ animar: false });
        avisar(ok ? 'Listo, se deshizo.' : 'Ya no se puede deshacer. Puede corregirlo en el historial.', { icono: ok ? 'girar' : 'atencion' });
      }
    });
  }
};
/** Un cliente nuevo con lo mismo que pone el formulario de «Nuevo cliente». */
function clienteNuevo(nombre, cel) {
  return { id: uid(), nombre: nombre.slice(0, LIMITES.nombre), cel: cel || '', cupo: null, pago: 'quincena', recibos: 'whatsapp', recordar: 'atraso', detalle: '', lista: null, permiso: { estado: 'ninguno', fecha: null }, proximaFecha: null, creado: new Date().toISOString() };
}

/* ───── 8 · Mantener presionado «Fiar» abre el asistente (si está encendido en Ajustes) ───── */
(() => {
  let reloj = 0, largo = false, x0 = 0, y0 = 0;
  const activo = () => !!(Datos.tienda && tienda().asistente);
  document.addEventListener('pointerdown', ev => {
    const b = ev.target.closest('.nav .fiar'); if (!b || !activo()) return;
    largo = false; x0 = ev.clientX; y0 = ev.clientY; b.classList.add('apretado');
    reloj = setTimeout(() => { largo = true; b.classList.remove('apretado'); vibrar(30); abrirAsistente(); }, 450);
  });
  const soltar = () => { clearTimeout(reloj); document.querySelectorAll('.nav .fiar.apretado').forEach(b => b.classList.remove('apretado')); };
  document.addEventListener('pointerup', soltar); document.addEventListener('pointercancel', soltar);
  document.addEventListener('pointermove', ev => { if (reloj && (Math.abs(ev.clientX - x0) > 12 || Math.abs(ev.clientY - y0) > 12)) soltar(); });
  /* Si fue largo, el toque no abre también la hoja de fiar */
  document.addEventListener('click', ev => { if (largo && ev.target.closest('.nav .fiar')) { ev.stopImmediatePropagation(); ev.preventDefault(); largo = false; } }, true);
  document.addEventListener('contextmenu', ev => { if (ev.target.closest('.nav .fiar') && activo()) ev.preventDefault(); });
  document.addEventListener('click', ev => { if (ev.target.closest('[data-accion="asistente"]')) { cerrarHoja(); setTimeout(() => abrirAsistente(), 300); } });
  /* El saludo del día: la primera vez que se abre la Libreta cada día, si el asistente está encendido */
  const saludar = (intentos = 0) => {
    if (!Datos.tienda) { if (intentos < 40) setTimeout(() => saludar(intentos + 1), 500); return; }
    const t = tienda(), hoy = isoDia(new Date());
    if (!t.asistente || t.saludoDia === hoy || !clientes().length) return;
    if (!['', '#', '#inicio'].includes(location.hash) || document.querySelector('#hoja[open]')) return;
    t.saludoDia = hoy; guardarTienda(t);
    avisar(saludoDelDia(), { icono: 'calendario', ms: 9000, voz: false, acciones: [{ texto: 'Hablarle', fuerte: true, fn: () => abrirAsistente() }] });
  };
  window.addEventListener('load', () => setTimeout(saludar, 1800));
  document.addEventListener('click', async ev => {
    if (!ev.target.closest('[data-accion="olvidar-apodos"]')) return;
    const t = tienda(); t.alias = {}; t.precios = {}; await guardarTienda(t); mostrarRuta({ animar: false }); avisar('Listo: Fiao olvidó los apodos y precios aprendidos.', { icono: 'ok' });
  });
})();
