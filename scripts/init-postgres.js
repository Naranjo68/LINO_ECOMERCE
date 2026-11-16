/**
 * Inicializa el esquema PostgreSQL y carga los datos JSON una sola vez.
 * Si existen data/tienda.json y data/bd.json locales, los importa.
 * Si no existen, usa el catálogo de ejemplo y una lista de usuarios vacía.
 * Nunca reemplaza información que ya exista en Neon.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { asegurarEsquema, obtenerPool, cerrarPoolPostgres } from '../backend/src/db/postgres.js';
import { validarTienda } from '../backend/src/repositories/jsonStore.js';

try { process.loadEnvFile?.(); } catch (error) { if (error.code !== 'ENOENT') throw error; }

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const archivoTienda = process.env.LINO_DATA_FILE || path.join(raiz, 'data', 'tienda.json');
const archivoEjemplo = path.join(raiz, 'data', 'tienda.example.json');
const archivoUsuarios = process.env.LINO_DB_FILE || path.join(raiz, 'data', 'bd.json');

async function leerJson(ruta, alternativa) {
  try {
    return JSON.parse(await readFile(ruta, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT' && alternativa) return JSON.parse(await readFile(alternativa, 'utf8'));
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Configura DATABASE_URL en el archivo .env o en las variables del servicio antes de ejecutar npm run db:init.');
  }

  const tienda = validarTienda(await leerJson(archivoTienda, archivoEjemplo));
  const bdUsuarios = await leerJson(archivoUsuarios, null) ?? { usuarios: [] };
  if (!bdUsuarios || !Array.isArray(bdUsuarios.usuarios)) {
    throw new Error('El archivo de usuarios debe contener una propiedad usuarios de tipo arreglo.');
  }

  await asegurarEsquema();
  const pool = await obtenerPool();
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const tiendaInsertada = await cliente.query(
      `INSERT INTO lino_tienda_state (id, documento)
       VALUES (1, $1::jsonb)
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [JSON.stringify(tienda)],
    );
    const usuariosInsertados = await cliente.query(
      `INSERT INTO lino_usuarios_state (id, usuarios)
       VALUES (1, $1::jsonb)
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [JSON.stringify(bdUsuarios.usuarios)],
    );
    await cliente.query('COMMIT');

    console.log('✓ Esquema PostgreSQL de LINO verificado.');
    console.log(tiendaInsertada.rowCount ? `✓ Catálogo inicial importado (${tienda.productos.length} productos, ${tienda.pedidos.length} pedidos).` : '✓ Catálogo existente conservado; no se sobrescribieron productos ni pedidos.');
    console.log(usuariosInsertados.rowCount ? `✓ Usuarios iniciales importados (${bdUsuarios.usuarios.length}).` : '✓ Usuarios existentes conservados; no se sobrescribieron cuentas.');
  } catch (error) {
    await cliente.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    cliente.release();
    await cerrarPoolPostgres();
  }
}

main().catch(async error => {
  console.error('✗ No se pudo inicializar PostgreSQL:', error.message);
  await cerrarPoolPostgres().catch(() => {});
  process.exitCode = 1;
});
