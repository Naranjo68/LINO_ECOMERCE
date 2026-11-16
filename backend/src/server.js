import { crearApp } from './app.js';
import { cerrarPoolPostgres } from './db/postgres.js';

// Node.js 20.12+ permite cargar un .env local sin dependencias extra.
try { process.loadEnvFile?.(); } catch (error) { if (error.code !== 'ENOENT') throw error; }

if (process.env.NODE_ENV === 'production' && !process.env.LINO_SESSION_SECRET) {
  throw new Error('Falta LINO_SESSION_SECRET. Configura una clave persistente en el servicio de despliegue.');
}

const puerto = Number(process.env.PORT || 3001);
const servidor = crearApp().listen(puerto, '0.0.0.0', () => {
  console.log(`API LINO disponible en el puerto ${puerto}`);
});

async function apagar() {
  servidor.close(async () => {
    await cerrarPoolPostgres().catch(error => console.error('No se pudo cerrar PostgreSQL:', error.message));
    process.exit(0);
  });
}

process.once('SIGTERM', apagar);
process.once('SIGINT', apagar);
