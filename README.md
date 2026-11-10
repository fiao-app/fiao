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
| Registra un pago completo con un toque, o un abono deslizando una barra (o con el teclado) y eligiendo el día del resto en una tira de días. | Paga con Bre-B, Nequi o en efectivo, y avisa "ya pagué" con un toque. |
| Corrige o anula una anotación sin borrar nada: el cambio queda a la vista. | Ve las correcciones: nadie le cambia la cuenta en silencio. |
| Recibe recordatorios redactados con respeto, solo en el horario de la ley. | Solo recibe recordatorios si se atrasa o si los pidió. |
| Le muestra la cuenta al vecino en la pantalla, si está en el mostrador. | |

## Primer uso guiado

- Dos preguntas para empezar: el nombre de la tienda y el del tendero. Lo demás se pide justo cuando hace falta (el celular, el permiso y la forma de pago, al enviar el primer recibo).
- Antes, el tendero elige el tamaño de la letra viendo cómo se ve, y puede ver seis tarjetas de «Así funciona» o saltarlas. La última, «Así se mueve por Fiao», nombra cada ícono del menú.
- Una práctica guiada le señala dónde tocar para anotar su primer fiado de verdad. Con la tienda de ejemplo, un recorrido de cuatro pasos.
- "Primeros pasos" en la libreta, consejos de una línea la primera vez que abre cada sección y un botón de **Ayuda** en cada pantalla, con la opción de escucharla.
- **La voz de Fiao:** después de cada acción (anotar, pagar, corregir, un error al escribir, cada paso de la guía) una voz femenina, cálida y clara dice una frase corta. Son frases grabadas dentro de la app, así que suenan igual en todos los celulares. Las de todos los días se guardan al instalar; las demás, la primera vez que suenan (así la primera visita baja 2 MB menos). Si una frase aún no se ha guardado y no hay internet, la app sigue en silencio. Nunca dicen nombres ni montos en voz alta. Se apaga en Ajustes.
- Las razones y las leyes quedan detrás de un «¿Por qué?», no en la pantalla.

## Identidad visual (3.0)

- **El toldo como firma.** El ícono es una F cuyo brazo es el toldo rayado de la tienda de barrio; la moneda naranja es el fiado. En la app, las cabeceras llevan las franjas del toldo y terminan en su borde ondulado.
- **Color con reglas (60-30-10).** Papel de cuaderno y blanco de fondo, cobalto (#3346E0) para la marca y la acción principal, y la moneda (#FF8A3D) como acento. Los colores de estado nunca se usan como marca: rojo ladrillo solo para «atrasado», verde solo para «pagó» y «al día».
- **Dos letras.** Plus Jakarta Sans para títulos y cifras, porque su 0 no se confunde con el 8; Figtree para leer.
- **Menú flotante.** Una píldora con íconos; la sección activa muestra su nombre. Con letra Grande o Más grande se ven todos los nombres. «Anotar fiado» flota encima, en color moneda.
- Cada cliente tiene un color propio en su avatar, calculado de su nombre.

## Apariencia «Tinta» y movimiento (3.1)

- **Tinta.** Una segunda apariencia, solo con azul de bolígrafo (#1D3BA8), negro y blanco, como la tinta sobre el cuaderno de la tienda. Es la de más contraste (texto de 9,4:1 a 18,9:1) y se lee mejor al sol. Como entre el azul y el negro solo hay 2:1, los estados no dependen del color: «atrasado» va relleno en negro, «paga hoy» con borde azul, y todo lleva su ícono. Se elige en Ajustes → Apariencia; si el celular tiene activado «más contraste», Fiao abre en Tinta hasta que el tendero elija otra cosa.
- **Movimiento que explica.** Cada animación cuenta algo: el nombre y el monto viajan de la lista a la ficha; al anotar, una moneda vuela del botón a la cifra de arriba y la cifra cuenta hasta el valor nuevo; al pagar, el saldo baja contando y, si queda al día, el visto se dibuja; la hoja se cierra arrastrándola hacia abajo; «Mitad» lleva la barra sola hasta la mitad; el aviso con «Deshacer» muestra cuánto tiempo queda; las ilustraciones de «Así funciona» se arman por partes.
- **Reglas del movimiento.** Solo se animan posición, tamaño y transparencia (lo más liviano para el celular); 120–200 ms al tocar y 220–320 ms entre pantallas; probado con el procesador 4 veces más lento. Ajustes → Movimiento: «Reducido» quita todas las animaciones; si el celular pide menos movimiento, Fiao arranca en Reducido.

## Confiabilidad (3.2)

Correcciones de la evaluación final (heurística, crítica de diseño, usabilidad y beta testing):

- **Nunca finge que guardó.** Si el celular no deja guardar (sin espacio, error del navegador), una banda fija lo dice y ofrece guardar una copia de inmediato.
- **Rápida con libretas grandes.** Un índice por cliente guarda las anotaciones y el saldo de cada uno: con 300 clientes y 30.000 anotaciones, la Libreta se dibuja en 46 ms con el procesador 4 veces más lento (antes, 1,2 s).
- **Previene errores comunes.** Avisa si ya hay un cliente con el mismo nombre (y deja anotarle al que ya existe) y si un monto es mucho más de lo normal, por un cero de más.
- **Mostrar la cuenta.** Un atajo en la ficha gira la pantalla hacia el vecino con su cuenta completa: lo que debe, la fecha acordada y lo último anotado.
- **«Al día» quiere decir sin atrasos**, como se dice en el barrio, aunque el cliente deba.
- **Dos ventanas sincronizadas.** Si Fiao está abierta en la app instalada y en el navegador, lo que se anota en una aparece en la otra.
- **iPhone:** si Fiao se abre en Safari sin instalar, una banda explica cómo agregarla a la pantalla de inicio, porque Safari puede borrar los datos de los sitios que no se abren en días.

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

Pautas WCAG 2.2 nivel AA, auditadas con axe-core en 33 pantallas y hojas, en las dos apariencias:

- Texto de 18 px de base y tres tamaños de letra (Normal, Grande, Más grande). Apariencia «Tinta», de más contraste, que se activa sola si el celular la pide.
- Áreas táctiles de 48 px o más. La acción principal va abajo, al alcance del pulgar.
- Lo que se desliza también se hace con un toque (WCAG 2.5.7): la barra del pago se puede tocar en cualquier punto, tiene botones − y +, flechas del teclado y el teclado de números a un toque.
- Contraste del texto de 4,5:1 o más (la mayoría entre 5,4:1 y 15,5:1). Bordes de campos y opciones de 4,5:1.
- Nunca solo color: cada estado lleva palabra e ícono. Los días y meses van completos, sin abreviaturas.
- Las animaciones son cortas y se apagan en Ajustes → Movimiento, o solas si el celular tiene activado "reducir movimiento" (WCAG 2.3.3). Cerrar una hoja arrastrándola también se puede con su botón ✕ o con Atrás.
- Las letras van incluidas en el proyecto para que funcionen sin internet.
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
js/ui.js                Íconos, hojas, avisos con Deshacer, ayuda
js/movimiento.js        Animaciones: elemento compartido, moneda, hojas que se arrastran
js/guia.js              Guía del primer uso: práctica, recorrido y primeros pasos
js/voz.js               La voz de Fiao: qué frase suena en cada momento
js/ilustraciones.js     Ilustraciones del primer acceso, con un mismo sistema de composición
js/vistas-*.js          Las pantallas y las hojas (anotar, pagó, permiso)
js/app.js               Rutas y arranque
js/vecino.js            Pantalla del vecino
audio/                  Las frases grabadas de la voz de Fiao
sw.js                   Funciona sin internet (y avisa cuando hay una versión nueva)
manifest.webmanifest    Instalación como app
```

Hecho con HTML, CSS y JavaScript, sin frameworks ni paso de compilación.

El calendario de festivos se calcula según la ley vigente en noviembre de 2026. Si la ley cambia, hay que actualizar `js/calendario.js`.

## Derechos

© 2026 Los autores de Fiao. Todos los derechos reservados. El código se publica para consulta; no se autoriza copiarlo, modificarlo ni usarlo con fines comerciales sin permiso de sus autores.

Componentes de terceros, con sus propias licencias:

- Plus Jakarta Sans · The Plus Jakarta Sans Project Authors · SIL Open Font License 1.1 (`fonts/OFL-plus-jakarta-sans.txt`)
- Figtree · The Figtree Project Authors · SIL Open Font License 1.1 (`fonts/OFL-figtree.txt`)
- Voz de las frases grabadas: generada con ElevenLabs (voz «Diana») para este proyecto académico.
- lz-string 1.5.0 · Pieroxy · Licencia MIT (`vendor/lz-string.min.js`)

WhatsApp, Nequi, Daviplata y Bre-B son marcas de sus dueños. Fiao no está afiliada a ellas y solo las nombra para indicar medios de contacto y de pago.
