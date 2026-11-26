/* Fiao · guía del primer uso.
   1. Práctica: el tendero anota su primer fiado de verdad, con un foco que le señala dónde tocar.
   2. Recorrido: con la tienda de ejemplo, cuatro focos con "Siguiente".
   3. Primeros pasos: una lista corta con avance en la libreta, hasta completar lo básico.
   Todo se puede saltar. Nada aparece dos veces. */
'use strict';

/* 2.0.3 · Alto de la barra de estado del iPhone (muesca o isla), para que nada quede debajo. */
function margenSeguroArriba() {
  if (margenSeguroArriba.v == null) { const m = Object.assign(document.createElement('div'), { style: 'position:fixed;top:0;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none' }); document.body.appendChild(m); margenSeguroArriba.v = m.offsetHeight; m.remove(); }
  return margenSeguroArriba.v;
}

const Foco = {
  capa: null, burbuja: null, objetivo: null, raf: 0, arriba: false,
  mostrar(selector, html, { paso = '', acciones = '', arriba = false } = {}) {
    this.quitar();
    const raiz = hojaAbierta() || document.body;
    this.objetivo = selector; this.arriba = arriba;
    this.capa = Object.assign(document.createElement('div'), { className: 'guia-foco' });
    this.capa.setAttribute('aria-hidden', 'true');
    this.burbuja = Object.assign(document.createElement('div'), { className: 'guia-burbuja' });
    this.burbuja.setAttribute('role', 'dialog'); this.burbuja.setAttribute('aria-label', 'Guía');
    /* 2.0.2 · Sin botones propios (la práctica), «Saltar guía» va arriba, junto al paso: la burbuja queda más baja. */
    const saltar = '<button type="button" class="btn-link" data-guia-saltar>Saltar guía</button>';
    this.burbuja.innerHTML = acciones
      ? `${paso ? `<span class="paso">${paso}</span>` : ''}<p>${html}</p><div class="guia-botones">${acciones}</div>`
      : `<div class="guia-cabeza"><span class="paso">${paso}</span>${saltar}</div><p>${html}</p>`;
    raiz.append(this.capa, this.burbuja);
    /* 2.1.1 · Con botones (el recorrido), la burbuja es modal: el fondo queda inerte y Escape la salta. */
    if (acciones) { this.burbuja.setAttribute('aria-modal', 'true'); Guia.bloquearFondo(true); }
    /* 2.0.3 · Dentro de una hoja, la burbuja sube a la capa superior (popover): Safari recorta lo que
       sobresale de la hoja y la burbuja se veía cortada. Donde no hay popover, se queda dentro de la hoja. */
    if (hojaAbierta() && this.burbuja.showPopover) { this.burbuja.setAttribute('popover', 'manual'); try { this.burbuja.showPopover(); } catch (e) { /* sigue dentro de la hoja */ } }
    /* 2.0.2 · Si lo señalado quedó fuera de la vista (letra «Más grande»), se trae al centro primero. */
    const el = (hojaAbierta() || document).querySelector(selector), rr = el?.getBoundingClientRect();
    if (rr && rr.height && (rr.top < 0 || rr.bottom > innerHeight)) el.scrollIntoView({ block: 'center', behavior: reducido() ? 'auto' : 'smooth' });
    anunciar(this.burbuja.querySelector('p').textContent);
    if (typeof Voz !== 'undefined') Voz.decirTexto(this.burbuja.querySelector('p').textContent);
    this.burbuja.querySelector('[data-guia-saltar]')?.addEventListener('click', () => Guia.terminar());
    const seguir = () => { this.ubicar(); this.raf = requestAnimationFrame(seguir); };
    this.raf = requestAnimationFrame(seguir);
  },
  ubicar() {
    if (!this.capa) return;
    const raiz = hojaAbierta() || document;
    const els = this.objetivo ? [...raiz.querySelectorAll(this.objetivo)].filter(e => e.getClientRects().length) : [];
    const alto = innerHeight;
    if (!els.length) { this.capa.style.opacity = '0'; this.burbuja.style.top = 'calc(env(safe-area-inset-top, 0px) + 1rem)'; this.burbuja.style.bottom = 'auto'; return; }
    /* 2.0.2 · El foco abraza todo lo que se ve de los objetivos, también lo que sobresale
       (el círculo naranja de «Fiar» sube por encima de la barra), y nunca se sale de la pantalla ni de la hoja. */
    const r = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }, pad = 6;
    for (const el of els) for (const n of [el, ...el.querySelectorAll('*')]) {
      const b = n.getBoundingClientRect(); if (!b.width || !b.height) continue;
      r.left = Math.min(r.left, b.left); r.top = Math.min(r.top, b.top); r.right = Math.max(r.right, b.right); r.bottom = Math.max(r.bottom, b.bottom);
    }
    const lim = hojaAbierta()?.getBoundingClientRect() || { top: 0, bottom: alto };
    /* 2.0.3 · Lo que de verdad se ve: sin la barra de estado del iPhone ni lo que tape el teclado. */
    const vv = window.visualViewport, vTop = Math.max(vv ? vv.offsetTop : 0, margenSeguroArriba()), vBot = vv ? vv.offsetTop + vv.height : alto;
    r.top = Math.max(r.top, lim.top + pad, pad); r.bottom = Math.min(r.bottom, lim.bottom - pad, alto - pad);
    r.width = r.right - r.left; r.height = r.bottom - r.top;
    Object.assign(this.capa.style, { opacity: '1', left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
    /* La burbuja no tapa el foco: va del lado donde cabe (el de más aire si caben los dos). */
    const h = this.burbuja.offsetHeight, margen = 14, arriba = r.top - pad - margen - vTop, abajo = vBot - r.bottom - pad - margen;
    const cabeArriba = arriba >= h + 12, cabeAbajo = abajo >= h + 12;
    const ponerArriba = cabeArriba && cabeAbajo ? arriba >= abajo : cabeArriba || (!cabeAbajo && arriba >= abajo);
    let top = ponerArriba ? r.top - pad - margen - h : r.bottom + pad + margen;
    /* Pasos dentro de la hoja de fiar: la burbuja va arriba de la hoja, sobre el nombre y la pregunta, que repite. */
    if (this.arriba) top = Math.max(lim.top + 8, vTop + 8);
    const minTop = vTop + 8;
    this.burbuja.style.bottom = 'auto'; this.burbuja.style.top = `${Math.max(minTop, Math.min(vBot - h - 12, top))}px`;
  },
  quitar() { cancelAnimationFrame(this.raf); this.capa?.remove(); this.burbuja?.remove(); this.capa = this.burbuja = null; Guia.bloquearFondo(false); }
};

const Guia = {
  /** 2.1.1 · Mientras habla la guía, el teclado y el lector de pantalla no se van al fondo atenuado. */
  bloquearFondo(si) {
    const app = document.getElementById('app'); if (app) app.inert = !!si;
    if (si && !this._esc) { this._esc = ev => {
      const bur = document.querySelector('.guia-burbuja[aria-modal="true"]'); if (!bur) return;
      if (ev.key === 'Escape') { ev.preventDefault(); bur.querySelector('[data-guia-saltar]')?.click(); return; }
      if (ev.key !== 'Tab') return;
      /* El Tab da la vuelta dentro de la burbuja */
      const bs = [...bur.querySelectorAll('button')]; if (!bs.length) return;
      const i = bs.indexOf(document.activeElement), j = ev.shiftKey ? (i <= 0 ? bs.length - 1 : i - 1) : (i === bs.length - 1 || i < 0 ? 0 : i + 1);
      ev.preventDefault(); bs[j].focus();
    }; document.addEventListener('keydown', this._esc); }
    if (!si && this._esc) { document.removeEventListener('keydown', this._esc); this._esc = null; }
  },
  modo() { return (Datos.tienda && Datos.tienda.guia) || 'hecha'; },
  async poner(modo) { const t = tienda(); t.guia = modo; await guardarTienda(t); },
  async terminar() { Foco.quitar(); await this.poner('hecha'); this.indice = 0; },
  indice: 0,

  /* ── Práctica: su primer fiado ── */
  practica: [
    { cuando: 'vista:inicio', sel: '[data-guia="anotar"]', texto: 'Anote su primer fiado. Toque aquí.', sigue: 'hoja-abierta:anotar' },
    { cuando: 'anotar-nuevo', sel: '[data-guia="cliente-nuevo"]', texto: 'Escriba el nombre de un cliente y toque «Seguir».', sigue: 'anotar-monto' },
    { cuando: 'anotar-monto', sel: '.rapidos, #h-anotar', texto: 'Marque cuánto se llevó. Luego toque «Fiar».', sigue: 'anotado', arriba: true, apartaCon: 'monto' }
  ],
  /* ── Recorrido de la tienda de ejemplo ── */
  recorrido: [
    { sel: '.cifra-cab', texto: 'Esto es lo que le deben entre todos.' },
    { sel: '#app .lista li:first-child', texto: 'Primero salen los atrasados y los que pagan hoy.' },
    { sel: '[data-guia="anotar"]', texto: 'Con este botón anota un fiado en segundos.' },
    { sel: '.nav a[href="#cobros"]', texto: 'Aquí ve a quién recordar y cuándo lo permite la ley.' }
  ],

  alEvento(paso, nombre) {
    const modo = this.modo();
    const clave = nombre ? `${paso}:${nombre}` : paso;
    if (modo === 'practica') {
      const p = this.practica[this.indice];
      if (paso === 'anotado' && this.indice === this.practica.length - 1) { this.indice++; this.felicitar(); return; }
      /* 2.0.3 · Con el primer monto marcado, la burbuja se aparta: ya se ve la cifra y «Fiar $…» en naranja. */
      if (p && p.apartaCon === clave && Foco.capa) { Foco.quitar(); return; }
      if (p && p.sigue === clave) { this.indice++; Foco.quitar(); setTimeout(() => this.pintarPractica(), 360); }
      else if (p && p.cuando === clave) setTimeout(() => this.pintarPractica(), 360);
      if (paso === 'hoja-cerrada' && nombre === 'anotar' && this.indice > 0 && this.indice < this.practica.length) {
        this.indice = 0; Foco.quitar(); setTimeout(() => this.pintarPractica(), 360);
      }
      return;
    }
    if (modo === 'recorrido' && clave === 'vista:inicio') setTimeout(() => this.pintarRecorrido(), 400);
    if (paso === 'vista' && !['inicio'].includes(nombre)) Foco.quitar();
  },
  pintarPractica() {
    const p = this.practica[this.indice]; if (!p || this.modo() !== 'practica') return;
    if (!(hojaAbierta() || document).querySelector(p.sel)) return;
    Foco.mostrar(p.sel, p.texto, { paso: `Práctica · paso ${this.indice + 1} de ${this.practica.length}`, arriba: !!p.arriba });
  },
  felicitar() {
    Foco.quitar(); celebrar();
    const b = Object.assign(document.createElement('div'), { className: 'guia-burbuja' });
    b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Guía'); b.style.top = 'calc(env(safe-area-inset-top, 0px) + 1rem)';
    b.innerHTML = `<span class="paso">Práctica terminada</span><p>¡Muy bien! Así de fácil anota un fiado.</p><p style="font-weight:400;font-size:1.0625rem">Si fue de prueba, toque «Deshacer» abajo.</p><div class="guia-botones"><span></span><button type="button" class="btn-mini">Entendido</button></div>`;
    document.body.appendChild(b); anunciar('¡Muy bien! Así de fácil anota un fiado.'); if (typeof Voz !== 'undefined') Voz.decir('practica');
    b.querySelector('button').focus();
    b.querySelector('button').addEventListener('click', () => { b.remove(); this.terminar(); });
  },
  pintarRecorrido() {
    if (this.modo() !== 'recorrido' || location.hash.slice(1).split('-')[0] !== 'inicio') return;
    const i = this.indice, p = this.recorrido[i]; if (!p) return this.terminar();
    const ultimo = i === this.recorrido.length - 1;
    Foco.mostrar(p.sel, p.texto, { paso: `${i + 1} de ${this.recorrido.length}`, acciones: `<button type="button" class="btn-link izq" data-guia-saltar>Saltar</button><button type="button" class="btn-mini" data-guia-sigue>${ultimo ? 'Listo' : 'Siguiente'}</button>` });
    const sigue = Foco.burbuja.querySelector('[data-guia-sigue]');
    sigue.focus();
    sigue.addEventListener('click', () => { this.indice++; if (ultimo) this.terminar(); else this.pintarRecorrido(); });
  }
};
document.addEventListener('fiao', ev => Guia.alEvento(ev.detail.paso, ev.detail.nombre));

/* ── Primeros pasos, en la libreta ── */
function pasosHtml() {
  const t = tienda(); if (!Datos.tienda || t.demo || t.ocultarPasos) return '';
  const movs = [...Datos.movs.values()];
  const items = [
    ['Crear su tienda', true],
    ['Anotar un fiado', movs.some(m => m.tipo === 'fiado')],
    ['Mostrar o enviar un recibo', movs.some(m => m.visto || m.enviado)],
    ['Registrar un pago', movs.some(m => m.tipo === 'pago')],
    ['Guardar una copia', !!t.ultimaCopia]
  ];
  const n = items.filter(x => x[1]).length;
  if (n === items.length) return '';
  return `<section class="pasos" aria-labelledby="t-pasos">
    <div class="encabezado-lista"><h2 class="titulo-seccion" id="t-pasos">Primeros pasos</h2><span>${n} de ${items.length}</span></div>
    <div class="avance" role="progressbar" aria-label="Primeros pasos" aria-valuemin="0" aria-valuemax="${items.length}" aria-valuenow="${n}"><span style="width:${n / items.length * 100}%"></span></div>
    <ul>${items.map(([x, h]) => `<li class="${h ? 'hecho' : ''}"><span class="marca">${h ? ic('ok', 16, 3) : ''}</span><span>${x}${h ? '<span class="vh"> (hecho)</span>' : ''}</span></li>`).join('')}</ul>
    <button type="button" class="btn-link izq" data-accion="ocultar-pasos" style="min-height:2.75rem;font-size:1rem">Ocultar esta lista</button></section>`;
}
