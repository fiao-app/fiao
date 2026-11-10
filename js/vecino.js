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
        <a class="btn" id="v-enviar" href="#" target="_blank" rel="noopener">${ic('enviar', 22, 2.4)}Enviar aviso por WhatsApp</a>
        <p class="ayuda">${k.w ? 'Le llega a la tienda por WhatsApp.' : 'Elija el chat de la tienda en WhatsApp.'} La tienda confirma el pago y le manda su comprobante.</p>
      </section>` : `<div class="info ok">${ic('ok', 22)}<p>¡Gracias! Su cuenta está al día.</p></div>`}
      <p class="ayuda">Si fía o paga después, la tienda le manda un enlace nuevo.</p>
    </main>
    <footer style="padding:.625rem 1.25rem 1.25rem;display:flex;gap:.625rem;align-items:flex-start;color:var(--gris)">${ic('escudo', 20)}<p style="font-size:1rem;line-height:1.3125rem">Este enlace es solo para usted: no lo reenvíe. Su cuenta no se guarda en internet. Fiao no recibe su dinero.</p></footer>
  </div>`;
  montarVecino(app, k);
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
  const ya = app.querySelector('[data-accion="ya-pague"]'); if (!ya) return;
  const caja = app.querySelector('#aviso-pago'), inp = app.querySelector('#v-monto'), env = app.querySelector('#v-enviar');
  const leer = activarGrupos(app, () => actualizar());
  const actualizar = () => {
    const v = leerPesos(inp.value), medio = leer('medio');
    const por = medio === 'breb' ? 'por Bre-B' : medio === 'nequi' ? 'por Nequi' : '';
    const texto = `Hola, le escribe ${k.n}. Le acabo de pagar ${pesos(v)}${por ? ' ' + por : ''} a mi cuenta en ${k.t}. ¿Me confirma, por favor?`;
    env.href = enlaceWhatsApp(k.w || '', texto);
  };
  ya.addEventListener('click', () => { caja.hidden = !caja.hidden; ya.setAttribute('aria-expanded', !caja.hidden); if (!caja.hidden) inp.focus(); });
  activarCampoPesos(inp, actualizar);
  actualizar();
}
window.addEventListener('hashchange', pintarVecino);
pintarVecino();
