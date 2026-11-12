/* Fiao 1.4.0 · traer clientes de los contactos, recibo como imagen y cuadre del día. */
'use strict';

/* ═════════════ Traer clientes de los contactos ═════════════
   Android (Chrome): el selector de contactos del celular, varios a la vez.
   iPhone y los demás: el archivo de contactos (.vcf) que exporta la app Contactos.
   Fiao solo ve los contactos que el tendero elige; nada sale del celular. */
const MAX_IMPORTAR = 300;
function hayPickerContactos() { return 'contacts' in navigator && 'ContactsManager' in window; }

/** Celular colombiano limpio (10 números, empieza por 3) o ''. */
function celDeContacto(t) {
  let d = String(t || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('57')) d = d.slice(2);
  if (d.length === 13 && d.startsWith('057')) d = d.slice(3);
  return d.length === 10 && d.startsWith('3') ? d : '';
}
/** Nombre limpio de máximo 24 letras, cortado entre palabras («María de los Ángeles de la Hoz» → «María de los Ángeles»). */
function nombreDeContacto(n) {
  let x = String(n || '').replace(/\s+/g, ' ').trim();
  if (x.length <= LIMITES.nombre) return x;
  const corte = x.slice(0, LIMITES.nombre + 1), esp = corte.lastIndexOf(' ');
  x = (esp > 8 ? corte.slice(0, esp) : x.slice(0, LIMITES.nombre)).trim();
  while (/\s(de|del|la|las|los|el|y)$/i.test(x)) x = x.replace(/\s+\S+$/, '');
  return x;
}

/** Lee un archivo .vcf (vCard 2.1, 3.0 o 4.0) y devuelve [{ nombre, cel }]. */
function leerVCard(texto) {
  const crudo = String(texto || '').replace(/\r\n?/g, '\n');
  /* Líneas partidas: las que siguen empiezan con espacio (3.0/4.0) o la anterior termina en «=» (2.1). */
  const lineas = [];
  for (const l of crudo.split('\n')) {
    const prev = lineas[lineas.length - 1];
    if (/^[ \t]/.test(l) && lineas.length) lineas[lineas.length - 1] = prev + l.slice(1);
    else if (prev !== undefined && /QUOTED-PRINTABLE/i.test(prev.split(':')[0]) && /=$/.test(prev)) lineas[lineas.length - 1] = prev.slice(0, -1) + l;
    else lineas.push(l);
  }
  const qp = s => { try { const b = []; s.replace(/=([0-9A-F]{2})|([^=])/gi, (m, h, c) => { if (h) b.push(parseInt(h, 16)); else for (const x of new TextEncoder().encode(c)) b.push(x); }); return new TextDecoder('utf-8').decode(new Uint8Array(b)); } catch (e) { return s; } };
  const limpio = s => s.replace(/\\n/gi, ' ').replace(/\\([,;\\])/g, '$1');
  const salida = []; let actual = null;
  for (const l of lineas) {
    const i = l.indexOf(':'); if (i < 0) continue;
    const cab = l.slice(0, i).replace(/^[^.;:]+\.(?=[A-Za-z])/, ''), partes = cab.split(';'), prop = partes[0].toUpperCase();
    let valor = l.slice(i + 1);
    if (/QUOTED-PRINTABLE/i.test(cab)) valor = qp(valor);
    if (prop === 'BEGIN' && /VCARD/i.test(valor)) { actual = { fn: '', n: '', org: '', tels: [] }; continue; }
    if (!actual) continue;
    if (prop === 'END') { salida.push(actual); actual = null; continue; }
    if (prop === 'FN') actual.fn = limpio(valor);
    else if (prop === 'N') { const [fam = '', dado = '', otro = ''] = valor.split(';').map(limpio); actual.n = [dado, otro, fam].filter(Boolean).join(' '); }
    else if (prop === 'ORG') actual.org = limpio(valor.split(';')[0]);
    else if (prop === 'TEL') actual.tels.push({ v: valor.replace(/^tel:/i, ''), cel: /CELL|MOBILE|IPHONE/i.test(cab) });
  }
  return salida.map(x => {
    const tel = x.tels.find(t => t.cel && celDeContacto(t.v)) || x.tels.find(t => celDeContacto(t.v));
    const cel = tel ? celDeContacto(tel.v) : '';
    return { nombre: nombreDeContacto(x.fn || x.n || x.org || (cel ? celLegible(cel) : '')), cel };
  }).filter(x => x.nombre);
}

/** Marca repetidos (entre sí y contra la libreta) y deja la lista lista para revisar. */
function prepararImportados(lista) {
  const yaCel = new Set(), yaNom = new Set();
  for (const c of Datos.clientes.values()) { if (c.cel) yaCel.add(celDigitos(c.cel)); yaNom.add(normalizar(c.nombre)); }
  const vistosCel = new Set(), vistosNom = new Set(), out = [];
  for (const x of lista) {
    const nom = normalizar(x.nombre);
    if ((x.cel && vistosCel.has(x.cel)) || (!x.cel && vistosNom.has(nom))) continue; // el mismo contacto dos veces
    if (x.cel) vistosCel.add(x.cel); vistosNom.add(nom);
    out.push({ ...x, ya: (x.cel && yaCel.has(x.cel)) || yaNom.has(nom) });
    if (out.length >= MAX_IMPORTAR) break;
  }
  return out.sort((a, b) => (a.ya - b.ya) || a.nombre.localeCompare(b.nombre, 'es'));
}

function abrirImportar() {
  const ios = esIOS(), picker = hayPickerContactos();
  abrirHoja(`${cabHoja('Traer de mis contactos')}
    <p style="font-size:1.125rem;line-height:1.55">Elija a sus clientes y Fiao los pone en la libreta, con su celular. Después revisa la lista antes de guardar.</p>
    ${picker ? `<button type="button" class="btn" data-accion="imp-elegir">${ic('contactos', 24, 2.2)}Elegir de mis contactos</button>` : ''}
    ${!picker && ios ? `<ol class="pasos-copiar">
      <li><span>En la app <b>Contactos</b>, toque <b>Listas</b> y cree una lista con sus clientes.</span></li>
      <li><span>Mantenga presionada la lista y toque <b>Exportar</b>. Luego, <b>Guardar en Archivos</b>.</span></li>
      <li><span>Vuelva aquí y toque <b>Elegir el archivo</b>.</span></li></ol>` : ''}
    <button type="button" class="${picker ? 'btn-sec' : 'btn'}" data-accion="imp-archivo">${ic('descargar', 22, 2.2)}${picker ? 'Traer de un archivo de contactos' : 'Elegir el archivo'}</button>
    <input type="file" id="imp-archivo" class="vh" accept=".vcf,.vcard,text/vcard,text/x-vcard" tabindex="-1" aria-label="Archivo de contactos">
    <p class="ayuda" style="display:flex;gap:.5rem">${ic('escudo', 20)}<span>Fiao solo ve los contactos que usted elige. Nada sale de su celular.</span></p>
    <p class="error" id="imp-error" role="alert" hidden></p>`, d => {
    const err = d.querySelector('#imp-error');
    const fallo = t => { err.textContent = t; err.hidden = false; };
    d.querySelector('[data-accion="imp-archivo"]').addEventListener('click', () => { err.hidden = true; d.querySelector('#imp-archivo').click(); });
    d.querySelector('[data-accion="imp-elegir"]')?.addEventListener('click', async () => {
      try {
        const cs = await navigator.contacts.select(['name', 'tel'], { multiple: true });
        if (!cs || !cs.length) return;
        const lista = cs.map(c => { const cel = (c.tel || []).map(celDeContacto).find(Boolean) || ''; return { nombre: nombreDeContacto((c.name || [])[0] || (cel ? celLegible(cel) : '')), cel }; }).filter(x => x.nombre);
        revisarImportados(prepararImportados(lista));
      } catch (e) { fallo('No se pudo abrir la lista de contactos.'); }
    });
    d.querySelector('#imp-archivo').addEventListener('change', async ev => {
      const f = ev.target.files && ev.target.files[0]; if (!f) return;
      try {
        const lista = leerVCard(await f.text());
        if (!lista.length) return fallo('Ese archivo no trae contactos. Debe ser el que exporta la app Contactos (.vcf).');
        revisarImportados(prepararImportados(lista));
      } catch (e) { fallo('No se pudo leer ese archivo.'); }
    });
  }, { nombre: 'importar' });
}

function revisarImportados(lista) {
  const nuevos = lista.filter(x => !x.ya).length;
  if (!nuevos) {
    pintarHoja(`${cabHoja('Ya los tiene')}<p style="font-size:1.125rem;line-height:1.55">${lista.length === 1 ? 'Ese contacto ya está' : `Esos ${lista.length} contactos ya están`} en su libreta.</p><button type="button" class="btn" data-cerrar>Entendido</button>`, () => {});
    return;
  }
  const fila = (x, i) => `<li><label class="imp-fila${x.ya ? ' ya' : ''}"><input type="checkbox" data-i="${i}"${x.ya ? ' disabled' : ' checked'}><span class="medio"><span class="nombre">${esc(x.nombre)}</span><span class="detalle">${x.ya ? 'Ya está en su libreta' : x.cel ? esc(celLegible(x.cel)) : 'Sin celular'}</span></span></label></li>`;
  pintarHoja(`${cabHoja(`Llegaron ${lista.length} ${lista.length === 1 ? 'contacto' : 'contactos'}`)}
    <p class="ayuda">Quite la marca a los que no son clientes. Entran sin deuda; el permiso para mensajes se pide después, como siempre.</p>
    <ul class="lista imp-lista" aria-label="Contactos para agregar">${lista.map(fila).join('')}</ul>
    <button type="button" class="btn" data-accion="imp-guardar"></button>
    <button type="button" class="btn-link" data-cerrar>Cancelar</button>`, d => {
    const bt = d.querySelector('[data-accion="imp-guardar"]');
    const marcados = () => [...d.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)')].map(i => lista[+i.dataset.i]);
    const pintar = () => { const n = marcados().length; bt.disabled = !n; bt.textContent = n ? `Agregar ${n} ${n === 1 ? 'cliente' : 'clientes'}` : 'Marque al menos uno'; };
    d.querySelector('.imp-lista').addEventListener('change', pintar); pintar();
    let guardando = false;
    bt.addEventListener('click', async () => {
      if (guardando) return; guardando = true;
      const ahora = new Date().toISOString();
      const nuevos = marcados().map(x => ({ id: uid(), nombre: x.nombre, cel: x.cel, cupo: null, pago: 'quincena', recibos: 'whatsapp', recordar: 'atraso', detalle: '', lista: null, permiso: { estado: 'ninguno', fecha: null }, proximaFecha: null, creado: ahora }));
      await guardarClientes(nuevos);
      cerrarHoja();
      if (location.hash.slice(1) !== 'inicio') ir('inicio'); else mostrarRuta({ animar: false });
      avisar(`Listo: ${nuevos.length} ${nuevos.length === 1 ? 'cliente nuevo' : 'clientes nuevos'} en su libreta.`, { voz: 'importados', acciones: [{ texto: 'Deshacer', fn: async () => {
        const quitar = nuevos.filter(c => Datos.clientes.has(c.id) && !movsDe(c.id).length);
        await quitarClientes(quitar.map(c => c.id)); mostrarRuta({ animar: false }); avisar('Listo, se deshizo.', { icono: 'girar' });
      } }] });
    });
  });
}

/* ═════════════ Recibo como imagen ═════════════
   Una tarjeta con la cara de Fiao, dibujada en el celular, que se comparte como foto junto al mensaje con el enlace.
   Compartir una foto no deja elegir el chat por número: el tendero toca el chat del vecino. */
function puedeCompartirArchivos() {
  try { return !!(navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.png', { type: 'image/png' })] })); } catch (e) { return false; }
}
async function dibujarRecibo(c, m) {
  const t = tienda(), pago = m.tipo === 'pago', s = saldoDe(c.id), f = new Date(m.fecha);
  const W = 1080, H = 1350, k = document.createElement('canvas'); k.width = W; k.height = H;
  const g = k.getContext('2d');
  const TIT = '"Plus Jakarta Sans", "Figtree", system-ui, sans-serif', TXT = '"Figtree", system-ui, sans-serif';
  try { await Promise.all(['800 120px "Plus Jakarta Sans"', '700 60px "Plus Jakarta Sans"', '400 40px "Figtree"', '600 40px "Figtree"'].map(x => document.fonts.load(x))); } catch (e) { /* letra del sistema */ }
  const AZUL = '#3346E0', TINTA = '#141B34', GRIS = '#5A6072', PAPEL = '#F7F4EE', NARANJA = '#FF8A3D', VERDE = '#127A45';
  /* Cabe en el ancho: achica la letra hasta que quepa. */
  const cabe = (txt, peso, tam, fam, ancho) => { let z = tam; do { g.font = `${peso} ${z}px ${fam}`; if (g.measureText(txt).width <= ancho) break; z -= 2; } while (z > 24); return z; };
  const escribir = (txt, x, y, peso, tam, fam, color, ancho = W - 160, alinear = 'left') => { const z = cabe(txt, peso, tam, fam, ancho); g.font = `${peso} ${z}px ${fam}`; g.fillStyle = color; g.textAlign = alinear; g.textBaseline = 'alphabetic'; g.fillText(txt, x, y); return z; };
  g.fillStyle = PAPEL; g.fillRect(0, 0, W, H);
  /* Toldo: franjas de cobalto con el borde ondulado. */
  const TOLDO = 300, F = W / 12;
  for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#3D4FE4' : AZUL; g.fillRect(i * F, 0, F + 1, TOLDO); }
  for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#3D4FE4' : AZUL; g.beginPath(); g.arc(i * F + F / 2, TOLDO, F / 2, 0, Math.PI); g.fill(); }
  /* Logo de Fiao (la F con su franja), en blanco sobre el toldo. */
  g.save(); g.translate(80, 64); g.scale(1.6, 1.6);
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect ? g.roundRect(0, 0, 56, 56, 13) : g.rect(0, 0, 56, 56); g.fill();
  const p = d => { g.fill(new Path2D(d)); };
  g.fillStyle = AZUL; p('M13 14Q13 11 16 11H23V19A5 5 0 0 1 13 19Z'); p('M33 11H40Q43 11 43 14V19A5 5 0 0 1 33 19Z'); p('M13 19H23V28H33A5 5 0 0 1 33 38H23V42A5 5 0 0 1 13 42Z');
  g.fillStyle = NARANJA; p('M23 11H33V19A5 5 0 0 1 23 19Z');
  g.restore();
  escribir(t.nombre || 'La tienda', 200, 132, 800, 60, TIT, '#FFFFFF', W - 280);
  escribir(pago ? 'Comprobante de pago' : 'Recibo de fiado', 200, 192, 400, 38, TXT, '#E6E9FF', W - 280);
  /* Tarjeta blanca con lo anotado. */
  const X = 64, Y = 400, CW = W - 128, CH = 800;
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect ? g.roundRect(X, Y, CW, CH, 48) : g.rect(X, Y, CW, CH); g.fill();
  let y = Y + 110;
  escribir(`${nombreCorto(c.nombre)}, ${pago ? 'recibimos su pago:' : 'le anotamos:'}`, X + 64, y, 400, 46, TXT, TINTA, CW - 128);
  y += 160; escribir(pesos(m.monto), X + 60, y, 800, 150, TIT, pago ? VERDE : TINTA, CW - 128);
  const det = pago ? mayuscula(MEDIOS[m.medio] || '') : mayuscula(m.que || '');
  if (det) { y += 72; escribir(det.length > 60 ? det.slice(0, 58) + '…' : det, X + 64, y, 600, 40, TXT, TINTA, CW - 128); }
  y += 62; escribir(`${mayuscula(fechaLarga(f))}, ${hora(f)}`, X + 64, y, 400, 36, TXT, GRIS, CW - 128);
  y += 56; g.fillStyle = '#E4E0D6'; g.fillRect(X + 64, y, CW - 128, 3);
  y += 92;
  if (s > 0) {
    escribir(pago ? 'Queda debiendo' : 'Su cuenta va en', X + 64, y, 400, 40, TXT, GRIS, CW - 128);
    y += 96; escribir(pesos(s), X + 60, y, 800, 90, TIT, TINTA, CW - 128);
    if (c.proximaFecha) { y += 64; escribir(`Acordaron pagar ${elDia(diaDe(c.proximaFecha))}.`, X + 64, y, 400, 36, TXT, GRIS, CW - 128); }
  } else { y += 40; escribir('Su cuenta quedó al día', X + 64, y, 800, 72, TIT, VERDE, CW - 128); }
  /* Pie: dónde está el detalle. */
  escribir('El detalle de su cuenta está en el enlace del mensaje.', W / 2, H - 70, 400, 34, TXT, GRIS, W - 160, 'center');
  if (t.demo) { g.save(); g.translate(W - 120, Y + 70); g.rotate(-0.12); escribir('EJEMPLO', 0, 0, 800, 40, TIT, NARANJA, 300, 'center'); g.restore(); }
  const datos = k.toDataURL('image/png');
  const b = await new Promise((ok, mal) => k.toBlob(x => (x ? ok(x) : mal(new Error('sin imagen'))), 'image/png'));
  return { datos, archivo: new File([b], `recibo-${isoDia(f)}.png`, { type: 'image/png' }) };
}
/** Hoja con la vista previa del recibo; «Compartir» abre el menú del celular (el toque cuenta para el permiso de compartir). */
async function abrirReciboImagen(c, m) {
  const texto = m.tipo === 'pago' ? mensajePago(c, m) : mensajeFiado(c, m), n = esc(nombreCorto(c.nombre)), comparte = puedeCompartirArchivos();
  abrirHoja(`${cabHoja('Recibo como imagen')}
    <div class="recibo-img"><span class="ayuda">Preparando la imagen…</span></div>
    <button type="button" class="btn" data-accion="ri-compartir" disabled>${ic('enviar', 22, 2.4)}${comparte ? `Compartir con ${n}` : 'Guardar la imagen'}</button>
    <button type="button" class="btn-sec" data-accion="ri-copiar">${ic('copiar', 22, 2.2)}Copiar el mensaje con el enlace</button>
    <p class="ayuda">${comparte ? `Elija el chat de ${n} en WhatsApp. Si la foto llega sin el mensaje, pegue el enlace que copió.` : 'Guárdela y envíela por WhatsApp con el mensaje.'}</p>`, async d => {
    let listo = null;
    try { listo = await dibujarRecibo(c, m); } catch (e) { d.querySelector('.recibo-img').innerHTML = '<p class="error">No se pudo preparar la imagen.</p>'; return; }
    if (!d.isConnected || !d.open) return;
    d.querySelector('.recibo-img').innerHTML = `<img src="${listo.datos}" alt="Recibo para ${n}: ${esc(pesos(m.monto))}" width="1080" height="1350">`;
    const bt = d.querySelector('[data-accion="ri-compartir"]'); bt.disabled = false;
    const marcar = async () => { m.enviado = new Date().toISOString(); await guardarMov(m); await registrarContacto(c.id, 'recibo', m.id); };
    bt.addEventListener('click', async () => {
      if (!comparte) {
        const a = document.createElement('a'); a.href = listo.datos; a.download = listo.archivo.name; document.body.appendChild(a); a.click(); a.remove();
        await marcar(); return;
      }
      if (typeof Voz !== 'undefined') Voz.decir('recibo-imagen');
      try { await navigator.share({ files: [listo.archivo], text: texto }); await marcar(); cerrarHoja(); avisar('Recibo enviado como imagen.'); }
      catch (e) { if (e && e.name !== 'AbortError') avisar('No se pudo compartir la imagen. Copie el mensaje y envíelo.', { icono: 'atencion' }); }
    });
    d.querySelector('[data-accion="ri-copiar"]').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(texto); avisar('Mensaje copiado.'); }
      catch (e) { avisar('No se pudo copiar en este celular.', { icono: 'atencion' }); }
    });
  }, { nombre: 'recibo-imagen' });
}
/* «Imagen» en el detalle de cada línea del historial, y «Traer de mis contactos» en la Libreta. */
document.addEventListener('click', ev => {
  if (ev.target.closest('[data-accion="importar"]')) { abrirImportar(); return; }
  const b = ev.target.closest('[data-recibo-imagen]'); if (!b) return;
  const m = mov(b.dataset.reciboImagen); if (!m) return;
  enviarRecibo(cliente(m.clienteId), m, { imagen: true });
});

/* ═════════════ Cuadre del día ═════════════
   Al cerrar: cuánto fió, cuánto cobró y por dónde, quién llegó y quién paga mañana,
   comparado con ayer y con el mismo día de la semana pasada. */
function totalesDe(dia) {
  const d = isoDia(dia), r = { fiado: 0, pagos: 0, nFiado: 0, nPagos: 0, medios: { efectivo: 0, nequi: 0, breb: 0, otro: 0 } };
  for (const m of Datos.movs.values()) {
    if (m.anulado || m.fecha.slice(0, 10) !== d) continue;
    if (m.tipo === 'fiado') { r.fiado += m.monto; r.nFiado++; }
    else if (m.tipo === 'pago') { r.pagos += m.monto; r.nPagos++; r.medios[r.medios[m.medio] !== undefined ? m.medio : 'otro'] += m.monto; }
  }
  return r;
}
/** «$12.000 más que ayer», «$3.000 menos que el viernes pasado», «Igual que ayer». */
function comparacion(hoy, antes, contra, fmt = monto) {
  if (hoy === antes) return hoy ? `Igual que ${contra}` : `${mayuscula(contra)} tampoco hubo`;
  if (!antes) return `${mayuscula(contra)} no hubo`;
  return `${fmt(Math.abs(hoy - antes))} ${hoy > antes ? 'más' : 'menos'} que ${contra}`;
}
function datosCuadre(hoy = new Date()) {
  const ayer = sumarDias(hoy, -1), semana = sumarDias(hoy, -7), dHoy = isoDia(hoy), dMan = isoDia(sumarDias(hoy, 1));
  const h = totalesDe(hoy), a = totalesDe(ayer), s = totalesDe(semana);
  const nuevos = clientes().filter(c => (c.creado || '').slice(0, 10) === dHoy || (c.creado && isoDia(new Date(c.creado)) === dHoy));
  const pagaronHoy = new Set([...Datos.movs.values()].filter(m => m.tipo === 'pago' && !m.anulado && m.fecha.slice(0, 10) === dHoy).map(m => m.clienteId));
  const alDia = clientes().filter(c => pagaronHoy.has(c.id) && saldoDe(c.id) <= 0);
  const manana = clientes().filter(c => c.proximaFecha === dMan && saldoDe(c.id) > 0);
  return { h, a, s, nuevos, alDia, manana, diaSemana: `el ${DIAS[semana.getDay()]} pasado`, calle: totalEnLaCalle() };
}
V.cuadre = () => {
  const hoy = new Date(), x = datosCuadre(hoy), t = tienda();
  const medios = [['efectivo', 'En efectivo'], ['nequi', 'Por Nequi'], ['breb', 'Por Bre-B'], ['otro', 'Otro medio']].filter(([k]) => x.h.medios[k]);
  const cifra = (titulo, valor, cuantos, comp1, comp2, extra = '') => `<section class="tarjeta cuadre-cifra" aria-label="${titulo}"><span class="rotulo-cuadre">${titulo}</span><b class="cuadre-monto">${monto(valor)}</b><span class="ayuda">${cuantos}</span>
      <ul class="cuadre-comp"><li>${comp1}</li><li>${comp2}</li></ul>${extra}</section>`;
  const nombres = (lista, max = 4) => lista.slice(0, max).map(c => esc(nombreCorto(c.nombre))).join(', ') + (lista.length > max ? ` y ${lista.length - max} más` : '');
  return {
    titulo: 'Cuadre de hoy',
    html: `<div class="pantalla">${barra({ titulo: 'Cuadre de hoy', volver: 'resumen', sub: mayuscula(fechaLarga(hoy)), ayuda: false })}<main class="contenido" style="gap:.875rem">
      ${cifra('Fió hoy', x.h.fiado, x.h.nFiado ? `${x.h.nFiado} ${x.h.nFiado === 1 ? 'anotación' : 'anotaciones'}` : 'Nada anotado hoy', comparacion(x.h.fiado, x.a.fiado, 'ayer'), comparacion(x.h.fiado, x.s.fiado, x.diaSemana))}
      ${cifra('Cobró hoy', x.h.pagos, x.h.nPagos ? `${x.h.nPagos} ${x.h.nPagos === 1 ? 'pago' : 'pagos'}` : 'Ningún pago hoy', comparacion(x.h.pagos, x.a.pagos, 'ayer'), comparacion(x.h.pagos, x.s.pagos, x.diaSemana),
        medios.length ? `<dl class="cuadre-medios">${medios.map(([k, n]) => `<div><dt>${n}</dt><dd>${monto(x.h.medios[k])}</dd></div>`).join('')}</dl>${x.h.medios.nequi || x.h.medios.breb ? '<p class="ayuda">Lo de Nequi y Bre-B no está en el cajón: revíselo en su celular.</p>' : ''}` : '')}
      <section class="tarjeta" aria-labelledby="t-cl"><h2 class="titulo-seccion" id="t-cl">Clientes</h2>
        <p class="cuadre-linea">${ic('mas', 20, 2.4)}<span>${x.nuevos.length ? `<b>${x.nuevos.length} ${x.nuevos.length === 1 ? 'nuevo' : 'nuevos'}:</b> ${nombres(x.nuevos)}` : 'Ningún cliente nuevo'}</span></p>
        <p class="cuadre-linea">${ic('ok', 20, 2.4)}<span>${x.alDia.length ? `<b>${x.alDia.length} ${x.alDia.length === 1 ? 'quedó' : 'quedaron'} al día:</b> ${nombres(x.alDia)}` : 'Nadie quedó al día hoy'}</span></p>
        <p class="cuadre-linea">${ic('calendario', 20, 2.2)}<span>${x.manana.length ? `<b>Mañana ${x.manana.length === 1 ? 'paga' : 'pagan'} ${x.manana.length}:</b> ${nombres(x.manana)}` : 'Mañana nadie tiene día de pago'}</span></p>
      </section>
      <p class="ayuda" style="text-align:center">En la calle quedan <b>${monto(x.calle)}</b>.</p>
      ${t.whatsapp ? `<button type="button" class="btn-sec" data-accion="cuadre-wa">${ic('chat', 22, 2.2)}Mandármelo por WhatsApp</button>` : ''}
    </main></div>`,
    montar(r) {
      if (typeof Voz !== 'undefined') Voz.decir('cuadre');
      r.querySelector('[data-accion="cuadre-wa"]')?.addEventListener('click', () => {
        const p = n => pesos(n), lin = [`Cuadre de ${t.nombre || 'la tienda'}, ${fechaLarga(hoy)}:`,
          `Fió ${p(x.h.fiado)} (${comparacion(x.h.fiado, x.a.fiado, 'ayer', pesos).toLowerCase()}).`,
          `Cobró ${p(x.h.pagos)} (${comparacion(x.h.pagos, x.a.pagos, 'ayer', pesos).toLowerCase()})${medios.length > 1 ? ': ' + medios.map(([k, n]) => `${n.toLowerCase()} ${p(x.h.medios[k])}`).join(', ') : ''}.`,
          `Clientes nuevos: ${x.nuevos.length}. Quedaron al día: ${x.alDia.length}. Mañana pagan: ${x.manana.length}.`, `En la calle: ${p(x.calle)}.`];
        abrirWhatsApp(t.whatsapp, lin.join('\n'));
      });
    }
  };
};
