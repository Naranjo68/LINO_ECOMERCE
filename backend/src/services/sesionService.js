import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const NOMBRE_COOKIE = 'lino_sesion';
const DURACION_SEGUNDOS = 2 * 60 * 60; // la sesión dura 2 horas

// Con LINO_SESSION_SECRET (en tu .env) las sesiones sobreviven a los reinicios del servidor.
// Sin ella se genera una clave aleatoria al iniciar y las sesiones se pierden al reiniciar.
let secretoAleatorio;
function secreto() {
    return process.env.LINO_SESSION_SECRET || (secretoAleatorio ??= randomBytes(32).toString('hex'));
}

const firmar = datos => createHmac('sha256', secreto()).update(datos).digest('base64url');

export function crearToken(usuarioId) {
    const carga = Buffer.from(JSON.stringify({ sub: usuarioId, exp: Math.floor(Date.now() / 1000) + DURACION_SEGUNDOS })).toString('base64url');
    return `${carga}.${firmar(carga)}`;
}

// Devuelve el id del usuario si el token es auténtico y no venció; si no, null.
export function leerToken(token) {
    if (typeof token !== 'string') return null;
    const partes = token.split('.');
    if (partes.length !== 2 || !partes[0] || !partes[1]) return null;
    const [carga, firma] = partes;
    const esperada = Buffer.from(firmar(carga));
    const recibida = Buffer.from(firma);
    if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;
    try {
        const datos = JSON.parse(Buffer.from(carga, 'base64url').toString('utf8'));
        if (typeof datos.sub !== 'string' || !Number.isFinite(datos.exp) || datos.exp < Date.now() / 1000) return null;
        return datos.sub;
    } catch {
        return null;
    }
}

function leerCookie(request, nombre) {
    for (const parte of String(request.headers.cookie || '').split(';')) {
        const i = parte.indexOf('=');
        if (i > 0 && parte.slice(0, i).trim() === nombre) {
            try { return decodeURIComponent(parte.slice(i + 1).trim()); } catch { return null; }
        }
    }
    return null;
}

// HttpOnly: JavaScript del navegador no puede leer la cookie. Secure solo en producción (HTTPS).
const atributos = () => `Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

export function iniciarCookie(response, usuarioId) {
    response.setHeader('Set-Cookie', `${NOMBRE_COOKIE}=${crearToken(usuarioId)}; Max-Age=${DURACION_SEGUNDOS}; ${atributos()}`);
}

export function borrarCookie(response) {
    response.setHeader('Set-Cookie', `${NOMBRE_COOKIE}=; Max-Age=0; ${atributos()}`);
}

export function idDeSesion(request) {
    return leerToken(leerCookie(request, NOMBRE_COOKIE));
}