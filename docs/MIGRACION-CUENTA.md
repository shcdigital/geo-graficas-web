# Migración de cuenta / namespace y replicación para otro cliente

Este sistema tiene **un solo lugar por repositorio** donde se declara el "dueño"
(namespace/usuario de GitLab, dominios, workers) y **cero referencias en el código
a esa cuenta**. Migrar de cuenta o replicar para otro cliente = editar variables,
no tocar código.

---

## 1. Principio

| Repo | Dónde vive la configuración de cuenta | Código toca cuenta |
|---|---|---|
| **geo-graficas-web** | `astro.config.mjs` lee `SITE_URL` → `CI_PAGES_URL` (auto de GitLab) → default | No |
| **geo-graficas-pay** | `wrangler.toml` → `[vars] SITE_URL` | No |
| **geo-graficas-admin** | `wrangler.toml` → `SITE_URL`, `CLIENTES_URL`, `GITLAB_PROJECT_ID`, `GITLAB_PAY_PROJECT` | No |

Los enlaces en el panel (botón "Ver sitio", SSO) se inyectan con tokens
`__SITE_URL__` / `__CLIENTES_URL__` reemplazados por el Worker y por el pipeline
de Pages. El dominio del sitio web lo resuelve Astro en build-time.

---

## 2. Variables por repositorio

### geo-graficas-web (Astro → GitLab Pages)

| Variable | Origen | Uso |
|---|---|---|
| `CI_PAGES_URL` | GitLab (automática en el job `pages`) | `site` y `base` del build. *No hay que tocarla.* |
| `SITE_URL` | override manual (CI var) | Forzar un dominio distinto al de Pages |
| `PRICES_URL` | `scripts/fetch-prices.js` (default = worker pay) | De dónde se bajan los precios en el build |

El `base` se deriva del pathname: `"/"` para dominio único, `"/<proyecto>/"` si el
namespace es un **grupo** (site en subruta). No requiere configuración manual.

### geo-graficas-pay (Worker)

| Variable | Dónde | Uso |
|---|---|---|
| `SITE_URL` | `wrangler.toml [vars]` | `back_urls` de Mercado Pago (debe apuntar al sitio web) |

### geo-graficas-admin (Worker + Pages)

| Variable | Dónde | Uso |
|---|---|---|
| `SITE_URL` | `wrangler.toml [vars]` | botón "Ver sitio" |
| `CLIENTES_URL` | `wrangler.toml [vars]` | SSO del panel de clientes |
| `GITLAB_PROJECT_ID` | `wrangler.toml [vars]` | repo web (contenido de cuadernillos) |
| `GITLAB_PAY_PROJECT` | `wrangler.toml [vars]` | repo pay (precios) |
| `GITLAB_PAY_BRANCH` | `wrangler.toml [vars]` | rama del repo pay (master) |
| `GITLAB_TOKEN` | secret | token de proyecto del repo web |
| `GITLAB_PAY_TOKEN` | secret | token de proyecto del repo pay |

CI de Pages del admin (Settings → CI/CD → Variables):
`GITLAB_PAGES_WORKER_BASE`, `GITLAB_PAGES_SITE_URL`, `GITLAB_PAGES_CLIENTES_URL`.

---

## 3. Migrar el proyecto a otra cuenta/namespace de GitLab

### a) `geo-graficas-web`
1. Mover el proyecto a la cuenta nueva (GitLab → Settings → General → Transfer).
2. Si el dominio Pages cambia, GitLab lo actualiza solo: el build toma
   `CI_PAGES_URL` automáticamente (dominio único → raíz, grupo → subruta). Nada
   que editar.
3. Actualizar el remote: `git remote set-url origin git@gitlab.com:<nueva-cuenta>/geo-graficas-web.git`
   (sin tokens en la URL).

### b) `geo-graficas-pay`
1. `wrangler.toml` → `[vars] SITE_URL` = nuevo dominio del sitio (si cambió).
2. Actualizar el remote (sin tokens embebidos).
3. Recrear secrets en la CI: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

### c) `geo-graficas-admin`
1. `wrangler.toml` → cambiar `GITLAB_PROJECT_ID`, `GITLAB_PAY_PROJECT`
   (formato `<cuenta>/<proyecto>`), `SITE_URL`, `CLIENTES_URL`.
2. Recrear secrets `GITLAB_TOKEN`, `GITLAB_PAY_TOKEN` (tokens de proyecto).
3. Actualizar las 3 variables de CI de Pages y el remote.

### d) Recordar
- Verificar que Pages esté habilitado en el proyecto nuevo.
- Los KV de Cloudflare (pedidos / sesiones) **no** dependen del namespace de GitLab.
- Caché de CI: los pipelines vuelven a consumir minutos del namespace nuevo.

---

## 4. Replicar para otro cliente (reutilizando el código)

1. Clonar los 3 repos.
2. **Web**: editar datos del negocio en `src/data/site.ts`; si el cliente usa
   dominio propio, setear `SITE_URL` en CI. Si el worker de precios es otro,
   setear `PRICES_URL`.
3. **Pay**: `wrangler.toml` → `name` del worker, `SITE_URL`, KV `ORDERS_KV`
   (crear uno nuevo), routes/dominio; secrets de Cloudflare en CI.
4. **Admin**: `wrangler.toml` → `name`, `SITE_URL`, `CLIENTES_URL`, `TENANT_ID`,
   `ADMIN_EMAILS`, `GITLAB_PROJECT_ID`, `GITLAB_PAY_PROJECT`, KV `SESSIONS`,
   routes/dominio; secrets `GITLAB_TOKEN`, `GITLAB_PAY_TOKEN`.
5. CI de Pages del admin → las 3 variables `GITLAB_PAGES_*`.
6. Verificar con `npm run build` / `node --check` antes de desplegar.

---

## 5. Verificación post-migración

- `geo-graficas-web`: build de Pages OK; navegar el sitio y revisar que los links
  canónicos/og usen el dominio nuevo.
- `geo-graficas-pay`: `GET /prices` responde; hacer un checkout de prueba.
- `geo-graficas-admin`: botón "Ver sitio" y "← Panel de clientes" apuntan bien;
  guardar un precio y confirmar el commit en el repo pay.
