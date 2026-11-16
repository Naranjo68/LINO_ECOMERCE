import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { usaPostgres, obtenerPool } from '../db/postgres.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const archivo = () => process.env.LINO_DB_FILE || path.join(raiz, 'data', 'bd.json');
let cola = Promise.resolve();

async function leerBd() {
  try {
    const bd = JSON.parse(await readFile(archivo(), 'utf8'));
    if (!bd || !Array.isArray(bd.usuarios)) throw new Error('bd.json inválido: falta la lista "usuarios".');
    return bd;
  } catch (error) {
    if (error.code === 'ENOENT') return { usuarios: [] };
    throw error;
  }
}

export async function leerUsuarios() {
  if (usaPostgres()) {
    const pool = await obtenerPool();
    const { rows } = await pool.query('SELECT usuarios FROM lino_usuarios_state WHERE id = 1');
    if (!rows.length) throw new Error('Los usuarios aún no están inicializados en PostgreSQL. Ejecuta npm run db:init.');
    if (!Array.isArray(rows[0].usuarios)) throw new Error('La lista de usuarios almacenada en PostgreSQL no es válida.');
    return rows[0].usuarios;
  }
  return (await leerBd()).usuarios;
}

export async function actualizarUsuarios(mutar) {
  if (usaPostgres()) {
    const pool = await obtenerPool();
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      const { rows } = await cliente.query('SELECT usuarios FROM lino_usuarios_state WHERE id = 1 FOR UPDATE');
      if (!rows.length) throw new Error('Los usuarios aún no están inicializados en PostgreSQL. Ejecuta npm run db:init.');
      const usuarios = rows[0].usuarios;
      if (!Array.isArray(usuarios)) throw new Error('La lista de usuarios almacenada en PostgreSQL no es válida.');
      const resultado = await mutar(usuarios);
      await cliente.query(
        'UPDATE lino_usuarios_state SET usuarios = $1::jsonb, actualizado_en = NOW() WHERE id = 1',
        [JSON.stringify(usuarios)],
      );
      await cliente.query('COMMIT');
      return resultado;
    } catch (error) {
      await cliente.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      cliente.release();
    }
  }

  const operacion = cola.then(async () => {
    const bd = await leerBd();
    const resultado = await mutar(bd.usuarios);
    const destino = archivo();
    await mkdir(path.dirname(destino), { recursive: true });
    const temporal = path.join(path.dirname(destino), `bd.${randomUUID()}.tmp`);
    await writeFile(temporal, JSON.stringify(bd, null, 2) + '\n', { flag: 'wx' });
    await rename(temporal, destino);
    return resultado;
  });
  cola = operacion.catch(() => {});
  return operacion;
}
