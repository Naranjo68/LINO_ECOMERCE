import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { useCatalogo } from '../services/useCatalogo.js';

// Categorías disponibles en el catálogo
const CATEGORIAS = [
  ['todos', 'Todas las prendas'],
  ['mujer', 'Mujer'],
  ['hombre', 'Hombre'],
  ['accesorios', 'Accesorios'],
];

// Opciones de ordenamiento disponibles
const OPCIONES_ORDEN = [
  { valor: 'destacados', label: 'Destacados' },
  { valor: 'menor',      label: 'Menor precio' },
  { valor: 'mayor',      label: 'Mayor precio' },
  { valor: 'nombre',     label: 'Nombre A-Z' },
];

export default function Catalogo() {
  const {
    categoria, texto, setTexto,
    ordenados, cargando, error,
    orden, setOrden,
    cambiarCategoria, enviarBusqueda,
    limpiarBusqueda, verTodo,
  } = useCatalogo();

  return (
    <div className="catalog-page">

      {/* ── Hero interno del catálogo ── */}
      <section className="internal-hero">
        <div className="container">
          <p className="overline">LA COLECCIÓN LINO · 2026</p>
          <h1>Prendas con <em>identidad.</em></h1>
          <p>Descubre nuevas formas de combinar lo que te gusta.</p>
        </div>
      </section>

      <div className="container catalog-content">

        {/* ── Herramientas: filtros y búsqueda ── */}
        <div className="catalog-tools">

          {/* Filtros por categoría */}
          <div className="category-pills" role="group" aria-label="Filtrar por categoría">
            {CATEGORIAS.map(([id, nombre]) => (
              <button
                key={id}
                type="button"
                className={`category-pill${categoria === id ? ' selected' : ''}`}
                onClick={() => cambiarCategoria(id)}
              >
                {nombre}
              </button>
            ))}
          </div>

          {/* Barra de búsqueda y ordenamiento */}
          <div className="catalog-toolbar">
            <form onSubmit={enviarBusqueda} className="catalog-search">
              <Search size={18} />
              <input
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder="Buscar en la colección..."
                aria-label="Buscar en catálogo"
              />
              {texto && (
                <button type="button" onClick={limpiarBusqueda} aria-label="Borrar búsqueda">
                  <X size={16} />
                </button>
              )}
            </form>

            <label className="sort-select">
              <SlidersHorizontal size={17} />
              <span className="sr-only">Ordenar por</span>
              <select value={orden} onChange={e => setOrden(e.target.value)}>
                {OPCIONES_ORDEN.map(({ valor, label }) => (
                  <option key={valor} value={valor}>{label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* ── Contador de resultados ── */}
        <div className="results-label">
          <span>
            <strong>{cargando ? '...' : ordenados.length}</strong>{' '}
            {ordenados.length === 1 ? 'prenda' : 'prendas'} encontradas
          </span>
          <span>COLECCIÓN / LINO</span>
        </div>

        {/* ── Área de contenido principal ── */}
        {error ? (
          <div className="notice error">
            {error} Asegúrate de ejecutar el servidor.
          </div>
        ) : cargando ? (
          <p className="loading">Cargando colección...</p>
        ) : ordenados.length ? (
          <div className="product-grid catalog-grid">
            {ordenados.map(producto => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No encontramos coincidencias.</h2>
            <p>Prueba otra búsqueda o explora todas nuestras prendas.</p>
            <button className="btn btn-dark" onClick={verTodo}>
              Ver toda la colección
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
