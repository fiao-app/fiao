# Pruebas de Fiao

Pruebas automáticas que se corren antes de publicar cada versión.

| Archivo | Qué revisa |
|---|---|
| `version.js` | Que la versión de la app (`js/version.js`), la del service worker y el README coincidan |
| `funcionamiento.js` | 40 casos del Resumen por periodos: rutas, enlaces viejos, rango de fechas, calendario, teclado y ocultar montos |
| `correcciones.js` | Fechas de Colombia en las cifras de hoy, versión visible, filtros accesibles, guía modal, anillo de foco y área de toque |
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
