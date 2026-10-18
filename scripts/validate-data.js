import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validarTienda } from '../backend/src/repositories/jsonStore.js';
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ruta = process.env.LINO_DATA_FILE || path.join(dir, 'data', 'tienda.json');
try {
  validarTienda(JSON.parse(await readFile(ruta, 'utf8')));
  console.log('✓ Estructura y reglas básicas del archivo JSON correctas.');
} catch (err) {
  console.error(`✗ Error: ${err.message}`);
  process.exitCode = 1;
}
