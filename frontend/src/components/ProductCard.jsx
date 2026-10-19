import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { soles, nombreCategoria } from '../services/formato.js';

/**
 * Tarjeta de producto individual para el catálogo.
 * Muestra imagen, categoría, nombre, precio y estado de disponibilidad.
 */
export default function ProductCard({ producto }) {
  const disponible = producto.variantes.some(v => v.stock > 0);

  return (
    <article className="product-card">
      {/* Imagen con enlace al detalle */}
      <Link
        className="product-image-wrap"
        to={`/producto/${producto.id}`}
        aria-label={`Ver ${producto.nombre}`}
      >
        <img
          src={producto.imagen}
          alt={`Ilustración de ${producto.nombre}`}
          loading="lazy"
        />
        {producto.etiqueta && (
          <span className="product-tag">{producto.etiqueta}</span>
        )}
        <span className="image-arrow">
          <ArrowUpRight size={20} />
        </span>
      </Link>

      {/* Información del producto */}
      <div className="product-meta">
        <div>
          <span className="product-category">
            {nombreCategoria(producto.categoria)}
          </span>
          <Link to={`/producto/${producto.id}`}>
            <h3>{producto.nombre}</h3>
          </Link>
        </div>
        <p className="price">{soles(producto.precioCentimos)}</p>
      </div>

      {/* Indicador de agotado */}
      {!disponible && (
        <span className="sold-out">Temporalmente agotado</span>
      )}
    </article>
  );
}
