import { readFile, writeFile, rename, copyFile, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const archivo = () => process.env.LINO_DATA_FILE || path.join(raiz, 'data', 'tienda.json');
let cola = Promise.resolve();

export function validarTienda(data) {
  if (!data || data.versionEsquema !== 1 || !Number.isSafeInteger(data.revision) || data.revision < 0 || !Array.isArray(data.productos) || !Array.isArray(data.pedidos)) {
    throw new Error('Estructura de tienda.json inválida. Revisa los datos o restaura un respaldo.');
  }
  const idsProductos = new Set();
  const idsVariantes = new Set();
  for (const p of data.productos) {
    if (!p || typeof p.id !== 'string' || !p.id || idsProductos.has(p.id) || typeof p.nombre !== 'string' || !p.nombre.trim() || typeof p.categoria !== 'string' || !Number.isSafeInteger(p.precioCentimos) || p.precioCentimos < 0 || typeof p.activo !== 'boolean' || !Array.isArray(p.variantes)) throw new Error('Existe un producto inválido o repetido.');
    idsProductos.add(p.id);
    for (const v of p.variantes) {
      if (!v || typeof v.id !== 'string' || !v.id || idsVariantes.has(v.id) || typeof v.talla !== 'string' || typeof v.color !== 'string' || !Number.isSafeInteger(v.stock) || v.stock < 0) throw new Error('Existe una variante inválida o repetida.');
      idsVariantes.add(v.id);
    }
  }
  const idsPedidos = new Set();
  const claves = new Set();
  for (const pedido of data.pedidos) {
    if (!pedido || typeof pedido.id !== 'string' || idsPedidos.has(pedido.id) || typeof pedido.claveSolicitud !== 'string' || claves.has(pedido.claveSolicitud) || !Array.isArray(pedido.lineas) || !Number.isSafeInteger(pedido.totalCentimos) || pedido.totalCentimos < 0) throw new Error('Existe un pedido inválido o repetido.');
    idsPedidos.add(pedido.id);
    claves.add(pedido.claveSolicitud);
  }
  return data;
}

export async function leerTienda() {
  // La falta del archivo es un error explícito: ejecutar npm run init:data.
  const texto = await readFile(archivo(), 'utf8');
  return validarTienda(JSON.parse(texto));
}

export function actualizarTienda(mutar) {
  const operacion = cola.then(async () => {
    const previo = await leerTienda();
    const nuevo = structuredClone(previo);
    const resultado = await mutar(nuevo);
    if (resultado?.sinCambios) return resultado;
    nuevo.revision = previo.revision + 1;
    validarTienda(nuevo);
    const destino = archivo();
    const carpeta = path.dirname(destino);
    await mkdir(path.join(carpeta, 'backups'), { recursive: true });
    const respaldo = path.join(carpeta, 'backups', `tienda-${Date.now()}-${randomUUID().slice(0, 8)}.json`);
    const temporal = path.join(carpeta, `tienda.${randomUUID()}.tmp`);
    // Sólo una instancia de Node debe escribir este archivo.
    await copyFile(destino, respaldo);
    await writeFile(temporal, JSON.stringify(nuevo, null, 2) + '\n', { flag: 'wx' });
    await rename(temporal, destino);
    return resultado;
  });
  // Los errores de una operación no deben bloquear la siguiente.
  cola = operacion.catch(() => {});
  return operacion;
}
