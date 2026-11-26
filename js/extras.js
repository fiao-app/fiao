/* Fiao 2.3.0 · Novedades y Accesibilidad, desde Ajustes. */
'use strict';

/* Lo nuevo de cada versión, en palabras del tendero. El detalle técnico está en el README. */
const NOVEDADES = [
  ['2.3.0', '26 de noviembre', ['Fiao abre al instante, aun con mala señal.', 'En el Resumen, deslice el dedo sobre la gráfica o use las flechas para ver cada día.', 'El Resumen dice qué parte de lo fiado ya volvió.', 'Nuevas: esta pantalla y la de Accesibilidad.']],
  ['2.2.0', '26 de noviembre', ['Tema Oscuro para descansar la vista de noche.', 'Apariencia Automática: Fiao sigue a su celular.']],
  ['2.1.1', '26 de noviembre', ['Lo que anota después de las 7 p. m. cuenta para hoy en el Cuadre.', 'Se maneja mejor con teclado y lector de pantalla.']],
  ['2.1.0', '26 de noviembre', ['Resumen por día, mes, año, todo o las fechas que elija.', 'La sección donde está se ilumina en el menú de abajo.']],
  ['2.0.0', '23 de noviembre', ['Nuevo diseño: «Fiar» en el centro, siempre a la mano.']],
  ['1.7.0', '11 de noviembre', ['Borrar varios clientes de una vez, con Deshacer.']],
  ['1.4.0', '11 de noviembre', ['Traer clientes de los contactos, recibo como imagen y cuadre del día.']],
  ['1.0.0', '10 de noviembre', ['Primera versión estable: nunca finge que guardó.']]
];

V.novedades = () => ({
  titulo: 'Novedades de Fiao',
  html: `<div class="pantalla">${barra({ titulo: 'Novedades de Fiao', volver: 'ajustes', ayuda: false })}
    <main class="contenido" style="gap:.875rem">
      <p class="ayuda">Usted tiene la versión ${VERSION_APP}. Fiao se actualiza solo cuando hay internet.</p>
      ${NOVEDADES.map(([v, f, lineas], i) => `<section class="tarjeta novedad" aria-labelledby="nv-${i}"><h2 class="titulo-seccion" id="nv-${i}">${v}${i === 0 ? ' <span class="pildora-nueva">Nueva</span>' : ''}</h2><span class="ayuda">${f}</span><ul>${lineas.map(l => `<li>${l}</li>`).join('')}</ul></section>`).join('')}
    </main></div>`
});

V.accesibilidad = () => ({
  titulo: 'Accesibilidad',
  html: `<div class="pantalla">${barra({ titulo: 'Accesibilidad', volver: 'ajustes', ayuda: false })}
    <main class="contenido" style="gap:.875rem">
      <section class="tarjeta" aria-labelledby="ac-1"><h2 class="titulo-seccion" id="ac-1">Nuestra meta</h2>
        <p>Fiao busca cumplir las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.2, nivel AA, para que la use cualquier tendero: con poca vista, al sol, con las manos ocupadas o con lector de pantalla.</p></section>
      <section class="tarjeta" aria-labelledby="ac-2"><h2 class="titulo-seccion" id="ac-2">Lo que puede ajustar</h2>
        <ul class="lista-ac">
          <li><b>Letra</b> en tres tamaños: Normal, Grande y Más grande.</li>
          <li><b>Apariencia</b> Automática, Color, Oscuro o Tinta (azul y negro sobre blanco, para leer al sol).</li>
          <li><b>Animaciones</b> Todas o Pocas. Fiao respeta también lo que pida su celular.</li>
          <li><b>Voz de Fiao:</b> una frase corta confirma cada acción.</li>
          <li><b>Ocultar montos</b> cuando hay gente en el mostrador.</li></ul></section>
      <section class="tarjeta" aria-labelledby="ac-3"><h2 class="titulo-seccion" id="ac-3">Cómo está hecha</h2>
        <ul class="lista-ac">
          <li>Textos con contraste de 4,5:1 o más, en los cuatro temas.</li>
          <li>Botones de 44 px o más, con nombre siempre visible.</li>
          <li>Ningún estado se dice solo con color: lleva palabra e ícono.</li>
          <li>Se puede usar con teclado y el foco siempre se ve; cada botón tiene nombre para el lector de pantalla.</li>
          <li>Funciona sin internet y sin registro.</li></ul></section>
      <section class="tarjeta" aria-labelledby="ac-4"><h2 class="titulo-seccion" id="ac-4">Cómo la probamos</h2>
        <p>Antes de cada versión revisamos 29 pantallas y hojas con la herramienta axe, en dos anchos de celular, los tres tamaños de letra y los temas Color, Oscuro y Tinta. También probamos con teclado y comparamos imágenes de antes y después para que nada cambie sin querer. Última revisión: 26 de noviembre de 2026.</p></section>
      <section class="tarjeta" aria-labelledby="ac-5"><h2 class="titulo-seccion" id="ac-5">Lo que aún falta</h2>
        <ul class="lista-ac">
          <li>La página que recibe el vecino depende de WhatsApp para abrirse.</li>
          <li>La copia de respaldo es un archivo: guardarla en Drive o WhatsApp depende del celular.</li></ul></section>
    </main></div>`
});
