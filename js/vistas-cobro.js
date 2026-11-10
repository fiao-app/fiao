/* Fiao · cobrar sin pena y controlar la libreta:
   Cobros · Resúmenes por enviar · Resumen del mes · Ajustes · Mis mensajes */
'use strict';

/* ───── Cobros ───── */
/** Nota corta cuando una fecha de pago cercana cae en domingo o festivo. */
function avisoCalendario(hoy = new Date()) {
  const porFecha = new Map();
  for (const c of clientes()) {
    const e = estadoDe(c, hoy);
    if (e.tipo !== 'futuro' || e.dias > 10 || c.recordar === 'nunca') continue;
    if (horarioLegal(e.fecha)) continue;
    const k = isoDia(e.fecha); const x = porFecha.get(k) || { n: 0, d: e.fecha }; x.n++; porFecha.set(k, x);
  }
  if (!porFecha.size) return '';
  const [, x] = [...porFecha.entries()].sort()[0];
  const dia = x.d.getDay() === 0 ? `el ${fechaCorta(x.d)}` : `el ${fechaCorta(x.d)}, que es festivo`;
  return `<div class="info">${ic('calendario', 22)}<p>${x.n} ${x.n === 1 ? 'cuenta vence' : 'cuentas vencen'} ${dia}. Ese día no se puede recordar. Si alguien se atrasa, podrá recordarle ${elDia(proximoDiaLegal(x.d))}. ${porQue('horario')}</p></div>`;
}
function accionCobro(c, e, ahora) {
  if (!c.cel) return `<span class="ayuda" style="flex-shrink:0">Sin celular</span>`;
  if (!permisoOk(c)) return `<button type="button" class="btn-mini sec" data-permiso="${c.id}">Pedir permiso</button>`;
  const r = recordadoHoy(c.id, ahora);
  if (r) return `<span class="estado ok" style="flex-shrink:0">${ic('ok', 18, 2.6)}Recordado</span>`;
  if (!necesitaRecordatorio(c, e)) return '';
  return `<button type="button" class="btn-mini${e.tipo === 'atrasado' ? '' : ' sec'}" data-recordar="${c.id}"${puedeRecordarAhora(ahora) ? '' : ' disabled aria-describedby="motivo-ley"'}>${ic('chat', 18, 2.2)}Recordar</button>`;
}
function razonHoy(c) {
  if (c.recordar === 'dia') return 'pidió que le recordaran';
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
  const fila = ({ c, e }, detalle) => `<li><div class="fila" style="padding-right:.75rem"><a href="#cliente-${c.id}" class="medio" style="text-decoration:none;color:inherit;min-height:3rem;justify-content:center"><span class="nombre">${esc(c.nombre)}</span>${detalle}</a>${accionCobro(c, e, ahora)}</div></li>`;
  const sub = puedeRecordarAhora(ahora) ? `Puede recordar hasta las ${horarioLegal(ahora).hasta - 12}:00 p. m.` : '';
  const porCobrar = [...atrasados, ...deHoy];
  const cuerpo = porCobrar.length ? `<section class="cifra-cab" aria-labelledby="t-porcobrar"><span class="rotulo" id="t-porcobrar">Por cobrar hoy</span><span class="cifra">${monto(porCobrar.reduce((t, x) => t + x.e.saldo, 0))}</span>
    <span class="extra"><span>${porCobrar.length} ${porCobrar.length === 1 ? 'persona' : 'personas'}</span>${atrasados.length ? `<span><b>${atrasados.length}</b> ${atrasados.length === 1 ? 'atrasada' : 'atrasadas'}</span>` : ''}</span></section>` : '';
  return {
    titulo: 'Cobros',
    html: `<div class="pantalla">${cabMarca({ titulo: 'Cobros', sub, cuerpo })}<main class="contenido" style="gap:.875rem">
      ${consejo('cobros', 'Aquí salen quienes deben pagar. Fiao respeta el horario de la ley.')}
      ${puedeRecordarAhora(ahora) ? '' : `<div class="info atencion" id="motivo-ley">${ic('reloj', 22)}<p>${motivoNoRecordar(ahora)} ${porQue('horario')}</p></div>`}
      ${atrasados.length ? `<section aria-labelledby="t-atr" style="display:flex;flex-direction:column;gap:.375rem"><h2 class="titulo-seccion" id="t-atr">Se atrasaron</h2>
        <ul class="lista atencion">${atrasados.map(x => fila(x, `<span class="estado atrasado">${monto(x.e.saldo)} · ${x.e.dias} ${x.e.dias === 1 ? 'día' : 'días'}</span>`)).join('')}</ul></section>` : ''}
      ${deHoy.length ? `<section aria-labelledby="t-hoy" style="display:flex;flex-direction:column;gap:.375rem"><h2 class="titulo-seccion" id="t-hoy">Pagan hoy</h2>
        <ul class="lista">${deHoy.map(x => fila(x, `<span class="estado">${monto(x.e.saldo)} · ${razonHoy(x.c)}</span>`)).join('')}</ul></section>` : ''}
      ${!atrasados.length && !deHoy.length ? `<div class="tarjeta" style="align-items:center;text-align:center;padding:1.5rem 1rem">${selloOk(40)}<p style="font-size:1.25rem"><b>Hoy no hay cobros.</b></p><p class="ayuda">Aquí salen los atrasados y los que pagan hoy.</p></div>` : ''}
      ${avisoCalendario(ahora)}
      ${pend.length ? `<a class="fila tarjeta" style="flex-direction:row" href="#resumenes"><span class="medio"><span class="nombre">Resúmenes por enviar</span><span class="detalle">${pend.length} ${pend.length === 1 ? 'cliente' : 'clientes'}</span></span>${ic('sigue', 22, 2.2)}</a>` : ''}
      ${primero ? `<details class="mas"><summary>${ic('chat', 22)}Ver el mensaje que le llega</summary><div class="interior"><div class="burbuja" style="font-size:1rem;line-height:1.4">${esc(mensajeRecordatorio(primero.c, primero.e))}</div><a class="btn-link izq" href="#mensajes">Cambiar mis mensajes</a></div></details>` : ''}
    </main><div class="abajo">${nav('cobros')}</div></div>`,
    montar(r) {
      r.firstElementChild.addEventListener('click', async ev => {
        const p = ev.target.closest('[data-permiso]'); if (p) { abrirPermiso(cliente(p.dataset.permiso)); return; }
        const b = ev.target.closest('[data-recordar]'); if (!b || b.disabled) return;
        const c = cliente(b.dataset.recordar); const e = estadoDe(c);
        if (!puedeRecordarAhora()) { avisar(motivoNoRecordar(), { icono: 'reloj' }); return; }
        if (recordadoHoy(c.id)) { avisar('Ya se le recordó hoy. La ley permite uno al día.', { icono: 'reloj' }); return; }
        abrirWhatsApp(c.cel, mensajeRecordatorio(c, e));
        await registrarContacto(c.id, 'recordatorio');
        mostrarRuta({ animar: false }); avisar(`Abrimos WhatsApp con el recordatorio para ${nombreCorto(c.nombre)}.`);
      });
    }
  };
};

/* ───── Resúmenes semanales por enviar ───── */
V.resumenes = () => {
  const pend = resumenesPendientes();
  return {
    titulo: 'Resúmenes por enviar',
    html: `<div class="pantalla">${barra({ titulo: 'Resúmenes por enviar', volver: 'cobros', ayuda: false })}<main class="contenido">
      <p>Estos vecinos prefieren un resumen por semana. Es un recibo, no un cobro.</p>
      ${pend.length ? `<ul class="lista">${pend.map(({ c, nuevos }) => `<li><div class="fila"><span class="medio"><span class="nombre">${esc(c.nombre)}</span><span class="detalle">${nuevos.length} ${nuevos.length === 1 ? 'novedad' : 'novedades'} · va en ${monto(saldoDe(c.id))}</span></span><button type="button" class="btn-mini" data-resumen="${c.id}">Enviar</button></div></li>`).join('')}</ul>`
        : `<div class="tarjeta" style="align-items:center;text-align:center">${selloOk(40)}<p><b>No hay resúmenes pendientes.</b></p></div>`}
    </main></div>`,
    montar(r) {
      r.firstElementChild.addEventListener('click', async ev => {
        const b = ev.target.closest('[data-resumen]'); if (!b) return;
        const x = resumenesPendientes().find(p => p.c.id === b.dataset.resumen); if (!x) return;
        abrirWhatsApp(x.c.cel, mensajeResumen(x.c, x.nuevos));
        await registrarContacto(x.c.id, 'resumen'); mostrarRuta({ animar: false }); avisar('Abrimos WhatsApp con el resumen.');
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
  /* «Al día» = sin pagos vencidos, aunque deba (así se dice en el barrio). */
  const nCli = Datos.clientes.size, alDia = clientes().filter(c => estadoDe(c).tipo !== 'atrasado').length;
  const esActual = mesSel === isoDia().slice(0, 7);
  const total = totalEnLaCalle();
  const cuerpo = `<section class="cifra-cab" aria-labelledby="t-calle-r"><span class="rotulo" id="t-calle-r">En la calle</span><span class="cifra" id="k-calle">${monto(total)}</span>
    <span class="extra"><span><b>${alDia} de ${nCli}</b> ${nCli === 1 ? 'cliente está' : 'clientes están'} al día</span></span></section>`;
  return {
    titulo: 'Resumen',
    html: `<div class="pantalla">${cabMarca({ titulo: 'Resumen', sub: `${mayuscula(MESES[mm - 1])}${esActual ? ', hasta hoy' : ` de ${y}`}`, cuerpo })}<main class="contenido" style="gap:.875rem">
      ${consejo('resumen', 'Aquí ve cuánto le deben, cuánto recuperó y a quién revisar.')}
      ${meses.length > 1 ? `<div class="campo"><label for="r-mes" class="vh">Mes</label><select id="r-mes" class="entrada" style="appearance:auto">${meses.map(k => { const [a, b] = k.split('-').map(Number); return `<option value="${k}"${k === mesSel ? ' selected' : ''}>${mayuscula(MESES[b - 1])} de ${a}</option>`; }).join('')}</select></div>` : ''}
      <div class="kpis"><div class="kpi verde"><span>Recuperó</span><b>${monto(res.recuperado)}</b></div><div class="kpi"><span>Fió</span><b>${monto(res.fiado)}</b></div></div>
      ${top.length === 1 ? `<section class="tarjeta" aria-labelledby="t-mas"><h2 class="titulo-seccion" id="t-mas">Quién le debe</h2><a class="dato" href="#cliente-${top[0].c.id}"><span class="par"><span class="nombre-dato">${esc(top[0].c.nombre)}</span><b>${monto(top[0].s)}</b></span></a><p class="ayuda">Cuando le deban varios, aquí verá quién debe más.</p></section>` : `<section class="tarjeta" aria-labelledby="t-mas"><h2 class="titulo-seccion" id="t-mas">Quién debe más</h2>
        ${top.length ? top.map(x => `<a class="dato" href="#cliente-${x.c.id}"><span class="par"><span class="nombre-dato">${esc(x.c.nombre)}</span><b>${monto(x.s)}</b></span><span class="barra-dato" aria-hidden="true"><span style="width:${Math.max(4, x.s / max * 100)}%"></span></span></a>`).join('') : '<p class="ayuda">Nadie le debe. ¡Libreta al día!</p>'}</section>`}
      <section aria-labelledby="t-rev" style="display:flex;flex-direction:column;gap:.375rem"><h2 class="titulo-seccion" id="t-rev">A quién revisar</h2>
        ${revisar.length ? `<ul class="lista">${revisar.map(x => `<li><a class="fila" href="#cliente-${x.c.id}"><span class="ic-caja" style="color:${x.tipo === 'atrasado' ? 'var(--alerta)' : x.tipo === 'cupo' ? 'var(--azul-osc)' : 'var(--gris)'}">${ic(x.tipo === 'atrasado' ? 'atencion' : x.tipo === 'cupo' ? 'grafica' : 'reloj', 22, 2.2)}</span><span class="medio"><span class="nombre" style="font-size:1.0625rem">${esc(x.titulo)}</span><span class="detalle">${Vista.oculto ? 'Toque para ver' : esc(x.detalle)}</span></span>${ic('sigue', 20, 2.2)}</a></li>`).join('')}</ul>`
          : '<p class="ayuda">Todo en orden: nadie atrasado ni cerca del cupo.</p>'}</section>
    </main><div class="abajo">${nav('resumen')}</div></div>`,
    montar(r) {
      r.querySelector('#r-mes')?.addEventListener('change', ev => ir(`resumen-${ev.target.value.replace('-', '')}`));
      contar(r.querySelector('#k-calle'), 0, total);
    }
  };
};

/* ───── Copia de respaldo ───── */
async function guardarCopia() {
  const datos = JSON.stringify(exportarLibreta(), null, 1);
  const hoy = new Date();
  const nombre = `fiao-copia-${hoy.getDate()}-${MESES[hoy.getMonth()]}-${hoy.getFullYear()}.fiao`;
  const archivo = new File([datos], nombre, { type: 'application/json' });
  let ok = false;
  try {
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) { await navigator.share({ files: [archivo], title: 'Copia de Fiao', text: 'Copia de respaldo de mi libreta de Fiao' }); ok = true; }
  } catch (e) { if (e.name === 'AbortError') return false; }
  if (!ok) {
    const url = URL.createObjectURL(archivo);
    const a = Object.assign(document.createElement('a'), { href: url, download: nombre });
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  const t = tienda(); t.ultimaCopia = hoy.toISOString(); await guardarTienda(t);
  avisar('Copia guardada. Mándela a su WhatsApp o a Drive.');
  return true;
}

/* ───── Ajustes ───── */
const TONOS_CORTOS = { cercano: 'Cercano', formal: 'Formal', breve: 'Breve' };
function ejemploMensaje(tono) {
  const t = tienda();
  return _llenar(PLANTILLAS[tono].fiado, { nombre: 'Doña Nubia', monto: '$5.000', fecha: fechaLarga(new Date()), que: ' (pan y leche)', saldo: '$23.000', enlace: 'https://enlace', tienda: t.nombre || 'la tienda', laTienda: 'la tienda', saludo: 'Buenos días' });
}
V.ajustes = () => {
  const t = tienda(); const dc = diasDesdeCopia(); const inst = puedeInstalar();
  const letra = t.letra || 'normal', tono = t.tono || 'cercano';
  const tema = document.documentElement.dataset.tema || 'color', mov = document.documentElement.dataset.movimiento || 'completo';
  /** Grupo de opciones con su rótulo; opciones: [valor, texto, estilo]. */
  const segmento = (g, rotulo, ayuda, opciones, actual) => `<div class="grupo-ajuste"><span class="leyenda" id="r-${g}">${rotulo}</span>
    <div class="segmento" role="radiogroup" aria-labelledby="r-${g}"${ayuda ? ` aria-describedby="d-${g}"` : ''} data-grupo="${g}">${opciones.map(([k, n, st]) => `<button type="button" role="radio" aria-checked="${k === actual}" data-valor="${k}"${st ? ` style="${st}"` : ''}>${n}</button>`).join('')}</div>
    ${ayuda ? `<span class="ayuda" id="d-${g}">${ayuda}</span>` : ''}</div>`;
  const interruptor = (clave, titulo, ayuda, valor) => `<div class="ajuste"><span><b id="a-${clave}">${titulo}</b>${ayuda ? `<span class="ayuda">${ayuda}</span>` : ''}</span><button type="button" class="interruptor" role="switch" aria-checked="${!!valor}" aria-labelledby="a-${clave}" data-interruptor="${clave}"><span class="pista"><span class="bola"></span></span></button></div>`;
  const enlace = (href, icono, texto, accion = '') => `<li>${accion ? `<button type="button" class="fila" data-accion="${accion}">` : `<a class="fila" href="#${href}">`}<span class="ic-caja" style="width:2.5rem;height:2.5rem;border-radius:50%;background:var(--azul-fondo);color:var(--azul-osc)">${ic(icono, 22, 2.2)}</span><span class="medio"><span class="nombre" style="font-size:1.0625rem">${texto}</span></span>${ic('sigue', 22, 2.2)}${accion ? '</button>' : '</a>'}</li>`;
  return {
    titulo: 'Ajustes',
    html: `<div class="pantalla">${cabMarca({ titulo: 'Ajustes' })}<main class="contenido" style="gap:.875rem">
      <section class="tarjeta" aria-labelledby="t-pantalla"><h2 class="titulo-seccion" id="t-pantalla">Pantalla y sonido</h2>
        ${segmento('letra', 'Tamaño de la letra', '', [['normal', 'Normal', 'font-size:1rem'], ['grande', 'Grande', 'font-size:1.125rem'], ['mas', 'Más grande', 'font-size:1.25rem']], letra)}
        ${segmento('tema', 'Apariencia', 'Tinta: azul, negro y blanco, como un cuaderno. Se lee mejor al sol.', [['color', `<span class="muestra color" aria-hidden="true"></span>Color`], ['tinta', `<span class="muestra tinta" aria-hidden="true"></span>Tinta`]], tema)}
        ${segmento('movimiento', 'Movimiento', 'Reducido: las pantallas cambian sin animaciones.', [['completo', 'Completo'], ['reducido', 'Reducido']], mov)}
        ${interruptor('ocultar', 'Ocultar montos al abrir', 'Para cuando hay gente en el mostrador', t.ocultarAlAbrir)}
        ${interruptor('voz', 'Voz de Fiao', 'Una frase corta después de cada acción', t.voz !== false)}</section>
      <section class="tarjeta" aria-labelledby="t-tono"><h2 class="titulo-seccion" id="t-tono">Cómo suenan sus mensajes</h2>
        <div class="segmento" role="radiogroup" aria-labelledby="t-tono" data-grupo="tono">${Object.entries(TONOS_CORTOS).map(([k, n]) => `<button type="button" role="radio" aria-checked="${k === tono}" data-valor="${k}">${n}</button>`).join('')}</div>
        <div class="burbuja" id="a-ejemplo" style="font-size:1rem;line-height:1.45" aria-live="polite">${vistaMensaje(ejemploMensaje(tono))}</div>
        <a class="btn-link izq" href="#mensajes">${Object.keys(t.mensajes || {}).length ? 'Ver mis mensajes propios' : 'Escribir mis propios mensajes'}</a></section>
      <section class="tarjeta" aria-labelledby="t-copia"><h2 class="titulo-seccion" id="t-copia">Copia de respaldo</h2>
        ${dc === null ? `<span class="estado hoy">${ic('reloj', 16, 2.4)}Aún no ha guardado una copia</span>` : dc >= 7 ? `<span class="estado hoy">${ic('reloj', 16, 2.4)}Última copia: hace ${dc} días</span>` : `<span class="estado ok">${ic('ok', 16, 2.6)}Última copia: ${dc === 0 ? 'hoy' : dc === 1 ? 'ayer' : `hace ${dc} días`}</span>`}
        <button type="button" class="btn-sec" data-accion="copia">${ic('descargar', 22, 2.2)}Guardar copia ahora</button>
        <p class="ayuda" style="display:flex;flex-wrap:wrap;align-items:center;gap:0 .25rem">Una por semana es lo ideal. ${porQue('celular', '¿Por qué?')}</p></section>
      <ul class="lista">
        ${enlace('tienda', 'tienda', 'Su tienda y cómo le pagan')}
        ${enlace('guia', 'idea', 'Ver cómo funciona Fiao')}
        ${t.ocultarPasos ? enlace('', 'ok', 'Mostrar los primeros pasos', 'pasos') : ''}
        ${inst ? enlace('', 'celular', 'Instalar Fiao en este celular', 'instalar') : ''}
        ${enlace('restaurar', 'archivo', 'Recuperar desde una copia')}
      </ul>
      <details class="mas"><summary>${ic('escudo', 22)}Privacidad y aviso</summary><div class="interior">
        <p class="ayuda">Su libreta solo está en este celular${Datos.modo === 'memoria' ? ' (este navegador no deja guardar: use la copia de respaldo)' : ''}. Fiao no tiene servidor, no recibe dinero y no envía mensajes por su cuenta.</p>
        <p class="ayuda">Cada vecino acepta los mensajes (Ley 1581 de 2012). Los recordatorios siguen el horario de la Ley 2300 de 2023.</p>
        <p class="ayuda">Fiao es una versión de prueba, sin fines comerciales. No es asesoría legal ni contable. Usted responde por los datos de sus clientes.</p></div></details>
      <button type="button" class="btn-sec peligro" data-accion="borrar">Borrar la libreta de este celular</button>
      <p class="nota">Fiao · versión 3.2</p>
    </main><div class="abajo">${nav('ajustes')}</div></div>`,
    montar(r) {
      activarGrupos(r, async (g, v) => {
        if (g === 'letra') { t.letra = v; await guardarTienda(t); aplicarPreferencias(); }
        if (g === 'tema') { t.tema = v; delete t.contraste; await guardarTienda(t); aplicarPreferencias(); vibrar(10); }
        if (g === 'movimiento') { t.movimiento = v; await guardarTienda(t); aplicarPreferencias(); }
        if (g === 'tono') { t.tono = v; await guardarTienda(t); r.querySelector('#a-ejemplo').innerHTML = vistaMensaje(ejemploMensaje(v)); }
      });
      r.querySelectorAll('[data-interruptor]').forEach(b => b.addEventListener('click', async () => {
        const k = b.dataset.interruptor;
        if (k === 'voz') { t.voz = t.voz === false; b.setAttribute('aria-checked', t.voz); await guardarTienda(t); vibrar(10); if (t.voz) Voz.decir('cambios'); else Voz.callar(); return; }
        t.ocultarAlAbrir = !t.ocultarAlAbrir; b.setAttribute('aria-checked', t.ocultarAlAbrir); await guardarTienda(t); vibrar(10);
      }));
      r.querySelector('[data-accion="copia"]').addEventListener('click', async () => { if (await guardarCopia()) mostrarRuta({ animar: false }); });
      r.querySelector('[data-accion="instalar"]')?.addEventListener('click', instalar);
      r.querySelector('[data-accion="pasos"]')?.addEventListener('click', async () => { t.ocultarPasos = false; await guardarTienda(t); ir('inicio'); });
      r.querySelector('[data-accion="borrar"]').addEventListener('click', async () => {
        const si = await confirmar({ titulo: '¿Borrar toda la libreta?', texto: 'Se borran todos los clientes y anotaciones de este celular. Sin una copia, no se pueden recuperar.', si: 'Sí, borrar todo', peligro: true });
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
    html: `<div class="pantalla">${barra({ titulo: 'Mis mensajes', volver: 'ajustes', ayuda: false })}<main class="contenido"><form style="display:flex;flex-direction:column;gap:inherit" id="form-msj" novalidate>
      <div class="info">${ic('lapiz', 22)}<p>Escríbalos como usted habla. Lo que va entre llaves se llena solo: <b>{nombre}</b>, <b>{monto}</b>, <b>{saldo}</b>, <b>{fecha}</b>. Deje <b>{enlace}</b>: ahí el vecino ve su cuenta.</p></div>
      ${Object.entries(TIPOS_MENSAJE).map(([k, n]) => `<div class="campo"><label for="m-${k}">${n}</label><textarea class="entrada" id="m-${k}" data-clave="${k}" rows="4">${esc((t.mensajes || {})[k] || base[k])}</textarea><button type="button" class="btn-link izq" data-original="${k}" style="font-size:1rem;min-height:2.75rem">Volver al original</button></div>`).join('')}
    </form></main><div class="pie" role="region" aria-label="Acciones"><button type="submit" form="form-msj" class="btn">Guardar mis mensajes</button></div></div>`,
    montar(r) {
      r.firstElementChild.addEventListener('click', ev => { const b = ev.target.closest('[data-original]'); if (b) { r.querySelector(`#m-${b.dataset.original}`).value = base[b.dataset.original]; avisar('Volvió al mensaje original.', { icono: 'girar' }); } });
      r.querySelector('#form-msj').addEventListener('submit', async ev => {
        ev.preventDefault();
        const propios = {};
        r.querySelectorAll('[data-clave]').forEach(a => { const v = a.value.trim(); if (v && v !== base[a.dataset.clave]) propios[a.dataset.clave] = v; });
        t.mensajes = propios; await guardarTienda(t); ir('ajustes'); avisar('Mensajes guardados.');
      });
    }
  };
};
