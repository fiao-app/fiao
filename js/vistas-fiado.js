/* Fiao · pantallas del fiado y del pago:
   Anotar · Aviso de cupo · Anotado · Mostrárselo al cliente · Ficha · Corregir · Registrar pago · Pago registrado */
'use strict';

/** Muestra el mensaje con el enlace largo resumido, para la vista previa. */
function vistaMensaje(texto) {
  return esc(texto).replace(/https?:\/\/\S+/g, '<span class="enlace">enlace a su cuenta</span>');
}

/* ───── Anotar fiado ───── */
V.anotar = (id, opcion) => {
  const c = cliente(id); if (!c) return null;
  const saldo = saldoDe(c.id);
  let monto = 0, conLista = opcion === 'lista' && !!c.lista;
  const tope = c.cupo;
  const subCliente = () => `Debe ${pesos(saldo)}${tope ? ` de ${pesos(tope)}` : ' · sin límite'}`;
  return {
    titulo: 'Anotar fiado',
    html: `<div class="pantalla">${barra({ titulo: 'Anotar fiado', volver: opcion === 'lista' ? `cliente-${c.id}` : 'elegir' })}
    <main class="contenido" style="gap:.625rem">
      <div class="cliente-elegido"><span class="medio"><b>${esc(c.nombre)}</b><span>${subCliente()}</span></span><a class="btn-link" href="#elegir" style="font-size:1.0625rem">Cambiar</a></div>
      <div class="monto-anotar"><span class="rotulo" id="r-monto">¿Cuánto se llevó?</span><output class="monto-grande" id="monto" aria-labelledby="r-monto" aria-live="polite">$0</output>
        <span class="pildora atencion" id="aviso-cupo" role="status" hidden></span></div>
      <div class="chips">
        ${c.lista ? `<button type="button" class="chip" aria-pressed="${conLista}" data-accion="lista"><span class="ok">${ic('ok', 18, 2.6)}</span>${esc(c.lista.nombre || 'Lo de siempre')}</button>` : ''}
        <button type="button" class="chip" aria-pressed="false" data-accion="llevo" aria-controls="caja-llevo">¿Quién lo llevó?</button>
      </div>
      <div class="campo" id="caja-llevo" hidden><label for="a-llevo">¿Quién lo llevó?</label><input class="entrada" id="a-llevo" placeholder="Ej.: su hijo Daniel" autocomplete="off"></div>
      <div class="campo"><label for="a-que">¿Qué se llevó? <span class="opcional" style="font-weight:400;color:var(--gris)">(opcional)</span></label><input class="entrada" id="a-que" value="${conLista ? esc(c.lista.productos) : ''}" placeholder="Ej.: pan, leche y huevos" autocomplete="off"></div>
      ${!c.lista ? `<label class="check" id="caja-guardar-lista" hidden><input type="checkbox" id="a-guardar-lista">Guardar como "Lo de siempre" de ${esc(nombreCorto(c.nombre))}</label>` : ''}
      <div class="teclado" role="group" aria-label="Teclado para el monto">
        ${['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => `<button type="button" data-tecla="${d}">${d}</button>`).join('')}
        <button type="button" class="ceros" data-tecla="000" aria-label="Tres ceros">000</button><button type="button" data-tecla="0">0</button>
        <button type="button" class="borrar" data-tecla="borrar" aria-label="Borrar">${ic('borrar', 28)}</button>
      </div>
    </main>
    <div class="abajo"><div class="pie" role="region" aria-label="Acciones"><button type="button" class="btn" id="a-anotar" disabled>Escriba el monto</button></div></div></div>`,
    montar(r) {
      const out = r.querySelector('#monto'), aviso = r.querySelector('#aviso-cupo'), btn = r.querySelector('#a-anotar');
      const que = r.querySelector('#a-que'), cajaLista = r.querySelector('#caja-guardar-lista');
      const pintar = () => {
        out.textContent = pesos(monto);
        const nuevo = saldo + monto, pasa = tope ? nuevo - tope : -1;
        if (monto && pasa > 0) { aviso.hidden = false; aviso.innerHTML = `${ic('atencion', 18, 2.2)}Pasa su cupo por ${pesos(pasa)}`; } else aviso.hidden = true;
        btn.disabled = !monto;
        btn.textContent = !monto ? 'Escriba el monto' : pasa > 0 ? `Anotar ${pesos(monto)} igual` : `Anotar ${pesos(monto)}`;
      };
      const tecla = t => {
        if (t === 'borrar') monto = Math.floor(monto / 10);
        else { const s = String(monto || '') + t; if (s.replace(/^0+/, '').length <= 8) monto = parseInt(s, 10) || 0; }
        pintar();
      };
      r.querySelector('.teclado').addEventListener('click', ev => { const b = ev.target.closest('[data-tecla]'); if (b) tecla(b.dataset.tecla); });
      const teclado = ev => {
        if (ev.target.matches('input, textarea')) return;
        if (/^\d$/.test(ev.key)) { tecla(ev.key); ev.preventDefault(); }
        else if (ev.key === 'Backspace') { tecla('borrar'); ev.preventDefault(); }
        else if (ev.key === 'Enter' && monto) { btn.click(); ev.preventDefault(); }
      };
      document.addEventListener('keydown', teclado);
      Vista.limpiar.push(() => document.removeEventListener('keydown', teclado));
      r.querySelector('[data-accion="lista"]')?.addEventListener('click', ev => {
        conLista = !conLista; ev.currentTarget.setAttribute('aria-pressed', conLista);
        que.value = conLista ? c.lista.productos : '';
      });
      r.querySelector('[data-accion="llevo"]').addEventListener('click', ev => {
        const caja = r.querySelector('#caja-llevo'); caja.hidden = !caja.hidden; ev.currentTarget.setAttribute('aria-pressed', !caja.hidden);
        if (!caja.hidden) r.querySelector('#a-llevo').focus();
      });
      if (cajaLista) que.addEventListener('input', () => { cajaLista.hidden = !que.value.trim(); });
      const guardar = async () => {
        const qv = que.value.trim();
        const m = await registrarFiado({ c, monto, que: conLista && qv === c.lista.productos ? (c.lista.nombre || 'Lo de siempre') : qv, llevo: r.querySelector('#a-llevo').value });
        if (conLista) { c.lista.ultimoMonto = monto; await guardarCliente(c); }
        if (cajaLista && r.querySelector('#a-guardar-lista').checked && qv) { c.lista = { nombre: 'Lo de siempre', productos: qv, ultimoMonto: monto }; await guardarCliente(c); }
        ir(`anotado-${m.id}`);
      };
      btn.addEventListener('click', () => {
        if (!monto) return;
        const nuevo = saldo + monto;
        if (tope && nuevo > tope * 1.2) {
          const sube = Math.ceil(nuevo / 10000) * 10000;
          abrirHoja(`<div style="display:flex;gap:.875rem;align-items:flex-start"><span style="width:3.25rem;height:3.25rem;flex-shrink:0;border-radius:50%;background:var(--naranja-fondo);color:var(--naranja);display:flex;align-items:center;justify-content:center">${ic('atencion', 28, 2.2)}</span>
            <div style="display:flex;flex-direction:column;gap:.25rem"><h2 id="cupo-t">Esta compra pasa bastante el cupo de ${esc(nombreCorto(c.nombre))}</h2><p style="color:var(--gris-2)">Usted decide. Fiao solo avisa cuando se pasa más de una quinta parte.</p></div></div>
            <div class="tabla"><div><span>Debe ahora</span><b>${pesos(saldo)}</b></div><div><span>Con esta compra (${pesos(monto)})</span><b>${pesos(nuevo)}</b></div><div class="resaltada"><span>Su cupo es</span><b>${pesos(tope)}</b></div></div>
            <button type="button" class="btn" data-op="igual">Anotar de todas formas</button>
            <button type="button" class="btn-sec" data-op="subir">Subir su cupo a ${pesos(sube)} y anotar</button>
            <button type="button" class="btn-link" data-cerrar>Cambiar el monto</button>`, d => {
            d.querySelector('[data-op="igual"]').addEventListener('click', () => { cerrarHoja(); guardar(); });
            d.querySelector('[data-op="subir"]').addEventListener('click', async () => { c.cupo = sube; await guardarCliente(c); cerrarHoja(); guardar(); });
          });
          return;
        }
        guardar();
      });
      pintar();
    }
  };
};

/* ───── Confirmación de fiado o pago, con sus caminos para que el vecino lo vea ───── */
function pantallaListo({ m, c, titulo, resumen, mensaje, tipoContacto }) {
  const n = nombreCorto(c.nombre);
  const puedeWA = permisoOk(c);
  const semanal = c.recibos === 'semanal';
  let acciones;
  if (puedeWA && !semanal && c.recibos !== 'mostrar') acciones = `<button type="button" class="btn" data-accion="whatsapp">${ic('enviar', 24, 2.4)}Enviar por WhatsApp</button><a class="btn-sec" href="#mostrar-${m.id}">${ic('girar', 22, 2.2)}Mostrárselo a ${esc(n)} aquí</a><a class="btn-link" href="#inicio">Listo, volver a la libreta</a><p class="nota">Sale de su propio WhatsApp. Fiao no envía nada por su cuenta.</p>`;
  else if (semanal) acciones = `<a class="btn" href="#mostrar-${m.id}">${ic('girar', 24, 2.4)}Mostrárselo a ${esc(n)} aquí</a><button type="button" class="btn-sec" data-accion="whatsapp">${ic('enviar', 22, 2.2)}Enviar ahora por WhatsApp</button><a class="btn-link" href="#inicio">Listo, volver a la libreta</a><p class="nota">${esc(n)} recibe un resumen semanal; este movimiento va incluido.</p>`;
  else acciones = `<a class="btn" href="#mostrar-${m.id}">${ic('girar', 24, 2.4)}Mostrárselo a ${esc(n)} aquí</a>${c.cel && c.permiso?.estado !== 'no' ? `<a class="btn-sec" href="#permiso-${c.id}">Pedirle permiso para WhatsApp</a>` : ''}<a class="btn-link" href="#inicio">Listo, volver a la libreta</a>`;
  return {
    titulo,
    html: `<div class="pantalla blanca"><main class="contenido holgado">
      <div class="confirmacion" role="status"><span class="sello">${ic('ok', 46, 2.6)}</span><h1 tabindex="-1">${titulo}</h1><p>${resumen}</p>
        <span class="nota">${m.tipo === 'pago' ? 'Recibió' : 'Atendió'} ${esc(m.atendio || '—')} · ${hora(new Date(m.fecha))}</span></div>
      ${puedeWA ? `<div style="display:flex;flex-direction:column;gap:.5rem"><h2 class="titulo-seccion suave">${m.tipo === 'pago' ? 'Su comprobante de pago' : 'Así le llega el recibo'}</h2><div class="burbuja">${vistaMensaje(mensaje())}</div></div>`
        : `<div class="info">${ic('candado', 22)}<p>${c.cel ? `${esc(n)} aún no ha aceptado recibos por WhatsApp. Muéstreselo aquí mismo.` : `${esc(n)} no tiene celular registrado. Muéstreselo aquí mismo.`}</p></div>`}
    </main><div class="pie" role="region" aria-label="Acciones">${acciones}</div></div>`,
    montar(r) {
      r.querySelector('[data-accion="whatsapp"]')?.addEventListener('click', async ev => {
        const boton = ev.currentTarget;
        abrirWhatsApp(c.cel, mensaje());
        m.enviado = new Date().toISOString(); await guardarMov(m); await registrarContacto(c.id, tipoContacto, m.id);
        boton.outerHTML = `<p class="pildora azul" style="align-self:center">${ic('ok', 18, 2.6)}Abrimos WhatsApp con el mensaje listo</p>`;
      });
    }
  };
}
V.anotado = id => {
  const m = mov(id); if (!m) return null; const c = cliente(m.clienteId);
  return pantallaListo({ m, c, titulo: '¡Anotado!', tipoContacto: 'recibo', mensaje: () => mensajeFiado(c, m),
    resumen: `<b>${pesos(m.monto)}</b> a ${esc(c.nombre)}.<br>Su cuenta va en <b>${pesos(saldoDe(c.id))}</b>.` });
};
V.pagolisto = id => {
  const m = mov(id); if (!m) return null; const c = cliente(m.clienteId); const s = saldoDe(c.id);
  return pantallaListo({ m, c, titulo: 'Pago registrado', tipoContacto: 'recibo', mensaje: () => mensajePago(c, m),
    resumen: `<b>${pesos(m.monto)}</b> ${MEDIOS[m.medio] || ''} de ${esc(c.nombre)}.<br>${s > 0 ? punto(`Queda debiendo <b>${pesos(s)}</b>${c.proximaFecha ? `, para el ${fechaLarga(diaDe(c.proximaFecha))}` : ''}`) : '<b>Su cuenta quedó en cero.</b>'}` });
};

/* ───── Mostrárselo al cliente en la tienda ───── */
V.mostrar = id => {
  const m = mov(id); if (!m) return null; const c = cliente(m.clienteId);
  const n = nombreCorto(c.nombre), s = saldoDe(c.id), pago = m.tipo === 'pago';
  return {
    titulo: `Para ${n}`,
    html: `<div class="pantalla blanca"><header class="mostrar-barra"><span style="display:inline-flex;align-items:center;gap:.5rem">${ic('girar', 22, 2.2)}Gire el celular hacia ${esc(n)}</span><a class="btn-icono" href="#${pago ? 'pagolisto' : 'anotado'}-${m.id}" aria-label="Cerrar">${ic('cerrar', 26, 2.4)}</a></header>
    <main class="mostrar">
      <h1 class="para" tabindex="-1">${esc(n)}, ${pago ? 'recibimos su pago:' : 'esto quedó anotado:'}</h1>
      <div style="display:flex;flex-direction:column;gap:.25rem"><span class="cifra-xl">${pesos(m.monto)}</span>${!pago && m.que ? `<span class="que">${esc(m.que)}</span>` : ''}${pago ? `<span class="que">${esc(MEDIOS[m.medio] || '')}</span>` : ''}
        <span class="cuando">${mayuscula(fechaLarga(new Date(m.fecha)))} · ${hora(new Date(m.fecha))}</span></div>
      <hr>
      <div style="display:flex;flex-direction:column;gap:.25rem">${s > 0 ? `<span style="font-size:1.375rem">${pago ? 'Queda debiendo' : 'Su cuenta va en'}</span><span class="cifra-l">${pesos(s)}</span>
        ${c.proximaFecha ? `<span class="acordado">${ic('calendario', 22)}${punto(`Acordaron pagar el ${fechaLarga(diaDe(c.proximaFecha))}`)}</span>` : ''}` : `<span class="cifra-l" style="color:var(--azul)">Su cuenta quedó en cero</span>`}</div>
    </main>
    <div class="pie" role="region" aria-label="Acciones" style="padding-inline:1.5rem"><button type="button" class="btn alto" data-accion="visto">${ic('ok', 24, 2.6)}${esc(n)} está de acuerdo</button><a class="btn-link" href="#corregir-${m.id}">Hay un error, corregir</a><p class="nota">Fiao guarda que lo vio. Sin enviar nada.</p></div></div>`,
    montar(r) {
      r.querySelector('[data-accion="visto"]').addEventListener('click', async () => {
        m.visto = new Date().toISOString(); await guardarMov(m); avisar(`Quedó registrado que ${n} lo vio`); ir('inicio');
      });
    }
  };
};

/* ───── Ficha del cliente ───── */
function nombreMov(m) {
  if (m.tipo === 'pago') return `Pagó ${MEDIOS[m.medio] || ''}`.trim();
  if (m.tipo === 'saldo') return m.que || 'Lo que venía del cuaderno';
  return m.que ? mayuscula(m.que) : 'Fiado';
}
function filaMov(m, href = true) {
  const d = new Date(m.fecha);
  const partes = [`${mayuscula(cuando(d))} ${hora(d)}`];
  if (m.llevo) partes.push(`lo llevó ${esc(m.llevo)}`);
  if (m.atendio) partes.push(`${m.tipo === 'pago' ? 'recibió' : 'atendió'} ${esc(m.atendio)}`);
  const corr = (m.correcciones || []).length ? `<span class="detalle" style="display:inline-flex;align-items:center;gap:.25rem">${ic('lapiz', 16, 2.2)}Corregido: decía <s>${pesos(m.correcciones[0].de)}</s></span>` : '';
  const anul = m.anulado ? `<span class="detalle">Anulado: ${esc(m.anulado.motivo)}</span>` : '';
  const cls = ['fila', m.tipo === 'pago' ? 'pago' : '', m.anulado ? 'anulada' : ''].join(' ');
  const signo = m.tipo === 'pago' ? '− ' : '+ ';
  const dentro = `<span class="medio"><span class="nombre" style="font-size:1rem">${esc(nombreMov(m))}</span><span class="detalle">${partes.join(' · ')}</span>${corr}${anul}</span><span class="monto" style="font-size:1.0625rem">${signo}${pesos(m.monto)}</span>`;
  return `<li>${href ? `<a class="${cls}" href="#corregir-${m.id}" aria-label="${esc(nombreMov(m))}, ${signo.trim() === '−' ? 'pago' : 'fiado'} de ${pesos(m.monto)}, ${esc(partes[0])}. Tocar para corregir">${dentro}</a>` : `<div class="${cls}">${dentro}</div>`}</li>`;
}
V.cliente = id => {
  const c = cliente(id); if (!c) return null;
  const e = estadoDe(c); const p = puntualidad(c); const movs = movsDe(c.id);
  const uso = usoCupo(c, e.saldo);
  const ultLista = c.lista ? (c.lista.ultimoMonto || movs.find(m => m.tipo === 'fiado' && !m.anulado && normalizar(m.que) === normalizar(c.lista.nombre))?.monto) : null;
  const derecha = btnIcono('lapiz', 'Editar cliente', { href: `editar-${c.id}` }) + (c.cel ? btnIcono('chat', 'Escribirle por WhatsApp', { accion: 'chat' }) : '');
  return {
    titulo: c.nombre,
    html: `<div class="pantalla">${barra({ titulo: esc(c.nombre), sub: esc(c.detalle || `Paga: ${PREF_PAGO[c.pago].toLowerCase()}`), volver: 'inicio', derecha })}
    <main class="contenido">
      <section class="ficha-saldo" aria-label="Cuenta">
        ${e.saldo > 0 ? `<div style="display:flex;flex-direction:column"><span class="ayuda">Debe</span><span class="cifra">${pesos(e.saldo)}</span>${estadoHtml(c, e)}</div>` : `<div style="display:flex;flex-direction:column;gap:.25rem"><span class="cifra" style="color:var(--azul)">No debe nada</span></div>`}
        ${c.cupo ? `<div style="display:flex;flex-direction:column;gap:.25rem"><div class="medidor${uso > 1 ? ' lleno' : ''}" role="meter" aria-label="Cupo usado" aria-valuemin="0" aria-valuemax="${c.cupo}" aria-valuenow="${Math.max(0, Math.min(e.saldo, c.cupo))}" aria-valuetext="${pesos(Math.max(0, e.saldo))} de ${pesos(c.cupo)}"><span style="width:${Math.max(0, Math.min(100, uso * 100))}%"></span></div>
          <span class="par gris"><span>Cupo ${pesos(c.cupo)}</span><span${uso > 1 ? ' style="color:var(--naranja-osc);font-weight:700"' : ''}>${uso > 1 ? `Se pasó por ${pesos(e.saldo - c.cupo)}` : `Le quedan ${pesos(c.cupo - Math.max(0, e.saldo))}`}</span></span></div>` : '<span class="ayuda">Sin límite de cupo</span>'}
        ${p.de ? `<span style="display:flex;align-items:center;gap:.5rem">${ic('ok', 20, 2.4)}Paga a tiempo: <b>${p.a} de ${p.de} veces</b></span>` : ''}
      </section>
      ${c.cel && c.permiso?.estado !== 'si' ? `<div class="info">${ic('candado', 22)}<p>${c.permiso?.estado === 'no' ? `${esc(nombreCorto(c.nombre))} no acepta mensajes: sus cuentas se le muestran en la tienda.` : `${esc(nombreCorto(c.nombre))} aún no ha aceptado recibos por WhatsApp. <a href="#permiso-${c.id}">Pedir permiso</a>`}</p></div>` : ''}
      <div class="fila-botones"><a class="btn" style="min-height:3.5rem;font-size:1.125rem" href="#anotar-${c.id}">Anotar fiado</a>${e.saldo > 0 ? `<a class="btn-sec" href="#pago-${c.id}">Registrar pago</a>` : ''}</div>
      ${c.lista ? `<section class="tarjeta" aria-labelledby="t-lista"><h2 class="titulo-seccion" id="t-lista">${esc(c.lista.nombre || 'Lo de siempre')}</h2><p style="color:var(--gris-2)">${esc(mayuscula(c.lista.productos))}.${ultLista ? ` La última vez costó ${pesos(ultLista)}.` : ''}</p>
        <a class="btn-sec" style="min-height:3rem;border-color:var(--control);font-size:1.0625rem" href="#anotar-${c.id}-lista">Anotar esta lista (solo el monto)</a></section>` : ''}
      ${permisoOk(c) && e.saldo > 0 ? `<button type="button" class="btn-link izq" data-accion="cuenta">${ic('enlace', 20, 2.2)}&nbsp;Enviarle su cuenta por WhatsApp</button>` : ''}
      <section aria-labelledby="t-movs" style="display:flex;flex-direction:column;gap:.375rem"><h2 class="titulo-seccion" id="t-movs">Movimientos</h2>
        ${movs.length ? `<ul class="lista">${movs.slice(0, 40).map(m => filaMov(m)).join('')}</ul>${movs.length > 40 ? `<p class="ayuda">Se muestran los 40 más recientes de ${movs.length}.</p>` : ''}` : '<p class="vacio">Todavía no hay movimientos.</p>'}
        <p class="ayuda">Toque un movimiento para corregirlo o anularlo. Nada se borra.</p>
      </section>
    </main></div>`,
    montar(r) {
      Vista.despues = null;
      r.querySelector('[data-accion="chat"]')?.addEventListener('click', () => { const w = window.open(`https://wa.me/${celInternacional(c.cel)}`, '_blank', 'noopener'); if (!w) location.href = `https://wa.me/${celInternacional(c.cel)}`; });
      r.querySelector('[data-accion="cuenta"]')?.addEventListener('click', async () => {
        const t = tienda();
        abrirWhatsApp(c.cel, `Hola, ${nombreCorto(c.nombre)}. Esta es su cuenta en ${t.nombre}: va en ${pesos(saldoDe(c.id))}. Vea el detalle aquí: ${enlaceCuenta(c)}`);
        await registrarContacto(c.id, 'cuenta'); avisar('Abrimos WhatsApp con su cuenta');
      });
    }
  };
};

/* ───── Corregir o anular (nada se borra) ───── */
V.corregir = id => {
  const m = mov(id); if (!m) return null; const c = cliente(m.clienteId);
  const n = nombreCorto(c.nombre); const d = new Date(m.fecha);
  const historial = (m.correcciones || []).map(x => `<li>${mayuscula(cuando(new Date(x.fecha)))}: decía ${pesos(x.de)} y quedó en ${pesos(x.a)} (${esc(x.motivo)})</li>`).join('');
  const cabecera = `<div class="tarjeta"><span class="ayuda">${esc(c.nombre)} · ${cuando(d)} ${diaMes(d)}, ${hora(d)}</span>
    <span class="par" style="font-size:1.125rem;align-items:baseline"><b>${esc(nombreMov(m))}</b><span>${m.anulado ? 'Era' : 'Dice'} <b>${pesos(m.monto)}</b></span></span>
    ${historial ? `<ul style="margin:0;padding-left:1.25rem;color:var(--gris);font-size:1rem">${historial}</ul>` : ''}</div>`;
  if (m.anulado) return {
    titulo: 'Anotación anulada',
    html: `<div class="pantalla">${barra({ titulo: 'Anotación anulada', volver: `cliente-${c.id}` })}<main class="contenido holgado">${cabecera}
      <div class="info">${ic('lapiz', 22)}<p>Se anuló el ${fechaLarga(new Date(m.anulado.fecha))}, por este motivo: <b>${esc(m.anulado.motivo)}</b>. Queda en el historial para que los dos lo vean.</p></div></main></div>`
  };
  const motivos = m.tipo === 'pago' ? { monto: 'Me equivoqué en el monto', nopago: 'No pagó eso', otro: 'Otro motivo' } : { monto: 'Me equivoqué en el monto', nollevo: 'No se lo llevó', otro: 'Otro motivo' };
  return {
    titulo: 'Corregir anotación',
    html: `<div class="pantalla">${barra({ titulo: 'Corregir anotación', volver: `cliente-${c.id}` })}<main class="contenido holgado"><form style="display:flex;flex-direction:column;gap:inherit" id="form-corregir" novalidate>${cabecera}
      <div class="campo"><label for="k-monto">Debe decir</label><input class="entrada grande" id="k-monto" inputmode="numeric" value="${pesos(m.monto)}" autocomplete="off"></div>
      ${grupoOpciones('motivo', '¿Qué pasó?', motivos, 'monto')}
      <div class="info">${ic('lapiz', 22)}<p>Nada se borra. ${esc(n)} verá en su cuenta: <b>“Corregido: decía ${pesos(m.monto)}, quedó en <span id="k-nuevo">${pesos(m.monto)}</span>”</b>.</p></div>
      ${permisoOk(c) ? `<label class="check"><input type="checkbox" id="k-avisar" checked>Avisarle a ${esc(n)} del cambio por WhatsApp</label>` : ''}
      <button type="button" class="btn-sec peligro" data-accion="anular">Anular esta anotación</button>
      <p id="k-error" class="error" role="alert" hidden></p>
    </form></main><div class="pie" role="region" aria-label="Acciones"><button type="submit" form="form-corregir" class="btn">Guardar corrección</button></div></div>`,
    montar(r) {
      const leer = activarGrupos(r);
      const inp = r.querySelector('#k-monto');
      activarCampoPesos(inp, v => { r.querySelector('#k-nuevo').textContent = pesos(v); });
      const avisarle = () => r.querySelector('#k-avisar')?.checked;
      r.querySelector('[data-accion="anular"]').addEventListener('click', async () => {
        const motivo = motivos[leer('motivo')] || 'Otro motivo';
        const si = await confirmar({ titulo: '¿Anular esta anotación?', texto: `Deja de contar en la cuenta de ${esc(n)}, pero queda en el historial con el motivo: <b>${esc(motivo)}</b>.`, si: 'Anular anotación', peligro: true });
        if (!si) return;
        await anularMov(m, motivo);
        if (avisarle()) { abrirWhatsApp(c.cel, mensajeCorreccion(c, m, true)); await registrarContacto(c.id, 'correccion', m.id); }
        avisar('Anotación anulada'); ir(`cliente-${c.id}`);
      });
      r.querySelector('#form-corregir').addEventListener('submit', async ev => {
        ev.preventDefault();
        const v = leerPesos(inp.value), err = r.querySelector('#k-error');
        if (!v) { err.textContent = 'Escriba el monto correcto. Si no debió anotarse, toque "Anular esta anotación".'; err.hidden = false; inp.focus(); return; }
        if (v === m.monto) { err.textContent = 'El monto es el mismo de antes. Cámbielo o vuelva atrás.'; err.hidden = false; inp.focus(); return; }
        await corregirMov(m, v, motivos[leer('motivo')]);
        if (avisarle()) { abrirWhatsApp(c.cel, mensajeCorreccion(c, m, false)); await registrarContacto(c.id, 'correccion', m.id); }
        avisar('Corrección guardada'); ir(`cliente-${c.id}`);
      });
    }
  };
};

/* ───── Registrar pago o abono ───── */
V.pago = id => {
  const c = cliente(id); if (!c) return null;
  const saldo = saldoDe(c.id); const t = tienda();
  if (saldo <= 0) return { titulo: 'Registrar pago', html: `<div class="pantalla">${barra({ titulo: 'Registrar pago', volver: `cliente-${c.id}` })}<main class="contenido holgado"><div class="info">${ic('ok', 22)}<p>${esc(c.nombre)} no debe nada.</p></div></main></div>` };
  const hoy = new Date();
  const opciones = {};
  const pon = (k, d, rot) => { const iso = isoDia(d); if (!Object.values(opciones).some(o => o.iso === iso)) opciones[k] = { iso, rot }; };
  pon('manana', sumarDias(hoy, 1), `Mañana, ${fechaCorta(sumarDias(hoy, 1))}`);
  const vie = fechaPorPreferencia('viernes', sumarDias(hoy, 1)); pon('viernes', vie, mayuscula(fechaCorta(vie)));
  const qui = fechaPorPreferencia('quincena', sumarDias(hoy, 1)); pon('quincena', qui, `Quincena, ${fechaCorta(qui)}`);
  return {
    titulo: 'Registrar pago',
    html: `<div class="pantalla">${barra({ titulo: 'Registrar pago', sub: `${esc(c.nombre)} · debe ${pesos(saldo)}`, volver: `cliente-${c.id}` })}<main class="contenido"><form style="display:flex;flex-direction:column;gap:inherit" id="form-pago" novalidate>
      <div class="segmento" role="radiogroup" aria-label="Tipo de pago" data-grupo="tipo">
        <button type="button" role="radio" aria-checked="true" data-valor="todo">Paga todo</button><button type="button" role="radio" aria-checked="false" data-valor="abono">Abona una parte</button></div>
      <div class="campo"><label for="p-monto" id="p-rot">¿Cuánto pagó?</label><input class="entrada grande" id="p-monto" inputmode="numeric" value="${pesos(saldo)}" autocomplete="off" aria-describedby="p-ayuda"><span class="ayuda" id="p-ayuda">Cualquier cantidad sirve. Cada abono lleva su recibo.</span></div>
      ${grupoOpciones('medio', '¿Cómo pagó?', { efectivo: 'Efectivo', nequi: 'Nequi', breb: 'Bre-B', otro: 'Otro' }, 'efectivo')}
      ${(t.atienden || []).length > 1 ? grupoOpciones('recibio', '¿Quién lo recibió?', Object.fromEntries(t.atienden.map(a => [a, a])), t.atiendeAhora) : ''}
      <div class="tarjeta" id="p-queda" hidden><div class="par" style="font-size:1.0625rem;align-items:center"><span>Queda debiendo</span><b id="p-resta" style="font-size:1.375rem"></b></div>
        <fieldset><legend class="leyenda">¿Cuándo paga lo que falta?</legend><div class="chips" role="radiogroup" aria-label="Nueva fecha" data-grupo="fecha">
          ${Object.entries(opciones).map(([k, o], i) => chip(o.rot, i === 0, `data-valor="${o.iso}"`, 'radio')).join('')}${chip('Otro día', false, 'data-valor="otro"', 'radio')}</div></fieldset>
        <div class="campo" id="p-caja-dia" hidden><label for="p-dia">Fecha acordada</label><input class="entrada" id="p-dia" type="date" min="${isoDia(sumarDias(hoy, 1))}"></div>
        <p class="ayuda" id="p-nota-ley" hidden></p>
      </div>
      <p id="p-error" class="error" role="alert" hidden></p>
    </form></main><div class="pie" role="region" aria-label="Acciones"><button type="submit" form="form-pago" class="btn" id="p-guardar">Registrar pago de ${pesos(saldo)}</button></div></div>`,
    montar(r) {
      const inp = r.querySelector('#p-monto'), queda = r.querySelector('#p-queda'), btn = r.querySelector('#p-guardar');
      let modo = 'todo';
      const fechaElegida = () => { const v = leer('fecha'); return v === 'otro' ? r.querySelector('#p-dia').value : v; };
      const notaLey = () => {
        const iso = fechaElegida(), nota = r.querySelector('#p-nota-ley');
        if (!iso) { nota.hidden = true; return; }
        const d = diaDe(iso);
        if (horarioLegal(d)) { nota.hidden = true; return; }
        nota.hidden = false; nota.textContent = `Ese día es ${d.getDay() === 0 ? 'domingo' : `festivo (${nombreFestivo(d)})`}. Si no paga, el recordatorio saldría el ${punto(fechaLarga(proximoDiaLegal(d)))}`;
      };
      const pintar = () => {
        const v = leerPesos(inp.value), resta = saldo - v;
        queda.hidden = !(v > 0 && resta > 0);
        r.querySelector('#p-resta').textContent = pesos(Math.max(0, resta));
        btn.textContent = !v ? 'Escriba el monto' : resta > 0 ? `Registrar abono de ${pesos(v)}` : `Registrar pago de ${pesos(v)}`;
        r.querySelector('#p-rot').textContent = modo === 'todo' ? '¿Cuánto pagó?' : '¿Cuánto abonó?';
        notaLey();
      };
      const leer = activarGrupos(r, (g, v) => {
        if (g === 'tipo') { modo = v; if (v === 'todo') inp.value = pesos(saldo); else { inp.value = ''; inp.focus(); } }
        if (g === 'fecha') { r.querySelector('#p-caja-dia').hidden = v !== 'otro'; if (v === 'otro') r.querySelector('#p-dia').focus(); }
        pintar();
      });
      r.querySelector('#p-dia').addEventListener('change', notaLey);
      activarCampoPesos(inp, v => {
        const nuevo = v >= saldo ? 'todo' : 'abono';
        if (nuevo !== modo) { modo = nuevo; r.querySelectorAll('[data-grupo="tipo"] [data-valor]').forEach(b => b.setAttribute('aria-checked', b.dataset.valor === modo)); }
        pintar();
      });
      r.querySelector('#form-pago').addEventListener('submit', async ev => {
        ev.preventDefault();
        const v = leerPesos(inp.value), err = r.querySelector('#p-error');
        if (!v) { err.textContent = 'Escriba cuánto pagó.'; err.hidden = false; inp.focus(); return; }
        if (v > saldo) { err.textContent = `Es más de lo que debe (${pesos(saldo)}). Revise el monto.`; err.hidden = false; inp.focus(); return; }
        let nuevaFecha = null;
        if (v < saldo) {
          const iso = fechaElegida();
          if (!iso) { err.textContent = 'Elija cuándo paga lo que falta.'; err.hidden = false; return; }
          nuevaFecha = diaDe(iso);
        }
        const m = await registrarPago({ c, monto: v, medio: leer('medio'), recibio: leer('recibio') || t.atiendeAhora, nuevaFecha });
        ir(`pagolisto-${m.id}`);
      });
      pintar();
    }
  };
};
