/* Fiao · «Como imagen» sigue el mismo camino que «Enviar recibo»: celular → permiso → recibo (2.3.2). */
const BASE = process.env.BASE || 'http://localhost:8140';
const { chromium } = require('playwright');
let ok = 0, mal = 0; const t = (n, c, x = '') => { if (c) ok++; else { mal++; console.log('FALLA', n, x); } };
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const e = []; p.on('pageerror', x => e.push(x.message));
  await p.goto(BASE + '/index.html#bienvenida-camino'); await p.waitForTimeout(900);
  await p.locator('[data-accion="demo"]').click(); await p.waitForTimeout(2300); await p.keyboard.press('Escape');
  await p.evaluate(() => { window.abrirWhatsApp = () => { window._wa = (window._wa || 0) + 1; }; });
  const titulo = () => p.evaluate(() => document.getElementById('hoja')?.open ? document.querySelector('#hoja h2')?.textContent : '(cerrada)');
  for (const imagen of [false, true]) {
    const nombre = imagen ? 'Prueba Imagen' : 'Prueba Recibo';
    await p.evaluate(async ({ nombre, imagen }) => {
      const c = { id: uid(), nombre, cel: '', cupo: null, pago: 'quincena', recibos: 'whatsapp', recordar: 'atraso', detalle: '', lista: null, permiso: { estado: 'ninguno', fecha: null }, proximaFecha: null, creado: new Date().toISOString() };
      await guardarCliente(c); const r = await registrarFiado({ c, monto: 2000 }); const m = r.m || r;
      window._c = c; window._m = m || { id: 'x', clienteId: c.id, tipo: 'fiado', monto: 2000, fecha: new Date().toISOString() };
      enviarRecibo(c, window._m, { imagen });
    }, { nombre, imagen }); await p.waitForTimeout(700);
    const t1 = await titulo(); t(`${imagen ? 'imagen' : 'recibo'}: primero pide el celular`, /celular/.test(t1 || ''), t1);
    await p.fill('#h-celular', '3001234567'); await p.locator('#h-cel button[type="submit"]').click(); await p.waitForTimeout(700);
    const t2 = await titulo(); t(`${imagen ? 'imagen' : 'recibo'}: después el permiso`, /permiso/.test(t2 || ''), t2);
    await p.locator('#hoja [data-r="si"]').click(); await p.waitForTimeout(1200);
    const t3 = await titulo(); t(`${imagen ? 'imagen' : 'recibo'}: «Ya me dijo que sí» no vuelve al permiso`, !/permiso/.test(t3 || ''), t3);
    if (imagen) t('imagen: abre la hoja del recibo como imagen', /imagen|recibo/i.test(t3 || ''), t3);
    else t('recibo: abre WhatsApp', await p.evaluate(() => window._wa >= 1));
    await p.evaluate(() => { const d = document.getElementById('hoja'); if (d.open) d.close(); }); await p.waitForTimeout(400);
  }
  t('sin errores de JavaScript', e.length === 0, e.join(';'));
  console.log('ok', ok, 'mal', mal); await b.close(); process.exit(mal ? 1 : 0);
})();
