/* Fiao · ilustraciones del primer acceso.
   Un mismo sistema para todas, en un lienzo de 240 × 160:
   · un escenario circular (r = 58) centrado en (120, 80);
   · un objeto principal centrado en x = 120, con trazos de 2,5 y renglones de 5;
   · dos insignias simétricas (r = 18) en x = 40 y x = 200, a la altura del centro,
     con los mismos íconos de la app a 20 px;
   · textos con ancho fijo (textLength): nunca se salen de su caja, sea cual sea la fuente;
   · conectores, si los hay, son el mismo trazo reflejado: miden igual a los dos lados;
   · 3.0: el escenario tiene un degradado suave, el objeto proyecta una sombra de contacto
     y los momentos de logro llevan un destello color moneda. */
'use strict';

const PAL_COLOR = {
  tinta: '#141B34', azul: '#3346E0', azulSuave: '#E2E6FF', escenario: '#E9ECFF', escenarioLuz: '#F6F7FF', renglon: '#CBD2FA', borde: '#E4E0D8',
  moneda: '#FF8A3D', monedaTexto: '#9A4A12', monedaFondo: '#FFF0E5', alerta: '#B42318', alertaFondo: '#FDE7E4',
  verde: '#127A45', verdeFondo: '#E5F4EC', gris: '#5A6072', celda: '#EEEBE4', papel: '#FFFFFF', pantalla: '#FFFFFF', camara: '#3A4766'
};
/* Tinta: solo azul de bolígrafo, negro y blanco. Lo que era naranja pasa a negro; lo verde, a azul. */
const PAL_TINTA = {
  tinta: '#111111', azul: '#1D3BA8', azulSuave: '#DCE4F7', escenario: '#E8EDFA', escenarioLuz: '#FFFFFF', renglon: '#B9C7EE', borde: '#111111',
  moneda: '#111111', monedaTexto: '#111111', monedaFondo: '#DCE4F7', alerta: '#111111', alertaFondo: '#DCE4F7',
  verde: '#1D3BA8', verdeFondo: '#DCE4F7', gris: '#3A3A3A', celda: '#DCE4F7', papel: '#FFFFFF', pantalla: '#FFFFFF', camara: '#3A3A3A'
};
/** La paleta del tema que está activo (se consulta cada vez que se dibuja). */
const PAL = new Proxy({}, { get: (_, k) => (document.documentElement.dataset.tema === 'tinta' ? PAL_TINTA : PAL_COLOR)[k] });
/** Cifras en Plus Jakarta Sans; rótulos en Figtree. Anchos medidos con esas letras. */
function txtIlus(x, y, texto, { tam = 12, peso = 800, color = PAL.tinta, ancho }) {
  const fam = peso >= 700 ? 'Plus Jakarta Sans, Figtree, sans-serif' : 'Figtree, sans-serif';
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${fam}" font-size="${tam}" font-weight="${peso}" fill="${color}" textLength="${ancho}" lengthAdjust="spacingAndGlyphs">${texto}</text>`;
}
/** Destello de cuatro puntas, para los momentos de logro. */
function destello(x, y, r = 7, color = PAL.moneda) {
  const k = r * 0.28;
  return `<path class="il-destello" d="M${x} ${y - r}Q${x + k} ${y - k} ${x + r} ${y}Q${x + k} ${y + k} ${x} ${y + r}Q${x - k} ${y + k} ${x - r} ${y}Q${x - k} ${y - k} ${x} ${y - r}Z" fill="${color}"/>`;
}
function insignia(x, icono, fondo, color) {
  const k = 20 / 24;
  return `<circle cx="${x}" cy="80" r="18" fill="${fondo}"/><g transform="translate(${x - 10} 70) scale(${k})" fill="none" stroke="${color}" stroke-width="${(2.4 / k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round">${ICONOS[icono]}</g>`;
}
/** Conector punteado de la insignia izquierda al objeto; el derecho es el mismo trazo reflejado. */
function conectores(d, colorIzq, colorDer) {
  const t = c => `fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="0.1 6.5"`;
  return `<path d="${d}" ${t(colorIzq)}/><path d="${d}" ${t(colorDer)} transform="matrix(-1 0 0 1 240 0)"/>`;
}
let _escenas = 0;
function escena(centro, izq, der, extra = '', { sombra = 140, ancho = 34 } = {}) {
  const id = `esc${++_escenas}`;
  return `<svg width="240" height="160" viewBox="0 0 240 160" aria-hidden="true" focusable="false"><defs><radialGradient id="${id}" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stop-color="${PAL.escenarioLuz}"/><stop offset="1" stop-color="${PAL.escenario}"/></radialGradient></defs>
    <g class="il-esc"><circle cx="120" cy="80" r="58" fill="url(#${id})"/><ellipse cx="120" cy="${sombra}" rx="${ancho}" ry="4" fill="${PAL.tinta}" opacity="0.10"/></g><g class="il-extra">${extra}</g><g class="il-obj">${centro}</g><g class="il-izq">${insignia(40, ...izq)}</g><g class="il-der">${insignia(200, ...der)}</g></svg>`;
}
/** Teléfono centrado: cuerpo 64 × 124 (x 88–152), pantalla 54 × 106 (x 93–147, y 27–133). */
function telefono(pantalla) {
  return `<rect x="88" y="18" width="64" height="124" rx="14" fill="${PAL.tinta}"/><rect x="93" y="27" width="54" height="106" rx="9" fill="${PAL.pantalla}"/><rect x="113" y="21.5" width="14" height="2.5" rx="1.25" fill="${PAL.camara}"/>${pantalla}`;
}

/* Anchos de texto medidos con Plus Jakarta Sans y Figtree: textLength los fija sin deformar la letra.
   Se dibujan una vez por tema (Color o Tinta) y se guardan. */
function armarIlus() {
  const I = {
  /* 1 · Libreta: página con margen naranja, renglones y la cifra anotada. */
  anotar: escena(
    `<rect x="86" y="26" width="68" height="94" rx="10" fill="#FFFFFF" stroke="${PAL.borde}" stroke-width="2.5"/>
     <path d="M100 36V110" stroke="${PAL.moneda}" stroke-width="2.5" stroke-linecap="round"/>
     <path d="M109 48H143M109 62H143M109 76H131" stroke="${PAL.renglon}" stroke-width="5" stroke-linecap="round"/>
     <rect x="83" y="102" width="74" height="32" rx="16" fill="${PAL.azul}"/>
     ${txtIlus(120, 123.3, '$5.000', { tam: 15, color: '#FFFFFF', ancho: 56.5 })}
     ${destello(162, 30, 6)}${destello(171, 44, 3.5)}`,
    ['mas', PAL.monedaFondo, PAL.monedaTexto], ['ok', PAL.verdeFondo, PAL.verde], '', { sombra: 140, ancho: 36 }),
  /* 2 · Celular del vecino con su cuenta; de la tienda al vecino. */
  vecino: escena(
    telefono(`${txtIlus(120, 48, 'Su cuenta', { tam: 8, peso: 600, color: PAL.gris, ancho: 36.4 })}
      ${txtIlus(120, 65, '$23.000', { tam: 10.5, ancho: 45.8 })}
      <path d="M101 84H139M101 97H139M101 110H129" stroke="${PAL.borde}" stroke-width="4" stroke-linecap="round"/>`),
    ['tienda', PAL.monedaFondo, PAL.monedaTexto], ['contactos', PAL.azulSuave, PAL.azul],
    conectores('M50 63Q58 42 80 38', PAL.moneda, PAL.azul), { sombra: 146, ancho: 30 }),
  /* 3 · Corrección visible: antes, tachado; ahora, debajo y más fuerte. */
  claras: escena(
    `<rect x="72" y="30" width="96" height="100" rx="12" fill="#FFFFFF" stroke="${PAL.borde}" stroke-width="2.5"/>
     <rect x="92" y="42" width="56" height="18" rx="9" fill="${PAL.monedaFondo}"/>
     ${txtIlus(120, 54.2, 'Corregido', { tam: 9, peso: 600, color: PAL.monedaTexto, ancho: 41.4 })}
     ${txtIlus(120, 81, '$8.000', { tam: 12, peso: 700, color: PAL.gris, ancho: 45.4 })}
     <path d="M94 76.8H146" stroke="${PAL.alerta}" stroke-width="1.6" stroke-linecap="round"/>
     ${txtIlus(120, 104, '$6.000', { tam: 16, color: PAL.azul, ancho: 60.1 })}
     <path d="M96 118H144" stroke="${PAL.borde}" stroke-width="4" stroke-linecap="round"/>`,
    ['lapiz', PAL.monedaFondo, PAL.monedaTexto], ['ojo', PAL.azulSuave, PAL.azul], '', { sombra: 138, ancho: 42 }),
  /* 4 · Calendario con el día de pago marcado; mensaje y horario a los lados. */
  cobrar: escena(
    `<rect x="78" y="34" width="84" height="98" rx="12" fill="#FFFFFF" stroke="${PAL.borde}" stroke-width="2.5"/>
     <path d="M78 46A12 12 0 0 1 90 34H150A12 12 0 0 1 162 46V56H78Z" fill="${PAL.azul}"/>
     <path d="M101 28V40M139 28V40" stroke="${PAL.tinta}" stroke-width="5" stroke-linecap="round"/>
     ${[70, 87, 104].map((y, f) => [88.5, 105.5, 122.5, 139.5].map((x, c) => `<rect x="${x}" y="${y}" width="12" height="12" rx="3" fill="${f === 1 && c === 2 ? PAL.moneda : PAL.celda}"/>`).join('')).join('')}`,
    ['chat', PAL.verdeFondo, PAL.verde], ['reloj', PAL.azulSuave, PAL.azul], '', { sombra: 140, ancho: 38 }),
  /* 5 · La libreta queda en el celular, con candado; privacidad y copia a los lados. */
  privada: escena(
    telefono(`<path d="M111 70V64a9 9 0 0 1 18 0v6" stroke="${PAL.azul}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="105" y="70" width="30" height="24" rx="6" fill="${PAL.azul}"/>
      <circle cx="120" cy="80" r="3" fill="#FFFFFF"/><path d="M120 82v5" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M106 112H134" stroke="${PAL.borde}" stroke-width="4" stroke-linecap="round"/>`),
    ['escudo', PAL.azulSuave, PAL.azul], ['descargar', PAL.verdeFondo, PAL.verde], '', { sombra: 146, ancho: 30 })
  };
  I.menu = MENU_DEMO;
  return I;
}
const _ilus = {};
const ILUS = new Proxy({}, { get: (_, k) => { const t = document.documentElement.dataset.tema === 'tinta' ? 'tinta' : 'color'; return (_ilus[t] || (_ilus[t] = armarIlus()))[k]; } });
/* 6 · El menú de verdad (sin enlaces: es una muestra) y una línea por sección. Sus colores salen del CSS. */
const MENU_DEMO = (() => {
  const secc = [['libreta', 'Libreta', 'Quién le debe y cuánto.'], ['campana', 'Cobros', 'A quién recordar hoy, en el horario de la ley.'], ['grafica', 'Resumen', 'Cuánto fió y cuánto recuperó en el mes.'], ['ajustes', 'Ajustes', 'Letra, mensajes y copia de su libreta.']];
  const pildora = `<div class="nav" aria-hidden="true">${secc.map(([i, n], k) => `<span class="tab-demo${k === 0 ? ' activa' : ''}">${ic(i, 24, k === 0 ? 2.4 : 2)}${k === 0 ? n : ''}</span>`).join('')}</div>`;
  return `<div class="como-menu">${pildora}<ul>${secc.map(([i, n, d]) => `<li><span class="c" aria-hidden="true">${ic(i, 22, 2.2)}</span><span><b>${n}</b><span class="d">${d}</span></span></li>`).join('')}</ul></div>`;
})();

/* Tarjetas de "Así funciona": título de 6 palabras o menos y una frase corta. */
const COMO = [
  ['anotar', 'Anote el fiado en segundos', 'El nombre, el monto y listo. Como en el cuaderno.'],
  ['vecino', 'Su vecino ve su cuenta', 'Se la muestra aquí o le llega por WhatsApp.'],
  ['claras', 'Cuentas claras, sin borrones', 'Si se equivoca, corrige. Los dos ven qué cambió.'],
  ['cobrar', 'Cobre sin pena', 'Fiao le dice a quién recordar y cuándo se puede.'],
  ['privada', 'Su libreta es solo suya', 'Queda en este celular. Sin registro ni contraseñas.'],
  ['menu', 'Así se mueve por Fiao', 'Abajo están las cuatro secciones. «Anotar fiado» flota a la derecha.']
];
