# Arquitectura técnica de LINO (React + Express + JSON)

## Vista general

```text
Navegador (http://localhost:5173)
   │
   ├── React + React Router: pantallas y navbar
   ├── CarritoContext + localStorage: estado temporal del carrito
   │
   └── fetch('/api/...')
             │ proxy de Vite
             ▼
Express (http://127.0.0.1:3001)
   │
   ├── routes/       URLs de productos y pedidos
   ├── controllers/  solicitudes y respuestas HTTP
   ├── services/     precios, existencias, reglas de negocio
   └── repositories/jsonStore.js
             │ cola de escritura, validación, respaldo, temporal
             ▼
       data/tienda.json
       data/backups/*.json
```

## Árbol de carpetas

```text
LINO_React_VSCode/
│
├── frontend/
│   ├── index.html
│   ├── public/
│   │   ├── favicon.svg
│   │   └── imagenes/                  # Ilustraciones locales
│   └── src/
│       ├── main.jsx                  # Monta React
│       ├── App.jsx                   # Rutas y layout general
│       ├── components/
│       │   ├── Navbar.jsx            # MENÚ / NAVBAR
│       │   ├── Footer.jsx
│       │   ├── ProductCard.jsx
│       │   └── ScrollTop.jsx
│       ├── pages/
│       │   ├── Inicio.jsx             # PÁGINA DE INICIO
│       │   ├── Catalogo.jsx
│       │   ├── DetalleProducto.jsx
│       │   ├── Carrito.jsx
│       │   ├── Nosotros.jsx
│       │   ├── Contacto.jsx
│       │   └── NoEncontrado.jsx
│       ├── context/CarritoContext.jsx
│       ├── services/api.js
│       ├── services/formato.js
│       └── styles/global.css
│
├── backend/src/
│   ├── server.js                     # Levanta el servidor
│   ├── app.js                        # Configura Express
│   ├── routes/{productos,pedidos}.js
│   ├── controllers/{productoController,pedidoController}.js
│   ├── services/{productoService,pedidoService}.js
│   ├── repositories/jsonStore.js     # Persistencia JSON
│   └── middleware/{HttpError,errorHandler}.js
│
├── data/
│   ├── tienda.example.json          # SE SUBE A GITHUB
│   ├── tienda.json                  # SE CREA EN CADA EQUIPO (gitignore)
│   └── backups/                     # RESPALDOS LOCALES (gitignore)
│
├── scripts/{init-data,validate-data}.js
├── tests/api.test.js
├── docs/
├── .vscode/
├── .gitignore
├── package.json
└── vite.config.js
```

## Navegación React Router

- `/` -> Inicio
- `/catalogo` -> Colección completa
- `/catalogo?categoria=mujer` -> Mujer
- `/catalogo?categoria=hombre` -> Hombre
- `/catalogo?categoria=accesorios` -> Accesorios
- `/catalogo?buscar=polo` -> Búsqueda
- `/producto/prod-001` -> Detalle, talla, color y botón de carrito
- `/carrito` -> Cantidades, importe, pedido ficticio
- `/nosotros`, `/contacto` -> Información

## Proceso de compra ficticia

1. React recupera productos mediante GET `/api/productos`.
2. El cliente selecciona talla y color en `DetalleProducto.jsx`.
3. `CarritoContext` conserva temporalmente la selección en `localStorage`.
4. Al confirmar, React envía **solo IDs de variantes, cantidades y clave de reintento**.
5. Express verifica el JSON, producto activo, stock y precio vigente; genera el identificador del pedido.
6. `jsonStore.js` ejecuta el cambio en la cola de escritura y guarda respaldo + nuevo JSON.
7. El servidor devuelve un resumen ficticio con código PED; la interfaz muestra confirmación.

## Reglas aplicadas

- `precioCentimos` es un entero; `5990` = `S/ 59,90`.
- Stock por variante (`id`, `talla`, `color`, `stock`).
- No se confía en totales enviados desde frontend.
- Se rechazan cantidades no enteras, variantes repetidas y falta de stock.
- Misma clave de solicitud + mismas líneas = misma respuesta sin descontar de nuevo.
- Solo una instancia escribe el archivo JSON. No se garantiza coordinación entre procesos separados.

## Mejoras futuras

El documento de segundo avance también propone administración autorizada y recuperación formal. **No están terminadas en este starter**. Es preferible dejar pendientes esas funcionalidades a simular controles de seguridad inexistentes.
