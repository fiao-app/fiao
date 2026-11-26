/* Fiao · pruebas de «Dígale a Fiao» (2.4.0): el cerebro (frases → órdenes), el interruptor de Ajustes,
   mantener presionado «Fiar», la hoja con voz simulada y con texto, y que nada se guarde sin confirmar. */
const BASE = process.env.BASE || 'http://localhost:8140';
const { chromium } = require('playwright');
let ok = 0, mal = 0; const t = (n, c, x = '') => { if (c) ok++; else { mal++; console.log('FALLA', n, x); } };
const FRASES = [
  ['Fíale cinco mil a Keyla, una gaseosa', 'fiar', 'Keyla', 5000, 'Una gaseosa'],
  ['fiale 5.000 a keyla', 'fiar', 'Keyla', 5000],
  ['Anótale veinte mil quinientos a Yesid', 'fiar', 'Yesid', 20500],
  ['apúntale dos lucas a la profe', 'fiar', 'Profe Ramiro', 2000],
  ['Keyla se llevó 3500 de pan', 'fiar', 'Keyla', 3500, 'Pan'],
  ['Lucho se llevó una cerveza de 3 mil', 'fiar', 'Lucho', 3000, 'Una cerveza'],
  ['fiale media luca a la que vende sopa', 'fiar', 'Keyla', 500],
  ['ciento cincuenta mil a yesid', 'fiar', 'Yesid', 150000],
  ['cinco mil quinientos pesos a keyla de arroz', 'fiar', 'Keyla', 5500, 'Arroz'],
  ['dale 4000 a la peluquera', 'fiar', 'Yurleidis, la peluquera', 4000],
  ['fia 2 mil a jhon', 'fiar', 'Jhon Jairo', 2000],
  ['anota 1500 a martha', 'fiar', 'Martha Cecilia', 1500],
  ['fíale mil a Pedro', 'nuevo', 'Pedro', 1000],
  ['Yesid pagó veinte mil por Nequi', 'pago', 'Yesid', 20000, null, 'nequi'],
  ['yesi pago 5 mil por breb', 'pago', 'Yesid', 5000, null, 'breb'],
  ['Keyla abonó diez mil', 'pago', 'Keyla', 10000, null, 'efectivo'],
  ['la de la casa azul pagó quince mil', 'pago', 'Doña Nubia, la de la casa azul', 15000],
  ['Don Édgar pagó todo', 'pago', 'Don Édgar', 'saldo'],
  ['¿Cuánto me debe Don Édgar?', 'saldo', 'Don Édgar'],
  ['cuánto debe la de las arepas', 'saldo', 'Lucía, la de las arepas'],
  ['¿Cuánto hay en la calle?', 'calle'], ['¿Quién me debe más?', 'quien'], ['quienes estan atrasados', 'quien'],
  ['¿Cómo voy hoy?', 'hoy'], ['cuanto fie hoy', 'hoy'],
  ['Recuérdale a Yesid', 'recordar', 'Yesid'], ['muéstrale la cuenta a Keyla', 'mostrar', 'Keyla'],
  ['abre ajustes', 'ir'], ['vamos a cobros', 'ir'], ['oculta los montos', 'ocultar'], ['muestra los montos', 'destapar'],
  ['deshaz lo último', 'deshacer'], ['me equivoqué', 'deshacer'],
  ['fíale a Keyla', 'falta'], ['fíale 5000', 'falta'], ['hola fiao', 'nada'],
  ['Envíale cinco mil a Keyla', 'fiar', 'Keyla', 5000], ['pídele cinco mil a Keyla', 'fiar', 'Keyla', 5000], ['Fiel e cinco mil a Keyla', 'fiar', 'Keyla', 5000],
  ['Fíale 5 mil a Keyla y 3 mil a Yesid', 'lote'], ['Keyla pagó 5 mil y Yesid 3 mil por Nequi', 'lote'],
  ['Keyla se llevó una gaseosa de 2500 y un pan de mil', 'fiar', 'Keyla', 3500],
  ['cinco mil a Keyla y quinientos de dulces', 'fiar', 'Keyla', 5500],
  ['¿Cuándo paga Yesid?', 'cuando', 'Yesid'], ['¿Qué se llevó Keyla?', 'llevo', 'Keyla'], ['¿Cuánto le queda de cupo a Keyla?', 'cupoq', 'Keyla'],
  ['¿Cuánto me pagaron esta semana?', 'periodo'], ['¿Cuánto fié este mes?', 'periodo'], ['¿Quién paga hoy?', 'pagan'], ['¿Quién no viene hace rato?', 'ausentes'],
  ['Keyla paga el viernes', 'fecha', 'Keyla'], ['Ponle cupo de 50 mil a Keyla', 'cupo', 'Keyla'], ['Quítale el cupo a Keyla', 'cupo', 'Keyla'],
  ['Agrega a Pedro Pérez, celular 300 123 4567', 'cliente', 'Pedro Pérez'], ['El celular de Yesid es 3101234567', 'celular', 'Yesid'],
  ['Envíale el recibo a Keyla', 'recibo', 'Keyla'], ['Atiende Doña Rosa', 'atiende'], ['busca a Lucho', 'ficha', 'Lucho'],
  ['Mándale un recordatorio a Yesid', 'recordar', 'Yesid'], ['Don Édgar abonó cincuenta mil y Keyla pagó todo', 'lote'], ['fíale 3 mil a Keyla para el viernes', 'fiar', 'Keyla', 3000], ['Keyla, cinco mil', 'fiar', 'Keyla', 5000], ['dame el resumen', 'ir'], ['Fíale una luca y media a Keyla', 'fiar', 'Keyla', 1500]
];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); const e = []; p.on('pageerror', x => e.push(x.message));
  await p.goto(BASE + '/index.html#bienvenida-camino'); await p.waitForTimeout(1000);
  await p.locator('[data-accion="demo"]').click(); await p.waitForTimeout(2300); await p.keyboard.press('Escape');

  // 1 · El cerebro
  const res = await p.evaluate(fr => fr.map(([f]) => { const x = interpretar(f); return { tipo: x.tipo, c: x.c ? x.c.nombre : x.nombre, monto: x.monto, que: x.que, medio: x.medio, saldo: x.c ? saldoDe(x.c.id) : null }; }), FRASES);
  FRASES.forEach(([f, tipo, c, m, que, medio], i) => {
    const r = res[i];
    t(`«${f}» → ${tipo}`, r.tipo === tipo && (!c || r.c === c) && (m == null || r.monto === (m === 'saldo' ? r.saldo : m)) && (!que || r.que === que) && (!medio || r.medio === medio), JSON.stringify(r));
  });

  const mas = await p.evaluate(() => {
    const K = clientes().find(c => c.nombre === 'Keyla'), Y = clientes().find(c => c.nombre === 'Yesid'), ahora = Date.now();
    const h = new Date(2026, 10, 26), f = s => { const d = fechaEn(normalizar(s), h); return d ? isoDia(d) : null; };
    const pend = { tipo: 'fiar', c: K, monto: 2000, medio: 'efectivo', oidos: [] }, pp = { tipo: 'pago', c: K, monto: 2000, medio: 'efectivo', oidos: [] };
    aprenderApodo(['yeyo'], Y);
    return {
      yYesid: interpretar('¿y Yesid?', { tipo: 'saldo', c: K, cuando: ahora }).c?.nombre,
      loMismo: (x => x.tipo + x.c?.nombre + x.monto)(interpretar('lo mismo a Lucho', { tipo: 'fiar', c: K, monto: 2000, que: 'Pan', cuando: ahora })),
      sumale: (x => x.tipo + x.c?.nombre + x.monto)(interpretar('súmale mil más', { tipo: 'fiar', c: K, monto: 2000, cuando: ahora })),
      cuando: interpretar('¿Cuándo paga?', { tipo: 'saldo', c: K, cuando: ahora }).tipo,
      si: entenderConfirmacion('sí, anótelo', pend), no: entenderConfirmacion('no', pend),
      cuatro: entenderConfirmacion('no, cuatro mil', pend).monto, aYesid: entenderConfirmacion('a Yesid', pend).c.nombre,
      nequi: entenderConfirmacion('por Nequi', pp).medio, mas: entenderConfirmacion('súmale mil más', pend).monto,
      fechas: ['el viernes', 'mañana', 'el 15', 'en ocho días', 'fin de mes', 'la quincena', 'el otro viernes', 'el primero de diciembre'].map(f),
      apodo: interpretar('Fíale mil a Yeyo').c?.nombre,
      entendi: resumenOrden(interpretar('Envíale cinco mil a Keyla'))
    };
  });
  t('contexto: «¿y Yesid?»', mas.yYesid === 'Yesid', JSON.stringify(mas));
  t('contexto: «lo mismo a Lucho»', mas.loMismo === 'fiarLucho2000', mas.loMismo);
  t('contexto: «súmale mil más»', mas.sumale === 'fiarKeyla1000', mas.sumale);
  t('contexto: «¿Cuándo paga?»', mas.cuando === 'cuando');
  t('confirmar: sí / no', mas.si === 'si' && mas.no === 'no');
  t('corregir: monto, cliente, medio, sumar', mas.cuatro === 4000 && mas.aYesid === 'Yesid' && mas.nequi === 'nequi' && mas.mas === 3000, JSON.stringify(mas));
  t('fechas dichas', JSON.stringify(mas.fechas) === JSON.stringify(['2026-11-27', '2026-11-27', '2026-12-15', '2026-12-04', '2026-11-30', '2026-11-30', '2026-12-04', '2026-12-01']), JSON.stringify(mas.fechas));
  t('apodo aprendido', mas.apodo === 'Yesid');
  t('«Entendí» en limpio', mas.entendi === 'Fiar $ 5.000 a Keyla' || mas.entendi === 'Fiar $5.000 a Keyla', mas.entendi);
  await p.evaluate(async () => { const t = tienda(); t.alias = {}; await guardarTienda(t); });

  // 2 · Apagado de fábrica: mantener presionado «Fiar» no hace nada distinto
  t('viene apagado', await p.evaluate(() => !tienda().asistente));
  const fiar = p.locator('.nav .fiar');
  let bb = await fiar.boundingBox();
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.waitForTimeout(700); await p.mouse.up(); await p.waitForTimeout(600);
  t('apagado: presionar largo abre la hoja de fiar de siempre', await p.evaluate(() => document.querySelector('#hoja[open]') && !document.querySelector('#hoja .asis')));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);

  // 3 · Encenderlo en Ajustes
  await p.evaluate(() => { location.hash = '#ajustes'; }); await p.waitForTimeout(1000);
  t('Ajustes: no muestra la voz de respuesta si está apagado', await p.locator('[data-interruptor="asistenteVoz"]').count() === 0);
  await p.locator('[data-interruptor="asistente"]').click(); await p.waitForTimeout(700);
  t('se enciende y se guarda', await p.evaluate(() => tienda().asistente === true));
  t('aparece «Responder en voz alta», encendido', await p.locator('[data-interruptor="asistenteVoz"]').getAttribute('aria-checked') === 'true');
  await p.locator('[data-interruptor="asistenteVoz"]').click(); await p.waitForTimeout(300);
  t('«Responder en voz alta» se apaga', await p.evaluate(() => tienda().asistenteVoz === false));

  // 4 · Sin voz del navegador (como el iPhone instalado): la hoja ofrece escribir
  await p.evaluate(() => { Oido.clase = null; location.hash = '#inicio'; }); await p.waitForTimeout(900);
  const antes = await p.evaluate(() => saldoDe(clientes().find(c => c.nombre === 'Keyla').id));
  bb = await fiar.boundingBox();
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.waitForTimeout(700); await p.mouse.up(); await p.waitForTimeout(700);
  t('presionar largo abre «Dígale a Fiao»', await p.evaluate(() => !!document.querySelector('#hoja[open] .asis') && document.querySelector('#hoja h2').textContent === 'Dígale a Fiao'));
  t('y no abre también la hoja de fiar', await p.locator('#h-anotar').count() === 0);
  t('sin voz: caja para escribir', await p.locator('#asis-orden').count() === 1);
  await p.fill('#asis-orden', 'Fíale cinco mil a Keyla, una gaseosa'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  t('tarjeta de confirmación con el monto', /\$\s?5\.000/.test(await p.locator('.asis-tarjeta').textContent()), await p.locator('.asis').textContent());
  t('nada se guarda antes de confirmar', await p.evaluate(a => saldoDe(clientes().find(c => c.nombre === 'Keyla').id) === a, antes));
  await p.locator('[data-asis="si"]').click(); await p.waitForTimeout(900);
  t('al confirmar se anota el fiado', await p.evaluate(a => saldoDe(clientes().find(c => c.nombre === 'Keyla').id) === a + 5000, antes));
  t('con lo que se llevó', await p.evaluate(() => [...Datos.movs.values()].sort((a, b) => b.fecha.localeCompare(a.fecha))[0].que === 'Una gaseosa'));
  t('la hoja se cierra y sale el aviso', await p.evaluate(() => !document.querySelector('#hoja[open]') && !!document.querySelector('#aviso.ver, #aviso[data-ver], #aviso:not([hidden])')));

  // 5 · Deshacer por voz
  await p.evaluate(() => abrirAsistente()); await p.waitForTimeout(500);
  await p.fill('#asis-orden', 'me equivoqué'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  await p.locator('[data-asis="si"]').click(); await p.waitForTimeout(800);
  t('deshacer devuelve el saldo', await p.evaluate(a => saldoDe(clientes().find(c => c.nombre === 'Keyla').id) === a, antes));

  // 6 · Voz simulada: el reconocedor entrega frases en orden (la orden y después la respuesta a la tarjeta)
  await p.evaluate(() => {
    window.__frases = [];
    Oido.clase = class { start() { const f = window.__frases.shift(); setTimeout(() => { if (f) this.onresult({ results: [Object.assign([{ transcript: f }], { isFinal: true })] }); this.onend(); }, 120); } stop() {} abort() {} };
  });
  const sal = n => p.evaluate(n => saldoDe(clientes().find(c => c.nombre === n).id), n);
  const decir = async (frases, espera = 1600) => { await p.evaluate(f => { window.__frases = f; Asistente.sinVoz = false; abrirAsistente(); }, frases); await p.waitForTimeout(espera); };
  const yAntes = await sal('Yesid');
  await p.evaluate(() => { window.__frases = ['Yesid pagó diez mil por Nequi']; abrirAsistente(); }); await p.waitForTimeout(60);
  t('con voz: micrófono escuchando', await p.locator('.asis-mic').count() === 1);
  await p.waitForTimeout(400);
  t('con voz: entiende el pago', /Pago/.test(await p.locator('.asis-tarjeta').textContent()) && /Nequi/.test(await p.locator('.asis-tarjeta').textContent()));
  t('muestra «Entendí:» en limpio', /Entendí:\s*Pago de/.test(await p.locator('.asis-dicho').textContent()));
  await p.locator('[data-asis="si"]').click(); await p.waitForTimeout(900);
  t('pago anotado por Nequi', await p.evaluate(a => { const c = clientes().find(c => c.nombre === 'Yesid'); const m = [...Datos.movs.values()].sort((a, b) => b.fecha.localeCompare(a.fecha))[0]; return saldoDe(c.id) === a - 10000 && m.medio === 'nequi'; }, yAntes));
  // «Envíale» (lo que oye el celular) se anota igual, y la tarjeta dice lo que entendió
  let l0 = await sal('Lucho');
  await decir(['Envíale dos mil a Lucho', 'sí']);
  t('confirmar diciendo «sí» anota', await sal('Lucho') === l0 + 2000, String(await sal('Lucho') - l0));
  l0 = await sal('Lucho');
  await decir(['Fíale dos mil a Lucho', 'no, tres mil', 'sí'], 2400);
  t('corregir hablando «no, tres mil» y confirmar', await sal('Lucho') === l0 + 3000, String(await sal('Lucho') - l0));
  l0 = await sal('Lucho');
  await decir(['Fíale dos mil a Lucho', 'no']);
  t('decir «no» cancela sin anotar', await sal('Lucho') === l0 && !(await p.evaluate(() => !!document.querySelector('#hoja[open]'))));
  l0 = await sal('Lucho'); let k0 = await sal('Keyla');
  await decir(['Fíale dos mil a Keyla', 'a Lucho', 'sí'], 2400);
  t('corregir el cliente hablando', await sal('Lucho') === l0 + 2000 && await sal('Keyla') === k0);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);

  // 6b · Varias cosas a la vez (escrito)
  await p.evaluate(() => { Oido.clase = null; abrirAsistente(); }); await p.waitForTimeout(500);
  k0 = await sal('Keyla'); const y0 = await sal('Yesid');
  await p.fill('#asis-orden', 'Fíale 5 mil a Keyla y 3 mil a Yesid'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  t('lote: una tarjeta con dos filas', await p.locator('.asis-filas li').count() === 2);
  await p.locator('[data-asis="si"]').click(); await p.waitForTimeout(1200);
  t('lote: anota los dos', await sal('Keyla') === k0 + 5000 && await sal('Yesid') === y0 + 3000, [k0, y0, await sal('Keyla'), await sal('Yesid'), await p.locator('#aviso').textContent()].join(' '));
  // Productos con precio y precio aprendido
  await p.evaluate(() => abrirAsistente()); await p.waitForTimeout(500);
  l0 = await sal('Lucho');
  await p.fill('#asis-orden', 'Lucho se llevó una cerveza de 3 mil y un pan de mil'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  t('dos productos: suma $4.000 con desglose', /4\.000/.test(await p.locator('.asis-monto').textContent()) && await p.locator('.asis-desglose li').count() === 2);
  await p.locator('[data-asis="si"]').click(); await p.waitForTimeout(900);
  t('aprende el precio de la cerveza', await p.evaluate(() => { const r = interpretar('Fíale dos cervezas a Keyla'); return r.tipo === 'fiar' && r.monto === 6000; }));
  // Fecha, cupo y cliente nuevo
  await p.evaluate(() => abrirAsistente()); await p.waitForTimeout(500);
  await p.fill('#asis-orden', 'Keyla paga el viernes'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  await p.locator('[data-asis="si"]').click(); await p.waitForTimeout(700);
  t('pone la fecha de pago', await p.evaluate(() => { const c = clientes().find(c => c.nombre === 'Keyla'); return diaDe(c.proximaFecha).getDay() === 5; }), await p.evaluate(() => clientes().find(c => c.nombre === 'Keyla').proximaFecha + ' ' + document.querySelector('.asis')?.innerText));
  await p.evaluate(() => abrirAsistente()); await p.waitForTimeout(500);
  await p.fill('#asis-orden', 'Ponle cupo de 80 mil a Keyla'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  await p.locator('[data-asis="si"]').click(); await p.waitForTimeout(700);
  t('cambia el cupo', await p.evaluate(() => clientes().find(c => c.nombre === 'Keyla').cupo === 80000));
  await p.evaluate(() => abrirAsistente()); await p.waitForTimeout(500);
  await p.fill('#asis-orden', 'Agrega a Pedro Pérez, celular 300 123 4567'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  await p.locator('[data-asis="si"]').click(); await p.waitForTimeout(700);
  t('agrega cliente con celular', await p.evaluate(() => { const c = clientes().find(c => c.nombre === 'Pedro Pérez'); return !!c && c.cel === '3001234567'; }));
  // Seguidilla con contexto: después de Pedro, «¿cuánto debe?»
  t('seguidilla: «¿y Yesid?» repite la pregunta', await p.evaluate(() => { const k = clientes().find(c => c.nombre === 'Keyla'); return interpretar('¿y Yesid?', { tipo: 'cuando', c: k, cuando: Date.now() }).tipo === 'cuando'; }));

  // 7 · Preguntas y errores de voz
  await p.evaluate(() => { Oido.clase = class { start() { setTimeout(() => this.onerror({ error: 'not-allowed' }), 100); } stop() {} abort() {} }; Asistente.sinVoz = false; abrirAsistente(); }); await p.waitForTimeout(600);
  t('sin permiso del micrófono: pasa a escribir', await p.locator('#asis-orden').count() === 1);
  await p.fill('#asis-orden', '¿Cuánto me debe Don Édgar?'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  t('responde el saldo', await p.evaluate(() => document.querySelector('.asis-respuesta b').textContent.includes(pesos(saldoDe(clientes().find(c => c.nombre === 'Don Édgar').id)))));
  await p.locator('[data-asis="otra"], [data-asis="escribir"]').first().click(); await p.waitForTimeout(300);
  await p.fill('#asis-orden', 'blablá'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  t('no entendió: lo dice con ejemplos', /No le entendí/.test(await p.locator('.asis').textContent()));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  // Ayuda ofrece el botón accesible
  await p.evaluate(() => abrirAyuda()); await p.waitForTimeout(500);
  t('la Ayuda ofrece «Dígale a Fiao»', await p.locator('#hoja [data-accion="asistente"]').count() === 1);
  await p.keyboard.press('Escape');
  t('sin errores de página', !e.length, e.join(' | '));
  console.log(`asistente: ${ok} bien, ${mal} mal`); await b.close(); process.exit(mal ? 1 : 0);
})();
