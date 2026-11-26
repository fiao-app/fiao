/* Fiao · pruebas de las correcciones 2.1.1: fechas locales, versión, filtros, guía modal, foco. */
const BASE = process.env.BASE || 'http://localhost:8140';
const { chromium } = require('playwright');
let ok=0,mal=0;const t=(n,c,x='')=>{if(c)ok++;else{mal++;console.log('FALLA',n,x)}};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const p=await ctx.newPage();const e=[];p.on('pageerror',x=>e.push(x.message));
await p.goto(BASE+'/index.html#bienvenida-camino');await p.waitForTimeout(900);await p.locator('[data-accion="demo"]').click();await p.waitForTimeout(2300);
// A2 guía modal
t('guía: fondo inerte', await p.evaluate(()=>document.getElementById('app').inert===true));
t('guía: aria-modal', await p.evaluate(()=>document.querySelector('.guia-burbuja')?.getAttribute('aria-modal')==='true'));
await p.keyboard.press('Tab'); t('Tab se queda en la burbuja', await p.evaluate(()=>!!document.activeElement.closest('.guia-burbuja')), await p.evaluate(()=>document.activeElement.outerHTML.slice(0,80)));
await p.keyboard.press('Escape'); await p.waitForTimeout(400);
t('Escape salta la guía', await p.evaluate(()=>!document.querySelector('.guia-burbuja') && document.getElementById('app').inert===false));
// C1
const r=await p.evaluate(()=>{const tot=totalesDelDia();const c=datosCuadre();const pd=movimientosPorDia().get(isoDia())||{fi:0};return {tot:tot.fiado,c:c.h.fiado,n:c.h.nFiado,pd:pd.fi,pdn:pd.nf}});
t('C1: Libreta, Cuadre y Resumen dan lo mismo', r.tot===r.c && r.c===r.pd && r.n===r.pdn, JSON.stringify(r));
const r2=await p.evaluate(()=>{ // fiado a las 8:30 p. m. hora local de hoy
  const d=new Date(); d.setHours(20,30,0,0); const iso=d.toISOString(); return {utc:iso.slice(0,10), local:isoDia(new Date(iso)), hoy:isoDia()}; });
t('C1: 8:30 p. m. es de hoy', r2.local===r2.hoy, JSON.stringify(r2));
// C2
await p.evaluate(()=>{location.hash='#ajustes'});await p.waitForTimeout(900);
t('C2: versión en Ajustes', await p.evaluate(()=>(document.querySelector('.nota')?.textContent||'').includes('versión '+VERSION_APP)), await p.evaluate(()=>[...document.querySelectorAll('.nota')].map(x=>x.textContent).join('|')));
// C3
await p.evaluate(()=>{location.hash='#inicio'});await p.waitForTimeout(900);
const nm=await p.evaluate(()=>[...document.querySelectorAll('[data-filtro]')].map(b=>[b.hasAttribute('aria-label'),b.getAttribute('aria-describedby'),b.textContent.trim().replace(/\s+/g,' ')]));
t('C3: sin aria-label y con descripción', nm.every(x=>!x[0]&&x[1]==='filtro-ayuda'), JSON.stringify(nm));
// A4
const h=await p.evaluate(()=>{const b=document.querySelector('.chip-atiende');const r=b.getBoundingClientRect();const x=r.left+r.width/2;const top=document.elementFromPoint(x,r.top-3);const bot=document.elementFromPoint(x,r.bottom+3);return {h:r.height,arriba:!!top?.closest('.chip-atiende'),abajo:!!bot?.closest('.chip-atiende')}});
t('A4: el chip se toca 4 px más arriba y abajo', h.arriba&&h.abajo, JSON.stringify(h));
// A1 foco blanco en la cabecera
await p.locator('[data-accion="ayuda"]').first().focus(); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab');
t('A1: anillo blanco en cabecera', await p.evaluate(()=>getComputedStyle(document.activeElement).outlineColor), '');
console.log('color anillo:', await p.evaluate(()=>getComputedStyle(document.activeElement).outlineColor));
t('sin errores JS', e.length===0, e.join(';'));
console.log('ok',ok,'mal',mal); await b.close();})();
