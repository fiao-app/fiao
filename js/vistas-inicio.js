/* Fiao · primer acceso y libreta:
   Bienvenida (letra · así funciona · camino · tienda · su nombre) · Recuperar copia · Su tienda ·
   Libreta · Cliente nuevo / editar */
'use strict';

const V = {};           // registro de pantallas: V.nombre(parametro) → { titulo, html, montar }
const Instalacion = { evento: null };
function puedeInstalar() {
  const yaInstalada = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (yaInstalada) return null;
  if (Instalacion.evento) return 'android';
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return 'ios';
  return null;
}
async function instalar() {
  const modo = puedeInstalar();
  if (modo === 'android') { Instalacion.evento.prompt(); const r = await Instalacion.evento.userChoice; Instalacion.evento = null; if (r.outcome === 'accepted') avisar('Fiao quedó en su celular.'); mostrarRuta(); return; }
  abrirHoja(`${cabHoja('Instalar Fiao en el iPhone')}<ol style="margin:0;padding-left:1.25rem;font-size:1.125rem;line-height:1.6;display:flex;flex-direction:column;gap:.375rem"><li>Toque <b>Compartir</b> en Safari: el cuadrito con la flecha.</li><li>Elija <b>Agregar a inicio</b>.</li><li>Toque <b>Agregar</b>.</li></ol><p class="ayuda">Así Safari no borra su libreta si pasa días sin abrirla.</p><button type="button" class="btn" data-cerrar>Entendido</button>`);
}

/* ───── Primer acceso ───── */
const Borrador = { letra: null, nombre: '', yo: '' };
function soloVolver(href) { return `<header class="barra sin-volver" style="box-shadow:none;background:transparent;padding-left:.5rem"><a class="btn-icono" href="#${href}" data-volver aria-label="Volver">${ic('volver', 28, 2.4)}</a></header>`; }
function puntos(n, i) { return `<div class="puntos" aria-hidden="true">${Array.from({ length: n }, (_, k) => `<span class="${k === i ? 'activo' : ''}"></span>`).join('')}</div>`; }

V.bienvenida = (paso = '') => {
  if (paso === 'letra') return pantallaLetra();
  if (paso === 'como') return pantallaComo('bienvenida-camino');
  if (paso === 'camino') return pantallaCamino();
  if (paso === 'tienda' || paso === 'nombre') return pantallaPregunta(paso);
  return {
    titulo: 'Bienvenida',
    html: `<div class="pantalla"><main class="bienvenida">
      <header class="cab-marca"><div class="entra" style="display:flex;flex-direction:column;align-items:center;gap:1.25rem">${LOGO(104, '', 'logo-grande', true)}
      <h1 tabindex="-1">Fiao</h1>
      <p>El fiado claro, para usted y su vecino.</p></div></header><div class="toldo" aria-hidden="true"></div>
    </main>
    <div class="pie" role="region" aria-label="Acciones" style="padding-top:1.5rem">
      <a class="btn" href="#bienvenida-letra">Empezar</a>
      <a class="btn-link" href="#restaurar">Ya tengo una copia de mi libreta</a>
      <p class="nota">Gratis. Sin registro. Versión de prueba.</p>
    </div></div>`
  };
};
function pantallaLetra() {
  const actual = Borrador.letra || document.documentElement.dataset.letra || 'normal';
  const op = [['normal', 'Normal', '1.125rem'], ['grande', 'Grande', '1.25rem'], ['mas', 'Más grande', '1.4rem']];
  return {
    titulo: 'Tamaño de la letra',
    html: `<div class="pantalla blanca">${soloVolver('bienvenida')}<main class="contenido holgado" style="padding-top:.5rem">
      <h1 tabindex="-1" style="font-size:1.75rem;line-height:2.25rem">¿Con qué letra lee mejor?</h1>
      <p style="color:var(--gris)">Puede cambiarla después en Ajustes.</p>
      <div class="letras" role="radiogroup" aria-label="Tamaño de la letra">${op.map(([k, n, f]) => `<button type="button" role="radio" aria-checked="${k === actual}" data-letra="${k}"><span style="font-size:${f}">${n}</span><span style="font-size:${f};font-weight:400;color:var(--gris)">Aa</span></button>`).join('')}</div>
      <div class="tarjeta" aria-hidden="true"><span class="fila" style="padding:0;min-height:auto"><span class="avatar">DN</span><span class="medio"><span class="nombre">Doña Nubia</span><span class="estado">Paga el viernes</span></span><span class="monto">$45.000</span></span></div>
    </main><div class="pie" role="region" aria-label="Acciones"><a class="btn" href="#bienvenida-como">Seguir</a></div></div>`,
    montar(r) {
      r.querySelectorAll('[data-letra]').forEach(b => b.addEventListener('click', () => {
        r.querySelectorAll('[data-letra]').forEach(x => x.setAttribute('aria-checked', x === b));
        Borrador.letra = b.dataset.letra; document.documentElement.dataset.letra = b.dataset.letra; vibrar(10);
      }));
    }
  };
}
/** "Así funciona": tres tarjetas cortas que se pueden saltar. */
function pantallaComo(destino) {
  let i = 0;
  const tarjeta = k => `<div class="ilustracion como-ilus">${ILUS[COMO[k][0]]}</div><div class="como-texto"><h1 tabindex="-1">${COMO[k][1]}</h1><p>${COMO[k][2]}</p></div>`;
  const volver = destino === 'bienvenida-camino' ? 'bienvenida-letra' : 'ajustes';
  return {
    titulo: 'Así funciona',
    html: `<div class="pantalla blanca">${soloVolver(volver)}<main class="intro como"><div id="tarjeta" class="entra como-tarjeta" aria-live="polite">${tarjeta(0)}</div><div id="puntos">${puntos(COMO.length, 0)}</div></main>
      <div class="pie" role="region" aria-label="Acciones"><button type="button" class="btn" data-accion="sigue">Siguiente</button><a class="btn-link" href="#${destino}">Saltar</a></div></div>`,
    montar(r) {
      const caja = r.querySelector('#tarjeta'), btn = r.querySelector('[data-accion="sigue"]');
      const pintar = () => { caja.innerHTML = tarjeta(i); caja.classList.remove('entra'); void caja.offsetWidth; caja.classList.add('entra'); r.querySelector('#puntos').innerHTML = puntos(COMO.length, i); btn.textContent = i === COMO.length - 1 ? (destino === 'bienvenida-camino' ? 'Empezar' : 'Listo') : 'Siguiente';
        const saltar = r.querySelector('.btn-link'), fin = i === COMO.length - 1; saltar.style.visibility = fin ? 'hidden' : ''; saltar.tabIndex = fin ? -1 : 0; caja.querySelector('h1').focus({ preventScroll: true }); };
      btn.addEventListener('click', () => { if (i < COMO.length - 1) { i++; pintar(); } else ir(destino); });
      let x0 = null;
      caja.addEventListener('pointerdown', e => { x0 = e.clientX; });
      caja.addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) < 50) return; if (dx < 0 && i < COMO.length - 1) { i++; pintar(); } else if (dx > 0 && i > 0) { i--; pintar(); } });
    }
  };
}
V.guia = () => pantallaComo(Datos.tienda ? 'ajustes' : 'bienvenida-camino');
function pantallaCamino() {
  return {
    titulo: '¿Cómo quiere empezar?',
    html: `<div class="pantalla">${soloVolver('bienvenida-como')}<main class="intro" style="justify-content:flex-start;padding-top:1rem">
      <h1 tabindex="-1" style="font-size:1.75rem;line-height:2.25rem">¿Cómo quiere empezar?</h1>
      <div class="caminos">
        <a href="#bienvenida-tienda" class="fila" style="min-height:6rem;border-radius:1.375rem;box-shadow:var(--sombra);gap:1rem"><span class="ic" style="width:3.5rem;height:3.5rem;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--azul);color:#fff">${ic('tienda', 30)}</span><span class="medio"><span class="nombre" style="font-size:1.1875rem">Con mi tienda</span><span class="detalle">Empiezo mi libreta ya.</span></span>${ic('sigue', 24, 2.4)}</a>
        <button type="button" class="fila" data-accion="demo" style="min-height:6rem;border-radius:1.375rem;box-shadow:var(--sombra);gap:1rem"><span class="ic" style="width:3.5rem;height:3.5rem;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--moneda);color:var(--tinta)">${ic('ojo', 30)}</span><span class="medio"><span class="nombre" style="font-size:1.1875rem">Ver un ejemplo</span><span class="detalle">Pruebo con una tienda inventada.</span></span>${ic('sigue', 24, 2.4)}</button>
      </div></main></div>`,
    montar(r) {
      r.querySelector('[data-accion="demo"]').addEventListener('click', async () => {
        const j = crearLibretaDeEjemplo(); j.tienda.letra = Borrador.letra || 'normal'; j.tienda.guia = 'recorrido';
        await reemplazarLibreta(j); aplicarPreferencias(); Guia.indice = 0; ir('inicio');
      });
    }
  };
}
function pantallaPregunta(paso) {
  const tiendaP = paso === 'tienda';
  const valor = tiendaP ? Borrador.nombre : Borrador.yo;
  return {
    titulo: tiendaP ? 'Su tienda' : 'Su nombre',
    html: `<div class="pantalla blanca">${soloVolver(tiendaP ? 'bienvenida-camino' : 'bienvenida-tienda')}<main class="contenido holgado" style="padding-top:.5rem"><form id="f-preg" novalidate style="display:flex;flex-direction:column;gap:1rem">
      <span class="ayuda" style="font-weight:600">Paso ${tiendaP ? 1 : 2} de 2</span>
      <h1 tabindex="-1" style="font-size:1.75rem;line-height:2.25rem"><label for="p-valor">${tiendaP ? '¿Cómo se llama su tienda?' : '¿Y usted cómo se llama?'}</label></h1>
      <input class="entrada enorme" id="p-valor" value="${esc(valor)}" placeholder="${tiendaP ? 'Ej.: Donde Álvaro' : 'Ej.: Álvaro'}" autocomplete="${tiendaP ? 'organization' : 'given-name'}" aria-describedby="p-ayuda p-error" enterkeyhint="next">
      <p class="ayuda" id="p-ayuda">${tiendaP ? 'Así la verán sus vecinos.' : 'Así firma sus mensajes.'}</p>
      <p class="error" id="p-error" role="alert" hidden></p>
    </form></main><div class="pie" role="region" aria-label="Acciones"><button type="submit" form="f-preg" class="btn">${tiendaP ? 'Seguir' : 'Abrir mi libreta'}</button></div></div>`,
    montar(r) {
      const inp = r.querySelector('#p-valor');
      setTimeout(() => inp.focus(), 250);
      r.querySelector('#f-preg').addEventListener('submit', async ev => {
        ev.preventDefault();
        const v = inp.value.trim();
        if (!v) { const e = r.querySelector('#p-error'); e.textContent = tiendaP ? 'Escriba el nombre de la tienda.' : 'Escriba su nombre.'; e.hidden = false; inp.setAttribute('aria-invalid', 'true'); temblar(inp); inp.focus(); return; }
        if (tiendaP) { Borrador.nombre = v; ir('bienvenida-nombre'); return; }
        Borrador.yo = v;
        if (!Borrador.nombre) { ir('bienvenida-tienda'); return; }
        await guardarTienda({ nombre: Borrador.nombre, atienden: [v], atiendeAhora: v, llave: '', nequi: '', whatsapp: '', tono: 'cercano', letra: Borrador.letra || document.documentElement.dataset.letra || 'normal', mensajes: {}, creada: new Date().toISOString(), guia: 'practica', vistos: {} });
        Guia.indice = 0; aplicarPreferencias(); ir('inicio');
      });
    }
  };
}

/* ───── Recuperar desde una copia ───── */
V.restaurar = () => {
  let copia = null;
  return {
    titulo: 'Recuperar su libreta',
    html: `<div class="pantalla">${barra({ titulo: 'Recuperar su libreta', volver: Datos.tienda ? 'ajustes' : 'bienvenida', ayuda: false })}
    <main class="contenido holgado">
      <p style="font-size:1.125rem">Busque el archivo de copia de Fiao. Termina en <b>.fiao</b>.</p>
      <p class="ayuda">Puede estar en su WhatsApp, en Descargas o en Drive.</p>
      <input type="file" id="archivo" accept=".fiao,.json,application/json" class="vh" tabindex="-1" aria-label="Archivo de copia de Fiao">
      <button type="button" class="btn-sec" data-accion="buscar">${ic('archivo', 22, 2.2)}Buscar el archivo</button>
      <div id="resultado" aria-live="polite"></div>
      ${Datos.tienda ? `<div class="info atencion">${ic('atencion', 22)}<p>Lo que hay en este celular se cambia por la copia.</p></div>` : ''}
    </main>
    <div class="pie" role="region" aria-label="Acciones"><button type="button" class="btn" data-accion="recuperar" disabled>Recuperar libreta</button></div></div>`,
    montar(r) {
      const inp = r.querySelector('#archivo'), res = r.querySelector('#resultado'), btn = r.querySelector('[data-accion="recuperar"]');
      r.querySelector('[data-accion="buscar"]').addEventListener('click', () => inp.click());
      inp.addEventListener('change', async () => {
        const f = inp.files[0]; if (!f) return;
        try {
          const j = JSON.parse(await f.text());
          if (j.app !== 'fiao' || !Array.isArray(j.clientes)) throw new Error('no es fiao');
          copia = j; btn.disabled = false;
          const nm = (j.movimientos || []).length;
          res.innerHTML = `<section class="tarjeta destacada entra" aria-labelledby="hallada"><h2 id="hallada" class="titulo-seccion">${ic('ok', 20, 2.6)} Copia encontrada</h2>
            <span><b>${esc(j.tienda?.nombre || 'Sin nombre')}</b>: ${j.clientes.length} ${j.clientes.length === 1 ? 'cliente' : 'clientes'} y ${nm} ${nm === 1 ? 'anotación' : 'anotaciones'}.</span>
            <span class="ayuda">Guardada el ${esc(fechaLarga(new Date(j.guardada)))}, ${esc(hora(new Date(j.guardada)))}.</span></section>`;
        } catch (e) {
          copia = null; btn.disabled = true;
          res.innerHTML = `<p class="error" role="alert">${ic('atencion', 20, 2.4)}Ese archivo no es una copia de Fiao.</p>`;
          temblar(res.firstElementChild);
        }
      });
      btn.addEventListener('click', async () => {
        if (!copia) return;
        if (copia.tienda) copia.tienda.guia = 'hecha';
        await reemplazarLibreta(copia); aplicarPreferencias(); avisar('Su libreta quedó recuperada.'); ir('inicio');
      });
    }
  };
};

/* ───── Su tienda (desde Ajustes) ───── */
V.tienda = () => {
  if (!Datos.tienda) return V.bienvenida('tienda');
  const t = Datos.tienda;
  const otros = (t.atienden || []).slice(1);
  const chipsOtros = () => otros.map((n, i) => `<button type="button" class="chip" aria-pressed="true" data-otro="${i}" aria-label="Quitar a ${esc(n)}"><span class="ok">${ic('ok', 18, 2.6)}</span>${esc(n)}${ic('cerrar', 16, 2.4)}</button>`).join('');
  const opc = '<span class="opcional">(opcional)</span>';
  return {
    titulo: 'Su tienda',
    html: `<div class="pantalla">${barra({ titulo: 'Su tienda', volver: 'ajustes', ayuda: false })}
    <main class="contenido"><form style="display:flex;flex-direction:column;gap:inherit" id="form-tienda" novalidate>
      <div class="campo"><label for="t-nombre">Nombre de la tienda</label><input class="entrada" id="t-nombre" required value="${esc(t.nombre || '')}" autocomplete="organization"></div>
      <div class="campo"><label for="t-yo">Su nombre</label><input class="entrada" id="t-yo" required value="${esc((t.atienden || [])[0] || '')}" autocomplete="given-name"></div>
      <fieldset><legend class="leyenda">¿Alguien más atiende? ${opc}</legend>
        <div class="chips" id="otros">${chipsOtros()}<button type="button" class="chip" aria-pressed="false" data-accion="agregar">${ic('mas', 18, 2.6)}Agregar</button></div>
        <div class="con-prefijo" id="nuevo-otro" hidden style="margin-top:.5rem"><label for="t-otro" class="vh">Nombre de quien atiende</label><input class="entrada" id="t-otro" placeholder="Ej.: Doña Rosa"><button type="button" class="btn-mini" data-accion="sumar">Agregar</button></div>
        <p class="ayuda" style="margin-top:.5rem">Cada anotación guarda quién atendió.</p>
      </fieldset>
      <h2 class="titulo-seccion" style="margin-top:.5rem">Cómo le pagan</h2>
      <div class="campo"><label for="t-llave">Llave Bre-B ${opc}</label><input class="entrada" id="t-llave" value="${esc(t.llave || '')}" placeholder="Como sale en su banco" autocomplete="off"></div>
      <div class="campo"><label for="t-nequi">Nequi o Daviplata ${opc}</label><input class="entrada" id="t-nequi" type="tel" inputmode="tel" value="${esc(celLegible(t.nequi || ''))}" placeholder="10 dígitos"></div>
      <div class="campo"><label for="t-wa">WhatsApp de la tienda ${opc}</label><input class="entrada" id="t-wa" type="tel" inputmode="tel" value="${esc(celLegible(t.whatsapp || ''))}" placeholder="10 dígitos" aria-describedby="t-wa-a"><span class="ayuda" id="t-wa-a">Para que el vecino le avise «ya pagué».</span></div>
      <p id="t-error" class="error" role="alert" hidden></p>
    </form></main>
    <div class="pie" role="region" aria-label="Acciones"><button type="submit" form="form-tienda" class="btn">Guardar cambios</button></div></div>`,
    montar(r) {
      const caja = r.querySelector('#otros'), fila = r.querySelector('#nuevo-otro'), inp = r.querySelector('#t-otro');
      const pintar = () => { caja.innerHTML = chipsOtros() + `<button type="button" class="chip" aria-pressed="false" data-accion="agregar">${ic('mas', 18, 2.6)}Agregar</button>`; };
      caja.addEventListener('click', ev => {
        const b = ev.target.closest('button'); if (!b) return;
        if (b.dataset.accion === 'agregar') { fila.hidden = false; inp.focus(); return; }
        if (b.dataset.otro !== undefined) { otros.splice(+b.dataset.otro, 1); pintar(); }
      });
      const sumar = () => { const v = inp.value.trim(); if (v) { otros.push(v); inp.value = ''; pintar(); fila.hidden = true; } };
      r.querySelector('[data-accion="sumar"]').addEventListener('click', sumar);
      inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); sumar(); } });
      r.querySelector('#form-tienda').addEventListener('submit', async ev => {
        ev.preventDefault();
        const nombre = r.querySelector('#t-nombre').value.trim(), yo = r.querySelector('#t-yo').value.trim();
        const err = r.querySelector('#t-error');
        if (!nombre || !yo) {
          err.textContent = !nombre ? 'Escriba el nombre de la tienda.' : 'Escriba su nombre.'; err.hidden = false;
          const f = r.querySelector(!nombre ? '#t-nombre' : '#t-yo'); f.setAttribute('aria-invalid', 'true'); temblar(f); f.focus(); return;
        }
        const atienden = [yo, ...otros];
        await guardarTienda({ ...t, nombre, atienden, atiendeAhora: atienden.includes(t.atiendeAhora) ? t.atiendeAhora : yo,
          llave: r.querySelector('#t-llave').value.trim(), nequi: r.querySelector('#t-nequi').value.replace(/\D/g, ''), whatsapp: r.querySelector('#t-wa').value.replace(/\D/g, ''), preguntoPagos: true });
        avisar('Datos de la tienda guardados.'); ir('ajustes');
      });
    }
  };
};

/* ───── Libreta (inicio) ───── */
V.inicio = () => {
  const t = tienda();
  const hayClientes = Datos.clientes.size > 0;
  const total = totalEnLaCalle(), hoy = totalesDelDia();
  const cuerpo = hayClientes ? `<section class="cifra-cab" aria-labelledby="t-calle"><span class="rotulo" id="t-calle">En la calle</span><span class="cifra" id="cifra-calle">${monto(total)}</span>
    <span class="extra"><span>Fiado hoy <b>${monto(hoy.fiado)}</b></span><span>Pagos hoy <b>${monto(hoy.pagos)}</b></span></span></section>` : '';
  const botones = hayClientes ? btnRedondo('ojoNo', 'Ocultar montos', { accion: 'ocultar', presionado: Vista.oculto }) : '';
  const cab = cabMarca({ titulo: esc(t.nombre || 'Mi tienda'), extra: chipAtiende(), botones, cuerpo });
  const inst = puedeInstalar();
  const bandas = `${t.demo ? `<div class="banda demo">${ic('ojo', 20)}<span>Está viendo una tienda de ejemplo.</span><button type="button" class="btn-mini sec" data-accion="salir-demo">Usar la mía</button></div>` : ''}
    ${inst && !t.demo && !t.noInstalar ? `<div class="banda">${ic('celular', 20)}<span>${inst === 'ios' ? 'Instale Fiao para que Safari no borre su libreta.' : 'Instale Fiao: abre sin internet.'}</span><button type="button" class="btn-mini" data-accion="instalar">${inst === 'ios' ? 'Cómo' : 'Instalar'}</button></div>` : ''}`;
  const pie = `<div class="abajo"><button type="button" class="fab" data-accion="anotar" data-guia="anotar">${ic('mas', 24, 2.8)}Anotar fiado</button>${nav('libreta')}</div>`;
  if (!hayClientes) return {
    titulo: 'Libreta',
    html: `<div class="pantalla">${cab}<main class="contenido">${bandas}
      <section aria-labelledby="vacia" class="tarjeta" style="align-items:center;text-align:center;padding:1.5rem 1rem;gap:.75rem">
        <div class="ilustracion">${ILUS.anotar}</div>
        <h2 id="vacia" style="font-size:1.5rem;line-height:1.875rem">Su libreta está lista</h2>
        <p>Anote el primer fiado del día.</p>
        <a class="btn-link" href="#nuevo">Pasar clientes del cuaderno</a>
      </section>
      ${pasosHtml()}
    </main>${pie}</div>`,
    montar: montarInicio
  };
  const lista = clientesOrdenados();
  const dc = diasDesdeCopia();
  const copiaVieja = !t.demo && (dc === null ? Datos.movs.size > 15 : dc >= 7);
  const atr = lista.filter(x => x.e.tipo === 'atrasado'), deHoy = lista.filter(x => x.e.tipo === 'hoy');
  const suma = xs => xs.reduce((s, x) => s + x.e.saldo, 0);
  const alDia = lista.filter(x => x.e.saldo <= 0).length;
  const tarjetaHoy = (clase, href, icono, texto, valor) => `<a class="aviso-hoy ${clase}" href="#${href}"><span class="i" aria-hidden="true">${ic(icono, 20, 2.4)}</span><span class="t">${texto}</span><b>${valor}</b></a>`;
  const avisosHoy = `<section class="avisos-hoy" aria-label="Hoy">
    ${atr.length ? tarjetaHoy('atr', 'cobros', 'atencion', `${atr.length} ${atr.length === 1 ? 'atrasado' : 'atrasados'}`, monto(suma(atr))) : ''}
    ${deHoy.length ? tarjetaHoy('hoy', 'cobros', 'reloj', `Hoy ${deHoy.length === 1 ? 'paga' : 'pagan'} ${deHoy.length}`, monto(suma(deHoy))) : ''}
    ${!atr.length && !deHoy.length ? tarjetaHoy('ok', 'cobros', 'ok', 'Cobros de hoy', 'Ninguno') : ''}
    ${lista.length > 1 ? tarjetaHoy('ok', 'resumen', 'estrella', 'Al día', `${alDia} de ${lista.length}`) : ''}</section>`;
  return {
    titulo: 'Libreta',
    html: `<div class="pantalla">${cab}<main class="contenido">${bandas}
      ${copiaVieja ? `<div class="banda vieja">${ic('reloj', 20)}<span>${dc === null ? 'Aún no guarda una copia de su libreta.' : `Su última copia fue hace ${dc} días.`}</span><button type="button" class="btn-mini sec" data-accion="copia">Guardar</button></div>` : ''}
      ${avisosHoy}
      ${pasosHtml()}
      <div class="buscador"><label for="buscar" class="vh">Buscar cliente</label>${ic('buscar', 24)}<input class="entrada" id="buscar" type="search" placeholder="Buscar cliente" autocomplete="off"></div>
      <div class="encabezado-lista"><h2 class="titulo-seccion" id="t-clientes">Clientes</h2><span id="cuantos">${lista.length}</span></div>
      <ul class="lista" id="lista-clientes" aria-labelledby="t-clientes">${lista.map(({ c, e }) => filaCliente(c, e, `cliente-${c.id}`)).join('')}</ul>
      <p class="vacio" id="sin-resultados" hidden></p>
      <a class="btn-link" href="#nuevo">${ic('mas', 20, 2.4)}Agregar cliente</a>
    </main>${pie}</div>`,
    montar(r) {
      montarInicio(r);
      const cifra = r.querySelector('#cifra-calle');
      if (typeof Vista.ultimoTotal === 'number' && Vista.ultimoTotal !== total) contar(cifra, Vista.ultimoTotal, total);
      Vista.ultimoTotal = total;
      const b = r.querySelector('#buscar'), ul = r.querySelector('#lista-clientes'), sin = r.querySelector('#sin-resultados'), cuantos = r.querySelector('#cuantos');
      b.addEventListener('input', () => {
        const q = normalizar(b.value); let n = 0;
        ul.querySelectorAll('li').forEach((li, i) => { const si = !q || normalizar(lista[i].c.nombre).includes(q); li.hidden = !si; if (si) n++; });
        cuantos.textContent = q ? `${n} de ${lista.length}` : lista.length;
        sin.hidden = n > 0; sin.innerHTML = n ? '' : `Nadie se llama «${esc(b.value)}». <a href="#nuevo" data-prefill>Agregarlo</a>`;
      });
      sin.addEventListener('click', ev => { if (ev.target.closest('[data-prefill]')) Vista.prefill = b.value.trim(); });
    }
  };
};
/** Atajo del ícono instalado ("Anotar fiado"): abre la libreta con la hoja de anotar. */
V.anotar = () => {
  const v = V.inicio();
  return { ...v, montar(r) { v.montar(r); history.replaceState(null, '', '#inicio'); setTimeout(() => abrirAnotar(), 60); } };
};
function montarInicio(r) {
  Vista.despues = null;
  if (Datos.clientes.size === 0) Vista.ultimoTotal = 0;
  r.querySelector('[data-accion="anotar"]').addEventListener('click', () => abrirAnotar());
  r.querySelector('[data-accion="instalar"]')?.addEventListener('click', instalar);
  r.querySelector('[data-accion="copia"]')?.addEventListener('click', async () => { if (await guardarCopia()) mostrarRuta({ animar: false }); });
  r.querySelector('[data-accion="ocultar-pasos"]')?.addEventListener('click', async () => { const t = tienda(); t.ocultarPasos = true; await guardarTienda(t); mostrarRuta({ animar: false }); avisar('Lista oculta. Puede volver a verla en Ajustes.', { icono: null }); });
  r.querySelector('[data-accion="salir-demo"]')?.addEventListener('click', async () => {
    const si = await confirmar({ titulo: '¿Empezar con su tienda?', texto: 'Se borra la tienda de ejemplo y empieza con su libreta vacía.', si: 'Sí, empezar con la mía' });
    if (si) { const letra = tienda().letra; await borrarLibreta(); Borrador.letra = letra; Borrador.nombre = ''; Borrador.yo = ''; aplicarPreferencias(); document.documentElement.dataset.letra = letra || 'normal'; ir('bienvenida-tienda'); }
  });
}

/* ───── Cliente nuevo / editar ───── */
function formCliente(c) {
  const nuevo = !c;
  c = c || { nombre: Vista.prefill || '', cel: '', cupo: null, pago: 'quincena', recibos: 'whatsapp', recordar: 'atraso', detalle: '', lista: null, permiso: { estado: 'ninguno' } };
  Vista.prefill = '';
  const cupoSel = c.cupo === null ? 'sin' : [50000, 100000].includes(c.cupo) ? String(c.cupo) : 'otro';
  let cupoOtro = cupoSel === 'otro' && c.cupo ? c.cupo : 80000;
  const contactosApi = 'contacts' in navigator && 'ContactsManager' in window;
  const opc = '<span class="opcional">(opcional)</span>';
  const volver = nuevo ? 'inicio' : `cliente-${c.id}`;
  return {
    titulo: nuevo ? 'Cliente nuevo' : 'Editar cliente',
    html: `<div class="pantalla">${barra({ titulo: nuevo ? 'Cliente nuevo' : 'Editar cliente', volver, ayuda: false })}
    <main class="contenido"><form style="display:flex;flex-direction:column;gap:inherit" id="form-cliente" novalidate>
      <div class="campo"><label for="c-nombre">Nombre o apodo</label><input class="entrada" id="c-nombre" required value="${esc(c.nombre)}" placeholder="Ej.: Rosiris, la de la esquina" autocomplete="off"></div>
      <div class="campo"><label for="c-cel">Celular con WhatsApp ${opc}</label>
        <div class="con-prefijo"><span class="prefijo" aria-hidden="true">+57</span><input class="entrada" id="c-cel" type="tel" inputmode="tel" value="${esc(celLegible(c.cel))}" placeholder="10 dígitos" autocomplete="off">${contactosApi ? `<button type="button" class="btn-cuadro" data-accion="contactos" aria-label="Elegir de mis contactos">${ic('contactos', 26)}</button>` : ''}</div></div>
      ${nuevo ? `<div class="campo"><label for="c-saldo">¿Ya le debe algo del cuaderno? ${opc}</label><input class="entrada" id="c-saldo" inputmode="numeric" placeholder="$0" autocomplete="off"></div>` : ''}
      ${grupoOpciones('pago', '¿Cuándo suele pagar?', PREF_PAGO, c.pago)}
      <details class="mas"${nuevo ? '' : ' open'}><summary>${ic('ajustes', 22)}Más opciones: cupo, recibos y recordatorios</summary><div class="interior">
        ${grupoOpciones('cupo', 'Hasta cuánto le fía', { sin: 'Sin límite', 50000: '$50.000', 100000: '$100.000', otro: 'Otro' }, cupoSel)}
        <div class="deslizador" id="caja-cupo"${cupoSel === 'otro' ? '' : ' hidden'}><label for="c-cupo" class="leyenda">Cupo: <b id="c-cupo-v">${pesos(cupoOtro)}</b></label>
          <input type="range" id="c-cupo" min="1" max="50" step="1" value="${Math.min(50, Math.max(1, Math.round(cupoOtro / 10000)))}" aria-valuetext="${pesos(cupoOtro)}">
          <div class="limites" aria-hidden="true"><span>$10.000</span><span>$500.000</span></div>
          <div class="control"><button type="button" class="paso-btn" data-cupo="-1" aria-label="Diez mil pesos menos">${ic('menos', 24, 2.6)}</button><span class="ayuda">En saltos de $10.000</span><button type="button" class="paso-btn" data-cupo="1" aria-label="Diez mil pesos más">${ic('mas', 24, 2.6)}</button></div></div>
        ${grupoOpciones('recibos', 'Recibos', { whatsapp: 'Por WhatsApp', semanal: 'Uno por semana', mostrar: 'Solo en la tienda' }, c.recibos)}
        ${grupoOpciones('recordar', 'Recordarle el pago', { atraso: 'Si se atrasa', dia: 'El día de pago', nunca: 'Nunca' }, c.recordar)}
        ${nuevo ? '' : grupoOpciones('permiso', '¿Aceptó mensajes por WhatsApp?', { si: 'Sí', pedido: 'Le pregunté', no: 'No', ninguno: 'No le he preguntado' }, c.permiso?.estado || 'ninguno')}
        <div class="campo"><label for="c-detalle">Algo para reconocerlo ${opc}</label><input class="entrada" id="c-detalle" value="${esc(c.detalle || '')}" placeholder="Ej.: vende sopa"></div>
        <div class="campo"><label for="c-lista">Lo que siempre lleva ${opc}</label><input class="entrada" id="c-lista" value="${esc(c.lista?.productos || '')}" placeholder="Ej.: pan, leche y huevos"></div>
      </div></details>
      <p id="c-error" class="error" role="alert" hidden></p>
    </form></main>
    <div class="pie" role="region" aria-label="Acciones"><button type="submit" form="form-cliente" class="btn">${nuevo ? 'Guardar cliente' : 'Guardar cambios'}</button></div></div>`,
    montar(r) {
      const leer = activarGrupos(r, (g, v) => {
        if (g === 'cupo') { r.querySelector('#caja-cupo').hidden = v !== 'otro'; if (v === 'otro') r.querySelector('#c-cupo').focus(); }
      });
      const rCupo = r.querySelector('#c-cupo');
      const pintarCupo = () => { r.querySelector('#c-cupo-v').textContent = pesos(cupoOtro); rCupo.setAttribute('aria-valuetext', pesos(cupoOtro)); rCupo.style.setProperty('--lleno', `${((rCupo.value - 1) / 49) * 100}%`); };
      rCupo.addEventListener('input', () => { cupoOtro = rCupo.value * 10000; vibrar(4); pintarCupo(); });
      r.querySelectorAll('[data-cupo]').forEach(b => b.addEventListener('click', () => { rCupo.value = Math.min(50, Math.max(1, Math.round(cupoOtro / 10000) + Number(b.dataset.cupo))); cupoOtro = rCupo.value * 10000; vibrar(6); pintarCupo(); }));
      pintarCupo();
      const cel = r.querySelector('#c-cel');
      ['#c-saldo'].forEach(s => { const i = r.querySelector(s); if (i) activarCampoPesos(i); });
      r.querySelector('[data-accion="contactos"]')?.addEventListener('click', async () => {
        try {
          const [ct] = await navigator.contacts.select(['name', 'tel'], { multiple: false });
          if (!ct) return;
          if (ct.tel?.[0]) cel.value = celLegible(ct.tel[0].replace(/^\+?57/, ''));
          const n = r.querySelector('#c-nombre'); if (!n.value && ct.name?.[0]) n.value = ct.name[0];
        } catch (e) { avisar('No se pudo abrir la lista de contactos.', { icono: 'atencion' }); }
      });
      r.querySelector('#form-cliente').addEventListener('submit', async ev => {
        ev.preventDefault();
        const err = r.querySelector('#c-error'); err.hidden = true;
        const nombre = r.querySelector('#c-nombre').value.trim();
        const celD = cel.value.replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, '');
        const fallo = (msg, sel) => { err.textContent = msg; err.hidden = false; const f = r.querySelector(sel); f.setAttribute('aria-invalid', 'true'); if (f.closest('details')) f.closest('details').open = true; temblar(f); f.focus(); };
        if (!nombre) return fallo('Escriba el nombre o apodo.', '#c-nombre');
        if (celD && (celD.length !== 10 || (!/^3/.test(celD) && !tienda().demo))) return fallo('El celular tiene 10 números y empieza por 3.', '#c-cel');
        const cupoV = leer('cupo');
        const cupo = cupoV === 'sin' ? null : cupoV === 'otro' ? cupoOtro : Number(cupoV);
        const lista = r.querySelector('#c-lista').value.trim();
        const datos = { nombre, cel: celD, cupo, pago: leer('pago'), recibos: leer('recibos'), recordar: leer('recordar'), detalle: r.querySelector('#c-detalle').value.trim(),
          lista: lista ? { nombre: c.lista?.nombre || 'Lo de siempre', productos: lista, ultimoMonto: c.lista?.ultimoMonto } : null };
        if (nuevo) {
          const nc = { id: uid(), ...datos, permiso: { estado: 'ninguno', fecha: null }, proximaFecha: null, creado: new Date().toISOString() };
          await guardarCliente(nc);
          const saldo = leerPesos(r.querySelector('#c-saldo').value);
          if (saldo > 0) await registrarFiado({ c: nc, monto: saldo, que: 'Lo que venía del cuaderno', tipo: 'saldo' });
          avisar(`${nombreCorto(nombre)} quedó en su libreta.`);
          ir(`cliente-${nc.id}`);
        } else {
          const p = leer('permiso');
          Object.assign(c, datos);
          if (p && p !== c.permiso?.estado) c.permiso = { estado: p, fecha: new Date().toISOString() };
          await _ajustarFecha(c);
          avisar('Cambios guardados.'); ir(`cliente-${c.id}`);
        }
      });
    }
  };
}
V.nuevo = () => formCliente(null);
V.editar = id => cliente(id) ? formCliente(cliente(id)) : null;
