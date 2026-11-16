/** Métodos de pago de demostración; no conectados a procesadores reales. */
export const METODOS_PAGO = [
  { id: 'yape', nombre: 'Yape', subtitulo: 'Billetera digital', detalle: 'Pago simulado con Yape. No se muestra un QR ni un número real; el pedido queda registrado sin transferencia.' },
  { id: 'plin', nombre: 'Plin', subtitulo: 'Transferencia móvil', detalle: 'Pago simulado con Plin. No se solicita transferencia ni comprobante real.' },
  { id: 'tarjeta', nombre: 'Tarjeta', subtitulo: 'Débito o crédito', detalle: 'Tarjeta en modo demostración. No introduzcas números de tarjeta, fechas de vencimiento ni CVV.' },
  { id: 'efectivo', nombre: 'Efectivo', subtitulo: 'Al recibir el pedido', detalle: 'Pago en efectivo al recibir (simulación). No se realizará ninguna entrega ni cobro real.' },
];
export const nombreMetodoPago = id => METODOS_PAGO.find(m => m.id === id)?.nombre || 'Sin seleccionar';
