/* Fiao · Resumen por periodos (2.1.0).
   Día · Mes · Año · Todo, o un rango de fechas a elección, con la gráfica «Fió y recuperó» en pares.
   Todo sale de los movimientos que ya existen (movimientosPorDia): no se guarda nada nuevo.
   Rutas: #resumen (el mes de hoy) · #resumen-202611 (ese mes, como siempre) · #resumen-dia · #resumen-d20261125 ·
          #resumen-ano · #resumen-a2025 · #resumen-todo · #resumen-r20261113_20261126 (rango). */
'use strict';

const PERIODOS = [['dia', 'Día'], ['mes', 'Mes'], ['ano', 'Año'], ['todo', 'Todo']];
const ISO_OK = iso => /^\d{4}-\d{2}-\d{2}$/.test(iso) && isoDia(diaDe(iso)) === iso;
const ISO_DE8 = s => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
const SIN_GUION = iso => iso.replace(/-/g, '');
const dia3 = d => mayuscula(DIAS[new Date(d).getDay()].slice(0, 3));

/** Entiende el trozo de la ruta y devuelve el periodo: sus fechas, su rótulo y los periodos vecinos. */
function periodoDeRuta(p1, mapa) {
  const hoy = isoDia(), primero = primerDiaConDatos(mapa);
  p1 = String(p1 || '');
  let m;
  const dH = diaDe(hoy), yH = dH.getFullYear(), mH = dH.getMonth();
  if ((m = p1.match(/^r(\d{8})_(\d{8})$/)) && ISO_OK(ISO_DE8(m[1])) && ISO_OK(ISO_DE8(m[2]))) {
    let a = ISO_DE8(m[1]), b = ISO_DE8(m[2]);
    if (a > b) [a, b] = [b, a];
    if (b > hoy) b = hoy;
    if (a > b) a = b;
    return { tipo: 'rango', desde: a, hasta: b, rotulo: textoRango(a, b).titulo, prev: null, next: null };
  }
  if (p1 === 'todo') return { tipo: 'todo', desde: primero, hasta: hoy, rotulo: `Desde ${MESES[diaDe(primero).getMonth()]} de ${diaDe(primero).getFullYear()}`, prev: null, next: null };
  if (p1 === 'dia' || ((m = p1.match(/^d(\d{8})$/)) && ISO_OK(ISO_DE8(m[1])))) {
    let d = p1 === 'dia' ? hoy : ISO_DE8(m[1]);
    if (d > hoy) d = hoy;
    const ant = isoDia(sumarDias(diaDe(d), -1)), sig = isoDia(sumarDias(diaDe(d), 1));
    return { tipo: 'dia', desde: d, hasta: d, rotulo: d === hoy ? `Hoy, ${fechaCorta(diaDe(d))}` : mayuscula(fechaLarga(diaDe(d))),
      prev: d > primero ? 'd' + SIN_GUION(ant) : null, next: d < hoy ? (sig === hoy ? 'dia' : 'd' + SIN_GUION(sig)) : null };
  }
  if (p1 === 'ano' || (m = p1.match(/^a(\d{4})$/))) {
    let y = p1 === 'ano' ? yH : +m[1];
    const y0 = diaDe(primero).getFullYear();
    if (y > yH || y < y0) y = yH;
    return { tipo: 'ano', desde: `${y}-01-01`, hasta: y === yH ? hoy : `${y}-12-31`, anio: y, rotulo: `Año ${y}`, prev: y > y0 ? 'a' + (y - 1) : null, next: y < yH ? (y + 1 === yH ? 'ano' : 'a' + (y + 1)) : null };
  }
  /* Mes: «mes», #resumen sin nada o AAAAMM (así eran los enlaces de antes). Si el mes no existe, el de hoy. */
  const mp = /^\d{6}$/.test(p1) ? `${p1.slice(0, 4)}-${p1.slice(4)}` : '';
  const k0 = primero.slice(0, 7), kH = hoy.slice(0, 7);
  const mesSel = mp && mp >= k0 && mp <= kH && +mp.slice(5) >= 1 && +mp.slice(5) <= 12 ? mp : kH;
  const [y, mm] = mesSel.split('-').map(Number);
  const ult = new Date(y, mm, 0).getDate();
  const ant = new Date(y, mm - 2, 1), sig = new Date(y, mm, 1);
  const clave = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  return { tipo: 'mes', desde: `${mesSel}-01`, hasta: mesSel === kH ? hoy : `${mesSel}-${String(ult).padStart(2, '0')}`, mes: mm - 1, anio: y,
    rotulo: `${mayuscula(MESES[mm - 1])} de ${y}`, prev: mesSel > k0 ? clave(ant) : null, next: mesSel < kH ? clave(sig) : null };
}

/** «Del 13 al 26 de noviembre» · «Del 28 de octubre al 4 de noviembre» · «Jueves 26 de noviembre» */
function textoRango(a, b) {
  const da = diaDe(a), db = diaDe(b);
  if (a === b) return { titulo: mayuscula(fechaLarga(db)), boton: `el ${fechaLarga(db)}` };
  const mismoMes = da.getMonth() === db.getMonth() && da.getFullYear() === db.getFullYear();
  const t = mismoMes ? `del ${da.getDate()} al ${db.getDate()} de ${MESES[db.getMonth()]}` : `del ${diaMes(da)} al ${diaMes(db)}`;
  const conAnio = da.getFullYear() !== db.getFullYear() ? ` de ${db.getFullYear()}` : '';
  return { titulo: mayuscula(t) + conAnio, boton: t + conAnio };
}

/** Las barras de la gráfica: un grupo por día o por mes, según el periodo. */
function gruposDelPeriodo(per, mapa) {
  const hoy = isoDia();
  const del = (iso, et) => { const x = mapa.get(iso) || { fi: 0, pa: 0, nf: 0 }; return { ...x, et, largo: mayuscula(fechaLarga(diaDe(iso))), hoy: iso === hoy }; };
  const porMes = (desde, hasta) => {
    const out = [], d0 = diaDe(desde), d1 = diaDe(hasta);
    for (let y = d0.getFullYear(), m = d0.getMonth(); y < d1.getFullYear() || (y === d1.getFullYear() && m <= d1.getMonth()); m++) {
      if (m > 11) { m = 0; y++; }
      const a = `${y}-${String(m + 1).padStart(2, '0')}-01`, z = `${y}-${String(m + 1).padStart(2, '0')}-${String(new Date(y, m + 1, 0).getDate()).padStart(2, '0')}`;
      const t = sumaDelPeriodo(mapa, a < desde ? desde : a, z > hasta ? hasta : z);
      out.push({ ...t, et: MESES[m].slice(0, 3), largo: `${mayuscula(MESES[m])} de ${y}`, hoy: hoy.startsWith(`${y}-${String(m + 1).padStart(2, '0')}`) });
      if (y === d1.getFullYear() && m === d1.getMonth()) break;
    }
    return out;
  };
  const poner = (g, paso) => { g.forEach((x, i) => { if ((g.length - 1 - i) % paso) x.et = ''; }); return g; };
  if (per.tipo === 'dia' || (per.tipo === 'rango' && per.desde === per.hasta)) {
    const fin = diaDe(per.hasta), g = [];
    for (let i = 6; i >= 0; i--) { const iso = isoDia(sumarDias(fin, -i)); g.push(del(iso, iso === hoy ? 'Hoy' : dia3(diaDe(iso)))); }
    return { grupos: g, sel: 6, titulo: per.hasta === hoy ? 'Últimos 7 días' : `7 días hasta el ${diaMes(fin)}` };
  }
  if (per.tipo === 'mes' || per.tipo === 'rango') {
    const n = diasEntre(diaDe(per.desde), diaDe(per.hasta)) + 1;
    if (per.tipo === 'rango' && n > 62) { const g = poner(porMes(per.desde, per.hasta), Math.ceil(porMes(per.desde, per.hasta).length / 8)); return { grupos: g, sel: g.length - 1, titulo: 'Mes por mes del periodo' }; }
    const g = [];
    for (let i = 0; i < n; i++) { const iso = isoDia(sumarDias(diaDe(per.desde), i)), d = diaDe(iso).getDate(); g.push(del(iso, per.tipo === 'mes' ? (d === 1 || d % 5 === 0 ? String(d) : '') : String(d))); }
    if (per.tipo === 'rango') poner(g, Math.ceil(n / 8));
    return { grupos: g, sel: g.length - 1, titulo: per.tipo === 'mes' ? `Día por día de ${MESES[per.mes]}` : 'Día por día del periodo' };
  }
  if (per.tipo === 'ano') {
    const g = porMes(per.desde, per.hasta).map(x => ({ ...x, et: x.et[0].toUpperCase() }));
    return { grupos: g, sel: g.length - 1, titulo: `Mes por mes de ${per.anio}` };
  }
  const g = porMes(per.desde, per.hasta);
  return { grupos: poner(g, Math.ceil(g.length / 8)), sel: g.length - 1, titulo: 'Todo, mes por mes' };
}

/** Lo de arriba del Resumen: periodos, rango, cifras, balance y gráfica. */
function htmlPeriodoResumen(per, mapa) {
  const { grupos, sel, titulo } = gruposDelPeriodo(per, mapa);
  const kp = sumaDelPeriodo(mapa, per.desde, per.hasta);
  const neto = kp.fi - kp.pa;
  const mx = Math.max(1, ...grupos.flatMap(g => [g.fi, g.pa]));
  const gap = grupos.length > 31 ? '1px' : grupos.length > 14 ? '.125rem' : '.375rem';
  const enlace = p => `#resumen-${p}`;
  const pestanas = PERIODOS.map(([k, t]) => `<a href="${enlace(k)}"${k === per.tipo || (k === 'dia' && per.tipo === 'rango' && per.desde === per.hasta) ? ' aria-current="true"' : ''}>${t}</a>`).join('');
  const flecha = (p, icono, texto) => p ? `<a class="btn-icono" href="${enlace(p)}" aria-label="${texto}">${ic(icono, 26, 2.4)}</a>` : `<span class="btn-icono" aria-disabled="true" aria-hidden="true">${ic(icono, 26, 2.4)}</span>`;
  const unidad = { dia: 'día', mes: 'mes', ano: 'año' }[per.tipo];
  const navegar = unidad ? `<nav class="mes-nav" aria-label="${mayuscula(unidad)}">${flecha(per.prev, 'volver', `${mayuscula(unidad)} anterior`)}<b aria-live="polite">${per.rotulo}</b>${flecha(per.next, 'sigue', `${mayuscula(unidad)} siguiente`)}</nav>` : '';
  const filaRango = `<button type="button" class="rango-fila${per.tipo === 'rango' ? ' activa' : ''}" data-rango aria-haspopup="dialog"><span class="ic">${ic('calendario', 22, 2.4)}</span><span class="t">${per.tipo === 'rango' ? per.rotulo : 'Elegir día o rango de fechas'}</span>${ic('sigue', 22, 2.4)}</button>`;
  const balance = kp.fi === 0 && kp.pa === 0
    ? { ic: 'menos', t: 'Sin movimientos en este periodo', s: 'No hay fiados ni pagos anotados.' }
    : { ic: neto >= 0 ? 'mas' : 'menos', t: neto === 0 ? 'Le deben lo mismo que antes' : `Le deben ${monto(Math.abs(neto))} ${neto > 0 ? 'más' : 'menos'}`,
        s: (kp.nf ? `${kp.nf} ${kp.nf === 1 ? 'fiado' : 'fiados'} en este periodo<br>Promedio por fiado: ${monto(Math.round(kp.fi / kp.nf))}` : 'Ningún fiado en este periodo')
          /* 2.3.0 · Qué parte de lo fiado volvió en el periodo (puede pasar de 100 % si cobró deudas viejas). */
          + (kp.fi > 0 && !Vista.oculto ? `<br>Recuperó el ${Math.round(kp.pa / kp.fi * 100)} % de lo que fió` : '') };
  const g0 = grupos[sel];
  const barras = grupos.map((g, i) => `<button type="button" class="dia" tabindex="${i === sel ? 0 : -1}" aria-pressed="${i === sel}" data-largo="${esc(g.largo)}" data-fi="${monto(g.fi)}" data-pa="${monto(g.pa)}" aria-label="${esc(g.largo)}: fió ${monto(g.fi)}, recuperó ${monto(g.pa)}"><span class="b fio" style="height:${g.fi / mx * 100}%"></span><span class="b pag" style="height:${g.pa / mx * 100}%"></span></button>`).join('');
  const eje = grupos.map(g => `<span${g.hoy ? ' class="hoy"' : ''}>${g.et}</span>`).join('');
  return `<div class="periodos" role="group" aria-label="Periodo">${pestanas}</div>
    ${filaRango}
    ${navegar}
    <div class="kpis"><div class="kpi verde"><span>Recuperó</span><b>${monto(kp.pa)}</b></div><div class="kpi"><span>Fió</span><b>${monto(kp.fi)}</b></div></div>
    <div class="balance"><span class="ic">${ic(balance.ic, 22, 2.6)}</span><div><b>${balance.t}</b><span>${balance.s}</span></div></div>
    <section class="tarjeta grafica" aria-labelledby="t-gr"><h2 class="titulo-seccion" id="t-gr">${titulo}</h2>
      <div class="leyenda-gr" aria-hidden="true"><span><i class="l-fio"></i>Fió</span><span><i class="l-pag"></i>Recuperó</span></div>
      <div class="escala" aria-hidden="true"><span>${monto(mx)}</span></div>
      <div class="barras" role="group" aria-label="Fiado y recuperado, uno por uno" style="--gap:${gap}">${barras}</div>
      <div class="ejex" aria-hidden="true" style="--gap:${gap}">${eje}</div>
      <div class="detalle-fila"><button type="button" class="btn-icono" data-paso="-1" aria-label="${unidadG(grupos)} anterior"${sel === 0 ? ' disabled' : ''}>${ic('volver', 24, 2.4)}</button>
        <div class="detalle-dia" aria-live="polite"><b>${esc(g0.largo)}</b><div class="par"><span>Fió <b class="n">${monto(g0.fi)}</b></span><span>Recuperó <b class="v">${monto(g0.pa)}</b></span></div></div>
        <button type="button" class="btn-icono" data-paso="1" aria-label="${unidadG(grupos)} siguiente"${sel === grupos.length - 1 ? ' disabled' : ''}>${ic('sigue', 24, 2.4)}</button></div>
      <p class="ayuda pista-grafica">Deslice el dedo sobre las barras o use las flechas.</p>
    </section>`;
}

/** ¿Las barras son días o meses? (para las flechas) */
function unidadG(g) { return /^[A-Za-zé]+ de \d{4}$/.test(g[0]?.largo || '') ? 'Mes' : 'Día'; }
/** Barras que se tocan (o se recorren con las flechas) para ver cuánto fió y recuperó ese día o mes. */
function montarGraficaResumen(r, per, mapa) {
  const bar = r.querySelector('.barras'); if (!bar) return;
  const det = r.querySelector('.detalle-dia');
  const lista = [...bar.querySelectorAll('.dia')];
  const ant = r.querySelector('[data-paso="-1"]'), sig = r.querySelector('[data-paso="1"]');
  let actual = lista.find(x => x.getAttribute('aria-pressed') === 'true');
  const poner = b => {
    if (!b || b === actual) return; actual = b;
    lista.forEach(x => { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); x.tabIndex = x === b ? 0 : -1; });
    det.innerHTML = `<b>${esc(b.dataset.largo)}</b><div class="par"><span>Fió <b class="n">${esc(b.dataset.fi)}</b></span><span>Recuperó <b class="v">${esc(b.dataset.pa)}</b></span></div>`;
    const i = lista.indexOf(b); if (ant) ant.disabled = i === 0; if (sig) sig.disabled = i === lista.length - 1;
  };
  bar.addEventListener('click', ev => { const b = ev.target.closest('.dia'); if (b) poner(b); });
  /* 2.3.0 · Deslizar el dedo sobre la gráfica la recorre (las barras finas del mes no piden puntería). */
  const enX = x => { const rs = bar.getBoundingClientRect(); const i = Math.max(0, Math.min(lista.length - 1, Math.floor((x - rs.left) / rs.width * lista.length))); return lista[i]; };
  let arrastra = false;
  bar.addEventListener('pointerdown', ev => { arrastra = true; poner(enX(ev.clientX)); });
  bar.addEventListener('pointermove', ev => { if (arrastra) poner(enX(ev.clientX)); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => bar.addEventListener(t, () => { arrastra = false; }));
  [[ant, -1], [sig, 1]].forEach(([b, d]) => b?.addEventListener('click', () => { const i = lista.indexOf(actual) + d; if (lista[i]) poner(lista[i]); }));
  bar.addEventListener('keydown', ev => {
    const lista = [...bar.querySelectorAll('.dia')], i = lista.indexOf(document.activeElement);
    if (i < 0) return;
    const j = ev.key === 'ArrowRight' ? Math.min(i + 1, lista.length - 1) : ev.key === 'ArrowLeft' ? Math.max(i - 1, 0) : ev.key === 'Home' ? 0 : ev.key === 'End' ? lista.length - 1 : -1;
    if (j < 0) return;
    ev.preventDefault(); poner(lista[j]); lista[j].focus();
  });
  r.querySelector('[data-rango]')?.addEventListener('click', () => abrirElegirDias(per, mapa));
}

/* ───── La hoja «Elegir días»: atajos y un calendario para marcar de qué día a qué día ───── */
function abrirElegirDias(per, mapa) {
  const hoy = isoDia(), dH = diaDe(hoy);
  const ayer = isoDia(sumarDias(dH, -1));
  const rangos = [
    ['Hoy', hoy, hoy], ['Ayer', ayer, ayer], ['Últimos 14 días', isoDia(sumarDias(dH, -13)), hoy],
    ['Este mes', isoDia(new Date(dH.getFullYear(), dH.getMonth(), 1, 12)), hoy],
    ['Mes pasado', isoDia(new Date(dH.getFullYear(), dH.getMonth() - 1, 1, 12)), isoDia(new Date(dH.getFullYear(), dH.getMonth(), 0, 12))]
  ];
  const e = per.tipo === 'rango' ? { a: per.desde, b: per.hasta, espera: false } : { a: rangos[2][1], b: hoy, espera: false };
  const ver = diaDe(e.b); const vista = { y: ver.getFullYear(), m: ver.getMonth() };
  const pintar = () => {
    const cab = `<div class="cal-cab"><button type="button" class="btn-icono" data-mes="-1" aria-label="Mes anterior">${ic('volver', 24, 2.4)}</button><b aria-live="polite">${mayuscula(MESES[vista.m])} de ${vista.y}</b><button type="button" class="btn-icono" data-mes="1" aria-label="Mes siguiente"${vista.y === dH.getFullYear() && vista.m === dH.getMonth() ? ' disabled' : ''}>${ic('sigue', 24, 2.4)}</button></div>`;
    const vacios = (new Date(vista.y, vista.m, 1).getDay() + 6) % 7, n = new Date(vista.y, vista.m + 1, 0).getDate();
    let celdas = '<span aria-hidden="true"></span>'.repeat(vacios);
    for (let d = 1; d <= n; d++) {
      const iso = `${vista.y}-${String(vista.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const clases = [iso > hoy ? 'f' : '', e.a && e.b && iso > e.a && iso < e.b ? 'mid' : '', iso === e.a && iso === e.b ? 'uno' : iso === e.a ? 'ini' : iso === e.b ? 'fin' : '', iso === hoy ? 'hoyc' : ''].filter(Boolean).join(' ');
      const marcado = iso >= e.a && iso <= e.b;
      celdas += `<button type="button" class="${clases}" data-dia="${iso}" aria-pressed="${marcado}" aria-label="${fechaLarga(diaDe(iso))}${iso === hoy ? ', hoy' : ''}"${iso > hoy ? ' disabled' : ''}><i>${d}</i></button>`;
    }
    const t = textoRango(e.a, e.b);
    return `${cabHoja('Elegir días')}
      <div class="atajos-dias" role="group" aria-label="Atajos">${rangos.map(([n, a, b], i) => `<button type="button" data-atajo="${i}" aria-pressed="${e.a === a && e.b === b}">${n}</button>`).join('')}</div>
      <div class="cal">${cab}<div class="cal-sem" aria-hidden="true">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(x => `<span>${x}</span>`).join('')}</div><div class="cal-dias" role="group" aria-label="${mayuscula(MESES[vista.m])} de ${vista.y}">${celdas}</div></div>
      <p class="ayuda cal-ayuda" aria-live="polite">${e.espera ? 'Ahora toque el último día. O toque «Ver» para ver solo este día.' : 'Toque el primer día y después el último.'}</p>
      <button type="button" class="btn" data-ver>${ic('grafica', 24, 2.4)}Ver ${t.boton}</button>
      <button type="button" class="btn-link" data-cerrar>Cancelar</button>`;
  };
  const montar = d => {
    d.querySelectorAll('[data-mes]').forEach(b => b.addEventListener('click', () => { vista.m += +b.dataset.mes; if (vista.m < 0) { vista.m = 11; vista.y--; } if (vista.m > 11) { vista.m = 0; vista.y++; } repintar('[data-mes]'); }));
    d.querySelectorAll('[data-atajo]').forEach(b => b.addEventListener('click', () => { const [, a, z] = rangos[+b.dataset.atajo]; e.a = a; e.b = z; e.espera = false; const v = diaDe(z); vista.y = v.getFullYear(); vista.m = v.getMonth(); repintar(`[data-atajo="${b.dataset.atajo}"]`); }));
    d.querySelectorAll('[data-dia]').forEach(b => b.addEventListener('click', () => {
      const iso = b.dataset.dia;
      if (!e.espera) { e.a = iso; e.b = iso; e.espera = true; } else { if (iso < e.a) { e.b = e.a; e.a = iso; } else e.b = iso; e.espera = false; }
      repintar(`[data-dia="${iso}"]`);
    }));
    d.querySelector('[data-ver]').addEventListener('click', () => { ir(`resumen-r${SIN_GUION(e.a)}_${SIN_GUION(e.b)}`); });
  };
  /* Se repinta solo el cuerpo (sin la animación de entrada) y el foco vuelve al botón que se tocó. */
  const repintar = foco => {
    const d = document.getElementById('hoja'), cuerpo = d.querySelector('.cuerpo');
    cuerpo.innerHTML = pintar();
    const t = cuerpo.querySelector('h2'); if (t) { t.id = 'hoja-titulo'; d.setAttribute('aria-labelledby', t.id); }
    cuerpo.querySelectorAll('[data-cerrar]').forEach(b => b.addEventListener('click', ev => { ev.preventDefault(); cerrarHoja(); }));
    montar(d); d.querySelector(foco)?.focus({ preventScroll: true });
  };
  abrirHoja(pintar(), montar, { nombre: 'rango-resumen' });
}
