/* Fiao · la voz de Fiao.
   Frases cortas grabadas con una sola voz, guardadas dentro de la app (carpeta audio/):
   suenan igual en todos los celulares y funcionan sin internet.
   · Suenan justo después de lo que hace el tendero, nunca solas.
   · Solo frases fijas: nunca dicen nombres de clientes ni montos en voz alta en el mostrador.
   · Se apagan en Ajustes → «Voz de Fiao». El botón «Escuchar» de la Ayuda suena siempre.
   · Si una frase no tiene audio, la app sigue igual, en silencio. */
'use strict';

/** clave → lo que dice la voz (el archivo es audio/<clave>.mp3). */
const VOZ = {
  // Después de anotar, pagar, corregir…
  'anotado': '¡Listo! Quedó anotado.',
  'pago': 'Pago guardado.',
  'al-dia': '¡Listo! La cuenta quedó al día.',
  'deshecho': 'Listo, se deshizo.',
  'no-deshacer': 'Ya no se puede deshacer. Puede corregirlo en el historial.',
  'cliente-nuevo': 'Quedó en su libreta.',
  'cambios': 'Cambios guardados.',
  'correccion': 'Corrección guardada.',
  'anulada': 'Anotación anulada.',
  'visto': 'Quedó registrado que lo vio.',
  'cupo': 'Esta compra pasa el cupo. Usted decide.',
  'cliente-borrado': 'Cliente borrado. Si fue un error, toque Deshacer.',
  'borrar-debe': 'Este cliente todavía le debe. Si lo borra, pierde el registro de esa plata.',
  'aviso-pago': 'Antes de anotar el pago, revise que la plata sí le llegó.',
  // WhatsApp
  'recibo-wa': 'Abrimos WhatsApp con el recibo listo.',
  'recordatorio-wa': 'Abrimos WhatsApp con el recordatorio.',
  'cuenta-wa': 'Abrimos WhatsApp con su cuenta.',
  'resumen-wa': 'Abrimos WhatsApp con el resumen.',
  'permiso-si': 'Aceptó sus recibos.',
  'permiso-no': 'Entendido. Sus cuentas se las muestra aquí.',
  'ya-recordado': 'Ya se le recordó hoy. La ley permite uno al día.',
  'no-recordar': 'En este momento la ley no permite recordar.',
  // Ajustes y copia
  'copia': 'Copia guardada. Mándela a su WhatsApp o a Drive.',
  'tienda': 'Datos de la tienda guardados.',
  'recuperada': 'Su libreta quedó recuperada.',
  'mensajes': 'Mensajes guardados.',
  'original': 'Volvió al mensaje original.',
  'ocultos': 'Montos ocultos.',
  'visibles': 'Montos visibles.',
  'pasos-ocultos': 'Lista oculta. Puede volver a verla en Ajustes.',
  'instalada': 'Fiao quedó en su celular.',
  'version': 'Hay una versión nueva de Fiao.',
  'sin-contactos': 'No se pudo abrir la lista de contactos.',
  'no-guardo': 'No se pudo guardar en este celular. Guarde una copia ahora.',
  'monto-alto': 'Es mucho más de lo normal. Revise el monto.',
  // Errores al escribir
  'e-nombre': 'Escriba el nombre o apodo.',
  'e-celular': 'El celular tiene 10 números y empieza por 3.',
  'e-mas': 'Es más de lo que debe.',
  'e-tienda': 'Escriba el nombre de la tienda.',
  'e-su-nombre': 'Escriba su nombre.',
  'e-dia': 'Elija el día.',
  'e-monto': 'Escriba el monto. Si no debió anotarse, anúlelo.',
  'e-mismo': 'Es el mismo monto de antes.',
  'e-archivo': 'Ese archivo no es una copia de Fiao.',
  'nombre-repetido': 'Ya tiene un cliente con ese nombre.',
  // Guía del primer uso
  'g-anotar': 'Anote su primer fiado. Toque aquí.',
  'g-nuevo': 'Escriba el nombre de un cliente y toque «Seguir».',
  'g-monto': 'Marque cuánto se llevó. Luego toque «Anotar».',
  'practica': '¡Muy bien! Así de fácil anota un fiado.',
  'r-total': 'Esto es lo que le deben entre todos.',
  'r-lista': 'Primero salen los atrasados y los que pagan hoy.',
  'r-anotar': 'Con este botón anota un fiado en segundos.',
  'r-cobros': 'Aquí ve a quién recordar y cuándo lo permite la ley.'
};
/* Ayuda y «¿Por qué?» se graban con el mismo texto que se lee en pantalla. */
for (const [k, [, lineas]] of Object.entries(AYUDA)) VOZ[`ayuda-${k}`] = lineas.join(' ');
for (const [k, [t, x]] of Object.entries(POR_QUE)) VOZ[`porque-${k}`] = `${t} ${x}`;

/** Texto que se ve en pantalla → clave de la frase grabada (montos y nombres no se dicen). */
const VOZ_REGLAS = [
  [/^\$[\d.]+ a .+\. Va en /, 'anotado'], [/^Pago de \$/, 'pago'], [/ quedó al día\.$/, 'al-dia'],
  [/^Listo, se deshizo\.$/, 'deshecho'], [/^Ya no se puede deshacer/, 'no-deshacer'], [/ quedó en su libreta\.$/, 'cliente-nuevo'], [/^Borró a .+ de su libreta\.$/, 'cliente-borrado'],
  [/^Cambios guardados\.$/, 'cambios'], [/^Corrección guardada\.$/, 'correccion'], [/^Anotación anulada\.$/, 'anulada'],
  [/^Quedó registrado que /, 'visto'], [/^Abrimos WhatsApp con el recibo/, 'recibo-wa'], [/^Abrimos WhatsApp con el recordatorio/, 'recordatorio-wa'],
  [/^Abrimos WhatsApp con su cuenta/, 'cuenta-wa'], [/^Abrimos WhatsApp con el resumen/, 'resumen-wa'], [/ aceptó sus recibos\.$/, 'permiso-si'],
  [/^Entendido\. Sus cuentas se las muestra aquí\.$/, 'permiso-no'], [/^Ya se le recordó hoy/, 'ya-recordado'],
  [/la ley no permite recordar\.$|^Se puede recordar desde |^El horario para recordar terminó/, 'no-recordar'],
  [/^Copia guardada\./, 'copia'], [/^Datos de la tienda guardados\.$/, 'tienda'], [/^Su libreta quedó recuperada\.$/, 'recuperada'],
  [/^Mensajes guardados\.$/, 'mensajes'], [/^Volvió al mensaje original\.$/, 'original'], [/^Montos ocultos\.$/, 'ocultos'], [/^Montos visibles\.$/, 'visibles'],
  [/^Lista oculta\./, 'pasos-ocultos'], [/^Fiao quedó en su celular\.$/, 'instalada'], [/^Hay una versión nueva/, 'version'], [/^No se pudo abrir la lista de contactos/, 'sin-contactos'],
  [/^Escriba el nombre o apodo\.$/, 'e-nombre'], [/^El celular tiene 10 números/, 'e-celular'], [/^Es más de lo que debe/, 'e-mas'],
  [/^Escriba el nombre de la tienda\.$/, 'e-tienda'], [/^Escriba su nombre\.$/, 'e-su-nombre'], [/^Elija el día\.$/, 'e-dia'],
  [/^Escriba el monto\. Si no debió anotarse/, 'e-monto'], [/^Es el mismo monto de antes\.$/, 'e-mismo'], [/^Ese archivo no es una copia de Fiao\.$/, 'e-archivo'], [/^Ya tiene un cliente que se llama /, 'nombre-repetido'],
  [/^Anote su primer fiado\./, 'g-anotar'], [/^Escriba el nombre de un cliente/, 'g-nuevo'], [/^Marque cuánto se llevó\./, 'g-monto'],
  [/^Esto es lo que le deben entre todos\.$/, 'r-total'], [/^Primero salen los atrasados/, 'r-lista'], [/^Con este botón anota un fiado/, 'r-anotar'], [/^Aquí ve a quién recordar/, 'r-cobros']
];

/* 3.4 · Frases que más suenan: quedan listas apenas el celular deja sonar, para que salgan sin espera. */
const VOZ_PRIMERO = ['anotado', 'pago', 'al-dia', 'deshecho', 'cliente-nuevo', 'cambios', 'correccion', 'recibo-wa', 'e-monto', 'e-nombre'];

const Voz = {
  ctx: null, sonando: null, buffers: {}, bytes: {}, cargando: {}, inicio: {}, faltan: new Set(),
  turno: 0, // 3.4 · cada frase pedida tiene su turno: si llega otra o Fiao se esconde, la anterior ya no suena
  /** ¿La voz está encendida en Ajustes? (encendida si nunca se ha tocado) */
  encendida() { return !(Datos.tienda && Datos.tienda.voz === false); },
  /** El celular solo deja sonar después de un toque: el primer toque prepara el audio.
      3.4 · En iPhone, al volver de otra app el audio queda «interrumpido» (no «suspendido»): también se reanuda. */
  preparar() {
    if (this.ctx && this.ctx.state === 'closed') this.ctx = null;
    if (this.ctx) { if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {}); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    try { this.ctx = new C(); } catch (e) { this.ctx = null; return; }
    this.precargar();
  },
  /** 3.4 · En ratos libres trae a memoria las frases cortas (cerca de 1 MB) y deja listas las más usadas. */
  precargar() {
    if (this._precargando) return; this._precargando = true;
    const libre = f => (window.requestIdleCallback ? requestIdleCallback(f, { timeout: 4000 }) : setTimeout(f, 1200));
    const cortas = Object.keys(VOZ).filter(k => !/^(ayuda|porque)-/.test(k) && !this.faltan.has(k));
    const orden = [...VOZ_PRIMERO, ...cortas.filter(k => !VOZ_PRIMERO.includes(k))];
    let i = 0;
    const siguiente = () => {
      if (i >= orden.length) return;
      const k = orden[i++];
      (VOZ_PRIMERO.includes(k) ? this.cargar(k) : this.traer(k)).catch(() => {}).finally(() => libre(siguiente));
    };
    libre(siguiente);
  },
  /** Los bytes del archivo (sin preparar todavía). */
  traer(clave) {
    if (this.bytes[clave]) return Promise.resolve(this.bytes[clave]);
    return fetch(`audio/${clave}.mp3`).then(r => { if (!r.ok) throw new Error('sin audio'); return r.arrayBuffer(); }).then(b => (this.bytes[clave] = b));
  },
  /** La frase lista para sonar. Se prepara una sola vez, aunque la pidan dos veces seguidas. */
  cargar(clave) {
    if (this.buffers[clave]) return Promise.resolve(this.buffers[clave]);
    if (this.cargando[clave]) return this.cargando[clave];
    if (!this.ctx) return Promise.reject(new Error('sin audio'));
    const p = this.traer(clave).then(b => new Promise((ok, mal) => this.ctx.decodeAudioData(b.slice(0), ok, mal))).then(buf => {
      this.buffers[clave] = buf; delete this.bytes[clave];
      /* 3.4 · Cada archivo empieza con 25 a 115 ms de silencio: se salta al reproducir. */
      try { const d = buf.getChannelData(0), n = d.length; let j = 0; while (j < n && Math.abs(d[j]) < 0.004) j++; this.inicio[clave] = Math.max(0, j / buf.sampleRate - 0.012); } catch (e) { this.inicio[clave] = 0; }
      return buf;
    });
    this.cargando[clave] = p; p.finally(() => { delete this.cargando[clave]; }).catch(() => {});
    return p;
  },
  /** Prepara una frase larga antes de que la pidan (la Ayuda y los «¿Por qué?», al abrirse). */
  alistar(clave) { if (clave && VOZ[clave] && this.ctx && !this.faltan.has(clave)) this.cargar(clave).catch(() => {}); },
  parar() { try { this.sonando && this.sonando.stop(); } catch (e) { /* ya paró */ } this.sonando = null; },
  /** Calla lo que suena y descarta lo que iba a sonar. */
  callar() { this.turno++; this.parar(); },
  /** Dice una frase. forzar: suena aunque la voz esté apagada (botón «Escuchar»).
      3.4 · Una frase que no alcanzó a sonar a tiempo se descarta: nunca suena tarde. */
  async decir(clave, { forzar = false } = {}) {
    if (!clave || !VOZ[clave] || this.faltan.has(clave) || (!forzar && !this.encendida())) return false;
    this.preparar(); if (!this.ctx) return false;
    const mio = ++this.turno, t0 = performance.now(), plazo = forzar ? 6000 : 1000;
    const vigente = () => mio === this.turno && !document.hidden && performance.now() - t0 <= plazo;
    try {
      if (this.ctx.state !== 'running') {
        await Promise.race([this.ctx.resume().catch(() => {}), new Promise(ok => setTimeout(ok, 300))]);
        if (this.ctx.state !== 'running') return false; // el celular no dejó sonar ahora: se salta, no se encola
      }
      const buf = await this.cargar(clave);
      if (!vigente()) return false;
      this.parar();
      const s = this.ctx.createBufferSource(); s.buffer = buf; s.connect(this.ctx.destination); s.start(0, this.inicio[clave] || 0);
      this.sonando = s; s.onended = () => { if (this.sonando === s) this.sonando = null; };
      return true;
    } catch (e) { if (mio === this.turno) this.faltan.add(clave); return false; }
  },
  claveDe(texto) { const t = String(texto || '').replace(/\s+/g, ' ').trim(); const r = VOZ_REGLAS.find(([re]) => re.test(t)); return r ? r[1] : null; },
  decirTexto(texto) { return this.decir(this.claveDe(texto)); }
};
document.addEventListener('pointerdown', () => Voz.preparar(), { capture: true });
document.addEventListener('keydown', () => Voz.preparar(), { capture: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) Voz.callar(); });
