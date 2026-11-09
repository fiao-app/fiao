/* Fiao · piezas de interfaz reutilizables (íconos, barra, navegación, opciones, avisos). */
'use strict';

const ICONOS = {
  volver: '<path d="M15 18l-6-6 6-6"/>',
  sigue: '<path d="M9 18l6-6-6-6"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  ajustes: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>',
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
  tienda: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/>'
};
function ic(nombre, tam = 24, grosor = 2) {
  return `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${grosor}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONOS[nombre] || ''}</svg>`;
}
const LOGO = (t = 56) => `<svg width="${t}" height="${t}" viewBox="0 0 56 56" role="img" aria-label="Fiao"><rect width="56" height="56" rx="14" fill="#2346A0"/><path d="M14 20 H42 M14 28 H42 M14 36 H32" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/><circle cx="40" cy="37" r="5" fill="#F28C5B"/></svg>`;

/* ───── Montos visibles u ocultos (cuando hay gente en el mostrador) ───── */
const Vista = { oculto: false };
function monto(n) { return Vista.oculto ? '$ •••••' : pesos(n); }

/* ───── Barra superior ───── */
function barra({ titulo, volver = null, sub = '', derecha = '' }) {
  const v = volver ? `<a class="btn-icono" href="#${volver}" aria-label="Volver">${ic('volver', 26, 2.2)}</a>` : '';
  return `<header class="barra${sub ? ' con-sub' : ''}${volver ? '' : ' sin-volver'}">${v}<div class="titulos"><h1 tabindex="-1">${titulo}</h1>${sub ? `<span class="sub">${sub}</span>` : ''}</div>${derecha}</header>`;
}
function btnIcono(icono, etiqueta, { href = null, accion = '', presionado = null } = {}) {
  if (href) return `<a class="btn-icono" href="#${href}" aria-label="${etiqueta}">${ic(icono, 26)}</a>`;
  return `<button type="button" class="btn-icono" data-accion="${accion}" aria-label="${etiqueta}"${presionado !== null ? ` aria-pressed="${presionado}"` : ''}>${ic(icono, 26)}</button>`;
}
/** Subtítulo con quién atiende; se toca para cambiar. */
function subAtiende() {
  const t = tienda();
  const quien = t.atiendeAhora ? `atiende <button type="button" data-accion="atiende" aria-label="Atiende ${esc(t.atiendeAhora)}. Cambiar quién atiende">${esc(t.atiendeAhora)}</button>` : '';
  return `${mayuscula(fechaCorta(new Date()))}${quien ? ' · ' + quien : ''}`;
}

/* ───── Navegación inferior ───── */
function nav(activa) {
  const g = cuentaCobrosPendientes();
  const it = (clave, ruta, icono, rotulo, globo = 0) => `<a href="#${ruta}"${clave === activa ? ' aria-current="page"' : ''}><span class="ico">${ic(icono, 24)}${globo ? `<span class="globo" aria-hidden="true">${globo}</span>` : ''}</span>${rotulo}${globo ? `<span class="vh">, ${globo} ${globo === 1 ? 'pendiente' : 'pendientes'}</span>` : ''}</a>`;
  return `<nav class="nav" aria-label="Secciones">${it('libreta', 'inicio', 'libreta', 'Libreta')}${it('cobros', 'cobros', 'campana', 'Cobros', g)}${it('resumen', 'resumen', 'grafica', 'Resumen')}</nav>`;
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
function filaCliente(c, e, href, { mostrarMonto = true } = {}) {
  const m = e.saldo > 0 && mostrarMonto ? `<span class="monto">${monto(e.saldo)}</span>` : '';
  return `<li><a class="fila" href="#${href}"><span class="avatar" aria-hidden="true">${esc(iniciales(c.nombre))}</span><span class="medio"><span class="nombre">${esc(c.nombre)}</span>${estadoHtml(c, e)}</span>${m}</a></li>`;
}

/* ───── Avisos ───── */
let _toastTimer = 0;
function avisar(texto) {
  const t = document.getElementById('aviso'); if (!t) return;
  t.textContent = texto; t.classList.add('ver');
  clearTimeout(_toastTimer); _toastTimer = setTimeout(() => t.classList.remove('ver'), 3200);
}

/* ───── Hoja inferior (diálogo nativo, con foco atrapado) ───── */
function abrirHoja(html, alMontar = () => {}) {
  const d = document.getElementById('hoja');
  d.innerHTML = `<div class="asa" aria-hidden="true"></div><div class="cuerpo">${html}</div>`;
  const t = d.querySelector('h2'); if (t) { t.id = t.id || 'hoja-titulo'; d.setAttribute('aria-labelledby', t.id); }
  if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  d.addEventListener('click', ev => { if (ev.target === d) cerrarHoja(); }, { once: true });
  d.querySelectorAll('[data-cerrar]').forEach(b => b.addEventListener('click', cerrarHoja));
  alMontar(d);
  return d;
}
function cerrarHoja() { const d = document.getElementById('hoja'); if (d.open) d.close ? d.close() : d.removeAttribute('open'); }
/** Confirmación dentro de la app (el navegador puede bloquear confirm()). */
function confirmar({ titulo, texto, si, no = 'Cancelar', peligro = false }) {
  return new Promise(ok => {
    abrirHoja(`<h2>${titulo}</h2><p style="font-size:1.0625rem;line-height:1.5">${texto}</p><button type="button" class="${peligro ? 'btn-sec peligro' : 'btn'}" data-si>${si}</button><button type="button" class="btn-link" data-cerrar>${no}</button>`, d => {
      d.querySelector('[data-si]').addEventListener('click', () => { cerrarHoja(); ok(true); });
      d.addEventListener('close', () => ok(false), { once: true });
    });
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
