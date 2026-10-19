const API = import.meta.env.VITE_API_URL || '/api';

async function solicitar(ruta, metodo, cuerpo) {
    let respuesta;
    try {
        respuesta = await fetch(`${API}/usuarios${ruta}`, {
            method: metodo,
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            ...(cuerpo ? { body: JSON.stringify(cuerpo) } : {}),
        });
    } catch {
        throw new Error('No se pudo conectar con el servidor. Inícialo con npm run dev.');
    }
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(datos.error || 'No se pudo completar la solicitud.');
    return datos;
}

export const registrarUsuario = (nombre, correo, contrasena) => solicitar('/registro', 'POST', { nombre, correo, contrasena });
export const ingresarUsuario = (correo, contrasena) => solicitar('/login', 'POST', { correo, contrasena });
export const obtenerSesion = async () => (await solicitar('/yo', 'GET')).usuario;
export const cerrarSesionApi = () => solicitar('/logout', 'POST');