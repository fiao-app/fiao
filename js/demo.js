/* Fiao · datos de ejemplo "Donde Álvaro" para mostrar la app llena.
   Las fechas se calculan desde hoy, así los estados siempre tienen sentido.
   Todo es ficticio: solo nombres de pila o apodos, celulares no válidos (empiezan por 0)
   y la tienda no tiene llave Bre-B ni Nequi, para que nadie pague ni escriba a un desconocido. */
'use strict';

function crearLibretaDeEjemplo() {
  const hoy = new Date();
  const en = (dias, h = 9, m = 0) => { const d = sumarDias(hoy, dias); d.setHours(h, m, 0, 0); return d.toISOString(); };
  const clientes = [], movimientos = [], contactos = [];
  let n = 0;
  const id = p => `${p}${(++n).toString(36)}demo`;
  const cli = (o) => {
    const c = { id: id('c'), cel: '', cupo: 50000, pago: 'quincena', recibos: 'whatsapp', recordar: 'atraso', permiso: { estado: 'si', fecha: en(-30) }, lista: null, detalle: '', proximaFecha: null, creado: en(-40), ...o };
    clientes.push(c); return c;
  };
  const mv = (c, tipo, monto, fecha, o = {}) => { const m = { id: id('m'), clienteId: c.id, tipo, monto, que: '', llevo: '', atendio: 'Álvaro', fecha, correcciones: [], anulado: null, ...o }; movimientos.push(m); return m; };
  const quincena = d => isoDia(fechaPorPreferencia('quincena', d));

  // Keyla: vende sopa; fía la lista temprano y paga en la tarde. Siempre cumple.
  const keyla = cli({ nombre: 'Keyla', detalle: 'Vende sopa', cel: '0000000003', cupo: 80000, pago: 'tarde', recordar: 'nunca', lista: { nombre: 'La lista de la sopa', productos: 'ñame, yuca, plátano, costilla, cebolla, cilantro y cubitos' }, proximaFecha: isoDia(hoy) });
  for (let k = 21; k >= 2; k--) {
    const monto = 54000 + ((k * 1700) % 9000);
    mv(keyla, 'fiado', monto, en(-k, 6, 5), { que: 'Lista de la sopa', llevo: k % 3 ? '' : 'su hija' });
    const tarde = k === 15 || k === 8;
    mv(keyla, 'pago', monto, tarde ? en(-k + 1, 16, 10) : en(-k, 15, 40), { medio: k % 2 ? 'nequi' : 'efectivo', aTiempo: !tarde });
  }
  mv(keyla, 'fiado', 58000, en(-1, 6, 5), { que: 'Lista de la sopa', correcciones: [{ de: 85000, a: 58000, motivo: 'Me equivoqué en el monto', fecha: en(-1, 6, 30) }] });
  mv(keyla, 'pago', 58000, en(-1, 15, 40), { medio: 'nequi', aTiempo: true });
  mv(keyla, 'fiado', 62800, en(0, 6, 10), { que: 'Lista de la sopa', llevo: 'su hija', atendio: 'Doña Rosa' });

  // Luz Marina: paga en la quincena; quiere su recibo de cada cosa.
  const luz = cli({ nombre: 'Luz Marina', cel: '0000000004', lista: { nombre: 'Lo de siempre', productos: 'pan, leche y huevos' }, proximaFecha: quincena(hoy) });
  mv(luz, 'saldo', 38800, en(-21, 8), { que: 'Lo que venía del cuaderno' });
  mv(luz, 'fiado', 11200, en(-4, 7, 30), { que: 'Lo de siempre' });
  mv(luz, 'pago', 20000, en(-2, 18, 0), { medio: 'efectivo', aTiempo: true });
  mv(luz, 'fiado', 12000, en(-1, 17, 20), { que: 'arroz y aceite' });

  // Yesid: se atrasó cinco días.
  const yesid = cli({ nombre: 'Yesid', cel: '0000000011', pago: 'otro', proximaFecha: isoDia(sumarDias(hoy, -5)) });
  mv(yesid, 'fiado', 20000, en(-12, 19, 0), { que: 'gaseosa y pan' });
  mv(yesid, 'fiado', 14000, en(-9, 12, 30), { que: 'almuerzo' });

  // Andrés: pidió que le recordaran el día de pago.
  const andres = cli({ nombre: 'Andrés Felipe', cel: '0000000012', cupo: 30000, pago: 'otro', recordar: 'dia', proximaFecha: isoDia(hoy) });
  mv(andres, 'fiado', 25000, en(-6, 20, 10), { que: 'recarga y mecato' });
  contactos.push({ id: id('r'), clienteId: andres.id, tipo: 'recordatorio', movId: null, fecha: en(0, 10, 15) });

  // Édgar: celador; fían su esposa y sus hijos a su nombre. Resumen semanal.
  const edgar = cli({ nombre: 'Don Édgar', detalle: 'Celador · fían su esposa y sus hijos', cel: '0000000001', cupo: 120000, recibos: 'semanal', proximaFecha: quincena(hoy) });
  mv(edgar, 'fiado', 46000, en(-11, 18), { que: 'mercado de la semana', llevo: 'su esposa' });
  mv(edgar, 'fiado', 22400, en(-6, 7, 40), { que: 'leche, pan y huevos', llevo: 'su hijo Daniel' });
  mv(edgar, 'fiado', 31000, en(-3, 19, 15), { que: 'arroz, aceite y pollo', llevo: 'su esposa' });
  mv(edgar, 'fiado', 19000, en(-1, 8, 5), { que: 'útiles', llevo: 'su hija' });
  contactos.push({ id: id('r'), clienteId: edgar.id, tipo: 'resumen', movId: null, fecha: en(-8, 18) });

  // Doña Nubia: no debe nada; prefiere que le muestren la cuenta en la tienda.
  const nubia = cli({ nombre: 'Doña Nubia, la de la casa azul', cel: '', pago: 'viernes', recibos: 'mostrar', recordar: 'nunca', permiso: { estado: 'ninguno', fecha: null } });
  mv(nubia, 'fiado', 15000, en(-10, 9), { que: 'café y azúcar' });
  mv(nubia, 'pago', 15000, en(-7, 10), { medio: 'efectivo', aTiempo: true });

  // Martha: debe poco, pero no viene hace tres semanas.
  const martha = cli({ nombre: 'Martha Cecilia', cel: '0000000008', cupo: 40000, proximaFecha: quincena(sumarDias(hoy, 3)) });
  mv(martha, 'fiado', 15000, en(-23, 16), { que: 'aceite y panela' });

  const jhon = cli({ nombre: 'Jhon Jairo', cel: '0000000006', cupo: 60000, pago: 'viernes', proximaFecha: isoDia(fechaPorPreferencia('viernes', sumarDias(hoy, 1))) });
  mv(jhon, 'fiado', 12500, en(-3, 21), { que: 'gaseosa y papitas' });
  mv(jhon, 'fiado', 15000, en(-1, 20, 30), { que: 'recarga' });

  // Rosiris: recién pasada del cuaderno; aún no responde el permiso.
  const rosiris = cli({ nombre: 'Rosiris, la de la esquina', cel: '0000000002', permiso: { estado: 'pedido', fecha: en(-1, 9) }, proximaFecha: quincena(hoy) });
  mv(rosiris, 'saldo', 23000, en(-1, 9), { que: 'Lo que venía del cuaderno' });

  const lucho = cli({ nombre: 'Lucho', cel: '0000000005', pago: 'viernes' });
  mv(lucho, 'fiado', 9000, en(-9, 18), { que: 'cervezas' });
  mv(lucho, 'pago', 9000, en(-6, 19), { medio: 'breb', aTiempo: true });

  const lucia = cli({ nombre: 'Lucía, la de las arepas', cel: '0000000009', pago: 'viernes', proximaFecha: isoDia(fechaPorPreferencia('viernes', sumarDias(hoy, 1))) });
  mv(lucia, 'fiado', 18000, en(-2, 5, 50), { que: 'harina y queso' });

  const carlos = cli({ nombre: 'Carlos, el mototaxista', cel: '0000000013', cupo: 30000, pago: 'manana', proximaFecha: isoDia(hoy) });
  mv(carlos, 'fiado', 9500, en(-1, 13), { que: 'almuerzo' });

  const ramiro = cli({ nombre: 'Profe Ramiro', cel: '0000000007', pago: 'quincena', recibos: 'mostrar' });
  mv(ramiro, 'fiado', 21000, en(-16, 17), { que: 'mercado' });
  mv(ramiro, 'pago', 21000, en(-13, 12), { medio: 'breb', aTiempo: true });

  const yurleidis = cli({ nombre: 'Yurleidis, la peluquera', cel: '0000000010', proximaFecha: quincena(hoy) });
  mv(yurleidis, 'fiado', 31000, en(-4, 11), { que: 'champú y gaseosas' });

  const t = {
    id: 'tienda', nombre: 'Donde Álvaro', llave: '', nequi: '', whatsapp: '',
    atienden: ['Álvaro', 'Doña Rosa'], atiendeAhora: 'Álvaro', tono: 'cercano', letra: 'normal', ocultarAlAbrir: false,
    mensajes: {}, ultimaCopia: en(-3, 19, 2), creada: en(-40), demo: true
  };
  return { tienda: t, clientes, movimientos, contactos };
}
