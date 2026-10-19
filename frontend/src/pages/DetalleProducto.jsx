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
  
  // Estados para el control de cantidad y el mensaje de éxito (Requerido por Jira)
  const [cantidad, setCantidad] = useState(1);
  const [mensajeExito, setMensajeExito] = useState('');

  const { agregar } = useCarrito();

  useEffect(() => {
    let activo = true;
    setProducto(null); setError(''); setTalla(''); setColor(''); setCantidad(1); setMensajeExito('');
    obtenerProducto(id).then(p => { 
      if (!activo) return; 
      setProducto(p); 
      const primera = p.variantes.find(v => v.stock > 0) || p.variantes[0]; 
      setTalla(primera?.talla || ''); 
      setColor(primera?.color || ''); 
    }).catch(e => { if (activo) setError(e.message); });
    return () => { activo = false; };
  }, [id]);

  const tallas = useMemo(() => [...new Set(producto?.variantes.map(v => v.talla) || [])], [producto]);
  const colores = useMemo(() => [...new Set(producto?.variantes.map(v => v.color) || [])], [producto]);
  const variante = producto?.variantes.find(v => v.talla === talla && v.color === color);

  // Lógica para los botones de sumar y restar cantidad
  const cambiarCantidad = (operacion) => {
    if (operacion === 'sumar' && cantidad < (variante?.stock || 10)) setCantidad(cantidad + 1);
    if (operacion === 'restar' && cantidad > 1) setCantidad(cantidad - 1);
  };

  // Lógica del botón de agregar
  const manejarAgregar = () => {
    // Validación exigida por el Jira
    if (!talla || !color) {
      alert('Por favor, selecciona una talla y un color antes de agregar.');
      return;
    }
    
    if (!variante || variante.stock <= 0) return;

    // Llamamos a la función de Samuel (solo acepta producto y variante)
    agregar(producto, variante); 
    
    // Mostramos el mensaje de confirmación en pantalla
    setMensajeExito(`¡Se agregó ${producto.nombre} al carrito!`);
    
    // El mensaje desaparece a los 3 segundos
    setTimeout(() => setMensajeExito(''), 3000);
  };

  if (error) return <div className="container detail-status"><h2>No pudimos cargar la prenda</h2><p>{error}</p><Link to="/catalogo" className="btn btn-dark">Volver a la colección</Link></div>;
  if (!producto) return <div className="container detail-status">Cargando prenda...</div>;
  
  return <div className="container product-detail">
    <nav className="breadcrumbs" aria-label="Ruta de navegación"><Link to="/">Inicio</Link><span>/</span><Link to="/catalogo">Colección</Link><span>/</span>{producto.nombre}</nav>
    
    <div className="detail-layout">
      <div className="detail-image">
        <img src={producto.imagen} alt={`Ilustración de ${producto.nombre}`}/>
        {producto.etiqueta && <span className="product-tag">{producto.etiqueta}</span>}
      </div>
      
      <div className="detail-info">
        <p className="overline">LINO / {nombreCategoria(producto.categoria).toUpperCase()}</p>
        <h1>{producto.nombre}</h1>
        <p className="detail-price">{soles(producto.precioCentimos)}</p>
        <p className="detail-description">{producto.descripcion}</p>
        <div className="detail-divider"/>
        
        {/* SELECTOR DE COLOR */}
        <div className="variant-block">
          <h3>Color: <span>{color || 'Selecciona uno'}</span></h3>
          <div className="size-options">
            {colores.map(valor => (
              <button key={valor} type="button" onClick={() => { setColor(valor); const existe = producto.variantes.some(v => v.color === valor && v.talla === talla); if (!existe) setTalla(producto.variantes.find(v => v.color === valor)?.talla || ''); }} className={color === valor ? 'chosen' : ''}>
                {valor}
              </button>
            ))}
          </div>
        </div>
        
        {/* SELECTOR DE TALLA */}
        <div className="variant-block">
          <h3>Talla: <span>{talla || 'Selecciona una'}</span></h3>
          <div className="size-options">
            {tallas.map(valor => { 
              const v = producto.variantes.find(item => item.talla === valor && item.color === color); 
              return (
                <button key={valor} type="button" className={`${talla === valor ? 'chosen' : ''} ${!v || !v.stock ? 'unavailable' : ''}`} onClick={() => setTalla(valor)} disabled={!v || !v.stock} title={!v || !v.stock ? 'Agotado' : ''}>
                  {valor}
                </button>
              ); 
            })}
          </div>
        </div>
        
        {/* CONTROL DE CANTIDAD (NUEVO) */}
        <div className="variant-block" style={{ marginTop: '20px' }}>
          <h3>Cantidad:</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
            <button onClick={() => cambiarCantidad('restar')} disabled={cantidad <= 1} style={{ padding: '5px 15px', cursor: cantidad <= 1 ? 'not-allowed' : 'pointer', fontSize: '18px' }}>-</button>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{cantidad}</span>
            <button onClick={() => cambiarCantidad('sumar')} disabled={cantidad >= (variante?.stock || 10)} style={{ padding: '5px 15px', cursor: cantidad >= (variante?.stock || 10) ? 'not-allowed' : 'pointer', fontSize: '18px' }}>+</button>
          </div>
        </div>

        <p className={`availability ${variante?.stock ? 'has-stock' : ''}`}>
          {variante?.stock ? <><Check size={16}/> Disponible · {variante.stock} unidades</> : 'Esta combinación se encuentra agotada'}
        </p>
        
        {/* BOTÓN AGREGAR AL CARRITO */}
        <button type="button" className="btn btn-dark detail-add" disabled={!variante || variante.stock <= 0} onClick={manejarAgregar}>
          Agregar al carrito <ArrowRight size={19}/>
        </button>
        
        {/* MENSAJE DE CONFIRMACIÓN VISIBLE (Requerido por Jira) */}
        {mensajeExito && (
          <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', fontWeight: 'bold', textAlign: 'center' }}>
            {mensajeExito}
          </div>
        )}

        <div className="detail-help">
          <PackageCheck size={19}/>
          <span>Pedido de demostración. No se realizan cobros reales.</span>
        </div>
        
        <Link to="/catalogo" className="back-link">
          <ArrowLeft size={17}/> Seguir explorando
        </Link>
      </div>
    </div>
  </div>;
}