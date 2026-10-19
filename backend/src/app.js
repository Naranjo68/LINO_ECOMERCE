import express from 'express';
import productos from './routes/productos.js';
import pedidos from './routes/pedidos.js';
import { errorHandler } from './middleware/errorHandler.js';

export function crearApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true, proyecto: 'LINO', tipo: 'demo academica' }));
  app.use('/api/productos', productos);
  app.use('/api/pedidos', pedidos);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta de la API inexistente.' }));
  app.use(errorHandler);
  return app;
}
