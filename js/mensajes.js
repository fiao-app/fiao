/* Fiao · mensajes que el tendero envía desde su propio WhatsApp.
   Tres tonos por registro (no por región). El tendero puede escribir los suyos.
   El recibo confirma lo anotado y no cobra; el recordatorio sí es cobranza
   y por eso solo se ofrece en el horario de la Ley 2300. */
'use strict';

const TONOS = { cercano: 'Cercano y respetuoso (recomendado)', formal: 'Formal', breve: 'Breve y directo' };
const TIPOS_MENSAJE = {
  fiado: 'Recibo de un fiado',
  pago: 'Comprobante de pago',
  recordatorioAtraso: 'Recordatorio cuando se atrasa',
  recordatorioDia: 'Recordatorio el día de pago',
  permiso: 'Pedir permiso',
  correccion: 'Aviso de corrección',
  resumen: 'Resumen semanal'
};
const PLANTILLAS = {
  cercano: {
    fiado: 'Hola, {nombre}. Le anotamos {monto} hoy, {fecha}{que}. Su cuenta va en {saldo}. Vea el detalle aquí: {enlace}',
    pago: 'Hola, {nombre}. Recibimos su {abono} de {monto} hoy, {fecha}, {medio}. {queda} ¡Gracias! Vea el detalle aquí: {enlace}',
    recordatorioAtraso: 'Hola, {nombre}. Le escribimos de {tienda}. Quedamos en cuadrar la cuenta el {fechaAcordada} y van {saldo}. Si necesita otro día, nos avisa sin problema.{pagar} Vea su cuenta y avísenos cuando pague: {enlace}',
    recordatorioDia: 'Hola, {nombre}. Le escribimos de {tienda} para recordarle, como nos pidió, que hoy es el día acordado para cuadrar la cuenta: {saldo}. Si necesita otro día, nos avisa sin problema.{pagar} Vea su cuenta y avísenos cuando pague: {enlace}',
    permiso: 'Hola, {nombre}. Le escribe {quien}, de {laTienda}. Para llevar claras sus cuentas, ¿le puedo enviar por aquí el recibo de lo que fía? Responda SÍ si está de acuerdo. Su número solo lo uso para esto, y si un día no quiere, me dice y dejo de enviarle.',
    correccion: 'Hola, {nombre}. Corregimos su cuenta: en lo del {fechaMov} {cambio}. Ahora va en {saldo}. Disculpe la molestia. Vea el detalle aquí: {enlace}',
    resumen: 'Hola, {nombre}. Este es el resumen de su cuenta en {tienda}: {semana}. Va en {saldo}. Vea el detalle aquí: {enlace}'
  },
  formal: {
    fiado: '{saludo}, {nombre}. Le informamos que hoy, {fecha}, se registró a su cuenta un valor de {monto}{que}. Su saldo es de {saldo}. Puede consultar el detalle aquí: {enlace}',
    pago: '{saludo}, {nombre}. Confirmamos su {abono} de {monto} recibido hoy, {fecha}, {medio}. {queda} Muchas gracias. Detalle: {enlace}',
    recordatorioAtraso: '{saludo}, {nombre}. Le escribimos de {tienda}. Le recordamos que el pago acordado para el {fechaAcordada} está pendiente, por un valor de {saldo}. Si requiere otra fecha, con gusto la acordamos.{pagar} Puede ver su cuenta y avisarnos su pago aquí: {enlace}',
    recordatorioDia: '{saludo}, {nombre}. Le escribimos de {tienda}, como nos solicitó, para recordarle que hoy es la fecha acordada para el pago de {saldo}. Si requiere otra fecha, con gusto la acordamos.{pagar} Puede ver su cuenta y avisarnos su pago aquí: {enlace}',
    permiso: '{saludo}, {nombre}. Le escribe {quien}, de {laTienda}. ¿Nos autoriza a enviarle por este medio los recibos de sus compras a crédito? Si está de acuerdo, por favor responda SÍ. Su número solo se usará para este fin y puede retirar la autorización cuando lo desee.',
    correccion: '{saludo}, {nombre}. Le informamos una corrección en su cuenta: en el registro del {fechaMov} {cambio}. Su saldo actual es de {saldo}. Ofrecemos disculpas. Detalle: {enlace}',
    resumen: '{saludo}, {nombre}. Le compartimos el resumen de su cuenta en {tienda}: {semana}. Saldo actual: {saldo}. Detalle: {enlace}'
  },
  breve: {
    fiado: '{tienda}: anotado {monto}{que}. Su cuenta: {saldo}. Detalle: {enlace}',
    pago: '{tienda}: recibido {monto} {medio}. {queda} Detalle: {enlace}',
    recordatorioAtraso: '{tienda}: la cuenta quedó para el {fechaAcordada} y van {saldo}. ¿Cuándo nos cuadra?{pagar} Su cuenta: {enlace}',
    recordatorioDia: '{tienda}: hoy es el día acordado. Van {saldo}.{pagar} Su cuenta: {enlace}',
    permiso: 'Hola, {nombre}. Soy {quien}, de {tienda}. ¿Le puedo enviar por aquí los recibos de lo que fía? Responda SÍ. Solo uso su número para esto.',
    correccion: '{tienda}: corregimos lo del {fechaMov}. {Cambio}. Su cuenta: {saldo}. Detalle: {enlace}',
    resumen: '{tienda}: resumen de su cuenta: {semana}. Va en {saldo}. Detalle: {enlace}'
  }
};

function _saludo(d = new Date()) { const h = d.getHours(); return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'; }
function _comoPagar() {
  const t = tienda(); const p = [];
  if (t.llave) p.push(`con Bre-B a ${t.llave}`);
  if (t.nequi) p.push(`por Nequi al ${celLegible(t.nequi)}`);
  p.push('aquí en la tienda');
  return ' Puede pagar ' + (p.length > 1 ? p.slice(0, -1).join(', ') + ' o ' + p[p.length - 1] : p[0]) + '.';
}
/** Plantilla vigente: la del tendero si la escribió, si no la del tono elegido. */
function plantilla(clave) {
  const t = tienda();
  return (t.mensajes && t.mensajes[clave]) || PLANTILLAS[t.tono || 'cercano'][clave];
}
function _llenar(texto, v) {
  // Tras llenar: sin espacios antes de coma o punto, sin ", ." cuando un dato viene vacío,
  // y un solo punto donde una abreviatura ya traía el suyo (sin tocar los puntos suspensivos).
  return texto.replace(/\{(\w+)\}/g, (m, k) => (v[k] ?? m))
    .replace(/[ \t]+([,.])/g, '$1').replace(/,\./g, '.').replace(/(?<!\.)\.\.(?!\.)/g, '.').replace(/ {2,}/g, ' ').trim();
}

function _base(c) {
  const t = tienda();
  const nt = t.nombre || '';
  return { nombre: nombreCorto(c.nombre), tienda: nt || 'la tienda', laTienda: !nt ? 'la tienda' : /^tienda\b/i.test(nt) ? nt : `la tienda ${nt}`, saludo: _saludo(), quien: t.atiendeAhora || (t.atienden || [])[0] || '', pagar: _comoPagar() };
}

function mensajeFiado(c, m) {
  return _llenar(plantilla('fiado'), { ..._base(c), monto: pesos(m.monto), fecha: fechaLarga(new Date(m.fecha)), que: m.que ? ` (${m.que})` : '', saldo: pesos(saldoDe(c.id)), enlace: enlaceCuenta(c) });
}
function mensajePago(c, m) {
  const s = saldoDe(c.id);
  return _llenar(plantilla('pago'), {
    ..._base(c), monto: pesos(m.monto), fecha: fechaLarga(new Date(m.fecha)), medio: MEDIOS[m.medio] || '',
    abono: s > 0 ? 'abono' : 'pago', queda: s > 0 ? `Queda debiendo ${pesos(s)}.` : 'Su cuenta quedó al día.', saldo: pesos(s), enlace: enlaceCuenta(c)
  });
}
function mensajeRecordatorio(c, e) {
  const clave = e.tipo === 'atrasado' ? 'recordatorioAtraso' : 'recordatorioDia';
  return _llenar(plantilla(clave), { ..._base(c), saldo: pesos(e.saldo), fechaAcordada: e.fecha ? fechaLarga(e.fecha) : '', enlace: enlaceCuenta(c) });
}
/** 3.4 · Respuesta cuando el tendero acepta el día que pidió el vecino. */
function mensajeFechaAceptada(c, iso) {
  const b = _base(c), f = fechaLarga(diaDe(iso)), enlace = enlaceCuenta(c), tono = tienda().tono || 'cercano';
  if (tono === 'formal') return `${b.saludo}, ${b.nombre}. Confirmamos la nueva fecha de pago: el ${f}. Puede ver su cuenta aquí: ${enlace}`;
  if (tono === 'breve') return `${b.tienda}: listo, quedó para el ${f}. Su cuenta: ${enlace}`;
  return `Hola, ${b.nombre}. Listo, quedó para el ${f}. Gracias por avisar. Vea su cuenta aquí: ${enlace}`;
}
function mensajePermiso(c) { return _llenar(plantilla('permiso'), _base(c)); }
function mensajeCorreccion(c, m, anulada) {
  const ult = (m.correcciones || []).slice(-1)[0];
  const cambio = anulada ? `anulamos la anotación de ${pesos(m.monto)}` : `decía ${pesos(ult.de)} y quedó en ${pesos(ult.a)}`;
  return _llenar(plantilla('correccion'), { ..._base(c), fechaMov: fechaLarga(new Date(m.fecha)), cambio, Cambio: mayuscula(cambio), saldo: pesos(saldoDe(c.id)), enlace: enlaceCuenta(c) });
}
function mensajeResumen(c, nuevos) {
  const f = nuevos.filter(m => m.tipo === 'fiado' && !m.anulado), p = nuevos.filter(m => m.tipo === 'pago' && !m.anulado);
  const partes = [];
  if (f.length) partes.push(`${f.length} ${f.length === 1 ? 'anotación' : 'anotaciones'} por ${pesos(f.reduce((s, m) => s + m.monto, 0))}`);
  if (p.length) partes.push(`${p.length} ${p.length === 1 ? 'pago' : 'pagos'} por ${pesos(p.reduce((s, m) => s + m.monto, 0))}`);
  return _llenar(plantilla('resumen'), { ..._base(c), semana: partes.join(' y ') || 'sin movimientos nuevos', saldo: pesos(saldoDe(c.id)), enlace: enlaceCuenta(c) });
}
