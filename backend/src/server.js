import { crearApp } from './app.js';
// Node.js 20.12+ permite cargar un .env local sin dependencias extra.
try { process.loadEnvFile?.(); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const puerto = Number(process.env.PORT || 3001);
crearApp().listen(puerto, '127.0.0.1', () => {
  console.log(`API LINO disponible en http://127.0.0.1:${puerto}/api/health`);
});
