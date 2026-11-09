# Fiao

**El fiado de la tienda de barrio, claro para el tendero y para el vecino.**

Fiao es una aplicación web instalable (PWA) para anotar, mostrar y cobrar el fiado entre tenderos y vecinos de Barranquilla y Soledad. No es un cuaderno digital: es un acuerdo visible entre dos vecinos.

> **Versión de prueba, sin fines comerciales.** Fiao ayuda a llevar las cuentas, pero no es asesoría legal ni contable. Quien la use es responsable de los datos de sus clientes y de guardar sus copias de respaldo.

---

## Qué hace

| Para el tendero | Para el vecino |
|---|---|
| Anota un fiado en tres toques, sin salir de la libreta: elige al cliente, marca el monto y listo. Se puede deshacer en los segundos siguientes. | Recibe su recibo por WhatsApp, sin instalar nada. |
| Ve lo que tiene "en la calle", quién está atrasado y quién paga hoy. | Abre un enlace con su cuenta: cada fiado, cada pago y el saldo anterior. |
| Registra un pago completo con un toque, o un abono de cualquier monto con nueva fecha. | Paga con Bre-B, Nequi o en efectivo, y avisa "ya pagué" con un toque. |
| Corrige o anula una anotación sin borrar nada: el cambio queda a la vista. | Ve las correcciones: nadie le cambia la cuenta en silencio. |
| Recibe recordatorios redactados con respeto, solo en el horario de la ley. | Solo recibe recordatorios si se atrasa o si los pidió. |
| Le muestra la cuenta al vecino en la pantalla, si está en el mostrador. | |

## Primer uso guiado

- Dos preguntas para empezar: el nombre de la tienda y el del tendero. Lo demás se pide justo cuando hace falta (el celular, el permiso y la forma de pago, al enviar el primer recibo).
- Antes, el tendero elige el tamaño de la letra viendo cómo se ve, y puede ver tres tarjetas de "así funciona" o saltarlas.
- Una práctica guiada le señala dónde tocar para anotar su primer fiado de verdad. Con la tienda de ejemplo, un recorrido de cuatro pasos.
- "Primeros pasos" en la libreta, consejos de una línea la primera vez que abre cada sección y un botón **Ayuda** en cada pantalla, con la opción de escucharla en voz alta.
- Las razones y las leyes quedan detrás de un "¿Por qué?", no en la pantalla.

## Decisiones que sostienen la confianza

- **Los datos viven en el celular.** La libreta se guarda en el navegador (IndexedDB). No hay servidor, cuentas, contraseñas, cookies ni herramientas de medición.
- **La cuenta del vecino viaja en el enlace.** Va después del `#`, y el navegador nunca envía esa parte al servidor. Es una foto de la cuenta con fecha y hora, no una cuenta en vivo.
- **Copia de respaldo = archivo.** Un archivo `.fiao` que el tendero guarda en su propio WhatsApp o en Drive, y que recupera desde Bienvenida o Ajustes.
- **Recibo ≠ recordatorio.** El recibo confirma lo anotado. El recordatorio es cobranza: Fiao solo lo ofrece en el horario de la **Ley 2300 de 2023** (lunes a viernes de 7 a. m. a 7 p. m., sábados de 8 a. m. a 3 p. m., nunca domingos ni festivos), una vez al día y por un solo canal.
- **Permiso primero (Ley 1581 de 2012).** Antes de enviar mensajes, el vecino responde SÍ y se guarda la fecha. Sin permiso, la cuenta se le muestra en la tienda.
- **Fiao no toca el dinero.** El vecino le paga directo al tendero; Fiao solo deja constancia.
- **Fiao no envía nada solo.** Abre WhatsApp con el mensaje escrito y el tendero toca Enviar.

## Seguridad y privacidad

- Todo lo que escribe el usuario se muestra como texto, nunca como código. Las páginas tienen una política de seguridad de contenido que solo permite los archivos propios de la app.
- La página del vecino no consulta nada en internet, no guarda nada y no se indexa en buscadores.
- **Advertencia para el vecino:** un enlace de cuenta lo puede fabricar cualquiera. Por eso la página le pide confirmar que la llave o el número de pago son los que le dio su tienda en persona.
- **iPhone:** Safari puede borrar los datos de páginas que no están instaladas tras unos días sin uso. Instale Fiao en la pantalla de inicio y guarde copias de respaldo.
- Quien tenga el celular del tendero en la mano puede ver la libreta: use el bloqueo de pantalla del celular.

## Accesibilidad

Pautas WCAG 2.2 nivel AA, auditadas con axe-core en 29 pantallas y hojas:

- Texto de 18 px de base y tres tamaños de letra (Normal, Grande, Más grande). Modo "Más contraste".
- Áreas táctiles de 48 px o más. La acción principal mide 60 px y va abajo, al alcance del pulgar.
- Contraste del texto entre 6:1 y 15,9:1. Bordes de campos y opciones de 5,6:1.
- Nunca solo color: cada estado lleva palabra e ícono. Los días y meses van completos, sin abreviaturas.
- Las animaciones son cortas y se apagan si el celular tiene activado "reducir movimiento". El botón Atrás del celular cierra las hojas.
- Tipografía Atkinson Hyperlegible Next (Braille Institute), incluida en el proyecto para que funcione sin internet.
- Botón para ocultar los montos cuando hay gente en el mostrador.

## Cómo probarla

Abra la app, toque **Empezar** y, en "¿Cómo quiere empezar?", elija **Ver un ejemplo**. Todo en ese ejemplo es ficticio:

- Los clientes solo tienen nombre de pila o apodo.
- Los celulares empiezan por 0, así que no corresponden a nadie, y WhatsApp le deja elegir a quién enviar.
- La tienda no tiene llave Bre-B ni Nequi.

Para empezar con su propia tienda, toque **Usar la mía** en la libreta.

En el computador:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicación en GitHub Pages

En el repositorio, vaya a **Settings → Pages** y elija **Deploy from a branch**, la rama **main** y la carpeta **/ (root)**. Toque **Save**. En el celular, abra la dirección en Chrome y toque **Instalar**; en iPhone, use Safari: **Compartir → Agregar a inicio**.

## Estructura

```
index.html              App del tendero
c/index.html            Página del vecino (lee la cuenta del enlace)
css/fiao.css            Sistema de diseño (colores, tipografía, componentes)
js/util.js              Formatos colombianos: $50.500, viernes 13 de noviembre, 4:10 p. m.
js/calendario.js        Festivos de Colombia (Ley 51 de 1983) y reglas de la Ley 2300
js/db.js                Guardado local (IndexedDB)
js/modelo.js            Saldos, fechas, estados, cupos, correcciones
js/mensajes.js          Mensajes de WhatsApp en tres tonos, editables
js/demo.js              Tienda de ejemplo, ficticia
js/ui.js                Íconos, hojas, avisos con Deshacer, ayuda, animaciones
js/guia.js              Guía del primer uso: práctica, recorrido y primeros pasos
js/vistas-*.js          Las pantallas y las hojas (anotar, pagó, permiso)
js/app.js               Rutas y arranque
js/vecino.js            Pantalla del vecino
sw.js                   Funciona sin internet
manifest.webmanifest    Instalación como app
```

Hecho con HTML, CSS y JavaScript, sin frameworks ni paso de compilación.

El calendario de festivos se calcula según la ley vigente en noviembre de 2026. Si la ley cambia, hay que actualizar `js/calendario.js`.

## Derechos

© 2026 Los autores de Fiao. Todos los derechos reservados. El código se publica para consulta; no se autoriza copiarlo, modificarlo ni usarlo con fines comerciales sin permiso de sus autores.

Componentes de terceros, con sus propias licencias:

- Atkinson Hyperlegible Next · Braille Institute of America · SIL Open Font License 1.1 (`fonts/OFL.txt`)
- lz-string 1.5.0 · Pieroxy · Licencia MIT (`vendor/lz-string.min.js`)

WhatsApp, Nequi, Daviplata y Bre-B son marcas de sus dueños. Fiao no está afiliada a ellas y solo las nombra para indicar medios de contacto y de pago.
