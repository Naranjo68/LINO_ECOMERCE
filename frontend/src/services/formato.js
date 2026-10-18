export const soles = centimos => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(centimos / 100);
export const nombreCategoria = categoria => ({ mujer: 'Mujer', hombre: 'Hombre', accesorios: 'Accesorios' }[categoria] || 'Colección');
