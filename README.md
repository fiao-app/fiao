# Fiao

**El fiado de la tienda de barrio, claro para el tendero y para el vecino.**

Fiao es una aplicación web instalable (PWA) para anotar, mostrar y cobrar el fiado entre tenderos y vecinos de Barranquilla y Soledad. No es un cuaderno digital: es un acuerdo visible entre dos vecinos.

> **Versión de prueba, sin fines comerciales.** Fiao ayuda a llevar las cuentas, pero no es asesoría legal ni contable. Quien la use es responsable de los datos de sus clientes y de guardar sus copias de respaldo.

---

## Historial de versiones

Fiao sigue el versionado semántico (MAJOR.MINOR.PATCH): las versiones 0.x fueron de exploración; la 1.0.0 es la primera estable; una versión menor agrega funciones sin romper lo anterior, y un parche solo corrige.

| Versión | Fecha | Tipo | Qué cambió |
|---|---|---|---|
| 1.7.2 | 2026-11-12 | Parche | La zona flotante de abajo ya no deja tocar lo que queda escondido detrás |
| 1.7.1 | 2026-11-11 | Parche | Frase de voz al borrar varios clientes que deben |
| 1.7.0 | 2026-11-11 | Menor | Borrar varios clientes de una vez, con atajos y Deshacer |
| 1.6.1 | 2026-11-11 | Parche | El cliente nuevo se guarda junto con su primer fiado |
| 1.6.0 | 2026-11-11 | Menor | Revisión de dirección de arte: contraste, foco, textos, ícono «Mostrar», letra Más grande |
| 1.5.0 | 2026-11-11 | Menor | Paso opcional «¿Cómo le pueden pagar?» al crear la libreta |
| 1.4.3 | 2026-11-11 | Parche | Botones del historial sin recortes |
| 1.4.2 | 2026-11-11 | Parche | Interruptores de Ajustes en Tinta |
| 1.4.1 | 2026-11-11 | Parche | Ocho frases nuevas de voz |
| 1.4.0 | 2026-11-11 | Menor | Traer contactos, recibo como imagen y cuadre del día |
| 1.3.0 | 2026-11-10 | Menor | Límites de texto, voz a tiempo, WhatsApp directo en iPhone, ida y vuelta con el vecino |
| 1.2.1 | 2026-11-10 | Parche | Puente de copiar y pegar el aviso de pago en iPhone |
| 1.2.0 | 2026-11-10 | Menor | Borrar clientes, aviso de pago con enlace y búsqueda por celular |
| 1.1.0 | 2026-11-10 | Menor | Recordar en fila |
| 1.0.3 | 2026-11-10 | Parche | Cambiar la costumbre de pago mueve la fecha |
| 1.0.2 | 2026-11-10 | Parche | Íconos con centrado óptico y más peso en Tinta |
| 1.0.1 | 2026-11-10 | Parche | Cuatro frases nuevas de voz |
| 1.0.0 | 2026-11-10 | Estable | Confiabilidad: nunca finge que guardó, índice por cliente, prevención de errores, «Mostrar» |
| 0.5.1 | 2026-11-09 | Parche | Tinta sobre papel liso |
| 0.5.0 | 2026-11-09 | Menor | Apariencia Tinta y movimiento que explica |
| 0.4.0 | 2026-11-09 | Menor | Identidad del toldo, nuevas letras, menú flotante y voz de Fiao |
| 0.3.0 | 2026-11-09 | Menor | «Así funciona» con un sistema de ilustración y redacción revisada |
| 0.2.0 | 2026-11-09 | Menor | Anotar y Pagó en hojas, primer uso guiado y nuevo sistema visual |
| 0.1.0 | 2026-11-08 | Inicial | Producto mínimo viable: libreta, cuenta del vecino por enlace, cobros dentro de la ley, sin internet |

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

## Identidad visual (0.4.0)

- **El toldo como firma.** El ícono es una F cuyo brazo superior es el toldo rayado de la tienda de barrio, con la franja central en naranja. En la app, las cabeceras llevan las franjas del toldo y terminan en su borde ondulado.
- **Color con reglas (60-30-10).** Papel de cuaderno y blanco de fondo, cobalto (#3346E0) para la marca y la acción principal, y la moneda (#FF8A3D) como acento. Los colores de estado nunca se usan como marca: rojo ladrillo solo para «atrasado», verde solo para «pagó» y «al día».
- **Dos letras.** Plus Jakarta Sans para títulos y cifras, porque su 0 no se confunde con el 8; Figtree para leer.
- **Menú flotante.** Una píldora con íconos; la sección activa muestra su nombre. Con letra Grande o Más grande se ven todos los nombres. «Anotar fiado» flota encima, en color moneda.
- Cada cliente tiene un color propio en su avatar, calculado de su nombre.

## Apariencia «Tinta» y movimiento (0.5.0)

- **Tinta.** Una segunda apariencia, solo con azul de bolígrafo (#1D3BA8), negro y blanco, como la tinta sobre el cuaderno de la tienda. Es la de más contraste (texto de 9,4:1 a 18,9:1) y se lee mejor al sol. Como entre el azul y el negro solo hay 2:1, los estados no dependen del color: «atrasado» va relleno en negro, «paga hoy» con borde azul, y todo lleva su ícono. Se elige en Ajustes → Apariencia; si el celular tiene activado «más contraste», Fiao abre en Tinta hasta que el tendero elija otra cosa.
- **Movimiento que explica.** Cada animación cuenta algo: el nombre y el monto viajan de la lista a la ficha; al anotar, una moneda vuela del botón a la cifra de arriba y la cifra cuenta hasta el valor nuevo; al pagar, el saldo baja contando y, si queda al día, el visto se dibuja; la hoja se cierra arrastrándola hacia abajo; «Mitad» lleva la barra sola hasta la mitad; el aviso con «Deshacer» muestra cuánto tiempo queda; las ilustraciones de «Así funciona» se arman por partes.
- **Reglas del movimiento.** Solo se animan posición, tamaño y transparencia (lo más liviano para el celular); 120–200 ms al tocar y 220–320 ms entre pantallas; probado con el procesador 4 veces más lento. Ajustes → Movimiento: «Reducido» quita todas las animaciones; si el celular pide menos movimiento, Fiao arranca en Reducido.

## Confiabilidad (1.0.0 a 1.1.0)

Correcciones de la evaluación final (heurística, crítica de diseño, usabilidad y beta testing):

- **Nunca finge que guardó.** Si el celular no deja guardar (sin espacio, error del navegador), una banda fija lo dice y ofrece guardar una copia de inmediato.
- **Rápida con libretas grandes.** Un índice por cliente guarda las anotaciones y el saldo de cada uno: con 300 clientes y 30.000 anotaciones, la Libreta se dibuja en 46 ms con el procesador 4 veces más lento (antes, 1,2 s).
- **Previene errores comunes.** Avisa si ya hay un cliente con el mismo nombre (y deja anotarle al que ya existe) y si un monto es mucho más de lo normal, por un cero de más.
- **Mostrar la cuenta.** Un atajo en la ficha gira la pantalla hacia el vecino con su cuenta completa: lo que debe, la fecha acordada y lo último anotado.
- **Recordar en fila (1.1.0).** Cuando hay 2 o más clientes por recordar, Cobros ofrece «Recordar a los 3 de hoy»: Fiao abre WhatsApp con un cliente a la vez y el tendero envía allá. WhatsApp no permite que una app envíe por usted, así que cada chat se abre con un toque; la fila respeta la Ley 2300 (horario, permiso, una vez al día) y, si el celular cierra Fiao a mitad de camino, al volver quedan solo los que faltan.
- **Editar la costumbre de pago mueve la fecha (1.0.3).** Al cambiar «¿Cuándo suele pagar?», el formulario muestra el próximo pago y la ficha lo refleja; con «Otro día» se elige la fecha exacta.
- **«Al día» quiere decir sin atrasos**, como se dice en el barrio, aunque el cliente deba.
- **Dos ventanas sincronizadas.** Si Fiao está abierta en la app instalada y en el navegador, lo que se anota en una aparece en la otra.
- **iPhone:** si Fiao se abre en Safari sin instalar, una banda explica cómo agregarla a la pantalla de inicio, porque Safari puede borrar los datos de los sitios que no se abren en días.

## Borrar clientes, aviso de pago y búsqueda por celular (1.2.0)

- **Borrar un cliente.** Con la basurita de su ficha o deslizándolo a la izquierda en la Libreta. Deslizar solo muestra el botón; borrar siempre pregunta, y si el cliente debe, pregunta otra vez mostrando cuánto («No borrar» es la opción principal). Después quedan unos segundos para «Deshacer», que lo devuelve con todo su historial. «Nada se borra» sigue valiendo para las anotaciones: lo que se borra es el cliente entero, por ejemplo uno creado por error. El enlace que el vecino ya tiene no cambia, porque su cuenta viaja dentro del enlace.
- **Aviso de pago con enlace.** Cuando el vecino avisa «Ya pagué», su mensaje trae «Confirmar en Fiao»: el enlace abre la cuenta de ese cliente con el aviso arriba («Luz Marina dice que le pagó $15.000 por Nequi») y pide revisar en Nequi o en el banco que la plata llegó. «Ya llegó: anotar pago» abre Pagó con el monto y el medio puestos; Fiao nunca lo anota por su cuenta. Si ya hay un pago igual de los últimos días, lo advierte. En iPhone con Fiao en la pantalla de inicio, WhatsApp abre el enlace en Safari, y Safari no ve la libreta de la app instalada (Apple las separa a propósito y no deja que un enlace abra la app). Para eso hay un puente: en Safari, Fiao muestra el aviso con «Copiar aviso»; en la app, se pega en el buscador de la Libreta y abre esa cuenta con el aviso y el monto. Nunca ofrece empezar una libreta nueva ahí, para no partir la libreta en dos. En Android, el enlace abre directo la app instalada.
- **Buscar por nombre o celular.** Si se escriben números, la Libreta busca en los celulares (sin importar espacios ni el +57) y muestra el número con la parte encontrada resaltada.

## Textos que caben, voz a tiempo y la ida y vuelta con el vecino (1.3.0)

- **Límites al escribir.** Nombre del cliente: 24 letras. Algo para reconocerlo: 40. Lo que siempre lleva y «¿Qué se llevó?»: 80. «¿Quién lo llevó?»: 30. Nombre de la tienda: 30. Su nombre y quienes atienden: 24. Llave Bre-B: 60. Mis mensajes: 500. Cuando faltan 5 o menos, el campo dice cuántas quedan. Lo guardado antes no se corta.
- **Nada se sale de su caja.** Las palabras largas se parten dentro de su caja, la banda «Gire el celular hacia…» queda en 2 líneas, el nombre de la tienda pasa debajo de los botones si ocuparía más de 2 líneas, y los botones de Ajustes crecen con «Más grande». Las cifras grandes se achican solas, y solo cuando no caben: con letra Más grande, «Mostrar» cortaba $250.000.
- **Tope por anotación: $9.999.999,** en el teclado y en los campos de pesos (cuaderno, Corregir y el aviso «Ya pagué» del vecino).
- **La voz, a tiempo.** Una frase que no alcanzó a sonar en 1 segundo, o que quedó atrás porque Fiao se fue a WhatsApp o llegó otra acción, se descarta: nunca suena tarde. En iPhone, el audio que quedó «interrumpido» al volver de otra app se reanuda. Las frases cortas se precargan después del primer toque, el audio de la Ayuda se prepara al abrirla, y se salta el silencio con que empieza cada archivo. No cambió ninguna grabación.
- **WhatsApp en iPhone.** wa.me abría un navegador encima de Fiao que quedaba en blanco al volver. Ahora Fiao abre WhatsApp por su propia dirección; si a los 2,5 s no abrió, ofrece la página de WhatsApp o copiar el mensaje. En Android y en el computador sigue igual. Si el celular cierra Fiao mientras usted está en WhatsApp, al volver (antes de 10 minutos) abre la misma cuenta.
- **Recordatorios con enlace.** Los dos recordatorios traen la cuenta del vecino («Vea su cuenta y avísenos cuando pague»), y el {enlace} de Mis mensajes ahora también se llena en ellos.
- **«Necesito otro día» y «Algo no me cuadra».** En su cuenta, el vecino puede pedir otro día de pago o avisar que algo no le cuadra. A la tienda le llega por WhatsApp con un enlace que abre la ficha con una banda: «Aceptar el viernes 13» (y avisarle) o «Ver el historial». En iPhone funciona con el mismo puente de copiar y pegar del aviso de pago.

## Traer contactos, recibo como imagen y cuadre del día (1.4.0)

- **Traer de mis contactos.** En la Libreta. En Android abre el selector de contactos del celular y deja marcar varios. En iPhone (donde Safari no deja abrir los contactos) se usa el archivo que exporta la app Contactos: Listas → mantener presionada la lista → Exportar → Guardar en Archivos, y en Fiao «Elegir el archivo». Fiao muestra la lista con casillas, salta los que ya están (por celular o nombre), corta el nombre a 24 letras entre palabras y toma solo celulares colombianos. Entran sin deuda y sin permiso de mensajes. Hay «Deshacer». Fiao solo ve los contactos elegidos y nada sale del celular.
- **Recibo como imagen.** Junto a «Enviar recibo» sale «Como imagen», y cada línea del historial tiene «Imagen». Fiao dibuja una tarjeta de 1080 × 1350 con el toldo, el monto y lo que va debiendo, muestra la vista previa y la comparte con el menú del celular junto al mensaje con el enlace. El tendero elige el chat. Si WhatsApp deja la foto sin el texto, «Copiar el mensaje con el enlace» lo resuelve.
- **Voz.** Ocho frases nuevas con la voz de siempre (1.4.1): otra fecha, revisar la cuenta, nueva fecha, WhatsApp que no abrió, mensaje copiado, clientes traídos, recibo como imagen y cuadre.
- **Cuadre de hoy.** Desde Resumen: cuánto fió y cuánto cobró (en efectivo, por Nequi y por Bre-B), comparado con ayer y con el mismo día de la semana pasada; clientes nuevos, quienes quedaron al día y quién paga mañana. «Mandármelo por WhatsApp» lo envía al número de la tienda. Respeta «Ocultar montos».

## Cómo le pagan, desde el primer día (1.5.0)

- **Paso 3 de 3 al crear la libreta: «¿Cómo le pueden pagar?».** Después del nombre de la tienda y el suyo, Fiao pregunta la llave Bre-B y el Nequi o Daviplata. Es opcional y lo dice: también se puede poner después en Ajustes. En efectivo, en la tienda, siempre.
- Si el tendero llena algo, queda guardado y Fiao ya no se lo pregunta al mandar el primer recibo. Si lo deja vacío, todo sigue como antes: se lo pregunta en ese momento, en la hoja «¿Cómo le pueden pagar?».
- Lo escrito se conserva al ir atrás, y un Nequi incompleto no deja seguir sin avisar.

## Revisión de dirección de arte (1.6.0)

Una revisión independiente de las pantallas encontró detalles que se notan de cerca; todos se corrigieron:

- **Contraste.** La etiqueta de estado («Paga hoy») y «Atiende» sobre la cabecera cobalto ahora van sobre un fondo más oscuro (blanco encima 7,7:1; antes 4,3:1). «Marque el monto» ya no se ve apagado: es una instrucción y se lee completa.
- **Sin anillo negro al abrir hojas.** El foco va al título de la hoja (los lectores de pantalla lo anuncian) en vez de caer en la hoja o en la X.
- **Textos.** Ajustes dice la versión correcta; todos los celulares piden «10 números»; la página del vecino ya no dice «O en efectivo» cuando no hay otro medio, y «Ya pagué» solo ofrece Bre-B o Nequi si la tienda los dejó. «¿Cuándo suele pagar?» dice «Hoy en la tarde» para que no se confunda con «Mañana» (el día siguiente).
- **Ícono de «Mostrar».** Un celular que gira hacia el vecino; antes eran flechas que se leían como «recargar».
- **Inicio más liviano.** El aviso de la tienda de ejemplo cabe en un renglón, las tarjetas de hoy se ven completas en una fila (sin carrusel) y el consejo de deslizar para borrar pasó debajo de la lista: el primer cliente aparece sin bajar.
- **Letra «Más grande».** Cada cliente va en dos renglones (inicial y nombre arriba; estado y monto abajo) y los botones de la ficha en dos filas de tres, sin tocarse ni partir palabras.
- **Opciones que no saltan.** Al marcar una opción ya no cambia de ancho, así que la fila no se reacomoda bajo el dedo.
- **Mis mensajes.** Los datos se muestran en palabras («{día acordado}», «{cómo pagar}») y se agregan con un toque; el cuadro crece con el texto. Se siguen guardando con las mismas claves, así que los mensajes ya escritos funcionan igual.
- **iPhone.** El campo de fecha («¿Qué día acordaron?») ya no se sale del margen derecho.
- **1.6.1 · Cliente nuevo sin compromiso.** Al crear un cliente desde «Anotar fiado», se guarda junto con su primer fiado. Si el tendero cierra con la X o toca «Cambiar» antes de anotar, el cliente no queda en la libreta; y si anota y luego toca «Deshacer», se quitan el fiado y el cliente recién creado.

## Borrar varios clientes (1.7.0)

Para limpiar la libreta sin ir uno por uno:

- **Entrar:** «Seleccionar», junto al título «Clientes», o dejar el dedo medio segundo sobre un cliente (entra con ese ya marcado).
- **Marcar:** cada fila muestra una casilla; tocar marca o desmarca. Mientras tanto se ocultan «Anotar fiado» y el menú, y no se puede deslizar para no mezclar acciones.
- **Atajos:** «No deben nada» y «Sin movimientos hace 3 meses» marcan (o desmarcan) a todos los de ese grupo de un toque.
- **Borrar:** siempre pide confirmar, muestra a quiénes y avisa si alguno todavía debe y cuánto suman entre todos («Borrar aunque deben»).
- **Deshacer:** un solo toque devuelve a todos con su historial.
- **Voz (1.7.1):** si varios de los marcados deben, Fiao lo dice en voz alta («Algunos de estos clientes todavía le deben…»), con la misma voz y volumen de las demás frases.

## La zona flotante, a prueba de toques escondidos (1.7.2)

- Abajo, «Anotar fiado» y el menú flotan sobre un fondo de papel que tapa lo que pasa por detrás. Antes, ese fondo dejaba pasar los toques: tocarlo podía abrir un cliente que no se veía. Ahora el fondo recibe el toque y no pasa nada; para llegar a ese cliente basta con bajar la lista.
- Por lo mismo, la auditoría de accesibilidad (axe, WCAG 2.2 AA) ya no cuenta esas filas escondidas como botones tapados a medias: 168 revisiones (7 pantallas, 3 tamaños de letra, 2 apariencias y 4 tamaños de celular) sin avisos.
- Con el teclado, lo enfocado nunca queda detrás de la zona flotante: la página deja 11rem de margen abajo al desplazarse.
- No cambia nada de lo que se ve.

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
