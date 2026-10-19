import { jsPDF } from 'jspdf';
import { soles } from './formato.js';

const VERDE = [41, 56, 46];
const TINTA = [37, 48, 40];
const ARENA = [243, 239, 232];
const GRIS = [112, 119, 109];
const ACENTO = [174, 129, 98];

export function descargarBoleta(pedido) {
  if (!pedido?.id || !pedido.cliente || !Array.isArray(pedido.lineas)) {
    throw new Error('No se encontraron los datos completos del pedido.');
  }

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const ancho = pdf.internal.pageSize.getWidth();
  const alto = pdf.internal.pageSize.getHeight();
  const margen = 17;
  const anchoContenido = ancho - margen * 2;
  let y;

  function encabezado() {
    pdf.setFillColor(...VERDE);
    pdf.rect(0, 0, ancho, 38, 'F');
    pdf.setFont('times', 'bold');
    pdf.setFontSize(27);
    pdf.setTextColor(255, 255, 255);
    pdf.text('LINO', margen, 20);
    const anchoLogo = pdf.getTextWidth('LINO');
    pdf.setTextColor(...ACENTO);
    pdf.text('.', margen + anchoLogo, 20);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(237, 238, 231);
    pdf.text('ESTILO PARA TODOS LOS DÍAS', margen, 29);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.text('BOLETA DE VENTA', ancho - margen, 18, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('COMPROBANTE DEMOSTRATIVO', ancho - margen, 25, { align: 'right' });
    y = 48;
  }

  function paginaSiHaceFalta(altura) {
    if (y + altura > alto - 20) {
      pdf.addPage();
      encabezado();
    }
  }

  function textoEnvuelto(valor, x, yy, anchoMax, tamano = 9, estilo = 'normal') {
    pdf.setFont('helvetica', estilo);
    pdf.setFontSize(tamano);
    const lineas = pdf.splitTextToSize(String(valor), anchoMax);
    pdf.text(lineas, x, yy);
    return lineas.length;
  }

  encabezado();
  pdf.setTextColor(...TINTA);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.text('Gracias por tu compra', margen, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...GRIS);
  pdf.text(`N.° ${pedido.id}`, ancho - margen, y, { align: 'right' });
  y += 7;
  pdf.text(`Fecha: ${new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(pedido.fecha))}`, margen, y);
  y += 9;

  const altoFicha = 37;
  pdf.setFillColor(...ARENA);
  pdf.roundedRect(margen, y, anchoContenido, altoFicha, 2, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...ACENTO);
  pdf.text('DATOS DEL CLIENTE', margen + 6, y + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...TINTA);
  pdf.text(pedido.cliente.nombre, margen + 6, y + 16);
  pdf.setTextColor(...GRIS);
  pdf.text(pedido.cliente.correo, margen + 6, y + 22);
  const direccionLineas = pdf.splitTextToSize(`Envío: ${pedido.direccionEnvio || 'No especificada'}`, anchoContenido - 12);
  pdf.text(direccionLineas.slice(0, 2), margen + 6, y + 29);
  y += altoFicha + 11;

  pdf.setTextColor(...TINTA);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('DETALLE DE LA COMPRA', margen, y);
  y += 6;

  const columnas = {
    producto: margen + 4,
    variante: margen + 84,
    cantidad: margen + 124,
    unitario: margen + 143,
    subtotal: ancho - margen - 4,
  };
  const altoCabecera = 10;
  pdf.setFillColor(...VERDE);
  pdf.roundedRect(margen, y, anchoContenido, altoCabecera, 1.5, 1.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  pdf.text('PRODUCTO', columnas.producto, y + 6.5);
  pdf.text('TALLA / COLOR', columnas.variante, y + 6.5);
  pdf.text('CANT.', columnas.cantidad, y + 6.5, { align: 'center' });
  pdf.text('PRECIO', columnas.unitario, y + 6.5, { align: 'right' });
  pdf.text('IMPORTE', columnas.subtotal, y + 6.5, { align: 'right' });
  y += altoCabecera + 2;

  pedido.lineas.forEach((linea, indice) => {
    const nombreLineas = pdf.splitTextToSize(linea.nombreProducto, 76);
    const varianteLineas = pdf.splitTextToSize(`${linea.talla} / ${linea.color}`, 36);
    const altoFila = Math.max(nombreLineas.length, varianteLineas.length, 1) * 4.3 + 6;
    paginaSiHaceFalta(altoFila + 2);
    if (indice % 2 === 0) {
      pdf.setFillColor(249, 248, 244);
      pdf.rect(margen, y, anchoContenido, altoFila, 'F');
    }
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...TINTA);
    pdf.text(nombreLineas, columnas.producto, y + 5);
    pdf.setTextColor(...GRIS);
    pdf.text(varianteLineas, columnas.variante, y + 5);
    pdf.setTextColor(...TINTA);
    pdf.text(String(linea.cantidad), columnas.cantidad, y + 5, { align: 'center' });
    pdf.text(soles(linea.precioUnitarioCentimos), columnas.unitario, y + 5, { align: 'right' });
    pdf.setFont('helvetica', 'bold');
    pdf.text(soles(linea.subtotalCentimos), columnas.subtotal, y + 5, { align: 'right' });
    y += altoFila;
  });

  y += 7;
  const anchoTotales = 79;
  const xEtiqueta = ancho - margen - anchoTotales;
  const xImporte = ancho - margen;
  function filaTotal(etiqueta, importe, negrita = false, destacada = false) {
    paginaSiHaceFalta(9);
    if (destacada) {
      pdf.setFillColor(...VERDE);
      pdf.roundedRect(xEtiqueta - 4, y - 5.5, anchoTotales + 4, 12, 1.5, 1.5, 'F');
    }
    pdf.setFont('helvetica', negrita ? 'bold' : 'normal');
    pdf.setFontSize(destacada ? 10 : 9);
    pdf.setTextColor(...(destacada ? [255, 255, 255] : TINTA));
    pdf.text(etiqueta, xEtiqueta, y + 1);
    pdf.text(soles(importe), xImporte, y + 1, { align: 'right' });
    y += destacada ? 15 : 8;
  }

  filaTotal('Subtotal de productos', pedido.subtotalCentimos);
  filaTotal('Envío', pedido.envioCentimos);
  filaTotal('IGV (18%)', pedido.igvCentimos);
  y += 1;
  filaTotal('TOTAL A PAGAR', pedido.totalCentimos, true, true);

  y += 8;
  paginaSiHaceFalta(15);
  pdf.setDrawColor(220, 220, 212);
  pdf.line(margen, y, ancho - margen, y);
  y += 7;
  const aviso = 'Documento generado por una tienda demostrativa. No es un comprobante tributario y no acredita un pago real.';
  textoEnvuelto(aviso, margen, y, anchoContenido, 8);

  const paginas = pdf.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina += 1) {
    pdf.setPage(pagina);
    pdf.setDrawColor(230, 228, 223);
    pdf.line(margen, alto - 13, ancho - margen, alto - 13);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(...GRIS);
    pdf.text('LINO · COMPROBANTE DEMOSTRATIVO', margen, alto - 8);
    pdf.text(`${pagina} / ${paginas}`, ancho - margen, alto - 8, { align: 'right' });
  }

  pdf.save('boleta.pdf');
}
