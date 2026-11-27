# Pruebas de Fiao

Pruebas automáticas que se corren antes de publicar cada versión.

| Archivo | Qué revisa |
|---|---|
| `version.js` | Que la versión de la app (`js/version.js`), la del service worker y el README coincidan |
| `funcionamiento.js` | 40 casos del Resumen por periodos: rutas, enlaces viejos, rango de fechas, calendario, teclado y ocultar montos |
| `correcciones.js` | Fechas de Colombia en las cifras de hoy, versión visible, filtros accesibles, guía modal, anillo de foco y área de toque |
| `correcciones-231.js` | Avisos legibles en Color, Oscuro y Tinta; «En la calle» fija al cambiar de periodo; Ocultar montos al instante; versión en la bienvenida; «Todo guardado»; exportar a Excel |
| `recibo-imagen.js` | «Enviar recibo» y «Como imagen» siguen el mismo camino: celular, permiso y después WhatsApp o la imagen |
| `asistente.js` | «Dígale a Fiao»: 70 frases → órdenes, varias órdenes en una frase, a medias, perfil, saludo, sugerencias, freno, fecha sugerida, contexto, fechas, confirmar y corregir hablando, lotes, precios y apodos aprendidos, apagado de fábrica, interruptores de Ajustes, mantener presionado «Fiar», voz simulada, sin voz (escribir), confirmar antes de guardar, deshacer, preguntas |
| `primeros-pasos.js` | Enviar el recibo por WhatsApp marca «Mostrar o enviar un recibo» en Primeros pasos |
| `accesibilidad.js` | axe (WCAG 2.2 AA y buenas prácticas) en 29 vistas, toques menores de 44 px, letra menor de 14 px, desbordes y errores de JavaScript |

## Cómo correrlas

```bash
cd pruebas
npm install
npx playwright install chromium
npm run servir          # en otra terminal: sirve la app en http://localhost:8140
npm run version
npm run funcionamiento
npm run accesibilidad   # resultados en pruebas/resultados/
```

Además, cada parche se revisa con capturas de antes y después en Color y Tinta, letra Normal y Más grande: lo que no se pidió cambiar debe quedar idéntico píxel a píxel.
