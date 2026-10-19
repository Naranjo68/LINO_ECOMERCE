const API = import.meta.env.VITE_API_URL || '/api';

async function solicitar(ruta, opciones) {
  let respuesta;
  try {
    respuesta = await fetch(`${API}${ruta}`, { headers: { 'Content-Type': 'application/json' }, ...opciones });
  } catch {
    throw new Error('No se pudo conectar con LINO. Verifica que el servidor esté iniciado con npm run dev.');
  }
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.error || 'No se pudo completar la solicitud.');
  return datos;
}

export async function obtenerProductos(parametros = {}) {
  const query = new URLSearchParams();
  if (parametros.categoria && parametros.categoria !== 'todos') query.set('categoria', parametros.categoria);
  if (parametros.buscar) query.set('buscar', parametros.buscar);
  const cadena = query.toString();
  return (await solicitar(`/productos${cadena ? `?${cadena}` : ''}`)).productos;
}
export async function obtenerProducto(id) {
  return (await solicitar(`/productos/${encodeURIComponent(id)}`)).producto;
}
export async function crearPedido(items, claveSolicitud) {
  return solicitar('/pedidos', { method: 'POST', body: JSON.stringify({ items, claveSolicitud }) });
}
