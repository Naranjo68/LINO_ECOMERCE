import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, PackageCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext.jsx';
import { obtenerProducto } from '../services/api.js';
import { nombreCategoria, soles } from '../services/formato.js';

export default function DetalleProducto() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState('');
  const [talla, setTalla] = useState('');
  const [color, setColor] = useState('');
  const { agregar } = useCarrito();
  useEffect(() => {
    let activo = true;
    setProducto(null); setError(''); setTalla(''); setColor('');
    obtenerProducto(id).then(p => { if (!activo) return; setProducto(p); const primera = p.variantes.find(v => v.stock > 0) || p.variantes[0]; setTalla(primera?.talla || ''); setColor(primera?.color || ''); }).catch(e => { if (activo) setError(e.message); });
    return () => { activo = false; };
  }, [id]);
  const tallas = useMemo(() => [...new Set(producto?.variantes.map(v => v.talla) || [])], [producto]);
  const colores = useMemo(() => [...new Set(producto?.variantes.map(v => v.color) || [])], [producto]);
  const variante = producto?.variantes.find(v => v.talla === talla && v.color === color);
  if (error) return <div className="container detail-status"><h2>No pudimos cargar la prenda</h2><p>{error}</p><Link to="/catalogo" className="btn btn-dark">Volver a la colección</Link></div>;
  if (!producto) return <div className="container detail-status">Cargando prenda...</div>;
  return <div className="container product-detail">
    <nav className="breadcrumbs" aria-label="Ruta de navegación"><Link to="/">Inicio</Link><span>/</span><Link to="/catalogo">Colección</Link><span>/</span>{producto.nombre}</nav>
    <div className="detail-layout"><div className="detail-image"><img src={producto.imagen} alt={`Ilustración de ${producto.nombre}`}/>{producto.etiqueta && <span className="product-tag">{producto.etiqueta}</span>}</div>
      <div className="detail-info"><p className="overline">LINO / {nombreCategoria(producto.categoria).toUpperCase()}</p><h1>{producto.nombre}</h1><p className="detail-price">{soles(producto.precioCentimos)}</p><p className="detail-description">{producto.descripcion}</p><div className="detail-divider"/>
        <div className="variant-block"><h3>Color: <span>{color || 'Selecciona uno'}</span></h3><div className="size-options">{colores.map(valor => <button key={valor} type="button" onClick={() => { setColor(valor); const existe = producto.variantes.some(v => v.color === valor && v.talla === talla); if (!existe) setTalla(producto.variantes.find(v => v.color === valor)?.talla || ''); }} className={color === valor ? 'chosen' : ''}>{valor}</button>)}</div></div>
        <div className="variant-block"><h3>Talla: <span>{talla || 'Selecciona una'}</span></h3><div className="size-options">{tallas.map(valor => { const v = producto.variantes.find(item => item.talla === valor && item.color === color); return <button key={valor} type="button" className={`${talla === valor ? 'chosen' : ''} ${!v || !v.stock ? 'unavailable' : ''}`} onClick={() => setTalla(valor)} disabled={!v || !v.stock} title={!v || !v.stock ? 'Agotado' : ''}>{valor}</button>; })}</div></div>
        <p className={`availability ${variante?.stock ? 'has-stock' : ''}`}>{variante?.stock ? <><Check size={16}/> Disponible · {variante.stock} unidades</> : 'Esta combinación se encuentra agotada'}</p>
        <button type="button" className="btn btn-dark detail-add" disabled={!variante || variante.stock <= 0} onClick={() => agregar(producto, variante)}>Agregar al carrito <ArrowRight size={19}/></button>
        <div className="detail-help"><PackageCheck size={19}/><span>Pedido de demostración. No se realizan cobros reales.</span></div>
        <Link to="/catalogo" className="back-link"><ArrowLeft size={17}/> Seguir explorando</Link>
      </div>
    </div>
  </div>;
}
