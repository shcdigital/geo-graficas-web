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
| **geo-graficas-pay** | `wrangler.toml` → `[vars]` + secrets Cloudflare | No |
| **geo-graficas-admin** | `wrangler.toml` → `[vars]` + secrets Cloudflare | No |

Los enlaces en el panel (botón "Ver sitio", SSO) se inyectan con tokens
`__SITE_URL__` / `__CLIENTES_URL__` reemplazados por el Worker y por el pipeline
de Pages. El dominio del sitio web lo resuelve Astro en build-time.

> Nota: el worker `geo-graficas-pay` **no es fuente de precios ni materias**.
> El admin y la web leen esos archivos del repo `geo-graficas-web` directamente.

---

## 2. Variables por repositorio

### geo-graficas-web (Astro → GitLab Pages)

| Variable | Origen | Uso |
|---|---|---|
| `CI_PAGES_URL` | GitLab (automática en el job `pages`) | `site` y `base` del build. *No hay que tocarla.* |
| `SITE_URL` | override manual (CI var) | Forzar un dominio distinto al de Pages |

El `base` se deriva del pathname: `"/"` para dominio único, `"/<proyecto>/"` si el
namespace es un **grupo** (site en subruta). No requiere configuración manual.

> Precios y materias son **estáticos** en el repo: `src/data/prices.json` y
> `src/data/materias.json` (fuente única). No hay script de fetch en el build.

### geo-graficas-pay (Worker)

| Variable | Dónde | Uso |
|---|---|---|
| `SITE_URL` | `wrangler.toml [vars]` | `back_urls` de Mercado Pago (debe apuntar al sitio web) |
| `ADMIN_EMAIL` | `wrangler.toml [vars]` | destinatario único de `POST /email` |
| `MP_ACCESS_TOKEN` | secret (`wrangler secret put`) | token de acceso de Mercado Pago |
| `MP_WEBHOOK_SECRET` | secret | firma de webhooks de MP |
| `RESEND_API_KEY` | secret | envío de emails (Resend) |
| `GOOGLE_SERVICE_ACCOUNT` | secret (opcional) | si se integra Google (hojas/correo) |

### geo-graficas-admin (Worker + Pages)

| Variable | Dónde | Uso |
|---|---|---|
| `SITE_URL` | `wrangler.toml [vars]` | botón "Ver sitio" |
| `CLIENTES_URL` | `wrangler.toml [vars]` | SSO del panel de clientes |
| `TENANT_ID` | `wrangler.toml [vars]` | id del cliente en el SSO (`geo-graficas`) |
| `GITLAB_PROJECT_ID` | `wrangler.toml [vars]` | repo web (contenido de cuadernillos) |
| `PRICES_PATH` | `wrangler.toml [vars]` | ruta del archivo de precios en el repo web |
| `MATERIAS_PATH` | `wrangler.toml [vars]` (default en código) | ruta del archivo de materias |
| `GITLAB_TOKEN` | secret | token de proyecto con scope `api` del repo web |
| `SHARED_JWT_SECRET` | secret | debe ser **idéntico** al del Worker SSO de clientes |
| `SESSIONS` | KV binding (wrangler.toml) | sesiones de login + rate-limit |

CI de Pages del admin (Settings → CI/CD → Variables):
`GITLAB_PAGES_WORKER_BASE`, `GITLAB_PAGES_SITE_URL`, `GITLAB_PAGES_CLIENTES_URL`.
CI del deploy-worker (Settings → CI/CD → Variables): `CLOUDFLARE_API_TOKEN`.

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
3. Recrear secrets: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `RESEND_API_KEY`.
4. Recrear var de CI: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

### c) `geo-graficas-admin`
1. `wrangler.toml` → cambiar `GITLAB_PROJECT_ID`, `SITE_URL`, `CLIENTES_URL`,
   `TENANT_ID`, y si cambió el repo, `PRICES_PATH`/`MATERIAS_PATH`.
2. Recrear secrets `GITLAB_TOKEN` (token de proyecto del repo web) y
   `SHARED_JWT_SECRET` (idéntico al SSO de clientes).
3. Actualizar las 3 variables de CI de Pages, `CLOUDFLARE_API_TOKEN` y el remote.

### d) Recordar
- Verificar que Pages esté habilitado en el proyecto nuevo.
- Los KV de Cloudflare (pedidos / sesiones) **no** dependen del namespace de GitLab
  (pero sí de la cuenta Cloudflare — ver sección 6).
- Caché de CI: los pipelines vuelven a consumir minutos del namespace nuevo.

---

## 4. Replicar para otro cliente (reutilizando el código)

1. Clonar los 3 repos.
2. **Web**: editar datos del negocio en `src/data/site.ts` (nombre, contacto,
   `payUrl`, precios, materias); si el cliente usa dominio propio, setear
   `SITE_URL` en CI.
3. **Pay**: `wrangler.toml` → `name` del worker, `SITE_URL`, KV `ORDERS_KV`
   (crear uno nuevo), secrets de Cloudflare y de MP en CI.
4. **Admin**: `wrangler.toml` → `name`, `SITE_URL`, `CLIENTES_URL`, `TENANT_ID`,
   `ADMIN_EMAILS`, `GITLAB_PROJECT_ID`, KV `SESSIONS`, secrets `GITLAB_TOKEN` y
   `SHARED_JWT_SECRET`.
5. CI de Pages del admin → las 3 variables `GITLAB_PAGES_*`; deploy-worker →
   `CLOUDFLARE_API_TOKEN`.
6. Verificar con `npm run build` / `node --check` antes de desplegar.

---

## 5. Verificación post-migración

- `geo-graficas-web`: build de Pages OK; navegar el sitio y revisar que los links
  canónicos/og usen el dominio nuevo.
- `geo-graficas-pay`: `GET /prices` responde `{categories: {...}}`; hacer un
  checkout de prueba.
- `geo-graficas-admin`: botón "Ver sitio" y "← Panel de clientes" apuntan bien;
  guardar un precio y confirmar el commit en el repo **web** (`src/data/prices.json`).

---

## 6. Cambios en Cloudflare (los 3 workers y KV)

Los workers viven en la cuenta Cloudflare. Al migrar de cuenta o replicar, todo lo
de Cloudflare se re-crea manualmente (no viaja con el repo).

### Cuenta y subdominio workers.dev

| Item | Valor actual | Nota |
|---|---|---|
| `account_id` | `d1509c610d7908f0f340251a340ddf4c` | en `wrangler.toml` del **admin**; el **pay** lo toma de la var de CI `CLOUDFLARE_ACCOUNT_ID` |
| Custom domain admin | `panel.geograficas.shcdigital.net.ar` | declarado como `[[routes]] custom_domain = true` en wrangler.toml |
| Dominio pay | `geo-graficas-pay.<cuenta>.workers.dev` | workers.dev tiene **un subdominio por cuenta**; cambia al migrar de cuenta |

Al migrar de cuenta Cloudflare:
1. El subdominio `*.workers.dev` cambia → el pay pasa a
   `geo-graficas-pay.<nueva-cuenta>.workers.dev`. Actualizar:
   - web: `src/data/site.ts` → `SITE.payUrl`
   - admin: `wrangler.toml` → `PAY_URL`
2. El custom domain `panel.geograficas...` debe re-agregarse en la cuenta nueva
   (la zona DNS de `shcdigital.net.ar` tiene que estar en esa cuenta).

### KV namespaces (recrear, no migran)

| Worker | Binding | id (prod) | preview_id |
|---|---|---|---|
| pay | `ORDERS_KV` | `d771d38d951944099ec12e2edf38781c` | `32081d30326148be9684cff67762e0fc` |
| admin | `SESSIONS` | `6ce05e2073b94d0b8e011610d30c92d2` | — |

Si la cuenta nueva no tiene los namespaces (KV no se transfiere entre cuentas):
```bash
wrangler kv namespace create ORDERS_KV    # en geo-graficas-pay
wrangler kv namespace create SESSIONS     # en geo-graficas-admin
```
Copiar los nuevos `id`/`preview_id` al `wrangler.toml` de cada worker.
> Replicando para otro cliente: **siempre** crear KV nuevos (no compartir
> pedidos/sesiones entre clientes).

### Secrets por worker (recrear con `wrangler secret put`)

```bash
# geo-graficas-pay
wrangler secret put MP_ACCESS_TOKEN
wrangler secret put MP_WEBHOOK_SECRET
wrangler secret put RESEND_API_KEY

# geo-graficas-admin
wrangler secret put GITLAB_TOKEN
wrangler secret put SHARED_JWT_SECRET   # idéntico al Worker SSO de clientes
```

### Variables de CI en GitLab (Settings → CI/CD → Variables)

| Repo | Variable | Valor |
|---|---|---|
| pay | `CLOUDFLARE_API_TOKEN` | token de cuenta con permiso de editar Workers |
| pay | `CLOUDFLARE_ACCOUNT_ID` | id de la cuenta nueva |
| pay | `PRICES_RAW_URL` (opcional) | raw de `src/data/prices.json` en el repo web nuevo |
| admin | `CLOUDFLARE_API_TOKEN` | token de cuenta (deploy-worker) |

> El token de Cloudflare actual fue creado por el usuario con scope de Workers;
> caduca 2027-09-10. Al migrar de cuenta, generarlo en la cuenta destino.
