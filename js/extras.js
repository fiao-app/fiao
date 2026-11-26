/* Fiao 2.3.0 · Novedades y Accesibilidad, desde Ajustes. */
'use strict';

/* Lo nuevo de cada versión, en palabras del tendero. El detalle técnico está en el README. */
const NOVEDADES = [
  ['2.4.0', '26 de noviembre', ['Dígale a Fiao: mantenga presionado «Fiar» y dígale «Fíale cinco mil a Keyla». Actívelo en Ajustes.', 'También entiende pagos, preguntas como «¿Quién me debe más?» y «Recuérdale a Yesid».']],
  ['2.3.4', '26 de noviembre', ['«Palabras de Fiao» explica 23 palabras de la app, también las nuevas.', 'Enviar el recibo por WhatsApp marca el paso en Primeros pasos.']],
  ['2.3.3', '26 de noviembre', ['Los botones que abren WhatsApp llevan su logo.']],
  ['2.3.2', '26 de noviembre', ['«Quién debe más» en naranja, el color de lo fiado.', 'Enviar el recibo como imagen pide el celular primero, igual que el recibo por mensaje.']],
  ['2.3.1', '26 de noviembre', ['Exporte su libreta a Excel desde Ajustes.', 'Ajustes confirma que todo está guardado en el celular.', 'Ocultar montos funciona de una vez, sin volver a abrir.', 'Los avisos de abajo se leen bien en el tema Oscuro.']],
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

/* ───── 2.3.1 · «Todo guardado» y exportar a Excel ───── */
/** Una línea que confirma que la libreta está guardada en el celular, y desde cuándo. */
function lineaGuardado() {
  if (Datos.modo === 'memoria') return `<span class="estado atrasado">${ic('atencion', 16, 2.4)}Este navegador no deja guardar: use la copia de respaldo</span>`;
  const t = Datos.guardadoEn, min = t ? Math.floor((Date.now() - t) / 60000) : null;
  const cuando = t == null ? '' : min < 1 ? ' · hace un momento' : min < 60 ? ` · hace ${min} min` : ` · a las ${hora(new Date(t))}`;
  return `<span class="estado ok">${ic('ok', 16, 2.6)}Todo guardado en este celular${cuando}</span>`;
}
/** Exporta fiados y pagos a un CSV que Excel abre con tildes y columnas (punto y coma, como en Colombia). */
async function exportarExcel() {
  const campo = v => { const s = String(v ?? ''); return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const TIPO = { fiado: 'Fiado', pago: 'Pago', saldo: 'Saldo inicial' };
  const filas = [['Fecha', 'Hora', 'Cliente', 'Tipo', 'Monto', 'Qué llevó o cómo pagó', 'Atendió', 'Estado', 'Saldo actual del cliente']];
  const movs = [...Datos.movs.values()].sort((a, b) => a.fecha.localeCompare(b.fecha));
  for (const m of movs) {
    const c = cliente(m.clienteId); const d = new Date(m.fecha);
    filas.push([isoDia(d), hora(d), c ? c.nombre : '(cliente borrado)', TIPO[m.tipo] || m.tipo, m.monto,
      m.tipo === 'pago' ? (MEDIOS[m.medio] || '').replace(/^(en|por) /, '') : (m.que || ''), m.atendio || '',
      m.anulado ? 'Anulado' : (m.correcciones && m.correcciones.length ? 'Corregido' : ''), c ? saldoDe(c.id) : '']);
  }
  const texto = '﻿' + filas.map(f => f.map(campo).join(';')).join('\r\n');
  const hoy = new Date(), nombre = `fiao-libreta-${isoDia(hoy)}.csv`;
  const archivo = new File([texto], nombre, { type: 'text/csv' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) { await navigator.share({ files: [archivo], title: 'Libreta de Fiao' }); avisar('Listo: ábrala en Excel o Google Sheets.'); return; }
  } catch (e) { if (e.name === 'AbortError') return; }
  const url = URL.createObjectURL(archivo);
  const a = Object.assign(document.createElement('a'), { href: url, download: nombre });
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
  avisar(`Descargó ${filas.length - 1} movimientos. Ábralos en Excel o Google Sheets.`);
}
