# LINO — Tienda de ropa online

Proyecto académico **React + Vite (frontend)** y **Node.js + Express (backend)**. En desarrollo local conserva almacenamiento JSON; para el despliegue gratuito usa **Neon PostgreSQL** para que catálogo, stock, pedidos y usuarios sobrevivan a los reinicios de Render.

## Funcionalidades

- Catálogo de 24 productos con imágenes SVG locales, variantes, precios en soles y stock.
- Carrito de compras, selección de talla/color y generación de pedidos.
- Métodos demostrativos: Yape, Plin, tarjeta y efectivo. No se procesa dinero ni se capturan datos reales de tarjetas.
- Registro e inicio de sesión con contraseña almacenada mediante hash scrypt y cookie HttpOnly firmada.
- Validación de cantidades, stock, concurrencia e idempotencia de pedidos.
- Pruebas automatizadas, GitHub Actions CI y configuración de despliegue Vercel + Render.

## Requisitos

- Node.js 20.12 o superior y npm.
- Visual Studio Code (recomendado).
- Git para clonar el repositorio.

## Ejecutar localmente con JSON

```bash
npm ci
npm run init:data
npm run dev
```

- Frontend: http://localhost:5173
- API: http://127.0.0.1:3001/api/health

En local, si `DATABASE_URL` no está definida, LINO usa `data/tienda.json` y `data/bd.json`. Los archivos privados no se incluyen en Git ni en este ZIP.

Comprobaciones:

```bash
npm run check:data
npm test
npm run build
```

## Persistencia PostgreSQL con Neon

Cuando `DATABASE_URL` está definida, los repositorios usan PostgreSQL en lugar de archivos JSON. El esquema usa dos documentos JSONB singleton, actualizados dentro de transacciones con bloqueo de fila:

- `lino_tienda_state`: catálogo, variantes, stock, pedidos y revisión.
- `lino_usuarios_state`: usuarios y hashes de contraseña.

Este adaptador conserva las reglas y servicios existentes y evita perder datos cuando Render reinicia su sistema de archivos efímero.

1. Copia `.env.example` a `.env`.
2. Pega la cadena de conexión de Neon en `DATABASE_URL` (no la compartas ni la subas a GitHub).
3. Si quieres importar tus datos locales, copia `data/tienda.json` y `data/bd.json` desde tu instalación anterior a la carpeta `data/` de este proyecto antes de inicializar. Esos archivos están excluidos del ZIP por privacidad.
4. Ejecuta:

   ```bash
   npm run db:init
   ```

El inicializador crea el esquema e importa los archivos locales si existen. Si no hay archivos locales, utiliza `data/tienda.example.json` y crea una lista de usuarios vacía. **No sobrescribe filas que ya existan en Neon.**

Para volver al modo local, elimina `DATABASE_URL` del entorno; no borres la base Neon.

## Despliegue gratuito Vercel + Render + Neon

Consulta la guía completa en [`docs/DESPLIEGUE_GRATUITO.md`](docs/DESPLIEGUE_GRATUITO.md).

- `render.yaml`: crea el backend Express gratuito en Render, inicializa PostgreSQL y comprueba `/api/health`.
- `vercel.json`: compila `frontend/dist`, enruta `/api/*` al backend de Render y conserva las rutas de React Router.
- La URL de Render definida en `vercel.json` es `https://lino-ecomerce-api.onrender.com`. Si Render asigna otra URL, actualiza el destino antes de desplegar Vercel.
- Mantén `VITE_API_URL` sin definir en Vercel: el frontend utiliza `/api` y el rewrite mantiene las cookies en el mismo origen.
- Render necesita `DATABASE_URL` y `LINO_SESSION_SECRET` como variables privadas. El Blueprint genera una clave de sesión automáticamente.

### Limitaciones de los planes gratuitos

Render Free suspende servicios inactivos y su sistema de archivos es efímero; la primera solicitud tras una suspensión puede tardar alrededor de un minuto. Neon Free tiene cuotas de almacenamiento y cómputo. Vercel Hobby está limitado a uso personal/no comercial. Son adecuados para una demostración académica dentro de sus condiciones y límites, no para una tienda comercial con disponibilidad garantizada.

## GitHub Actions CI

El workflow `.github/workflows/ci.yml` ejecuta:

1. `npm ci`
2. `npm run init:data`
3. `npm run check:data`
4. `npm test`
5. `npm run build`
6. Guarda `frontend/dist/` como artefacto durante siete días.

Se activa con push a `main`, Pull Requests hacia `main` y ejecución manual. Las pruebas fuerzan el adaptador JSON temporal para que nunca escriban en una base Neon real.

## CD — despliegue continuo

Conecta el mismo repositorio GitHub a Render y Vercel y selecciona `main` como rama de producción. Ambos proveedores pueden desplegar automáticamente al recibir nuevos commits en `main`. GitHub Actions CI valida el código; la integración Git de los proveedores realiza el despliegue.

## Estructura principal

```text
frontend/                 React, páginas, componentes y servicios
backend/src/
  db/postgres.js           Pool y esquema Neon PostgreSQL
  repositories/            Adaptadores JSON local / PostgreSQL
  routes/                   API de productos, pedidos y usuarios
  services/                 Reglas de negocio y autenticación
scripts/
  init-data.js              Inicialización JSON local
  init-postgres.js          Inicialización e importación a Neon
data/
  tienda.example.json       Catálogo de ejemplo versionado
  tienda.json               Datos locales (gitignore)
  bd.json                   Usuarios locales (gitignore)
docs/
  DESPLIEGUE_GRATUITO.md    Guía Vercel + Render + Neon
.github/workflows/ci.yml   Integración continua
render.yaml                Blueprint del backend Render
vercel.json                Build y proxy same-origin para Vercel
```

## Seguridad y límites

- Nunca subas `.env`, `data/tienda.json` ni `data/bd.json` al repositorio.
- No pegues `DATABASE_URL`, contraseñas ni secretos en chats o capturas.
- Las opciones Yape, Plin, tarjeta y efectivo son demostrativas; `estadoPago` queda como `no_procesado`.
- El PDF es un comprobante demostrativo, no un comprobante tributario.
- La autenticación usa cookie HttpOnly y clave `LINO_SESSION_SECRET`, que debe mantenerse estable entre despliegues.
