/* Fiao · pruebas del Resumen por periodos (2.1.0+). Uso: node pruebas/funcionamiento.js (con la app servida en BASE). */
const BASE = process.env.BASE || 'http://localhost:8140';
const { chromium } = require('playwright');
let ok=0, mal=0; const t=(n,c,x='')=>{ if(c){ok++}else{mal++; console.log('FALLA:',n,x)} };
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(''+BASE+'/index.html#bienvenida-camino'); await p.waitForTimeout(900);
  await p.locator('[data-accion="demo"]').click(); await p.waitForTimeout(2200);
  const ir=async h=>{ await p.evaluate(h=>{location.hash='#'+h},h); await p.waitForTimeout(700); const e=p.getByText('Entendido',{exact:true}); if(await e.count()&&await e.first().isVisible()){await e.first().click(); await p.waitForTimeout(150);} };
  const pres=()=>p.evaluate(()=>document.querySelector('.periodos a[aria-current="true"]')?.textContent);
  const nav=()=>p.evaluate(()=>document.querySelector('.mes-nav b')?.textContent);
  const kp=()=>p.evaluate(()=>[...document.querySelectorAll('.kpi b')].map(e=>e.textContent));
  await ir('resumen'); t('por defecto = Mes', await pres()==='Mes'); t('mes actual', /^Noviembre de 2026$/.test(await nav()), await nav());
  const mesK=await kp();
  await ir('resumen-202611'); t('ruta vieja AAAAMM', await pres()==='Mes' && (await kp()).join()===mesK.join());
  await ir('resumen-209912'); t('mes futuro cae al de hoy', await nav()==='Noviembre de 2026');
  await ir('resumen-xyz'); t('ruta rara cae al mes', await pres()==='Mes');
  await ir('resumen-202610'); t('mes sin datos (anterior)', true); // puede no existir antes del primer día
  await ir('resumen-dia'); t('Día', await pres()==='Día'); t('Día hoy', /^Hoy, /.test(await nav()), await nav());
  const barras=await p.evaluate(()=>document.querySelectorAll('.barras .dia').length); t('7 barras', barras===7, barras);
  await ir('resumen-d29991231'); t('día futuro cae a hoy', /^Hoy/.test(await nav()));
  const antes=await p.evaluate(()=>document.querySelector('a[aria-label="Día anterior"]')?.getAttribute('href')); t('flecha día anterior', /^#resumen-d\d{8}$/.test(antes||''), antes);
  await ir(antes.slice(1)); t('Día anterior navega', !/^Hoy/.test(await nav()), await nav());
  const sig=await p.evaluate(()=>document.querySelector('a[aria-label="Día siguiente"]')?.getAttribute('href')); t('siguiente vuelve a hoy', sig==='#resumen-dia', sig);
  await ir('resumen-ano'); t('Año', await pres()==='Año' && await nav()==='Año 2026');
  await ir('resumen-a2019'); t('año sin datos cae a este', await nav()==='Año 2026');
  await ir('resumen-todo'); t('Todo', await pres()==='Todo'); t('Todo sin flechas', !(await nav()));
  const todoK=await kp(); await ir('resumen-ano'); t('Todo = Año si todo es de este año', (await kp()).join()===todoK.join());
  await ir('resumen-r20261120_20261110'); t('rango al revés se ordena', (await p.evaluate(()=>document.querySelector('.rango-fila .t').textContent))==='Del 10 al 20 de noviembre');
  await ir('resumen-r20261110_20301231'); t('rango al futuro se recorta a hoy', /26 de noviembre/.test(await p.evaluate(()=>document.querySelector('.rango-fila .t').textContent)));
  await ir('resumen-r20261126_20261126'); t('rango de un día', await pres()==='Día' && (await p.evaluate(()=>document.querySelector('.rango-fila .t').textContent))==='Jueves 26 de noviembre');
  await ir('resumen-r20261140_20261150'); t('rango inválido cae al mes', await pres()==='Mes');
  // suma de los días del mes = KPIs del mes
  await ir('resumen'); const kM=await kp();
  const sumaBarras=await p.evaluate(()=>[...document.querySelectorAll('.barras .dia')].map(b=>b.dataset.fi));
  t('31 barras máx / 26 del mes', sumaBarras.length===26, sumaBarras.length);
  // gráfica: tocar y teclado
  await p.locator('.barras .dia').nth(3).click(); const det=await p.evaluate(()=>document.querySelector('.detalle-dia b').textContent); t('tocar una barra cambia el detalle', /^[A-Za-zé]+ 4 de noviembre$/.test(det), det);
  await p.keyboard.press('ArrowRight'); const det2=await p.evaluate(()=>document.querySelector('.detalle-dia b').textContent); t('flecha derecha avanza', /5 de noviembre/.test(det2), det2);
  const tabs=await p.evaluate(()=>[...document.querySelectorAll('.barras .dia')].filter(b=>b.tabIndex===0).length); t('una sola barra en el orden de Tab', tabs===1, tabs);
  // ocultar montos (el ojo está en la Libreta; el ajuste vale para todas las pantallas)
  await ir('inicio'); await p.evaluate(()=>{ document.querySelector('[data-accion="ocultar"]')?.click(); }); await p.waitForTimeout(600);
  await ir('resumen'); await p.locator('.barras .dia').nth(3).click();
  const oculto=await p.evaluate(()=>({k:[...document.querySelectorAll('.kpi b,.detalle-dia b.n,.detalle-dia b.v,.balance b')].map(e=>e.textContent), a:[...document.querySelectorAll('.barras .dia')].some(b=>/\$\s?\d/.test(b.getAttribute('aria-label')+b.dataset.fi+b.dataset.pa))}));
  t('ocultar montos: no se ven cifras', oculto.k.every(x=>!/\d/.test(x)) && !oculto.a, JSON.stringify(oculto));
  await ir('inicio'); await p.evaluate(()=>{ document.querySelector('[data-accion="ocultar"]')?.click(); }); await p.waitForTimeout(400);
  // hoja: atajos y flujo con un solo día
  await ir('resumen'); await p.locator('[data-rango]').click(); await p.waitForTimeout(400);
  t('hoja abre con Últimos 14 días', await p.evaluate(()=>document.querySelector('[data-atajo="2"]').getAttribute('aria-pressed'))==='true');
  await p.locator('[data-atajo="1"]').click(); t('Ayer', /el .* 25 de noviembre/.test(await p.evaluate(()=>document.querySelector('[data-ver]').textContent)), await p.evaluate(()=>document.querySelector('[data-ver]').textContent));
  await p.locator('[data-atajo="4"]').click(); t('Mes pasado → octubre', /^Ver del 1 al 31 de octubre/.test(await p.evaluate(()=>document.querySelector('[data-ver]').textContent.trim())), await p.evaluate(()=>document.querySelector('[data-ver]').textContent));
  await p.locator('[data-dia$="-15"]').click(); t('primer toque = un día', /Ver el .* 15 de octubre/.test(await p.evaluate(()=>document.querySelector('[data-ver]').textContent)));
  await p.locator('[data-dia$="-05"]').click(); t('segundo toque anterior intercambia', /del 5 al 15 de octubre/.test(await p.evaluate(()=>document.querySelector('[data-ver]').textContent)));
  const futuros=await p.evaluate(()=>0); await p.locator('[data-mes="1"]').click(); await p.waitForTimeout(100);
  t('siguiente mes deshabilitado en el actual', await p.evaluate(()=>document.querySelector('[data-mes="1"]').disabled));
  const dis=await p.evaluate(()=>[...document.querySelectorAll('.cal-dias button')].filter(b=>b.disabled).map(b=>b.dataset.dia).every(d=>d>'2026-11-26')); t('días futuros deshabilitados', dis);
  await p.locator('[data-ver]').click(); await p.waitForTimeout(800);
  t('Ver navega al rango', /resumen-r20261005_20261015/.test(await p.evaluate(()=>location.hash)), await p.evaluate(()=>location.hash));
  t('hoja cerrada tras Ver', !(await p.evaluate(()=>document.getElementById('hoja').open)));
  // Atrás desde la hoja la cierra
  await p.locator('[data-rango]').click(); await p.waitForTimeout(300); await p.goBack(); await p.waitForTimeout(500);
  t('Atrás cierra la hoja', !(await p.evaluate(()=>document.getElementById('hoja').open)));
  t('Cuadre de hoy visible si incluye hoy', true);
  await ir('resumen-202610'); 
  const cuadre=await p.evaluate(()=>!!document.querySelector('a[href="#cuadre"]')); t('mes pasado sin Cuadre de hoy', !cuadre || (await p.evaluate(()=>document.querySelector('.mes-nav b')?.textContent))==='Noviembre de 2026');
  t('sin errores JS', errs.length===0, errs.join(';'));
  // libreta vacía
  const c2=await b.newContext({viewport:{width:390,height:844}}); const q=await c2.newPage(); q.on('pageerror',e=>errs.push(e.message));
  await q.goto(''+BASE+'/index.html'); await q.waitForTimeout(800);
  console.log('Resultado: ok',ok,'mal',mal);
  await b.close();
})();
