/* Fiao · piezas de interfaz reutilizables: íconos, encabezado, navegación, opciones,
   hojas inferiores, avisos con "Deshacer", movimiento, celebración, ayuda y "¿Por qué?". */
'use strict';

const ICONOS = {
  volver: '<path d="M15 18l-6-6 6-6"/>',
  sigue: '<path d="M9 18l6-6-6-6"/>',
  abajo: '<path d="M6 9l6 6 6-6"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  ajustes: '<path d="M9.28 4.90 L10.09 2.18 L13.91 2.18 L14.72 4.90 L15.09 5.06 L17.59 3.71 L20.29 6.41 L18.94 8.91 L19.10 9.28 L21.82 10.09 L21.82 13.91 L19.10 14.72 L18.94 15.09 L20.29 17.59 L17.59 20.29 L15.09 18.94 L14.72 19.10 L13.91 21.82 L10.09 21.82 L9.28 19.10 L8.91 18.94 L6.41 20.29 L3.71 17.59 L5.06 15.09 L4.90 14.72 L2.18 13.91 L2.18 10.09 L4.90 9.28 L5.06 8.91 L3.71 6.41 L6.41 3.71 L8.91 5.06Z"/><circle cx="12" cy="12" r="3.2"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  ok: '<path d="M20 6L9 17l-5-5"/>',
  atencion: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.8-5.4A8 8 0 1 1 21 12z"/>',
  candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  enviar: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  escudo: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  libreta: '<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4z"/><path d="M9 9h6M9 13h6"/>',
  campana: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  grafica: '<path d="M4 20V11M10 20V5M16 20v-6M2 20h20"/>',
  ojo: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  ojoNo: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  lapiz: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  archivo: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
  descargar: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/>',
  contactos: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  celular: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  enlace: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  copiar: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  girar: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>',
  cerrar: '<path d="M18 6L6 18M6 6l12 12"/>',
  borrar: '<path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="M17 9l-5 6M12 9l5 6"/>',
  tienda: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/>',
  ayuda: '<circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.3a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4"/><path d="M12 17.6h.01"/>',
  altavoz: '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  dinero: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.01M18 12h.01"/>',
  estrella: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  idea: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>'
};
function ic(nombre, tam = 24, grosor = 2) {
  return `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${grosor}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONOS[nombre] || ''}</svg>`;
}
/** El ícono de Fiao: el toldo rayado de la tienda de barrio forma el brazo de la F;
    la moneda naranja es el fiado que se anota y se paga. */
const LOGO = (t = 56, etiqueta = 'Fiao') => `<svg width="${t}" height="${t}" viewBox="0 0 56 56" ${etiqueta ? `role="img" aria-label="${etiqueta}"` : 'aria-hidden="true"'}><rect width="56" height="56" rx="13" fill="#2346A0"/><path d="M13 14Q13 11 16 11H23V19A5 5 0 0 1 13 19Z" fill="#FFFFFF"/><path d="M23 11H33V19A5 5 0 0 1 23 19Z" fill="#F28C5B"/><path d="M33 11H40Q43 11 43 14V19A5 5 0 0 1 33 19Z" fill="#FFFFFF"/><path d="M18 22V44M18 33H28.5" stroke="#FFFFFF" stroke-width="6.2" stroke-linecap="round" fill="none"/><circle cx="35.5" cy="33" r="4.4" fill="#F28C5B"/></svg>`;

const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function vibrar(patron = 12) { try { if (!reducido() && navigator.vibrate) navigator.vibrate(patron); } catch (e) { /* nada */ } }

/* ───── Montos visibles u ocultos (cuando hay gente en el mostrador) ───── */
const Vista = { oculto: false };
function monto(n) { return Vista.oculto ? '$ •••••' : pesos(n); }

/* ───── Encabezado ───── */
function btnAyuda() { return `<button type="button" class="btn-ayuda" data-accion="ayuda">${ic('ayuda', 22, 2.2)}Ayuda</button>`; }
function barra({ titulo, volver = null, sub = '', derecha = '', ayuda = true, extra = '' }) {
  const v = volver ? `<a class="btn-icono" href="#${volver}" data-volver aria-label="Volver">${ic('volver', 28, 2.4)}</a>` : '';
  return `<header class="barra${volver ? '' : ' sin-volver'}">${v}<div class="titulos"><h1 tabindex="-1">${titulo}</h1>${sub ? `<span class="sub">${sub}</span>` : ''}${extra}</div>${derecha}${ayuda ? btnAyuda() : ''}</header>`;
}
function btnIcono(icono, etiqueta, { href = null, accion = '', presionado = null } = {}) {
  if (href) return `<a class="btn-icono" href="#${href}" aria-label="${etiqueta}">${ic(icono, 26)}</a>`;
  return `<button type="button" class="btn-icono" data-accion="${accion}" aria-label="${etiqueta}"${presionado !== null ? ` aria-pressed="${presionado}"` : ''}>${ic(icono, 26)}</button>`;
}
/** Chip con quién atiende; se toca para cambiar. */
function chipAtiende() {
  const t = tienda();
  if (!t.atiendeAhora) return '';
  return `<button type="button" class="chip-atiende" data-accion="atiende">${ic('contactos', 18, 2.2)}Atiende: ${esc(t.atiendeAhora)}${(t.atienden || []).length > 1 ? ic('abajo', 18, 2.4) : ''}</button>`;
}

/* ───── Navegación inferior ───── */
function nav(activa) {
  const g = cuentaCobrosPendientes();
  const it = (clave, icono, rotulo, globo = 0) => `<a href="#${clave === 'libreta' ? 'inicio' : clave}"${clave === activa ? ' aria-current="page"' : ''}><span class="ico">${ic(icono, 24, clave === activa ? 2.4 : 2)}${globo ? `<span class="globo" aria-hidden="true">${globo}</span>` : ''}</span>${rotulo}${globo ? `<span class="vh">, ${globo} ${globo === 1 ? 'pendiente' : 'pendientes'}</span>` : ''}</a>`;
  return `<nav class="nav" aria-label="Secciones">${it('libreta', 'libreta', 'Libreta')}${it('cobros', 'campana', 'Cobros', g)}${it('resumen', 'grafica', 'Resumen')}${it('ajustes', 'ajustes', 'Ajustes')}</nav>`;
}
function cuentaCobrosPendientes(hoy = new Date()) {
  let n = 0;
  for (const c of clientes()) { const e = estadoDe(c, hoy); if (necesitaRecordatorio(c, e) && permisoOk(c) && !recordadoHoy(c.id, hoy)) n++; }
  return n;
}

/* ───── Opciones ───── */
function chip(texto, activo, datos = '', rol = 'pressed') {
  const aria = rol === 'radio' ? `role="radio" aria-checked="${activo}"` : `aria-pressed="${activo}"`;
  return `<button type="button" class="chip" ${aria} ${datos}><span class="ok">${ic('ok', 18, 2.6)}</span>${texto}</button>`;
}
/** Grupo de opciones excluyentes (radio) con data-grupo. */
function grupoOpciones(nombre, leyenda, opciones, valor, opcional = false) {
  return `<fieldset><legend class="leyenda">${leyenda}${opcional ? ' <span class="opcional">(opcional)</span>' : ''}</legend><div class="chips" role="radiogroup" aria-label="${esc(leyenda)}" data-grupo="${nombre}">${Object.entries(opciones).map(([k, t]) => chip(esc(t), String(k) === String(valor), `data-valor="${esc(k)}"`, 'radio')).join('')}</div></fieldset>`;
}
/** Activa los grupos de opciones dentro de un contenedor; devuelve una función que lee los valores. */
function activarGrupos(raiz, alCambiar = () => {}) {
  raiz.querySelectorAll('[data-grupo]').forEach(g => {
    g.addEventListener('click', ev => {
      const b = ev.target.closest('[data-valor]'); if (!b) return;
      g.querySelectorAll('[data-valor]').forEach(x => x.setAttribute('aria-checked', x === b ? 'true' : 'false'));
      alCambiar(g.dataset.grupo, b.dataset.valor);
    });
    g.addEventListener('keydown', ev => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(ev.key)) return;
      const bs = [...g.querySelectorAll('[data-valor]')]; const i = bs.indexOf(document.activeElement); if (i < 0) return;
      ev.preventDefault(); const j = (i + (ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length; bs[j].focus(); bs[j].click();
    });
  });
  return nombre => raiz.querySelector(`[data-grupo="${nombre}"] [aria-checked="true"]`)?.dataset.valor ?? null;
}
function estadoHtml(c, e) {
  const t = textoEstado(c, e);
  if (e.tipo === 'atrasado') return `<span class="estado atrasado">${ic('atencion', 16, 2.4)}${t}</span>`;
  if (e.tipo === 'hoy') return `<span class="estado hoy">${ic('reloj', 16, 2.4)}${t}</span>`;
  if (e.tipo === 'nada') return `<span class="estado ok">${ic('ok', 16, 2.6)}${t}</span>`;
  return `<span class="estado">${t}</span>`;
}
/** Fila de cliente para listas. */
function filaCliente(c, e, href) {
  const m = e.saldo > 0 ? `<span class="monto">${monto(e.saldo)}</span>` : '';
  return `<li><a class="fila" href="#${href}"><span class="avatar" aria-hidden="true">${esc(iniciales(c.nombre))}</span><span class="medio"><span class="nombre">${esc(c.nombre)}</span>${estadoHtml(c, e)}</span>${m}</a></li>`;
}

/* ───── Avisos abajo, con acciones y "Deshacer" ─────
   Se quedan 3 s (8 s si traen botones). Se pausan si el dedo o el foco están encima. */
let _avisoT = 0;
function anunciar(texto) { const a = document.getElementById('anuncio'); if (a) { a.textContent = ''; setTimeout(() => { a.textContent = texto; }, 30); } }
function ocultarAviso() { const a = document.getElementById('aviso'); if (!a) return; clearTimeout(_avisoT); a.classList.remove('ver'); a.inert = true; }
function avisar(texto, { acciones = [], ms = null, icono = 'ok' } = {}) {
  const a = document.getElementById('aviso'); if (!a) return;
  anunciar(texto + (acciones.length ? `. Opciones: ${acciones.map(x => x.texto).join(', ')}.` : ''));
  a.innerHTML = `<div class="linea"><span class="texto">${icono ? ic(icono, 22, 2.6) : ''}<span>${esc(texto)}</span></span><button type="button" class="cerrar" data-i="x" aria-label="Cerrar aviso">${ic('cerrar', 20, 2.4)}</button></div>
    ${acciones.length ? `<div class="acciones">${acciones.map((x, i) => `<button type="button" data-i="${i}"${x.fuerte ? ' class="fuerte"' : ''}>${esc(x.texto)}</button>`).join('')}</div>` : ''}`;
  const abajo = document.querySelector('#app .abajo');
  a.style.bottom = abajo ? `calc(${Math.round(abajo.getBoundingClientRect().height) + 12}px)` : 'calc(1rem + env(safe-area-inset-bottom, 0px))';
  a.inert = false; a.classList.add('ver');
  a.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => { ocultarAviso(); const x = acciones[+b.dataset.i]; if (x) x.fn(); }));
  const dura = ms ?? (acciones.length ? 8000 : 3200);
  const programar = () => { clearTimeout(_avisoT); _avisoT = setTimeout(ocultarAviso, dura); };
  a.onpointerenter = a.onfocusin = () => clearTimeout(_avisoT);
  a.onpointerleave = a.onfocusout = programar;
  programar();
}

/* ───── Hoja inferior (diálogo nativo). El botón Atrás del celular la cierra. ───── */
function hojaAbierta() { const d = document.getElementById('hoja'); return d && d.open ? d : null; }
function abrirHoja(html, alMontar = () => {}, { nombre = '' } = {}) {
  let d = document.getElementById('hoja');
  if (d.open) { d._sinHistoria = true; d.close(); }
  const nueva = d.cloneNode(false); d.replaceWith(nueva); d = nueva;
  d.innerHTML = `<div class="asa" aria-hidden="true"></div><div class="cuerpo"></div>`;
  d.dataset.nombre = nombre;
  pintarHoja(html, alMontar, d);
  if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  if (!(history.state && history.state.hoja)) history.pushState({ hoja: 1 }, '');
  d.addEventListener('close', () => {
    document.dispatchEvent(new CustomEvent('fiao', { detail: { paso: 'hoja-cerrada', nombre } }));
    if (!d._sinHistoria && history.state && history.state.hoja) history.back();
  });
  d.addEventListener('click', ev => {
    if (ev.target === d) { const r = d.getBoundingClientRect(); if (ev.clientY < r.top || ev.clientX < r.left || ev.clientX > r.right) cerrarHoja(); }
    const a = ev.target.closest('a[href^="#"]');
    if (a && !a.hasAttribute('download')) { ev.preventDefault(); ir(a.getAttribute('href').slice(1)); }
  });
  document.dispatchEvent(new CustomEvent('fiao', { detail: { paso: 'hoja-abierta', nombre } }));
  return d;
}
/** Cambia el contenido de la hoja abierta (pasos dentro de la misma hoja). */
function pintarHoja(html, alMontar = () => {}, d = document.getElementById('hoja')) {
  const cuerpo = d.querySelector('.cuerpo');
  cuerpo.innerHTML = html;
  const t = cuerpo.querySelector('h2'); if (t) { t.id = t.id || 'hoja-titulo'; d.setAttribute('aria-labelledby', t.id); }
  cuerpo.querySelectorAll('[data-cerrar]').forEach(b => b.addEventListener('click', ev => { ev.preventDefault(); cerrarHoja(); }));
  if (!reducido()) cuerpo.classList.remove('entra'), void cuerpo.offsetWidth, cuerpo.classList.add('entra');
  alMontar(d);
  return d;
}
function cerrarHoja() { const d = hojaAbierta(); if (d) d.close ? d.close() : d.removeAttribute('open'); }
function cabHoja(titulo) { return `<div class="hoja-cab"><h2>${titulo}</h2><button type="button" class="cerrar-hoja" data-cerrar aria-label="Cerrar">${ic('cerrar', 24, 2.4)}</button></div>`; }
/** Confirmación dentro de la app (el navegador puede bloquear confirm()). */
function confirmar({ titulo, texto, si, no = 'Cancelar', peligro = false }) {
  return new Promise(ok => {
    let respondio = false;
    const d = abrirHoja(`<h2>${titulo}</h2><p style="font-size:1.125rem;line-height:1.55">${texto}</p><button type="button" class="${peligro ? 'btn-sec peligro' : 'btn'}" data-si>${si}</button><button type="button" class="btn-link" data-cerrar>${no}</button>`, d => {
      d.querySelector('[data-si]').addEventListener('click', () => { respondio = true; cerrarHoja(); ok(true); });
    });
    d.addEventListener('close', () => { if (!respondio) ok(false); }, { once: true });
  });
}

/** Abre WhatsApp con el mensaje escrito. El tendero toca Enviar allá. */
function abrirWhatsApp(cel, texto) {
  const url = enlaceWhatsApp(cel, texto);
  const w = window.open(url, '_blank', 'noopener');
  if (!w) location.href = url;
}
/** Campo de pesos que se formatea solo mientras se escribe. */
function activarCampoPesos(input, alCambiar = () => {}) {
  input.addEventListener('input', () => {
    const v = leerPesos(input.value); input.value = v ? pesos(v) : '';
    alCambiar(v);
  });
}

/* ───── Movimiento y celebración (todo se apaga con "reducir movimiento") ───── */
function temblar(el) { if (!el) return; vibrar([20, 40, 20]); if (reducido()) return; el.classList.remove('tiembla'); void el.offsetWidth; el.classList.add('tiembla'); }
/** La cifra cuenta desde el valor anterior hasta el nuevo (0,6 s). */
function contar(el, desde, hasta) {
  if (!el || Vista.oculto || reducido() || desde === hasta) return;
  const t0 = performance.now(), dur = 600;
  const paso = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = pesos(Math.round(desde + (hasta - desde) * e)); if (k < 1) requestAnimationFrame(paso); };
  el.textContent = pesos(desde); requestAnimationFrame(paso);
}
function celebrar() {
  vibrar([30, 60, 30]);
  if (reducido()) return;
  const capa = document.createElement('div'); capa.className = 'celebracion'; capa.setAttribute('aria-hidden', 'true');
  const colores = ['#2346A0', '#F28C5B', '#17703F', '#F2C94C', '#5B8DEF'];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('i'); const ang = (Math.PI * 2 * i) / 22 + Math.random() * 0.4; const r = 120 + Math.random() * 140;
    p.style.background = colores[i % colores.length];
    p.style.setProperty('--dx', `${Math.cos(ang) * r}px`); p.style.setProperty('--dy', `${Math.sin(ang) * r + 80}px`);
    p.style.animationDelay = `${Math.random() * 120}ms`; capa.appendChild(p);
  }
  document.body.appendChild(capa); setTimeout(() => capa.remove(), 1400);
}
function selloOk(tam = 46) { return `<span class="sello">${`<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>`}</span>`; }

/* ───── "¿Por qué?": las razones (y las leyes) quedan a un toque, no en la pantalla ───── */
const POR_QUE = {
  horario: ['¿Por qué solo en ese horario?', 'La Ley 2300 de 2023 protege a quien debe. Los recordatorios de pago solo se pueden enviar de lunes a viernes, de 7 de la mañana a 7 de la noche, y los sábados de 8 de la mañana a 3 de la tarde. Nunca domingos ni festivos, y uno solo al día. Fiao lo cuida por usted.'],
  permiso: ['¿Por qué pedir permiso?', 'La Ley 1581 de 2012 pide la autorización de cada persona para usar sus datos, como su número de celular. Por eso Fiao le pide a cada vecino que responda SÍ antes de mandarle recibos. Mientras tanto, usted le muestra la cuenta en la tienda.'],
  borrar: ['¿Por qué no se borra?', 'La cuenta es de los dos. Si algo se corrige o se anula, queda el rastro: así el vecino ve qué cambió y nadie desconfía. Solo se puede deshacer justo después de anotar, si aún no lo ha enviado ni mostrado.'],
  celular: ['¿Dónde queda mi libreta?', 'Solo en este celular. Fiao no tiene servidor, no pide registro y nunca toca su plata. Por eso conviene guardar una copia de vez en cuando, por si cambia o se le daña el celular.'],
  cupo: ['¿Qué es el cupo?', 'Es hasta cuánto le fía a esa persona. Fiao solo le avisa cuando una compra lo pasa por mucho. Usted siempre decide.'],
  enlace: ['¿Qué ve el vecino?', 'Un enlace con su cuenta: lo que debe, lo que ha llevado y lo que ha pagado. El vecino no instala nada. La cuenta no se guarda en ningún servidor: viaja dentro del mismo enlace.']
};
function porQue(clave, texto = '¿Por qué?') { return `<button type="button" class="por-que" data-porque="${clave}">${ic('ayuda', 18, 2.2)}${texto}</button>`; }
function abrirPorQue(clave) {
  const [t, x] = POR_QUE[clave] || []; if (!t) return;
  abrirHoja(`${cabHoja(t)}<p style="font-size:1.125rem;line-height:1.6">${x}</p>${botonEscuchar(`${t} ${x}`)}<button type="button" class="btn" data-cerrar>Entendido</button>`, montarEscuchar);
}

/* ───── Ayuda: corta, por pantalla, con "Escuchar" ───── */
const GLOSARIO = [
  ['Fiado', 'lo que el vecino se lleva y paga después.'],
  ['Pago', 'lo que el vecino abona a su cuenta. Puede ser todo o una parte.'],
  ['Cuenta', 'lo que un vecino le debe ahora.'],
  ['Cupo', 'hasta cuánto le fía a cada uno.'],
  ['Recibo', 'el mensaje que le confirma al vecino lo anotado.'],
  ['Recordatorio', 'el mensaje para cobrar, solo en el horario que permite la ley.'],
  ['Historial', 'todo lo anotado y pagado, con fecha y hora.'],
  ['En la calle', 'lo que le deben entre todos.']
];
const AYUDA = {
  inicio: ['Libreta', ['Arriba ve cuánto le deben entre todos.', 'Primero salen los atrasados y los que pagan hoy.', 'Toque un nombre para ver su cuenta.', 'Con «Anotar fiado» anota en segundos.']],
  cliente: ['Cuenta del cliente', ['Arriba ve cuánto debe y su cupo.', '«Anotar» suma un fiado. «Pagó» registra un pago.', 'Toque una línea del historial para ver el detalle o corregirla.']],
  cobros: ['Cobros', ['Aquí salen quienes se atrasaron o pagan hoy.', '«Recordar» abre WhatsApp con el mensaje listo.', 'Solo se puede en el horario que permite la ley.']],
  resumen: ['Resumen', ['Vea cuánto le deben, cuánto recuperó y cuánto fió este mes.', 'Abajo ve a quién conviene revisar.']],
  ajustes: ['Ajustes', ['Cambie el tamaño de la letra y cómo suenan sus mensajes.', 'Guarde una copia de su libreta cada semana.']],
  mostrar: ['Mostrar la cuenta', ['Gire el celular hacia el vecino.', 'Si el vecino está de acuerdo, toque el botón de abajo.']],
  corregir: ['Corregir', ['Escriba el monto correcto y guarde.', 'El vecino verá qué cambió. Nada se borra.']]
};
function botonEscuchar(texto) { return 'speechSynthesis' in window ? `<button type="button" class="btn-sec" data-escuchar="${esc(texto)}">${ic('altavoz', 22, 2.2)}Escuchar</button>` : ''; }
function montarEscuchar(d) {
  d.querySelector('[data-escuchar]')?.addEventListener('click', ev => {
    const b = ev.currentTarget;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(b.dataset.escuchar); u.lang = 'es-CO'; u.rate = 0.95;
      const voz = speechSynthesis.getVoices().find(v => /^es(-|_)CO/i.test(v.lang)) || speechSynthesis.getVoices().find(v => /^es/i.test(v.lang));
      if (voz) u.voice = voz;
      speechSynthesis.speak(u);
      d.addEventListener('close', () => speechSynthesis.cancel(), { once: true });
    } catch (e) { /* sin voz en este celular */ }
  });
}
function abrirAyuda() {
  const ruta = location.hash.slice(1).split('-')[0] || 'inicio';
  const [t, lineas] = AYUDA[ruta] || AYUDA.inicio;
  abrirHoja(`${cabHoja(`Ayuda · ${t}`)}
    <ul style="margin:0;padding-left:1.25rem;display:flex;flex-direction:column;gap:.5rem;font-size:1.125rem;line-height:1.5">${lineas.map(l => `<li>${l}</li>`).join('')}</ul>
    ${botonEscuchar(lineas.join(' '))}
    <details class="mas"><summary>${ic('libreta', 22)}Palabras de Fiao</summary><div class="interior"><dl style="margin:0;display:flex;flex-direction:column;gap:.5rem;font-size:1.0625rem">${GLOSARIO.map(([p, d]) => `<div><dt style="display:inline;font-weight:600">${p}:</dt> <dd style="display:inline;margin:0">${d}</dd></div>`).join('')}</dl></div></details>
    <a class="btn-link" href="#guia">Ver cómo funciona Fiao</a>`, montarEscuchar, { nombre: 'ayuda' });
}

/* ───── Consejos de una línea, la primera vez que se abre cada pantalla ───── */
function consejo(clave, texto) {
  const t = tienda();
  if (!Datos.tienda || (t.vistos || {})[clave]) return '';
  return `<div class="consejo" data-consejo="${clave}">${ic('idea', 24, 2.2)}<p>${texto}</p><button type="button" data-accion="consejo-ok">Entendido</button></div>`;
}
async function marcarVisto(clave) { const t = tienda(); t.vistos = { ...(t.vistos || {}), [clave]: 1 }; await guardarTienda(t); }
