import { registrarPedido } from '../services/pedidoService.js';
import { idDeSesion } from '../services/sesionService.js';
import { obtenerUsuarioPorId } from '../services/usuarioService.js';
import { HttpError } from '../middleware/HttpError.js';

export async function pedidoPost(request, response, next) {
  try {
    const usuarioId = idDeSesion(request);
    const usuario = usuarioId ? await obtenerUsuarioPorId(usuarioId) : null;
    if (!usuario) throw new HttpError(401, 'Inicia sesión para confirmar tu pedido.');
    const { pedido, repetido } = await registrarPedido(request.body, usuario);
    response.status(repetido ? 200 : 201).json({ pedido, repetido });
  } catch (e) { next(e); }
}
