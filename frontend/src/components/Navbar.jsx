import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowUpRight, LogOut, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useCarrito } from '../context/CarritoContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busquedaAbierta, setBusquedaAbierta] = useState(false);
  const [texto, setTexto] = useState('');
  const navegar = useNavigate();
  const { cantidadTotal } = useCarrito();
  const { usuario, cargando, cerrarSesion } = useAuth();
  function cerrar() { setMenuAbierto(false); setBusquedaAbierta(false); }
  async function salir() { await cerrarSesion(); cerrar(); navegar('/'); }
  function buscar(evento) {
    evento.preventDefault();
    navegar(`/catalogo?buscar=${encodeURIComponent(texto.trim())}`);
    cerrar();
  }
  const links = [
    { ruta: '/', texto: 'Inicio', end: true },
    { ruta: '/catalogo', texto: 'Colección', end: true },
    { ruta: '/catalogo?categoria=mujer', texto: 'Mujer' },
    { ruta: '/catalogo?categoria=hombre', texto: 'Hombre' },
    { ruta: '/catalogo?categoria=accesorios', texto: 'Accesorios' },
  ];
  return <>
    <div className="announcement"><span>CONOCE NUESTRA COLECCIÓN 2026</span><span className="announcement-divider">•</span><span>PROYECTO DEMOSTRATIVO LINO</span><ArrowUpRight size={13} aria-hidden="true" /></div>
    <header className="site-header">
      <div className="header-inner container">
        <button type="button" className="icon-button mobile-toggle" onClick={() => setMenuAbierto(a => !a)} aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuAbierto}>
          {menuAbierto ? <X size={23} /> : <Menu size={23} />}
        </button>
        <Link to="/" className="logo" onClick={cerrar} aria-label="LINO, ir a inicio">LINO<span className="logo-dot">.</span></Link>
        <nav className={`main-nav ${menuAbierto ? 'is-open' : ''}`} aria-label="Navegación principal">
          {links.map(({ ruta, texto, end }) => <NavLink key={ruta} to={ruta} end={end} className={({ isActive }) => {
            // NavLink no incluye los parámetros de consulta en isActive.
            const activo = ruta.includes('?') ? window.location.pathname + window.location.search === ruta : isActive && (!end || !window.location.search);
            return activo ? 'nav-link active' : 'nav-link';
          }} onClick={cerrar}>{texto}</NavLink>)}
          <Link to="/nosotros" className="nav-link nav-mobile-extra" onClick={cerrar}>Nosotros</Link>
          <div className="auth-mobile">
            {cargando ? null : usuario ? <>
              <span className="user-chip" title={usuario.correo}><User size={16} aria-hidden="true" /><span className="user-name">Hola, {usuario.nombre}</span></span>
              <button type="button" className="auth-mobile-out" onClick={salir}>Cerrar sesión</button>
            </> : <Link to="/login" className="auth-mobile-in" onClick={cerrar}><User size={16} aria-hidden="true" /> Iniciar sesión</Link>}
          </div>
        </nav>
        <div className="header-actions">
          <button type="button" className="icon-button" title="Buscar prendas" aria-label="Abrir búsqueda" aria-expanded={busquedaAbierta} onClick={() => { setBusquedaAbierta(a => !a); setMenuAbierto(false); }}><Search size={21} strokeWidth={1.8} /></button>
          <Link to="/carrito" className="icon-button cart-button" aria-label={`Carrito con ${cantidadTotal} productos`} onClick={cerrar}>
            <ShoppingBag size={21} strokeWidth={1.8} />{cantidadTotal > 0 && <span className="cart-count">{cantidadTotal}</span>}
          </Link>
          <div className="auth-desktop">
            {cargando ? null : usuario ? <>
              <span className="user-chip" title={usuario.correo}><User size={16} aria-hidden="true" /><span className="user-name">Hola, {usuario.nombre}</span></span>
              <button type="button" className="icon-button" onClick={salir} title="Cerrar sesión" aria-label="Cerrar sesión"><LogOut size={19} strokeWidth={1.8} /></button>
            </> : <Link to="/login" className="auth-login" onClick={cerrar}><User size={16} aria-hidden="true" /><span className="auth-label">Iniciar sesión</span></Link>}
          </div>
        </div>
      </div>
      {busquedaAbierta && <form className="search-bar container" onSubmit={buscar} role="search"><Search size={19} /><input autoFocus value={texto} onChange={e => setTexto(e.target.value)} placeholder="Busca camisetas, pantalones, accesorios..." aria-label="Buscar productos" /><button type="submit" className="search-submit">Buscar <ArrowUpRight size={16} /></button></form>}
    </header>
  </>;
}