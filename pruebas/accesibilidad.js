/* Fiao · auditoría de accesibilidad con axe en las 29 vistas (pantallas, hojas y página del vecino).
   Uso: node pruebas/accesibilidad.js <ancho> <tema> <letra>   (ej.: 390 oscuro grande)
   Escribe pruebas/resultados/r-<ancho>-<tema>-<letra>.json con fallas de axe, toques menores de 44 px,
   letras menores de 14 px, desbordes horizontales y errores de JavaScript. */
const path = require('path');
const BASE = process.env.BASE || 'http://localhost:8140';
const SALIDA = path.join(__dirname, 'resultados'); require('fs').mkdirSync(SALIDA, { recursive: true });
const { chromium } = require('playwright');
const fs=require('fs'); const axeSrc=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const [,,ANCHO,TEMA,LETRA]=process.argv; const W=+ANCHO;
const out={combo:`${W}-${TEMA}-${LETRA}`, pantallas:{} , errores:[]};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:W,height:800},reducedMotion:'reduce',bypassCSP:true});
  const p=await ctx.newPage(); p.on('pageerror',e=>out.errores.push(e.message)); p.on('console',m=>{if(m.type()==='error')out.errores.push('console: '+m.text())});
  const fijar=()=>p.evaluate(({t,l})=>{const h=document.documentElement;h.dataset.tema=t;h.dataset.letra=l;h.dataset.movimiento='reducido'},{t:TEMA,l:LETRA});
  const quitarConsejo=async()=>{const e=p.getByText('Entendido',{exact:true}); if(await e.count()&&await e.first().isVisible()){await e.first().click();await p.waitForTimeout(150);} };
  const revisar=async(nombre)=>{
    await fijar(); await p.waitForTimeout(250);
    await p.addScriptTag({content:axeSrc}).catch(()=>{});
    const r=await p.evaluate(async()=>{
      const raiz=document.getElementById('hoja')?.open?document.getElementById('hoja'):document;
      const ax=await axe.run(raiz===document?document:raiz,{runOnly:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']});
      const viol=ax.violations.map(v=>({id:v.id,impact:v.impact,tags:v.tags.filter(t=>/wcag|best/.test(t)).join(','),n:v.nodes.length,ej:v.nodes.slice(0,4).map(n=>n.target.join(' ')+' :: '+(n.failureSummary||'').split('\n').slice(1,2).join(' ').slice(0,160))}));
      const vw=document.documentElement.clientWidth;
      const ctl=[...(raiz===document?document.body:raiz).querySelectorAll('a[href],button,input,select,textarea,[role=button],[role=switch],[role=radio],[tabindex]:not([tabindex="-1"]),summary')].filter(e=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();return s.visibility!=='hidden'&&s.display!=='none'&&r.width>0&&r.height>0&&!e.closest('[inert],[aria-hidden="true"]')});
      const chicos=ctl.map(e=>{const r=e.getBoundingClientRect();const enTexto=e.tagName==='A'&&e.parentElement&&/^(P|LI|SPAN)$/.test(e.parentElement.tagName)&&getComputedStyle(e).display==='inline';return {t:(e.getAttribute('aria-label')||e.textContent||e.className||e.tagName).trim().replace(/\s+/g,' ').slice(0,40),w:Math.round(r.width),h:Math.round(r.height),en:enTexto,sel:e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:'')}}).filter(x=>!x.en&&(x.w<44||x.h<44));
      const letras=[];(raiz===document?document.body:raiz).querySelectorAll('*').forEach(e=>{if(!e.childNodes.length)return;const tx=[...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(' ');if(!tx)return;const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||e.closest('.vh'))return;const r=e.getBoundingClientRect();if(!r.width)return;const fs=parseFloat(s.fontSize);if(fs<14)letras.push({fs,t:tx.slice(0,40),c:e.className&&typeof e.className==='string'?e.className:e.tagName});});
      const corre=document.documentElement.scrollWidth>vw+1?document.documentElement.scrollWidth:0;
      const h1=document.querySelectorAll('main h1, header h1, h1').length;
      return {viol,chicos,letras:letras.slice(0,25),corre,h1,titulo:document.title};
    });
    out.pantallas[nombre]=r;
  };
  const ir=async h=>{await p.evaluate(h=>{location.hash='#'+h},h);await p.waitForTimeout(900);await quitarConsejo();};
  // Bienvenida (sin tienda)
  await p.goto(BASE+'/index.html#bienvenida'); await p.waitForTimeout(1000);
  for(const s of ['bienvenida','bienvenida-letra','bienvenida-como','bienvenida-camino']){await ir(s);await revisar(s);}
  await p.locator('[data-accion="demo"]').click(); await p.waitForTimeout(2300); await p.keyboard.press('Escape'); await p.waitForTimeout(300); await quitarConsejo();
  const ids=await p.evaluate(()=>{const c=[...Datos.clientes.values()];const m=[...Datos.movs.values()].find(x=>!x.anulado&&x.tipo==='fiado');return {c:c[0].id,c2:c.find(x=>x.cel)?.id||c[0].id,m:m.id,mc:m.clienteId}});
  for(const r of ['inicio','cobros','resumen','resumen-dia','resumen-todo','ajustes','mensajes','resumenes','cuadre','tienda','guia','restaurar','nuevo',`cliente-${ids.mc}`,`editar-${ids.mc}`,`mostrar-${ids.mc}`,`cuenta-${ids.mc}`,`corregir-${ids.m}`]) { await ir(r); await revisar(r.replace(/-[a-z0-9]{6,}$/i,'-X')); }
  // hojas
  const hoja=async(nombre,fn)=>{try{await fn();await p.waitForTimeout(600);await revisar('hoja:'+nombre);}catch(e){out.errores.push('hoja '+nombre+': '+e.message.slice(0,120))} await p.evaluate(()=>{const d=document.getElementById('hoja');if(d.open)d.close()});await p.waitForTimeout(300);};
  await ir('inicio'); await hoja('fiar',()=>p.locator('.nav .fiar').click());
  await ir('inicio'); await hoja('ayuda',()=>p.locator('[data-accion="ayuda"]').first().click());
  await ir(`cliente-${ids.mc}`); await hoja('pago',()=>p.locator('button:has-text("Pagó")').first().click());
  await ir(`cliente-${ids.mc}`); await hoja('detalle-mov',()=>p.locator('.mov, [data-mov]').first().click());
  await ir(`cliente-${ids.mc}`); await hoja('opciones',()=>p.locator('[aria-label*="opciones" i],[aria-label*="Más" i]').first().click());
  await ir('resumen'); await hoja('elegir-dias',()=>p.locator('[data-rango]').click());
  // vecino
  const enlace=await p.evaluate(id=>enlaceCuenta(cliente(id)),ids.mc);
  await p.goto(enlace); await p.waitForTimeout(1500); await revisar('vecino');
  await b.close(); fs.writeFileSync(path.join(SALIDA,`r-${out.combo}.json`),JSON.stringify(out,null,1)); console.log('ok',out.combo);
})().catch(e=>{console.log('FALLO',e.message);fs.writeFileSync(path.join(SALIDA,`r-${out.combo}.json`),JSON.stringify(out,null,1));process.exit(1)});
