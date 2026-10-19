import { leerTienda } from '../repositories/jsonStore.js';
import { HttpError } from '../middleware/HttpError.js';

export async function listarProductos({ categoria, buscar } = {}) {
  const estado = await leerTienda();
  let productos = estado.productos.filter(p => p.activo);
  if (categoria && categoria !== 'todos') productos = productos.filter(p => p.categoria === categoria);
  if (buscar) {
    const termino = buscar.trim().toLocaleLowerCase('es');
    productos = productos.filter(p => `${p.nombre} ${p.descripcion ?? ''}`.toLocaleLowerCase('es').includes(termino));
  }
  return productos;
}

export async function obtenerProducto(id) {
  const { productos } = await leerTienda();
  const producto = productos.find(p => p.id === id && p.activo);
  if (!producto) throw new HttpError(404, 'No se encontró este producto.');
  return producto;
}
