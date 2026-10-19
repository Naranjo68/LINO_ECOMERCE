import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext.jsx';
import { crearPedido } from '../services/api.js';
import { soles } from '../services/formato.js';

export default function Carrito() {
  const { items, cambiarCantidad, eliminar, vaciar, totalCentimos } = useCarrito();
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [confirmacion, setConfirmacion] = useState(null);
  const solicitudRef = useRef(null);
  const firmaCarrito = items.map(item => `${item.varianteId}:${item.cantidad}`).join('|');
  useEffect(() => { solicitudRef.current = null; setError(''); }, [firmaCarrito]);
  async function confirmar() {
    if (!items.length || procesando) return;
    setError(''); setProcesando(true);
    try {
      if (!solicitudRef.current) solicitudRef.current = crypto.randomUUID();
      const respuesta = await crearPedido(items.map(i => ({ varianteId: i.varianteId, cantidad: i.cantidad })), solicitudRef.current);
      setConfirmacion(respuesta.pedido);
      solicitudRef.current = null;
      vaciar();
    } catch (e) { setError(e.message); } finally { setProcesando(false); }
  }
  return <div className="container cart-page"><div className="page-heading"><p className="overline">TU SELECCIÓN</p><h1>Mi <em>carrito.</em></h1></div>
    {confirmacion && <div className="order-success" role="status"><CheckCircle2 size={37}/><div><h2>¡Pedido de prueba registrado!</h2><p>Identificador: <strong>{confirmacion.id}</strong></p><p>Importe simulado: <strong>{soles(confirmacion.totalCentimos)}</strong>. Los datos se guardaron en el JSON del servidor; no se realizó ningún pago.</p><Link className="text-link" to="/catalogo">Seguir explorando <ArrowRight size={17}/></Link></div></div>}
    {!items.length ? (!confirmacion && <div className="cart-empty"><ShoppingBag size={43} strokeWidth={1.3}/><h2>Tu carrito está esperando.</h2><p>Descubre prendas que combinen contigo y empieza a crear tu selección.</p><Link to="/catalogo" className="btn btn-dark">Explorar colección <ArrowRight size={19}/></Link></div>) : <div className="cart-layout">
      <div className="cart-items"><div className="cart-items-label"><span>PRODUCTOS ({items.length})</span><span>DETALLES</span></div>{items.map(item => <article className="cart-item" key={item.varianteId}><Link to={`/producto/${item.productoId}`}><img src={item.imagen} alt={`Ilustración de ${item.nombre}`}/></Link><div className="cart-item-info"><Link to={`/producto/${item.productoId}`}><h2>{item.nombre}</h2></Link><p>{item.color} / Talla {item.talla}</p><p className="item-unit-price">{soles(item.precioCentimos)} c/u</p><div className="quantity-control"><button type="button" aria-label={`Reducir cantidad de ${item.nombre}`} disabled={item.cantidad <= 1} onClick={() => cambiarCantidad(item.varianteId, item.cantidad - 1)}><Minus size={15}/></button><span>{item.cantidad}</span><button type="button" aria-label={`Aumentar cantidad de ${item.nombre}`} disabled={item.cantidad >= item.stock} onClick={() => cambiarCantidad(item.varianteId, item.cantidad + 1)}><Plus size={15}/></button></div></div><div className="cart-item-side"><strong>{soles(item.cantidad * item.precioCentimos)}</strong><button type="button" aria-label={`Eliminar ${item.nombre}`} onClick={() => eliminar(item.varianteId)}><Trash2 size={19}/></button></div></article>)}</div>
      <aside className="order-summary"><p className="overline">TU PEDIDO DE PRUEBA</p><h2>Resumen</h2><div className="summary-row"><span>Subtotal</span><strong>{soles(totalCentimos)}</strong></div><div className="summary-row"><span>Envío</span><span>No incluido</span></div><div className="summary-total"><span>Total</span><strong>{soles(totalCentimos)}</strong></div><p className="summary-disclaimer">Esta es una demostración académica. No hay pagos, envíos ni compras comerciales.</p>{error && <div className="notice error" role="alert">{error}</div>}<button className="btn btn-dark summary-button" disabled={procesando} onClick={confirmar}>{procesando ? 'Registrando...' : 'Confirmar pedido de prueba'} <ArrowRight size={19}/></button><Link to="/catalogo" className="continue-link">Continuar comprando</Link></aside>
    </div>}
  </div>;
}
