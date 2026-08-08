# Migración de cuenta / namespace y replicación para otro cliente

Este sistema tiene **un solo lugar por repositorio** donde se declara el "dueño"
(namespace/usuario de GitHub, dominios, workers) y **cero referencias en el código
a esa cuenta**. Migrar de cuenta o replicar para otro cliente = editar variables,
no tocar código.

---

## 1. Principio

| Repo | Dónde vive la configuración de cuenta | Código toca cuenta |
|---|---|---|
| **geo-graficas-web** | `astro.config.mjs` (site/base) + `GITHUB_REPO` en admin | No |
| **geo-graficas-pay** | `wrangler.toml` → `[vars]` + secrets Cloudflare | No |
| **geo-graficas-admin** | `wrangler.toml` → `[vars]` + secrets Cloudflare | No |

Los enlaces en el panel (botón "Ver sitio", SSO) se inyectan con tokens
`__SITE_URL__` / `__CLIENTES_URL__` / `__WORKER_BASE__` reemplazados en el
workflow de GitHub Pages del admin. El dominio del sitio web lo resuelve Astro
en build-time desde `SITE_URL` (o el default de `astro.config.mjs`).

> Nota: el worker `geo-graficas-pay` **no es fuente de precios ni materias**.
> El admin y la web leen esos archivos del repo `geo-graficas-web` directamente.
> El CI de pay baja `prices.json` de `raw.githubusercontent.com` al desplegar.

---

## 2. Variables por repositorio

### geo-graficas-web (Astro → GitHub Pages)

| Variable | Origen | Uso |
|---|---|---|
| `SITE_URL` | secret/var de Actions (opcional) | Forzar un dominio distinto; si falta, default `https://shcdigital.github.io/geo-graficas-web/` |
| `base` | derivado del pathname en `astro.config.mjs` | `"/geo-graficas-web/"` si el site vive en subruta |

Deploy: `.github/workflows/pages.yml` (build Astro + `actions/deploy-pages`).
Habilitado en GitHub → Settings → Pages → Source: GitHub Actions.

> Precios y materias son **estáticos** en el repo: `src/data/prices.json` y
> `src/data/materias.json` (fuente única). No hay script de fetch en el build.

### geo-graficas-pay (Worker)

| Variable | Dónde | Uso |
|---|---|---|
| `SITE_URL` | `wrangler.toml [vars]` | `back_urls` de Mercado Pago (apunta al sitio en GitHub Pages) |
| `ADMIN_EMAIL` | `wrangler.toml [vars]` | destinatario único de `POST /email` |
| `MP_ACCESS_TOKEN` | secret (`wrangler secret put`) | token de acceso de Mercado Pago |
| `MP_WEBHOOK_SECRET` | secret | firma de webhooks de MP |
| `RESEND_API_KEY` | secret | envío de emails (Resend) |
| `GOOGLE_SERVICE_ACCOUNT` | secret (opcional) | si se integra Google (hojas/correo) |
| `EMAIL_TOKEN` | secret | compartido con admin; firma `POST /email` |

Deploy: `.github/workflows/deploy.yml` (baja precios de GitHub + `wrangler deploy`).

### geo-graficas-admin (Worker + Pages)

| Variable | Dónde | Uso |
|---|---|---|
| `SITE_URL` | `wrangler.toml [vars]` | botón "Ver sitio" |
| `CLIENTES_URL` | `wrangler.toml [vars]` | SSO del panel de clientes |
| `TENANT_ID` | `wrangler.toml [vars]` | id del cliente en el SSO (`geo-graficas`) |
| `PANEL_URL` | `wrangler.toml [vars]` | `aud` esperado del JWT SSO |
| `GITHUB_REPO` | `wrangler.toml [vars]` | repo web (contenido de cuadernillos), ej. `shcdigital/geo-graficas-web` |
| `PRICES_PATH` | `wrangler.toml [vars]` | ruta del archivo de precios en el repo web |
| `MATERIAS_PATH` | `wrangler.toml [vars]` (default en código) | ruta del archivo de materias |
| `GITHUB_TOKEN` | secret | token con scope `repo` del repo web (crea commits de contenido) |
| `EMAIL_TOKEN` | secret | compartido con pay; firma `POST /email` |
| `SHARED_JWT_SECRET` | secret | debe ser **idéntico** al del Worker SSO de clientes |
| `SESSIONS` | KV binding (wrangler.toml) | sesiones de login + rate-limit |

Deploy: `.github/workflows/deploy.yml` (job `deploy-worker` con
`CLOUDFLARE_API_TOKEN` + job `pages` que genera el `index.html` desde `src/admin.txt`).

---

## 3. Migrar el proyecto a otra cuenta/namespace de GitHub

### a) `geo-graficas-web`
1. Mover el repo (GitHub → Settings → Danger Zone → Transfer) o clonar a la
   cuenta nueva.
2. Actualizar `astro.config.mjs`: `site` y `base` al nuevo pathname, o setear
   `SITE_URL` como secret de Actions.
3. Habilitar GitHub Pages en el repo nuevo (Settings → Pages → GitHub Actions).
4. Actualizar el remote: `git remote set-url origin git@github.com:<cuenta>/geo-graficas-web.git`
   (sin tokens en la URL).

### b) `geo-graficas-pay`
1. `wrangler.toml` → `[vars] SITE_URL` = nuevo dominio del sitio (si cambió).
2. Actualizar el remote (sin tokens embebidos).
3. Recrear secrets: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `RESEND_API_KEY`,
   `EMAIL_TOKEN`.
4. Recrear secret de Actions: `CLOUDFLARE_API_TOKEN` (y `CLOUDFLARE_ACCOUNT_ID`
   si se usa vía var de entorno en el workflow).

### c) `geo-graficas-admin`
1. `wrangler.toml` → cambiar `GITHUB_REPO`, `SITE_URL`, `CLIENTES_URL`,
   `TENANT_ID`, `PANEL_URL`, y si cambió el repo, `PRICES_PATH`/`MATERIAS_PATH`.
2. Recrear secrets `GITHUB_TOKEN` (token del repo web) y `SHARED_JWT_SECRET`
   (idéntico al SSO de clientes) y `EMAIL_TOKEN` (idéntico a pay).
3. Actualizar los secrets de Actions (`CLOUDFLARE_API_TOKEN`) y el remote.

### d) Recordar
- Verificar que Pages esté habilitado y el workflow permitido en el repo nuevo.
- Los KV de Cloudflare (pedidos / sesiones) **no** dependen del namespace de
  GitHub (pero sí de la cuenta Cloudflare — ver sección 6).

---

## 4. Replicar para otro cliente (reutilizando el código)

1. Clonar los 3 repos.
2. **Web**: editar datos del negocio en `src/data/site.ts` (nombre, contacto,
   `payUrl`, precios, materias); si el cliente usa dominio propio, setear
   `SITE_URL` en Actions.
3. **Pay**: `wrangler.toml` → `name` del worker, `SITE_URL`, KV `ORDERS_KV`
   (crear uno nuevo), secrets de Cloudflare y de MP en Actions.
4. **Admin**: `wrangler.toml` → `name`, `SITE_URL`, `CLIENTES_URL`, `TENANT_ID`,
   `PANEL_URL`, `ADMIN_EMAIL`, `GITHUB_REPO`, KV `SESSIONS`, secrets
   `GITHUB_TOKEN`, `EMAIL_TOKEN` y `SHARED_JWT_SECRET`.
5. Secrets de Actions: `CLOUDFLARE_API_TOKEN` (deploy-worker) y
   `GH_TOKEN`/`GH_TOKEN_SHCDIGITAL` si el workflow usa la API de GitHub.
6. Verificar con `npm run build` / `node --check` antes de desplegar.

---

## 5. Verificación post-migración

- `geo-graficas-web`: workflow `pages.yml` OK; navegar el sitio y revisar que los
  links canónicos/og usen el dominio nuevo.
- `geo-graficas-pay`: `GET /prices` responde `{categories: {...}}`; hacer un
  checkout de prueba.
- `geo-graficas-admin`: botón "Ver sitio" y "← Panel de clientes" apuntan bien;
  guardar un precio y confirmar el commit en el repo **web**
  (`src/data/prices.json`), que a su vez dispara el deploy del site.

---

## 6. Cambios en Cloudflare (los 3 workers y KV)

Los workers viven en la cuenta Cloudflare. Al migrar de cuenta o replicar, todo lo
de Cloudflare se re-crea manualmente (no viaja con el repo).

### Cuenta y subdominio workers.dev

| Item | Valor actual | Nota |
|---|---|---|
| `account_id` | `d1509c610d7908f0f340251a340ddf4c` | en `wrangler.toml` del **admin**; el **pay** lo toma de la var de Actions `CLOUDFLARE_ACCOUNT_ID` |
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
wrangler secret put EMAIL_TOKEN          # idéntico al admin

# geo-graficas-admin
wrangler secret put GITHUB_TOKEN         # scope repo del repo web
wrangler secret put EMAIL_TOKEN          # idéntico a pay
wrangler secret put SHARED_JWT_SECRET    # idéntico al Worker SSO de clientes
```

### Secrets de GitHub Actions (Settings → Secrets and variables → Actions)

| Repo | Secret | Valor |
|---|---|---|
| web | `GH_TOKEN_SHCDIGITAL` | token GitHub con permisos de Pages (opcional) |
| pay | `CLOUDFLARE_API_TOKEN` | token de cuenta con permiso de editar Workers |
| pay | `CLOUDFLARE_ACCOUNT_ID` | id de la cuenta |
| admin | `CLOUDFLARE_API_TOKEN` | token de cuenta (deploy-worker) |

> El token de Cloudflare actual fue creado por el usuario con scope de Workers;
> caduca 2028-07-07. Al migrar de cuenta, generarlo en la cuenta destino.
