/* Fiao · la versión de la app y la del service worker deben coincidir. Uso: node pruebas/version.js */
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(raiz, 'js/version.js'), 'utf8').match(/VERSION_APP = '([^']+)'/)[1];
const sw = fs.readFileSync(path.join(raiz, 'sw.js'), 'utf8').match(/const VERSION = 'fiao-v([^']+)'/)[1];
const readme = fs.readFileSync(path.join(raiz, 'README.md'), 'utf8').includes(`| ${app} |`);
console.log(`app ${app} · service worker ${sw} · README ${readme ? 'sí' : 'no'}`);
process.exit(app === sw && readme ? 0 : 1);
