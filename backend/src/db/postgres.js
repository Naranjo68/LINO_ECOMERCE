let poolPromise;

export function usaPostgres() {
  return Boolean(process.env.DATABASE_URL);
}

export async function obtenerPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Falta DATABASE_URL. Configura Neon en el entorno antes de usar PostgreSQL.');
  }

  if (!poolPromise) {
    poolPromise = (async () => {
      const modulo = await import('pg');
      const Pool = modulo.Pool ?? modulo.default?.Pool;
      if (!Pool) throw new Error('No se pudo cargar el controlador PostgreSQL (pg). Ejecuta npm install.');

      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: Number(process.env.PG_POOL_MAX || 5),
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 10_000,
        application_name: 'lino-ecomerce-api',
      });

      pool.on('error', error => {
        console.error('Error inesperado en el pool PostgreSQL de LINO:', error.message);
      });

      return pool;
    })().catch(error => {
      poolPromise = undefined;
      throw error;
    });
  }

  return poolPromise;
}

export async function asegurarEsquema() {
  const pool = await obtenerPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lino_tienda_state (
      id SMALLINT PRIMARY KEY CHECK (id = 1),
      documento JSONB NOT NULL,
      actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lino_usuarios_state (
      id SMALLINT PRIMARY KEY CHECK (id = 1),
      usuarios JSONB NOT NULL DEFAULT '[]'::jsonb,
      actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function verificarConexionPostgres() {
  const pool = await obtenerPool();
  const tienda = await pool.query('SELECT id FROM lino_tienda_state WHERE id = 1');
  const usuarios = await pool.query('SELECT id FROM lino_usuarios_state WHERE id = 1');
  if (!tienda.rowCount || !usuarios.rowCount) {
    throw new Error('La base de datos de LINO aún no está inicializada.');
  }
  return true;
}

export async function cerrarPoolPostgres() {
  if (!poolPromise) return;
  const pool = await poolPromise;
  await pool.end();
  poolPromise = undefined;
}
