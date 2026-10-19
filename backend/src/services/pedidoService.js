import { randomUUID } from 'node:crypto';
import { actualizarTienda } from '../repositories/jsonStore.js';
import { HttpError } from '../middleware/HttpError.js';

const ENVIO_BASE_CENTIMOS = 1200;
const UMBRAL_ENVIO_GRATIS = 2;
const IGV_PORCENTAJE = 18;

export async function registrarPedido(datos, usuario) {
  const { claveSolicitud, items, direccionEnvio } = datos ?? {};
  if (typeof claveSolicitud !== 'string' || claveSolicitud.length < 8 || claveSolicitud.length > 100) throw new HttpError(400, 'La clave de solicitud debe tener entre 8 y 100 caracteres.');
  if (!Array.isArray(items) || items.length === 0 || items.length > 40) throw new HttpError(400, 'Agrega al menos un producto válido al carrito.');
  if (typeof direccionEnvio !== 'string' || direccionEnvio.trim().length < 8 || direccionEnvio.trim().length > 300) throw new HttpError(400, 'Ingresa una dirección de envío válida (entre 8 y 300 caracteres).');
  const agregados = new Set();
  for (const item of items) {
    if (!item || typeof item.varianteId !== 'string' || !item.varianteId || !Number.isSafeInteger(item.cantidad) || item.cantidad < 1 || item.cantidad > 99 || agregados.has(item.varianteId)) throw new HttpError(400, 'Hay variantes duplicadas o cantidades inválidas.');
    agregados.add(item.varianteId);
  }
  return actualizarTienda(estado => {
    const existente = estado.pedidos.find(p => p.claveSolicitud === claveSolicitud);
    if (existente) {
      const anterior = existente.lineas.map(l => ({ varianteId: l.varianteId, cantidad: l.cantidad })).sort((a, b) => a.varianteId.localeCompare(b.varianteId));
      const nuevo = items.map(l => ({ varianteId: l.varianteId, cantidad: l.cantidad })).sort((a, b) => a.varianteId.localeCompare(b.varianteId));
      if (JSON.stringify(anterior) !== JSON.stringify(nuevo) || existente.direccionEnvio !== direccionEnvio.trim() || existente.cliente?.id !== usuario.id) throw new HttpError(409, 'La clave de solicitud pertenece a una selección distinta.');
      return { pedido: existente, repetido: true, sinCambios: true };
    }
    const lineas = items.map(item => {
      const producto = estado.productos.find(p => p.activo && p.variantes.some(v => v.id === item.varianteId));
      const variante = producto?.variantes.find(v => v.id === item.varianteId);
      if (!producto || !variante) throw new HttpError(404, 'Una variante del carrito ya no está disponible.');
      if (variante.stock < item.cantidad) throw new HttpError(409, `Stock insuficiente de ${producto.nombre} (${variante.talla}, ${variante.color}). Quedan ${variante.stock}.`);
      return {
        productoId: producto.id, varianteId: variante.id, nombreProducto: producto.nombre,
        talla: variante.talla, color: variante.color, cantidad: item.cantidad,
        precioUnitarioCentimos: producto.precioCentimos,
        subtotalCentimos: producto.precioCentimos * item.cantidad,
      };
    });
    const subtotalCentimos = lineas.reduce((total, l) => total + l.subtotalCentimos, 0);
    const cantidadTotal = lineas.reduce((total, l) => total + l.cantidad, 0);
    const envioCentimos = cantidadTotal >= UMBRAL_ENVIO_GRATIS ? 0 : ENVIO_BASE_CENTIMOS;
    const baseImponibleCentimos = subtotalCentimos + envioCentimos;
    const igvCentimos = Math.round(baseImponibleCentimos * IGV_PORCENTAJE / 100);
    const totalCentimos = baseImponibleCentimos + igvCentimos;
    const pedido = {
      id: `PED-${randomUUID().slice(0, 8).toUpperCase()}`, claveSolicitud,
      fecha: new Date().toISOString(), estado: 'registrado',
      cliente: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
      direccionEnvio: direccionEnvio.trim(),
      lineas,
      subtotalCentimos,
      envioCentimos,
      igvCentimos,
      totalCentimos,
    };
    for (const item of items) {
      for (const producto of estado.productos) {
        const variante = producto.variantes.find(v => v.id === item.varianteId);
        if (variante) variante.stock -= item.cantidad;
      }
    }
    estado.pedidos.push(pedido);
    return { pedido, repetido: false };
  });
}
