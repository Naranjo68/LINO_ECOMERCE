import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, MoveUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { obtenerProductos } from '../services/api.js';

export default function Inicio() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { obtenerProductos().then(setProductos).catch(e => setError(e.message)); }, []);
  return <>
    <section className="hero">
      <div className="hero-copy">
        <div className="hero-eyebrow"><span className="eyebrow-line"/> NUEVA TEMPORADA · 2026</div>
        <h1>Vístete de<br/><em>tu propia</em><br/>esencia<span className="hero-period">.</span></h1>
        <p>Estilo que acompaña tu día a día. Descubre prendas versátiles para expresarte a tu manera.</p>
        <Link className="btn btn-dark" to="/catalogo">Descubrir colección <ArrowRight size={19}/></Link>
        <div className="hero-bottom"><span>01 / 03 <span className="hero-line"/></span><span>ESTILO SIN COMPLICACIONES <ArrowDownRight size={17}/></span></div>
      </div>
      <div className="hero-media"><img src="/imagenes/editorial-hero.svg" alt="Ilustración editorial de la colección LINO 2026"/><span className="vertical-stamp">CREADO PARA TU ESTILO</span><span className="hero-image-badge">E S T . &nbsp; 2 0 2 6</span></div>
    </section>
    <div className="value-strip"><div className="container value-inner"><span>Diseño cotidiano</span><i/><span>Esencia propia</span><i/><span>Prendas versátiles</span><i/><span>Estilo LINO</span></div></div>

    <section className="category-section container section-pad">
      <div className="section-heading"><div><p className="overline">ENCUENTRA TU ESTILO</p><h2>Explora por <em>categoría</em></h2></div><Link className="text-link" to="/catalogo">Ver toda la colección <ArrowRight size={18}/></Link></div>
      <div className="categories-grid">
        <Link className="category-tile category-woman" to="/catalogo?categoria=mujer"><span className="category-number">01 / STYLE</span><div><h3>Mujer</h3><span>Prendas para cada ocasión <MoveUpRight size={19}/></span></div><div className="category-figure figure-woman" aria-hidden="true"/></Link>
        <Link className="category-tile category-man" to="/catalogo?categoria=hombre"><span className="category-number">02 / STYLE</span><div><h3>Hombre</h3><span>El estilo está en los detalles <MoveUpRight size={19}/></span></div><div className="category-figure figure-man" aria-hidden="true"/></Link>
        <Link className="category-tile category-accessories" to="/catalogo?categoria=accesorios"><span className="category-number">03 / STYLE</span><div><h3>Accesorios</h3><span>Complementa tu look <MoveUpRight size={19}/></span></div><div className="category-figure figure-accessories" aria-hidden="true"/></Link>
      </div>
    </section>

    <section className="featured-section section-pad"><div className="container">
      <div className="section-heading"><div><p className="overline">SELECCIÓN ESPECIAL</p><h2>Favoritos de <em>LINO</em></h2></div><Link className="text-link" to="/catalogo">Explorar prendas <ArrowRight size={18}/></Link></div>
      {error && <div className="notice error"><strong>El catálogo no está disponible.</strong> {error}<br/>Ejecuta <code>npm run init:data</code> y luego <code>npm run dev</code>.</div>}
      {!error && productos.length === 0 && <p className="loading">Cargando nuestros productos...</p>}
      <div className="product-grid">{productos.slice(0, 4).map(producto => <ProductCard producto={producto} key={producto.id}/>)}</div>
    </div></section>

    <section className="philosophy container"><div className="philosophy-icon"><Sparkles size={34} strokeWidth={1.2}/></div><div><p className="overline">NUESTRA FILOSOFÍA</p><h2>Menos ruido.<br/><em>Más tú.</em></h2><p>Creemos en la ropa que se siente auténtica. Piezas sencillas, combinaciones sin esfuerzo y libertad para vestir como prefieras.</p><Link to="/nosotros" className="text-link">Conoce LINO <ArrowRight size={18}/></Link></div><div className="philosophy-art" aria-hidden="true"><span>L</span><span>i</span><span>n</span><span>o</span></div></section>
    <section className="bottom-cta"><div className="container bottom-cta-inner"><span className="overline">TU PRÓXIMO LOOK TE ESPERA</span><h2>Encuentra algo<br/><em>que hable de ti.</em></h2><Link to="/catalogo" className="btn btn-light">Ver colección <ArrowRight size={19}/></Link></div></section>
  </>;
}
