import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { validarTienda } from '../backend/src/repositories/jsonStore.js';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sample = path.join(root, 'data', 'tienda.example.json');
const target = process.env.LINO_DATA_FILE || path.join(root, 'data', 'tienda.json');

try {
  await access(target);
  // No sobrescribir los pedidos ni el stock operativo existentes.
  validarTienda(JSON.parse(await readFile(target, 'utf8')));
  console.log('✓ Los datos locales ya existen y son JSON válido. No se sobrescribieron.');
} catch (error) {
  if (error.code !== 'ENOENT') {
    console.error('✗ El archivo existente es inválido o inaccesible. Recupera un respaldo antes de continuar.');
    process.exitCode = 1;
  } else {
    await mkdir(path.dirname(target), { recursive: true });
    const plantilla = await readFile(sample, 'utf8');
    validarTienda(JSON.parse(plantilla));
    await writeFile(target, plantilla, { flag: 'wx' });
    console.log(`✓ Datos ficticios creados: ${target}`);
  }
}
