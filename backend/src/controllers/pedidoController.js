import { registrarPedido } from '../services/pedidoService.js';
export async function pedidoPost(request, response, next) {
  try {
    const { pedido, repetido } = await registrarPedido(request.body);
    response.status(repetido ? 200 : 201).json({ pedido, repetido });
  } catch (e) { next(e); }
}
