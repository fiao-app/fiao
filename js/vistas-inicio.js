/* Fiao · pantallas de primera vez y de la libreta:
   Bienvenida · Recuperar copia · Su tienda · Primer día · Libreta · Elegir cliente · Cliente nuevo/editar · Permiso */
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
  if (modo === 'android') { Instalacion.evento.prompt(); const r = await Instalacion.evento.userChoice; Instalacion.evento = null; if (r.outcome === 'accepted') avisar('Fiao quedó instalada en su celular'); mostrarRuta(); return; }
  abrirHoja(`<h2>Instalar Fiao en el iPhone</h2><ol style="margin:0;padding-left:1.25rem;font-size:1.0625rem;line-height:1.6"><li>Toque el botón <b>Compartir</b> de Safari (el cuadrito con la flecha).</li><li>Elija <b>Agregar a inicio</b>.</li><li>Toque <b>Agregar</b>.</li></ol><button type="button" class="btn" data-cerrar>Entendido</button>`);
}

/* ───── Bienvenida ───── */
V.bienvenida = () => ({
  titulo: 'Bienvenida',
  html: `<div class="pantalla blanca"><main class="contenido holgado" style="padding-top:3rem;gap:1.75rem">
  <div style="display:flex;flex-direction:column;gap:1.125rem">${LOGO(72)}
    <div style="display:flex;flex-direction:column;gap:.5rem"><h1 tabindex="-1" style="font-size:2.75rem;line-height:3.125rem">Fiao</h1>
    <p style="font-size:1.375rem;line-height:1.875rem">Cuentas claras con sus vecinos, sin perder la confianza.</p></div></div>
  <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:1.25rem">
    ${[['lapiz', 'azul', 'Anote un fiado en segundos.', 'Busque al cliente, escriba el monto y listo. Como en el cuaderno.'],
      ['chat', 'naranja', 'Su vecino ve su cuenta.', 'Se la muestra en la tienda o se la manda por WhatsApp. Él no instala nada.'],
      ['candado', 'azul', 'Todo queda en este celular.', 'Su libreta no se sube a internet. Fiao nunca toca su plata.']]
      .map(([i, col, t, d]) => `<li style="display:flex;gap:1rem;align-items:flex-start"><span style="width:3.25rem;height:3.25rem;flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--${col}-fondo);color:var(--${col})">${ic(i, 26)}</span><p style="font-size:1.125rem;line-height:1.625rem"><b>${t}</b><br>${d}</p></li>`).join('')}
  </ul></main>
  <div class="pie" role="region" aria-label="Acciones">
    <a class="btn" href="#tienda">Empezar</a>
    <a class="btn-link" href="#restaurar">Recuperar mi libreta desde una copia</a>
    <button type="button" class="btn-link" data-accion="demo">Ver con una tienda de ejemplo</button>
    <p class="nota">Gratis. Sin registro ni contraseñas. Versión de prueba.</p>
  </div></div>`,
  montar(r) {
    r.querySelector('[data-accion="demo"]').addEventListener('click', async () => {
      await reemplazarLibreta(crearLibretaDeEjemplo());
      aplicarPreferencias(); avisar('Esta es la tienda de ejemplo "Donde Álvaro"'); ir('inicio');
    });
  }
});

/* ───── Recuperar desde una copia ───── */
V.restaurar = () => {
  let copia = null;
  return {
    titulo: 'Recuperar su libreta',
    html: `<div class="pantalla">${barra({ titulo: 'Recuperar su libreta', volver: Datos.tienda ? 'ajustes' : 'bienvenida' })}
    <main class="contenido holgado">
      <p style="font-size:1.125rem;line-height:1.625rem">Si guardó una copia de Fiao en su WhatsApp, en Descargas o en Drive, búsquela aquí. Así no pierde nada si cambia o se le daña el celular.</p>
      <input type="file" id="archivo" accept=".fiao,.json,application/json" class="vh" tabindex="-1" aria-label="Archivo de copia de Fiao">
      <button type="button" class="btn-sec" data-accion="buscar">${ic('archivo', 22, 2.2)}Buscar el archivo de copia</button>
      <div id="resultado" aria-live="polite"></div>
      <div class="info atencion">${ic('atencion', 22)}<p>Lo que haya ahora en este celular se reemplaza por lo que trae la copia.</p></div>
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
          res.innerHTML = `<section class="tarjeta destacada" aria-labelledby="hallada"><h2 id="hallada" class="titulo-seccion">Copia encontrada</h2>
            <span style="display:flex;align-items:center;gap:.5rem;font-weight:700;color:var(--azul)">${ic('archivo', 20)}<span style="color:var(--tinta);overflow-wrap:anywhere">${esc(f.name)}</span></span>
            <span>${esc(j.tienda?.nombre || 'Sin nombre')} · ${j.clientes.length} ${j.clientes.length === 1 ? 'cliente' : 'clientes'} · ${(j.movimientos || []).length} ${(j.movimientos || []).length === 1 ? 'anotación' : 'anotaciones'}</span>
            <span class="ayuda">Guardada el ${esc(fechaLarga(new Date(j.guardada)))}, ${esc(hora(new Date(j.guardada)))}</span></section>`;
        } catch (e) {
          copia = null; btn.disabled = true;
          res.innerHTML = `<p class="error" role="alert">Ese archivo no es una copia de Fiao. Busque uno que termine en .fiao.</p>`;
        }
      });
      btn.addEventListener('click', async () => {
        if (!copia) return;
        await reemplazarLibreta(copia); aplicarPreferencias(); avisar('Su libreta quedó recuperada'); ir('inicio');
      });
    }
  };
};

/* ───── Su tienda (primera vez y desde Ajustes) ───── */
V.tienda = () => {
  const t = Datos.tienda || {};
  const primeraVez = !Datos.tienda;
  const otros = (t.atienden || []).slice(1);
  const chipsOtros = () => otros.map((n, i) => `<button type="button" class="chip" aria-pressed="true" data-otro="${i}" aria-label="${esc(n)}, atiende. Tocar para quitar"><span class="ok">${ic('ok', 18, 2.6)}</span>${esc(n)}</button>`).join('');
  return {
    titulo: 'Su tienda',
    html: `<div class="pantalla">${barra({ titulo: 'Su tienda', volver: primeraVez ? 'bienvenida' : 'ajustes' })}
    <main class="contenido"><form style="display:flex;flex-direction:column;gap:inherit" id="form-tienda" novalidate>
      <div class="campo"><label for="t-nombre">Nombre de la tienda (lo verán sus vecinos)</label><input class="entrada" id="t-nombre" required value="${esc(t.nombre || '')}" placeholder="Ej.: Donde Álvaro" autocomplete="organization"></div>
      <div class="campo"><label for="t-yo">Su nombre</label><input class="entrada" id="t-yo" required value="${esc((t.atienden || [])[0] || '')}" placeholder="Así firma los mensajes" autocomplete="given-name"></div>
      <fieldset><legend class="leyenda">¿Alguien más atiende? <span class="opcional">(opcional)</span></legend>
        <div class="chips" id="otros">${chipsOtros()}<button type="button" class="chip" aria-pressed="false" data-accion="agregar">+ Agregar</button></div>
        <div class="con-prefijo" id="nuevo-otro" hidden style="margin-top:.5rem"><label for="t-otro" class="vh">Nombre de quien atiende</label><input class="entrada" id="t-otro" placeholder="Ej.: Doña Rosa"><button type="button" class="btn-mini" data-accion="sumar">Agregar</button></div>
        <p class="ayuda" style="margin-top:.5rem">Fiao vive en un solo celular: el de la tienda. Cada anotación guarda quién atendió.</p>
      </fieldset>
      <div class="campo"><label for="t-llave">Llave Bre-B para que le paguen <span class="opcional" style="font-weight:400;color:var(--gris)">(opcional)</span></label><input class="entrada" id="t-llave" value="${esc(t.llave || '')}" placeholder="Como aparece en su banco o billetera" autocomplete="off" aria-describedby="t-llave-a"><span class="ayuda" id="t-llave-a">Con ella le pagan desde cualquier banco o billetera.</span></div>
      <div class="campo"><label for="t-nequi">Número Nequi o Daviplata <span class="opcional" style="font-weight:400;color:var(--gris)">(opcional)</span></label><input class="entrada" id="t-nequi" type="tel" inputmode="tel" value="${esc(celLegible(t.nequi || ''))}" placeholder="10 dígitos"></div>
      <div class="campo"><label for="t-wa">WhatsApp de la tienda <span class="opcional" style="font-weight:400;color:var(--gris)">(opcional)</span></label><input class="entrada" id="t-wa" type="tel" inputmode="tel" value="${esc(celLegible(t.whatsapp || ''))}" placeholder="10 dígitos" aria-describedby="t-wa-a"><span class="ayuda" id="t-wa-a">Para que el vecino le avise "ya pagué" con un toque.</span></div>
      <div class="info">${ic('reloj', 22)}<p>Fiao solo le ofrece enviar recordatorios de pago en horario legal: lun. a vie. de 7 a. m. a 7 p. m. y sáb. de 8 a. m. a 3 p. m. Nunca domingos ni festivos (Ley 2300 de 2023).</p></div>
      <p id="t-error" class="error" role="alert" hidden></p>
    </form></main>
    <div class="pie" role="region" aria-label="Acciones"><button type="submit" form="form-tienda" class="btn">${primeraVez ? 'Continuar' : 'Guardar cambios'}</button></div></div>`,
    montar(r) {
      const caja = r.querySelector('#otros'), fila = r.querySelector('#nuevo-otro'), inp = r.querySelector('#t-otro');
      const pintar = () => { caja.innerHTML = chipsOtros() + `<button type="button" class="chip" aria-pressed="false" data-accion="agregar">+ Agregar</button>`; };
      caja.addEventListener('click', ev => {
        const b = ev.target.closest('button'); if (!b) return;
        if (b.dataset.accion === 'agregar') { fila.hidden = false; inp.focus(); return; }
        if (b.dataset.otro !== undefined) { otros.splice(+b.dataset.otro, 1); pintar(); avisar('Quitado de quienes atienden'); }
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
          const f = r.querySelector(!nombre ? '#t-nombre' : '#t-yo'); f.setAttribute('aria-invalid', 'true'); f.focus(); return;
        }
        const atienden = [yo, ...otros];
        const nueva = { ...t, nombre, atienden, atiendeAhora: atienden.includes(t.atiendeAhora) ? t.atiendeAhora : yo,
          llave: r.querySelector('#t-llave').value.trim(), nequi: r.querySelector('#t-nequi').value.replace(/\D/g, ''), whatsapp: r.querySelector('#t-wa').value.replace(/\D/g, ''),
          tono: t.tono || 'cercano', letra: t.letra || 'normal', mensajes: t.mensajes || {}, creada: t.creada || new Date().toISOString() };
        await guardarTienda(nueva);
        if (primeraVez) ir('inicio'); else { avisar('Datos de la tienda guardados'); ir('ajustes'); }
      });
    }
  };
};

/* ───── Libreta (inicio) ───── */
function htmlPrimerDia() {
  const inst = puedeInstalar();
  return `<main class="contenido">
    ${inst ? `<section class="tarjeta" style="background:var(--azul-fondo);border:none" aria-labelledby="instalar">
      <div style="display:flex;gap:.75rem;align-items:flex-start;color:var(--azul)">${ic('celular', 28)}<div style="display:flex;flex-direction:column;gap:.125rem;color:var(--tinta)"><h2 id="instalar" class="titulo-seccion">Instale Fiao en su celular</h2><span>Queda con su ícono, como cualquier app, y funciona sin internet.</span></div></div>
      <div class="fila-botones"><button type="button" class="btn" style="min-height:3.25rem" data-accion="instalar">Instalar</button><button type="button" class="btn-link" data-accion="no-instalar">Ahora no</button></div></section>` : ''}
    <section aria-labelledby="vacia" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.875rem;text-align:center;padding:1rem .75rem">
      <span style="width:6rem;height:6rem;border-radius:50%;background:var(--blanco);border:1px solid var(--linea);color:var(--azul);display:flex;align-items:center;justify-content:center">${ic('libreta', 48, 1.8)}</span>
      <h2 id="vacia" style="font-size:1.5rem;line-height:1.875rem">Su libreta está lista</h2>
      <p style="font-size:1.125rem;line-height:1.625rem">Pase a sus clientes del cuaderno. Lo que ya le deben se anota una sola vez, como saldo inicial.</p>
      <p class="ayuda">¿Son muchos? Empiece por los que más fían; los demás, a medida que vengan.</p>
    </section></main>
    <div class="abajo"><div class="pie" role="region" aria-label="Acciones"><a class="btn" href="#nuevo">${ic('mas', 24, 2.6)}Agregar primer cliente</a></div>${nav('libreta')}</div>`;
}
V.inicio = () => {
  const t = tienda();
  const derecha = btnIcono(Vista.oculto ? 'ojoNo' : 'ojo', 'Ocultar montos', { accion: 'ocultar', presionado: Vista.oculto }) + btnIcono('buscar', 'Buscar cliente', { href: 'elegir' }) + btnIcono('ajustes', 'Ajustes', { href: 'ajustes' });
  const cab = barra({ titulo: esc(t.nombre || 'Mi tienda'), sub: subAtiende(), derecha });
  if (Datos.clientes.size === 0) return { titulo: 'Primer día', html: `<div class="pantalla">${cab}${htmlPrimerDia()}</div>`, montar: montarInicio };
  const lista = clientesOrdenados();
  const hoy = totalesDelDia();
  const dc = diasDesdeCopia();
  const copiaVieja = dc === null ? Datos.movs.size > 15 : dc >= 7;
  return {
    titulo: 'Libreta',
    html: `<div class="pantalla">${cab}<main class="contenido">
      ${t.demo ? `<div class="banda demo">${ic('atencion', 20)}<span>Está viendo una tienda de ejemplo.</span><button type="button" class="btn-mini sec" data-accion="salir-demo">Usar la mía</button></div>` : ''}
      ${puedeInstalar() === 'ios' && !t.demo ? `<div class="banda demo">${ic('celular', 20)}<span>En iPhone, instale Fiao en la pantalla de inicio: si no, Safari puede borrar su libreta tras unos días sin usarla.</span><button type="button" class="btn-mini sec" data-accion="instalar">Cómo</button></div>` : ''}
      ${copiaVieja && !t.demo ? `<div class="banda demo">${ic('reloj', 20)}<span>${dc === null ? 'Aún no ha guardado una copia de su libreta.' : `Su última copia fue hace ${dc} días.`}</span><a class="btn-mini sec" href="#ajustes" style="display:inline-flex;align-items:center;text-decoration:none">Guardar</a></div>` : ''}
      <a class="total" href="#resumen"><span class="rotulo">En la calle<b>Ver resumen${ic('sigue', 18, 2.4)}</b></span><span class="cifra">${monto(totalEnLaCalle())}</span>
        <span class="hoy"><span>Fiado hoy <b>${monto(hoy.fiado)}</b></span><span>Pagos hoy <b>${monto(hoy.pagos)}</b></span></span></a>
      <div class="encabezado-lista"><h2 class="titulo-seccion" id="t-clientes">Clientes · ${lista.length}</h2><span>Primero lo urgente</span></div>
      <ul class="lista" aria-labelledby="t-clientes">${lista.map(({ c, e }) => filaCliente(c, e, `cliente-${c.id}`)).join('')}</ul>
    </main>
    <div class="abajo"><div class="pie" role="region" aria-label="Acciones"><a class="btn" href="#elegir">${ic('mas', 24, 2.6)}Anotar fiado</a></div>${nav('libreta')}</div></div>`,
    montar: montarInicio
  };
};
function montarInicio(r) {
  Vista.despues = null;
  r.querySelector('[data-accion="instalar"]')?.addEventListener('click', instalar);
  r.querySelector('[data-accion="no-instalar"]')?.addEventListener('click', e => e.target.closest('section').remove());
  r.querySelector('[data-accion="salir-demo"]')?.addEventListener('click', async () => {
    const si = await confirmar({ titulo: 'Empezar con su tienda', texto: 'Se borra la tienda de ejemplo de este celular y empieza con su libreta vacía.', si: 'Borrar el ejemplo y empezar' });
    if (si) { await borrarLibreta(); aplicarPreferencias(); ir('bienvenida'); }
  });
}

/* ───── Elegir cliente ───── */
V.elegir = () => {
  const filaElegir = c => {
    const s = saldoDe(c.id);
    const est = s > 0 ? `<span class="estado">Debe ${monto(s)}</span>` : `<span class="estado ok">${ic('ok', 16, 2.6)}No debe nada</span>`;
    return `<li><a class="fila" href="#anotar-${c.id}"><span class="avatar" aria-hidden="true">${esc(iniciales(c.nombre))}</span><span class="medio"><span class="nombre">${esc(c.nombre)}</span>${est}</span></a></li>`;
  };
  const pintar = q => {
    const nq = normalizar(q);
    if (!nq) {
      const top = losQueMasFian(4);
      const todos = clientes().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      return `${top.length ? `<h2 class="titulo-seccion" id="t-top">Los que más fían</h2><ul class="lista" aria-labelledby="t-top">${top.map(filaElegir).join('')}</ul>` : ''}
        <h2 class="titulo-seccion" id="t-todos">Todos · ${todos.length}</h2>${todos.length ? `<ul class="lista" aria-labelledby="t-todos">${todos.map(filaElegir).join('')}</ul>` : '<p class="vacio">Aún no tiene clientes.</p>'}`;
    }
    const r = clientes().filter(c => normalizar(c.nombre).includes(nq)).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    return `<h2 class="titulo-seccion" id="t-res">Resultados · ${r.length}</h2>${r.length ? `<ul class="lista" aria-labelledby="t-res">${r.map(filaElegir).join('')}</ul>` :
      `<div class="tarjeta"><p>No hay nadie con "${esc(q)}".</p><a class="btn-sec" href="#nuevo" data-accion="nuevo-con">Agregar a "${esc(q)}" como cliente nuevo</a></div>`}`;
  };
  return {
    titulo: '¿A quién le fía?',
    html: `<div class="pantalla">${barra({ titulo: '¿A quién le fía?', volver: 'inicio' })}<main class="contenido">
      <div class="campo" style="position:relative"><label for="buscar" class="vh">Buscar cliente por nombre o apodo</label>
        <span style="position:absolute;left:.875rem;top:1rem;color:var(--gris)">${ic('buscar', 24)}</span>
        <input class="entrada" id="buscar" type="search" placeholder="Buscar por nombre o apodo" autocomplete="off" style="padding-left:3rem"></div>
      <div class="banda oculto"${Vista.oculto ? '' : ' hidden'} id="banda-oculto">${ic('ojoNo', 22)}<span>Montos ocultos: nadie más ve lo que deben los demás.</span><button type="button" class="btn-mini sec" data-accion="ocultar" aria-pressed="true">Mostrar</button></div>
      <div id="resultados" style="display:flex;flex-direction:column;gap:.75rem">${pintar('')}</div>
    </main><div class="abajo"><div class="pie" role="region" aria-label="Acciones"><a class="btn-sec" href="#nuevo" data-accion="nuevo">${ic('mas', 22, 2.4)}Cliente nuevo</a></div></div></div>`,
    montar(r) {
      Vista.despues = 'anotar';
      const b = r.querySelector('#buscar'), res = r.querySelector('#resultados');
      b.addEventListener('input', () => { res.innerHTML = pintar(b.value); });
      res.addEventListener('click', ev => { if (ev.target.closest('[data-accion="nuevo-con"]')) Vista.prefill = b.value.trim(); });
      setTimeout(() => b.focus(), 50);
    },
    enfoque: false
  };
};

/* ───── Cliente nuevo / editar ───── */
function formCliente(c) {
  const nuevo = !c;
  c = c || { nombre: Vista.prefill || '', cel: '', cupo: 50000, pago: 'quincena', recibos: 'whatsapp', recordar: 'atraso', detalle: '', lista: null, permiso: { estado: 'ninguno' } };
  Vista.prefill = '';
  const cupoSel = c.cupo === null ? 'sin' : [50000, 100000].includes(c.cupo) ? String(c.cupo) : 'otro';
  const contactosApi = 'contacts' in navigator && 'ContactsManager' in window;
  const resumenRecibos = () => `<b>Recibos:</b> ${PREF_RECIBOS[c.recibos]} · <b>Recordar:</b> ${PREF_RECORDAR[c.recordar]}`;
  return {
    titulo: nuevo ? 'Nuevo cliente' : 'Editar cliente',
    html: `<div class="pantalla">${barra({ titulo: nuevo ? 'Nuevo cliente' : 'Editar cliente', volver: nuevo ? (Vista.despues === 'anotar' ? 'elegir' : 'inicio') : `cliente-${c.id}` })}
    <main class="contenido"><form style="display:flex;flex-direction:column;gap:inherit" id="form-cliente" novalidate>
      <div class="campo"><label for="c-nombre">Nombre o apodo</label><input class="entrada" id="c-nombre" required value="${esc(c.nombre)}" placeholder="Ej.: Rosiris, la de la esquina" autocomplete="off" aria-describedby="c-nombre-a"><span class="ayuda" id="c-nombre-a">Como usted lo conoce. No hace falta el nombre completo.</span></div>
      <div class="campo"><label for="c-cel">Celular con WhatsApp <span class="opcional" style="font-weight:400;color:var(--gris)">(opcional)</span></label>
        <div class="con-prefijo"><span class="prefijo" aria-hidden="true">+57</span><input class="entrada" id="c-cel" type="tel" inputmode="tel" value="${esc(celLegible(c.cel))}" placeholder="10 dígitos" autocomplete="off">${contactosApi ? `<button type="button" class="btn-cuadro" data-accion="contactos" aria-label="Elegir de mis contactos">${ic('contactos', 26)}</button>` : ''}</div></div>
      ${nuevo ? `<div class="campo"><label for="c-saldo">¿Ya le debe algo? Lo del cuaderno <span class="opcional" style="font-weight:400;color:var(--gris)">(opcional)</span></label><input class="entrada" id="c-saldo" inputmode="numeric" placeholder="$0" autocomplete="off"></div>` : ''}
      ${grupoOpciones('cupo', 'Hasta cuánto le fía (cupo)', { 50000: '$50.000', 100000: '$100.000', otro: 'Otro monto', sin: 'Sin límite' }, cupoSel)}
      <div class="campo" id="caja-cupo"${cupoSel === 'otro' ? '' : ' hidden'}><label for="c-cupo">Cupo</label><input class="entrada" id="c-cupo" inputmode="numeric" value="${cupoSel === 'otro' && c.cupo ? pesos(c.cupo) : ''}" placeholder="$80.000"></div>
      ${grupoOpciones('pago', '¿Cuándo suele pagar?', PREF_PAGO, c.pago)}
      <details class="mas"${nuevo ? '' : ' open'}><summary><span id="resumen-recibos">${resumenRecibos()}</span><span class="accion">Cambiar</span></summary><div class="interior">
        ${grupoOpciones('recibos', 'Recibos', { whatsapp: 'Por WhatsApp', mostrar: 'Se los muestro aquí', semanal: 'Resumen semanal' }, c.recibos)}
        ${grupoOpciones('recordar', 'Recordarle el pago', { atraso: 'Solo si se atrasa', dia: 'El día de pago', nunca: 'Nunca' }, c.recordar)}
        ${nuevo ? '' : grupoOpciones('permiso', 'Permiso para WhatsApp', { si: 'Aceptó', pedido: 'Pendiente', no: 'No acepta mensajes', ninguno: 'No se ha pedido' }, c.permiso?.estado || 'ninguno')}
        <div class="campo"><label for="c-detalle">Algo para reconocerlo <span class="opcional" style="font-weight:400;color:var(--gris)">(opcional)</span></label><input class="entrada" id="c-detalle" value="${esc(c.detalle || '')}" placeholder="Ej.: Vende sopa"></div>
        <div class="campo"><label for="c-lista">Lo que siempre lleva <span class="opcional" style="font-weight:400;color:var(--gris)">(opcional)</span></label><input class="entrada" id="c-lista" value="${esc(c.lista?.productos || '')}" placeholder="Ej.: pan, leche y huevos"></div>
      </div></details>
      <p id="c-error" class="error" role="alert" hidden></p>
    </form></main>
    <div class="pie" role="region" aria-label="Acciones"><button type="submit" form="form-cliente" class="btn" id="c-guardar">${nuevo ? 'Guardar cliente' : 'Guardar cambios'}</button></div></div>`,
    montar(r) {
      const leer = activarGrupos(r, (g, v) => {
        if (g === 'cupo') { r.querySelector('#caja-cupo').hidden = v !== 'otro'; if (v === 'otro') r.querySelector('#c-cupo').focus(); }
        if (g === 'recibos' || g === 'recordar') { c[g] = v; r.querySelector('#resumen-recibos').innerHTML = resumenRecibos(); }
        if (nuevo) etiqueta();
      });
      const cel = r.querySelector('#c-cel'), guardar = r.querySelector('#c-guardar');
      const etiqueta = () => { if (!nuevo) return; guardar.textContent = cel.value.replace(/\D/g, '').length >= 10 && leer('recibos') !== 'mostrar' ? 'Guardar y pedir permiso' : 'Guardar cliente'; };
      cel.addEventListener('input', etiqueta); etiqueta();
      ['#c-saldo', '#c-cupo'].forEach(s => { const i = r.querySelector(s); if (i) activarCampoPesos(i); });
      r.querySelector('[data-accion="contactos"]')?.addEventListener('click', async () => {
        try {
          const [ct] = await navigator.contacts.select(['name', 'tel'], { multiple: false });
          if (!ct) return;
          if (ct.tel?.[0]) { cel.value = celLegible(ct.tel[0].replace(/^\+?57/, '')); etiqueta(); }
          const n = r.querySelector('#c-nombre'); if (!n.value && ct.name?.[0]) n.value = ct.name[0];
        } catch (e) { avisar('No se pudo abrir la lista de contactos'); }
      });
      r.querySelector('#form-cliente').addEventListener('submit', async ev => {
        ev.preventDefault();
        const err = r.querySelector('#c-error'); err.hidden = true;
        const nombre = r.querySelector('#c-nombre').value.trim();
        const celD = cel.value.replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, '');
        const fallo = (msg, sel) => { err.textContent = msg; err.hidden = false; const f = r.querySelector(sel); f.setAttribute('aria-invalid', 'true'); f.focus(); };
        if (!nombre) return fallo('Escriba el nombre o apodo del cliente.', '#c-nombre');
        if (celD && (celD.length !== 10 || (!/^3/.test(celD) && !tienda().demo))) return fallo('Un celular de Colombia tiene 10 dígitos y empieza por 3.', '#c-cel');
        const cupoV = leer('cupo');
        let cupo = cupoV === 'sin' ? null : cupoV === 'otro' ? leerPesos(r.querySelector('#c-cupo').value) : Number(cupoV);
        if (cupoV === 'otro' && !cupo) return fallo('Escriba el cupo o elija "Sin límite".', '#c-cupo');
        const lista = r.querySelector('#c-lista').value.trim();
        const datos = { nombre, cel: celD, cupo, pago: leer('pago'), recibos: leer('recibos'), recordar: leer('recordar'), detalle: r.querySelector('#c-detalle').value.trim(),
          lista: lista ? { nombre: c.lista?.nombre || 'Lo de siempre', productos: lista } : null };
        if (nuevo) {
          const nc = { id: uid(), ...datos, permiso: { estado: 'ninguno', fecha: null }, proximaFecha: null, creado: new Date().toISOString() };
          await guardarCliente(nc);
          const saldo = leerPesos(r.querySelector('#c-saldo').value);
          if (saldo > 0) await registrarFiado({ c: nc, monto: saldo, que: 'Lo que venía del cuaderno', tipo: 'saldo' });
          avisar(`${nombreCorto(nombre)} quedó en su libreta`);
          if (celD && datos.recibos !== 'mostrar') ir(`permiso-${nc.id}`);
          else ir(Vista.despues === 'anotar' ? `anotar-${nc.id}` : `cliente-${nc.id}`);
        } else {
          const p = leer('permiso');
          Object.assign(c, datos);
          if (p && p !== c.permiso?.estado) c.permiso = { estado: p, fecha: new Date().toISOString() };
          await _ajustarFecha(c);
          avisar('Cambios guardados'); ir(`cliente-${c.id}`);
        }
      });
    }
  };
}
V.nuevo = () => formCliente(null);
V.editar = id => cliente(id) ? formCliente(cliente(id)) : null;

/* ───── Permiso de datos (Ley 1581 de 2012) ───── */
V.permiso = id => {
  const c = cliente(id); if (!c) return null;
  const n = nombreCorto(c.nombre);
  const siguiente = () => ir(Vista.despues === 'anotar' ? `anotar-${c.id}` : `cliente-${c.id}`);
  const pedido = c.permiso?.estado === 'pedido';
  return {
    titulo: `Permiso de ${n}`,
    html: `<div class="pantalla">${barra({ titulo: `Permiso de ${esc(n)}`, volver: `cliente-${c.id}` })}<main class="contenido holgado">
      <p style="font-size:1.125rem;line-height:1.625rem">Antes de mandarle recibos por WhatsApp, ${esc(n)} debe aceptar. Así lo pide la ley de datos personales (Ley 1581 de 2012).</p>
      ${!c.cel ? `<div class="info atencion">${ic('atencion', 22)}<p>Este cliente no tiene celular. <a href="#editar-${c.id}">Agregar el celular</a></p></div>` : `
      <h2 class="titulo-seccion suave">Este mensaje sale de su WhatsApp</h2>
      <div class="burbuja">${esc(mensajePermiso(c))}</div>
      <button type="button" class="${pedido ? 'btn-sec' : 'btn'}" data-accion="enviar">${ic('enviar', 22, 2.2)}${pedido ? 'Enviar otra vez' : 'Enviar por WhatsApp'}</button>
      <div style="display:flex;flex-direction:column;gap:.5rem;padding-top:.25rem">
        <span class="leyenda">Cuando responda:</span>
        <button type="button" class="${pedido ? 'btn' : 'btn-sec'}" data-accion="si">${ic('ok', 22, 2.4)}Ya me respondió que SÍ</button>
        <button type="button" class="btn-link" data-accion="no">Respondió que no</button>
        <p class="ayuda">Fiao guarda la fecha de su respuesta. Mientras tanto, sus cuentas se las puede mostrar en la tienda.</p>
      </div>`}
    </main><div class="pie" role="region" aria-label="Acciones"><button type="button" class="btn-link" data-accion="ahora-no">Ahora no, solo en la tienda</button></div></div>`,
    montar(r) {
      r.querySelector('[data-accion="enviar"]')?.addEventListener('click', async () => {
        abrirWhatsApp(c.cel, mensajePermiso(c));
        c.permiso = { estado: 'pedido', fecha: new Date().toISOString() }; await guardarCliente(c);
        await registrarContacto(c.id, 'permiso');
        avisar('Cuando responda, vuelva y toque "Ya me respondió que SÍ"'); mostrarRuta();
      });
      r.querySelector('[data-accion="si"]')?.addEventListener('click', async () => {
        c.permiso = { estado: 'si', fecha: new Date().toISOString() }; await guardarCliente(c);
        avisar(`Listo: ${n} aceptó recibir sus recibos`); siguiente();
      });
      r.querySelector('[data-accion="no"]')?.addEventListener('click', async () => {
        c.permiso = { estado: 'no', fecha: new Date().toISOString() }; c.recibos = 'mostrar'; await guardarCliente(c);
        avisar('Entendido: sus cuentas se las muestra en la tienda'); siguiente();
      });
      r.querySelector('[data-accion="ahora-no"]').addEventListener('click', siguiente);
    }
  };
};
