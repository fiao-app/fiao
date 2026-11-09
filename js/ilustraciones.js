/* Fiao · ilustraciones del primer acceso.
   Un mismo sistema para todas, en un lienzo de 240 × 160:
   · un escenario circular (r = 58) centrado en (120, 80);
   · un objeto principal centrado en x = 120, con trazos de 2,5 y renglones de 5;
   · dos insignias simétricas (r = 18) en x = 40 y x = 200, a la altura del centro,
     con los mismos íconos de la app a 20 px;
   · textos con ancho fijo (textLength): nunca se salen de su caja, sea cual sea la fuente;
   · conectores, si los hay, son el mismo trazo reflejado: miden igual a los dos lados. */
'use strict';

const PAL = {
  tinta: '#16213E', azul: '#2346A0', azulSuave: '#DCE4F7', escenario: '#E8EEFB', renglon: '#C9D4EE', borde: '#DDE2EA',
  naranja: '#F28C5B', naranjaTexto: '#B93C0B', naranjaFondo: '#FDEEE5', verde: '#17703F', verdeFondo: '#E7F4EC', gris: '#4A5366', celda: '#E9EDF2'
};
function txtIlus(x, y, texto, { tam = 12, peso = 800, color = PAL.tinta, ancho }) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Atkinson Hyperlegible Next, Atkinson Hyperlegible, sans-serif" font-size="${tam}" font-weight="${peso}" fill="${color}" textLength="${ancho}" lengthAdjust="spacingAndGlyphs">${texto}</text>`;
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
function escena(centro, izq, der, extra = '') {
  return `<svg width="240" height="160" viewBox="0 0 240 160" aria-hidden="true" focusable="false"><circle cx="120" cy="80" r="58" fill="${PAL.escenario}"/>${extra}${centro}${insignia(40, ...izq)}${insignia(200, ...der)}</svg>`;
}
/** Teléfono centrado: cuerpo 64 × 124 (x 88–152), pantalla 54 × 106 (x 93–147, y 27–133). */
function telefono(pantalla) {
  return `<rect x="88" y="18" width="64" height="124" rx="14" fill="${PAL.tinta}"/><rect x="93" y="27" width="54" height="106" rx="9" fill="#FFFFFF"/><rect x="113" y="21.5" width="14" height="2.5" rx="1.25" fill="#3A4766"/>${pantalla}`;
}

/* Anchos de texto medidos con Atkinson Hyperlegible Next: textLength los fija sin deformar la letra. */
const ILUS = {
  /* 1 · Libreta: página con margen naranja, renglones y la cifra anotada. */
  anotar: escena(
    `<rect x="86" y="26" width="68" height="94" rx="10" fill="#FFFFFF" stroke="${PAL.borde}" stroke-width="2.5"/>
     <path d="M100 36V110" stroke="${PAL.naranja}" stroke-width="2.5" stroke-linecap="round"/>
     <path d="M109 48H143M109 62H143M109 76H131" stroke="${PAL.renglon}" stroke-width="5" stroke-linecap="round"/>
     <rect x="83" y="102" width="74" height="32" rx="16" fill="${PAL.azul}"/>
     ${txtIlus(120, 123.3, '$5.000', { tam: 15, color: '#FFFFFF', ancho: 52.9 })}`,
    ['mas', PAL.naranjaFondo, PAL.naranjaTexto], ['ok', PAL.verdeFondo, PAL.verde]),
  /* 2 · Celular del vecino con su cuenta; de la tienda al vecino. */
  vecino: escena(
    telefono(`${txtIlus(120, 48, 'Su cuenta', { tam: 8, peso: 600, color: PAL.gris, ancho: 36.3 })}
      ${txtIlus(120, 65, '$23.000', { tam: 11, ancho: 45.3 })}
      <path d="M101 84H139M101 97H139M101 110H129" stroke="${PAL.borde}" stroke-width="4" stroke-linecap="round"/>`),
    ['tienda', PAL.naranjaFondo, PAL.naranjaTexto], ['contactos', PAL.azulSuave, PAL.azul],
    conectores('M50 63Q58 42 80 38', PAL.naranja, PAL.azul)),
  /* 3 · Corrección visible: antes, tachado; ahora, debajo y más fuerte. */
  claras: escena(
    `<rect x="72" y="30" width="96" height="100" rx="12" fill="#FFFFFF" stroke="${PAL.borde}" stroke-width="2.5"/>
     <rect x="92" y="42" width="56" height="18" rx="9" fill="${PAL.naranjaFondo}"/>
     ${txtIlus(120, 54.2, 'Corregido', { tam: 9, peso: 600, color: PAL.naranjaTexto, ancho: 40.8 })}
     ${txtIlus(120, 81, '$8.000', { tam: 12, peso: 600, color: PAL.gris, ancho: 41.4 })}
     <path d="M96 76.8H144" stroke="${PAL.naranjaTexto}" stroke-width="1.6" stroke-linecap="round"/>
     ${txtIlus(120, 104, '$6.000', { tam: 16, color: PAL.azul, ancho: 56.8 })}
     <path d="M96 118H144" stroke="${PAL.borde}" stroke-width="4" stroke-linecap="round"/>`,
    ['lapiz', PAL.naranjaFondo, PAL.naranjaTexto], ['ojo', PAL.azulSuave, PAL.azul]),
  /* 4 · Calendario con el día de pago marcado; mensaje y horario a los lados. */
  cobrar: escena(
    `<rect x="78" y="34" width="84" height="98" rx="12" fill="#FFFFFF" stroke="${PAL.borde}" stroke-width="2.5"/>
     <path d="M78 46A12 12 0 0 1 90 34H150A12 12 0 0 1 162 46V56H78Z" fill="${PAL.azul}"/>
     <path d="M101 28V40M139 28V40" stroke="${PAL.tinta}" stroke-width="5" stroke-linecap="round"/>
     ${[70, 87, 104].map((y, f) => [88.5, 105.5, 122.5, 139.5].map((x, c) => `<rect x="${x}" y="${y}" width="12" height="12" rx="3" fill="${f === 1 && c === 2 ? PAL.naranja : PAL.celda}"/>`).join('')).join('')}`,
    ['chat', PAL.verdeFondo, PAL.verde], ['reloj', PAL.azulSuave, PAL.azul]),
  /* 5 · La libreta queda en el celular, con candado; privacidad y copia a los lados. */
  privada: escena(
    telefono(`<path d="M111 70V64a9 9 0 0 1 18 0v6" stroke="${PAL.azul}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="105" y="70" width="30" height="24" rx="6" fill="${PAL.azul}"/>
      <circle cx="120" cy="80" r="3" fill="#FFFFFF"/><path d="M120 82v5" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M106 112H134" stroke="${PAL.borde}" stroke-width="4" stroke-linecap="round"/>`),
    ['escudo', PAL.azulSuave, PAL.azul], ['descargar', PAL.verdeFondo, PAL.verde])
};

/* Tarjetas de "Así funciona": título de 6 palabras o menos y una frase corta. */
const COMO = [
  ['anotar', 'Anote el fiado en segundos', 'El nombre, el monto y listo. Como en el cuaderno.'],
  ['vecino', 'Su vecino ve su cuenta', 'Se la muestra aquí o le llega por WhatsApp.'],
  ['claras', 'Cuentas claras, sin borrones', 'Si se equivoca, corrige. Los dos ven qué cambió.'],
  ['cobrar', 'Cobre sin pena', 'Fiao le dice a quién recordar y cuándo se puede.'],
  ['privada', 'Su libreta es solo suya', 'Queda en este celular. Sin registro ni contraseñas.']
];
