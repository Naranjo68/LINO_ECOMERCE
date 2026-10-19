import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { obtenerProductos } from '../services/api.js';

/**
 * Hook personalizado para gestionar el estado del catálogo:
 * - Parámetros de URL (categoría y búsqueda)
 * - Carga de productos desde la API
 * - Ordenamiento en el cliente
 * - Acciones de filtrado y búsqueda
 *
 * @returns {object} Estado y acciones del catálogo
 */
export function useCatalogo() {
  const [parametros, setParametros] = useSearchParams();
  const categoria = parametros.get('categoria') || 'todos';
  const buscar = parametros.get('buscar') || '';

  const [texto, setTexto] = useState(buscar);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [orden, setOrden] = useState('destacados');

  // Sincroniza el campo de texto con el parámetro de URL
  useEffect(() => {
    setTexto(buscar);
  }, [buscar]);

  // Carga productos desde la API cuando cambia categoría o búsqueda
  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError('');

    obtenerProductos({ categoria, buscar })
      .then(datos => {
        if (activo) setProductos(datos);
      })
      .catch(e => {
        if (activo) setError(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => { activo = false; };
  }, [categoria, buscar]);

  // Ordena los productos sin mutar el array original
  const ordenados = useMemo(() => {
    const lista = [...productos];
    if (orden === 'menor') lista.sort((a, b) => a.precioCentimos - b.precioCentimos);
    if (orden === 'mayor') lista.sort((a, b) => b.precioCentimos - a.precioCentimos);
    if (orden === 'nombre') lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return lista;
  }, [orden, productos]);

  // Cambia la categoría activa en la URL
  function cambiarCategoria(valor) {
    const query = new URLSearchParams(parametros);
    if (valor === 'todos') query.delete('categoria');
    else query.set('categoria', valor);
    setParametros(query);
  }

  // Aplica la búsqueda como parámetro de URL
  function enviarBusqueda(e) {
    e.preventDefault();
    const query = new URLSearchParams(parametros);
    if (texto.trim()) query.set('buscar', texto.trim());
    else query.delete('buscar');
    setParametros(query);
  }

  // Limpia el campo de búsqueda y su parámetro de URL
  function limpiarBusqueda() {
    setTexto('');
    const query = new URLSearchParams(parametros);
    query.delete('buscar');
    setParametros(query);
  }

  // Vuelve al estado inicial (sin filtros ni búsqueda)
  function verTodo() {
    setTexto('');
    setParametros({});
  }

  return {
    // Estado
    categoria,
    texto,
    setTexto,
    ordenados,
    cargando,
    error,
    orden,
    setOrden,
    // Acciones
    cambiarCategoria,
    enviarBusqueda,
    limpiarBusqueda,
    verTodo,
  };
}
