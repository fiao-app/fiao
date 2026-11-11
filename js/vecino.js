/* Fiao · página del vecino: muestra la cuenta que viaja dentro del enlace.
   La cuenta va después del # y el navegador nunca envía esa parte al servidor:
   esta página no consulta nada en internet ni guarda nada. */
'use strict';

function leerCuenta() {
  try {
    const crudo = location.hash.slice(1);
    if (!crudo) return null;
    const j = JSON.parse(LZString.decompressFromEncodedURIComponent(crudo));
    return j && j.v === 1 ? j : null;
  } catch (e) { return null; }
}

/* El vecino no tiene Ajustes: la página sigue a su celular (más contraste → Tinta; menos movimiento → quieta). */
function temaVecino() {
  const r = document.documentElement;
  r.dataset.tema = matchMedia('(prefers-contrast: more)').matches ? 'tinta' : 'color';
  r.dataset.movimiento = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reducido' : 'completo';
}
function pintarVecino() {
  temaVecino();
  const app = document.getElementById('app');
  const k = leerCuenta();
  if (!k) {
    document.title = 'Enlace incompleto · Fiao';
    app.innerHTML = `<div class="pantalla"><header class="vecino-barra">${ic('enlace', 18, 2.2)}Enlace personal</header><main class="contenido holgado" style="justify-content:center;text-align:center;align-items:center">
      <span style="color:var(--alerta)">${ic('atencion', 48, 2)}</span><h1 style="font-size:1.5rem;line-height:1.875rem">Este enlace está incompleto</h1>
      <p style="font-size:1.125rem;line-height:1.625rem">Puede que se haya cortado al copiarlo. Pídale a la tienda que se lo envíe de nuevo.</p></main></div>`;
    return;
  }
  const g = new Date(k.g);
  const MED = { efectivo: 'Efectivo', nequi: 'Nequi', breb: 'Bre-B' };
  const movs = (k.m || []).slice().reverse();
  const fila = ([f, tipo, montoMov, desc, corr, anul]) => {
    const pago = tipo === 'p';
    const nombre = pago ? `Pagó${desc ? ' ' + desc : ''}` : tipo === 's' ? (desc || 'Lo que venía del cuaderno') : (desc ? desc[0].toUpperCase() + desc.slice(1) : 'Fiado');
    const notas = [corr ? `Corregido: decía ${pesos(corr)}` : '', anul ? 'Anulado: no cuenta' : ''].filter(Boolean).map(x => `<small>${x}</small>`).join('');
    return `<li class="${pago ? 'pago' : ''}${anul ? ' anulada' : ''}"><span class="d"><span>${esc(nombre)}</span>${notas}</span><span class="v">${pago ? '− ' : '+ '}${pesos(montoMov)}</span></li>`;
  };
  const filas = agruparPorDia(movs, g).map(gr => `<h3 class="dia-historial">${gr.dia}</h3><ul class="lista movs-vecino">${gr.items.map(fila).join('')}</ul>`).join('');
  const ant = k.ant ? `<ul class="lista movs-vecino"><li><span class="d" style="color:var(--gris)">Venía debiendo de antes</span><span class="v" style="color:var(--gris)">${pesos(k.ant)}</span></li></ul>` : '';
  const debe = k.s > 0;
  document.title = `Su cuenta en ${k.t} · Fiao`;
  app.innerHTML = `<div class="pantalla">
    <header class="cab-marca vecino-cab">
      <div class="fila-cab"><div class="titulos"><span class="tienda-vecino">${ic('tienda', 22, 2.2)}<b>${esc(k.t)}</b></span><span class="sub">Su cuenta al ${diaMes(g)}, ${hora(g)}</span></div></div>
      <section class="cifra-cab" aria-labelledby="t-cuenta"><h1 id="t-cuenta" style="font-size:1.25rem;line-height:1.625rem;margin-bottom:.375rem">${esc(k.n)}, así iba su cuenta</h1>
        ${debe ? `<span class="rotulo">Usted debe</span><span class="cifra">${pesos(k.s)}</span>` : `<span class="cifra" style="font-size:2rem;line-height:2.5rem">No debe nada</span>`}
        ${debe && k.a ? `<span class="extra"><span style="display:inline-flex;align-items:center;gap:.375rem">${ic('calendario', 18, 2.2)}Acordaron pagar el ${fechaLarga(diaDe(k.a))}</span></span>` : ''}</section>
    </header><div class="toldo" aria-hidden="true"></div>
    <main class="contenido" style="gap:.875rem">
      ${k.e ? `<div class="banda demo">${ic('atencion', 20)}<span><b>Cuenta de ejemplo.</b> Los nombres y montos son inventados: no pague nada.</span></div>` : ''}
      ${filas ? `<section class="recibo" aria-labelledby="t-mov"><h2 class="titulo-seccion" id="t-mov">Historial</h2>${filas}${ant}</section>` : ''}
      ${debe ? `<section class="tarjeta" aria-labelledby="t-pagar"><h2 class="titulo-seccion" id="t-pagar">¿Cómo pagar?</h2>
        ${k.b ? copiable('Llave Bre-B', k.b, 'llave') : ''}${k.q ? copiable('Nequi', celLegible(k.q), 'nequi') : ''}
        <span>O en efectivo, en la tienda.</span>
        ${k.b || k.q ? `<p class="ayuda" style="display:flex;gap:.5rem">${ic('escudo', 20)}<span>Antes de pagar, confirme que estos datos son los que le dio su tienda. Fiao no los verifica ni recibe pagos.</span></p>` : ''}</section>
      <button type="button" class="btn" data-accion="ya-pague" aria-expanded="false" aria-controls="aviso-pago">${ic('chat', 22, 2.2)}Ya pagué: avisarle a la tienda</button>
      <section class="tarjeta" id="aviso-pago" hidden aria-label="Avisar el pago">
        <div class="campo"><label for="v-monto">¿Cuánto pagó?</label><input class="entrada grande" id="v-monto" inputmode="numeric" value="${pesos(k.s)}" autocomplete="off"></div>
        <fieldset><legend class="leyenda">¿Por dónde?</legend><div class="chips" role="radiogroup" aria-label="Por dónde pagó" data-grupo="medio">
          ${chip('Bre-B', true, 'data-valor="breb"', 'radio')}${chip('Nequi', false, 'data-valor="nequi"', 'radio')}${chip('Otro', false, 'data-valor="otro"', 'radio')}</div></fieldset>
        <a class="btn" id="v-enviar" href="#" target="_blank" rel="noopener" data-wa>${ic('enviar', 22, 2.4)}Enviar aviso por WhatsApp</a>
        <p class="ayuda">${k.w ? 'Le llega a la tienda por WhatsApp.' : 'Elija el chat de la tienda en WhatsApp.'} La tienda confirma el pago y le manda su comprobante.</p>
      </section>${k.i ? cajaOtroDia() : ''}` : `<div class="info ok">${ic('ok', 22)}<p>¡Gracias! Su cuenta está al día.</p></div>`}
      ${k.i && filas ? cajaNoCuadra() : ''}
      <p class="ayuda">Si fía o paga después, la tienda le manda un enlace nuevo.</p>
    </main>
    <footer style="padding:.625rem 1.25rem 1.25rem;display:flex;gap:.625rem;align-items:flex-start;color:var(--gris)">${ic('escudo', 20)}<p style="font-size:1rem;line-height:1.3125rem">Este enlace es solo para usted: no lo reenvíe. Su cuenta no se guarda en internet. Fiao no recibe su dinero.</p></footer>
  </div>`;
  montarVecino(app, k);
}
/* 3.4 · «Necesito otro día»: el vecino elige un día y se lo pide a la tienda por WhatsApp. */
function diasParaPedir() { const h = new Date(); return [1, 3, 7].map(n => sumarDias(h, n)); }
function cajaOtroDia() {
  const [d1, d3, d7] = diasParaPedir();
  return `<button type="button" class="btn-sec" data-accion="otro-dia" aria-expanded="false" aria-controls="caja-otro-dia">${ic('calendario', 22, 2.2)}Necesito otro día</button>
      <section class="tarjeta" id="caja-otro-dia" hidden aria-label="Pedir otro día">
        <fieldset><legend class="leyenda">¿Qué día puede pagar?</legend><div class="chips" role="radiogroup" aria-label="Qué día puede pagar" data-grupo="dia">
          ${chip('Mañana', false, `data-valor="${isoDia(d1)}"`, 'radio')}${chip(esc(mayuscula(elDia(d3))), false, `data-valor="${isoDia(d3)}"`, 'radio')}${chip(esc(mayuscula(elDia(d7))), false, `data-valor="${isoDia(d7)}"`, 'radio')}${chip('Otro día', false, 'data-valor="otro"', 'radio')}</div></fieldset>
        <div class="campo" id="v-caja-dia" hidden><label for="v-dia">Elija el día</label><input class="entrada" id="v-dia" type="date" min="${isoDia(d1)}" max="${isoDia(sumarDias(new Date(), 60))}"></div>
        <a class="btn" id="v-enviar-dia" href="#" target="_blank" rel="noopener" data-wa hidden>${ic('enviar', 22, 2.4)}Pedirlo por WhatsApp</a>
        <p class="ayuda">La tienda decide y le confirma por WhatsApp.</p>
      </section>`;
}
/* 3.4 · «Algo no me cuadra»: el vecino le avisa a la tienda, con un enlace que le abre su cuenta en Fiao. */
const NO_CUADRA = { monto: ['Un monto', 'un monto no me cuadra'], llevo: ['Algo que no llevé', 'aparece algo que no llevé'], pago: ['Falta un pago', 'falta un pago que hice'], otro: ['Otra cosa', 'algo no me cuadra'] };
function cajaNoCuadra() {
  return `<button type="button" class="btn-link" data-accion="no-cuadra" aria-expanded="false" aria-controls="caja-no-cuadra">${ic('chat', 20, 2.2)}Algo no me cuadra</button>
      <section class="tarjeta" id="caja-no-cuadra" hidden aria-label="Algo no me cuadra">
        <fieldset><legend class="leyenda">¿Qué no le cuadra?</legend><div class="chips" role="radiogroup" aria-label="Qué no le cuadra" data-grupo="motivo">
          ${Object.entries(NO_CUADRA).map(([v, [t]]) => chip(t, false, `data-valor="${v}"`, 'radio')).join('')}</div></fieldset>
        <a class="btn" id="v-enviar-cuadra" href="#" target="_blank" rel="noopener" data-wa hidden>${ic('enviar', 22, 2.4)}Avisarle a la tienda</a>
        <p class="ayuda">La tienda revisa su cuenta y, si hay un error, le manda la corrección.</p>
      </section>`;
}
function copiable(rotulo, valor, id) {
  return `<div class="copiable"><span><small>${rotulo}</small><b id="v-${id}">${esc(valor)}</b></span><button type="button" class="btn-mini sec" data-copiar="v-${id}" aria-label="Copiar ${rotulo}">${ic('copiar', 18, 2.2)} Copiar</button></div>`;
}
function montarVecino(app, k) {
  app.firstElementChild.addEventListener('click', async ev => {
    const b = ev.target.closest('[data-copiar]'); if (!b) return;
    const txt = document.getElementById(b.dataset.copiar).textContent.replace(/\s/g, '');
    try { await navigator.clipboard.writeText(txt); avisar('Copiado.'); }
    catch (e) { const r = document.createRange(); r.selectNodeContents(document.getElementById(b.dataset.copiar)); const s = getSelection(); s.removeAllRanges(); s.addRange(r); avisar('Quedó marcado. Manténgalo presionado para copiar.', { icono: null }); }
  });
  const base = location.href.replace(/#.*$/, '').replace(/c\/(index\.html)?$/, '');
  /* 3.4 · En iPhone, WhatsApp se abre por su propia dirección: sin una pestaña de más al volver. */
  const enviar = (a, texto) => { a._texto = texto; a.href = enlaceWhatsApp(k.w || '', texto); };
  app.querySelectorAll('a[data-wa]').forEach(a => a.addEventListener('click', ev => {
    if (!esIOS() || !a._texto) return;
    ev.preventDefault(); abrirWhatsApp(k.w || '', a._texto, { recordar: false });
  }));
  const cambios = [];
  const leer = activarGrupos(app, () => cambios.forEach(f => f()));
  const desplegar = (b, caja, alAbrir) => b && b.addEventListener('click', () => { caja.hidden = !caja.hidden; b.setAttribute('aria-expanded', !caja.hidden); if (!caja.hidden && alAbrir) alAbrir(); });
  const ya = app.querySelector('[data-accion="ya-pague"]');
  if (ya) {
    const caja = app.querySelector('#aviso-pago'), inp = app.querySelector('#v-monto'), env = app.querySelector('#v-enviar');
    const actualizar = () => {
      const v = leerPesos(inp.value), medio = leer('medio');
      const por = medio === 'breb' ? 'por Bre-B' : medio === 'nequi' ? 'por Nequi' : '';
      /* Con el enlace, la tienda abre la cuenta en Fiao de un toque (en los enlaces nuevos, que traen quién es). */
      const confirmar = k.i ? `\nConfirmar en Fiao: ${base}#pago-${encodeURIComponent(k.i)}-${v}.${medio}` : '';
      const texto = `Hola, le escribe ${k.n}. Le acabo de pagar ${pesos(v)}${por ? ' ' + por : ''} a mi cuenta en ${k.t}. ¿Me confirma, por favor?${confirmar}`;
      enviar(env, texto);
    };
    cambios.push(actualizar);
    desplegar(ya, caja, () => inp.focus());
    activarCampoPesos(inp, actualizar);
    actualizar();
  }
  const otroDia = app.querySelector('[data-accion="otro-dia"]');
  if (otroDia) {
    const caja = app.querySelector('#caja-otro-dia'), cajaDia = app.querySelector('#v-caja-dia'), dia = app.querySelector('#v-dia'), env = app.querySelector('#v-enviar-dia');
    const actualizar = () => {
      const v = leer('dia'); cajaDia.hidden = v !== 'otro';
      const iso = v === 'otro' ? dia.value : v;
      const vale = /^\d{4}-\d{2}-\d{2}$/.test(iso || '') && iso >= dia.min && iso <= dia.max;
      env.hidden = !vale; if (!vale) return;
      enviar(env, `Hola, le escribe ${k.n}. ¿Me deja pagar mi cuenta en ${k.t} el ${fechaLarga(diaDe(iso))}?\nCambiar la fecha en Fiao: ${base}#fecha-${encodeURIComponent(k.i)}-${iso.replace(/-/g, '')}`);
    };
    cambios.push(actualizar);
    dia.addEventListener('change', actualizar);
    desplegar(otroDia, caja);
  }
  const noCuadra = app.querySelector('[data-accion="no-cuadra"]');
  if (noCuadra) {
    const caja = app.querySelector('#caja-no-cuadra'), env = app.querySelector('#v-enviar-cuadra');
    const actualizar = () => {
      const v = leer('motivo'); env.hidden = !NO_CUADRA[v]; if (!NO_CUADRA[v]) return;
      enviar(env, `Hola, le escribe ${k.n}. Revisé mi cuenta en ${k.t} y ${NO_CUADRA[v][1]}. ¿Me ayuda a revisarla?\nVer mi cuenta en Fiao: ${base}#revisar-${encodeURIComponent(k.i)}-${v}`);
    };
    cambios.push(actualizar);
    desplegar(noCuadra, caja);
  }
}
window.addEventListener('hashchange', pintarVecino);
pintarVecino();
