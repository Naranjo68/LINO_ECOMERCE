import { Link } from 'react-router-dom';
import { ArrowUpRight, Instagram, Mail } from 'lucide-react';
export default function Footer() {
  return <footer className="site-footer">
    <div className="container footer-top">
      <div className="footer-brand"><Link className="footer-logo" to="/">LINO<span>.</span></Link><p>Prendas para ser tú.<br/>Una colección que evoluciona contigo.</p><span className="footer-academic">Proyecto académico de e-commerce · Perú 2026</span></div>
      <div className="footer-column"><h3>Explorar</h3><Link to="/catalogo">Colección completa</Link><Link to="/catalogo?categoria=mujer">Mujer</Link><Link to="/catalogo?categoria=hombre">Hombre</Link><Link to="/catalogo?categoria=accesorios">Accesorios</Link></div>
      <div className="footer-column"><h3>Información</h3><Link to="/nosotros">Sobre LINO</Link><Link to="/contacto">Contacto</Link><Link to="/carrito">Mi carrito</Link></div>
      <div className="footer-column footer-note"><h3>Sigamos conectados</h3><p>Diseño sencillo, estilo propio y una experiencia digital pensada para ti.</p><Link to="/contacto" className="footer-contact">Escríbenos <ArrowUpRight size={16}/></Link><div className="footer-social" aria-hidden="true"><Instagram size={19}/><Mail size={19}/></div></div>
    </div>
    <div className="container footer-bottom"><span>© 2026 LINO. Proyecto demostrativo, sin pagos reales.</span><span>Hecho con React y Node.js <span aria-hidden="true">✳</span></span></div>
  </footer>;
}
