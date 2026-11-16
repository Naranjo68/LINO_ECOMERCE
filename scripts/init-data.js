/**
 * Inicializa data/tienda.json si falta y agrega productos nuevos del catálogo
 * a una tienda existente, SIN sobrescribir pedidos, stock o productos previos.
 * Ejecutar sin el servidor en marcha (un único escritor de JSON).
 */
import { readFile, writeFile, access, mkdir, copyFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { validarTienda } from '../backend/src/repositories/jsonStore.js';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sample = path.join(root, 'data', 'tienda.example.json');
const target = process.env.LINO_DATA_FILE || path.join(root, 'data', 'tienda.json');

try {
  const plantilla = validarTienda(JSON.parse(await readFile(sample, 'utf8')));
  await mkdir(path.dirname(target), { recursive: true });
  let previo;
  try {
    await access(target);
    previo = validarTienda(JSON.parse(await readFile(target, 'utf8')));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await writeFile(target, JSON.stringify(plantilla, null, 2) + '\n', { flag: 'wx' });
    console.log(`✓ Tienda creada con ${plantilla.productos.length} productos ficticios: ${target}`);
    process.exit(0);
  }

  // Nunca modificar los productos previos: sus precios, variantes, stock y
  // pedidos se mantienen tal como estaban en la instalación existente.
  const existentes = new Set(previo.productos.map(p => p.id));
  const idsVariantes = new Set(previo.productos.flatMap(p => p.variantes.map(v => v.id)));
  const nuevos = plantilla.productos.filter(p => !existentes.has(p.id));
  if (!nuevos.length) {
    console.log(`✓ Catálogo actualizado (${previo.productos.length} productos). No hubo cambios en pedidos ni stock.`);
    process.exit(0);
  }
  for (const nuevo of nuevos) {
    for (const v of nuevo.variantes) {
      if (idsVariantes.has(v.id)) throw new Error(`Variante duplicada al ampliar catálogo: ${v.id}`);
      idsVariantes.add(v.id);
    }
  }
  const actualizado = { ...previo, revision: previo.revision + 1, productos: [...previo.productos, ...nuevos] };
  validarTienda(actualizado);
  const respaldoDir = path.join(path.dirname(target), 'backups');
  await mkdir(respaldoDir, { recursive: true });
  const respaldo = path.join(respaldoDir, `tienda-antes-catalogo-${Date.now()}-${randomUUID().slice(0, 8)}.json`);
  const temporal = path.join(path.dirname(target), `tienda.${randomUUID()}.tmp`);
  await copyFile(target, respaldo);
  await writeFile(temporal, JSON.stringify(actualizado, null, 2) + '\n', { flag: 'wx' });
  await rename(temporal, target);
  console.log(`✓ Se agregaron ${nuevos.length} productos (total ${actualizado.productos.length}).`);
  console.log('✓ Se mantuvieron los pedidos, el stock y los productos previos. Respaldo:', respaldo);
} catch (error) {
  console.error('✗ No se modificaron los datos: ' + error.message);
  process.exitCode = 1;
}
