/* Fiao · movimiento.
   Cada animación explica algo: de dónde viene una pantalla, a dónde fue la plata, qué cambió.
   Reglas: solo transform y opacity; 120–200 ms al tocar, 220–320 ms entre pantallas;
   todo se apaga con «Movimiento: Reducido» en Ajustes (o si el celular pide menos movimiento). */
'use strict';

const Mov = {
  /** Primera vez en esta sesión que se ve algo (las entradas llamativas salen una sola vez). */
  vistos: new Set(),
  primeraVez(clave) { if (this.vistos.has(clave)) return false; this.vistos.add(clave); return true; },

  /* ── 1 · Elemento compartido: el nombre y el monto viajan de la lista a la ficha ── */
  nombrar(fila) {
    const n = fila.querySelector('.nombre'), m = fila.querySelector('.monto'), a = fila.querySelector('.avatar');
    if (n) n.style.viewTransitionName = 'cli-nombre';
    if (m) m.style.viewTransitionName = 'cli-monto';
    if (a) a.style.viewTransitionName = 'cli-avatar';
  },
  /** Después de pintar una pantalla nueva (dentro de la transición). */
  trasPintar(app, ruta, antes, animar) {
    if (reducido()) return;
    const id = (antes.match(/^cliente-([^-]+)/) || [])[1];
    if (ruta === 'cliente' && this.desdeFila) {
      this.desdeFila = false;
      const h1 = app.querySelector('.cab-marca h1'), cifra = app.querySelector('.cab-marca .cifra');
      if (h1) h1.style.viewTransitionName = 'cli-nombre';
      if (cifra) cifra.style.viewTransitionName = 'cli-monto';
    } else if (id && animar) {
      /* De vuelta a la lista: el nombre regresa a su fila, si la fila se ve en pantalla. */
      const fila = app.querySelector(`a.fila[href="#cliente-${CSS.escape(id)}"]`);
      if (fila) { const r = fila.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) this.nombrar(fila); }
    }
    if (!animar) return;
    /* 3 · Las filas entran en escalera (30 ms entre una y otra, solo las que se ven). */
    let i = 0;
    app.querySelectorAll('.contenido .lista > li, .contenido .kpi, .contenido .dato').forEach(el => {
      if (i > 9) return; const r = el.getBoundingClientRect(); if (r.top > innerHeight) return;
      el.style.setProperty('--i', i++); el.classList.add('escalon');
    });
    /* 9 · El ícono de la sección nueva da un saltico. */
    const ico = app.querySelector('.nav a[aria-current="page"] .ico');
    if (ico && antes.split('-')[0] !== ruta) ico.classList.add('rebota');
    /* 10 · Los avisos de hoy se asoman desde la derecha (la primera vez). */
    if (ruta === 'inicio' || !antes) {
      const cajas = app.querySelectorAll('.avisos-hoy .aviso-hoy');
      if (cajas.length && this.primeraVez('avisos')) cajas.forEach((c, k) => { c.style.setProperty('--i', k); c.classList.add('asoma'); });
      /* 12 · «Atrasado» late una vez, para que se note sin asustar. */
      const atr = app.querySelectorAll('.lista .estado.atrasado');
      if (atr.length && this.primeraVez('atrasado')) atr.forEach(e => e.classList.add('late'));
    }
  },
  desdeFila: false,
  /** Antes de cambiar de pantalla: si sale de la ficha hacia la lista, el nombre de arriba viaja de regreso. */
  antesDeTransicion(antes, hash) {
    if (reducido() || !/^cliente-/.test(antes) || !['inicio', 'cobros'].includes(hash.split('-')[0])) return;
    const h1 = document.querySelector('#app .cab-marca h1'), cifra = document.querySelector('#app .cab-marca .cifra');
    if (h1) h1.style.viewTransitionName = 'cli-nombre';
    if (cifra) cifra.style.viewTransitionName = 'cli-monto';
  },
  /** Quita los nombres compartidos cuando termina la transición (no deben repetirse). */
  limpiar() { document.querySelectorAll('[style*="view-transition-name"]').forEach(el => { el.style.viewTransitionName = ''; }); },

  /* ── 4 · Una moneda vuela del botón a la cifra de arriba ── */
  monedaVuela(desde) {
    if (reducido()) return;
    const meta = document.querySelector('#app .cab-marca .cifra');
    if (!desde || !meta) return;
    const a = desde.getBoundingClientRect(), b = meta.getBoundingClientRect();
    if (!a.width || b.bottom < 0) return;
    const m = document.createElement('div'); m.className = 'moneda-vuela'; m.setAttribute('aria-hidden', 'true'); m.textContent = '$';
    document.body.appendChild(m);
    const t = m.offsetWidth / 2;
    const x0 = a.left + a.width / 2 - t, y0 = a.top + a.height / 2 - t;
    const x1 = b.left + Math.min(b.width, 160) / 2 - t, y1 = b.top + b.height / 2 - t;
    const xm = (x0 + x1) / 2, ym = Math.min(y0, y1) - 60;
    const anim = m.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(0.6)`, opacity: 0 },
      { transform: `translate(${x0}px, ${y0 - 14}px) scale(1.1)`, opacity: 1, offset: 0.15 },
      { transform: `translate(${xm}px, ${ym}px) scale(1)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${x1}px, ${y1}px) scale(0.55)`, opacity: 0.2 }
    ], { duration: 560, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' });
    const fin = () => { m.remove(); meta.classList.remove('salta'); void meta.offsetWidth; meta.classList.add('salta'); };
    anim.onfinish = fin; anim.oncancel = () => m.remove();
  },
  /** Recuerda desde dónde se abrió «Anotar» (el botón flotante o el atajo de la ficha). */
  origen: null,

  /* ── 6 · Hojas que se cierran arrastrándolas hacia abajo ── */
  arrastrable(d) {
    let y0 = null, dy = 0, t0 = 0, id = null;
    d.addEventListener('pointerdown', e => {
      if (e.button > 0 || d.scrollTop > 2) return;
      const arriba = e.clientY - d.getBoundingClientRect().top < 40;
      if (!arriba && !e.target.closest('.asa, .hoja-cab')) return;
      if (e.target.closest('button, a, input, select, textarea, [role="radio"]')) return;
      y0 = e.clientY; dy = 0; t0 = performance.now(); id = e.pointerId;
      try { d.setPointerCapture(id); } catch (x) { /* nada */ }
      d.style.transition = 'none';
    });
    d.addEventListener('pointermove', e => {
      if (y0 === null || e.pointerId !== id) return;
      dy = Math.max(0, e.clientY - y0);
      d.style.transform = dy ? `translateY(${dy}px)` : '';
    });
    const soltar = e => {
      if (y0 === null || e.pointerId !== id) return;
      y0 = null; const h = d.offsetHeight, v = dy / Math.max(1, performance.now() - t0);
      if (dy > h * 0.3 || (v > 0.6 && dy > 40)) {
        d.style.transition = reducido() ? 'none' : 'transform 180ms cubic-bezier(0.4, 0, 1, 1)';
        d.style.transform = `translateY(${h}px)`;
        setTimeout(() => { cerrarHoja(); d.style.transform = ''; d.style.transition = ''; }, reducido() ? 0 : 180);
      } else if (dy) {
        /* No llegó: vuelve con un pequeño rebote. */
        d.style.transition = reducido() ? 'none' : 'transform 280ms var(--rebote)';
        d.style.transform = '';
        setTimeout(() => { d.style.transition = ''; }, 300);
      } else d.style.transition = '';
    };
    d.addEventListener('pointerup', soltar);
    d.addEventListener('pointercancel', soltar);
  },

  /* ── 8 · Un valor que se desliza hasta otro (el «imán» de Mitad) ── */
  deslizar(desde, hasta, ms, paso, fin) {
    if (reducido() || desde === hasta) { fin(); return; }
    const t0 = performance.now();
    const cuadro = t => {
      const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      if (k < 1) { paso(desde + (hasta - desde) * e); requestAnimationFrame(cuadro); } else fin();
    };
    requestAnimationFrame(cuadro);
  }
};

/* El toque en una fila de cliente marca qué va a viajar a la ficha. */
document.addEventListener('click', ev => {
  const f = ev.target.closest('a.fila[href^="#cliente-"]');
  if (f && !reducido()) { Mov.nombrar(f); Mov.desdeFila = true; }
  const o = ev.target.closest('.fab, .atajo[data-accion="anotar"]');
  if (o) Mov.origen = o.classList.contains('fab') ? '.fab' : '.atajo[data-accion="anotar"]';
}, true);

/* 7 · Las teclas se hunden y rebotan al tocarlas. */
document.addEventListener('pointerdown', ev => {
  const b = ev.target.closest('.teclado button, .paso-btn, .atajo .c, .frecuentes button');
  if (!b || reducido()) return;
  b.classList.remove('pulsa'); void b.offsetWidth; b.classList.add('pulsa');
}, { passive: true });
document.addEventListener('animationend', ev => {
  const el = ev.target; if (!(el instanceof Element)) return;
  ['pulsa', 'rebota', 'escalon', 'asoma', 'late', 'sube'].forEach(k => el.classList.contains(k) && el.classList.remove(k));
});
