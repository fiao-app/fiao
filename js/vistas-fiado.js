/* Fiao · el fiado y el pago, sin salir de la pantalla:
   Hoja "Anotar" (¿a quién? → ¿cuánto?) · Hoja "Pagó" · Aviso con Deshacer ·
   Recibo con permiso en el momento justo · Ficha del cliente · Mostrar · Corregir */
'use strict';

/** Teclas del teclado físico para el paso del monto (computador o teclado bluetooth). */
const Teclas = { fn: null };
document.addEventListener('keydown', ev => { if (Teclas.fn && hojaAbierta()) Teclas.fn(ev); });

function vistaMensaje(texto) { return esc(texto).replace(/https?:\/\/\S+/g, '<span class="enlace">enlace a su cuenta</span>'); }
function avatar(c) { return avatarHtml(c); }
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
      const otro = clienteLlamado(n);
      if (otro && d.dataset.repetido !== n) {
        d.dataset.repetido = n; fallo(textoRepetido(otro), inp);
        const b = d.querySelector('#h-nuevo .btn'); b.textContent = 'Es otra persona: seguir';
        if (!d.querySelector('[data-misma]')) { const x = document.createElement('button'); x.type = 'button'; x.className = 'btn-sec'; x.dataset.misma = otro.id; x.textContent = `Es la misma: anotarle a ${nombreCorto(otro.nombre)}`; b.after(x); x.addEventListener('click', () => { est.c = cliente(x.dataset.misma); pasoMonto(est); }); }
        return;
      }
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
        <span class="suma" id="h-suma"></span><span class="pildora atencion" id="h-cupo" role="status" hidden></span><span class="pildora atencion" id="h-raro" role="status" hidden>${ic('atencion', 18, 2.2)}Es mucho más de lo normal. Revise el monto.</span></div>
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
      out.textContent = pesos(tot); if (!reducido()) { out.classList.remove('sube'); void out.offsetWidth; out.classList.add('sube'); }
      suma.textContent = est.sumados.length ? `${est.sumados.map(v => pesos(v)).join(' + ')}${est.monto ? ` + ${pesos(est.monto)}` : ' + …'}` : (est.conLista && c.lista.ultimoMonto ? `La última vez: ${pesos(c.lista.ultimoMonto)}` : '');
      const pasa = tope ? saldo + tot - tope : -1;
      if (tot && pasa > 0) { aviso.hidden = false; aviso.innerHTML = `${ic('atencion', 18, 2.2)}Pasa el cupo por ${pesos(pasa)}`; } else aviso.hidden = true;
      /* Un cero de más: se avisa (con voz, una vez por hoja), sin impedir anotarlo. */
      const raro = d.querySelector('#h-raro'), esRaro = !!tot && montoInusual(c, tot);
      if (esRaro && raro.hidden && !d.dataset.dijoRaro) { d.dataset.dijoRaro = '1'; if (typeof Voz !== 'undefined') Voz.decir('monto-alto'); }
      raro.hidden = !esRaro;
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
  pintarHoja(`<div style="display:flex;gap:.875rem;align-items:center"><span class="ic-caja ic-fondo alerta grande">${ic('atencion', 28, 2.2)}</span><h2>Esta compra pasa el cupo de ${esc(nombreCorto(c.nombre))}</h2></div>
    <p>Usted decide. Fiao solo le avisa. ${porQue('cupo', '¿Qué es el cupo?')}</p>
    <div class="tabla"><div><span>Debe ahora</span><b>${pesos(saldo)}</b></div><div><span>Con esta compra</span><b>${pesos(nuevo)}</b></div><div class="resaltada"><span>Su cupo</span><b>${pesos(c.cupo)}</b></div></div>
    <button type="button" class="btn" data-op="igual">Anotar igual</button>
    <button type="button" class="btn-sec" data-op="subir">Subir el cupo a ${pesos(sube)} y anotar</button>
    <button type="button" class="btn-link" data-op="volver">Cambiar el monto</button>`, d => {
    if (typeof Voz !== 'undefined') Voz.decir('cupo');
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
  if (Mov.origen) { Mov.monedaVuela(document.querySelector(`#app ${Mov.origen}`)); Mov.origen = null; }
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
function abrirPago(c, pre = {}) {
  const saldo = saldoDe(c.id); if (saldo <= 0) return;
  const t = tienda(), n = esc(nombreCorto(c.nombre));
  /* Desde el aviso de pago del vecino llegan el monto y el medio ya puestos. */
  const est = { medio: pre.medio || 'efectivo', monto: pre.monto > 0 && pre.monto < saldo ? pre.monto : 0 };
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
  /* Pagó una parte: se desliza en saltos de $1.000 (el último salto es lo que debe exacto),
     o se toca la pista, − y +, «Mitad», o se escribe el monto exacto con el teclado. */
  const pasoParte = () => {
    const N = Math.ceil(saldo / 1000);
    const valorDe = k => Math.min(k * 1000, saldo);
    const mitad = Math.round(saldo / 2 / 100) * 100;
    pintarHoja(`<div class="hoja-cab"><button type="button" class="btn-icono" data-accion="atras" aria-label="Volver">${ic('volver', 26, 2.4)}</button><h2 tabindex="-1">¿Cuánto pagó ${n}?</h2><button type="button" class="cerrar-hoja" data-cerrar aria-label="Cerrar">${ic('cerrar', 24, 2.4)}</button></div>
      <div class="monto-anotar"><output class="monto-grande" id="p-monto" for="p-rango" aria-live="polite">$0</output><span class="suma" id="p-resta">Debe ${pesos(saldo)}</span></div>
      <div class="deslizador"><label for="p-rango" class="vh">Cuánto pagó ${n}</label>
        <input type="range" id="p-rango" min="0" max="${N}" step="1" value="0" style="--color:var(--verde)">
        <div class="limites" aria-hidden="true"><span>$0</span><span>Debe ${pesos(saldo)}</span></div>
        <div class="control"><button type="button" class="paso-btn" data-paso="-1" aria-label="Mil pesos menos">${ic('menos', 24, 2.6)}</button>
          <div class="chips" style="justify-content:center"><button type="button" class="chip" data-accion="mitad">Mitad</button></div>
          <button type="button" class="paso-btn" data-paso="1" aria-label="Mil pesos más">${ic('mas', 24, 2.6)}</button></div></div>
      <button type="button" class="btn-link" data-accion="teclado" aria-expanded="false" aria-controls="p-teclado">${ic('lapiz', 20, 2.2)}Escribir el monto exacto</button>
      <div id="p-teclado" hidden>${teclado()}</div>
      <p class="error" role="alert" hidden id="p-error"></p>
      <button type="button" class="btn verde" id="p-seguir" disabled>Mueva la barra o marque el monto</button>`, d => {
      const out = d.querySelector('#p-monto'), resta = d.querySelector('#p-resta'), btn = d.querySelector('#p-seguir'), err = d.querySelector('#p-error');
      const rango = d.querySelector('#p-rango'), cajaT = d.querySelector('#p-teclado');
      const pintar = ({ desdeRango = false, quieto = false } = {}) => {
        const antes = out.textContent;
        out.textContent = pesos(est.monto); err.hidden = true;
        if (!quieto && antes !== out.textContent && !reducido()) { out.classList.remove('salta'); void out.offsetWidth; out.classList.add('salta'); }
        const q = saldo - est.monto;
        resta.innerHTML = !est.monto ? `Debe ${pesos(saldo)}` : q > 0 ? `Queda debiendo <b>${pesos(q)}</b>` : q === 0 ? 'Queda al día' : `Debe ${pesos(saldo)}`;
        if (!desdeRango) rango.value = Math.min(N, Math.round(est.monto / 1000));
        rango.style.setProperty('--lleno', `${(rango.value / N) * 100}%`);
        rango.setAttribute('aria-valuetext', est.monto ? `${pesos(est.monto)}. ${q > 0 ? `Queda debiendo ${pesos(q)}` : q === 0 ? 'Queda al día' : ''}` : 'Cero pesos');
        btn.disabled = !est.monto; btn.innerHTML = est.monto ? `${ic('ok', 24, 2.6)}Registrar ${pesos(est.monto)}` : 'Mueva la barra o marque el monto';
      };
      rango.addEventListener('input', () => { est.monto = valorDe(+rango.value); vibrar(4); pintar({ desdeRango: true }); });
      d.querySelectorAll('[data-paso]').forEach(b => b.addEventListener('click', () => {
        est.monto = Math.max(0, Math.min(saldo, (Math.round(est.monto / 1000) + Number(b.dataset.paso)) * 1000)); vibrar(6); pintar();
      }));
      /* «Mitad» funciona como un imán: la barra se desliza sola hasta la mitad. */
      d.querySelector('[data-accion="mitad"]').addEventListener('click', () => {
        vibrar(8);
        Mov.deslizar(est.monto, mitad, 280, v => { est.monto = Math.round(v / 100) * 100; pintar({ quieto: true }); }, () => { est.monto = mitad; pintar(); });
      });
      d.querySelector('[data-accion="teclado"]').addEventListener('click', ev => {
        const abierto = cajaT.hidden; cajaT.hidden = !abierto; ev.currentTarget.setAttribute('aria-expanded', abierto);
        if (abierto) { est.monto = 0; pintar(); }
      });
      const tecla = x => { est.monto = teclear(est.monto, x); pintar(); };
      cajaT.querySelector('.teclado').addEventListener('click', ev => { const b = ev.target.closest('[data-tecla]'); if (b) tecla(b.dataset.tecla); });
      Teclas.fn = ev => { if (ev.target === rango && !/^\d$/.test(ev.key)) return; if (/^\d$/.test(ev.key)) { tecla(ev.key); ev.preventDefault(); } else if (ev.key === 'Backspace') { tecla('borrar'); ev.preventDefault(); } else if (ev.key === 'Enter' && est.monto) { btn.click(); ev.preventDefault(); } };
      d.querySelector('[data-accion="atras"]').addEventListener('click', pasoTodo);
      btn.addEventListener('click', () => {
        if (est.monto > saldo) { err.textContent = `Es más de lo que debe (${pesos(saldo)}).`; err.hidden = false; temblar(out); return; }
        if (est.monto === saldo) return guardar(saldo);
        pasoFecha();
      });
      d.querySelector('h2').focus({ preventScroll: true });
      pintar();
    });
  };
  /* Cuándo paga el resto: una tira de días que se desliza de lado. */
  const pasoFecha = () => {
    Teclas.fn = null;
    const hoy = new Date();
    const qui = isoDia(fechaPorPreferencia('quincena', sumarDias(hoy, 1)));
    const dias = Array.from({ length: 21 }, (_, i) => sumarDias(hoy, i + 1));
    const boton = (dd, i) => {
      const iso = isoDia(dd), fest = nombreFestivo(dd);
      const arriba = i === 0 ? 'Mañana' : mayuscula(DIAS[dd.getDay()]);
      const nota = fest ? 'Festivo' : iso === qui ? 'Quincena' : '';
      return `<button type="button" role="radio" aria-checked="${i === 0}" data-valor="${iso}" aria-label="${mayuscula(fechaLarga(dd))}${fest ? ', festivo' : ''}${iso === qui ? ', quincena' : ''}"><span>${arriba}</span><b>${dd.getDate()}</b>${nota ? `<span class="no"${iso === qui && !fest ? ' style="color:inherit"' : ''}>${nota}</span>` : ''}</button>`;
    };
    pintarHoja(`<div class="hoja-cab"><button type="button" class="btn-icono" data-accion="atras" aria-label="Volver">${ic('volver', 26, 2.4)}</button><h2 tabindex="-1">¿Cuándo paga el resto?</h2><button type="button" class="cerrar-hoja" data-cerrar aria-label="Cerrar">${ic('cerrar', 24, 2.4)}</button></div>
      <p>Pagó ${pesos(est.monto)}. Queda debiendo <b>${pesos(saldo - est.monto)}</b>.</p>
      <div class="tira-dias" role="radiogroup" aria-label="Día para pagar el resto" data-grupo="fecha">${dias.map(boton).join('')}<button type="button" role="radio" aria-checked="false" data-valor="otro"><span>Otro</span><b>${ic('calendario', 24, 2.2)}</b><span>día</span></button></div>
      <div class="campo" id="p-caja-dia" hidden><label for="p-dia">Fecha</label><input class="entrada" id="p-dia" type="date" min="${isoDia(sumarDias(hoy, 1))}"></div>
      <p class="ayuda" id="p-nota" hidden></p><p class="error" role="alert" hidden id="p-error2"></p>
      <button type="button" class="btn verde" data-accion="guardar">${ic('ok', 24, 2.6)}Guardar pago</button>`, d => {
      const leer = activarGrupos(d, (g, v) => { d.querySelector('#p-caja-dia').hidden = v !== 'otro'; if (v === 'otro') d.querySelector('#p-dia').focus(); nota(); vibrar(6); });
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
      d.querySelector('h2').focus({ preventScroll: true });
    });
  };
  abrirHoja('', () => {}, { nombre: 'pago' });
  if (est.monto) pasoParte(); else pasoTodo();
}

/* ═════ Mostrárselo al vecino en la tienda ═════ */
V.mostrar = id => {
  const m = mov(id); if (!m) return null; const c = cliente(m.clienteId);
  const n = nombreCorto(c.nombre), s = saldoDe(c.id), pago = m.tipo === 'pago';
  return {
    titulo: `Para ${n}`,
    html: `<div class="pantalla blanca"><header class="mostrar-barra"><span style="display:inline-flex;align-items:center;gap:.5rem">${ic('girar', 22, 2.2)}Gire el celular hacia ${esc(n)}</span><a class="btn-icono" href="#cliente-${c.id}" data-volver aria-label="Cerrar">${ic('cerrar', 26, 2.4)}</a></header><div class="toldo" aria-hidden="true"></div>
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

/* Mostrar la cuenta completa en el mostrador: lo mismo que el vecino recibe por enlace, girado hacia él. */
V.cuenta = id => {
  const c = cliente(id); if (!c) return null;
  const n = nombreCorto(c.nombre), s = saldoDe(c.id);
  const todos = movsDe(c.id), ult = todos.slice(0, 14), antes = todos.slice(14).reduce((t, m) => t + efecto(m), 0);
  const fila = m => {
    const pago = m.tipo === 'pago', corr = (m.correcciones || [])[0];
    const notas = [corr ? `Corregido: decía ${pesos(corr.de)}` : '', m.anulado ? 'Anulado: no cuenta' : ''].filter(Boolean).map(x => `<small>${x}</small>`).join('');
    return `<li class="${pago ? 'pago' : ''}${m.anulado ? ' anulada' : ''}"><span class="d"><span>${esc(nombreMov(m))}</span>${notas}</span><span class="v">${pago ? '− ' : '+ '}${pesos(m.monto)}</span></li>`;
  };
  const historial = agruparPorDia(ult).map(g => `<h3 class="dia-historial">${g.dia}</h3><ul class="lista movs-vecino">${g.items.map(fila).join('')}</ul>`).join('');
  return {
    titulo: `Cuenta de ${n}`,
    html: `<div class="pantalla blanca"><header class="mostrar-barra"><span style="display:inline-flex;align-items:center;gap:.5rem">${ic('girar', 22, 2.2)}Gire el celular hacia ${esc(n)}</span><a class="btn-icono" href="#cliente-${c.id}" data-volver aria-label="Cerrar">${ic('cerrar', 26, 2.4)}</a></header><div class="toldo" aria-hidden="true"></div>
    <main class="mostrar">
      <h1 class="para" tabindex="-1">${esc(n)}, así va su cuenta:</h1>
      <div style="display:flex;flex-direction:column;gap:.25rem">${s > 0 ? `<span style="font-size:1.375rem">Debe</span><span class="cifra-xl">${pesos(s)}</span>
        ${c.proximaFecha ? `<span class="acordado">${ic('calendario', 22)}Acordaron pagar ${elDia(diaDe(c.proximaFecha))}.</span>` : ''}` : `<span class="cifra-l" style="color:var(--verde)">No debe nada</span>`}</div>
      ${historial ? `<section class="recibo" aria-labelledby="t-cuenta-hist"><h2 class="titulo-seccion" id="t-cuenta-hist">Lo último</h2>${historial}${antes ? `<ul class="lista movs-vecino"><li><span class="d" style="color:var(--gris)">Venía debiendo de antes</span><span class="v" style="color:var(--gris)">${pesos(antes)}</span></li></ul>` : ''}</section>` : ''}
    </main>
    <div class="pie" role="region" aria-label="Acciones" style="padding-inline:1.5rem"><a class="btn" href="#cliente-${c.id}">${ic('ok', 24, 2.6)}Listo</a></div></div>`
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
/* ───── Borrar un cliente: con la basurita de su ficha o deslizándolo en la Libreta ─────
   Siempre se pregunta. Si debe, se pregunta otra vez mostrando cuánto. Luego, unos segundos para «Deshacer». */
function pedirBorrarCliente(c, desde = 'libreta', alCerrar = () => {}) {
  const saldo = saldoDe(c.id), cuantos = movsDe(c.id).length, n = esc(nombreCorto(c.nombre));
  let borrando = false;
  const enfocar = d => { const h = d.querySelector('h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } };
  const paso1 = d => pintarHoja(`<h2>¿Borrar a ${esc(c.nombre)}?</h2>
    <p style="font-size:1.125rem;line-height:1.55">${cuantos ? `Se borra de su libreta con su historial (${cuantos} ${cuantos === 1 ? 'anotación' : 'anotaciones'}). El enlace que ya tiene ${n} no cambia.` : 'Se borra de su libreta. No tiene nada anotado.'}</p>
    <button type="button" class="btn-sec peligro" data-accion="si-borrar">${ic('basura', 22, 2.2)}Sí, borrar</button>
    <button type="button" class="btn-link" data-cerrar>Cancelar</button>`, d => {
    d.querySelector('[data-accion="si-borrar"]').addEventListener('click', () => saldo > 0 ? paso2(d) : borrar());
  }, d);
  const paso2 = d => {
    pintarHoja(`<h2>${n} todavía le debe ${pesos(saldo)}</h2>
      <div class="info atencion">${ic('atencion', 22)}<p>Si lo borra, pierde el registro de esa plata. Si ya le pagó, mejor anote el pago primero.</p></div>
      <button type="button" class="btn" data-cerrar>No borrar</button>
      <button type="button" class="btn-sec peligro" data-accion="si-borrar">${ic('basura', 22, 2.2)}Borrar aunque debe</button>`, d => {
      d.querySelector('[data-accion="si-borrar"]').addEventListener('click', borrar);
    }, d);
    enfocar(d);
    if (typeof Voz !== 'undefined') Voz.decir('borrar-debe');
  };
  const borrar = async () => {
    if (borrando) return; borrando = true;
    const b = await borrarCliente(c.id);
    if (!b) { borrando = false; cerrarHoja(); avisar('No se pudo borrar. Intente otra vez.', { icono: 'atencion' }); return; }
    ir('inicio');
    avisar(`Borró a ${nombreCorto(c.nombre)} de su libreta.`, { acciones: [{ texto: 'Deshacer', fuerte: true, fn: async () => {
      if (Datos.clientes.has(c.id)) return;
      await restaurarCliente(b);
      if (desde === 'ficha' && location.hash.slice(1) === 'inicio' && !hojaAbierta()) ir(`cliente-${c.id}`); else mostrarRuta({ animar: false });
      avisar('Listo, se deshizo.');
    } }] });
  };
  const d = abrirHoja('', () => {}, { nombre: 'borrar-cliente' });
  paso1(d); enfocar(d);
  d.addEventListener('close', () => { if (!borrando) alCerrar(); }, { once: true });
}

/* ───── Aviso de pago del vecino: «Confirmar en Fiao» lleva aquí ─────
   #pago-<cliente>-<monto>.<medio>. Abre la cuenta con el aviso arriba; nunca anota solo. */
const MEDIO_AVISO = { nequi: ['por Nequi', 'en su Nequi'], breb: ['por Bre-B', 'en su banco'], otro: ['', ''] };
V.pago = (id, x = '') => {
  const [m, md] = String(x).split('.');
  const montoAviso = /^\d{1,9}$/.test(m || '') ? +m : 0, medio = MEDIO_AVISO[md] ? md : 'otro';
  const c = Datos.tienda ? cliente(id) : null;
  if (!c) {
    /* El cliente no está aquí. En iPhone pasa siempre con Fiao instalada: WhatsApp abre el enlace en Safari,
       y Safari no ve la libreta de la app de la pantalla de inicio. Puente: copiar el aviso y pegarlo en el buscador de Fiao. */
    const ios = esIOS(), enlace = `${location.href.replace(/#.*$/, '')}#pago-${id}-${x}`, [por] = MEDIO_AVISO[medio];
    return {
      titulo: 'Aviso de pago',
      html: `<div class="pantalla">${barra({ titulo: 'Aviso de pago', volver: Datos.tienda ? 'inicio' : null, ayuda: false })}<main class="contenido holgado">
        <section class="aviso-pago" aria-labelledby="ap-titulo"><div class="ap-cab">${ic('dinero', 24, 2.2)}<h2 id="ap-titulo">Un cliente le avisó un pago${montoAviso ? ` de ${pesos(montoAviso)}` : ''}${por ? ` ${por}` : ''}</h2></div>
          <p>${Datos.tienda ? 'Pero ese cliente no está en la libreta de este navegador.' : 'Pero su libreta de Fiao no está en este navegador.'}</p></section>
        <p style="font-size:1.125rem;line-height:1.55">${ios ? 'En iPhone, WhatsApp abre los enlaces en Safari, y Safari no ve la libreta de Fiao que tiene en su pantalla de inicio.' : 'Puede pasar si su libreta está en otro navegador o en otro celular, o si borró al cliente.'}</p>
        <ol class="pasos-copiar">
          <li><span><b>Copie el aviso</b> con el botón de abajo.</span></li>
          <li><span><b>Abra Fiao</b> ${ios ? 'desde su pantalla de inicio' : 'donde la usa'}.</span></li>
          <li><span><b>Péguelo en el buscador</b> de la Libreta: mantenga el dedo encima y toque «Pegar».</span></li>
        </ol>
        <button type="button" class="btn" data-accion="copiar-aviso">${ic('copiar', 24, 2.2)}Copiar aviso</button>
        <p class="ayuda enlace-aviso" id="enlace-aviso">${esc(enlace)}</p>
        ${Datos.tienda ? `<a class="btn-link" href="#inicio">Ir a la libreta de este navegador</a>` : ''}
      </main></div>`,
      montar(r) {
        const bt = r.querySelector('[data-accion="copiar-aviso"]');
        bt.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(enlace);
            bt.innerHTML = `${ic('ok', 24, 2.6)}Aviso copiado`;
            avisar('Aviso copiado. Ahora abra Fiao y péguelo en el buscador.');
          } catch (e) {
            const rango = document.createRange(); rango.selectNodeContents(r.querySelector('#enlace-aviso'));
            const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rango);
            avisar('Quedó marcado. Manténgalo presionado y toque «Copiar».', { icono: null });
          }
        });
      }
    };
  }
  const v = V.cliente(c.id);
  return { ...v, montar(r) {
    /* La dirección queda como la de la cuenta: al volver o recargar no se repite el aviso. */
    history.replaceState(history.state, '', `#cliente-${c.id}`); _rutaAnterior = `cliente-${c.id}`;
    v.montar(r);
    mostrarAvisoPago(r, c, montoAviso, medio);
  } };
};
function mostrarAvisoPago(r, c, montoAviso, medio) {
  const saldo = saldoDe(c.id), n = esc(nombreCorto(c.nombre)), [por, donde] = MEDIO_AVISO[medio];
  const hace3 = Date.now() - 3 * 86400000;
  const igual = montoAviso && movsDe(c.id).find(m => m.tipo === 'pago' && !m.anulado && m.monto === montoAviso && new Date(m.fecha) > hace3);
  const caja = document.createElement('section');
  caja.className = 'aviso-pago'; caja.setAttribute('aria-labelledby', 'ap-titulo');
  caja.innerHTML = `<div class="ap-cab">${ic('dinero', 24, 2.2)}<h2 id="ap-titulo" tabindex="-1">${n} dice que le pagó${montoAviso ? ` ${pesos(montoAviso)}` : ''}${por ? ` ${por}` : ''}</h2></div>
    ${saldo > 0 ? `<p>Antes de anotarlo, revise${donde ? ` ${donde}` : ''} que la plata sí llegó.</p>` : `<p>Su cuenta ya está al día: puede que ya haya anotado este pago.</p>`}
    ${igual ? `<p class="ap-nota">${ic('atencion', 20, 2.2)}<span>Ya anotó un pago de ${pesos(igual.monto)} ${elDia(igual.fecha)} a las ${hora(igual.fecha)}. Revise que no sea el mismo.</span></p>` : ''}
    ${montoAviso > saldo && saldo > 0 ? `<p class="ap-nota">${ic('atencion', 20, 2.2)}<span>Es más de lo que debe (${pesos(saldo)}).</span></p>` : ''}
    ${saldo > 0 ? `<button type="button" class="btn verde" data-accion="ap-anotar">${ic('ok', 24, 2.6)}Ya llegó: anotar pago</button>` : ''}
    <button type="button" class="btn-link" data-accion="ap-cerrar">${saldo > 0 ? 'Todavía no ha llegado' : 'Entendido'}</button>`;
  const main = r.querySelector('.contenido'); main.insertBefore(caja, main.firstElementChild);
  caja.querySelector('[data-accion="ap-anotar"]')?.addEventListener('click', () => abrirPago(c, { monto: montoAviso, medio }));
  caja.querySelector('[data-accion="ap-cerrar"]').addEventListener('click', () => { caja.remove(); r.querySelector('h1')?.focus({ preventScroll: true }); });
  requestAnimationFrame(() => caja.querySelector('h2').focus({ preventScroll: true }));
  if (saldo > 0 && typeof Voz !== 'undefined') Voz.decir('aviso-pago');
}

V.cliente = (id, extra) => {
  const c = cliente(id); if (!c) return null;
  const e = estadoDe(c); const p = puntualidad(c); const movs = movsDe(c.id);
  const uso = usoCupo(c, e.saldo);
  const todo = extra === 'todo';
  const visibles = todo ? movs : movs.slice(0, 10);
  const recordar = c.cel && permisoOk(c) && necesitaRecordatorio(c, e);
  const yaRecordado = recordar && recordadoHoy(c.id);
  const cuerpo = `${e.saldo > 0 ? `<div class="cifra-cab"><span class="rotulo">Debe</span><span class="cifra">${monto(e.saldo)}</span><span style="margin-top:.5rem">${estadoHtml(c, e)}</span></div>`
      : `<span class="estado ok" style="font-size:1.25rem;line-height:1.75rem;align-self:flex-start">${ic('ok', 24, 2.8)}No debe nada</span>`}
    ${c.cupo ? `<div style="display:flex;flex-direction:column;gap:.375rem"><div class="medidor${uso > 1 ? ' lleno' : ''}" role="meter" aria-label="Cupo usado" aria-valuemin="0" aria-valuemax="${c.cupo}" aria-valuenow="${Math.max(0, Math.min(e.saldo, c.cupo))}" aria-valuetext="${pesos(Math.max(0, e.saldo))} de ${pesos(c.cupo)}"><span style="width:${Math.max(0, Math.min(100, uso * 100))}%"></span></div>
      <span class="par gris"><span>Cupo ${pesos(c.cupo)}</span><span${uso > 1 ? ' style="color:var(--blanco);font-weight:600"' : ''}>${uso > 1 ? `Se pasó ${pesos(e.saldo - c.cupo)}` : `Le quedan ${pesos(c.cupo - Math.max(0, e.saldo))}`}</span></span></div>` : ''}
    ${p.de >= 2 ? `<span class="estado" style="color:var(--azul-claro-texto)">${ic('estrella', 18, 2.2)}Paga a tiempo ${p.a} de ${p.de} veces</span>` : ''}`;
  const atajo = (clase, accion, icono, texto, extraAttr = '') => `<button type="button" class="atajo${clase ? ' ' + clase : ''}" data-accion="${accion}"${extraAttr}><span class="c" aria-hidden="true">${ic(icono, 26, 2.4)}</span>${texto}</button>`;
  return {
    titulo: c.nombre,
    html: `<div class="pantalla">${cabMarca({ titulo: esc(c.nombre), sub: esc(c.detalle || ''), volver: 'inicio', botones: btnRedondo('lapiz', 'Editar cliente', { href: `editar-${c.id}` }) + btnRedondo('basura', `Borrar a ${esc(c.nombre)}`, { accion: 'borrar-cliente' }), cuerpo, tituloAbajo: true })}
    <main class="contenido">
      <div class="atajos">
        ${atajo('principal', 'anotar', 'mas', 'Anotar')}
        ${e.saldo > 0 ? atajo('pago', 'pago', 'dinero', 'Pagó') : ''}
        ${recordar ? (yaRecordado ? atajo('', 'recordar', 'ok', 'Recordado', ' disabled') : atajo('', 'recordar', 'chat', 'Recordar')) : ''}
        ${movs.length ? `<a class="atajo" href="#cuenta-${c.id}"><span class="c" aria-hidden="true">${ic('girar', 26, 2.4)}</span>Mostrar</a>` : ''}
        ${permisoOk(c) && e.saldo > 0 ? atajo('', 'cuenta', 'enviar', 'Enviar cuenta') : ''}
      </div>
      ${permisoOk(c) && e.saldo > 0 ? `<p class="ayuda" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:0 .25rem;margin-top:-.5rem">${porQue('enlace', '¿Qué ve el vecino en su cuenta?')}</p>` : ''}
      ${consejo('cliente', 'Toque una línea del historial para ver el detalle.')}
      ${c.permiso?.estado === 'pedido' ? `<div class="info">${ic('chat', 22)}<p>¿${esc(nombreCorto(c.nombre))} ya aceptó los recibos?</p><button type="button" class="btn-mini sec" data-accion="permiso">Anotar respuesta</button></div>` : ''}
      <section aria-labelledby="t-movs" style="display:flex;flex-direction:column;gap:.375rem"><h2 class="titulo-seccion" id="t-movs">Historial</h2>
        ${movs.length ? agruparPorDia(visibles).map(g => `<h3 class="dia-historial">${g.dia}</h3><ul class="lista">${g.items.map(filaMov).join('')}</ul>`).join('') : '<p class="vacio">Todavía no hay nada anotado.</p>'}
        ${!todo && movs.length > 10 ? `<a class="btn-sec" href="#cliente-${c.id}-todo">Ver todo el historial (${movs.length})</a>` : ''}
        ${movs.length ? `<p class="ayuda" style="display:flex;flex-wrap:wrap;align-items:center;gap:0 .25rem">Nada se borra. ${porQue('borrar')}</p>` : ''}
      </section>
      <div style="display:flex;flex-wrap:wrap;gap:.25rem 1rem">${!c.cupo ? `<a class="btn-link izq" href="#editar-${c.id}">Ponerle cupo</a>` : ''}${c.cel ? `<button type="button" class="btn-link izq" data-accion="chat">${ic('chat', 20, 2.2)}Escribirle</button>` : ''}</div>
    </main></div>`,
    montar(r) {
      Vista.despues = null;
      /* 5 · Si el saldo cambió (pagó o fió), la cifra cuenta hasta el valor nuevo; al quedar al día, el visto se dibuja. */
      const saldos = Vista.saldos || (Vista.saldos = {}), previo = saldos[c.id];
      if (typeof previo === 'number' && previo !== e.saldo) {
        if (e.saldo > 0) contar(r.querySelector('.cab-marca .cifra'), Math.max(0, previo), e.saldo);
        else if (previo > 0 && !reducido()) r.querySelector('.cab-marca .estado.ok svg')?.classList.add('dibuja');
      }
      saldos[c.id] = e.saldo;
      r.querySelector('[data-accion="anotar"]').addEventListener('click', () => abrirAnotar(c));
      r.querySelector('[data-accion="borrar-cliente"]').addEventListener('click', () => pedirBorrarCliente(c, 'ficha'));
      r.querySelector('[data-accion="pago"]')?.addEventListener('click', () => abrirPago(c));
      r.querySelector('[data-accion="permiso"]')?.addEventListener('click', () => abrirPermiso(c));
      r.querySelectorAll('.mov').forEach(b => b.addEventListener('click', () => {
        const abierto = b.getAttribute('aria-expanded') === 'true'; b.setAttribute('aria-expanded', !abierto);
        r.querySelector('#' + b.getAttribute('aria-controls')).hidden = abierto;
      }));
      r.querySelector('[data-accion="chat"]')?.addEventListener('click', () => { const u = `https://wa.me/${tienda().demo ? '' : celInternacional(c.cel)}`; const w = window.open(u, '_blank', 'noopener'); if (!w) location.href = u; });
      r.querySelector('[data-accion="recordar"]:not([disabled])')?.addEventListener('click', async () => {
        if (!puedeRecordarAhora()) { avisar(motivoNoRecordar(), { icono: 'reloj' }); return; }
        if (recordadoHoy(c.id)) { avisar('Ya se le recordó hoy. La ley permite uno al día.', { icono: 'reloj' }); return; }
        abrirWhatsApp(c.cel, mensajeRecordatorio(c, estadoDe(c)));
        await registrarContacto(c.id, 'recordatorio');
        mostrarRuta({ animar: false }); avisar(`Abrimos WhatsApp con el recordatorio para ${nombreCorto(c.nombre)}.`);
      });
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
      <button type="button" class="btn-link izq" data-accion="anular" style="color:var(--alerta-texto)">Anular esta anotación</button>
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
