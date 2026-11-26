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
  menos: '<path d="M5 12h14"/>',
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
  compartir: '<path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M7 10H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1"/>',
  enlace: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  copiar: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  girar: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>',
  mostrar: '<rect x="8.5" y="8" width="8" height="14" rx="1.6"/><path d="M11.5 19h2"/><path d="M4 11.5A8.5 8.5 0 0 1 17.6 5"/><path d="M18.2 1.6v3.9h-3.9"/>', /* 3.7 · «Mostrar»: un celular que gira hacia el vecino (antes usaba las flechas de «girar», que se leían como «recargar») */
  cerrar: '<path d="M18 6L6 18M6 6l12 12"/>',
  borrar: '<path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="M17 9l-5 6M12 9l5 6"/>',
  basura: '<path d="M4 6h16"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 6l1 13.1a2 2 0 0 0 2 1.9h6a2 2 0 0 0 2-1.9L18 6"/><path d="M10 10.5v6M14 10.5v6"/>',
  tienda: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/>',
  ayuda: '<circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.3a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4"/><path d="M12 17.6h.01"/>',
  altavoz: '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  dinero: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.01M18 12h.01"/>',
  estrella: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  cobros: '<circle cx="12" cy="12" r="9"/><path d="M14.6 9.3c-.5-.8-1.5-1.3-2.6-1.3-1.5 0-2.6.8-2.6 1.9 0 2.6 5.2 1.5 5.2 4.2 0 1.1-1.1 1.9-2.6 1.9-1.2 0-2.2-.5-2.7-1.4M12 6.4V8M12 16v1.6"/>',
  mas3: '<circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
  idea: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>'
};
/* Centrado óptico: estos íconos no tienen su dibujo en el centro de la cuadrícula de 24 (medido con getBBox).
   Se corren lo justo para que queden centrados en sus círculos y alineados con el texto. */
const AJUSTE_ICONOS = { ok: [0, 0.5], chat: [-0.5, -0.55], grafica: [0, -0.5], lapiz: [0, 0.55], contactos: [0, -0.5], copiar: [-1, 0], borrar: [-0.5, 0], estrella: [0, 0.35] };
for (const [k, [dx, dy]] of Object.entries(AJUSTE_ICONOS)) if (ICONOS[k]) ICONOS[k] = `<g transform="translate(${dx} ${dy})">${ICONOS[k]}</g>`;
const GLIFO_WA = '<path fill-rule="evenodd" d="M346.99,124.99 C383.96,151.30 406.51,186.49 413.71,230.91 C426.21,308.06 380.30,382.68 305.64,406.68 C266.44,419.28 227.85,416.62 190.22,399.79 C187.89,398.74 184.75,398.40 182.27,398.97 C157.62,404.58 133.03,410.46 108.42,416.23 C100.87,418.00 97.59,414.86 99.16,407.18 C104.22,382.40 109.47,357.66 114.37,332.85 C114.95,329.87 114.58,326.15 113.29,323.42 C68.09,227.65 129.09,113.67 233.58,98.87 C274.60,93.06 312.28,101.76 346.99,124.99 M249.57,131.77 C246.09,132.11 242.60,132.33 239.14,132.82 C157.46,144.50 109.33,231.89 144.17,306.73 C149.84,318.91 151.79,329.79 147.84,342.17 C147.14,344.38 146.75,346.69 146.29,348.97 C144.73,356.74 143.20,364.51 141.54,372.90 C156.10,369.46 169.86,366.39 183.51,362.89 C188.47,361.62 192.60,362.03 197.20,364.50 C221.05,377.29 246.48,382.35 273.42,378.81 C341.02,369.95 388.65,308.10 380.20,240.27 C372.12,175.52 315.78,128.33 249.57,131.77 z"/><path fill-rule="evenodd" d="M190.89,187.89 C193.23,185.73 195.22,183.69 197.44,181.95 C203.51,177.18 211.48,178.57 214.79,185.43 C219.63,195.45 224.32,205.59 228.17,216.01 C229.28,219.02 227.88,223.40 226.55,226.72 C225.35,229.70 222.62,232.04 220.65,234.72 C216.91,239.82 216.47,244.34 220.28,249.42 C233.92,267.63 250.60,282.52 270.46,293.67 C275.91,296.72 280.62,295.83 284.96,291.21 C298.23,277.10 298.32,280.32 313.25,284.18 C320.17,285.97 327.06,287.90 333.85,290.10 C341.35,292.54 344.70,300.45 340.57,306.98 C327.27,328.03 315.21,335.33 290.90,332.20 C281.81,331.04 272.43,328.60 264.23,324.60 C230.62,308.22 203.82,284.00 185.77,251.06 C181.41,243.11 179.23,233.67 177.49,224.63 C174.72,210.21 180.54,198.25 190.89,187.89 z"/>';
function ic(nombre, tam = 24, grosor = 2) {
  /* 2.3.2 · El globo de WhatsApp (del ícono oficial que entregó el equipo) en los botones que abren WhatsApp. Toma el color del botón. */
  if (nombre === 'whatsapp') return `<svg width="${tam}" height="${tam}" viewBox="90 88 336 336" fill="currentColor" aria-hidden="true" focusable="false">${GLIFO_WA}</svg>`;
  return `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${grosor}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONOS[nombre] || ''}</svg>`;
}
/** El ícono de Fiao: el toldo rayado de la tienda de barrio forma el brazo de la F,
    con su franja naranja; el asta y el brazo medio de la F van con todo su peso. */
const LOGO = (t = 56, etiqueta = 'Fiao', clase = '', invertido = false) => {
  const tinta = enTinta(), azul = tinta ? '#1D3BA8' : '#3346E0', franja = tinta ? '#111111' : '#FF8A3D';
  const fondo = invertido ? '#FFFFFF' : azul, trazo = invertido ? azul : '#FFFFFF';
  return `<svg${clase ? ` class="${clase}"` : ''} width="${t}" height="${t}" viewBox="0 0 56 56" ${etiqueta ? `role="img" aria-label="${etiqueta}"` : 'aria-hidden="true"'}><rect width="56" height="56" rx="13" fill="${fondo}"/><path d="M13 14Q13 11 16 11H23V19A5 5 0 0 1 13 19Z" fill="${trazo}"/><path d="M23 11H33V19A5 5 0 0 1 23 19Z" fill="${franja}"/><path d="M33 11H40Q43 11 43 14V19A5 5 0 0 1 33 19Z" fill="${trazo}"/><path d="M13 19H23V28H33A5 5 0 0 1 33 38H23V42A5 5 0 0 1 13 42Z" fill="${trazo}"/></svg>`;
};

/** ¿Movimiento reducido? Manda lo elegido en Ajustes; si no, lo que pide el celular. */
/** iPhone o iPad abriendo Fiao en Safari, sin instalar: ahí Safari puede borrar los datos tras días sin uso. */
/** ¿iPhone o iPad? (los iPad nuevos se presentan como Mac con pantalla táctil) */
function esIOS() { return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
function iosSinInstalar() {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return ios && !navigator.standalone && !matchMedia('(display-mode: standalone)').matches;
}
const reducido = () => {
  const m = document.documentElement.dataset.movimiento;
  return m ? m === 'reducido' : matchMedia('(prefers-reduced-motion: reduce)').matches;
};
const enTinta = () => document.documentElement.dataset.tema === 'tinta';
function vibrar(patron = 12) { try { if (!reducido() && navigator.vibrate) navigator.vibrate(patron); } catch (e) { /* nada */ } }

/* ───── Montos visibles u ocultos (cuando hay gente en el mostrador) ───── */
const Vista = { oculto: false };
function monto(n) { return Vista.oculto ? '$ •••••' : pesos(n); }

/* ───── Encabezado ───── */
function btnAyuda(clase = 'btn-ayuda') { return `<button type="button" class="${clase}" data-accion="ayuda" aria-label="Ayuda">${ic('ayuda', 24, 2.2)}</button>`; }
/** Barra blanca de las pantallas secundarias (formularios, corregir, recuperar…). */
function barra({ titulo, volver = null, sub = '', derecha = '', ayuda = true, extra = '' }) {
  const v = volver ? `<a class="btn-icono" href="#${volver}" data-volver aria-label="Volver">${ic('volver', 28, 2.4)}</a>` : '';
  return `<header class="barra${volver ? '' : ' sin-volver'}">${v}<div class="titulos"><h1 tabindex="-1">${titulo}</h1>${sub ? `<span class="sub">${sub}</span>` : ''}${extra}</div>${derecha}${ayuda ? btnAyuda() : ''}</header>`;
}
/** Cabecera de marca: franjas del toldo en cobalto, su borde ondulado y, si hace falta,
    la cifra principal de la pantalla en blanco (cuerpo). */
function cabMarca({ titulo, volver = null, sub = '', botones = '', ayuda = true, extra = '', cuerpo = '', tituloAbajo = false }) {
  const v = volver ? `<a class="btn-redondo" href="#${volver}" data-volver aria-label="Volver">${ic('volver', 26, 2.4)}</a>` : '';
  return `<header class="cab-marca${tituloAbajo ? ' titulo-abajo' : ''}"><div class="fila-cab">${v}<div class="titulos"><h1 tabindex="-1">${titulo}</h1>${sub ? `<span class="sub">${sub}</span>` : ''}${extra}</div><div class="botones">${botones}${ayuda ? btnAyuda('btn-redondo') : ''}</div></div>${cuerpo}</header><div class="toldo" aria-hidden="true"></div>`;
}
function btnRedondo(icono, etiqueta, { href = null, accion = '', presionado = null, clase = '' } = {}) {
  if (href) return `<a class="btn-redondo${clase ? ' ' + clase : ''}" href="#${href}" aria-label="${etiqueta}">${ic(icono, 24, 2.2)}</a>`;
  return `<button type="button" class="btn-redondo${clase ? ' ' + clase : ''}" data-accion="${accion}" aria-label="${etiqueta}"${presionado !== null ? ` aria-pressed="${presionado}"` : ''}>${ic(icono, 24, 2.2)}</button>`;
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

/* ───── Barra de abajo (2.0.0) ─────
   Cinco lugares fijos, siempre con nombre. «Fiar» va en el centro: abre la hoja de fiar desde cualquier sección. */
function nav(activa) {
  const g = cuentaCobrosPendientes();
  const it = (clave, icono, rotulo, globo = 0) => `<a href="#${clave === 'libreta' ? 'inicio' : clave}"${clave === activa ? ' aria-current="page"' : ''}><span class="ico">${ic(icono, 24, clave === activa ? 2.4 : 2)}${globo ? `<span class="globo" aria-hidden="true">${globo}</span>` : ''}</span><span class="rot">${rotulo}</span>${globo ? `<span class="vh">, ${globo} ${globo === 1 ? 'pendiente' : 'pendientes'}</span>` : ''}</a>`;
  const fiar = `<button type="button" class="fiar" data-accion="anotar" data-guia="anotar"><span class="ico">${ic('mas', 30, 2.8)}</span><span class="rot">Fiar</span></button>`;
  return `<nav class="nav" aria-label="Secciones">${it('libreta', 'libreta', 'Libreta')}${it('cobros', 'cobros', 'Cobros', g)}${fiar}${it('resumen', 'grafica', 'Resumen')}${it('ajustes', 'ajustes', 'Ajustes')}</nav>`;
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
  if (e.tipo === 'futuro') return `<span class="estado">${ic('calendario', 16, 2.2)}${t}</span>`;
  return `<span class="estado">${t}</span>`;
}
/** Cada cliente con un color fijo, calculado de su nombre, para reconocerlo de un vistazo.
    2.0.0 · Tonos de la paleta (fondo, letra), con contraste de 5,6:1 o más. Nunca verde, rojo ni naranja:
    esos colores ya dicen «pagó», «atrasado» y «fiar». */
const TONOS_AVATAR = [['#E9ECFF', '#2B3BC4'], ['#F3EADB', '#6B5530'], ['#E3F1F8', '#1F5A73'], ['#EFE8FA', '#5B3E96'], ['#EEEBE4', '#4A5060'], ['#F6EBD3', '#6E5210']];
function tonoDe(nombre = '') { let h = 0; for (const ch of normalizar(nombre)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return TONOS_AVATAR[h % TONOS_AVATAR.length]; }
function avatarHtml(c) { const [f, t] = tonoDe(c.nombre); return `<span class="avatar" style="--av-f:${f};--av-t:${t}" aria-hidden="true">${esc(iniciales(c.nombre))}</span>`; }
/** 2.0.0 · El nombre y su apodo: «Rosiris, la de la esquina» → «Rosiris» y, en gris, «, la de la esquina».
    Si no hay apodo en el nombre, va lo que se escribió para reconocerlo («· vende sopa»). El apodo se corta antes que el nombre. */
function nombreHtml(c) {
  const n = String(c.nombre || ''), i = n.indexOf(',');
  if (i > 0 && i < n.length - 1) return `<span class="n1">${esc(n.slice(0, i))}</span><span class="apodo">${esc(n.slice(i))}</span>`;
  if (c.detalle) return `<span class="n1">${esc(n)}</span><span class="apodo">&nbsp;· ${esc(c.detalle)}</span>`;
  return esc(n);
}
/** Fila de cliente para listas. */
function filaCliente(c, e, href) {
  const m = e.saldo > 0 ? `<span class="monto">${monto(e.saldo)}</span>` : '';
  return `<li><a class="fila" href="#${href}">${avatarHtml(c)}<span class="medio"><span class="nombre">${nombreHtml(c)}</span>${estadoHtml(c, e)}</span>${m}</a></li>`;
}

/* ───── Avisos abajo, con acciones y "Deshacer" ─────
   Se quedan 3 s (8 s si traen botones). Se pausan si el dedo o el foco están encima. */
let _avisoT = 0;
function anunciar(texto) { const a = document.getElementById('anuncio'); if (a) { a.textContent = ''; setTimeout(() => { a.textContent = texto; }, 30); } }
function ocultarAviso() { const a = document.getElementById('aviso'); if (!a) return; clearTimeout(_avisoT); a.classList.remove('ver'); a.inert = true; }
function avisar(texto, { acciones = [], ms = null, icono = 'ok', voz = null } = {}) {
  const a = document.getElementById('aviso'); if (!a) return;
  /* Justo después de una falla al guardar, no se dice «quedó anotado»: manda la banda de la falla. */
  if (typeof Datos !== 'undefined' && Datos.falloGuardado && Date.now() - Datos.falloGuardado < 4000 && icono === 'ok') return;
  anunciar(texto + (acciones.length ? `. Opciones: ${acciones.map(x => x.texto).join(', ')}.` : ''));
  if (typeof Voz !== 'undefined' && voz !== false) Voz.decir(voz || Voz.claveDe(texto));
  a.innerHTML = `<div class="linea"><span class="texto">${icono ? ic(icono, 22, 2.6) : ''}<span>${esc(texto)}</span></span><button type="button" class="cerrar" data-i="x" aria-label="Cerrar aviso">${ic('cerrar', 20, 2.4)}</button></div>
    ${acciones.length ? `<div class="acciones">${acciones.map((x, i) => `<button type="button" data-i="${i}"${x.fuerte ? ' class="fuerte"' : ''}>${esc(x.texto)}</button>`).join('')}</div>` : ''}`;
  /* Nunca encima del menú ni de los botones de abajo de la pantalla. */
  const abajo = document.querySelector('#app .abajo'), pie = document.querySelector('#app .pie');
  const rp = pie && pie.getBoundingClientRect();
  a.style.bottom = abajo ? `calc(${Math.round(abajo.getBoundingClientRect().height) + 12}px)`
    : rp && rp.height && rp.top < innerHeight ? `${Math.round(innerHeight - rp.top) + 8}px` : 'calc(1rem + env(safe-area-inset-bottom, 0px))';
  const dura = ms ?? (acciones.length ? 8000 : 3200);
  /* 11 · Con «Deshacer», una barra corre hacia atrás: se ve cuánto tiempo queda. */
  const barra = acciones.length && !reducido() ? document.createElement('span') : null;
  if (barra) { barra.className = 'cuenta'; barra.setAttribute('aria-hidden', 'true'); a.appendChild(barra); }
  const correr = () => { if (!barra) return; barra.style.animation = 'none'; void barra.offsetWidth; barra.style.animation = `cuenta ${dura}ms linear forwards`; };
  a.inert = false; a.classList.add('ver');
  a.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => { ocultarAviso(); const x = acciones[+b.dataset.i]; if (x) x.fn(); }));
  const programar = () => { clearTimeout(_avisoT); _avisoT = setTimeout(ocultarAviso, dura); correr(); };
  a.onpointerenter = a.onfocusin = () => { clearTimeout(_avisoT); if (barra) barra.style.animation = 'none'; };
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
  enfocarTituloHoja(d);
  if (typeof Mov !== 'undefined') Mov.arrastrable(d);
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
  d.classList.remove('con-toldo'); // 2.0.0 · cada paso decide si lleva el toldo arriba (la hoja de fiar)
  cuerpo.innerHTML = html;
  const t = cuerpo.querySelector('h2'); if (t) { t.id = t.id || 'hoja-titulo'; d.setAttribute('aria-labelledby', t.id); }
  cuerpo.querySelectorAll('[data-cerrar]').forEach(b => b.addEventListener('click', ev => { ev.preventDefault(); cerrarHoja(); }));
  if (!reducido()) cuerpo.classList.remove('entra'), void cuerpo.offsetWidth, cuerpo.classList.add('entra');
  alMontar(d);
  /* Si la hoja ya estaba abierta y el foco quedó en la hoja misma (pasos que se pintan después de abrir), va al título. */
  if (d.open && (document.activeElement === d || !d.contains(document.activeElement))) enfocarTituloHoja(d);
  return d;
}
/* 1.6.0 · Al abrir, el foco va al título (sin anillo): antes caía en la hoja o en la X y se veía un borde negro. */
function enfocarTituloHoja(d) {
  const tit = d.querySelector('.cuerpo h2');
  if (tit) { if (!tit.hasAttribute('tabindex')) tit.setAttribute('tabindex', '-1'); tit.focus({ preventScroll: true }); }
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

/** Abre WhatsApp con el mensaje escrito. El tendero toca Enviar allá.
    1.3.0 · En iPhone se abre por la dirección propia de WhatsApp: wa.me abría un navegador encima de Fiao
    que quedaba en blanco al volver. En Android y en el computador sigue igual. */
function abrirWhatsApp(cel, texto, { recordar = true } = {}) {
  if (recordar) recordarSalida();
  if (esIOS()) return abrirWhatsAppIOS(enlaceWhatsAppApp(cel, texto), enlaceWhatsApp(cel, texto), texto);
  const url = enlaceWhatsApp(cel, texto);
  const w = window.open(url, '_blank', 'noopener');
  if (!w) location.href = url;
}
function irFuera(url) { location.href = url; }
/** Si a los 2,5 s Fiao sigue a la vista (WhatsApp no abrió), se ofrece la página de WhatsApp o copiar el mensaje. */
function abrirWhatsAppIOS(app, web, texto) {
  let salio = false;
  const marcar = () => { salio = true; }, oculta = () => { if (document.hidden) salio = true; };
  addEventListener('blur', marcar); addEventListener('pagehide', marcar); document.addEventListener('visibilitychange', oculta);
  irFuera(app);
  setTimeout(() => {
    removeEventListener('blur', marcar); removeEventListener('pagehide', marcar); document.removeEventListener('visibilitychange', oculta);
    if (!salio && !document.hidden) planBWhatsApp(web, texto);
  }, 2500);
}
function planBWhatsApp(web, texto) {
  abrirHoja(`${cabHoja('¿No se abrió WhatsApp?')}<p style="font-size:1.125rem;line-height:1.55">Si este celular no tiene WhatsApp, ábralo en la página de WhatsApp${texto ? ' o copie el mensaje' : ''}.</p>
    <a class="btn" href="${esc(web)}" target="_blank" rel="noopener" data-accion="pagina-wa">${ic('whatsapp', 22)}Abrir la página de WhatsApp</a>
    ${texto ? `<button type="button" class="btn-sec" data-accion="copiar-msj">${ic('copiar', 22, 2.2)}Copiar el mensaje</button><p class="burbuja" id="msj-wa" hidden>${esc(texto)}</p>` : ''}
    <button type="button" class="btn-link" data-cerrar>Cerrar</button>`, d => {
    d.querySelector('[data-accion="pagina-wa"]').addEventListener('click', () => cerrarHoja());
    d.querySelector('[data-accion="copiar-msj"]')?.addEventListener('click', async ev => {
      try { await navigator.clipboard.writeText(texto); cerrarHoja(); avisar('Mensaje copiado.'); }
      catch (e) { const p = d.querySelector('#msj-wa'); p.hidden = false; ev.currentTarget.hidden = true; const r = document.createRange(); r.selectNodeContents(p); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    });
  }, { nombre: 'plan-b-wa' });
  if (typeof Voz !== 'undefined') Voz.decir('wa-no-abrio');
  /* Si WhatsApp sí abrió (tarde, después de la pregunta del iPhone), al volver esta hoja ya no hace falta. */
  const vigilar = () => {
    if (!document.hidden) return;
    document.removeEventListener('visibilitychange', vigilar);
    const alVolver = () => { if (document.hidden) return; document.removeEventListener('visibilitychange', alVolver); if (hojaAbierta()?.dataset.nombre === 'plan-b-wa') cerrarHoja(); };
    document.addEventListener('visibilitychange', alVolver);
  };
  document.addEventListener('visibilitychange', vigilar);
}
/* 1.3.0 · Si el celular cierra Fiao mientras usted está en WhatsApp, al volver Fiao abre la misma cuenta (hasta 10 minutos). */
function recordarSalida() { try { localStorage.setItem('fiao-salida', JSON.stringify({ ruta: location.hash.slice(1), t: Date.now() })); } catch (e) { /* sin almacenamiento */ } }
document.addEventListener('visibilitychange', () => { if (!document.hidden) { try { localStorage.removeItem('fiao-salida'); } catch (e) { /* nada */ } } });
/** Campo de pesos que se formatea solo mientras se escribe. */
function activarCampoPesos(input, alCambiar = () => {}) {
  input._ultimo = leerPesos(input.value);
  input.addEventListener('input', () => {
    let v = leerPesos(input.value);
    /* 1.3.0 · Tope por anotación ($9.999.999): una cifra de más no entra, como en el teclado. */
    if (v > TOPE_MONTO && v !== input._ultimo) { v = input._ultimo; vibrar(15); }
    input._ultimo = v;
    input.value = v ? pesos(v) : '';
    alCambiar(v);
  });
}

/* ───── 1.3.0 · Cerca del límite de letras, el campo dice cuántas quedan ───── */
document.addEventListener('input', ev => {
  const i = ev.target;
  if (!(i instanceof HTMLInputElement || i instanceof HTMLTextAreaElement) || i.type === 'tel' || !(i.maxLength > 0)) return;
  const quedan = i.maxLength - i.value.length;
  let s = i._quedan;
  if (quedan > 5) { if (s) s.hidden = true; return; }
  if (!s) {
    s = document.createElement('span'); s.className = 'quedan'; s.setAttribute('aria-live', 'polite');
    (i.parentElement.classList.contains('con-prefijo') ? i.parentElement : i).insertAdjacentElement('afterend', s); i._quedan = s;
  }
  s.hidden = false;
  s.textContent = quedan <= 0 ? `Llegó al límite de ${i.maxLength} letras.` : quedan === 1 ? 'Queda 1 letra.' : `Quedan ${quedan} letras.`;
}, true);

/* ───── 1.3.0 · Las cifras grandes se achican solas, y solo cuando no caben (montos altos o letra Más grande) ───── */
const CIFRAS_GRANDES = '.cifra, .cifra-xl, .cifra-l, .monto-grande, .filtro .v, .det-cifra, .cuadre-monto, .kpi b';
function encajarCifra(el) {
  if (el.dataset.encaja) { el.style.fontSize = el.dataset.fs0 || ''; el.style.lineHeight = el.dataset.lh0 || ''; delete el.dataset.encaja; }
  const p = el.parentElement; if (!p || !el.offsetWidth) return;
  const cp = getComputedStyle(p), libre = p.clientWidth - parseFloat(cp.paddingLeft) - parseFloat(cp.paddingRight);
  const necesita = Math.max(el.scrollWidth, el.offsetWidth);
  if (libre <= 0 || necesita <= libre + 1) return;
  const ce = getComputedStyle(el), k = libre / necesita, lh = parseFloat(ce.lineHeight);
  el.dataset.fs0 = el.style.fontSize; el.dataset.lh0 = el.style.lineHeight; el.dataset.encaja = '1';
  el.style.fontSize = `${Math.floor(parseFloat(ce.fontSize) * k * 10) / 10}px`;
  if (lh) el.style.lineHeight = `${Math.round(lh * Math.max(k, 0.8))}px`;
}
function encajarCifras() { document.querySelectorAll(CIFRAS_GRANDES).forEach(encajarCifra); }
(function vigilarCifras() {
  const empezar = () => {
    new MutationObserver(encajarCifras).observe(document.body, { childList: true, subtree: true, characterData: true });
    new MutationObserver(encajarCifras).observe(document.documentElement, { attributes: true, attributeFilter: ['data-letra'] });
    addEventListener('resize', encajarCifras);
    if (document.fonts) document.fonts.ready.then(encajarCifras);
    encajarCifras();
  };
  if (document.body) empezar(); else document.addEventListener('DOMContentLoaded', empezar);
})();

/* ───── Movimiento y celebración (todo se apaga con "reducir movimiento") ───── */
function temblar(el) {
  if (!el) return; vibrar([20, 40, 20]);
  /* La voz dice el error que acaba de aparecer junto al campo. */
  const err = typeof Voz !== 'undefined' && (el.closest('form, .cuerpo, main') || document).querySelector('.error:not([hidden])');
  if (err) Voz.decirTexto(err.textContent);
  if (reducido()) return; el.classList.remove('tiembla'); void el.offsetWidth; el.classList.add('tiembla');
}
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
  const colores = enTinta() ? ['#1D3BA8', '#111111', '#8FA4E8'] : ['#3346E0', '#FF8A3D', '#127A45', '#FFC233', '#8C9BFF'];
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
  abrirHoja(`${cabHoja(t)}<p style="font-size:1.125rem;line-height:1.6">${x}</p>${botonEscuchar(`${t} ${x}`, `porque-${clave}`)}<button type="button" class="btn" data-cerrar>Entendido</button>`, montarEscuchar);
}

/* ───── Ayuda: corta, por pantalla, con "Escuchar" ───── */
/* 2.3.4 · Las palabras de Fiao, al día con lo que hace la app: primero la plata, después lo que se hace con el vecino y al final las pantallas y ajustes. */
const GLOSARIO = [
  ['Fiado', 'lo que el vecino se lleva y paga después.'],
  ['Pago', 'lo que el vecino abona a su cuenta. Puede ser todo o una parte.'],
  ['Saldo inicial', 'lo que un vecino ya le debía antes de usar Fiao.'],
  ['Cuenta', 'lo que un vecino le debe ahora.'],
  ['En la calle', 'lo que le deben entre todos, hoy.'],
  ['Cupo', 'hasta cuánto le fía a cada uno.'],
  ['Atrasado', 'pasó el día acordado y todavía debe.'],
  ['Recibo', 'el mensaje que le confirma al vecino un fiado. Va por WhatsApp, como imagen o mostrándole el celular.'],
  ['Comprobante', 'el mensaje que le confirma al vecino un pago.'],
  ['Permiso', 'el «sí» del vecino para recibir mensajes por WhatsApp. Sin él, Fiao no le escribe.'],
  ['Recordatorio', 'el mensaje para cobrar, solo en el horario que permite la ley y una vez al día.'],
  ['Mostrar', 'girar el celular hacia el vecino para que vea su cuenta en el mostrador.'],
  ['Enlace de su cuenta', 'la página donde el vecino ve su cuenta sin instalar nada.'],
  ['Corregir', 'cambiar un monto mal anotado. El vecino ve qué cambió: nada se borra.'],
  ['Anular', 'dejar sin efecto un fiado o un pago. Queda a la vista, tachado.'],
  ['Historial', 'todo lo anotado y pagado, con fecha y hora.'],
  ['Atiende', 'quién está en el mostrador. Queda anotado en cada fiado y cada pago.'],
  ['Cuadre de hoy', 'cuánto fió y cuánto cobró hoy, comparado con ayer.'],
  ['Resumen', 'cuánto fió y cuánto recuperó por día, mes, año o en las fechas que elija.'],
  ['Recuperó', 'lo que le pagaron en ese periodo, sea de fiados nuevos o viejos.'],
  ['Ocultar montos', 'tapa las cifras cuando hay gente en el mostrador.'],
  ['Copia de respaldo', 'un archivo con toda su libreta, para recuperarla si cambia o pierde el celular.'],
  ['Exportar a Excel', 'una tabla con todos los fiados y pagos, para abrir en Excel o Google Sheets.']
];
const AYUDA = {
  inicio: ['Libreta', ['Arriba ve cuánto le deben entre todos.', 'Toque Atrasados, Pagan hoy o Al día para ver solo a esos clientes.', 'Toque un nombre para ver su cuenta. Con la lupa lo busca por nombre o por celular.', 'Para borrar un cliente, deslícelo a la izquierda.', 'Con «Fiar», abajo en el centro, anota en segundos.']],
  cliente: ['Cuenta del cliente', ['Arriba ve cuánto debe y su cupo.', '«Fiar» suma un fiado. «Pagó» registra un pago.', 'Toque un movimiento para ver el detalle o corregirlo.', 'En los tres puntos de arriba puede enviarle su cuenta, escribirle o borrarlo. Antes de borrar, Fiao le pregunta.']],
  cobros: ['Cobros', ['Aquí salen quienes se atrasaron o pagan hoy.', '«Recordar» abre WhatsApp con el mensaje listo.', 'Solo se puede en el horario que permite la ley.']],
  resumen: ['Resumen', ['Vea cuánto le deben, cuánto recuperó y cuánto fió este mes.', 'Abajo ve a quién conviene revisar.']],
  ajustes: ['Ajustes', ['Cambie el tamaño de la letra, la apariencia y el movimiento, y cómo suenan sus mensajes.', 'Guarde una copia de su libreta cada semana.']],
  mostrar: ['Mostrar la cuenta', ['Gire el celular hacia el vecino.', 'Si el vecino está de acuerdo, toque el botón de abajo.']],
  corregir: ['Corregir', ['Escriba el monto correcto y guarde.', 'El vecino verá qué cambió. Nada se borra.']]
};
function botonEscuchar(texto, clave = '') { return 'speechSynthesis' in window || (typeof Voz !== 'undefined' && clave) ? `<button type="button" class="btn-sec" data-escuchar="${esc(texto)}" data-voz="${esc(clave)}">${ic('altavoz', 22, 2.2)}Escuchar</button>` : ''; }
/** «Escuchar»: la frase grabada con la voz de Fiao; si no hay grabación, la voz del celular. */
function montarEscuchar(d) {
  /* 1.3.0 · El audio de esta hoja se prepara al abrirla, para que «Escuchar» suene apenas se toca. */
  if (typeof Voz !== 'undefined') Voz.alistar(d.querySelector('[data-escuchar]')?.dataset.voz);
  d.querySelector('[data-escuchar]')?.addEventListener('click', async ev => {
    const b = ev.currentTarget;
    d.addEventListener('close', () => { if (typeof Voz !== 'undefined') Voz.callar(); }, { once: true });
    if (typeof Voz !== 'undefined' && b.dataset.voz && await Voz.decir(b.dataset.voz, { forzar: true })) return;
    if (!('speechSynthesis' in window)) return;
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
  const r0 = location.hash.slice(1).split('-')[0] || 'inicio', ruta = AYUDA[r0] ? r0 : 'inicio';
  const [t, lineas] = AYUDA[ruta];
  abrirHoja(`${cabHoja(`Ayuda · ${t}`)}
    <ul style="margin:0;padding-left:1.25rem;display:flex;flex-direction:column;gap:.5rem;font-size:1.125rem;line-height:1.5">${lineas.map(l => `<li>${l}</li>`).join('')}</ul>
    ${botonEscuchar(lineas.join(' '), `ayuda-${ruta}`)}
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
