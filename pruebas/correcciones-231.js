/* Fiao · pruebas de las correcciones 2.3.1: avisos en Oscuro, cifra fija del Resumen, Ocultar montos al instante,
   versión en la bienvenida, «Todo guardado» y exportar a Excel. */
const BASE = process.env.BASE || 'http://localhost:8140';
const { chromium } = require('playwright');
let ok = 0, mal = 0; const t = (n, c, x = '') => { if (c) ok++; else { mal++; console.log('FALLA', n, x); } };
const L = h => { const c = h.match(/\d+/g).slice(0, 3).map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const cr = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const p = await ctx.newPage(); const e = []; p.on('pageerror', x => e.push(x.message));
  await p.goto(BASE + '/index.html#bienvenida'); await p.waitForTimeout(1000);
  t('bienvenida: versión real, sin «de prueba»', await p.evaluate(() => { const n = document.querySelector('.nota')?.textContent || ''; return n.includes('Versión ' + VERSION_APP) && !/prueba/i.test(n); }), await p.evaluate(() => document.querySelector('.nota')?.textContent));
  await p.goto(BASE + '/index.html#bienvenida-camino'); await p.waitForTimeout(900);
  await p.locator('[data-accion="demo"]').click(); await p.waitForTimeout(2300); await p.keyboard.press('Escape');
  // Avisos legibles en los tres temas
  for (const tema of ['color', 'oscuro', 'tinta']) {
    await p.evaluate(tm => { document.documentElement.dataset.tema = tm; avisar('Prueba de aviso.', { acciones: [{ texto: 'Deshacer', fn: () => {} }] }); }, tema);
    await p.waitForTimeout(400);
    const c = await p.evaluate(() => { const a = document.getElementById('aviso'); const s = getComputedStyle(a); const tx = getComputedStyle(a.querySelector('.texto')); const bt = a.querySelector('.acciones button'); return { fondo: s.backgroundColor, letra: tx.color, boton: bt ? getComputedStyle(bt).color : s.color }; });
    t(`aviso legible en ${tema}`, cr(c.fondo, c.letra) >= 4.5, JSON.stringify(c) + ' ' + cr(c.fondo, c.letra).toFixed(2));
  }
  await p.evaluate(() => { document.documentElement.dataset.tema = 'color'; ocultarAviso(); });
  // Resumen: «En la calle» no cuenta al cambiar de periodo; Recuperó y Fió sí
  await p.evaluate(() => { location.hash = '#resumen'; }); await p.waitForTimeout(1500);
  const x = p.getByText('Entendido', { exact: true }); if (await x.count() && await x.first().isVisible()) await x.first().click();
  await p.waitForTimeout(300); await p.evaluate(() => { window.scrollTo(0, 400); }); await p.waitForTimeout(200);
  await p.evaluate(() => { location.hash = '#resumen-dia'; }); await p.waitForTimeout(80);
  const durante = await p.evaluate(() => ({ calle: document.querySelector('#k-calle').textContent, pa: document.querySelector('#k-pa').textContent, paFinal: pesos(+document.querySelector('#k-pa').dataset.valor), y: window.scrollY }));
  await p.waitForTimeout(800);
  const total = await p.evaluate(() => pesos(totalEnLaCalle()));
  t('En la calle no se anima al cambiar de periodo', durante.calle === total, JSON.stringify(durante));
  t('Recuperó se anima al cambiar de periodo', durante.pa !== durante.paFinal, JSON.stringify(durante));
  t('cambiar de periodo no sube al inicio', durante.y > 100, String(durante.y));
  // Ocultar montos desde Ajustes: al instante
  await p.evaluate(() => { location.hash = '#ajustes'; }); await p.waitForTimeout(1000);
  await p.locator('[data-interruptor="ocultar"]').click(); await p.waitForTimeout(300);
  await p.evaluate(() => { location.hash = '#inicio'; }); await p.waitForTimeout(900);
  t('ocultar montos se aplica sin reabrir', await p.evaluate(() => Vista.oculto && /•/.test(document.querySelector('.cifra')?.textContent || '')), await p.evaluate(() => document.querySelector('.cifra')?.textContent));
  t('y queda para la próxima vez', await p.evaluate(() => tienda().ocultarAlAbrir === true));
  await p.evaluate(() => { location.hash = '#ajustes'; }); await p.waitForTimeout(900);
  t('el interruptor muestra el estado actual', await p.evaluate(() => document.querySelector('[data-interruptor="ocultar"]').getAttribute('aria-checked') === 'true'));
  await p.locator('[data-interruptor="ocultar"]').click(); await p.waitForTimeout(300);
  t('y se vuelve a mostrar', await p.evaluate(() => !Vista.oculto && tienda().ocultarAlAbrir === false));
  // «Todo guardado»
  t('línea «Todo guardado»', await p.evaluate(() => /Todo guardado en este celular/.test(document.body.textContent)));
  // Exportar a Excel
  const [desc] = await Promise.all([p.waitForEvent('download'), p.locator('[data-accion="excel"]').click()]);
  const ruta = await desc.path(); const txt = require('fs').readFileSync(ruta, 'utf8');
  const lineas = txt.replace(/^﻿/, '').split('\r\n');
  const n = await p.evaluate(() => Datos.movs.size);
  t('CSV con BOM, punto y coma y una fila por movimiento', txt.startsWith('﻿') && lineas[0].startsWith('Fecha;Hora;Cliente;Tipo;Monto') && lineas.length === n + 1, `${lineas.length} vs ${n + 1}`);
  t('sin errores de JavaScript', e.length === 0, e.join(';'));
  console.log('ok', ok, 'mal', mal); await b.close(); process.exit(mal ? 1 : 0);
})();
