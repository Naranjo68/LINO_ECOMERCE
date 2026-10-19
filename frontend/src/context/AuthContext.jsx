import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cerrarSesionApi, obtenerSesion } from '../services/authApi.js';

// La sesión vive en el servidor (cookie HttpOnly firmada). Aquí solo se guarda
// quién es el usuario según el servidor; no se guarda nada en el navegador.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Al abrir o recargar la página se le pregunta al servidor si hay sesión válida.
    useEffect(() => {
        let activo = true;
        obtenerSesion()
            .then(datos => { if (activo) setUsuario(datos); })
            .catch(() => { })
            .finally(() => { if (activo) setCargando(false); });
        return () => { activo = false; };
    }, []);

    const iniciarSesion = useCallback(datos => setUsuario(datos), []);

    const cerrarSesion = useCallback(async () => {
        try { await cerrarSesionApi(); } catch { /* si el servidor no responde, igual se limpia la pantalla */ }
        setUsuario(null);
    }, []);

    const valor = useMemo(() => ({ usuario, cargando, iniciarSesion, cerrarSesion }), [usuario, cargando, iniciarSesion, cerrarSesion]);
    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const contexto = useContext(AuthContext);
    if (!contexto) throw new Error('useAuth debe usarse dentro de AuthProvider.');
    return contexto;
}