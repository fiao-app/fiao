/* Fiao · cobrar sin pena y controlar la libreta:
   Cobros · Resúmenes por enviar · Resumen del mes · Ajustes · Mis mensajes */
'use strict';

/* ───── Cobros ───── */
/** Aviso de fechas de pago próximas que caen en domingo o festivo. */
function avisoCalendario(hoy = new Date()) {
  const porFecha = new Map();
  for (const c of clientes()) {
    const e = estadoDe(c, hoy);
    if (e.tipo !== 'futuro' || e.dias > 10 || c.recordar === 'nunca') continue;
    if (horarioLegal(e.fecha)) continue;
    const k = isoDia(e.fecha); const x = porFecha.get(k) || { n: 0, total: 0, d: e.fecha }; x.n++; x.total += e.saldo; porFecha.set(k, x);
  }
  if (!porFecha.size) return '';
  const [, x] = [...porFecha.entries()].sort()[0];
  const bloqueados = []; let d = new Date(x.d);
  while (!horarioLegal(d) && bloqueados.length < 4) { bloqueados.push(d); d = sumarDias(d, 1); }
  const nombres = bloqueados.map(b => `${fechaCorta(b)}${nombreFestivo(b) ? ' (festivo)' : ''}`);
  const dias = nombres.length > 1 ? `el ${nombres.slice(0, -1).join(', ')} y el ${nombres[nombres.length - 1]}` : `el ${nombres[0]}`;
  const esQuincena = x.d.getDate() === 15 || x.d.getDate() === new Date(x.d.getFullYear(), x.d.getMonth() + 1, 0).getDate();
  const antes = diaLegalAnterior(x.d);
  return `<div class="info">${ic('calendario', 22)}<p><b>${esQuincena ? 'Quincena' : `Pagos del ${fechaCorta(x.d)}`} (${x.n} ${x.n === 1 ? 'cuenta' : 'cuentas'}, ${monto(x.total)}):</b> ${dias} la ley no permite recordar. Si alguien se atrasa, Fiao se lo propone el ${punto(fechaLarga(d))}${diasEntre(hoy, antes) >= 0 ? ` Quien pidió recordatorio el día de pago lo recibe el ${punto(fechaCorta(antes) + (antes.getDay() === 6 ? ', antes de las 3:00 p. m' : ''))}` : ''}</p></div>`;
}
function accionCobro(c, e, ahora) {
  if (!c.cel) return `<span class="ayuda" style="flex-shrink:0">Sin celular</span>`;
  if (!permisoOk(c)) return `<a class="btn-mini sec" style="display:inline-flex;align-items:center;text-decoration:none" href="#permiso-${c.id}">Pedir permiso</a>`;
  const r = recordadoHoy(c.id, ahora);
  if (r) return `<span class="estado ok" style="flex-shrink:0">${ic('ok', 18, 2.6)}${hora(new Date(r.fecha))}</span>`;
  if (!necesitaRecordatorio(c, e)) return '';
  return `<button type="button" class="btn-mini${e.tipo === 'atrasado' ? '' : ' sec'}" data-recordar="${c.id}"${puedeRecordarAhora(ahora) ? '' : ' disabled aria-describedby="motivo-ley"'}>Recordar</button>`;
}
function razonHoy(c) {
  if (c.recordar === 'dia') return 'pidió recordatorio';
  const p = puntualidad(c);
  if (p.de >= 5 && p.a / p.de >= 0.85) return 'siempre cumple';
  if (c.recordar === 'nunca') return 'no se le recuerda';
  return 'se le recuerda si se atrasa';
}
V.cobros = () => {
  const ahora = new Date();
  const todos = clientes().map(c => ({ c, e: estadoDe(c, ahora) }));
  const atrasados = todos.filter(x => x.e.tipo === 'atrasado').sort((a, b) => b.e.dias - a.e.dias);
  const deHoy = todos.filter(x => x.e.tipo === 'hoy').sort((a, b) => b.e.saldo - a.e.saldo);
  const pend = resumenesPendientes();
  const primero = [...atrasados, ...deHoy].find(x => necesitaRecordatorio(x.c, x.e) && permisoOk(x.c) && !recordadoHoy(x.c.id, ahora));
  const fila = ({ c, e }, detalle) => `<li><div class="fila" style="min-height:4.5rem;padding-right:.75rem"><a href="#cliente-${c.id}" class="medio" style="text-decoration:none;color:inherit"><span class="nombre">${esc(c.nombre)}</span>${detalle}</a>${accionCobro(c, e, ahora)}</div></li>`;
  return {
    titulo: 'Cobros',
    html: `<div class="pantalla">${barra({ titulo: 'Cobros', sub: `${mayuscula(fechaCorta(ahora))} · ${horarioDeHoy(ahora)}` })}<main class="contenido" style="gap:.75rem">
      ${puedeRecordarAhora(ahora) ? '' : `<div class="info atencion" id="motivo-ley">${ic('reloj', 22)}<p>${motivoNoRecordar(ahora)} Los recordatorios esperan al próximo horario legal (Ley 2300).</p></div>`}
      ${atrasados.length ? `<section aria-labelledby="t-atr" style="display:flex;flex-direction:column;gap:.375rem"><h2 class="titulo-seccion" id="t-atr">Se pasaron de la fecha</h2>
        <ul class="lista atencion">${atrasados.map(x => fila(x, `<span class="estado atrasado">${ic('atencion', 16, 2.4)}${monto(x.e.saldo)} · ${x.e.dias} ${x.e.dias === 1 ? 'día' : 'días'} de atraso</span>`)).join('')}</ul></section>` : ''}
      ${deHoy.length ? `<section aria-labelledby="t-hoy" style="display:flex;flex-direction:column;gap:.375rem"><h2 class="titulo-seccion" id="t-hoy">Acordaron pagar hoy</h2>
        <ul class="lista">${deHoy.map(x => fila(x, `<span class="estado">${monto(x.e.saldo)} · ${razonHoy(x.c)}</span>`)).join('')}</ul></section>` : ''}
      ${!atrasados.length && !deHoy.length ? `<div class="tarjeta" style="align-items:center;text-align:center;padding:1.5rem 1rem">${ic('ok', 32, 2.4)}<p><b>Hoy no hay cobros pendientes.</b></p><p class="ayuda">Aquí aparecen quienes se atrasen o acordaron pagar hoy.</p></div>` : ''}
      ${avisoCalendario(ahora)}
      ${pend.length ? `<a class="fila tarjeta" style="flex-direction:row;border-radius:.875rem" href="#resumenes"><span class="medio"><span><b>Resúmenes semanales por enviar</b> · ${pend.length}</span></span>${ic('sigue', 22, 2.2)}</a>` : ''}
      ${primero ? `<section aria-labelledby="t-vista" style="display:flex;flex-direction:column;gap:.375rem"><h2 class="titulo-seccion suave" id="t-vista">Lo que le llegará a ${esc(nombreCorto(primero.c.nombre))}</h2>
        <div class="burbuja" style="font-size:1rem;line-height:1.375rem">${esc(mensajeRecordatorio(primero.c, primero.e))}</div><a class="btn-link izq" href="#mensajes">Editar mensaje</a></section>` : ''}
    </main><div class="abajo">${nav('cobros')}</div></div>`,
    montar(r) {
      r.addEventListener('click', async ev => {
        const b = ev.target.closest('[data-recordar]'); if (!b || b.disabled) return;
        const c = cliente(b.dataset.recordar); const e = estadoDe(c);
        if (!puedeRecordarAhora()) { avisar(motivoNoRecordar()); return; }
        if (recordadoHoy(c.id)) { avisar('A este cliente ya se le recordó hoy'); return; }
        abrirWhatsApp(c.cel, mensajeRecordatorio(c, e));
        await registrarContacto(c.id, 'recordatorio');
        avisar(`Abrimos WhatsApp con el recordatorio para ${nombreCorto(c.nombre)}`); mostrarRuta();
      });
    }
  };
};

/* ───── Resúmenes semanales por enviar ───── */
V.resumenes = () => {
  const pend = resumenesPendientes();
  return {
    titulo: 'Resúmenes por enviar',
    html: `<div class="pantalla">${barra({ titulo: 'Resúmenes por enviar', volver: 'cobros' })}<main class="contenido">
      <p>Estos clientes prefieren un resumen a la semana en lugar de un recibo por cada cosa. Es un recibo, no un cobro.</p>
      ${pend.length ? `<ul class="lista">${pend.map(({ c, nuevos }) => `<li><div class="fila"><span class="medio"><span class="nombre">${esc(c.nombre)}</span><span class="detalle">${nuevos.length} ${nuevos.length === 1 ? 'movimiento nuevo' : 'movimientos nuevos'} · va en ${pesos(saldoDe(c.id))}</span></span><button type="button" class="btn-mini" data-resumen="${c.id}">Enviar</button></div></li>`).join('')}</ul>`
        : `<div class="tarjeta" style="align-items:center;text-align:center">${ic('ok', 32, 2.4)}<p><b>No hay resúmenes pendientes.</b></p></div>`}
    </main></div>`,
    montar(r) {
      r.addEventListener('click', async ev => {
        const b = ev.target.closest('[data-resumen]'); if (!b) return;
        const x = resumenesPendientes().find(p => p.c.id === b.dataset.resumen); if (!x) return;
        abrirWhatsApp(x.c.cel, mensajeResumen(x.c, x.nuevos));
        await registrarContacto(x.c.id, 'resumen'); avisar('Abrimos WhatsApp con el resumen'); mostrarRuta();
      });
    }
  };
};

/* ───── Resumen del mes ───── */
V.resumen = mesParam => {
  if (/^\d{6}$/.test(mesParam || '')) mesParam = `${mesParam.slice(0, 4)}-${mesParam.slice(4)}`;
  const meses = mesesConDatos();
  const mesSel = meses.includes(mesParam) ? mesParam : meses[0];
  const [y, mm] = mesSel.split('-').map(Number);
  const res = resumenDelMes(y, mm - 1);
  const top = quienesDebenMas(4); const max = top[0]?.s || 1;
  const revisar = aQuienRevisar().slice(0, 4);
  const sinDeuda = clientes().filter(c => saldoDe(c.id) <= 0).length;
  const esActual = mesSel === isoDia().slice(0, 7);
  const sel = `<label for="r-mes" class="vh">Mes</label><select id="r-mes" class="chip" style="margin-right:.5rem;appearance:auto">${meses.map(k => { const [a, b] = k.split('-').map(Number); return `<option value="${k}"${k === mesSel ? ' selected' : ''}>${mayuscula(MESES[b - 1])} ${a}</option>`; }).join('')}</select>`;
  return {
    titulo: 'Resumen',
    html: `<div class="pantalla">${barra({ titulo: 'Resumen', sub: `${mayuscula(MESES[mm - 1])}${esActual ? ', hasta hoy' : ` ${y}`}`, derecha: sel })}<main class="contenido" style="gap:.75rem">
      <div class="kpis"><div class="kpi principal"><span>En la calle</span><b>${monto(totalEnLaCalle())}</b></div><div class="kpi azul"><span>Recuperado</span><b>${monto(res.recuperado)}</b></div>
        <div class="kpi"><span>Fiado nuevo</span><b>${monto(res.fiado)}</b></div><div class="kpi"><span>No deben nada</span><b>${sinDeuda} de ${Datos.clientes.size}</b></div></div>
      <section class="tarjeta" aria-labelledby="t-mas"><h2 class="titulo-seccion" id="t-mas">Quién debe más</h2>
        ${top.length ? top.map(x => `<div class="dato"><span class="par"><a href="#cliente-${x.c.id}" style="color:inherit">${esc(x.c.nombre)}</a><b>${monto(x.s)}</b></span><div class="barra-dato" aria-hidden="true"><span style="width:${Math.max(4, x.s / max * 100)}%"></span></div></div>`).join('') : '<p class="ayuda">Nadie le debe. ¡Libreta al día!</p>'}</section>
      <section aria-labelledby="t-rev" style="display:flex;flex-direction:column;gap:.375rem"><h2 class="titulo-seccion" id="t-rev">A quién revisar</h2>
        ${revisar.length ? `<ul class="lista">${revisar.map(x => `<li><a class="fila" href="#${x.tipo === 'atrasado' ? 'cobros' : `cliente-${x.c.id}`}"><span style="color:${x.tipo === 'atrasado' ? 'var(--naranja)' : x.tipo === 'cupo' ? 'var(--azul)' : 'var(--gris)'}">${ic(x.tipo === 'atrasado' ? 'atencion' : x.tipo === 'cupo' ? 'grafica' : 'reloj', 22, 2.2)}</span><span class="medio"><span class="nombre" style="font-size:1.0625rem">${esc(x.titulo)}</span><span class="detalle">${Vista.oculto ? 'Toque para ver' : esc(x.detalle)}</span></span>${ic('sigue', 20, 2.2)}</a></li>`).join('')}</ul>`
          : '<p class="ayuda">Nadie atrasado, cerca del cupo ni perdido. Todo en orden.</p>'}</section>
    </main><div class="abajo">${nav('resumen')}</div></div>`,
    montar(r) { r.querySelector('#r-mes').addEventListener('change', ev => ir(`resumen-${ev.target.value.replace('-', '')}`)); }
  };
};

/* ───── Ajustes ───── */
async function guardarCopia() {
  const datos = JSON.stringify(exportarLibreta(), null, 1);
  const hoy = new Date();
  const nombre = `fiao-copia-${hoy.getDate()}-${MESES_CORTOS[hoy.getMonth()].replace('.', '')}-${hoy.getFullYear()}.fiao`;
  const archivo = new File([datos], nombre, { type: 'application/json' });
  let ok = false;
  try {
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) { await navigator.share({ files: [archivo], title: 'Copia de Fiao', text: 'Copia de respaldo de mi libreta de Fiao' }); ok = true; }
  } catch (e) { if (e.name === 'AbortError') return false; }
  if (!ok) {
    const url = URL.createObjectURL(archivo);
    const a = Object.assign(document.createElement('a'), { href: url, download: nombre });
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); ok = true;
  }
  const t = tienda(); t.ultimaCopia = hoy.toISOString(); await guardarTienda(t);
  avisar('Copia guardada. Envíesela a su WhatsApp o a Drive.');
  return true;
}
V.ajustes = () => {
  const t = tienda(); const dc = diasDesdeCopia(); const inst = puedeInstalar();
  const letra = t.letra || 'normal';
  return {
    titulo: 'Ajustes',
    html: `<div class="pantalla">${barra({ titulo: 'Ajustes', volver: 'inicio' })}<main class="contenido" style="gap:.625rem">
      <section class="tarjeta" aria-labelledby="t-letra"><h2 class="titulo-seccion" id="t-letra">Tamaño de la letra</h2>
        <div class="fila-botones" style="flex-wrap:wrap" role="radiogroup" aria-labelledby="t-letra" data-grupo="letra">
          ${[['normal', 'Normal', '1rem'], ['grande', 'Grande', '1.1875rem'], ['mas', 'Más grande', '1.25rem']].map(([k, n, f]) => `<button type="button" class="chip" role="radio" aria-checked="${k === letra}" data-valor="${k}" style="justify-content:center;border-radius:.875rem;font-size:${f};padding:0 .5rem${k === 'mas' ? ';flex:1.4 1 auto' : ';flex:1 1 auto'}">${n}</button>`).join('')}</div></section>
      <section class="tarjeta" style="padding-block:.5rem"><div style="display:flex;align-items:center;gap:.75rem"><span style="flex:1;display:flex;flex-direction:column"><b id="t-ocultar">Ocultar montos al abrir</b><span class="ayuda">Para cuando hay gente en el mostrador</span></span>
        <button type="button" class="interruptor" role="switch" aria-checked="${!!t.ocultarAlAbrir}" aria-labelledby="t-ocultar" data-accion="ocultar-al-abrir"><span class="pista"><span class="bola"></span></span></button></div></section>
      <section class="tarjeta" aria-labelledby="t-tono"><h2 class="titulo-seccion" id="t-tono">Cómo suenan sus mensajes</h2>
        ${Object.entries(TONOS).map(([k, n]) => `<label class="check"><input type="radio" name="tono" value="${k}"${(t.tono || 'cercano') === k ? ' checked' : ''}>${n}</label>`).join('')}
        <a class="btn-link izq" href="#mensajes">${Object.keys(t.mensajes || {}).length ? 'Ver mis mensajes propios' : 'Escribir mis propios mensajes'}</a></section>
      <section class="tarjeta" aria-labelledby="t-copia"><h2 class="titulo-seccion" id="t-copia">Copia de respaldo</h2>
        ${dc === null ? `<span class="estado hoy">${ic('reloj', 16, 2.4)}Aún no ha guardado ninguna copia</span>` : dc >= 7 ? `<span class="estado hoy">${ic('reloj', 16, 2.4)}Última copia: hace ${dc} días</span>` : `<span class="estado ok">${ic('ok', 16, 2.6)}Última copia: ${dc === 0 ? 'hoy' : dc === 1 ? 'ayer' : `hace ${dc} días`}</span>`}
        <button type="button" class="btn-sec" data-accion="copia">${ic('descargar', 22, 2.2)}Guardar copia ahora</button>
        <span class="ayuda">Es un archivo: envíeselo a su propio WhatsApp o guárdelo en Drive. Le recomendamos una por semana.</span>
        <a class="btn-link izq" href="#restaurar">Recuperar desde una copia</a></section>
      ${inst ? `<button type="button" class="btn-sec" data-accion="instalar">${ic('celular', 22, 2.2)}Instalar Fiao en este celular</button>` : ''}
      <a class="fila tarjeta" style="flex-direction:row;padding:.5rem 1rem" href="#tienda"><span class="medio"><b>Tienda, quiénes atienden y pagos</b></span>${ic('sigue', 22, 2.2)}</a>
      <section class="tarjeta" aria-labelledby="t-priv"><h2 class="titulo-seccion" id="t-priv">Privacidad y aviso</h2>
        <p class="ayuda">Su libreta solo está en este celular${Datos.modo === 'memoria' ? ' (en este navegador no se puede guardar: use la copia de respaldo)' : ''}. Fiao no tiene servidor, no recibe dinero y no envía mensajes por su cuenta. Cada cliente acepta recibir mensajes (Ley 1581 de 2012) y los recordatorios se ofrecen en el horario de la Ley 2300 de 2023.</p>
        <p class="ayuda">Fiao es una versión de prueba, sin fines comerciales. Ayuda a llevar las cuentas, pero no es asesoría legal ni contable. Usted es responsable de los datos de sus clientes; guarde copias de respaldo.</p></section>
      <button type="button" class="btn-sec peligro" data-accion="borrar">Borrar la libreta de este celular</button>
      <p class="nota">Fiao · versión 1.0</p>
    </main></div>`,
    montar(r) {
      activarGrupos(r, async (g, v) => { if (g === 'letra') { t.letra = v; await guardarTienda(t); aplicarPreferencias(); avisar('Tamaño de letra cambiado'); } });
      r.querySelector('[data-accion="ocultar-al-abrir"]').addEventListener('click', async ev => {
        t.ocultarAlAbrir = !t.ocultarAlAbrir; ev.currentTarget.setAttribute('aria-checked', t.ocultarAlAbrir); await guardarTienda(t);
      });
      r.querySelectorAll('input[name="tono"]').forEach(i => i.addEventListener('change', async () => { t.tono = i.value; await guardarTienda(t); avisar(`Tono: ${TONOS[i.value]}`); }));
      r.querySelector('[data-accion="copia"]').addEventListener('click', async () => { if (await guardarCopia()) mostrarRuta(); });
      r.querySelector('[data-accion="instalar"]')?.addEventListener('click', instalar);
      r.querySelector('[data-accion="borrar"]').addEventListener('click', async () => {
        const si = await confirmar({ titulo: '¿Borrar toda la libreta?', texto: 'Se borran todos los clientes y anotaciones de este celular. Si no tiene una copia de respaldo, no se pueden recuperar.', si: 'Sí, borrar todo', peligro: true });
        if (si) { await borrarLibreta(); aplicarPreferencias(); ir('bienvenida'); }
      });
    }
  };
};

/* ───── Mis mensajes ───── */
V.mensajes = () => {
  const t = tienda(); const base = PLANTILLAS[t.tono || 'cercano'];
  return {
    titulo: 'Mis mensajes',
    html: `<div class="pantalla">${barra({ titulo: 'Mis mensajes', volver: 'ajustes' })}<main class="contenido"><form style="display:flex;flex-direction:column;gap:inherit" id="form-msj" novalidate>
      <div class="info">${ic('lapiz', 22)}<p>Escríbalos como usted habla. Las palabras entre llaves se llenan solas: <b>{nombre}</b>, <b>{monto}</b>, <b>{saldo}</b>, <b>{fecha}</b>, <b>{tienda}</b>, <b>{enlace}</b>. No borre <b>{enlace}</b>: es donde el vecino ve su cuenta.</p></div>
      ${Object.entries(TIPOS_MENSAJE).map(([k, n]) => `<div class="campo"><label for="m-${k}">${n}</label><textarea class="entrada" id="m-${k}" data-clave="${k}" rows="4">${esc((t.mensajes || {})[k] || base[k])}</textarea><button type="button" class="btn-link izq" data-original="${k}" style="font-size:1rem;min-height:2.75rem">Volver al original</button></div>`).join('')}
    </form></main><div class="pie" role="region" aria-label="Acciones"><button type="submit" form="form-msj" class="btn">Guardar mis mensajes</button></div></div>`,
    montar(r) {
      r.addEventListener('click', ev => { const b = ev.target.closest('[data-original]'); if (b) { r.querySelector(`#m-${b.dataset.original}`).value = base[b.dataset.original]; avisar('Volvió al mensaje original'); } });
      r.querySelector('#form-msj').addEventListener('submit', async ev => {
        ev.preventDefault();
        const propios = {};
        r.querySelectorAll('[data-clave]').forEach(a => { const v = a.value.trim(); if (v && v !== base[a.dataset.clave]) propios[a.dataset.clave] = v; });
        t.mensajes = propios; await guardarTienda(t); avisar('Mensajes guardados'); ir('ajustes');
      });
    }
  };
};
