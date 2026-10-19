import { registrarUsuario, ingresarUsuario, obtenerUsuarioPorId } from '../services/usuarioService.js';
import { iniciarCookie, borrarCookie, idDeSesion } from '../services/sesionService.js';

export async function registroPost(request, response, next) {
    try {
        const usuario = await registrarUsuario(request.body ?? {});
        response.status(201).json({ usuario });
    } catch (e) { next(e); }
}

export async function loginPost(request, response, next) {
    try {
        const usuario = await ingresarUsuario(request.body ?? {});
        iniciarCookie(response, usuario.id);
        response.json({ usuario });
    } catch (e) { next(e); }
}

// Dice quién tiene la sesión abierta. Sin sesión válida responde { usuario: null }.
export async function yoGet(request, response, next) {
    try {
        response.set('Cache-Control', 'no-store');
        const id = idDeSesion(request);
        const usuario = id ? await obtenerUsuarioPorId(id) : null;
        response.json({ usuario });
    } catch (e) { next(e); }
}

export function logoutPost(_request, response) {
    borrarCookie(response);
    response.json({ ok: true });
}