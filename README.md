# StockHub Web

Frontend del reto tecnico Lite Thinking. SPA construida con Quasar v2 + Vue 3 + TypeScript que consume la API de StockHub.

- URL produccion: http://3.93.170.171:8080
- Repo backend: https://github.com/MrDavidAlv/stockhub-api

## Stack

| Capa | Tecnologia |
|---|---|
| Framework | Vue 3 + Quasar v2 (Composition API + script setup) |
| Lenguaje | TypeScript |
| Bundler | Vite |
| Estado | Pinia |
| HTTP | Axios |
| Router | Vue Router con guards por rol |
| Estilos | SCSS + Quasar |
| Lint | ESLint + Prettier + vue-tsc + vite-plugin-checker |
| Empaquetado | Docker multi-stage (Node 22 build, nginx alpine serve) |

## Estructura

```
src/
  boot/pinia.ts
  layouts/MainLayout.vue
  pages/         LoginPage, EmpresaPage, ProductoPage, InventarioPage
  components/    EmpresaForm, ProductoForm, PrecioMonedaList
  stores/        auth.store.ts
  services/      api.service, empresa, categoria, producto, inventario
  router/        rutas + guards (requiresAuth, requiresAdmin, guestOnly)
  types/         interfaces TS compartidas con el backend
  utils/         error helpers
```

## Correr en local

Requiere Node 22+ (Quasar v2.6 lo exige).

```bash
cp .env.example .env       # ajustar VITE_API_URL si hace falta
npm install
npx quasar dev             # SPA en http://localhost:9000
```

Necesitas la API corriendo (por defecto en http://localhost:8080). Ver el repo `stockhub-api` para arrancarla con `docker compose up -d` y `./mvnw spring-boot:run`.

## Variables de entorno

| Variable | Default | Descripcion |
|---|---|---|
| VITE_API_URL | /api | URL base del backend |

En desarrollo apuntar a `http://localhost:8080/api`. En produccion `/api` (relativo, lo resuelve el reverse-proxy del stack).

## Build

```bash
npm run build              # salida en dist/spa/
```

El build incluye lint y type-check via vite-plugin-checker.

## Autenticacion y roles

- Login en `/login` con email + password.
- JWT access token (60 min) y refresh token (7 dias) en localStorage con prefijo `stockhub.*`.
- `api.service.ts` aplica `Authorization: Bearer` automaticamente y reintenta una sola vez con refresh automatico al recibir 401.
- Router guards: `requiresAuth`, `requiresAdmin`, `guestOnly`.
- Usuario `EXTERNO` solo ve la lista de empresas. `ADMIN` accede a productos e inventario.

## Vistas

- Login: formulario con validaciones y feedback de errores del backend.
- Empresas: tabla con CRUD para ADMIN, vista de solo lectura para EXTERNO. Confirmacion de borrado.
- Productos: filtro por empresa, formulario con select multiple de categorias y sub-componente para precios multi-moneda.
- Inventario: filtro por empresa, descarga de PDF y envio por email.

## Empaquetado y despliegue

Imagen Docker multi-stage en `ghcr.io/mrdavidalv/stockhub-web`. La pipeline `.github/workflows/ci.yml` hace build con lint, publica `:latest` y `:${sha}` en ghcr.io y refresca el contenedor `web` en el EC2.

El contenedor expone nginx en el puerto 80 interno con:
- Fallback SPA via `try_files`
- Cache de 1 ano (`public, immutable`) para assets versionados de Vite, `no-store` para `index.html`
- Headers OWASP en todas las respuestas (CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy restrictivo)

En produccion el contenedor no se expone directo. El reverse-proxy del stack StockHub publica el puerto 8080 y rutea `/` al web y `/api/` al backend, asi todo el SPA queda en el mismo origen y el bundle puede usar la URL relativa `/api`.

## Credenciales

Los usuarios admin y externo se crean al primer arranque del backend con BCrypt cost 12.

- **App desplegada:** las credenciales de evaluacion se entregan por correo, no se publican en este README.
- **Dev local:** las define el `.env` del backend (`SEED_ADMIN_PASSWORD`, `SEED_EXTERNO_PASSWORD`). Los emails son `admin@stockhub.local` y `externo@stockhub.local`.

## Autor

Mario David Alvarez Vallejo - https://github.com/MrDavidAlv
