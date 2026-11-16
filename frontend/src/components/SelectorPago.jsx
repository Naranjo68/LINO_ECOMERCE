import { Banknote, Check, CreditCard, Smartphone } from 'lucide-react';
import { METODOS_PAGO } from '../services/metodosPago.js';

const ICONOS = { yape: Smartphone, plin: Smartphone, tarjeta: CreditCard, efectivo: Banknote };

export default function SelectorPago({ valor, onChange, deshabilitado = false }) {
  const seleccionado = METODOS_PAGO.find(m => m.id === valor);
  return <fieldset className="payment-fieldset" disabled={deshabilitado}>
    <legend className="payment-heading">1. Selecciona tu método de pago <span>*</span></legend>
    <p className="payment-subheading">Escoge cómo prefieres pagar. Solo es una demostración académica.</p>
    <div className="payment-options">
      {METODOS_PAGO.map(metodo => {
        const Icono = ICONOS[metodo.id];
        const activo = metodo.id === valor;
        return <label key={metodo.id} className={`payment-option payment-${metodo.id}${activo ? ' active' : ''}`}>
          <input type="radio" name="metodoPago" value={metodo.id} checked={activo} onChange={() => onChange(metodo.id)} required />
          <span className="payment-icon" aria-hidden="true"><Icono size={23} strokeWidth={1.75}/></span>
          <span className="payment-copy"><strong>{metodo.nombre}</strong><small>{metodo.subtitulo}</small></span>
          <span className="payment-check" aria-hidden="true">{activo ? <Check size={14}/> : null}</span>
        </label>;
      })}
    </div>
    {seleccionado ? <div className="payment-selected" role="status"><strong>{seleccionado.nombre} · Modo prueba</strong><p>{seleccionado.detalle}</p></div> :
      <div className="payment-selected payment-selected-idle">Selecciona una de las cuatro opciones para continuar.</div>}
  </fieldset>;
}
