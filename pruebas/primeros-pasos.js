/* Fiao · «Mostrar o enviar un recibo» se marca en Primeros pasos al enviarlo por WhatsApp (2.3.4). */
const BASE = process.env.BASE || 'http://localhost:8140';
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const e = []; p.on('pageerror', x => e.push(x.message));
  await p.goto(BASE + '/index.html#bienvenida-camino'); await p.waitForTimeout(900);
  await p.locator('[data-accion="demo"]').click(); await p.waitForTimeout(2300); await p.keyboard.press('Escape');
  const r = await p.evaluate(async () => {
    window.abrirWhatsApp = () => {};
    const t = tienda(); t.demo = false; t.ocultarPasos = false; t.preguntoPagos = true; delete t.ultimaCopia; await guardarTienda(t);
    for (const m of Datos.movs.values()) { delete m.enviado; delete m.visto; }
    location.hash = '#cobros'; await new Promise(r => setTimeout(r, 600)); location.hash = '#inicio'; await new Promise(r => setTimeout(r, 900));
    const paso = () => [...document.querySelectorAll('.pasos li')].find(li => /recibo/.test(li.textContent))?.classList.contains('hecho');
    const antes = paso();
    const m = [...Datos.movs.values()].find(x => x.tipo === 'fiado' && !x.anulado && permisoOk(cliente(x.clienteId)));
    await enviarRecibo(cliente(m.clienteId), m); await new Promise(r => setTimeout(r, 600));
    return { antes, despues: paso(), hash: location.hash, pasos: !!document.querySelector('.pasos'), m: !!m, env: m && m.enviado };
  });
  const bien = r.antes === false && r.despues === true && !e.length;
  console.log(bien ? 'ok 1 mal 0' : 'FALLA ' + JSON.stringify(r) + ' ' + e.join(';'));
  await b.close(); process.exit(bien ? 0 : 1);
})();
