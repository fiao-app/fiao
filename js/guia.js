/* Fiao · guía del primer uso.
   1. Práctica: el tendero anota su primer fiado de verdad, con un foco que le señala dónde tocar.
   2. Recorrido: con la tienda de ejemplo, cuatro focos con "Siguiente".
   3. Primeros pasos: una lista corta con avance en la libreta, hasta completar lo básico.
   Todo se puede saltar. Nada aparece dos veces. */
'use strict';

const Foco = {
  capa: null, burbuja: null, objetivo: null, raf: 0,
  mostrar(selector, html, { paso = '', acciones = '' } = {}) {
    this.quitar();
    const raiz = hojaAbierta() || document.body;
    this.objetivo = selector;
    this.capa = Object.assign(document.createElement('div'), { className: 'guia-foco' });
    this.capa.setAttribute('aria-hidden', 'true');
    this.burbuja = Object.assign(document.createElement('div'), { className: 'guia-burbuja' });
    this.burbuja.setAttribute('role', 'dialog'); this.burbuja.setAttribute('aria-label', 'Guía');
    this.burbuja.innerHTML = `${paso ? `<span class="paso">${paso}</span>` : ''}<p>${html}</p><div class="acciones">${acciones || '<button type="button" class="btn-link izq" data-guia-saltar>Saltar guía</button>'}</div>`;
    raiz.append(this.capa, this.burbuja);
    anunciar(this.burbuja.querySelector('p').textContent);
    if (typeof Voz !== 'undefined') Voz.decirTexto(this.burbuja.querySelector('p').textContent);
    this.burbuja.querySelector('[data-guia-saltar]')?.addEventListener('click', () => Guia.terminar());
    const seguir = () => { this.ubicar(); this.raf = requestAnimationFrame(seguir); };
    this.raf = requestAnimationFrame(seguir);
  },
  ubicar() {
    if (!this.capa) return;
    const raiz = hojaAbierta() || document;
    const el = this.objetivo ? raiz.querySelector(this.objetivo) : null;
    const alto = innerHeight;
    if (!el || !el.getClientRects().length) { this.capa.style.opacity = '0'; this.burbuja.style.top = '1rem'; this.burbuja.style.bottom = 'auto'; return; }
    const r = el.getBoundingClientRect(), pad = 6;
    Object.assign(this.capa.style, { opacity: '1', left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
    if (r.top + r.height / 2 > alto / 2) { this.burbuja.style.top = 'auto'; this.burbuja.style.bottom = `${Math.max(12, alto - r.top + 16)}px`; }
    else { this.burbuja.style.bottom = 'auto'; this.burbuja.style.top = `${Math.min(alto - 160, r.bottom + 16)}px`; }
  },
  quitar() { cancelAnimationFrame(this.raf); this.capa?.remove(); this.burbuja?.remove(); this.capa = this.burbuja = null; }
};

const Guia = {
  modo() { return (Datos.tienda && Datos.tienda.guia) || 'hecha'; },
  async poner(modo) { const t = tienda(); t.guia = modo; await guardarTienda(t); },
  async terminar() { Foco.quitar(); await this.poner('hecha'); this.indice = 0; },
  indice: 0,

  /* ── Práctica: su primer fiado ── */
  practica: [
    { cuando: 'vista:inicio', sel: '[data-guia="anotar"]', texto: 'Anote su primer fiado. Toque aquí.', sigue: 'hoja-abierta:anotar' },
    { cuando: 'anotar-nuevo', sel: '[data-guia="cliente-nuevo"]', texto: 'Escriba el nombre de un cliente y toque «Seguir».', sigue: 'anotar-monto' },
    { cuando: 'anotar-monto', sel: '[data-guia="monto"]', texto: 'Marque cuánto se llevó. Luego toque «Anotar».', sigue: 'anotado' }
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
    Foco.mostrar(p.sel, p.texto, { paso: `Práctica · paso ${this.indice + 1} de ${this.practica.length}` });
  },
  felicitar() {
    Foco.quitar(); celebrar();
    const b = Object.assign(document.createElement('div'), { className: 'guia-burbuja' });
    b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Guía'); b.style.top = '1rem';
    b.innerHTML = `<span class="paso">Práctica terminada</span><p>¡Muy bien! Así de fácil anota un fiado.</p><p style="font-weight:400;font-size:1.0625rem">Si fue de prueba, toque «Deshacer» abajo.</p><div class="acciones"><span></span><button type="button" class="btn-mini">Entendido</button></div>`;
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
