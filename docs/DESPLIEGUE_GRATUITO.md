# Despliegue gratuito de LINO: Neon + Render + Vercel

Esta guía publica el frontend React en Vercel, la API Express en Render y la persistencia PostgreSQL en Neon. Los planes gratuitos tienen límites y pueden cambiar; verifica las condiciones de cada proveedor antes de usarlo.

## 0. Antes de empezar

- Repositorio: `Naranjo68/LINO_ECOMERCE`.
- Rama de producción: `main`.
- Node.js 20.12+.
- No necesitas Docker.
- No subas `.env`, `data/tienda.json`, `data/bd.json` ni la cadena `DATABASE_URL` a GitHub.

## 1. Crear PostgreSQL en Neon

1. Entra a https://neon.com/ y crea una cuenta.
2. Crea un proyecto PostgreSQL para LINO.
3. Selecciona una región razonablemente cercana a la región que usarás en Render.
4. Abre **Connect** y copia la cadena de conexión. Si Neon ofrece la opción pooled, usa la cadena recomendada para aplicaciones.
5. Guarda la cadena en un lugar privado. Tiene usuario y contraseña de base de datos; no la pegues en el repositorio ni en capturas.

## 2. Preparar la migración de datos locales

El ZIP no contiene los archivos `data/tienda.json` ni `data/bd.json` porque son datos locales y privados.

Si quieres conservar el catálogo, stock, pedidos y usuarios que ya tienes en tu computadora:

1. Extrae este ZIP en una carpeta de trabajo.
2. Copia desde tu proyecto local anterior `data/tienda.json` a la carpeta `data/` del proyecto nuevo, si existe.
3. Copia `data/bd.json` a la misma carpeta `data/`, si existe. Este archivo contiene hashes de contraseña y debe mantenerse privado.
4. Si no tienes esos archivos, el sistema utilizará el catálogo de ejemplo de 24 productos y empezará con usuarios vacíos.

## 3. Inicializar Neon desde tu computadora

1. Copia `.env.example` y crea un archivo llamado `.env` en la raíz.
2. Pega la conexión de Neon en `DATABASE_URL`:

   ```env
   DATABASE_URL=postgresql://USUARIO:CLAVE@HOST/BASE?sslmode=require
   ```

   No uses literalmente el ejemplo: pega la cadena que Neon te entregó.

3. Genera una clave privada para las sesiones en CMD:

   ```cmd
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Copia el resultado a `LINO_SESSION_SECRET` en `.env`.
5. Instala dependencias e inicializa la base:

   ```cmd
   npm ci
   npm run db:init
   ```

6. El resultado debe indicar que el esquema PostgreSQL fue verificado y que se importó el catálogo/usuarios iniciales o que los datos existentes se conservaron.
7. Ejecuta las comprobaciones locales:

   ```cmd
   npm run check:data
   npm test
   npm run build
   ```

`npm run db:init` es idempotente respecto a los registros iniciales: crea las tablas y solo inserta los documentos si todavía no existen. No sustituye un catálogo o lista de usuarios ya inicializados.

## 4. Subir los cambios a GitHub

Crea una rama de funcionalidad y sube el contenido del ZIP al repositorio de trabajo, conservando los archivos privados fuera de Git:

```cmd
git switch -c feature/despliegue-gratuito
 git status --short
 git add .
git commit -m "feat: preparar despliegue gratuito con Neon Render y Vercel"
git push -u origin feature/despliegue-gratuito
```

Crea un Pull Request hacia `main`. Espera a que LINO CI finalice correctamente y luego integra el cambio.

## 5. Crear el backend en Render

1. Entra a https://render.com/ y conecta tu cuenta GitHub.
2. Selecciona **New → Blueprint** y el repositorio `Naranjo68/LINO_ECOMERCE`.
3. Render leerá `render.yaml`. El servicio propuesto se llama `lino-ecomerce-api`.
4. Si Render pide `DATABASE_URL`, pega la cadena privada de Neon.
5. Comprueba que `LINO_SESSION_SECRET` se genere automáticamente por `generateValue: true`. Si creas el servicio manualmente, crea una variable secreta con una cadena aleatoria de al menos 32 bytes.
6. El servicio debe utilizar:
   - Build Command: `npm ci`
   - Start Command: `npm run db:init && npm run start:api`
   - Health Check Path: `/api/health`
   - Plan: Free
7. Espera a que el primer despliegue finalice.
8. Abre `https://TU-SERVICIO.onrender.com/api/health`. Debe responder JSON con `ok: true` y `almacenamiento: "postgresql"`.

Si la URL asignada no es `https://lino-ecomerce-api.onrender.com`, copia la URL real del servicio para el siguiente paso.

## 6. Configurar Vercel para React y el proxy de API

1. Entra a https://vercel.com/ e importa el repositorio `Naranjo68/LINO_ECOMERCE`.
2. Usa la carpeta raíz del repositorio como **Root Directory** (`.`), no `frontend`.
3. La configuración del archivo `vercel.json` establece:
   - Install Command: `npm ci`
   - Build Command: `npm run build`
   - Output Directory: `frontend/dist`
4. Abre `vercel.json` y revisa el destino de la primera regla rewrite:

   ```json
   "destination": "https://lino-ecomerce-api.onrender.com/api/:path*"
   ```

5. Si Render asignó otra URL, reemplaza solamente el host por el dominio real de Render. Conserva `/api/:path*` al final.
6. Sube ese cambio a GitHub y espera el nuevo despliegue de Vercel.
7. No configures `VITE_API_URL` en Vercel: la aplicación debe llamar a `/api` y Vercel reescribe esa ruta hacia Render.

El proxy mantiene las peticiones del navegador bajo el mismo dominio de Vercel. Así la cookie de sesión HttpOnly se establece en el mismo origen que utiliza React y se evita depender de cookies cross-site entre `vercel.app` y `onrender.com`.

## 7. Comprobar la tienda publicada

En el dominio público de Vercel comprueba:

1. Página de inicio.
2. Catálogo y búsqueda.
3. Detalle de producto y variantes.
4. Registro de usuario.
5. Inicio y cierre de sesión.
6. Carrito.
7. Creación de pedido de prueba.
8. Rechazo de stock insuficiente.
9. Reinicia/re-despliega el backend y comprueba que el pedido y el usuario sigan existiendo en Neon.

También puedes abrir `https://TU-DOMINIO.vercel.app/api/health`. Debe responder `ok: true` y `almacenamiento: "postgresql"`. Esta comprobación pasa por el rewrite de Vercel.

## 8. Despliegue continuo (CD)

Conecta Render y Vercel al mismo repositorio y usa `main` como rama de producción. Render y Vercel pueden desplegar automáticamente al recibir commits nuevos en `main`. GitHub Actions ejecuta CI para probar el código; los proveedores realizan el despliegue desde su integración Git.

El despliegue automático de los proveedores y el workflow CI son procesos distintos: no asumas que el despliegue queda bloqueado por un check fallido, a menos que configures explícitamente esa condición en los ajustes de cada proveedor.

## 9. Límites del modo gratuito

- Render Free suspende servicios web después de 15 minutos sin tráfico y el primer acceso posterior puede tardar cerca de un minuto. Su sistema de archivos es efímero; por eso la persistencia de LINO se guarda en Neon, no en archivos del servidor.
- Neon Free tiene límites mensuales de cómputo y almacenamiento. Comprueba el uso desde su consola.
- Vercel Hobby es gratuito para proyectos personales/no comerciales. Revisa sus términos antes de usarlo con una actividad comercial.
- Los planes y límites pueden cambiar. El modo gratuito es adecuado para demostración académica, no ofrece SLA ni disponibilidad garantizada.

## 10. Seguridad y recuperación

- Nunca guardes `DATABASE_URL` o `LINO_SESSION_SECRET` en GitHub.
- No subas los archivos `data/tienda.json` ni `data/bd.json`.
- No publiques capturas que muestren la cadena de conexión o contraseñas.
- Si una cadena de conexión se expone, rota la contraseña desde Neon y actualiza `DATABASE_URL` en Render.
- Los métodos de pago de LINO son simulados: no se cobra dinero ni se procesan tarjetas.
