# Tareas sugeridas para Jira — LINO

**Importante:** estos IDs son de ejemplo, no representan incidencias creadas en un tablero real. Sustituir por las claves reales.

| Tarea sugerida | Módulo/carpeta | Estado del ZIP |
|---|---|---|
| LINO-1 Configurar proyecto React, API y repositorio | `package.json`, `frontend`, `backend` | Base de código incluida |
| LINO-2 Navbar responsive y página Inicio | `components/Navbar.jsx`, `pages/Inicio.jsx` | Base funcional incluida |
| LINO-3 Catálogo, filtros y detalle de talla/color | `pages/Catalogo.jsx`, `DetalleProducto.jsx` | Base funcional incluida |
| LINO-4 Carrito con cantidades y persistencia local | `context/CarritoContext.jsx`, `pages/Carrito.jsx` | Base funcional incluida |
| LINO-5 Registrar pedido ficticio | `services/pedidoService.js` | Base funcional incluida |
| LINO-6 Controlar totales en céntimos | `services/formato.js` y servicio de pedidos | Base funcional incluida |
| LINO-7 PR y conflictos de Git | Repositorio del equipo | Pendiente de ejecución real |
| LINO-8 JSON local y respaldos | `repositories/jsonStore.js` | Base funcional incluida |
| LINO-12 Sesiones de administrador | Pendiente | No implementado |
| LINO-13 Panel de administración | Pendiente | No implementado |
| LINO-14 Ampliar matriz de pruebas | `tests` | Pruebas iniciales incluidas |
| LINO-15 Manual de despliegue y evidencias | `README.md`, `docs` | Documentación inicial incluida |

## Ejemplo de historia de usuario

**Como** cliente de LINO **quiero** navegar desde la página de inicio a Mujer, Hombre y Accesorios **para** encontrar prendas con menos pasos.

**Criterios:**
- En escritorio se visualiza la navbar horizontal.
- En móvil existe un menú desplegable accesible mediante botón.
- Los enlaces cambian de página sin recargar completamente el navegador.
- El ícono del carrito muestra cuántas unidades se han añadido.
- El usuario puede buscar por texto.

## Propuesta de ramas

- `main` para entregas estables.
- `develop` para integración.
- `feature/LINO-2-inicio-navbar` para menú e inicio.
- `feature/LINO-3-catalogo` para lista y detalle.
- `feature/LINO-4-carrito` para carrito.
- `feature/LINO-8-json` para persistencia.

Registrar los commits, PR, revisiones y conflictos reales en GitHub y Jira después de realizar el trabajo.
