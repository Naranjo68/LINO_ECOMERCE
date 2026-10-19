import { scryptSync, randomBytes, timingSafeEqual, randomUUID } from 'node:crypto';
import { HttpError } from '../middleware/HttpError.js';
import { leerUsuarios, actualizarUsuarios } from '../repositories/usuariosStore.js';

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Límite de intentos fallidos por correo (en memoria): frena adivinar contraseñas.
const MAX_INTENTOS = 5;
const VENTANA_MS = 10 * 60 * 1000;
const intentos = new Map();

function revisarBloqueo(email) {
    const registro = intentos.get(email);
    if (!registro) return;
    if (Date.now() - registro.desde > VENTANA_MS) { intentos.delete(email); return; }
    if (registro.cuenta >= MAX_INTENTOS) throw new HttpError(429, 'Demasiados intentos fallidos. Espera unos minutos e inténtalo otra vez.');
}

function registrarFallo(email) {
    const registro = intentos.get(email);
    if (!registro || Date.now() - registro.desde > VENTANA_MS) intentos.set(email, { cuenta: 1, desde: Date.now() });
    else registro.cuenta += 1;
}

function normalizarCorreo(valor) {
    return typeof valor === 'string' ? valor.trim().toLowerCase() : '';
}

function normalizarNombre(valor) {
    return typeof valor === 'string' ? valor.trim().replace(/\s+/g, ' ') : '';
}

function validarNombre(nombre) {
    if (nombre.length < 2) throw new HttpError(400, 'Ingresa tu nombre (mínimo 2 caracteres).');
    if (nombre.length > 40) throw new HttpError(400, 'El nombre es demasiado largo (máximo 40 caracteres).');
}

function validar(correo, contrasena, exigirLongitud) {
    if (!correo) throw new HttpError(400, 'Ingresa tu correo electrónico.');
    if (correo.length > 120 || !FORMATO_CORREO.test(correo)) throw new HttpError(400, 'El correo electrónico no tiene un formato válido.');
    if (typeof contrasena !== 'string' || !contrasena) throw new HttpError(400, 'Ingresa tu contraseña.');
    if (contrasena.length > 100) throw new HttpError(400, 'La contraseña es demasiado larga.');
    if (exigirLongitud && contrasena.length < 8) throw new HttpError(400, 'La contraseña debe tener al menos 8 caracteres.');
}

// Nunca se guarda la contraseña: solo un hash con sal (scrypt, incluido en Node).
function crearHash(contrasena) {
    const sal = randomBytes(16);
    return `${sal.toString('hex')}:${scryptSync(contrasena, sal, 64).toString('hex')}`;
}

function coincide(contrasena, guardado) {
    const [sal, hash] = String(guardado).split(':');
    if (!sal || !hash) return false;
    const esperado = Buffer.from(hash, 'hex');
    const calculado = scryptSync(contrasena, Buffer.from(sal, 'hex'), esperado.length);
    return timingSafeEqual(calculado, esperado);
}

// Si un usuario antiguo no tiene nombre, se usa la parte del correo antes de la @.
const publico = usuario => ({ id: usuario.id, nombre: usuario.nombre || usuario.correo.split('@')[0], correo: usuario.correo });

export async function registrarUsuario({ nombre, correo, contrasena }) {
    const nombreLimpio = normalizarNombre(nombre);
    const email = normalizarCorreo(correo);
    validarNombre(nombreLimpio);
    validar(email, contrasena, true);
    return actualizarUsuarios(usuarios => {
        if (usuarios.some(u => u.correo === email)) throw new HttpError(409, 'Ya existe una cuenta con ese correo.');
        const usuario = { id: randomUUID(), nombre: nombreLimpio, correo: email, contrasenaHash: crearHash(contrasena), creadoEn: new Date().toISOString() };
        usuarios.push(usuario);
        return publico(usuario);
    });
}

export async function ingresarUsuario({ correo, contrasena }) {
    const email = normalizarCorreo(correo);
    validar(email, contrasena, false);
    revisarBloqueo(email);
    const usuario = (await leerUsuarios()).find(u => u.correo === email);
    // Mismo mensaje si falla el correo o la contraseña.
    if (!usuario || !coincide(contrasena, usuario.contrasenaHash)) {
        registrarFallo(email);
        throw new HttpError(401, 'Correo o contraseña incorrectos.');
    }
    intentos.delete(email);
    return publico(usuario);
}

// Para comprobar una sesión: el usuario debe seguir existiendo en bd.json.
export async function obtenerUsuarioPorId(id) {
    const usuario = (await leerUsuarios()).find(u => u.id === id);
    return usuario ? publico(usuario) : null;
}