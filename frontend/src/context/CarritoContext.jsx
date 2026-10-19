import { createContext, useContext, useEffect, useState } from 'react';

const CarritoContext = createContext(null);
const STORAGE = 'lino_carrito_v1';
const desdeAlmacenamiento = () => {
  try {
    const anterior = JSON.parse(localStorage.getItem(STORAGE) || '[]');
    return Array.isArray(anterior) ? anterior.filter(item => item && item.varianteId && Number.isInteger(item.cantidad) && item.cantidad > 0) : [];
  } catch { return []; }
};

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(desdeAlmacenamiento);
  const [mensaje, setMensaje] = useState('');
  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify(items)); }, [items]);
  useEffect(() => {
    if (!mensaje) return;
    const temporizador = setTimeout(() => setMensaje(''), 3600);
    return () => clearTimeout(temporizador);
  }, [mensaje]);

  const avisar = texto => setMensaje(texto);
  function agregar(producto, variante, cantidad = 1) {
    if (!variante || variante.stock < 1) return avisar('La variante seleccionada está agotada.');
    const existente = items.find(item => item.varianteId === variante.id);
    const solicitada = Math.trunc(cantidad);
    if (!Number.isSafeInteger(solicitada) || solicitada < 1) return avisar('Selecciona una cantidad válida.');
    if ((existente?.cantidad || 0) + solicitada > variante.stock) return avisar('No hay suficientes unidades disponibles para esa cantidad.');
    setItems(actuales => {
      const actual = actuales.find(item => item.varianteId === variante.id);
      if (actual) return actuales.map(item => item.varianteId === variante.id ? { ...item, cantidad: actual.cantidad + solicitada, stock: variante.stock } : item);
      return [...actuales, {
        productoId: producto.id, varianteId: variante.id,
        nombre: producto.nombre, categoria: producto.categoria, imagen: producto.imagen,
        precioCentimos: producto.precioCentimos, talla: variante.talla,
        color: variante.color, stock: variante.stock, cantidad: solicitada,
      }];
    });
    avisar('Producto agregado al carrito.');
    return true;
  }
  const cambiarCantidad = (id, cantidad) => setItems(actuales => actuales.map(item => item.varianteId === id ? { ...item, cantidad: Math.max(1, Math.min(item.stock, Math.trunc(cantidad) || 1)) } : item));
  const eliminar = id => setItems(actuales => actuales.filter(item => item.varianteId !== id));
  const vaciar = () => setItems([]);
  const cantidadTotal = items.reduce((suma, item) => suma + item.cantidad, 0);
  const totalCentimos = items.reduce((suma, item) => suma + item.precioCentimos * item.cantidad, 0);
  return <CarritoContext.Provider value={{ items, agregar, cambiarCantidad, eliminar, vaciar, cantidadTotal, totalCentimos, mensaje, avisar }}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return contexto;
}
