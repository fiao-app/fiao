/* Fiao · el fiado y el pago, sin salir de la pantalla:
   Hoja "Anotar" (¿a quién? → ¿cuánto?) · Hoja "Pagó" · Aviso con Deshacer ·
   Recibo con permiso en el momento justo · Ficha del cliente · Mostrar · Corregir */
'use strict';

/** Teclas del teclado físico para el paso del monto (computador o teclado bluetooth). */
const Teclas = { fn: null };
document.addEventListener('keydown', ev => { if (Teclas.fn && hojaAbierta()) Teclas.fn(ev); });

function vistaMensaje(texto) { return esc(texto).replace(/https?:\/\/\S+/g, '<span class="enlace">enlace a su cuenta</span>'); }
function avatar(c) { return `<span class="avatar" aria-hidden="true">${esc(iniciales(c.nombre))}</span>`; }
function debeTexto(c) { const s = saldoDe(c.id); return s > 0 ? `Debe ${monto(s)}${c.cupo ? ` de ${pesos(c.cupo)}` : ''}` : 'No debe nada'; }
function teclado() {
  return `<div class="teclado" role="group" aria-label="Teclado del monto">${['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => `<button type="button" data-tecla="${d}">${d}</button>`).join('')}
    <button type="button" class="ceros" data-tecla="000" aria-label="Tres ceros">000</button><button type="button" data-tecla="0">0</button>
    <button type="button" class="borrar" data-tecla="borrar" aria-label="Borrar">${ic('borrar', 28)}</button></div>`;
}
/** Lógica común del teclado: devuelve el monto nuevo. */
function teclear(actual, t) {
  vibrar(8);
  if (t === 'borrar') return Math.floor(actual / 10);
  const s = String(actual || '') + t;
  return s.replace(/^0+/, '').length <= 8 ? (parseInt(s, 10) || 0) : actual;
}

/* ═════ Hoja "Anotar fiado" ═════ */
function abrirAnotar(c = null) {
  const est = { c, monto: 0, sumados: [], que: '', llevo: '', conLista: false, detalle: false };
  abrirHoja('', () => {}, { nombre: 'anotar' });
  if (c) pasoMonto(est); else if (Datos.clientes.size === 0) pasoNuevo(est, ''); else pasoCliente(est);
}
function emitir(paso) { document.dispatchEvent(new CustomEvent('fiao', { detail: { paso } })); }

function pasoCliente(est) {
  Teclas.fn = null;
  const tarjetas = frecuentes(6).map(c => `<button type="button" data-id="${c.id}">${avatar(c)}<span>${esc(nombreCorto(c.nombre))}</span></button>`).join('');
  const resultados = q => {
    const nq = normalizar(q);
    const r = clientes().filter(c => normalizar(c.nombre).includes(nq)).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')).slice(0, 8);
    return `${r.length ? `<ul class="lista">${r.map(c => `<li><button type="button" class="fila" data-id="${c.id}">${avatar(c)}<span class="medio"><span class="nombre">${esc(c.nombre)}</span><span class="detalle">${debeTexto(c)}</span></span></button></li>`).join('')}</ul>` : `<p class="vacio">Nadie se llama «${esc(q)}».</p>`}
      <button type="button" class="btn-sec" data-nuevo>${ic('mas', 22, 2.4)}Agregar a «${esc(q)}»</button>`;
  };
  pintarHoja(`${cabHoja('¿A quién le fía?')}
    <div class="buscador"><label for="h-buscar" class="vh">Buscar cliente</label>${ic('buscar', 24)}<input class="entrada" id="h-buscar" type="search" placeholder="Buscar por nombre" autocomplete="off" enterkeyhint="search"></div>
    <div id="h-res"><div class="frecuentes" aria-label="Clientes frecuentes" role="group">${tarjetas}</div></div>
    <button type="button" class="btn-link" data-nuevo>${ic('mas', 20, 2.4)}Cliente nuevo</button>`, d => {
    const b = d.querySelector('#h-buscar'), res = d.querySelector('#h-res');
    b.addEventListener('input', () => { res.innerHTML = b.value.trim() ? resultados(b.value.trim()) : `<div class="frecuentes" aria-label="Clientes frecuentes" role="group">${tarjetas}</div>`; });
    d.querySelector('.cuerpo').addEventListener('click', ev => {
      const x = ev.target.closest('[data-id]'); if (x) { est.c = cliente(x.dataset.id); pasoMonto(est); return; }
      if (ev.target.closest('[data-nuevo]')) pasoNuevo(est, b.value.trim());
    });
    b.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); const p = res.querySelector('[data-id]'); if (p) p.click(); } });
  });
  emitir('anotar-cliente');
}

function pasoNuevo(est, nombre) {
  Teclas.fn = null;
  const hayClientes = Datos.clientes.size > 0;
  const contactosApi = 'contacts' in navigator && 'ContactsManager' in window;
  pintarHoja(`${cabHoja(hayClientes ? 'Cliente nuevo' : '¿A quién le fía?')}
    <form id="h-nuevo" novalidate data-guia="cliente-nuevo" style="display:flex;flex-direction:column;gap:.875rem">
      <div class="campo"><label for="n-nombre">Nombre o apodo</label><input class="entrada" id="n-nombre" value="${esc(nombre)}" placeholder="Ej.: Rosiris, la de la esquina" autocomplete="off" enterkeyhint="next" aria-describedby="n-error"></div>
      <details class="mas"><summary>${ic('mas', 22, 2.4)}Celular y día de pago <span class="opcional">(opcional)</span></summary><div class="interior">
        <div class="campo"><label for="n-cel">Celular con WhatsApp</label><div class="con-prefijo"><span class="prefijo" aria-hidden="true">+57</span><input class="entrada" id="n-cel" type="tel" inputmode="tel" placeholder="10 números" autocomplete="off">${contactosApi ? `<button type="button" class="btn-cuadro" data-accion="contactos" aria-label="Elegir de mis contactos">${ic('contactos', 26)}</button>` : ''}</div></div>
        ${grupoOpciones('pago', '¿Cuándo suele pagar?', PREF_PAGO, 'quincena')}
      </div></details>
      <p class="error" id="n-error" role="alert" hidden></p>
      <button type="submit" class="btn">Seguir</button>
    </form>
    ${hayClientes ? '<button type="button" class="btn-link" data-accion="lista">Volver a la lista</button>' : ''}`, d => {
    const leer = activarGrupos(d);
    const inp = d.querySelector('#n-nombre'), cel = d.querySelector('#n-cel');
    setTimeout(() => inp.focus(), 280);
    d.querySelector('[data-accion="lista"]')?.addEventListener('click', () => pasoCliente(est));
    d.querySelector('[data-accion="contactos"]')?.addEventListener('click', async () => {
      try { const [ct] = await navigator.contacts.select(['name', 'tel'], { multiple: false }); if (!ct) return; if (ct.tel?.[0]) cel.value = celLegible(ct.tel[0].replace(/^\+?57/, '')); if (!inp.value && ct.name?.[0]) inp.value = ct.name[0]; } catch (e) { /* sin contactos */ }
    });
    d.querySelector('#h-nuevo').addEventListener('submit', async ev => {
      ev.preventDefault();
      const n = inp.value.trim(), celD = cel.value.replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, ''), err = d.querySelector('#n-error');
      const fallo = (msg, el) => { err.textContent = msg; err.hidden = false; el.setAttribute('aria-invalid', 'true'); if (el.closest('details')) el.closest('details').open = true; temblar(el); el.focus(); };
      if (!n) return fallo('Escriba el nombre o apodo.', inp);
      if (celD && (celD.length !== 10 || (!/^3/.test(celD) && !tienda().demo))) return fallo('El celular tiene 10 números y empieza por 3.', cel);
      const nc = { id: uid(), nombre: n, cel: celD, cupo: null, pago: leer('pago') || 'quincena', recibos: 'whatsapp', recordar: 'atraso', detalle: '', lista: null, permiso: { estado: 'ninguno', fecha: null }, proximaFecha: null, creado: new Date().toISOString() };
      await guardarCliente(nc);
      est.c = nc; pasoMonto(est);
    });
  });
  emitir('anotar-nuevo');
}

function pasoMonto(est) {
  const c = est.c, saldo = saldoDe(c.id), tope = c.cupo;
  const total = () => est.sumados.reduce((s, v) => s + v, 0) + est.monto;
  pintarHoja(`<div class="hoja-cab"><div class="cliente-elegido" style="flex:1;min-width:0">${avatar(c)}<span class="medio"><h2 tabindex="-1" style="font-size:1.1875rem;line-height:1.5rem">${esc(c.nombre)}</h2><span>${debeTexto(c)}</span></span></div>
      <button type="button" class="btn-link" data-accion="cambiar" style="min-height:3rem;font-size:1rem">Cambiar</button><button type="button" class="cerrar-hoja" data-cerrar aria-label="Cerrar">${ic('cerrar', 24, 2.4)}</button></div>
    <div data-guia="monto" style="display:flex;flex-direction:column;gap:.75rem">
      <div class="monto-anotar"><span class="vh" id="r-monto">Cuánto se llevó</span><output class="monto-grande" id="h-monto" aria-labelledby="r-monto" aria-live="polite">$0</output>
        <span class="suma" id="h-suma"></span><span class="pildora atencion" id="h-cupo" role="status" hidden></span></div>
      <div class="chips" style="justify-content:center">
        ${c.lista ? `<button type="button" class="chip" aria-pressed="${est.conLista}" data-accion="lista"><span class="ok">${ic('ok', 18, 2.6)}</span>${esc(c.lista.nombre || 'Lo de siempre')}</button>` : ''}
        <button type="button" class="chip" aria-pressed="false" data-accion="sumar">${ic('mas', 18, 2.6)}Sumar otro</button>
        <button type="button" class="chip" aria-pressed="${est.detalle}" aria-controls="h-detalle" data-accion="detalle">${ic('lapiz', 18, 2.2)}Detalle</button>
      </div>
      <div id="h-detalle" style="display:flex;flex-direction:column;gap:.625rem"${est.detalle ? '' : ' hidden'}>
        <div class="campo"><label for="h-que">¿Qué se llevó? <span class="opcional">(opcional)</span></label><input class="entrada" id="h-que" value="${esc(est.que)}" placeholder="Ej.: pan, leche y huevos" autocomplete="off"></div>
        <div class="campo"><label for="h-llevo">¿Quién lo llevó? <span class="opcional">(opcional)</span></label><input class="entrada" id="h-llevo" value="${esc(est.llevo)}" placeholder="Ej.: su hijo Daniel" autocomplete="off"></div>
      </div>
      ${teclado()}
      <button type="button" class="btn" id="h-anotar" disabled>Marque el monto</button>
    </div>`, d => {
    const out = d.querySelector('#h-monto'), suma = d.querySelector('#h-suma'), aviso = d.querySelector('#h-cupo'), btn = d.querySelector('#h-anotar');
    const que = d.querySelector('#h-que'), llevo = d.querySelector('#h-llevo');
    const pintar = () => {
      const tot = total();
      out.textContent = pesos(tot); out.classList.remove('salta'); void out.offsetWidth; out.classList.add('salta');
      suma.textContent = est.sumados.length ? `${est.sumados.map(v => pesos(v)).join(' + ')}${est.monto ? ` + ${pesos(est.monto)}` : ' + …'}` : (est.conLista && c.lista.ultimoMonto ? `La última vez: ${pesos(c.lista.ultimoMonto)}` : '');
      const pasa = tope ? saldo + tot - tope : -1;
      if (tot && pasa > 0) { aviso.hidden = false; aviso.innerHTML = `${ic('atencion', 18, 2.2)}Pasa el cupo por ${pesos(pasa)}`; } else aviso.hidden = true;
      btn.disabled = !tot;
      btn.innerHTML = tot ? `${ic('ok', 24, 2.6)}Anotar ${pesos(tot)}` : 'Marque el monto';
      if (tot) emitir('monto');
    };
    const tecla = t => { est.monto = teclear(est.monto, t); pintar(); };
    d.querySelector('.teclado').addEventListener('click', ev => { const b = ev.target.closest('[data-tecla]'); if (b) tecla(b.dataset.tecla); });
    Teclas.fn = ev => {
      if (ev.target.matches('input, textarea')) return;
      if (/^\d$/.test(ev.key)) { tecla(ev.key); ev.preventDefault(); }
      else if (ev.key === 'Backspace') { tecla('borrar'); ev.preventDefault(); }
      else if (ev.key === '+') { d.querySelector('[data-accion="sumar"]').click(); ev.preventDefault(); }
      else if (ev.key === 'Enter' && total()) { btn.click(); ev.preventDefault(); }
    };
    d.addEventListener('close', () => { Teclas.fn = null; }, { once: true });
    d.querySelector('[data-accion="cambiar"]').addEventListener('click', () => { est.que = que.value; est.llevo = llevo.value; pasoCliente(est); });
    d.querySelector('[data-accion="sumar"]').addEventListener('click', () => { if (!est.monto) { temblar(out); return; } est.sumados.push(est.monto); est.monto = 0; pintar(); });
    d.querySelector('[data-accion="detalle"]').addEventListener('click', ev => {
      const caja = d.querySelector('#h-detalle'); est.detalle = caja.hidden; caja.hidden = !caja.hidden; ev.currentTarget.setAttribute('aria-pressed', est.detalle); if (est.detalle) que.focus();
    });
    d.querySelector('[data-accion="lista"]')?.addEventListener('click', ev => {
      est.conLista = !est.conLista; ev.currentTarget.setAttribute('aria-pressed', est.conLista);
      que.value = est.conLista ? c.lista.productos : '';
      if (est.conLista && !total() && c.lista.ultimoMonto) est.monto = c.lista.ultimoMonto;
      pintar();
    });
    btn.addEventListener('click', () => {
      const tot = total(); if (!tot) return;
      est.que = que.value; est.llevo = llevo.value;
      if (tope && saldo + tot > tope * 1.2) return pasoCupo(est, tot);
      guardarFiado(est, tot);
    });
    d.querySelector('h2').focus({ preventScroll: true });
    pintar();
  });
  emitir('anotar-monto');
}

function pasoCupo(est, tot) {
  Teclas.fn = null;
  const c = est.c, saldo = saldoDe(c.id), nuevo = saldo + tot, sube = Math.ceil(nuevo / 10000) * 10000;
  pintarHoja(`<div style="display:flex;gap:.875rem;align-items:center"><span style="width:3.25rem;height:3.25rem;flex-shrink:0;border-radius:50%;background:var(--naranja-fondo);color:var(--naranja);display:flex;align-items:center;justify-content:center">${ic('atencion', 28, 2.2)}</span><h2>Esta compra pasa el cupo de ${esc(nombreCorto(c.nombre))}</h2></div>
    <p>Usted decide. Fiao solo le avisa. ${porQue('cupo', '¿Qué es el cupo?')}</p>
    <div class="tabla"><div><span>Debe ahora</span><b>${pesos(saldo)}</b></div><div><span>Con esta compra</span><b>${pesos(nuevo)}</b></div><div class="resaltada"><span>Su cupo</span><b>${pesos(c.cupo)}</b></div></div>
    <button type="button" class="btn" data-op="igual">Anotar igual</button>
    <button type="button" class="btn-sec" data-op="subir">Subir el cupo a ${pesos(sube)} y anotar</button>
    <button type="button" class="btn-link" data-op="volver">Cambiar el monto</button>`, d => {
    d.querySelector('[data-op="igual"]').addEventListener('click', () => guardarFiado(est, tot));
    d.querySelector('[data-op="subir"]').addEventListener('click', async () => { c.cupo = sube; await guardarCliente(c); guardarFiado(est, tot); });
    d.querySelector('[data-op="volver"]').addEventListener('click', () => pasoMonto(est));
  });
}

async function guardarFiado(est, tot) {
  const c = est.c, qv = (est.que || '').trim();
  const m = await registrarFiado({ c, monto: tot, que: est.conLista && qv === c.lista.productos ? (c.lista.nombre || 'Lo de siempre') : qv, llevo: est.llevo || '' });
  if (est.conLista) { c.lista.ultimoMonto = tot; await guardarCliente(c); }
  cerrarHoja();
  mostrarRuta({ animar: false });
  emitir('anotado');
  avisoTrasMov(m);
}

/* ═════ Aviso después de anotar o pagar: recibo, mostrar o deshacer ═════ */
function avisoTrasMov(m) {
  const c = cliente(m.clienteId), s = saldoDe(c.id), pago = m.tipo === 'pago', n = nombreCorto(c.nombre);
  const texto = pago ? (s > 0 ? `Pago de ${pesos(m.monto)}. Queda debiendo ${pesos(s)}.` : `${n} quedó al día.`) : `${pesos(m.monto)} a ${n}. Va en ${pesos(s)}.`;
  const acciones = [];
  if (c.recibos === 'whatsapp' && c.permiso?.estado !== 'no') acciones.push({ texto: pago ? 'Enviar comprobante' : 'Enviar recibo', fuerte: true, fn: () => enviarRecibo(c, m) });
  acciones.push({ texto: 'Mostrar', fuerte: !acciones.length, fn: () => ir(`mostrar-${m.id}`) });
  acciones.push({ texto: 'Deshacer', fn: async () => {
    if (await deshacerMov(m)) { mostrarRuta({ animar: false }); avisar('Listo, se deshizo.', { icono: 'girar' }); }
    else avisar('Ya no se puede deshacer. Puede corregirlo en el historial.', { icono: 'atencion' });
  } });
  avisar(texto, { acciones });
  if (pago && s <= 0) celebrar(); else vibrar(25);
}

/* ═════ Recibo por WhatsApp: celular, permiso y datos de pago, justo cuando hacen falta ═════ */
async function enviarRecibo(c, m) {
  if (!c.cel) return pedirCelular(c, m);
  if (c.permiso?.estado === 'no') return ir(`mostrar-${m.id}`);
  if (!permisoOk(c)) return abrirPermiso(c, () => enviarRecibo(c, m), m);
  const t = tienda();
  if (!t.preguntoPagos && !t.demo) return pedirDatosPago(() => enviarRecibo(c, m));
  abrirWhatsApp(c.cel, m.tipo === 'pago' ? mensajePago(c, m) : mensajeFiado(c, m));
  m.enviado = new Date().toISOString(); await guardarMov(m); await registrarContacto(c.id, 'recibo', m.id);
  avisar('Abrimos WhatsApp con el recibo listo.');
}
function pedirCelular(c, m) {
  const n = esc(nombreCorto(c.nombre));
  abrirHoja(`${cabHoja(`¿Cuál es el celular de ${n}?`)}<form id="h-cel" novalidate style="display:flex;flex-direction:column;gap:.875rem">
    <div class="campo"><label for="h-celular" class="vh">Celular con WhatsApp</label><div class="con-prefijo"><span class="prefijo" aria-hidden="true">+57</span><input class="entrada" id="h-celular" type="tel" inputmode="tel" placeholder="10 números" autocomplete="off"></div></div>
    <p class="error" role="alert" hidden></p><button type="submit" class="btn">Guardar y seguir</button></form>
    <button type="button" class="btn-link" data-accion="mostrar">Mejor se lo muestro aquí</button>`, d => {
    const inp = d.querySelector('#h-celular'); setTimeout(() => inp.focus(), 280);
    d.querySelector('[data-accion="mostrar"]').addEventListener('click', () => ir(`mostrar-${m.id}`));
    d.querySelector('#h-cel').addEventListener('submit', async ev => {
      ev.preventDefault(); const v = inp.value.replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, '');
      if (v.length !== 10 || (!/^3/.test(v) && !tienda().demo)) { const e = d.querySelector('.error'); e.textContent = 'El celular tiene 10 números y empieza por 3.'; e.hidden = false; temblar(inp); inp.focus(); return; }
      c.cel = v; await guardarCliente(c); enviarRecibo(c, m);
    });
  });
}
function abrirPermiso(c, sigue = null, m = null) {
  const n = esc(nombreCorto(c.nombre));
  const pedido = c.permiso?.estado === 'pedido';
  const listo = async (estado) => {
    c.permiso = { estado, fecha: new Date().toISOString() }; if (estado === 'no') c.recibos = 'mostrar';
    await guardarCliente(c); cerrarHoja();
    if (estado === 'si') { avisar(`${nombreCorto(c.nombre)} aceptó sus recibos.`); if (sigue) setTimeout(sigue, 350); }
    else { avisar('Entendido. Sus cuentas se las muestra aquí.', { icono: null }); mostrarRuta({ animar: false }); }
  };
  abrirHoja(pedido
    ? `${cabHoja(`¿${n} ya respondió?`)}<p>Le preguntamos si acepta recibos por WhatsApp.</p>
      <button type="button" class="btn verde" data-r="si">${ic('ok', 24, 2.6)}Sí, aceptó</button>
      <button type="button" class="btn-sec" data-r="no">Dijo que no</button>
      <button type="button" class="btn-link" data-r="otra">Preguntarle otra vez</button>`
    : `${cabHoja(`Primero, el permiso de ${n}`)}<p>Antes de escribirle, ${n} debe aceptar. ${porQue('permiso')}</p>
      <div class="burbuja" style="font-size:1rem;line-height:1.45">${esc(mensajePermiso(c))}</div>
      <button type="button" class="btn" data-r="otra">${ic('enviar', 22, 2.2)}Preguntarle por WhatsApp</button>
      <button type="button" class="btn-sec" data-r="si">Ya me dijo que sí</button>
      ${m ? '<button type="button" class="btn-link" data-r="mostrar">Mejor se lo muestro aquí</button>' : ''}`, d => {
    d.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', async () => {
      const r = b.dataset.r;
      if (r === 'si' || r === 'no') return listo(r);
      if (r === 'mostrar') return ir(`mostrar-${m.id}`);
      abrirWhatsApp(c.cel, mensajePermiso(c));
      c.permiso = { estado: 'pedido', fecha: new Date().toISOString() }; await guardarCliente(c); await registrarContacto(c.id, 'permiso');
      abrirPermiso(c, sigue, m);
    }));
  }, { nombre: 'permiso' });
}
function pedirDatosPago(sigue) {
  const t = tienda();
  abrirHoja(`${cabHoja('¿Cómo le pueden pagar?')}<p>Va en sus recibos, para que le paguen fácil.</p>
    <div class="campo"><label for="h-llave">Llave Bre-B <span class="opcional">(opcional)</span></label><input class="entrada" id="h-llave" value="${esc(t.llave || '')}" placeholder="Como sale en su banco" autocomplete="off"></div>
    <div class="campo"><label for="h-nequi">Nequi o Daviplata <span class="opcional">(opcional)</span></label><input class="entrada" id="h-nequi" type="tel" inputmode="tel" value="${esc(celLegible(t.nequi || ''))}" placeholder="10 números"></div>
    <button type="button" class="btn" data-accion="guardar">Guardar y seguir</button><button type="button" class="btn-link" data-accion="no">Ahora no, solo en la tienda</button>`, d => {
    const fin = async guardar => {
      if (guardar) { t.llave = d.querySelector('#h-llave').value.trim(); t.nequi = d.querySelector('#h-nequi').value.replace(/\D/g, ''); }
      t.preguntoPagos = true; await guardarTienda(t); cerrarHoja(); setTimeout(sigue, 350);
    };
    d.querySelector('[data-accion="guardar"]').addEventListener('click', () => fin(true));
    d.querySelector('[data-accion="no"]').addEventListener('click', () => fin(false));
  });
}

/* ═════ Hoja "Pagó" ═════ */
function abrirPago(c) {
  const saldo = saldoDe(c.id); if (saldo <= 0) return;
  const t = tienda(), n = esc(nombreCorto(c.nombre));
  const est = { medio: 'efectivo', monto: 0 };
  const medios = () => `<div class="chips" role="radiogroup" aria-label="¿Cómo pagó?" data-grupo="medio">${Object.entries({ efectivo: 'Efectivo', nequi: 'Nequi', breb: 'Bre-B', otro: 'Otro' }).map(([k, x]) => chip(x, k === est.medio, `data-valor="${k}"`, 'radio')).join('')}</div>`;
  const guardar = async (v, nuevaFecha = null) => {
    const m = await registrarPago({ c, monto: v, medio: est.medio, recibio: t.atiendeAhora, nuevaFecha });
    cerrarHoja(); mostrarRuta({ animar: false }); emitir('pagado'); avisoTrasMov(m);
  };
  const pasoTodo = () => {
    Teclas.fn = null;
    pintarHoja(`${cabHoja(`Pago de ${n}`)}${consejo('pago', 'Si paga todo, es un solo toque.')}
      <div class="monto-anotar"><span style="font-size:1.25rem">¿Pagó todo?</span><span class="monto-grande">${pesos(saldo)}</span></div>
      <fieldset><legend class="leyenda">¿Cómo pagó?</legend>${medios()}</fieldset>
      <button type="button" class="btn verde" data-accion="todo">${ic('ok', 24, 2.6)}Sí, pagó todo</button>
      <button type="button" class="btn-sec" data-accion="parte">Pagó una parte</button>`, d => {
      activarGrupos(d, (g, v) => { est.medio = v; });
      d.querySelector('[data-accion="todo"]').addEventListener('click', () => guardar(saldo));
      d.querySelector('[data-accion="parte"]').addEventListener('click', pasoParte);
    });
  };
  const pasoParte = () => {
    pintarHoja(`<div class="hoja-cab"><button type="button" class="btn-icono" data-accion="atras" aria-label="Volver">${ic('volver', 26, 2.4)}</button><h2>¿Cuánto pagó ${n}?</h2><button type="button" class="cerrar-hoja" data-cerrar aria-label="Cerrar">${ic('cerrar', 24, 2.4)}</button></div>
      <div class="monto-anotar"><output class="monto-grande" id="p-monto" aria-live="polite">$0</output><span class="suma" id="p-resta">Debe ${pesos(saldo)}</span></div>
      ${teclado()}<p class="error" role="alert" hidden id="p-error"></p>
      <button type="button" class="btn" id="p-seguir" disabled>Marque el monto</button>`, d => {
      const out = d.querySelector('#p-monto'), resta = d.querySelector('#p-resta'), btn = d.querySelector('#p-seguir'), err = d.querySelector('#p-error');
      const pintar = () => {
        out.textContent = pesos(est.monto); err.hidden = true;
        const q = saldo - est.monto;
        resta.textContent = !est.monto ? `Debe ${pesos(saldo)}` : q > 0 ? `Queda debiendo ${pesos(q)}` : q === 0 ? 'Queda al día' : `Debe ${pesos(saldo)}`;
        btn.disabled = !est.monto; btn.textContent = est.monto ? `Registrar ${pesos(est.monto)}` : 'Marque el monto';
      };
      const tecla = x => { est.monto = teclear(est.monto, x); pintar(); };
      d.querySelector('.teclado').addEventListener('click', ev => { const b = ev.target.closest('[data-tecla]'); if (b) tecla(b.dataset.tecla); });
      Teclas.fn = ev => { if (/^\d$/.test(ev.key)) { tecla(ev.key); ev.preventDefault(); } else if (ev.key === 'Backspace') { tecla('borrar'); ev.preventDefault(); } else if (ev.key === 'Enter' && est.monto) { btn.click(); ev.preventDefault(); } };
      d.querySelector('[data-accion="atras"]').addEventListener('click', pasoTodo);
      btn.addEventListener('click', () => {
        if (est.monto > saldo) { err.textContent = `Es más de lo que debe (${pesos(saldo)}).`; err.hidden = false; temblar(out); return; }
        if (est.monto === saldo) return guardar(saldo);
        pasoFecha();
      });
      d.querySelector('h2').setAttribute('tabindex', '-1'); d.querySelector('h2').focus({ preventScroll: true });
      pintar();
    });
  };
  const pasoFecha = () => {
    Teclas.fn = null;
    const hoy = new Date(), op = [];
    const pon = (d, rot) => { const iso = isoDia(d); if (!op.some(o => o.iso === iso)) op.push({ iso, rot }); };
    pon(sumarDias(hoy, 1), 'Mañana');
    pon(fechaPorPreferencia('viernes', sumarDias(hoy, 1)), mayuscula(fechaCorta(fechaPorPreferencia('viernes', sumarDias(hoy, 1)))));
    const qui = fechaPorPreferencia('quincena', sumarDias(hoy, 1)); pon(qui, `Quincena: ${fechaCorta(qui)}`);
    pintarHoja(`<div class="hoja-cab"><button type="button" class="btn-icono" data-accion="atras" aria-label="Volver">${ic('volver', 26, 2.4)}</button><h2>¿Cuándo paga el resto?</h2><button type="button" class="cerrar-hoja" data-cerrar aria-label="Cerrar">${ic('cerrar', 24, 2.4)}</button></div>
      <p>Pagó ${pesos(est.monto)}. Queda debiendo <b>${pesos(saldo - est.monto)}</b>.</p>
      <div class="chips" role="radiogroup" aria-label="Fecha para el resto" data-grupo="fecha">${op.map((o, i) => chip(o.rot, i === 0, `data-valor="${o.iso}"`, 'radio')).join('')}${chip('Otro día', false, 'data-valor="otro"', 'radio')}</div>
      <div class="campo" id="p-caja-dia" hidden><label for="p-dia">Fecha</label><input class="entrada" id="p-dia" type="date" min="${isoDia(sumarDias(hoy, 1))}"></div>
      <p class="ayuda" id="p-nota" hidden></p><p class="error" role="alert" hidden id="p-error2"></p>
      <button type="button" class="btn" data-accion="guardar">${ic('ok', 24, 2.6)}Guardar pago</button>`, d => {
      const leer = activarGrupos(d, (g, v) => { d.querySelector('#p-caja-dia').hidden = v !== 'otro'; if (v === 'otro') d.querySelector('#p-dia').focus(); nota(); });
      const fecha = () => { const v = leer('fecha'); return v === 'otro' ? d.querySelector('#p-dia').value : v; };
      const nota = () => {
        const iso = fecha(), el = d.querySelector('#p-nota'); if (!iso || horarioLegal(diaDe(iso))) { el.hidden = true; return; }
        const x = diaDe(iso); el.hidden = false; el.textContent = `Ese día es ${x.getDay() === 0 ? 'domingo' : 'festivo'} y no se puede recordar. Si no paga, podrá recordarle ${elDia(proximoDiaLegal(x))}.`;
      };
      d.querySelector('#p-dia').addEventListener('change', nota);
      d.querySelector('[data-accion="atras"]').addEventListener('click', pasoParte);
      d.querySelector('[data-accion="guardar"]').addEventListener('click', () => {
        const iso = fecha(); if (!iso) { const e = d.querySelector('#p-error2'); e.textContent = 'Elija el día.'; e.hidden = false; return; }
        guardar(est.monto, diaDe(iso));
      });
    });
  };
  abrirHoja('', () => {}, { nombre: 'pago' });
  pasoTodo();
}

/* ═════ Mostrárselo al vecino en la tienda ═════ */
V.mostrar = id => {
  const m = mov(id); if (!m) return null; const c = cliente(m.clienteId);
  const n = nombreCorto(c.nombre), s = saldoDe(c.id), pago = m.tipo === 'pago';
  return {
    titulo: `Para ${n}`,
    html: `<div class="pantalla blanca"><header class="mostrar-barra"><span style="display:inline-flex;align-items:center;gap:.5rem">${ic('girar', 22, 2.2)}Gire el celular hacia ${esc(n)}</span><a class="btn-icono" href="#cliente-${c.id}" data-volver aria-label="Cerrar">${ic('cerrar', 26, 2.4)}</a></header>
    <main class="mostrar">
      <h1 class="para" tabindex="-1">${esc(n)}, ${pago ? 'recibimos su pago:' : 'esto quedó anotado:'}</h1>
      <div style="display:flex;flex-direction:column;gap:.25rem"><span class="cifra-xl">${pesos(m.monto)}</span>${!pago && m.que ? `<span class="que">${esc(mayuscula(m.que))}</span>` : ''}${pago && MEDIOS[m.medio] ? `<span class="que">${esc(mayuscula(MEDIOS[m.medio]))}</span>` : ''}
        <span class="cuando">${mayuscula(fechaLarga(new Date(m.fecha)))}, ${hora(new Date(m.fecha))}</span></div>
      <hr>
      <div style="display:flex;flex-direction:column;gap:.25rem">${s > 0 ? `<span style="font-size:1.375rem">${pago ? 'Queda debiendo' : 'Su cuenta va en'}</span><span class="cifra-l">${pesos(s)}</span>
        ${c.proximaFecha ? `<span class="acordado">${ic('calendario', 22)}Acordaron pagar ${elDia(diaDe(c.proximaFecha))}.</span>` : ''}` : `<span class="cifra-l" style="color:var(--verde)">Su cuenta quedó al día</span>`}</div>
    </main>
    <div class="pie" role="region" aria-label="Acciones" style="padding-inline:1.5rem"><button type="button" class="btn verde" data-accion="visto">${ic('ok', 24, 2.6)}${esc(n)} está de acuerdo</button><a class="btn-link" href="#corregir-${m.id}">Hay un error: corregir</a></div></div>`,
    montar(r) {
      r.querySelector('[data-accion="visto"]').addEventListener('click', async () => {
        m.visto = new Date().toISOString(); await guardarMov(m); ir(`cliente-${c.id}`); avisar(`Quedó registrado que ${n} lo vio.`);
      });
    }
  };
};

/* ═════ Ficha del cliente ═════ */
function nombreMov(m) {
  if (m.tipo === 'pago') return mayuscula(`Pagó ${MEDIOS[m.medio] || ''}`.trim());
  if (m.tipo === 'saldo') return m.que || 'Lo que venía del cuaderno';
  return m.que ? mayuscula(m.que) : 'Fiado';
}
function filaMov(m) {
  const d = new Date(m.fecha), pago = m.tipo === 'pago';
  const signo = pago ? '−' : '+';
  const det = [`${hora(d)}`];
  if (m.atendio) det.push(`${pago ? 'recibió' : 'atendió'} ${esc(m.atendio)}`);
  if (m.llevo) det.push(`lo llevó ${esc(m.llevo)}`);
  const corr = (m.correcciones || []).map(x => `<span>${ic('lapiz', 16, 2.2)} Corregido: decía ${pesos(x.de)}, quedó en ${pesos(x.a)}.</span>`).join('');
  const anul = m.anulado ? `<span>Anulado: ${esc(m.anulado.motivo)}.</span>` : '';
  return `<li><button type="button" class="mov${pago ? ' pago' : ''}${m.anulado ? ' anulada' : ''}" aria-expanded="false" aria-controls="d-${m.id}"><span class="que"><span>${esc(nombreMov(m))}</span>${(m.correcciones || []).length ? `<span class="ic-caja" title="Corregido">${ic('lapiz', 16, 2.2)}<span class="vh">, corregido</span></span>` : ''}</span><span class="v">${signo} ${pesos(m.monto)}</span>${ic('abajo', 18, 2.4)}</button>
    <div class="mov-detalle" id="d-${m.id}" hidden><span>${det.join(' · ')}</span>${corr}${anul}${m.visto ? `<span>${ic('ok', 16, 2.6)} El vecino lo vio.</span>` : ''}${m.enviado ? `<span>${ic('enviar', 16, 2.2)} Recibo enviado.</span>` : ''}
      ${m.anulado ? '' : `<div class="fila-botones"><a class="btn-mini sec" href="#corregir-${m.id}">${ic('lapiz', 18, 2.2)}Corregir</a><a class="btn-mini sec" href="#mostrar-${m.id}">${ic('girar', 18, 2.2)}Mostrar</a></div>`}</div></li>`;
}
V.cliente = (id, extra) => {
  const c = cliente(id); if (!c) return null;
  const e = estadoDe(c); const p = puntualidad(c); const movs = movsDe(c.id);
  const uso = usoCupo(c, e.saldo);
  const todo = extra === 'todo';
  const visibles = todo ? movs : movs.slice(0, 10);
  const derecha = btnIcono('lapiz', 'Editar cliente', { href: `editar-${c.id}` });
  return {
    titulo: c.nombre,
    html: `<div class="pantalla">${barra({ titulo: esc(c.nombre), sub: esc(c.detalle || ''), volver: 'inicio', derecha })}
    <main class="contenido">
      ${consejo('cliente', 'Toque una línea del historial para ver el detalle.')}
      <section class="ficha-saldo" aria-label="Cuenta">
        ${e.saldo > 0 ? `<div style="display:flex;flex-direction:column"><span class="ayuda">Debe</span><span class="cifra">${monto(e.saldo)}</span>${estadoHtml(c, e)}</div>`
          : `<span class="estado ok" style="font-size:1.375rem;line-height:1.75rem">${ic('ok', 26, 2.8)}No debe nada</span>`}
        ${c.cupo ? `<div style="display:flex;flex-direction:column;gap:.25rem"><div class="medidor${uso > 1 ? ' lleno' : ''}" role="meter" aria-label="Cupo usado" aria-valuemin="0" aria-valuemax="${c.cupo}" aria-valuenow="${Math.max(0, Math.min(e.saldo, c.cupo))}" aria-valuetext="${pesos(Math.max(0, e.saldo))} de ${pesos(c.cupo)}"><span style="width:${Math.max(0, Math.min(100, uso * 100))}%"></span></div>
          <span class="par gris"><span>Cupo ${pesos(c.cupo)}</span><span${uso > 1 ? ' style="color:var(--naranja-texto);font-weight:600"' : ''}>${uso > 1 ? `Se pasó ${pesos(e.saldo - c.cupo)}` : `Le quedan ${pesos(c.cupo - Math.max(0, e.saldo))}`}</span></span></div>` : ''}
        ${p.de >= 2 ? `<span class="estado">${ic('estrella', 18, 2.2)}Paga a tiempo ${p.a} de ${p.de} veces</span>` : ''}
      </section>
      <div class="fila-botones"><button type="button" class="btn" data-accion="anotar">${ic('mas', 24, 2.6)}Anotar</button>${e.saldo > 0 ? `<button type="button" class="btn verde" data-accion="pago">${ic('dinero', 24, 2.2)}Pagó</button>` : ''}</div>
      ${c.permiso?.estado === 'pedido' ? `<div class="info">${ic('chat', 22)}<p>¿${esc(nombreCorto(c.nombre))} ya aceptó los recibos?</p><button type="button" class="btn-mini sec" data-accion="permiso">Anotar respuesta</button></div>` : ''}
      ${permisoOk(c) && e.saldo > 0 ? `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:0 .5rem"><button type="button" class="btn-link izq" data-accion="cuenta">${ic('enviar', 20, 2.2)}Enviarle su cuenta</button>${porQue('enlace', '¿Qué ve?')}</div>` : ''}
      <section aria-labelledby="t-movs" style="display:flex;flex-direction:column;gap:.375rem"><h2 class="titulo-seccion" id="t-movs">Historial</h2>
        ${movs.length ? agruparPorDia(visibles).map(g => `<h3 class="dia-historial">${g.dia}</h3><ul class="lista">${g.items.map(filaMov).join('')}</ul>`).join('') : '<p class="vacio">Todavía no hay nada anotado.</p>'}
        ${!todo && movs.length > 10 ? `<a class="btn-sec" href="#cliente-${c.id}-todo">Ver todo el historial (${movs.length})</a>` : ''}
        ${movs.length ? `<p class="ayuda" style="display:flex;flex-wrap:wrap;align-items:center;gap:0 .25rem">Nada se borra. ${porQue('borrar')}</p>` : ''}
      </section>
      <div style="display:flex;flex-wrap:wrap;gap:.25rem 1rem">${!c.cupo ? `<a class="btn-link izq" href="#editar-${c.id}">Ponerle cupo</a>` : ''}${c.cel ? `<button type="button" class="btn-link izq" data-accion="chat">${ic('chat', 20, 2.2)}Escribirle</button>` : ''}</div>
    </main></div>`,
    montar(r) {
      Vista.despues = null;
      r.querySelector('[data-accion="anotar"]').addEventListener('click', () => abrirAnotar(c));
      r.querySelector('[data-accion="pago"]')?.addEventListener('click', () => abrirPago(c));
      r.querySelector('[data-accion="permiso"]')?.addEventListener('click', () => abrirPermiso(c));
      r.querySelectorAll('.mov').forEach(b => b.addEventListener('click', () => {
        const abierto = b.getAttribute('aria-expanded') === 'true'; b.setAttribute('aria-expanded', !abierto);
        r.querySelector('#' + b.getAttribute('aria-controls')).hidden = abierto;
      }));
      r.querySelector('[data-accion="chat"]')?.addEventListener('click', () => { const u = `https://wa.me/${tienda().demo ? '' : celInternacional(c.cel)}`; const w = window.open(u, '_blank', 'noopener'); if (!w) location.href = u; });
      r.querySelector('[data-accion="cuenta"]')?.addEventListener('click', async () => {
        abrirWhatsApp(c.cel, `Hola, ${nombreCorto(c.nombre)}. Esta es su cuenta en ${tienda().nombre}: va en ${pesos(saldoDe(c.id))}. Vea el detalle aquí: ${enlaceCuenta(c)}`);
        await registrarContacto(c.id, 'cuenta'); avisar('Abrimos WhatsApp con su cuenta.');
      });
    }
  };
};

/* ═════ Corregir o anular (nada se borra) ═════ */
V.corregir = id => {
  const m = mov(id); if (!m) return null; const c = cliente(m.clienteId);
  const n = nombreCorto(c.nombre); const d = new Date(m.fecha);
  const cabecera = `<div class="tarjeta"><span class="ayuda">${esc(c.nombre)} · ${mayuscula(cuando(d))}, ${hora(d)}</span>
    <span class="par" style="font-size:1.125rem;align-items:baseline"><b>${esc(nombreMov(m))}</b><span>${m.anulado ? 'Era' : 'Dice'} <b>${pesos(m.monto)}</b></span></span></div>`;
  if (m.anulado) return {
    titulo: 'Anotación anulada',
    html: `<div class="pantalla">${barra({ titulo: 'Anotación anulada', volver: `cliente-${c.id}` })}<main class="contenido holgado">${cabecera}
      <div class="info">${ic('lapiz', 22)}<p>Se anuló ${elDia(new Date(m.anulado.fecha))}: <b>${esc(m.anulado.motivo)}</b>. Queda en el historial.</p></div></main></div>`
  };
  const motivos = m.tipo === 'pago' ? { monto: 'Me equivoqué en el monto', nopago: 'No pagó eso', otro: 'Otro motivo' } : { monto: 'Me equivoqué en el monto', nollevo: 'No se lo llevó', otro: 'Otro motivo' };
  return {
    titulo: 'Corregir',
    html: `<div class="pantalla">${barra({ titulo: 'Corregir', volver: `cliente-${c.id}` })}<main class="contenido holgado"><form style="display:flex;flex-direction:column;gap:inherit" id="form-corregir" novalidate>${cabecera}
      <div class="campo"><label for="k-monto">Debe decir</label><input class="entrada grande" id="k-monto" inputmode="numeric" value="${pesos(m.monto)}" autocomplete="off"></div>
      ${grupoOpciones('motivo', '¿Qué pasó?', motivos, 'monto')}
      <div class="info">${ic('lapiz', 22)}<p>${esc(n)} verá: «Corregido: decía ${pesos(m.monto)}, quedó en <b id="k-nuevo">…</b>».</p></div>
      ${permisoOk(c) ? `<label class="check"><input type="checkbox" id="k-avisar" checked>Avisarle a ${esc(n)} por WhatsApp</label>` : ''}
      <p id="k-error" class="error" role="alert" hidden></p>
      <button type="button" class="btn-link izq" data-accion="anular" style="color:var(--naranja-texto)">Anular esta anotación</button>
    </form></main><div class="pie" role="region" aria-label="Acciones"><button type="submit" form="form-corregir" class="btn">Guardar corrección</button></div></div>`,
    montar(r) {
      const leer = activarGrupos(r);
      const inp = r.querySelector('#k-monto');
      activarCampoPesos(inp, v => { r.querySelector('#k-nuevo').textContent = v && v !== m.monto ? pesos(v) : '…'; });
      const avisarle = () => r.querySelector('#k-avisar')?.checked;
      r.querySelector('[data-accion="anular"]').addEventListener('click', async () => {
        const motivo = motivos[leer('motivo')] || 'Otro motivo';
        const si = await confirmar({ titulo: '¿Anular esta anotación?', texto: `Deja de contar en la cuenta de ${esc(n)}. Queda en el historial con el motivo «${esc(motivo)}».`, si: 'Sí, anular', peligro: true });
        if (!si) return;
        await anularMov(m, motivo);
        if (avisarle()) { abrirWhatsApp(c.cel, mensajeCorreccion(c, m, true)); await registrarContacto(c.id, 'correccion', m.id); }
        ir(`cliente-${c.id}`); avisar('Anotación anulada.');
      });
      r.querySelector('#form-corregir').addEventListener('submit', async ev => {
        ev.preventDefault();
        const v = leerPesos(inp.value), err = r.querySelector('#k-error');
        if (!v) { err.textContent = 'Escriba el monto. Si no debió anotarse, anúlelo.'; err.hidden = false; temblar(inp); inp.focus(); return; }
        if (v === m.monto) { err.textContent = 'Es el mismo monto de antes.'; err.hidden = false; temblar(inp); inp.focus(); return; }
        await corregirMov(m, v, motivos[leer('motivo')]);
        if (avisarle()) { abrirWhatsApp(c.cel, mensajeCorreccion(c, m, false)); await registrarContacto(c.id, 'correccion', m.id); }
        ir(`cliente-${c.id}`); avisar('Corrección guardada.');
      });
    }
  };
};
