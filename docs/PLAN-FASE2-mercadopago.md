# PLAN — Fase 2: Carrito + Mercado Pago + entrega digital

> Plan aprobado. Guardado para retomarlo en una sesión futura.
> Repo local: `~/GITLAB/geo-graficas-web` (frontend, GitLab Pages)
> ⚠️ Documento histórico: describe el estado original (GitLab). El sistema
> migró a GitHub (shcdigital): Pages, CI y contenido viven en
> `github.com/shcdigital/geo-graficas-*`.

---

## Estado del proyecto hasta este punto (contexto)

- Sitio Astro catálogo estilo feed de Instagram publicado en GitLab Pages:
  `https://geo-graficas-web-d6a153.gitlab.io` (dominio único por proyecto, `base="/"`).
- Repo remoto: `https://gitlab.com/pabloberthold/geo-graficas-web` (público, id 85162233).
- Perfil: @geo.graficas (Geo.Gráficas, Fernanda y Cintia, recursos didácticos, 28K).
- MVP actual: catálogo + pedido por WhatsApp/IG (opción 1).
- `src/data/site.ts` todavía sin WhatsApp real (`whatsapp: ""`) — pendiente Fase 1.

## Objetivo de esta fase

Implementar **venta digital**: carrito multi-material + pago con Mercado Pago
+ entrega automática/opcional del PDF.

## Decisiones cerradas (del usuario)

| Aspecto | Decisión |
|---|---|
| Backend / secreto | **Cloudflare Worker** como capa de pago (cripto, evita exponer access_token) |
| Storage de PDFs | **Google Drive** (Service Account), entregados proxied por el Worker |
| Entrega | Descarga por enlace firmado **y** opción "solicitar envío" por email |
| Carrito | **Multi-material** |
| Mercado Pago | **Modo test** en arranque (tarjeta de prueba) |
| Email | **Resend** (gratis 100/día) |
| Repo del Worker | **`geo-graficas-pay`** (nuevo, en `gitlab.com/pabloberthold`) |
| Sitio | Se mantiene 100% en GitLab Pages |

## Arquitectura objetivo

```
[GitLab Pages = catálogo + UI]  ──fetch──▶  [Cloudflare Worker = "pasarela"]
     Carrito multi-material                      │ guarda MP_ACCESS_TOKEN + SECRET
     POST /checkout → create-preference           │  POST /checkout  → preferencia MP multi-item
     redirect a init_point                        │  POST /webhook   → valida x-signature → marca pagado
                                                 │  GET /download/{id} → stream PDF desde Drive (SA)
                                                  │  POST /email     → envía PDF por Resend
                                                  ▼
                                      Google Drive (PDFs, sin sharing público)
```

Puntos clave:
- El Worker es el ÚNICO que ve credenciales y PDFs privados.
- El cliente **nunca** recibe URL de Google Drive; el Worker descarga con `files.get?alt=media` (SA) y hace streaming tras un token firmado de corta vida.

## Tareas de implementación (orden de ejecución)

### Paso 0 — Credenciales (las aporta el usuario, no el código)
- [ ] Service Account en Google Cloud → exportar JSON (secret `GOOGLE_SERVICE_ACCOUNT`).
- [ ] Credenciales MP en modo test + registrar webhook.
- [ ] API key de Resend.
- [ ] Carpeta Drive `geo-graficas` + mapear cada `slug` → `fileId`.

### Paso 1 — Worker: repo `geo-graficas-pay` (nuevo, `pabloberthold/geo-graficas-pay`)
- Cloudflare Worker con Wrangler. Secrets: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `GOOGLE_SERVICE_ACCOUNT`, `RESEND_API_KEY`.
- Rutas:
  - `POST /checkout` → items → YAML → `init_point`.
  - `POST /webhook` → validar `x-signature` → marcar pagado en KV.
  - `GET /download/{orderId}` → verificar pago → streamear el PDF desde Drive, token de corta vida.
  - `POST /email` → enviar PDF por Resend (opción "solicitar envío").
- `README` del Worker con pasos de deploy (`wrangler secret`, `wrangler deploy`).
- DB/estado: Workers KV para ordenes.

### Paso 2 — Frontend (GitLab Pages, Astro)
- [ ] `src/data/comercio.ts`: `workerUrl`, precios, `slug → fileId`.
- [ ] Carrito en cliente: botón "Agregar" en `CardRecurso.astro` y `recursos/[slug].astro`; drawer lateral con items/cantidades/total.
- [ ] CTA "Pagar con Mercado Pago" → `fetch(checkout)` → redirect a `init_point`.
- [ ] Página `/checkout/success` → descarga firmada + formulario "enviar por email" → `/email`.

### Paso 3 — Datos reales
- [ ] Subir PDFs reales a Drive, completar `precio`/`fileId`.
- [ ] Cargar los 137 recursos reales del feed como content collection (iteración dedicada).

### Paso 4 — Documentación
- [ ] **ADR** de esta decisión de arquitectura.
- [ ] Actualizar `docs/roadmap.md` (mover Fase 2 a "en curso", marcar hitos).

## Verificación final de la fase

1. En el Worker con MP test: crear preferencia → tarjeta de prueba → webhook marca pagado.
2. `GET /download` sirve el PDF de Drive y el enlace vence.
3. `POST /email` entrega el PDF por Resend.
4. En `geo-graficas-web`: carrito agrega/resta/calcula total → checkout redirige a MP → vuelta a `/checkout/success` con descarga y opción de email.