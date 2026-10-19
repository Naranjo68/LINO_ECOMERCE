import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ingresarUsuario, registrarUsuario } from '../services/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/login.css';

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(nombre, correo, contrasena, modo) {
    const errores = {};
    if (modo === 'crear') {
        if (nombre.trim().length < 2) errores.nombre = 'Ingresa tu nombre (mínimo 2 caracteres).';
        else if (nombre.trim().length > 40) errores.nombre = 'El nombre es demasiado largo (máximo 40 caracteres).';
    }
    if (!correo.trim()) errores.correo = 'Ingresa tu correo electrónico.';
    else if (!FORMATO_CORREO.test(correo.trim())) errores.correo = 'El correo no tiene un formato válido (ejemplo: nombre@correo.com).';
    if (!contrasena) errores.contrasena = 'Ingresa tu contraseña.';
    else if (modo === 'crear' && contrasena.length < 8) errores.contrasena = 'La contraseña debe tener al menos 8 caracteres.';
    return errores;
}

export default function Login() {
    const [modo, setModo] = useState('ingresar');
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [errores, setErrores] = useState({});
    const [resultado, setResultado] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const temporizador = useRef(null);
    const navegar = useNavigate();
    const { iniciarSesion } = useAuth();
    const creando = modo === 'crear';

    // Si el usuario sale de esta pantalla antes de la redirección, se cancela.
    useEffect(() => () => clearTimeout(temporizador.current), []);

    function cambiarModo() {
        setModo(creando ? 'ingresar' : 'crear');
        setErrores({});
        setResultado(null);
        setContrasena('');
    }

    async function enviar(evento) {
        evento.preventDefault();
        setResultado(null);
        const encontrados = validar(nombre, correo, contrasena, modo);
        setErrores(encontrados);
        if (Object.keys(encontrados).length > 0) return;
        setEnviando(true);
        try {
            if (creando) {
                await registrarUsuario(nombre.trim(), correo.trim(), contrasena);
                setModo('ingresar');
                setNombre('');
                setResultado({ tipo: 'ok', texto: 'Cuenta creada correctamente. Ahora inicia sesión con tu correo y contraseña.' });
            } else {
                const { usuario } = await ingresarUsuario(correo.trim(), contrasena);
                iniciarSesion(usuario);
                setResultado({ tipo: 'ok', texto: `Inicio de sesión correcto. Bienvenido, ${usuario.nombre}. Te llevamos al inicio...` });
                temporizador.current = setTimeout(() => navegar('/'), 1800);
            }
        } catch (error) {
            setResultado({ tipo: 'error', texto: error.message });
        } finally {
            // La contraseña nunca se conserva en pantalla después de enviar.
            setContrasena('');
            setEnviando(false);
        }
    }

    return <div className="container login-page">
        <p className="overline">{creando ? 'CREAR CUENTA' : 'BIENVENIDO DE VUELTA'}</p>
        <h1>{creando ? <>Crea tu<br /><em>cuenta.</em></> : <>Inicia<br /><em>sesión.</em></>}</h1>
        <p className="login-lead">Tu correo y contraseña se verifican en el servidor contra el archivo local bd.json, donde las contraseñas se guardan cifradas.</p>

        <form className="login-form" onSubmit={enviar} noValidate>
            {creando && <div className="login-field">
                <label htmlFor="login-nombre">Nombre</label>
                <input id="login-nombre" type="text" autoComplete="name" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" aria-invalid={Boolean(errores.nombre)} aria-describedby={errores.nombre ? 'error-nombre' : undefined} className={errores.nombre ? 'has-error' : ''} />
                {errores.nombre && <p className="login-error" id="error-nombre" role="alert">{errores.nombre}</p>}
            </div>}
            <div className="login-field">
                <label htmlFor="login-correo">Correo electrónico</label>
                <input id="login-correo" type="email" autoComplete="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="nombre@correo.com" aria-invalid={Boolean(errores.correo)} aria-describedby={errores.correo ? 'error-correo' : undefined} className={errores.correo ? 'has-error' : ''} />
                {errores.correo && <p className="login-error" id="error-correo" role="alert">{errores.correo}</p>}
            </div>
            <div className="login-field">
                <label htmlFor="login-contrasena">Contraseña</label>
                <input id="login-contrasena" type="password" autoComplete={creando ? 'new-password' : 'current-password'} value={contrasena} onChange={e => setContrasena(e.target.value)} placeholder={creando ? 'Mínimo 8 caracteres' : 'Tu contraseña'} aria-invalid={Boolean(errores.contrasena)} aria-describedby={errores.contrasena ? 'error-contrasena' : undefined} className={errores.contrasena ? 'has-error' : ''} />
                {errores.contrasena && <p className="login-error" id="error-contrasena" role="alert">{errores.contrasena}</p>}
            </div>

            {resultado && <div className={`notice ${resultado.tipo === 'error' ? 'error' : ''}`} role="status" aria-live="polite">{resultado.texto}</div>}

            <button type="submit" className="btn btn-dark login-submit" disabled={enviando}>{enviando ? 'Enviando...' : creando ? 'Crear cuenta' : 'Iniciar sesión'}</button>
            <button type="button" className="login-switch" onClick={cambiarModo}>{creando ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Crea una'}</button>
        </form>

    </div>;
}