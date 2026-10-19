import { jsPDF } from 'jspdf';
import { soles } from './formato.js';

export function descargarBoleta(pedido) {
  if (!pedido?.id || !pedido.cliente || !Array.isArray(pedido.lineas)) {
    throw new Error('No se encontraron los datos completos del pedido.');
  }

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const ancho = pdf.internal.pageSize.getWidth();
  const margen = 18;
  const anchoContenido = ancho - margen * 2;
  let y = 20;

  function espacio(altura) {
    if (y + altura > 278) {
      pdf.addPage();
      y = 20;
    }
  }

  function texto(valor, x, opciones = {}) {
    const interlineado = opciones.interlineado || 5;
    const lineas = pdf.splitTextToSize(String(valor), opciones.ancho || anchoContenido);
    espacio(lineas.length * interlineado + 2);
    pdf.text(lineas, x, y);
    y += lineas.length * interlineado;
  }

  pdf.setFillColor(41, 56, 46);
  pdf.rect(0, 0, ancho, 34, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(21);
  pdf.text('LINO', margen, 17);
  pdf.setFontSize(10);
  pdf.text('BOLETA DE VENTA · DEMOSTRACIÓN', margen, 26);
  pdf.setTextColor(37, 48, 40);
  y = 45;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  texto(`Comprobante: ${pedido.id}`, margen);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  texto(`Fecha: ${new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(pedido.fecha))}`, margen);
  y += 3;

  pdf.setFont('helvetica', 'bold');
  texto('DATOS DEL CLIENTE', margen);
  pdf.setFont('helvetica', 'normal');
  texto(`Nombre: ${pedido.cliente.nombre}`, margen);
  texto(`Correo: ${pedido.cliente.correo}`, margen);
  texto(`Dirección de envío: ${pedido.direccionEnvio}`, margen);
  y += 4;

  pdf.setDrawColor(220, 220, 212);
  pdf.line(margen, y, ancho - margen, y);
  y += 7;
  pdf.setFont('helvetica', 'bold');
  texto('DETALLE DE PRODUCTOS', margen);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);

  pedido.lineas.forEach(linea => {
    const detalle = `${linea.nombreProducto} · Talla ${linea.talla}, color ${linea.color} · ${linea.cantidad} × ${soles(linea.precioUnitarioCentimos)}`;
    const lineas = pdf.splitTextToSize(detalle, anchoContenido - 35);
    espacio(lineas.length * 4.5 + 10);
    pdf.text(lineas, margen, y);
    pdf.text(soles(linea.subtotalCentimos), ancho - margen, y, { align: 'right' });
    y += lineas.length * 4.5 + 3;
  });

  y += 3;
  pdf.line(margen, y, ancho - margen, y);
  y += 8;
  pdf.setFontSize(10);
  const fila = (etiqueta, importe, negrita = false) => {
    espacio(8);
    pdf.setFont('helvetica', negrita ? 'bold' : 'normal');
    pdf.text(etiqueta, margen, y);
    pdf.text(soles(importe), ancho - margen, y, { align: 'right' });
    y += 7;
  };
  fila('Subtotal de productos', pedido.subtotalCentimos);
  fila('Envío', pedido.envioCentimos);
  fila('IGV (18%, incluido)', pedido.igvCentimos);
  y += 1;
  pdf.setDrawColor(41, 56, 46);
  pdf.line(margen, y, ancho - margen, y);
  y += 8;
  fila('TOTAL', pedido.totalCentimos, true);

  y += 9;
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(9);
  pdf.setTextColor(110, 115, 107);
  texto('Comprobante generado por una tienda demostrativa. No es un comprobante tributario y no acredita un pago real.', margen);
  pdf.save('boleta.pdf');
}
