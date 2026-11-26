/* Fiao 2.4.0 · «Dígale a Fiao»: el asistente de voz.
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
/** Busca el monto en las palabras. Devuelve { monto, desde, hasta } (índices de las palabras usadas) o null. */
function montoEn(pal) {
  let mejor = null;
  for (let i = 0; i < pal.length; i++) {
    let total = 0, actual = 0, usadas = 0, j = i, vio = false;
    if (pal[i] === 'media' && /^lucas?$/.test(pal[i + 1] || '')) { mejor = mejor || { monto: 500, desde: i, hasta: i + 1 }; continue; }
    for (; j < pal.length; j++) {
      const p = pal[j], c = cifra(p);
      if (c !== null) { if (vio && actual && c < 1000 && !/^(mil|lucas?)$/.test(pal[j - 1])) break; actual += c; vio = true; usadas = j - i + 1; continue; }
      if (p in NUM_PALABRAS) { actual += NUM_PALABRAS[p]; vio = true; usadas = j - i + 1; continue; }
      if (p in MULT_PALABRAS && (vio || /^(mil|lucas?)$/.test(p) && p !== 'mil')) {
        const m = MULT_PALABRAS[p];
        if (m >= 1e6) { total += (actual || 1) * m; actual = 0; } else { total += (actual || 1) * m; actual = 0; }
        vio = true; usadas = j - i + 1; continue;
      }
      if (p === 'mil' && !vio) { total += 1000; vio = true; usadas = j - i + 1; continue; }
      if (p === 'y' && vio && j + 1 < pal.length && (pal[j + 1] in NUM_PALABRAS) && actual % 10 === 0 && actual >= 20 && actual < 100) continue;
      if (p === 'pesos' && vio) { usadas = j - i + 1; continue; }
      break;
    }
    if (vio) {
      const monto = Math.round(total + actual);
      /* Un número suelto menor de 50 casi nunca es plata en la tienda («una gaseosa», «dos panes»): no cuenta. */
      if (monto >= 50 && (!mejor || monto > 0 && usadas > (mejor.hasta - mejor.desde + 1))) mejor = { monto, desde: i, hasta: i + usadas - 1 };
      i = i + Math.max(usadas, 1) - 1;
    }
  }
  return mejor;
}

/* ───── 2 · Clientes: por nombre, por apodo o por parecido («Yesi» encuentra a Yesid) ───── */
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
/** Puntúa a cada cliente contra las palabras dichas. Devuelve [{ c, p, usadas:Set }] de mayor a menor. */
function clientesEn(pal, ignorar = new Set()) {
  const out = [];
  for (const c of clientes()) {
    const nom = palabrasDe(c.nombre).filter(w => !TRATOS.has(w) && w.length > 1);
    const det = palabrasDe(c.detalle || '').filter(w => !TRATOS.has(w) && w.length > 2);
    let p = 0; const usadas = new Set();
    nom.forEach((w, k) => {
      let mejor = 0, idx = -1;
      pal.forEach((x, i) => { if (ignorar.has(i) || x.length < 2) return; const s = parecido(x, w); if (s > mejor) { mejor = s; idx = i; } });
      if (mejor >= 0.72) { p += (k === 0 ? 60 : w.length >= 5 ? 45 : 25) * mejor; usadas.add(idx); }
    });
    det.forEach(w => { const i = pal.findIndex((x, i) => !ignorar.has(i) && parecido(x, w) >= 0.8); if (i >= 0) { p += 30; usadas.add(i); } });
    if (p >= 40) out.push({ c, p, usadas });
  }
  return out.sort((a, b) => b.p - a.p);
}

/* ───── 3 · Órdenes ───── */
const RX = {
  deshacer: /\b(deshaz|deshace|deshacer|deshaga|me equivoque|borra lo ultimo|quita lo ultimo|cancela lo ultimo)\b/,
  ocultar: /\b(oculta|ocultar|ocultame|esconde|esconder|tapa|tapar)\b.*\b(montos?|cifras?|plata|numeros)\b/,
  destapar: /\b(muestra|mostrar|muestrame|destapa|destapar|ensena|ver)\b.*\b(los )?(montos|cifras|numeros)\b/,
  ir: /\b(abre|abrir|abreme|ve|vaya|vamos|ir|lleva|llevame|entra|entrar|ensename|pasa)\b.*\b(libreta|inicio|cobros|cobrar|resumen|ajustes|configuracion|cuadre|novedades|accesibilidad)\b/,
  recordar: /\b(recuerdale|recordarle|recuerda|recordar|recordale|cobrale|cobrarle|escribele)\b/,
  mostrar: /\b(muestrale|mostrarle|ensenale|muestra la cuenta|mostrar la cuenta|ver la cuenta|abre la cuenta)\b/,
  pago: /\b(pago|pagaron|abono|abonaron|cancelo|trajo|me dio|dio|me pagaron|pagar(on)? todo|quedo al dia|se puso al dia)\b/,
  fiar: /\b(fiale|fia|fie|fiar|fiado|fiele|fiarle|anotale|anota|anotar|anotame|apuntale|apunta|apuntar|se llevo|llevo|lleva|le di|dale|ponle|pon|cargale|carga|agregale|sumale|suma)\b/,
  pregunta: /^(cuanto|cuantos|cuanta|quien|quienes|como|que|cual|dime|digame)\b/,
  calle: /\b(en la calle|me deben|deben entre todos|total|cuanto hay)\b/,
  quien: /\b(quien|quienes)\b.*\b(debe|deben|atrasad|mas)\b|\batrasados?\b/,
  hoy: /\b(hoy|el dia|cuadre)\b/,
  debe: /\b(debe|le debe|me debe|va debiendo|cuenta de|lleva)\b/
};
const MEDIOS_VOZ = [[/\bnequi\b/, 'nequi'], [/\b(bre ?b|breb|llave|bre-b)\b/, 'breb'], [/\b(daviplata|transferencia|bancolombia|consignacion)\b/, 'otro'], [/\b(efectivo|billete|cash|en mano)\b/, 'efectivo']];
const RUTAS_VOZ = [[/libreta|inicio/, 'inicio'], [/cobros|cobrar/, 'cobros'], [/cuadre/, 'cuadre'], [/resumen/, 'resumen'], [/ajustes|configuracion/, 'ajustes'], [/novedades/, 'novedades'], [/accesibilidad/, 'accesibilidad']];
const RELLENO = new Set(['a', 'al', 'le', 'les', 'de', 'del', 'para', 'por', 'que', 'se', 'me', 'lo', 'la', 'el', 'los', 'las', 'y', 'en', 'con', 'mas', 'otro', 'otra', 'otros', 'pesos', 'peso', 'fiao', 'oye', 'hola', 'porfa', 'favor', 'gracias', 'ahi', 'ya', 'hoy', 'ahora', 'eso', 'es', 'una', 'un', 'uno']);

/**
 * Interpreta una frase. Devuelve un objeto con `tipo`:
 * fiar · pago · deshacer · nuevo · saldo · calle · quien · hoy · recordar · mostrar · ir · ocultar · destapar
 * · elegir (varios clientes parecidos) · falta (falta el monto o el cliente) · nada (no entendió).
 */
function interpretar(texto) {
  const t = normalizar(texto).replace(/[¿?¡!.,;:]/g, ' ').replace(/\s+/g, ' ').trim();
  const pal = palabrasDe(texto);
  if (!t) return { tipo: 'nada', texto };
  const base = { texto };
  if (RX.deshacer.test(t)) return { ...base, tipo: 'deshacer' };
  if (RX.ocultar.test(t)) return { ...base, tipo: 'ocultar' };
  if (RX.destapar.test(t) && !RX.mostrar.test(t)) return { ...base, tipo: 'destapar' };
  const monto = montoEn(pal);
  const ignorar = new Set(monto ? Array.from({ length: monto.hasta - monto.desde + 1 }, (_, k) => monto.desde + k) : []);
  const cands = clientesEn(pal, ignorar);
  const elegido = cands.length && (cands.length === 1 || cands[0].p - cands[1].p >= 12) ? cands[0] : null;
  const dudosos = !elegido && cands.length > 1 ? cands.slice(0, 3).map(x => x.c) : null;
  const pregunta = RX.pregunta.test(t) || /\?/.test(texto);

  if (pregunta) {
    if (RX.quien.test(t)) return { ...base, tipo: 'quien', atrasados: /atrasad/.test(t) };
    if (elegido || dudosos) return dudosos ? { ...base, tipo: 'elegir', para: 'saldo', opciones: dudosos } : { ...base, tipo: 'saldo', c: elegido.c };
    if (RX.hoy.test(t) && /\b(fie|fiado|fio|cobre|cobrado|recupere|vendi|pago|pagaron|pagado|voy|va|como|cuanto)\b/.test(t)) return { ...base, tipo: 'hoy' };
    if (RX.calle.test(t) || /\bdeben\b/.test(t)) return { ...base, tipo: 'calle' };
  }
  if (RX.recordar.test(t)) {
    if (dudosos) return { ...base, tipo: 'elegir', para: 'recordar', opciones: dudosos };
    return elegido ? { ...base, tipo: 'recordar', c: elegido.c } : { ...base, tipo: 'falta', que: 'cliente', para: 'recordar' };
  }
  if (RX.mostrar.test(t)) {
    if (dudosos) return { ...base, tipo: 'elegir', para: 'mostrar', opciones: dudosos };
    if (elegido) return { ...base, tipo: 'mostrar', c: elegido.c };
  }
  if (RX.ir.test(t)) { const r = RUTAS_VOZ.find(([rx]) => rx.test(t)); if (r) return { ...base, tipo: 'ir', ruta: r[1] }; }

  const esPago = RX.pago.test(t) && !/\b(fiale|fia|fiar|anotale|apuntale|se llevo)\b/.test(t);
  const esFiar = !esPago && (RX.fiar.test(t) || (monto && (elegido || dudosos) && !pregunta));
  if (esPago || esFiar) {
    const tipo = esPago ? 'pago' : 'fiar';
    const medio = (MEDIOS_VOZ.find(([rx]) => rx.test(t)) || [null, 'efectivo'])[1];
    const todo = esPago && /\b(todo|todito|completo|al dia|lo que debe|lo que debia)\b/.test(t);
    const que = tipo === 'fiar' ? queLlevo(texto, pal, monto, elegido) : '';
    const r = { ...base, tipo, monto: monto ? monto.monto : null, medio, todo, que };
    if (dudosos) return { ...r, tipo: 'elegir', para: tipo, opciones: dudosos };
    if (!elegido) {
      if (tipo === 'fiar') { const n = nombreNuevo(texto, pal, monto); if (n) return { ...r, tipo: 'nuevo', nombre: n }; }
      return { ...r, tipo: 'falta', que: 'cliente', para: tipo };
    }
    r.c = elegido.c;
    if (tipo === 'pago' && todo) r.monto = saldoDe(r.c.id);
    if (!r.monto) return { ...r, tipo: 'falta', que: 'monto', para: tipo };
    return r;
  }
  if (pregunta && RX.calle.test(t)) return { ...base, tipo: 'calle' };
  if (elegido && !monto && RX.debe.test(t)) return { ...base, tipo: 'saldo', c: elegido.c };
  return { ...base, tipo: 'nada' };
}
/** Lo que se llevó: lo que va después de una coma, o después de «de / en» tras el monto. */
function queLlevo(texto, pal, monto, elegido) {
  const tras = texto.split(/[,;]/).slice(1).join(',').trim();
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
  const s = w.join(' ').replace(/^(una?|unos|unas)\s+/i, m => m).trim();
  return s.length > 1 ? s.charAt(0).toUpperCase() + s.slice(1, LIMITES.que) : '';
}
/** Para «Fíale mil a Pedro» cuando Pedro no existe: la palabra con mayúscula o la que va después de «a». */
function nombreNuevo(texto, pal, monto) {
  const sinComa = texto.split(/[,;]/)[0];
  const m = sinComa.match(/\ba\s+((?:don|doña|la|el|profe|seño)\s+)?([A-Za-zÁÉÍÓÚÑáéíóúñ]{2,})(\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?/);
  const cand = m ? `${m[1] || ''}${m[2]}${m[3] || ''}`.trim() : (sinComa.match(/\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})\b/) || [])[1];
  if (!cand) return '';
  const n = normalizar(cand);
  if (RELLENO.has(n) || n in NUM_PALABRAS || n in MULT_PALABRAS || RX.fiar.test(n)) return '';
  return cand.replace(/\b\p{L}/gu, x => x.toUpperCase());
}

/* ───── 4 · La voz del navegador (si está) ───── */
const Oido = {
  clase: window.SpeechRecognition || window.webkitSpeechRecognition || null,
  r: null,
  hay() { return !!this.clase; },
  escuchar({ parcial, final, error, fin }) {
    if (!this.clase) { error('no-hay'); return; }
    try { this.r?.abort(); } catch (e) { /* nada */ }
    const r = new this.clase(); this.r = r;
    r.lang = 'es-CO'; r.interimResults = true; r.maxAlternatives = 3; r.continuous = false;
    let ultimo = '';
    r.onresult = ev => {
      const res = ev.results[ev.results.length - 1];
      const alts = Array.from(res).map(a => a.transcript.trim());
      ultimo = alts[0];
      if (res.isFinal) final(alts); else parcial(ultimo);
    };
    r.onerror = ev => error(ev.error || 'error');
    r.onend = () => fin(ultimo);
    try { r.start(); } catch (e) { error('no-arranca'); }
  },
  parar() { try { this.r?.stop(); } catch (e) { /* nada */ } },
  cancelar() { try { this.r?.abort(); } catch (e) { /* nada */ } this.r = null; }
};
/** Fiao lee la respuesta con la voz del celular (si el tendero no la apagó). */
function leerEnVoz(texto) {
  const t = tienda();
  if (t.asistenteVoz === false || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto.replace(/\$/g, '').replace(/(\d)\.(\d{3})/g, '$1$2') + ''); u.lang = 'es-CO'; u.rate = 1;
    const vs = speechSynthesis.getVoices(); const v = vs.find(x => /^es(-|_)CO/i.test(x.lang)) || vs.find(x => /^es(-|_)(US|MX|419)/i.test(x.lang)) || vs.find(x => /^es/i.test(x.lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) { /* sin voz no pasa nada: la respuesta está en pantalla */ }
}

/* ───── 5 · La hoja «Dígale a Fiao» ───── */
const EJEMPLOS_VOZ = ['«Fíale cinco mil a Keyla, una gaseosa»', '«Yesid pagó veinte mil por Nequi»', '«¿Cuánto me debe Don Édgar?»', '«¿Quién me debe más?»', '«Recuérdale a Yesid»'];
function ejemplosVoz() {
  const n = clientes().slice(0, 2).map(c => nombreCorto(c.nombre));
  if (tienda().demo || n.length < 2) return EJEMPLOS_VOZ.slice(0, 3);
  return [`«Fíale cinco mil a ${n[0]}»`, `«${n[1]} pagó diez mil por Nequi»`, '«¿Cuánto hay en la calle?»'];
}
const AVISO_VOZ = 'Su voz la convierte en texto el servicio de su celular (Google o Apple). Lo que dice se entiende y se guarda solo en este celular.';

function abrirAsistente({ escribir = false } = {}) {
  if (!Datos.tienda) return;
  const usarVoz = Oido.hay() && !escribir && !Asistente.sinVoz;
  abrirHoja(`${cabHoja('Dígale a Fiao')}<div class="asis" aria-live="polite"></div>`, d => {
    Asistente.hoja = d;
    if (usarVoz) Asistente.pasoEscuchar(); else Asistente.pasoEscribir();
  }, { nombre: 'asistente' });
  const d = document.getElementById('hoja');
  d.addEventListener('close', () => { Oido.cancelar(); try { speechSynthesis.cancel(); } catch (e) { /* nada */ } });
}

const Asistente = {
  hoja: null, sinVoz: false, pendiente: null,
  caja() { return this.hoja?.querySelector('.asis'); },
  pintar(html, montar = () => {}) {
    const c = this.caja(); if (!c) return;
    c.innerHTML = html; montar(c);
    c.querySelectorAll('[data-asis="otra"]').forEach(b => b.addEventListener('click', () => this.sinVoz || !Oido.hay() ? this.pasoEscribir() : this.pasoEscuchar()));
    c.querySelectorAll('[data-asis="escribir"]').forEach(b => b.addEventListener('click', () => this.pasoEscribir()));
    c.querySelectorAll('[data-asis="cerrar"]').forEach(b => b.addEventListener('click', () => cerrarHoja()));
  },
  pasoEscuchar() {
    this.pintar(`<button type="button" class="asis-mic escucha" data-asis="mic" aria-label="Escuchando. Toque para terminar">${ic('microfono', 40, 2.2)}</button>
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
        final: alts => { listo = true; mic.classList.remove('escucha'); this.entender(alts); },
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
          if (ultimo) this.entender([ultimo]); else { est.textContent = 'No le oí. Toque el micrófono y hable otra vez.'; mic.setAttribute('aria-label', 'Hablar otra vez'); }
        }
      });
    });
  },
  pasoEscribir(nota = '', valor = '') {
    this.pintar(`${nota ? `<p class="asis-nota">${esc(nota)}</p>` : ''}
      <form class="asis-form" novalidate><label class="leyenda" for="asis-orden">¿Qué hago?</label>
        <input class="entrada" id="asis-orden" autocomplete="off" enterkeyhint="go" maxlength="140" placeholder="Ej.: Fíale cinco mil a Keyla" value="${esc(valor)}">
        <p class="ayuda">${Oido.hay() && !this.sinVoz ? '' : 'Puede dictarla con el micrófono de su teclado. '}Por ejemplo: ${ejemplosVoz().join(' · ')}</p>
        <button type="submit" class="btn">${ic('ok', 22, 2.4)}Listo</button></form>
      ${Oido.hay() && !this.sinVoz ? `<button type="button" class="btn-link" data-asis="otra">${ic('microfono', 20, 2.2)}Mejor se lo digo</button>` : ''}
      <p class="ayuda asis-privacidad">${AVISO_VOZ}</p>`, c => {
      const inp = c.querySelector('#asis-orden'); setTimeout(() => inp.focus(), 250);
      c.querySelector('form').addEventListener('submit', ev => { ev.preventDefault(); if (inp.value.trim()) this.entender([inp.value.trim()]); });
    });
  },
  /** Prueba las alternativas del reconocedor y se queda con la primera que se entiende completa. */
  entender(alts) {
    let r = null;
    for (const a of alts) { const x = interpretar(a); if (!r || (r.tipo === 'nada' && x.tipo !== 'nada') || (['falta', 'elegir'].includes(r.tipo) && !['falta', 'elegir', 'nada'].includes(x.tipo))) r = x; if (!['nada', 'falta', 'elegir'].includes(x.tipo)) break; }
    this.responder(r);
  },
  dicho(r) { return `<p class="asis-dicho">«${esc(r.texto)}»</p>`; },
  responder(r) {
    const n = c => esc(nombreCorto(c.nombre));
    const listo = (titulo, extra = '', botones = `<button type="button" class="btn" data-asis="cerrar">Listo</button>`) => {
      this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>${titulo}</b>${extra}</div>${botones}<button type="button" class="btn-link" data-asis="otra">Decirle otra cosa</button>`);
    };
    switch (r.tipo) {
      case 'fiar': case 'pago': return this.confirmarMov(r);
      case 'nuevo': return this.confirmarNuevo(r);
      case 'elegir': return this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>¿A cuál se refiere?</b></div>
          <div class="asis-opciones">${r.opciones.map((c, i) => `<button type="button" class="btn-sec" data-i="${i}">${esc(c.nombre)}</button>`).join('')}</div>
          <button type="button" class="btn-link" data-asis="otra">Decirlo otra vez</button>`, c => {
          c.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => {
            const cl = r.opciones[+b.dataset.i];
            const sig = { ...r, tipo: r.para, c: cl };
            if (sig.tipo === 'pago' && sig.todo) sig.monto = saldoDe(cl.id);
            if (['fiar', 'pago'].includes(sig.tipo) && !sig.monto) return this.responder({ ...sig, tipo: 'falta', que: 'monto' });
            this.responder(sig);
          }));
        });
      case 'falta':
        if (r.que === 'monto') return this.preguntarMonto(r);
        return this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>¿A quién?</b><span>No encontré a ese cliente en su libreta.</span></div>
          <div class="asis-opciones">${clientes().slice(0, 6).map((c, i) => `<button type="button" class="btn-sec" data-i="${i}">${esc(nombreCorto(c.nombre))}</button>`).join('')}</div>
          <button type="button" class="btn-link" data-asis="otra">Decirlo otra vez</button>`, c => {
          const lista = clientes().slice(0, 6);
          c.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => {
            const cl = lista[+b.dataset.i], sig = { ...r, tipo: r.para, c: cl, monto: r.para === 'pago' && r.todo ? saldoDe(cl.id) : r.monto };
            if (['fiar', 'pago'].includes(sig.tipo) && !sig.monto) return this.responder({ ...sig, tipo: 'falta', que: 'monto' });
            this.responder(sig);
          }));
        });
      case 'saldo': {
        const s = saldoDe(r.c.id), e = estadoDe(r.c);
        const t = s > 0 ? `${nombreCorto(r.c.nombre)} le debe ${monto(s)}.` : `${nombreCorto(r.c.nombre)} no le debe nada.`;
        const extra = s > 0 && e.tipo === 'atrasado' ? `<span>Está atrasado ${e.dias} ${e.dias === 1 ? 'día' : 'días'}.</span>` : s > 0 && r.c.proximaFecha ? `<span>Acordaron pagar ${elDia(diaDe(r.c.proximaFecha))}.</span>` : '';
        if (!Vista.oculto) leerEnVoz(t + (extra ? ' ' + extra.replace(/<[^>]+>/g, '') : ''));
        return listo(esc(t), extra, `<a class="btn" href="#cliente-${r.c.id}">Ver la cuenta de ${n(r.c)}</a>`);
      }
      case 'calle': {
        const total = totalEnLaCalle(), lista = clientes(), alDia = lista.filter(c => estadoDe(c).tipo !== 'atrasado').length;
        const t = `Tiene ${monto(total)} en la calle.`;
        if (!Vista.oculto) leerEnVoz(`${t} ${alDia} de ${lista.length} clientes están al día.`);
        return listo(esc(t), `<span>${alDia} de ${lista.length} clientes están al día.</span>`);
      }
      case 'quien': {
        const lista = r.atrasados ? aQuienRevisar().filter(x => x.tipo === 'atrasado').map(x => ({ c: x.c, s: saldoDe(x.c.id) })).slice(0, 3) : quienesDebenMas(3);
        if (!lista.length) { leerEnVoz(r.atrasados ? 'Nadie está atrasado.' : 'Nadie le debe.'); return listo(r.atrasados ? 'Nadie está atrasado.' : 'Nadie le debe. ¡Libreta al día!'); }
        const frase = lista.map(x => `${nombreCorto(x.c.nombre)}, ${monto(x.s)}`).join('; ');
        if (!Vista.oculto) leerEnVoz(`${r.atrasados ? 'Atrasados' : 'Los que más deben'}: ${frase}.`);
        return listo(r.atrasados ? 'Están atrasados:' : 'Los que más le deben:', `<ol class="asis-lista">${lista.map(x => `<li><a href="#cliente-${x.c.id}">${esc(nombreCorto(x.c.nombre))}</a> <b>${monto(x.s)}</b></li>`).join('')}</ol>`);
      }
      case 'hoy': {
        const x = datosCuadre();
        const t = `Hoy fió ${monto(x.h.fiado)} y cobró ${monto(x.h.pagos)}.`;
        if (!Vista.oculto) leerEnVoz(t);
        return listo(esc(t), `<span>${x.h.nFiado} ${x.h.nFiado === 1 ? 'fiado' : 'fiados'} y ${x.h.nPagos} ${x.h.nPagos === 1 ? 'pago' : 'pagos'}.</span>`, `<a class="btn" href="#cuadre">Ver el cuadre de hoy</a>`);
      }
      case 'recordar': return this.confirmarRecordar(r);
      case 'mostrar': cerrarHoja(); return setTimeout(() => ir(`cuenta-${r.c.id}`), 200);
      case 'ir': cerrarHoja(); return setTimeout(() => ir(r.ruta), 200);
      case 'ocultar': case 'destapar':
        Vista.oculto = r.tipo === 'ocultar'; cerrarHoja(); mostrarRuta({ animar: false });
        return avisar(Vista.oculto ? 'Montos ocultos.' : 'Montos visibles.', { icono: Vista.oculto ? 'ojoNo' : 'ojo' });
      case 'deshacer': return this.confirmarDeshacer(r);
      default:
        return this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>No le entendí bien.</b><span>Sé fiar, anotar pagos, decirle cuánto le deben y recordar. Pruebe así:</span>
          <ul class="asis-lista">${ejemplosVoz().map(e => `<li>${e}</li>`).join('')}</ul></div>
          <button type="button" class="btn" data-asis="otra">${ic('microfono', 22, 2.2)}Intentar otra vez</button>
          <button type="button" class="btn-link" data-asis="escribir">Escribirlo</button>`);
    }
  },
  preguntarMonto(r) {
    const n = esc(nombreCorto(r.c.nombre));
    this.pintar(`${this.dicho(r)}<form class="asis-form" novalidate><label class="leyenda" for="asis-monto">${r.para === 'pago' ? `¿Cuánto pagó ${n}?` : `¿Cuánto le fía a ${n}?`}</label>
      <div class="con-prefijo"><span class="prefijo" aria-hidden="true">$</span><input class="entrada" id="asis-monto" inputmode="numeric" autocomplete="off" placeholder="Ej.: 5.000"></div>
      <p class="error" role="alert" hidden></p><button type="submit" class="btn">Seguir</button></form>`, c => {
      const inp = c.querySelector('#asis-monto'); setTimeout(() => inp.focus(), 250);
      c.querySelector('form').addEventListener('submit', ev => {
        ev.preventDefault(); const m = montoEn(palabrasDe(inp.value)) || (cifra(inp.value.replace(/\s/g, '')) ? { monto: cifra(inp.value.replace(/\s/g, '')) } : null);
        if (!m || m.monto <= 0) { const e = c.querySelector('.error'); e.textContent = 'Escriba el monto, por ejemplo 5.000.'; e.hidden = false; return; }
        this.responder({ ...r, tipo: r.para, monto: m.monto });
      });
    });
  },
  confirmarMov(r) {
    const c = r.c, n = esc(nombreCorto(c.nombre)), pago = r.tipo === 'pago', saldo = saldoDe(c.id);
    if (pago && saldo <= 0) return this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>${n} no le debe nada.</b><span>No hay pago que anotar.</span></div><button type="button" class="btn" data-asis="cerrar">Listo</button>`);
    const montoReal = pago ? Math.min(r.monto, saldo) : r.monto;
    const queda = pago ? saldo - montoReal : saldo + montoReal;
    const pasa = !pago && c.cupo && queda > c.cupo ? queda - c.cupo : 0;
    const MEDIO_TXT = { efectivo: 'En efectivo', nequi: 'Por Nequi', breb: 'Por Bre-B', otro: 'Otro medio' };
    this.pendiente = r;
    this.pintar(`${this.dicho(r)}<div class="asis-tarjeta ${pago ? 'pago' : 'fiado'}">
        <span class="asis-tipo">${pago ? 'Pago' : 'Fiado'}</span><b class="asis-monto">${pesos(montoReal)}</b>
        <span class="asis-quien">${pago ? 'de' : 'a'} <b>${n}</b></span>
        ${!pago && r.que ? `<span class="asis-detalle">${esc(r.que)}</span>` : ''}${pago ? `<span class="asis-detalle">${MEDIO_TXT[r.medio] || ''}${pago && r.monto > saldo ? ` · debía ${pesos(saldo)}` : ''}</span>` : ''}
        <span class="asis-queda">${queda > 0 ? `Queda debiendo ${pesos(queda)}` : 'Queda al día'}</span>
        ${pasa ? `<span class="pildora atencion">${ic('atencion', 18, 2.2)}Pasa el cupo por ${pesos(pasa)}</span>` : ''}</div>
      <button type="button" class="btn ${pago ? 'verde' : 'fiar'}" data-asis="si">${ic('ok', 24, 2.6)}Sí, anótelo</button>
      <button type="button" class="btn-sec" data-asis="corregir">Corregir lo que dije</button>
      <button type="button" class="btn-link" data-asis="cerrar">Cancelar</button>`, el => {
      el.querySelector('[data-asis="corregir"]').addEventListener('click', () => this.pasoEscribir('', r.texto));
      el.querySelector('[data-asis="si"]').addEventListener('click', async ev => {
        ev.currentTarget.disabled = true;
        const m = pago ? await registrarPago({ c, monto: montoReal, medio: r.medio, recibio: tienda().atiendeAhora }) : await registrarFiado({ c, monto: montoReal, que: r.que || '' });
        cerrarHoja(); mostrarRuta({ animar: false }); emitir(pago ? 'pagado' : 'anotado'); avisoTrasMov(m);
      });
    });
    if (!Vista.oculto) leerEnVoz(`${pago ? 'Pago' : 'Fiado'} de ${pesos(montoReal)} ${pago ? 'de' : 'a'} ${nombreCorto(c.nombre)}. ¿Lo anoto?`);
  },
  confirmarNuevo(r) {
    const n = esc(r.nombre);
    if (!r.monto) return this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>${n} no está en su libreta.</b><span>Dígame cuánto le fía para agregarlo.</span></div><button type="button" class="btn" data-asis="otra">Decirlo otra vez</button>`);
    this.pintar(`${this.dicho(r)}<div class="asis-tarjeta fiado"><span class="asis-tipo">Cliente nuevo y fiado</span><b class="asis-monto">${pesos(r.monto)}</b>
        <span class="asis-quien">a <b>${n}</b></span>${r.que ? `<span class="asis-detalle">${esc(r.que)}</span>` : ''}
        <span class="asis-queda">${n} no estaba en su libreta: lo agrego. Su celular lo puede poner después.</span></div>
      <button type="button" class="btn fiar" data-asis="si">${ic('ok', 24, 2.6)}Agregar y anotar</button>
      <button type="button" class="btn-sec" data-asis="corregir">Corregir lo que dije</button>
      <button type="button" class="btn-link" data-asis="cerrar">Cancelar</button>`, el => {
      el.querySelector('[data-asis="corregir"]').addEventListener('click', () => this.pasoEscribir('', r.texto));
      el.querySelector('[data-asis="si"]').addEventListener('click', async ev => {
        ev.currentTarget.disabled = true;
        const c = { id: uid(), nombre: r.nombre.slice(0, LIMITES.nombre), cel: '', cupo: null, pago: 'quincena', recibos: 'whatsapp', recordar: 'atraso', detalle: '', lista: null, permiso: { estado: 'ninguno', fecha: null }, proximaFecha: null, creado: new Date().toISOString() };
        await guardarCliente(c);
        const m = await registrarFiado({ c, monto: r.monto, que: r.que || '' });
        cerrarHoja(); mostrarRuta({ animar: false }); emitir('anotado'); avisoTrasMov(m, { clienteNuevo: true });
      });
    });
  },
  confirmarRecordar(r) {
    const c = r.c, n = esc(nombreCorto(c.nombre)), e = estadoDe(c);
    const no = msg => this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>${msg}</b></div><button type="button" class="btn" data-asis="cerrar">Entendido</button>`);
    if (e.saldo <= 0) return no(`${n} no le debe nada.`);
    if (!c.cel) return no(`${n} no tiene celular anotado.`);
    if (!permisoOk(c)) return no(`${n} aún no ha aceptado mensajes por WhatsApp.`);
    if (!puedeRecordarAhora()) return no(esc(motivoNoRecordar()));
    if (recordadoHoy(c.id)) return no('Ya se le recordó hoy. La ley permite uno al día.');
    this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>¿Le recuerdo a ${n} por WhatsApp?</b><span>Debe ${monto(e.saldo)}.</span></div>
      <div class="burbuja" style="font-size:1rem;line-height:1.45">${esc(mensajeRecordatorio(c, e))}</div>
      <button type="button" class="btn" data-asis="si">${ic('whatsapp', 22)}Recordarle a ${n}</button>
      <button type="button" class="btn-link" data-asis="cerrar">Cancelar</button>`, el => {
      el.querySelector('[data-asis="si"]').addEventListener('click', async () => {
        abrirWhatsApp(c.cel, mensajeRecordatorio(c, e)); await registrarContacto(c.id, 'recordatorio');
        cerrarHoja(); mostrarRuta({ animar: false }); avisar(`Abrimos WhatsApp con el recordatorio para ${nombreCorto(c.nombre)}.`);
      });
    });
  },
  confirmarDeshacer(r) {
    const ult = [...Datos.movs.values()].filter(m => m.tipo !== 'saldo').sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    if (!ult || !sePuedeDeshacer(ult)) return this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>Ya no se puede deshacer.</b><span>Pasó más de un minuto o ya se envió. Puede corregirlo o anularlo en el historial del cliente.</span></div><button type="button" class="btn" data-asis="cerrar">Entendido</button>`);
    const c = cliente(ult.clienteId), n = esc(nombreCorto(c.nombre));
    this.pintar(`${this.dicho(r)}<div class="asis-respuesta"><b>¿Deshago ${ult.tipo === 'pago' ? `el pago de ${pesos(ult.monto)} de ${n}` : `el fiado de ${pesos(ult.monto)} a ${n}`}?</b></div>
      <button type="button" class="btn-sec" data-asis="si">${ic('girar', 22, 2.2)}Sí, deshacerlo</button><button type="button" class="btn-link" data-asis="cerrar">Cancelar</button>`, el => {
      el.querySelector('[data-asis="si"]').addEventListener('click', async () => {
        const ok = await deshacerMov(ult); cerrarHoja(); mostrarRuta({ animar: false });
        avisar(ok ? 'Listo, se deshizo.' : 'Ya no se puede deshacer. Puede corregirlo en el historial.', { icono: ok ? 'girar' : 'atencion' });
      });
    });
  }
};

/* ───── 6 · Mantener presionado «Fiar» abre el asistente (si está encendido en Ajustes) ───── */
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
})();
