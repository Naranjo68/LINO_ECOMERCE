import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Download, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { crearPedido } from '../services/api.js';
import { soles } from '../services/formato.js';
import '../styles/checkout.css';

const ENVIO_BASE_CENTIMOS = 1200;
const IGV_PORCENTAJE = 18;

export default function Carrito() {
  const { items, cambiarCantidad, eliminar, vaciar, cantidadTotal, totalCentimos } = useCarrito();
  const { usuario, cargando: cargandoSesion } = useAuth();
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [errorBoleta, setErrorBoleta] = useState('');
  const [confirmacion, setConfirmacion] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [direccionEnvio, setDireccionEnvio] = useState('');
  const solicitudRef = useRef(null);
  const envioCentimos = cantidadTotal >= 2 ? 0 : ENVIO_BASE_CENTIMOS;
  const totalConEnvio = totalCentimos + envioCentimos;
  const igvCentimos = Math.round(totalConEnvio * IGV_PORCENTAJE / (100 + IGV_PORCENTAJE));
  const firmaCarrito = items.map(item => `${item.varianteId}:${item.cantidad}`).join('|');

  useEffect(() => {
    solicitudRef.current = null;
    setError('');
  }, [firmaCarrito]);

  useEffect(() => {
    if (!modalAbierto) return undefined;
    function cerrarConEscape(evento) {
      if (evento.key === 'Escape' && !procesando) setModalAbierto(false);
    }
    window.addEventListener('keydown', cerrarConEscape);
    return () => window.removeEventListener('keydown', cerrarConEscape);
  }, [modalAbierto, procesando]);

  function abrirConfirmacion() {
    setError('');
    setModalAbierto(true);
  }

  async function pagar(evento) {
    evento.preventDefault();
    if (!items.length || procesando || !usuario) return;
    setError('');
    setErrorBoleta('');
    setProcesando(true);
    try {
      if (!solicitudRef.current) solicitudRef.current = crypto.randomUUID();
      const respuesta = await crearPedido({
        items: items.map(item => ({ varianteId: item.varianteId, cantidad: item.cantidad })),
        claveSolicitud: solicitudRef.current,
        direccionEnvio,
      });
      solicitudRef.current = null;
      setConfirmacion(respuesta.pedido);
      setModalAbierto(false);
      vaciar();
      try {
        const { descargarBoleta } = await import('../services/boleta.js');
        descargarBoleta(respuesta.pedido);
      } catch (e) {
        setErrorBoleta(`El pedido se registró, pero no se pudo descargar la boleta: ${e.message}`);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setProcesando(false);
    }
  }

  async function reintentarDescarga() {
    try {
      const { descargarBoleta } = await import('../services/boleta.js');
      descargarBoleta(confirmacion);
      setErrorBoleta('');
    } catch (e) {
      setErrorBoleta(`No se pudo descargar la boleta: ${e.message}`);
    }
  }

  return <div className="container cart-page">
    <div className="page-heading"><p className="overline">TU SELECCIÓN</p><h1>Mi <em>carrito.</em></h1></div>
    {confirmacion && <div className="order-success" role="status">
      <CheckCircle2 size={37}/><div>
        <h2>¡Pedido de prueba registrado!</h2>
        <p>Boleta: <strong>{confirmacion.id}</strong></p>
        <p>Total con envío: <strong>{soles(confirmacion.totalCentimos)}</strong>. El pedido quedó registrado en esta demostración; no se realizó ningún cobro.</p>
        {errorBoleta && <div className="notice error" role="alert">{errorBoleta}</div>}
        <button type="button" className="text-link receipt-download" onClick={reintentarDescarga}><Download size={17}/> Descargar boleta.pdf</button>
        <Link className="text-link" to="/catalogo">Seguir explorando <ArrowRight size={17}/></Link>
      </div>
    </div>}
    {!items.length ? (!confirmacion && <div className="cart-empty">
      <ShoppingBag size={43} strokeWidth={1.3}/><h2>Tu carrito está esperando.</h2>
      <p>Descubre prendas que combinen contigo y empieza a crear tu selección.</p>
      <Link to="/catalogo" className="btn btn-dark">Explorar colección <ArrowRight size={19}/></Link>
    </div>) : <div className="cart-layout">
      <div className="cart-items">
        <div className="cart-items-label"><span>PRODUCTOS ({cantidadTotal} unidades)</span><span>DETALLES</span></div>
        {items.map(item => <article className="cart-item" key={item.varianteId}>
          <Link to={`/producto/${item.productoId}`}><img src={item.imagen} alt={`Ilustración de ${item.nombre}`}/></Link>
          <div className="cart-item-info">
            <Link to={`/producto/${item.productoId}`}><h2>{item.nombre}</h2></Link>
            <p>{item.color} / Talla {item.talla}</p>
            <p className="item-unit-price">{soles(item.precioCentimos)} c/u</p>
            <div className="quantity-control">
              <button type="button" aria-label={`Reducir cantidad de ${item.nombre}`} disabled={item.cantidad <= 1} onClick={() => cambiarCantidad(item.varianteId, item.cantidad - 1)}><Minus size={15}/></button>
              <span>{item.cantidad}</span>
              <button type="button" aria-label={`Aumentar cantidad de ${item.nombre}`} disabled={item.cantidad >= item.stock} onClick={() => cambiarCantidad(item.varianteId, item.cantidad + 1)}><Plus size={15}/></button>
            </div>
          </div>
          <div className="cart-item-side">
            <strong>{soles(item.cantidad * item.precioCentimos)}</strong>
            <button type="button" aria-label={`Eliminar ${item.nombre}`} onClick={() => eliminar(item.varianteId)}><Trash2 size={19}/></button>
          </div>
        </article>)}
      </div>
      <aside className="order-summary">
        <p className="overline">TU PEDIDO DE PRUEBA</p><h2>Resumen</h2>
        <div className="summary-row"><span>Subtotal</span><strong>{soles(totalCentimos)}</strong></div>
        <div className="summary-row"><span>Envío</span><strong>{envioCentimos ? soles(envioCentimos) : 'Gratis'}</strong></div>
        <div className="summary-total"><span>Total</span><strong>{soles(totalConEnvio)}</strong></div>
        <p className="summary-shipping">{cantidadTotal >= 2 ? '¡Tu envío es gratis por llevar 2 o más unidades!' : 'El envío cuesta S/ 12.00. Agrega otra unidad para obtener envío gratis.'}</p>
        <p className="summary-tax">IGV (18%) incluido: {soles(igvCentimos)}</p>
        <p className="summary-disclaimer">Esta es una demostración académica. No se realizará ningún cobro real.</p>
        {error && <div className="notice error" role="alert">{error}</div>}
        {cargandoSesion ? <button className="btn btn-dark summary-button" disabled>Verificando sesión...</button> : usuario ? (
          <button className="btn btn-dark summary-button" onClick={abrirConfirmacion}>Confirmar pedido de prueba <ArrowRight size={19}/></button>
        ) : (
          <Link to="/login" className="btn btn-dark summary-button">Inicia sesión para continuar <ArrowRight size={19}/></Link>
        )}
        {!usuario && !cargandoSesion && <p className="summary-login-hint">Inicia sesión para que la boleta incluya tus datos.</p>}
        <Link to="/catalogo" className="continue-link">Continuar comprando</Link>
      </aside>
    </div>}

    {modalAbierto && <div className="checkout-backdrop" onMouseDown={evento => { if (evento.target === evento.currentTarget && !procesando) setModalAbierto(false); }}>
      <section className="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <button type="button" className="checkout-close" aria-label="Cerrar ventana" disabled={procesando} onClick={() => setModalAbierto(false)}><X size={20}/></button>
        <p className="overline">ÚLTIMO PASO</p>
        <h2 id="checkout-title">Confirma tu <em>pedido.</em></h2>
        <p className="checkout-customer">{usuario?.nombre}<br/><span>{usuario?.correo}</span></p>
        <form onSubmit={pagar}>
          <label className="checkout-label" htmlFor="direccion-envio">Dirección de envío</label>
          <textarea id="direccion-envio" value={direccionEnvio} onChange={evento => { setDireccionEnvio(evento.target.value); solicitudRef.current = null; }} placeholder="Calle, número, distrito, ciudad" rows="3" maxLength="300" required minLength="8" disabled={procesando}/>
          <div className="receipt-preview">
            <h3>Resumen de boleta</h3>
            <div className="receipt-lines">
              {items.map(item => <div className="receipt-line" key={item.varianteId}>
                <span>{item.nombre} · {item.talla}, {item.color} × {item.cantidad}</span>
                <strong>{soles(item.cantidad * item.precioCentimos)}</strong>
              </div>)}
            </div>
            <div className="receipt-line"><span>Subtotal</span><strong>{soles(totalCentimos)}</strong></div>
            <div className="receipt-line"><span>Envío</span><strong>{envioCentimos ? soles(envioCentimos) : 'Gratis'}</strong></div>
            <div className="receipt-line receipt-total"><span>Total</span><strong>{soles(totalConEnvio)}</strong></div>
            <p>IGV 18% incluido: {soles(igvCentimos)}</p>
          </div>
          {error && <div className="notice error" role="alert">{error}</div>}
          <button type="submit" className="btn btn-dark checkout-pay" disabled={procesando || direccionEnvio.trim().length < 8}>
            {procesando ? 'Registrando pedido...' : 'Pagar y descargar boleta'} <ArrowRight size={18}/>
          </button>
          <p className="checkout-disclaimer">Pago simulado: no se solicitarán datos bancarios ni se realizará un cobro.</p>
        </form>
      </section>
    </div>}
  </div>;
}
