import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CarritoProvider, useCarrito } from './context/CarritoContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ScrollTop from './components/ScrollTop.jsx';
import Inicio from './pages/Inicio.jsx';
import Catalogo from './pages/Catalogo.jsx';
import DetalleProducto from './pages/DetalleProducto.jsx';
import Carrito from './pages/Carrito.jsx';
import Nosotros from './pages/Nosotros.jsx';
import Contacto from './pages/Contacto.jsx';
import Login from './pages/Login.jsx';
import NoEncontrado from './pages/NoEncontrado.jsx';

function Layout() {
  const { mensaje } = useCarrito();
  const { usuario, cargando } = useAuth();
  if (cargando) return <main id="contenido"><div className="container login-page"><p className="loading">Verificando sesión...</p></div></main>;
  if (!usuario) return <Login />;
  return <><ScrollTop /><Navbar /><main id="contenido">
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/producto/:id" element={<DetalleProducto />} />
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/nosotros" element={<Nosotros />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NoEncontrado />} />
    </Routes>
  </main><Footer />{mensaje && <div className="toast" role="status">{mensaje}</div>}</>;
}
export default function App() {
  return <BrowserRouter><AuthProvider><CarritoProvider><Layout /></CarritoProvider></AuthProvider></BrowserRouter>;
}