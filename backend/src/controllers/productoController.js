import { listarProductos, obtenerProducto } from '../services/productoService.js';
export async function productosGet(request, response, next) {
  try { response.json({ productos: await listarProductos(request.query) }); } catch (e) { next(e); }
}
export async function productoGet(request, response, next) {
  try { response.json({ producto: await obtenerProducto(request.params.id) }); } catch (e) { next(e); }
}
