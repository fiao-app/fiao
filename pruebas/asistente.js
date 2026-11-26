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
  ['fíale a Keyla', 'falta'], ['fíale 5000', 'falta'], ['hola fiao', 'nada']
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

  // 6 · Voz simulada: el reconocedor entrega la frase y Fiao la entiende
  await p.evaluate(() => {
    Oido.clase = class { start() { setTimeout(() => { this.onresult({ results: [Object.assign([{ transcript: 'Yesid pagó diez mil por Nequi' }], { isFinal: true })] }); this.onend(); }, 200); } stop() {} abort() {} };
  });
  const yAntes = await p.evaluate(() => saldoDe(clientes().find(c => c.nombre === 'Yesid').id));
  await p.evaluate(() => abrirAsistente()); await p.waitForTimeout(60);
  t('con voz: micrófono escuchando', await p.locator('.asis-mic').count() === 1);
  await p.waitForTimeout(500);
  t('con voz: entiende el pago', /Pago/.test(await p.locator('.asis-tarjeta').textContent()) && /Nequi/.test(await p.locator('.asis-tarjeta').textContent()));
  await p.locator('[data-asis="si"]').click(); await p.waitForTimeout(900);
  t('pago anotado por Nequi', await p.evaluate(a => { const c = clientes().find(c => c.nombre === 'Yesid'); const m = [...Datos.movs.values()].sort((a, b) => b.fecha.localeCompare(a.fecha))[0]; return saldoDe(c.id) === a - 10000 && m.medio === 'nequi'; }, yAntes));

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
