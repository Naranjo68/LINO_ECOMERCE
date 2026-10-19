import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { obtenerProductos } from '../services/api.js';

export default function Catalogo() {
  const [parametros, setParametros] = useSearchParams();
  const categoria = parametros.get('categoria') || 'todos';
  const buscar = parametros.get('buscar') || '';
  const [texto, setTexto] = useState(buscar);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [orden, setOrden] = useState('destacados');
  useEffect(() => { setTexto(buscar); }, [buscar]);
  useEffect(() => {
    let activo = true;
    setCargando(true); setError('');
    obtenerProductos({ categoria, buscar })
      .then(datos => { if (activo) setProductos(datos); })
      .catch(e => { if (activo) setError(e.message); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [categoria, buscar]);
  const ordenados = useMemo(() => {
    const lista = [...productos];
    if (orden === 'menor') lista.sort((a, b) => a.precioCentimos - b.precioCentimos);
    if (orden === 'mayor') lista.sort((a, b) => b.precioCentimos - a.precioCentimos);
    if (orden === 'nombre') lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return lista;
  }, [orden, productos]);
  function cambiarCategoria(valor) { const query = new URLSearchParams(parametros); if (valor === 'todos') query.delete('categoria'); else query.set('categoria', valor); setParametros(query); }
  function enviarBusqueda(e) { e.preventDefault(); const query = new URLSearchParams(parametros); if (texto.trim()) query.set('buscar', texto.trim()); else query.delete('buscar'); setParametros(query); }
  return <div className="catalog-page">
    <section className="internal-hero"><div className="container"><p className="overline">LA COLECCIÓN LINO · 2026</p><h1>Prendas con <em>identidad.</em></h1><p>Descubre nuevas formas de combinar lo que te gusta.</p></div></section>
    <div className="container catalog-content">
      <div className="catalog-tools"><div className="category-pills" role="group" aria-label="Filtrar por categoría">{[['todos','Todas las prendas'],['mujer','Mujer'],['hombre','Hombre'],['accesorios','Accesorios']].map(([id, nombre]) => <button key={id} type="button" className={`category-pill ${categoria === id ? 'selected' : ''}`} onClick={() => cambiarCategoria(id)}>{nombre}</button>)}</div>
        <div className="catalog-toolbar"><form onSubmit={enviarBusqueda} className="catalog-search"><Search size={18}/><input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Buscar en la colección..." aria-label="Buscar en catálogo"/>{texto && <button type="button" onClick={() => { setTexto(''); const query = new URLSearchParams(parametros); query.delete('buscar'); setParametros(query); }} aria-label="Borrar búsqueda"><X size={16}/></button>}</form><label className="sort-select"><SlidersHorizontal size={17}/><span className="sr-only">Ordenar por</span><select value={orden} onChange={e => setOrden(e.target.value)}><option value="destacados">Destacados</option><option value="menor">Menor precio</option><option value="mayor">Mayor precio</option><option value="nombre">Nombre A-Z</option></select></label></div>
      </div>
      <div className="results-label"><strong>{cargando ? '...' : ordenados.length}</strong> {ordenados.length === 1 ? 'prenda' : 'prendas'} encontradas <span>COLECCIÓN / LINO</span></div>
      {error ? <div className="notice error">{error} Asegúrate de ejecutar el servidor.</div> : cargando ? <p className="loading">Cargando colección...</p> : ordenados.length ? <div className="product-grid catalog-grid">{ordenados.map(producto => <ProductCard key={producto.id} producto={producto}/>)}</div> : <div className="empty-state"><h2>No encontramos coincidencias.</h2><p>Prueba otra búsqueda o explora todas nuestras prendas.</p><button className="btn btn-dark" onClick={() => { setTexto(''); setParametros({}); }}>Ver toda la colección</button></div>}
    </div>
  </div>;
}
